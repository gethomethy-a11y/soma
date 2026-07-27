import type { Article } from "../types";

export const CATEGORIES = ["Trending", "Cortisol", "Sleep", "Skin", "Energy", "Cycle"];

/**
 * Full article content — every piece reads end to end, no stubs.
 *
 * House style: name the viral claim, give the evidence-based picture, then the
 * practical takeaway. Never fear-mongering, never calorie or weight-loss
 * framing, and anything medical routes to a clinician.
 */

/** The myth-busting hero section at the top of Learn. */
export const TRENDING: Article[] = [
  {
    id: "cortisol-face",
    cat: "Trending",
    trending: true,
    title: "Is “cortisol face” real?",
    read: "2 min",
    blurb: "Mostly no — what the puffiness actually is.",
    body: [
      "The claim: chronic stress raises cortisol, and cortisol makes your face round and puffy — so a supplement or “cortisol detox” will give you a sharper jawline.",
      "The reality: true cortisol-driven facial changes happen in a rare medical condition (Cushing's syndrome) — and that needs a doctor, not a powder. For everyone else, a puffy morning face is mostly water retention: salty food late at night, alcohol, poor sleep, or just lying flat for eight hours.",
      "What actually helps: consistent sleep, less alcohol and late-night salt, and moving in the morning. The puffiness that TikTok calls “cortisol face” usually fades by mid-morning on its own — no product required.",
    ],
  },
  {
    id: "seed-oils",
    cat: "Trending",
    trending: true,
    title: "Seed oils: villain or hype?",
    read: "3 min",
    blurb: "What studies really say. No fear-mongering.",
    body: [
      "The claim: seed oils (sunflower, canola, soybean) are “toxic”, drive inflammation and are behind modern disease.",
      "The reality: large reviews don't support the panic. Replacing saturated fat with these oils tends to improve cholesterol, and controlled studies don't show the inflammation spike the trend claims. What IS true: seed oils ride along in a lot of ultra-processed food — and eating lots of ultra-processed food is genuinely linked to worse health.",
      "The practical takeaway: the problem is the fries, not the sunflower oil in your kitchen. Cook mostly whole foods, use olive oil if you like it, and don't fear a normal amount of seed oil — there are far bigger hormone levers: sleep, protein, movement.",
    ],
  },
  {
    id: "dopamine-detox",
    cat: "Trending",
    trending: true,
    title: "Does a dopamine detox work?",
    read: "2 min",
    blurb: "You can't reset it in a day. Do this instead.",
    body: [
      "The claim: quit all pleasure for 24–48 hours — no phone, no sugar, no music — and your dopamine “resets”, bringing back motivation.",
      "The reality: dopamine isn't a tank that empties or refills. What actually gets blunted by constant quick hits (endless scrolling, back-to-back stimulation) is your sensitivity to reward — and one dramatic day off doesn't rebuild that.",
      "What works instead is boring and effective: sleep, morning light, daily movement, and structurally fewer quick hits — phone out of the bedroom, one thing at a time, real breaks without a screen. Sensitivity comes back gradually over weeks, not in a weekend.",
    ],
  },
];

