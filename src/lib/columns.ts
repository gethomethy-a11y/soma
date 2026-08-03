import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./supabase";

/**
 * Works out what the database's columns are actually called.
 *
 * The app was written against expected column names, but a schema that was
 * migrated separately can spell things differently (`cycle_days_since` vs
 * `days_since_period`, `sleep_quality` vs `sleep`, and so on). Rather than
 * guessing and failing silently, the app asks Supabase for its own schema once
 * at startup and matches each field against a list of plausible names.
 *
 * If a field has no matching column, it is simply left out of writes — the rest
 * of the profile still saves — and `missingFields()` reports it so the problem
 * is visible instead of silent.
 */

/** For each field the app stores, the column names it will accept, best first. */
const PROFILE_CANDIDATES = {
  userId: ["user_id", "id"],
  name: ["name", "first_name", "display_name", "username"],
  sex: ["sex", "sex_at_birth", "gender", "birth_sex"],
  age: ["age"],
  cycleLength: ["cycle_length", "cycle_len", "cycle_length_days", "avg_cycle_length"],
  daysSince: [
    "cycle_days_since",
    "days_since",
    "days_since_period",
    "last_period_days_ago",
    "cycle_day_offset",
    "cycle_start_days_ago",
  ],
  regular: ["cycle_regular", "cycle_regularity", "regularity", "regular", "is_regular"],
  activity: ["activity", "activity_level"],
  goals: ["goals", "focus", "focus_areas"],
  sleep: ["sleep_quality", "sleep"],
  stress: ["stress", "stress_level"],
  diet: ["diet", "diet_type"],
  premium: ["premium", "is_premium", "has_premium"],
  streak: ["streak", "streak_days", "day_streak"],
} as const;

const SCAN_CANDIDATES = {
  userId: ["user_id"],
  hormone: ["hormone", "hormone_key", "key"],
  score: ["score", "level", "value"],
  answers: ["answers", "responses", "payload"],
  createdAt: ["created_at", "inserted_at"],
} as const;

const DAILY_CANDIDATES = {
  userId: ["user_id"],
  day: ["day", "date", "score_date"],
  score: ["score", "value", "hormone_score"],
} as const;

export type ProfileColumns = Record<keyof typeof PROFILE_CANDIDATES, string | null>;
export type ScanColumns = Record<keyof typeof SCAN_CANDIDATES, string | null>;
export type DailyColumns = Record<keyof typeof DAILY_CANDIDATES, string | null>;

export type ResolvedSchema = {
  profiles: ProfileColumns;
  scans: ScanColumns;
  daily: DailyColumns;
  /** False when the schema couldn't be read and defaults are in use. */
  verified: boolean;
};

/** What the app assumes when it can't read the schema: the first candidate. */
function defaults<T extends Record<string, readonly string[]>>(candidates: T): Record<keyof T, string | null> {
  const out = {} as Record<keyof T, string | null>;
  for (const key of Object.keys(candidates) as (keyof T)[]) out[key] = candidates[key][0];
  return out;
}

const FALLBACK: ResolvedSchema = {
  profiles: defaults(PROFILE_CANDIDATES),
  scans: defaults(SCAN_CANDIDATES),
  daily: defaults(DAILY_CANDIDATES),
  verified: false,
};

/** Match each field to the first candidate the table actually has. */
function match<T extends Record<string, readonly string[]>>(
  candidates: T,
  available: Set<string>
): Record<keyof T, string | null> {
  const out = {} as Record<keyof T, string | null>;
  for (const key of Object.keys(candidates) as (keyof T)[]) {
    out[key] = candidates[key].find((name) => available.has(name)) ?? null;
  }
  return out;
}

/**
 * PostgREST publishes an OpenAPI description of every table it exposes. Reading
 * it costs one request and tells us exactly which columns exist.
 */
async function readSchema(): Promise<Record<string, Set<string>>> {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
  });
  if (!res.ok) throw new Error(`Schema request failed: ${res.status}`);

  const spec = (await res.json()) as {
    definitions?: Record<string, { properties?: Record<string, unknown> }>;
    components?: { schemas?: Record<string, { properties?: Record<string, unknown> }> };
  };

  // OpenAPI 2 uses `definitions`; OpenAPI 3 uses `components.schemas`.
  const tables = spec.definitions ?? spec.components?.schemas ?? {};
  const out: Record<string, Set<string>> = {};
  for (const [table, def] of Object.entries(tables)) {
    out[table] = new Set(Object.keys(def?.properties ?? {}));
  }
  return out;
}

let cached: Promise<ResolvedSchema> | null = null;

/** Resolve once per session; every caller shares the same result. */
export function schema(): Promise<ResolvedSchema> {
  if (!isSupabaseConfigured) return Promise.resolve(FALLBACK);
  if (cached) return cached;

  cached = (async () => {
    try {
      const tables = await readSchema();
      const profiles = tables["soma_profiles"];
      const scans = tables["soma_scans"];
      const daily = tables["soma_daily_scores"];

      if (!profiles) {
        console.warn(
          "[soma] Supabase has no table called `soma_profiles`. Data will stay in this browser. " +
            "Check the table name in the Supabase Table Editor."
        );
        return FALLBACK;
      }

      const resolved: ResolvedSchema = {
        profiles: match(PROFILE_CANDIDATES, profiles),
        scans: scans ? match(SCAN_CANDIDATES, scans) : FALLBACK.scans,
        daily: daily ? match(DAILY_CANDIDATES, daily) : FALLBACK.daily,
        verified: true,
      };

      const missing = missingFields(resolved);
      if (missing.length > 0) {
        console.warn(
          `[soma] These profile fields have no matching column and won't be saved to Supabase: ${missing.join(", ")}. ` +
            "Everything else saves normally. To fix, add the column in Supabase or add its real name to " +
            "PROFILE_CANDIDATES in src/lib/columns.ts."
        );
      }
      return resolved;
    } catch (err) {
      console.warn("[soma] Couldn't read the Supabase schema — using expected column names.", err);
      return FALLBACK;
    }
  })();

  return cached;
}

/** Profile fields with no matching column. Empty means everything lines up. */
export function missingFields(resolved: ResolvedSchema): string[] {
  return (Object.keys(resolved.profiles) as (keyof ProfileColumns)[]).filter((k) => resolved.profiles[k] === null);
}

/** Build a row object, skipping any field the table doesn't have. */
export function buildRow<T extends Record<string, string | null>>(
  columns: T,
  values: Partial<Record<keyof T, unknown>>
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [field, column] of Object.entries(columns) as [keyof T, string | null][]) {
    if (column && values[field] !== undefined) row[column] = values[field];
  }
  return row;
}
