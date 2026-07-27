import { HORMONES } from "../data/hormones";
import { PHASE_ESTROGEN, cycleInfo, hasCycle } from "../data/cycle";
import type { HormoneKey, HormoneReading, Profile } from "../types";

/**
 * Score direction: higher always means healthier balance. The status word
 * carries the direction, so a low cortisol score reads "Elevated" while a low
 * testosterone score reads "Low".
 */
const OFF_WORD: Record<HormoneKey, string> = {
  cortisol: "elevated",
  estrogen: "fluctuating",
  testosterone: "low",
  insulin: "spiky",
  dopamine: "low",
  melatonin: "suppressed",
};

const BALANCED_WORD: Partial<Record<HormoneKey, string>> = { melatonin: "On track" };

export function statusWord(key: HormoneKey, level: number): string {
  if (level >= 76) return BALANCED_WORD[key] ?? "Balanced";
  const word = (level >= 62 ? "Slightly " : "") + OFF_WORD[key];
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** The plain-language phrase used on a result screen. */
export function resultHeadline(key: HormoneKey, level: number): string {
  const name = HORMONES[key].name.toLowerCase();
  return level >= 76 ? `Your ${name} looks balanced` : `Your ${name} shows signs of being ${OFF_WORD[key]}`;
}

/** Display order puts the hormone the user most likely came for first. */
function order(profile: Profile | null): HormoneKey[] {
  return hasCycle(profile)
    ? ["estrogen", "cortisol", "insulin", "dopamine", "melatonin", "testosterone"]
    : ["testosterone", "cortisol", "insulin", "dopamine", "melatonin", "estrogen"];
}

/**
 * Join the hormone content with the user's saved scans.
 *
 * Estrogen is special-cased for cycling users: before any scan exists we can
 * still say something true from cycle position alone.
 */
export function hormoneList(profile: Profile | null, scans: Partial<Record<HormoneKey, number>>): HormoneReading[] {
  const cycling = hasCycle(profile);
  const phaseEstrogen = PHASE_ESTROGEN[cycleInfo(profile).key];

  return order(profile).map((key) => {
    const hormone = HORMONES[key];
    const scanned = scans[key];

    if (typeof scanned === "number") {
      return { ...hormone, status: statusWord(key, scanned), level: scanned, checked: true };
    }
    if (key === "estrogen" && cycling) {
      return { ...hormone, status: phaseEstrogen[0], level: phaseEstrogen[1], checked: true, fromPhase: true };
    }
    return { ...hormone, status: "Not checked", level: null, checked: false };
  });
}

/**
 * The one shareable number: the average of completed scans.
 *
 * Returns null before the first scan — Home shows its empty state rather than
 * inventing a score.
 */
export function hormoneScore(scans: Partial<Record<HormoneKey, number>>): number | null {
  const levels = Object.values(scans).filter((v): v is number => typeof v === "number");
  if (levels.length === 0) return null;
  return Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
}