/** The main article feed. */
export const ARTICLES: Article[] = [
  {
    id: "lower-cortisol-bed",
    cat: "Cortisol",
    title: "Lower cortisol before bed",
    read: "2 min",
    blurb: "3 things that calm your stress hormone by tonight.",
    body: [
      "Cortisol is supposed to fall in the evening. If yours stays up — racing mind, tense shoulders, “wired but tired” — three things move it tonight.",
      "One: dim the lights an hour before bed. Bright overhead light keeps your stress axis in day mode. Two: put a hard stop on work input — every email you read restarts the loop you're trying to close. Three: slow your exhale. Five minutes of breathing out longer than you breathe in (try 4 in, 8 out) is one of the fastest measurable ways to downshift.",
      "None of this is a hack — it's removing the signals that tell your body it's still noon. Educational, not a diagnosis.",
    ],
  },
  {
    id: "fall-asleep-faster",
    cat: "Sleep",
    title: "Fall asleep faster tonight",
    read: "2 min",
    blurb: "The one hour before bed that changes everything.",
    body: [
      "Melatonin rises when light falls. The single biggest reason people lie awake is simple: their evening looks like daytime to their brain.",
      "The last hour is the lever. Screens dimmed or off, overhead lights swapped for a lamp, bedroom cool and dark. Caffeine matters more than you think — half of your 2pm coffee is still circulating at 8pm. And a consistent bedtime beats a perfect one: your body loves rhythm more than rules.",
      "If you do one thing: pick a wind-down trigger (same tea, same playlist, same dim light) and repeat it nightly. After a week your body starts sleeping on cue.",
    ],
  },
  {
    id: "breakout-hormone",
    cat: "Skin",
    title: "The hormone behind your breakouts",
    read: "3 min",
    blurb: "Cortisol, insulin or your cycle — spot which.",
    body: [
      "Not all breakouts have the same driver — and the pattern tells you a lot.",
      "Jaw and chin, worse in the week before your period: that's the cyclical hormone shift, and it usually eases as estrogen rises again. Breakouts after stressful stretches with poor sleep point at cortisol. Breakouts that track with sugary, spiky eating days point at insulin — the spike-and-crash pattern raises oil production for some people.",
      "The common ground: steady blood sugar (protein and fibre first), real sleep, and patience — skin runs about four weeks behind your habits. If acne is painful, deep or scarring, see a dermatologist; that's beyond lifestyle. Educational, not a diagnosis.",
    ],
  },
  {
    id: "3pm-crash",
    cat: "Energy",
    title: "Kill the 3pm crash",
    read: "2 min",
    blurb: "Eat in this order and skip the slump.",
    body: [
      "The 3pm slump is usually your lunch talking. A fast-carb-heavy meal spikes blood sugar, insulin overshoots, and ninety minutes later you're foggy and hunting for sugar.",
      "The fix is order, not restriction: eat protein and vegetables first, carbs after. Same food, flatter curve. Add a ten-minute walk after eating — your muscles soak up glucose and blunt the spike further.",
      "If afternoons are still heavy: check your caffeine timing (late coffee wrecks the night that powers the next day) and whether you actually ate enough at lunch — undereating crashes energy just as hard as sugar does.",
    ],
  },
  {
    id: "wired-but-tired",
    cat: "Cortisol",
    title: "Wired but tired? Read this",
    read: "2 min",
    blurb: "Why you can't switch off — and the fix.",
    body: [
      "“Wired but tired” is the signature of an evening cortisol that never landed: exhausted body, racing head.",
      "It's usually built during the day — caffeine after 2pm, no real breaks, skipped meals (low blood sugar is a stress signal), then bright light and stimulation right up to bed.",
      "Unwind it at both ends: front-load caffeine and food earlier, take two genuine pauses during the day, and give the evening a descent — dim light, slow exhale, no new input. It typically takes a few consistent days, not one perfect night.",
    ],
  },
  {
    id: "morning-light",
    cat: "Energy",
    title: "Morning light = better everything",
    read: "2 min",
    blurb: "10 minutes that set your whole day.",
    body: [
      "Ten minutes of outdoor light in the first hour after waking is the cheapest hormone intervention there is.",
      "It anchors your circadian clock: cortisol peaks properly in the morning (energy, focus), which lets melatonin rise properly at night (sleep). Through a window doesn't count for much — glass cuts the intensity your clock needs. Cloudy still works; outdoor light is far brighter than it looks.",
      "Stack it: coffee on the balcony, walk to the bakery, sit outside with your phone if you must. Consistency beats duration.",
    ],
  },
  {
    id: "clear-skin-blood-sugar",
    cat: "Skin",
    title: "Clear skin starts with blood sugar",
    read: "3 min",
    blurb: "One tiny food swap for fewer breakouts.",
    body: [
      "High-glycemic eating — big spikes and crashes — nudges up insulin, and for many people that means more oil production and more breakouts.",
      "The tiny swap: don't eat fast carbs naked. Pair them — fruit with yogurt, bread with eggs, pasta with protein and vegetables. The carb stays, the spike shrinks.",
      "Give it four weeks before judging — skin lags behind habits. And if breakouts are severe or scarring, a dermatologist beats any diet change. Educational, not a diagnosis.",
    ],
  },
  {
    id: "caffeine-half-life",
    cat: "Sleep",
    title: "Your 2pm coffee is still awake at 10pm",
    read: "2 min",
    blurb: "Caffeine's sneaky half-life, explained.",
    body: [
      "Caffeine's half-life is roughly five to six hours. A 2pm coffee means half the caffeine is still in your system around 8pm — and a quarter near midnight.",
      "You might still fall asleep — caffeine is sneakier than that. It shallows sleep: less deep sleep, more micro-wakings, and a morning that needs… more coffee. That's the loop.",
      "Try a two-week experiment: last caffeine before 12. Most people notice deeper sleep within days — and ironically need less caffeine because of it.",
    ],
  },
  {
    id: "cycle-60-seconds",
    cat: "Cycle",
    title: "Your cycle in 60 seconds",
    read: "2 min",
    blurb: "The 4 phases and how each one feels.",
    body: [
      "Menstrual (days ~1–5): hormones at their lowest. Energy is low by design — rest is productive here.",
      "Follicular (until ovulation): estrogen climbs, and with it energy, mood, focus and skin. The natural week to start things and train hard. Ovulation (~2 days): the peak — estrogen tops out with a lift from testosterone. Strongest, most confident days of the month.",
      "Luteal (the ~2 weeks after): progesterone rises, then both fall before your period. Energy tapers, sleep lightens, and the last days can bring PMS — that's hormones, not you. Steady movement and earlier nights carry you through. Every body differs; this is the common pattern, not a rule.",
    ],
  },
  {
    id: "train-with-your-cycle",
    cat: "Cycle",
    title: "Train with your cycle, not against it",
    read: "3 min",
    blurb: "Why the same workout feels different week to week.",
    body: [
      "If a session that felt easy two weeks ago suddenly feels brutal, you're not losing fitness — you're in a different hormonal week.",
      "Rising estrogen through the follicular phase supports strength and recovery: that's the natural window for heavy lifts, intervals and new personal bests. After ovulation, progesterone rises, body temperature runs slightly higher and perceived effort climbs — the same pace genuinely costs more. Steady work suits that week better: zone 2, technique sessions, pilates, longer easy walks.",
      "None of this means stopping. It means matching intensity to the week instead of judging yourself against your best one. Track how sessions feel for two cycles and the pattern usually shows up clearly — and if your cycle is very irregular or absent, that's worth raising with a clinician rather than training through.",
    ],
  },
  {
    id: "pms-not-you",
    cat: "Cycle",
    title: "PMS is hormonal, not a character flaw",
    read: "2 min",
    blurb: "What the last week actually does — and what helps.",
    body: [
      "In the days before your period, estrogen and progesterone both drop. Serotonin tends to dip with them, which is why mood, patience and sleep can all wobble at once.",
      "What genuinely helps is unglamorous: earlier nights (sleep loss amplifies everything), steady meals rather than long gaps, magnesium-rich food, gentle daily movement, and less caffeine in that window if you're sensitive. Warmth helps cramps more than most people expect.",
      "What to take seriously: if low mood in that week is severe, or it reliably derails your life, that pattern has a name (PMDD) and effective treatment — a clinician is the right next step, not a supplement. Educational, not a diagnosis.",
    ],
  },
  {
    id: "protein-first",
    cat: "Energy",
    title: "Why protein first actually works",
    read: "2 min",
    blurb: "The order of your plate changes the curve.",
    body: [
      "Eating the same meal in a different order produces a measurably different blood-sugar curve. Protein and vegetables first, carbohydrate last, gives a flatter rise — less overshoot, less crash, fewer cravings ninety minutes later.",
      "It works because the first foods slow how quickly the carbohydrate reaches your bloodstream. Nothing is removed, nothing is restricted, and the meal is the same size.",
      "Two additions make it better: something fibrous alongside the carbs, and a ten-minute walk afterwards. This is about steadiness, not shrinking your plate — a meal that's too small produces its own crash.",
    ],
  },
];

/** Everything, for search. */
export const ALL_ARTICLES: Article[] = [...TRENDING, ...ARTICLES];
