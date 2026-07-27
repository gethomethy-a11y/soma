import { HORMONES } from "../data/hormones";
import { cycleInfo, hasCycle } from "../data/cycle";
import { hormoneList } from "./score";
import type { ChatMessage, HormoneKey, Profile } from "../types";

/** How long to wait on the API before falling back to the local responder. */
const TIMEOUT_MS = 20_000;

/**
 * The coach's guardrails. Educational only, myth-busting, and explicitly barred
 * from diagnosing or from any calorie / weight-loss framing.
 */
export function systemPrompt(profile: Profile | null): string {
  const ci = cycleInfo(profile);
  const cycling = hasCycle(profile);

  const context = cycling
    ? `The user is on day ${ci.day} of an approx ${ci.len}-day cycle, in the ${ci.phase.name} phase (${ci.phase.hormone}). Use this when relevant. `
    : "The user tracks a daily hormonal rhythm (cortisol/testosterone peak in the morning, melatonin at night). ";

  return (
    "You are SOMA, a calm, premium AI coach focused on hormone health — the credible voice that cuts through TikTok/Instagram hype. " +
    "People come to you about cortisol, estrogen, testosterone, insulin, dopamine and how food, sleep, stress and appearance (skin, energy, bloating) connect to them. " +
    context +
    "Style: warm, concise (2-4 short paragraphs), plain language, no jargon dumps, no emojis. " +
    "When a viral claim comes up, name the myth and give the real, evidence-based picture — food-and-lifestyle first, never fear-mongering. " +
    "Do NOT give calorie targets, promote weight loss, restriction, or body shaming; keep nutrition about food quality and habits. " +
    "You are educational only: never diagnose or prescribe, and refer to a clinician for medical concerns, very irregular cycles, suspected conditions, or anything needing bloodwork."
  );
}

/** Starter prompts, tuned to whether the user has a cycle. */
export function suggestedPrompts(profile: Profile | null): string[] {
  return hasCycle(profile)
    ? [
        "Do I have high cortisol?",
        "How do I lower cortisol naturally?",
        "What foods balance my hormones?",
        "Is my diet causing hormonal acne?",
        "Why does my skin change with my cycle?",
      ]
    : [
        "How do I support testosterone naturally?",
        "How do I lower cortisol?",
        "What foods keep my energy steady?",
        "Is a dopamine detox real?",
        "How do I sleep more deeply?",
      ];
}

/**
 * Ask the coach.
 *
 * Calls our own serverless route (which holds the Anthropic key server-side).
 * If that fails, times out, or isn't deployed yet, the rule-based responder
 * answers from the user's own scan data instead — the chat never dead-ends.
 */
export async function askCoach(
  profile: Profile | null,
  scans: Partial<Record<HormoneKey, number>>,
  messages: ChatMessage[]
): Promise<string> {
  const question = messages[messages.length - 1]?.content ?? "";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ system: systemPrompt(profile), messages }),
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = (await res.json()) as { reply?: string };
      const reply = data.reply?.trim();
      if (reply) return reply;
    }
  } catch {
    /* fall through to the local responder */
  }

  return localAnswer(profile, scans, question);
}

const TOPIC_WORDS: [HormoneKey, string[]][] = [
  ["cortisol", ["cortisol", "stress", "wired", "belly", "anxious"]],
  ["testosterone", ["testosterone", "libido", "muscle", "sex drive", "drive"]],
  ["estrogen", ["estrogen", "oestrogen", "period", "pms", "cycle", "menstru"]],
  ["insulin", ["insulin", "blood sugar", "sugar", "craving", "acne", "breakout", "skin"]],
  ["dopamine", ["dopamine", "motivation", "focus", "scroll", "procrast"]],
  ["melatonin", ["melatonin", "sleep", "insomnia", "fall asleep"]],
];

const TAIL = " (Educational, not a diagnosis — a blood test is the only way to know real levels.)";

/** Offline fallback: answers from the user's own hormone data. */
export function localAnswer(
  profile: Profile | null,
  scans: Partial<Record<HormoneKey, number>>,
  question: string
): string {
  const lower = question.toLowerCase();
  const list = hormoneList(profile, scans);
  const match = TOPIC_WORDS.find(([, words]) => words.some((w) => lower.includes(w)));

  if (match) {
    const key = match[0];
    const hormone = HORMONES[key];
    const reading = list.find((h) => h.key === key);
    const levers = hormone.levers.map((l) => l.label.toLowerCase()).join(", ");

    if (reading?.checked && reading.level != null && !reading.fromPhase) {
      const off = reading.level < 76;
      return (
        `From your check, your ${hormone.name.toLowerCase()} looks ${reading.status.toLowerCase()} ` +
        `(${reading.level}/100). ${off ? hormone.fact : hormone.role} What helps most: ${levers}.` +
        TAIL
      );
    }
    return (
      `You haven't run your ${hormone.name.toLowerCase()} scan yet — tap "Scan your ${hormone.name}" on the ` +
      `Hormones tab and I'll read it back for you. In short: ${hormone.role} What moves it: ${levers}.` +
      TAIL
    );
  }

  if (/(food|eat|diet|nutrition|balance)/.test(lower)) {
    return (
      "For steadier hormones, build meals around protein and fibre, choose whole foods over ultra-processed, " +
      "and pair carbs with protein so your blood sugar doesn't spike and crash. Sleep, morning light and a short " +
      "walk after meals do more than any supplement." +
      TAIL
    );
  }

  return (
    "Tell me which hormone you're curious about — cortisol, testosterone, estrogen, insulin, dopamine or melatonin — " +
    "or run its scan and I'll read it back for you. In general, sleep, morning light, protein and managing stress " +
    "move nearly all of them." +
    TAIL
  );
}
