/**
 * SOMA design tokens.
 *
 * Everything visual routes through this file: change a colour here and it moves
 * across every screen, in both light and dark. Components receive the resolved
 * theme object as `t` and read `t.ink`, `t.card`, etc.
 */

export const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif';

export type Theme = {
  /** Page background behind cards. */
  bg: string;
  /** Slightly lifted background, used for headers and inset areas. */
  bg2: string;
  /** Card surface. */
  card: string;
  /** Recessed surface inside a card (inputs, stat tiles). */
  card2: string;
  /** Primary text. */
  ink: string;
  /** Secondary text. */
  sub: string;
  /** Tertiary text and inactive icons. */
  faint: string;
  /** Hairline borders and progress-ring tracks. */
  line: string;
  /** Sage accent — the brand colour. */
  sage: string;
  /** Sage tinted background. */
  sageSoft: string;
  /** Blue accent — the secondary brand colour. */
  blue: string;
  /** Blue tinted background. */
  blueSoft: string;
  shadow: string;
  shadowLg: string;
};

const LIGHT: Theme = {
  bg: "#F3F4F1",
  bg2: "#FBFBF9",
  card: "#FFFFFF",
  card2: "#F6F7F4",
  ink: "#1A1B1D",
  sub: "#797A80",
  faint: "#AEAFB3",
  line: "#ECEDEA",
  sage: "#5F9E82",
  sageSoft: "#E7F1EB",
  blue: "#5E8AC0",
  blueSoft: "#E9F0F8",
  shadow: "0 1px 2px rgba(20,20,25,.04), 0 2px 8px rgba(20,20,25,.05)",
  shadowLg: "0 12px 34px rgba(24,28,26,.10)",
};

const DARK: Theme = {
  bg: "#0B0C0E",
  bg2: "#111316",
  card: "#17191D",
  card2: "#1E2127",
  ink: "#F2F2F4",
  sub: "#9B9CA2",
  faint: "#63656B",
  line: "#25282D",
  sage: "#8FC5AC",
  sageSoft: "#1B2A24",
  blue: "#8DB2DE",
  blueSoft: "#182430",
  shadow: "0 1px 2px rgba(0,0,0,.5)",
  shadowLg: "0 10px 30px rgba(0,0,0,.55)",
};

export const makeTheme = (dark: boolean): Theme => (dark ? DARK : LIGHT);

/** Backdrop behind the phone shell — sits outside the themed surface. */
export const pageBackdrop = (dark: boolean) => (dark ? "#050506" : "#E6E7E3");

/** Radii and spacing used often enough to be worth naming. */
export const RADIUS = { card: 22, sheet: 26, control: 15, pill: 20 } as const;

/**
 * Score bands. A higher score always means healthier balance, so the colour
 * ramp runs sage (good) → amber (watch) → warm orange (off balance).
 */
export function scoreColor(score: number, t: Theme): string {
  if (score >= 76) return t.sage;
  if (score >= 60) return "#D69A46";
  return "#D98A5A";
}

/** Plain-language summary of an overall hormone score. */
export function scoreHeadline(score: number): string {
  if (score >= 76) return "Your hormones look balanced";
  if (score >= 60) return "A few hormones need attention";
  return "Your hormones are running the show";
}

/** Short version of the same, used on share cards. */
export function scoreWord(score: number): string {
  if (score >= 76) return "Balanced";
  if (score >= 60) return "Needs attention";
  return "Off balance";
}

/** Share-card ring colours are fixed (the card renders on a dark canvas). */
export function shareColor(score: number): string {
  if (score >= 76) return "#8FC5AC";
  if (score >= 60) return "#E7B569";
  return "#E7A579";
}
