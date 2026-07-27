import type { Deck, HormoneKey } from "../types";

/**
 * The swipe decks behind each hormone scan. A "yes" swipe subtracts that card's
 * weight from a healthy baseline, so more symptoms means a lower balance score.
 *
 * Weights are relative, not clinical: the strongest signal for a hormone carries
 * the most, and the result is bounded so nobody ever sees an alarming 0 or a
 * falsely perfect 100.
 */
export const DECKS: Record<HormoneKey, Deck> = {
  cortisol: {
    blurb: "Your stress hormone — this check spots the signs it's running high.",
    cards: [
      { q: "Wired but tired at night?", e: "🔌", w: 10 },
      { q: "Hard to switch off?", e: "🌀", w: 10 },
      { q: "Afternoon energy crash?", e: "📉", w: 9 },
      { q: "Craving salt or sugar under stress?", e: "🧂", w: 9 },
      { q: "Waking up already tense?", e: "😬", w: 10 },
      { q: "Restless or broken sleep?", e: "🌙", w: 9 },
    ],
  },
  testosterone: {
    blurb: "Drive, strength and libido — this check spots the signs it's low.",
    cards: [
      { q: "Low motivation or drive lately?", e: "🔋", w: 9 },
      { q: "Lower libido than usual?", e: "❤️‍🔥", w: 10 },
      { q: "Harder to build or keep muscle?", e: "💪", w: 8 },
      { q: "Workout recovery feels slow?", e: "🛌", w: 8 },
      { q: "Lower mood or confidence?", e: "☁️", w: 8 },
      { q: "Tired even after a full night's sleep?", e: "😮‍💨", w: 8 },
      { q: "Feeling less sharp — brain fog?", e: "🌫️", w: 7 },
    ],
  },
  estrogen: {
    blurb: "Skin, mood and cycle — this check spots symptoms of imbalance.",
    cards: [
      { q: "Mood dips before your period?", e: "🌧️", w: 11 },
      { q: "Skin duller or cyclic breakouts?", e: "✨", w: 9 },
      { q: "Low energy in your second half?", e: "🔋", w: 10 },
      { q: "Hot flushes or night sweats?", e: "🔥", w: 10 },
      { q: "Dryness or low libido?", e: "💧", w: 9 },
      { q: "Worse PMS than usual?", e: "📅", w: 9 },
    ],
  },
  insulin: {
    blurb: "Blood sugar and skin — this check spots spiky patterns.",
    cards: [
      { q: "Strong sugar or carb cravings?", e: "🍬", w: 11 },
      { q: "Energy crash after meals?", e: "📉", w: 10 },
      { q: "Hangry when you skip a meal?", e: "😠", w: 9 },
      { q: "Breakouts around jaw or chin?", e: "🎯", w: 9 },
      { q: "Bloated after carbs?", e: "🎈", w: 9 },
      { q: "Frequent afternoon slumps?", e: "🥱", w: 8 },
    ],
  },
  dopamine: {
    blurb: "Motivation and focus — this check spots when it's blunted.",
    cards: [
      { q: "Low motivation to start things?", e: "🎯", w: 11 },
      { q: "Reaching for your phone constantly?", e: "📱", w: 10 },
      { q: "Trouble focusing?", e: "🌫️", w: 10 },
      { q: "Less joy from usual things?", e: "🌑", w: 10 },
      { q: "Restless or easily bored?", e: "🔁", w: 9 },
      { q: "Procrastinating more?", e: "⏳", w: 8 },
    ],
  },
  melatonin: {
    blurb: "Your sleep hormone — this check spots what's suppressing it.",
    cards: [
      { q: "Hard to fall asleep?", e: "🌙", w: 11 },
      { q: "Screens right up to bedtime?", e: "📱", w: 9 },
      { q: "Waking during the night?", e: "👀", w: 10 },
      { q: "Groggy in the morning?", e: "🥱", w: 9 },
      { q: "Irregular sleep times?", e: "⏰", w: 10 },
      { q: "Rely on caffeine to function?", e: "☕", w: 8 },
    ],
  },
};

/** Highest and lowest score a scan can produce. */
export const SCORE_FLOOR = 28;
export const SCORE_CEILING = 92;
const BASELINE = 88;

/** Turn the accumulated weight of "yes" answers into a 0–100 balance score. */
export function scoreFromWeight(totalWeight: number): number {
  return Math.max(SCORE_FLOOR, Math.min(SCORE_CEILING, BASELINE - totalWeight));
}
