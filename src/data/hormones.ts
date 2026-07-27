import {
  Activity,
  Clock,
  Coffee,
  Dumbbell,
  Leaf,
  Moon,
  MoonStar,
  Sun,
  Sunrise,
  Utensils,
  Wind,
} from "lucide-react";
import type { Hormone, HormoneKey } from "../types";

/**
 * The six hormones, with the trending hook AND the real science: role, how it
 * shows up, myth vs fact, and the levers that actually move it.
 *
 * Content rule for this file: no calorie targets, no weight-loss framing, no
 * body shaming. Nutrition stays about food quality and timing.
 */
export const HORMONES: Record<HormoneKey, Hormone> = {
  cortisol: {
    key: "cortisol",
    name: "Cortisol",
    tag: "Stress & energy",
    c: "#D98A5A",
    cd: "#E7A579",
    soft: "#FBEDE2",
    softD: "#2A2016",
    role: "Your wake-up hormone. Meant to be high in the morning and low at night.",
    shows:
      "When it stays high: afternoon crashes, sugar cravings, puffiness and water retention, and lighter sleep.",
    myth: "“Cortisol belly” is fat you can melt with a supplement.",
    fact:
      "Most of that look is bloating and water. Sleep, morning light and not skipping meals move cortisol far more than any powder.",
    levers: [
      { Icon: MoonStar, label: "Protect sleep" },
      { Icon: Sunrise, label: "Morning light" },
      { Icon: Utensils, label: "Eat regularly" },
    ],
  },
  estrogen: {
    key: "estrogen",
    name: "Estrogen",
    tag: "Skin, mood & cycle",
    c: "#C58BB4",
    cd: "#D6A0C8",
    soft: "#F7EAF3",
    softD: "#2A1E27",
    role: "Rises and falls across your cycle. Supports skin, collagen, mood and steady energy.",
    shows:
      "Higher: glowing skin, better mood, more energy. Dropping before your period: duller skin, lower mood, PMS.",
    myth: "You need to “detox” estrogen to balance it.",
    fact:
      "Your liver and gut already clear it. Fibre, protein and steady blood sugar support that far more than a cleanse.",
    levers: [
      { Icon: Leaf, label: "Fibre & greens" },
      { Icon: Utensils, label: "Enough protein" },
      { Icon: Wind, label: "Manage stress" },
    ],
  },
  testosterone: {
    key: "testosterone",
    name: "Testosterone",
    tag: "Drive & strength",
    c: "#5F9E82",
    cd: "#8FC5AC",
    soft: "#E7F1EB",
    softD: "#1B2A24",
    role: "Present in everyone. Supports drive, muscle, energy and libido. Peaks in the morning.",
    shows:
      "Healthy levels: motivation, strength gains, steady libido. Low: flat energy, weaker recovery, low drive.",
    myth: "Special “booster” supplements raise it fast.",
    fact:
      "Sleep, strength training and enough protein are what genuinely support it. Most boosters do little.",
    levers: [
      { Icon: Dumbbell, label: "Lift weights" },
      { Icon: MoonStar, label: "Deep sleep" },
      { Icon: Utensils, label: "Protein & healthy fats" },
    ],
  },
  insulin: {
    key: "insulin",
    name: "Insulin",
    tag: "Blood sugar & skin",
    c: "#5E8AC0",
    cd: "#8DB2DE",
    soft: "#E9F0F8",
    softD: "#182430",
    role:
      "Manages blood sugar. Big spikes and crashes drive cravings, energy dips and can worsen breakouts.",
    shows: "Spiky days: 3pm crashes, cravings, restless focus, and for some, hormonal acne.",
    myth: "Sugar alone causes acne and hormone chaos.",
    fact:
      "It's the spike-and-crash pattern. Eating protein and fibre first, then carbs, plus a short walk, flattens it.",
    levers: [
      { Icon: Utensils, label: "Protein first" },
      { Icon: Leaf, label: "Fibre with carbs" },
      { Icon: Activity, label: "Walk after meals" },
    ],
  },
  dopamine: {
    key: "dopamine",
    name: "Dopamine",
    tag: "Motivation & focus",
    c: "#9E86C4",
    cd: "#B7A0DB",
    soft: "#F0EBF7",
    softD: "#241E2E",
    role: "The drive and reward chemical. Constant quick hits (endless scrolling) blunt it over time.",
    shows: "Blunted: low motivation, boredom, needing more stimulation to feel anything.",
    myth: "A one-day “dopamine detox” resets your brain.",
    fact:
      "You can't detox dopamine. Sleep, morning light, movement and fewer constant hits restore sensitivity gradually.",
    levers: [
      { Icon: Sunrise, label: "Morning light" },
      { Icon: Activity, label: "Move daily" },
      { Icon: Coffee, label: "Fewer quick hits" },
    ],
  },
  melatonin: {
    key: "melatonin",
    name: "Melatonin",
    tag: "Sleep",
    c: "#6E8FC9",
    cd: "#8DB2DE",
    soft: "#E9F0F8",
    softD: "#182430",
    role: "Rises at night to bring on sleep. Bright light in the evening delays it.",
    shows: "Suppressed: trouble falling asleep, restless nights, groggy mornings.",
    myth: "More melatonin supplement means better sleep.",
    fact: "Timing beats dose. Dimming lights and screens-off an hour before bed does the heavy lifting.",
    levers: [
      { Icon: Moon, label: "Dim the evening" },
      { Icon: Clock, label: "Consistent bedtime" },
      { Icon: Sun, label: "Bright mornings" },
    ],
  },
};

/** The hormone featured as the free scan on Home. */
export const FEATURED_HORMONE: HormoneKey = "cortisol";

export const FEATURED_COPY = {
  eyebrow: "Free scan · 60 sec",
  title: "Scan your cortisol",
  body:
    "Wired, crashing, craving sugar? Find out if your stress hormone is running high — and what to do about it.",
};

/** Pick the accent that matches the active theme. */
export const accentOf = (h: Pick<Hormone, "c" | "cd">, dark: boolean) => (dark ? h.cd : h.c);

/** Pick the tinted background that matches the active theme. */
export const tintOf = (h: Pick<Hormone, "soft" | "softD">, dark: boolean) => (dark ? h.softD : h.soft);
