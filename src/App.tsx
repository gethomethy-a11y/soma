import { useEffect, useState } from "react";
import { PhoneShell, StatusBar } from "./components/PhoneShell";
import { TabBar, type TabId } from "./components/TabBar";
import { SomaMark } from "./components/SomaMark";
import { OnboardingFlow } from "./screens/OnboardingFlow";
import { HomeScreen } from "./screens/HomeScreen";
import { HormonesScreen } from "./screens/HormonesScreen";
import { CoachScreen } from "./screens/CoachScreen";
import { LearnScreen } from "./screens/LearnScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { HormoneDetailSheet } from "./screens/sheets/HormoneDetailSheet";
import { HormoneCheckSheet } from "./screens/sheets/HormoneCheckSheet";
import { ArticleSheet } from "./screens/sheets/ArticleSheet";
import { ConnectHealthSheet } from "./screens/sheets/ConnectHealthSheet";
import { LabResultsSheet } from "./screens/sheets/LabResultsSheet";
import { PaywallSheet } from "./screens/sheets/PaywallSheet";
import { ShareSheet } from "./screens/sheets/ShareSheet";
import { AppProvider, useApp } from "./hooks/useApp";
import { clearCheckoutFlag, returningFromCheckout } from "./lib/billing";
import type { Article, HormoneKey, HormoneReading, ShareData } from "./types";

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const { t, dark, ready, profile, premium, hasScanned, completeOnboarding, recordScan, setConnected, syncPremium } =
    useApp();

  const [tab, setTab] = useState<TabId>("home");
  const [detailHormone, setDetailHormone] = useState<HormoneReading | null>(null);
  const [checkHormone, setCheckHormone] = useState<HormoneKey | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [share, setShare] = useState<ShareData | null>(null);
  const [showConnect, setShowConnect] = useState(false);
  const [showLabs, setShowLabs] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Coming back from Stripe Checkout: the webhook has (or is about to) flip the
  // premium flag, so re-read it rather than trusting the redirect alone.
  useEffect(() => {
    if (!returningFromCheckout()) return;
    clearCheckoutFlag();
    void syncPremium();
    const retry = setTimeout(() => void syncPremium(), 3000);
    return () => clearTimeout(retry);
  }, [syncPremium]);

  /**
   * Free tier: one scan per hormone. Re-scanning is what the paywall protects,
   * so a second attempt on an already-scanned hormone opens Premium instead.
   */
  const openCheck = (key: HormoneKey) => {
    if (hasScanned(key) && !premium) {
      setShowPaywall(true);
      return;
    }
    setCheckHormone(key);
  };

  if (!ready) return <BootScreen />;

  if (!profile) {
    return (
      <PhoneShell t={t} dark={dark}>
        <OnboardingFlow t={t} dark={dark} onDone={completeOnboarding} />
      </PhoneShell>
    );
  }

  return (
    <PhoneShell t={t} dark={dark}>
      {detailHormone && (
        <HormoneDetailSheet
          t={t}
          dark={dark}
          hormone={detailHormone}
          onClose={() => setDetailHormone(null)}
          onCheck={openCheck}
          goCoach={() => setTab("coach")}
        />
      )}

      {checkHormone && (
        <HormoneCheckSheet
          t={t}
          dark={dark}
          hormone={checkHormone}
          premium={premium}
          onClose={() => setCheckHormone(null)}
          onSave={recordScan}
          onShare={setShare}
          onPaywall={() => {
            setCheckHormone(null);
            setShowPaywall(true);
          }}
        />
      )}

      {article && (
        <ArticleSheet t={t} article={article} onClose={() => setArticle(null)} goCoach={() => setTab("coach")} />
      )}

      {share && <ShareSheet t={t} data={share} onClose={() => setShare(null)} />}

      {showPaywall && <PaywallSheet t={t} onClose={() => setShowPaywall(false)} />}

      {showConnect && (
        <ConnectHealthSheet
          t={t}
          onClose={() => setShowConnect(false)}
          onConnect={() => {
            setConnected(true);
            setShowConnect(false);
          }}
        />
      )}

      {showLabs && (
        <LabResultsSheet
          t={t}
          dark={dark}
          profile={profile}
          onClose={() => setShowLabs(false)}
          onConnect={() => setShowConnect(true)}
          goCoach={() => setTab("coach")}
        />
      )}

      <StatusBar t={t} />

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {tab === "home" && (
          <HomeScreen
            goCoach={() => setTab("coach")}
            goHormones={() => setTab("hormones")}
            openHormone={setDetailHormone}
            openCheck={openCheck}
            openConnect={() => setShowConnect(true)}
            openPaywall={() => setShowPaywall(true)}
            openShare={setShare}
          />
        )}
        {tab === "coach" && <CoachScreen />}
        {tab === "hormones" && <HormonesScreen openCheck={openCheck} openLabs={() => setShowLabs(true)} />}
        {tab === "learn" && <LearnScreen openArticle={setArticle} />}
        {tab === "profile" && (
          <ProfileScreen openConnect={() => setShowConnect(true)} openPaywall={() => setShowPaywall(true)} />
        )}
      </div>

      <TabBar t={t} dark={dark} tab={tab} setTab={setTab} />
    </PhoneShell>
  );
}

/** Shown for the moment it takes to read saved state. */
function BootScreen() {
  return (
    <div style={{ height: "100vh", display: "grid", placeItems: "center", background: "#E6E7E3" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(150deg, #5F9E82, #5E8AC0)",
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      >
        <SomaMark size={34} />
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.85}}`}</style>
    </div>
  );
}
