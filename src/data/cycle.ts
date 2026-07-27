import type { CyclePhase, CyclePhaseKey, Profile } from "../types";

/**
 * A simple, transparent cycle model: ovulation is assumed 14 days before the
 * next period, which is the standard estimate. It is deliberately not presented
 * as contraception or a fertility prediction anywhere in the app.
 */
export function phaseForDay(day: number, len: number): CyclePhaseKey {
  const ovulation = len - 14;
  if (day <= 5) return "menstrual";
  if (day < ovulation - 1) return "follicular";
  if (day <= ovulation + 1) return "ovulation";
  return "luteal";
}

export const PHASES: Record<CyclePhaseKey, CyclePhase> = {
  menstrual: {
    key: "menstrual",
    name: "Menstrual",
    tab: "Rest & reset",
    c: "#C58B8B",
    cd: "#D6A0A0",
    soft: "#F6EAEA",
    softD: "#2A1E1E",
    hormone: "Estrogen and progesterone are at their lowest.",
    story: "A new cycle begins. Low energy here is by design, not a failure. Rest is the work.",
    feel: { energy: ["Low", 42], sleep: ["Variable", 60], stress: ["Sensitive", 52], mood: ["Inward", 55] },
  },
  follicular: {
    key: "follicular",
    name: "Follicular",
    tab: "Build & start",
    c: "#5F9E82",
    cd: "#8FC5AC",
    soft: "#E7F1EB",
    softD: "#1B2A24",
    hormone: "Estrogen is rising steadily.",
    story: "Your uphill week. Energy, focus, mood and skin all climb. A great time to start things.",
    feel: { energy: ["Rising", 80], sleep: ["Good", 85], stress: ["Steady", 78], mood: ["Upbeat", 82] },
  },
  ovulation: {
    key: "ovulation",
    name: "Ovulation",
    tab: "Peak",
    c: "#D69A46",
    cd: "#E7B569",
    soft: "#FBF0DE",
    softD: "#2A2214",
    hormone: "Estrogen peaks, with a lift from testosterone.",
    story: "Your high point. Energy, confidence and skin peak for a few days. Use it, then let it taper.",
    feel: { energy: ["Peak", 92], sleep: ["Good", 84], stress: ["Low", 84], mood: ["Confident", 88] },
  },
  luteal: {
    key: "luteal",
    name: "Luteal",
    tab: "Wind down",
    c: "#9E86C4",
    cd: "#B7A0DB",
    soft: "#F0EBF7",
    softD: "#241E2E",
    hormone: "Progesterone rises, then both hormones fall before your period.",
    story:
      "The downhill week. Energy tapers; in the last days sleep, skin and mood can wobble. That's PMS — hormonal, not you.",
    feel: { energy: ["Tapering", 56], sleep: ["Lighter", 60], stress: ["Higher", 50], mood: ["Variable", 58] },
  },
};

export type CycleInfo = {
  len: number;
  day: number;
  key: CyclePhaseKey;
  phase: CyclePhase;
  daysToNext: number;
};

/** Where the user sits in their cycle right now. */
export function cycleInfo(profile: Profile | null): CycleInfo {
  const len = profile?.cycleLength || 28;
  const sinceStart = profile?.daysSince ?? 8;
  const day = (((sinceStart % len) + len) % len) + 1;
  const key = phaseForDay(day, len);
  return { len, day, key, phase: PHASES[key], daysToNext: len - day + 1 };
}

/** Does this profile get the cycle views? */
export const hasCycle = (profile: Profile | null) => profile?.sex === "Female";

/** Estrogen's shape across the month, used for the "energy across your cycle" chart. */
export function cycleEnergyCurve(len: number): { d: number; v: number }[] {
  const ovulation = len - 14;
  return Array.from({ length: len }, (_, i) => {
    const d = i + 1;
    let v: number;
    if (d <= 5) v = 38 + d * 2;
    else if (d <= ovulation) v = 50 + (d - 5) * (42 / (ovulation - 5));
    else if (d <= ovulation + 2) v = 92;
    else v = 92 - (d - ovulation - 2) * (44 / (len - ovulation - 2));
    return { d, v: Math.round(Math.max(30, Math.min(95, v))) };
  });
}

/** Estrogen reading implied by the current phase, when no scan exists yet. */
export const PHASE_ESTROGEN: Record<CyclePhaseKey, [string, number]> = {
  menstrual: ["Low", 32],
  follicular: ["Rising", 72],
  ovulation: ["Peak", 92],
  luteal: ["Falling", 48],
};

/** Cortisol and melatonin across 24 hours — the non-cycle rhythm chart. */
export const DAILY_RHYTHM = [
  { h: "6a", cortisol: 30, melatonin: 90 },
  { h: "9a", cortisol: 85, melatonin: 20 },
  { h: "12p", cortisol: 60, melatonin: 8 },
  { h: "3p", cortisol: 45, melatonin: 6 },
  { h: "6p", cortisol: 30, melatonin: 15 },
  { h: "9p", cortisol: 18, melatonin: 55 },
  { h: "12a", cortisol: 12, melatonin: 92 },
];
