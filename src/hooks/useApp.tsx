import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { makeTheme, type Theme } from "../theme";
import { focusForProfile } from "../data/focus";
import { hormoneScore } from "../lib/score";
import {
  EMPTY_STATE,
  advanceStreak,
  cachePremium,
  clearLocal,
  loadState,
  refreshPremium,
  saveProfile,
  saveScan,
  type StreakState,
} from "../lib/store";
import type { FocusAction, HistoryPoint, HormoneKey, Profile, Scan } from "../types";

/**
 * One place for everything the app knows about the user. Screens read from here
 * instead of receiving a dozen props each.
 */
type AppValue = {
  ready: boolean;
  dark: boolean;
  setDark: (v: boolean) => void;
  t: Theme;

  profile: Profile | null;
  /** Latest score per hormone. */
  scans: Partial<Record<HormoneKey, number>>;
  history: HistoryPoint[];
  premium: boolean;
  streak: number;
  score: number | null;

  focus: FocusAction[];
  toggleFocus: (index: number) => void;

  connected: boolean;
  setConnected: (v: boolean) => void;

  completeOnboarding: (profile: Profile) => void;
  recordScan: (hormone: HormoneKey, score: number, answers: Record<string, boolean>) => void;
  /** Has this hormone already been scanned? Re-scanning is a premium feature. */
  hasScanned: (hormone: HormoneKey) => boolean;
  setPremium: (v: boolean) => void;
  syncPremium: () => Promise<void>;
  resetEverything: () => void;
};

const AppContext = createContext<AppValue | null>(null);

/** The phone's own light/dark setting, read once at startup. */
function prefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches === true;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  // Open in whatever mode the phone is already in; the Profile toggle overrides it.
  const [dark, setDark] = useState(prefersDark);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scans, setScans] = useState<Partial<Record<HormoneKey, number>>>({});
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [premium, setPremiumState] = useState(false);
  const [streak, setStreak] = useState<StreakState>(EMPTY_STATE.streak);
  const [focus, setFocus] = useState<FocusAction[]>([]);
  const [connected, setConnected] = useState(false);
  const booted = useRef(false);

  // Boot: restore saved state, then advance the streak once per day.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const state = await loadState();
      if (cancelled) return;
      setProfile(state.profile);
      setScans(state.scans);
      setHistory(state.history);
      setPremiumState(state.premium);
      setStreak(advanceStreak(state.streak));
      booted.current = true;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Today's focus follows the profile (and, for cycling users, the phase).
  useEffect(() => {
    setFocus(focusForProfile(profile));
  }, [profile]);

  const score = useMemo(() => hormoneScore(scans), [scans]);
  const t = useMemo(() => makeTheme(dark), [dark]);

  const completeOnboarding = useCallback(
    (next: Profile) => {
      setProfile(next);
      const streakNow = advanceStreak(streak);
      setStreak(streakNow);
      void saveProfile(next, premium, streakNow);
    },
    [premium, streak]
  );

  const recordScan = useCallback(
    (hormone: HormoneKey, value: number, answers: Record<string, boolean>) => {
      const nextScans = { ...scans, [hormone]: value };
      setScans(nextScans);

      const overall = hormoneScore(nextScans);
      if (overall != null) {
        const label = new Date().toISOString().slice(5, 10);
        setHistory((h) => [...h.filter((p) => p.d !== label), { d: label, v: overall }].slice(-14));
      }

      const scan: Scan = { hormone, score: value, answers, createdAt: new Date().toISOString() };
      void saveScan(scan, overall);
    },
    [scans]
  );

  const hasScanned = useCallback((hormone: HormoneKey) => typeof scans[hormone] === "number", [scans]);

  const toggleFocus = useCallback((index: number) => {
    setFocus((f) => f.map((a, i) => (i === index ? { ...a, done: !a.done } : a)));
  }, []);

  const setPremium = useCallback((v: boolean) => {
    setPremiumState(v);
    void cachePremium(v);
  }, []);

  /** Called after returning from Stripe Checkout — the webhook sets the real flag. */
  const syncPremium = useCallback(async () => {
    const value = await refreshPremium();
    setPremiumState(value);
  }, []);

  const resetEverything = useCallback(() => {
    clearLocal();
    setProfile(null);
    setScans({});
    setHistory([]);
    setPremiumState(false);
  }, []);

  const value: AppValue = {
    ready,
    dark,
    setDark,
    t,
    profile,
    scans,
    history,
    premium,
    streak: streak.n,
    score,
    focus,
    toggleFocus,
    connected,
    setConnected,
    completeOnboarding,
    recordScan,
    hasScanned,
    setPremium,
    syncPremium,
    resetEverything,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
