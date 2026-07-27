import type { HistoryPoint, HormoneKey, Profile, Scan } from "../types";
import { ensureSession, supabase } from "./supabase";

/**
 * Persistence.
 *
 * Supabase is the source of truth when it's configured and reachable. Browser
 * storage is always written too, so the app opens instantly on reload and keeps
 * working offline or before keys are set.
 *
 * If your Supabase column names differ from these, change them here — this is
 * the only place in the app that knows about them.
 */
const PROFILE_COLUMNS = {
  userId: "user_id",
  name: "name",
  sex: "sex",
  age: "age",
  cycleLength: "cycle_length",
  daysSince: "cycle_days_since",
  regular: "cycle_regular",
  activity: "activity",
  goals: "goals",
  sleep: "sleep_quality",
  stress: "stress",
  diet: "diet",
  premium: "premium",
  streak: "streak",
} as const;

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

/** Wipe local state. Used by "start over" in Profile. */
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

  try {
    const [profileRes, scansRes, dailyRes] = await Promise.all([
      supabase.from("soma_profiles").select("*").eq(PROFILE_COLUMNS.userId, userId).maybeSingle(),
      supabase
        .from("soma_scans")
        .select("hormone, score, answers, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("soma_daily_scores").select("day, score").eq("user_id", userId).order("day", { ascending: true }),
    ]);

    const row = profileRes.data as Record<string, unknown> | null;
    if (row) {
      state.profile = rowToProfile(row);
      state.premium = Boolean(row[PROFILE_COLUMNS.premium]);
      const remoteStreak = Number(row[PROFILE_COLUMNS.streak] ?? 0);
      if (remoteStreak > state.streak.n) state.streak = { last: today(), n: remoteStreak };
    }

    // Most recent scan per hormone wins.
    if (scansRes.data) {
      const latest: Partial<Record<HormoneKey, number>> = {};
      for (const scan of scansRes.data as { hormone: HormoneKey; score: number }[]) {
        if (latest[scan.hormone] === undefined) latest[scan.hormone] = scan.score;
      }
      if (Object.keys(latest).length > 0) state.scans = latest;
    }

    if (dailyRes.data && dailyRes.data.length > 0) {
      state.history = (dailyRes.data as { day: string; score: number }[])
        .map((d) => ({ d: d.day.slice(5, 10), v: d.score }))
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

  const row: Record<string, unknown> = {
    [PROFILE_COLUMNS.userId]: userId,
    [PROFILE_COLUMNS.name]: profile.name,
    [PROFILE_COLUMNS.sex]: profile.sex,
    [PROFILE_COLUMNS.age]: profile.age,
    [PROFILE_COLUMNS.cycleLength]: profile.cycleLength,
    [PROFILE_COLUMNS.daysSince]: profile.daysSince,
    [PROFILE_COLUMNS.regular]: profile.regular,
    [PROFILE_COLUMNS.activity]: profile.activity,
    [PROFILE_COLUMNS.goals]: profile.goals,
    [PROFILE_COLUMNS.sleep]: profile.sleep,
    [PROFILE_COLUMNS.stress]: profile.stress,
    [PROFILE_COLUMNS.diet]: profile.diet,
    [PROFILE_COLUMNS.streak]: streak.n,
  };

  try {
    const { error } = await supabase.from("soma_profiles").upsert(row, { onConflict: PROFILE_COLUMNS.userId });
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

  try {
    await supabase.from("soma_scans").insert({
      user_id: userId,
      hormone: scan.hormone,
      score: scan.score,
      answers: scan.answers,
    });

    if (overallScore != null) {
      await supabase
        .from("soma_daily_scores")
        .upsert({ user_id: userId, day: today(), score: overallScore }, { onConflict: "user_id,day" });
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

/** Cache the premium flag locally. The webhook is what actually sets it in Supabase. */
export async function cachePremium(premium: boolean) {
  writeLocal({ premium });
}

/** Re-read just the premium flag — called after returning from Stripe Checkout. */
export async function refreshPremium(): Promise<boolean> {
  const userId = await ensureSession();
  if (!supabase || !userId) return readLocal().premium ?? false;

  try {
    const { data } = await supabase
      .from("soma_profiles")
      .select(PROFILE_COLUMNS.premium)
      .eq(PROFILE_COLUMNS.userId, userId)
      .maybeSingle();
    const premium = Boolean((data as Record<string, unknown> | null)?.[PROFILE_COLUMNS.premium]);
    writeLocal({ premium });
    return premium;
  } catch {
    return readLocal().premium ?? false;
  }
}

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    name: String(row[PROFILE_COLUMNS.name] ?? ""),
    age: Number(row[PROFILE_COLUMNS.age] ?? 29),
    sex: (row[PROFILE_COLUMNS.sex] as Profile["sex"]) ?? "",
    daysSince: Number(row[PROFILE_COLUMNS.daysSince] ?? 8),
    cycleLength: Number(row[PROFILE_COLUMNS.cycleLength] ?? 28),
    regular: (row[PROFILE_COLUMNS.regular] as Profile["regular"]) ?? "",
    activity: String(row[PROFILE_COLUMNS.activity] ?? ""),
    goals: Array.isArray(row[PROFILE_COLUMNS.goals]) ? (row[PROFILE_COLUMNS.goals] as string[]) : [],
    sleep: String(row[PROFILE_COLUMNS.sleep] ?? ""),
    stress: Number(row[PROFILE_COLUMNS.stress] ?? 5),
    diet: String(row[PROFILE_COLUMNS.diet] ?? ""),
  };
}
