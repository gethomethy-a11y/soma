import type { HistoryPoint, HormoneKey, Profile, Scan } from "../types";
import { buildRow, schema, type ProfileColumns } from "./columns";
import { ensureSession, supabase } from "./supabase";

/**
 * Persistence.
 *
 * Supabase is the source of truth when it's configured and reachable. Browser
 * storage is always written too, so the app opens instantly on reload and keeps
 * working offline or before keys are set.
 *
 * Column names are resolved at runtime by src/lib/columns.ts — the app reads
 * the database's own schema rather than assuming how things are spelled.
 */

const LOCAL_KEY = "soma:state";

export type StreakState = { last: string; n: number };

export type AppState = {
  profile: Profile | null;
  scans: Partial<Record<HormoneKey, number>>;
  history: HistoryPoint[];
  premium: boolean;
  streak: StreakState;
};

export const EMPTY_STATE: AppState = {
  profile: null,
  scans: {},
  history: [],
  premium: false,
  streak: { last: today(), n: 1 },
};

/* ------------------------------- local ------------------------------- */

function readLocal(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Partial<AppState>) : {};
  } catch {
    return {};
  }
}

function writeLocal(state: Partial<AppState>) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...readLocal(), ...state }));
  } catch {
    /* storage disabled — the session still works, it just won't survive reload */
  }
}

/** Wipe local state. */
export function clearLocal() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------- dates ------------------------------- */

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  return new Date(Date.now() - 864e5).toISOString().slice(0, 10);
}

/** Advance the streak once per calendar day; reset it after a missed day. */
export function advanceStreak(previous: StreakState | undefined): StreakState {
  const t = today();
  if (!previous) return { last: t, n: 1 };
  if (previous.last === t) return previous;
  return { last: t, n: previous.last === yesterday() ? previous.n + 1 : 1 };
}

/* ------------------------------- load ------------------------------- */

/** Read everything the app needs at boot. */
export async function loadState(): Promise<AppState> {
  const local = readLocal();
  const state: AppState = {
    profile: local.profile ?? null,
    scans: local.scans ?? {},
    history: local.history ?? [],
    premium: local.premium ?? false,
    streak: advanceStreak(local.streak),
  };

  const userId = await ensureSession();
  if (!supabase || !userId) {
    writeLocal({ streak: state.streak });
    return state;
  }

  const { profiles, scans: scanCols, daily } = await schema();
  const idColumn = profiles.userId ?? "user_id";

  try {
    const [profileRes, scansRes, dailyRes] = await Promise.all([
      supabase.from("soma_profiles").select("*").eq(idColumn, userId).maybeSingle(),
      supabase.from("soma_scans").select("*").eq("user_id", userId).order(scanCols.createdAt ?? "created_at", {
        ascending: false,
      }),
      supabase.from("soma_daily_scores").select("*").eq("user_id", userId).order(daily.day ?? "day", {
        ascending: true,
      }),
    ]);

    const row = profileRes.data as Record<string, unknown> | null;
    if (row) {
      state.profile = rowToProfile(row, profiles);
      if (profiles.premium) state.premium = Boolean(row[profiles.premium]);
      const remoteStreak = profiles.streak ? Number(row[profiles.streak] ?? 0) : 0;
      if (remoteStreak > state.streak.n) state.streak = { last: today(), n: remoteStreak };
    }

    // Most recent scan per hormone wins.
    if (scansRes.data && scanCols.hormone && scanCols.score) {
      const latest: Partial<Record<HormoneKey, number>> = {};
      for (const scan of scansRes.data as Record<string, unknown>[]) {
        const key = scan[scanCols.hormone] as HormoneKey;
        if (key && latest[key] === undefined) latest[key] = Number(scan[scanCols.score]);
      }
      if (Object.keys(latest).length > 0) state.scans = latest;
    }

    if (dailyRes.data && dailyRes.data.length > 0 && daily.day && daily.score) {
      state.history = (dailyRes.data as Record<string, unknown>[])
        .map((d) => ({ d: String(d[daily.day!]).slice(5, 10), v: Number(d[daily.score!]) }))
        .slice(-14);
    }

    writeLocal(state);
  } catch (err) {
    console.warn("[soma] Could not load remote state — using local copy.", err);
  }

  return state;
}

/* ------------------------------- save ------------------------------- */

