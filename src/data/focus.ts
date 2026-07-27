import { Droplet, Dumbbell, Leaf, MoonStar, Sunrise, Utensils, Wind, Zap } from "lucide-react";
import type { CyclePhaseKey, FocusAction, Profile } from "../types";
import { cycleInfo, hasCycle } from "./cycle";

type Action = Omit<FocusAction, "done">;

/** Phase-aware daily actions for cycling users. */
const BY_PHASE: Record<CyclePhaseKey, Action[]> = {
  menstrual: [
    { Icon: Wind, t: "Gentle movement only", n: "Skip max effort this week" },
    { Icon: Utensils, t: "Iron-rich food", n: "Replenish what you lose" },
    { Icon: MoonStar, t: "Earlier bedtime", n: "Cortisol runs sensitive now" },
  ],
  follicular: [
    { Icon: Dumbbell, t: "Train hard today", n: "Rising estrogen backs you up" },
    { Icon: Sunrise, t: "Morning light", n: "Anchors cortisol + mood" },
    { Icon: Utensils, t: "Protein at breakfast", n: "Steadies blood sugar" },
  ],
  ovulation: [
    { Icon: Zap, t: "Peak-effort workout", n: "Your strongest days" },
    { Icon: Droplet, t: "Stay hydrated", n: "Supports the higher output" },
    { Icon: Leaf, t: "Fibre with meals", n: "Helps clear estrogen" },
  ],
  luteal: [
    { Icon: Wind, t: "Steady movement, not max", n: "Zone 2, pilates, walks" },
    { Icon: Utensils, t: "Magnesium + complex carbs", n: "Eases cramps & cravings" },
    { Icon: MoonStar, t: "Protect your sleep", n: "Wind down earlier" },
  ],
};

/** The daily-rhythm equivalent for everyone else. */
const DAILY: Action[] = [
  { Icon: Sunrise, t: "Morning light, 10 min", n: "Sets cortisol + testosterone" },
  { Icon: Dumbbell, t: "Strength training", n: "Supports testosterone" },
  { Icon: Utensils, t: "Protein at breakfast", n: "Steadies energy + insulin" },
  { Icon: MoonStar, t: "Screens off by 10:30", n: "Protects melatonin" },
];

/**
 * Today's focus list. The first item starts ticked so the checklist opens with
 * momentum rather than an empty state.
 */
export function focusForProfile(profile: Profile | null): FocusAction[] {
  if (!profile) return [];
  const actions = hasCycle(profile) ? BY_PHASE[cycleInfo(profile).key] : DAILY;
  return actions.map((a, i) => ({ ...a, done: i === 0 }));
}
