import type { LucideIcon } from "lucide-react";

/** The six hormones SOMA reads. Matches the check constraint on `soma_scans`. */
export type HormoneKey =
  | "cortisol"
  | "estrogen"
  | "testosterone"
  | "insulin"
  | "dopamine"
  | "melatonin";

export const HORMONE_KEYS: HormoneKey[] = [
  "cortisol",
  "estrogen",
  "testosterone",
  "insulin",
  "dopamine",
  "melatonin",
];

export type CyclePhaseKey = "menstrual" | "follicular" | "ovulation" | "luteal";

export type Sex = "Female" | "Male" | "Intersex" | "Prefer not to say";

export type Lever = { Icon: LucideIcon; label: string };

export type Hormone = {
  key: HormoneKey;
  name: string;
  /** One-line positioning, e.g. "Stress & energy". */
  tag: string;
  /** Accent colour, light theme. */
  c: string;
  /** Accent colour, dark theme. */
  cd: string;
  /** Tinted background, light theme. */
  soft: string;
  /** Tinted background, dark theme. */
  softD: string;
  role: string;
  shows: string;
  myth: string;
  fact: string;
  levers: Lever[];
};

/** A hormone joined with the user's current reading for it. */
export type HormoneReading = Hormone & {
  status: string;
  level: number | null;
  checked: boolean;
  /** True when the level is inferred from cycle phase rather than a scan. */
  fromPhase?: boolean;
};

export type DeckCard = {
  /** The yes/no symptom question. */
  q: string;
  /** Emoji shown on the card. */
  e: string;
  /** How much a "yes" pulls the score down. */
  w: number;
};

export type Deck = { blurb: string; cards: DeckCard[] };

export type CyclePhase = {
  key: CyclePhaseKey;
  name: string;
  /** Short label, e.g. "Rest & reset". */
  tab: string;
  c: string;
  cd: string;
  soft: string;
  softD: string;
  hormone: string;
  story: string;
  feel: {
    energy: [string, number];
    sleep: [string, number];
    stress: [string, number];
    mood: [string, number];
  };
};

export type Profile = {
  name: string;
  age: number;
  sex: Sex | "";
  /** Days since the last period started. Female profiles only. */
  daysSince: number;
  cycleLength: number;
  regular: "Regular" | "Irregular" | "Not sure" | "";
  activity: string;
  goals: string[];
  sleep: string;
  /** 1–10. */
  stress: number;
  diet: string;
};

/** A saved scan result, mirroring a row in `soma_scans`. */
export type Scan = {
  hormone: HormoneKey;
  score: number;
  /** Which deck cards the user swiped yes on. */
  answers: Record<string, boolean>;
  createdAt: string;
};

/** One point on the score-over-time chart. */
export type HistoryPoint = { d: string; v: number };

export type FocusAction = {
  Icon: LucideIcon;
  t: string;
  n: string;
  done: boolean;
};

export type Article = {
  id: string;
  cat: string;
  title: string;
  read: string;
  blurb: string;
  body: string[];
  /** Trending articles surface in the myth-busting hero section. */
  trending?: boolean;
};

/** Payload for the canvas share card. */
export type ShareData = {
  label: string;
  score: number;
  status: string;
  color: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };
