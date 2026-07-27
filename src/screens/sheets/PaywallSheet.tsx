import { useState } from "react";
import { Check, Crown } from "lucide-react";
import type { Theme } from "../../theme";
import { BottomSheet } from "../../components/BottomSheet";
import { PrimaryButton, QuietButton } from "../../components/Button";
import { startCheckout } from "../../lib/billing";

const BENEFITS = [
  "Re-scan any hormone, anytime",
  "Your score tracked over time",
  "Your personal hormone plan",
  "Unlimited AI coach + Apple Health sync",
];

/** Triggered by re-scanning, the score-over-time chart, and the profile CTA. */
export function PaywallSheet({ t, onClose }: { t: Theme; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgrade = async () => {
    setBusy(true);
    setError(null);
    const result = await startCheckout();
    if (!result.ok) {
      setError(result.reason);
      setBusy(false);
    }
    // On success the browser navigates to Stripe, so there's nothing to reset.
  };

  return (
    <BottomSheet t={t} onClose={onClose} zIndex={80} maxHeight="90%" pad="16px 22px 28px">
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 17,
          background: `linear-gradient(150deg, ${t.sage}, ${t.blue})`,
          display: "grid",
          placeItems: "center",
          margin: "0 auto 12px",
        }}
      >
        <Crown size={26} color="#fff" />
      </div>

      <div style={{ textAlign: "center", fontSize: 21, fontWeight: 800, color: t.ink }}>See how you change</div>
      <div style={{ textAlign: "center", fontSize: 14, color: t.sub, margin: "6px 16px 18px", lineHeight: 1.5 }}>
        One scan tells you today. Premium shows whether you're actually getting better.
      </div>

      <div style={{ display: "grid", gap: 9, marginBottom: 18 }}>
        {BENEFITS.map((benefit) => (
          <div key={benefit} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: t.ink, fontWeight: 550 }}>
            <Check size={17} color={t.sage} strokeWidth={2.5} /> {benefit}
          </div>
        ))}
      </div>

      {error && (
        <div
          style={{
            background: t.card,
            border: `1px solid ${t.line}`,
            borderRadius: 14,
            padding: "11px 13px",
            fontSize: 13,
            color: t.sub,
            lineHeight: 1.45,
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}

      <PrimaryButton t={t} onClick={() => void upgrade()} disabled={busy}>
        {busy ? "Opening checkout…" : "Go Premium · $12/mo"}
      </PrimaryButton>
      <QuietButton t={t} onClick={onClose} style={{ marginTop: 6 }}>
        Not now
      </QuietButton>

      <p style={{ fontSize: 11, color: t.faint, textAlign: "center", margin: "8px 0 0", lineHeight: 1.5 }}>
        Cancel anytime. Billed monthly via Stripe.
      </p>
    </BottomSheet>
  );
}