export async function saveProfile(profile: Profile, premium: boolean, streak: StreakState) {
  writeLocal({ profile, premium, streak });

  const userId = await ensureSession();
  if (!supabase || !userId) return;

  const { profiles } = await schema();

  // Premium is deliberately not written from the client — only the Stripe
  // webhook may set it, so a user can't grant it to themselves.
  const row = buildRow(profiles, {
    userId,
    name: profile.name,
    sex: profile.sex,
    age: profile.age,
    cycleLength: profile.cycleLength,
    daysSince: profile.daysSince,
    regular: profile.regular,
    activity: profile.activity,
    goals: profile.goals,
    sleep: profile.sleep,
    stress: profile.stress,
    diet: profile.diet,
    streak: streak.n,
  });

  try {
    const { error } = await supabase
      .from("soma_profiles")
      .upsert(row, { onConflict: profiles.userId ?? "user_id" });
    if (error) console.warn("[soma] Profile save failed.", error.message);
  } catch (err) {
    console.warn("[soma] Profile save failed.", err);
  }
}

/** Record one completed scan, and roll today's overall score into history. */
export async function saveScan(scan: Scan, overallScore: number | null) {
  const local = readLocal();
  const scans = { ...(local.scans ?? {}), [scan.hormone]: scan.score };
  const history = overallScore == null ? (local.history ?? []) : mergeToday(local.history ?? [], overallScore);
  writeLocal({ scans, history });

  const userId = await ensureSession();
  if (!supabase || !userId) return;

  const { scans: scanCols, daily } = await schema();

  try {
    await supabase.from("soma_scans").insert(
      buildRow(scanCols, {
        userId,
        hormone: scan.hormone,
        score: scan.score,
        answers: scan.answers,
      })
    );

    if (overallScore != null && daily.day && daily.score) {
      await supabase
        .from("soma_daily_scores")
        .upsert(buildRow(daily, { userId, day: today(), score: overallScore }), {
          onConflict: `${daily.userId ?? "user_id"},${daily.day}`,
        });
    }
  } catch (err) {
    console.warn("[soma] Scan save failed — kept locally.", err);
  }
}

/** Keep one point per day, last 14 days. */
function mergeToday(history: HistoryPoint[], score: number): HistoryPoint[] {
  const label = today().slice(5, 10);
  return [...history.filter((p) => p.d !== label), { d: label, v: score }].slice(-14);
}

/** Cache the premium flag locally. The webhook is what sets it in Supabase. */
export async function cachePremium(premium: boolean) {
  writeLocal({ premium });
}

/** Re-read just the premium flag — called after returning from Stripe Checkout. */
export async function refreshPremium(): Promise<boolean> {
  const userId = await ensureSession();
  if (!supabase || !userId) return readLocal().premium ?? false;

  const { profiles } = await schema();
  if (!profiles.premium) return readLocal().premium ?? false;

  try {
    const { data } = await supabase
      .from("soma_profiles")
      .select(profiles.premium)
      .eq(profiles.userId ?? "user_id", userId)
      .maybeSingle();
    const premium = Boolean((data as Record<string, unknown> | null)?.[profiles.premium]);
    writeLocal({ premium });
    return premium;
  } catch {
    return readLocal().premium ?? false;
  }
}

function rowToProfile(row: Record<string, unknown>, columns: ProfileColumns): Profile {
  /** Read a column if it exists and has a value, otherwise fall back. */
  const cell = (column: string | null): unknown => (column ? row[column] : undefined);
  const text = (column: string | null) => {
    const value = cell(column);
    return value == null ? "" : String(value);
  };
  const num = (column: string | null, fallback: number) => {
    const value = Number(cell(column));
    return Number.isFinite(value) ? value : fallback;
  };

  const goals = cell(columns.goals);

  return {
    name: text(columns.name),
    age: num(columns.age, 29),
    sex: text(columns.sex) as Profile["sex"],
    daysSince: num(columns.daysSince, 8),
    cycleLength: num(columns.cycleLength, 28),
    regular: text(columns.regular) as Profile["regular"],
    activity: text(columns.activity),
    goals: Array.isArray(goals) ? (goals as string[]) : [],
    sleep: text(columns.sleep),
    stress: num(columns.stress, 5),
    diet: text(columns.diet),
  };
}
