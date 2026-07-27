import { Activity, Check, CircleDot, Heart, MoonStar, type LucideIcon } from "lucide-react";
import type { Theme } from "../../theme";
import { BottomSheet } from "../../components/BottomSheet";
import { PrimaryButton, QuietButton } from "../../components/Button";

const PERMISSIONS: [string, LucideIcon][] = [
  ["Cycle & period dates", CircleDot],
  ["Sleep & time in bed", MoonStar],
  ["Heart rate & HRV", Heart],
  ["Steps & workouts", Activity],
];

export function ConnectHealthSheet({ t, onClose, onConnect }: { t: Theme; onClose: () => void; onConnect: () => void }) {
  return (
    <BottomSheet t={t} onClose={onClose} zIndex={60} maxHeight="90%" pad="22px 22px 30px">
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: t.sageSoft,
          display: "grid",
          placeItems: "center",
          margin: "0 auto 14px",
        }}
      >
        <Heart size={26} color={t.sage} />
      </div>
      <div style={{ textAlign: "center", fontSize: 20, fontWeight: 750, color: t.ink }}>Connect Apple Health</div>
      <div style={{ textAlign: "center", fontSize: 14, color: t.sub, margin: "6px 24px 20px", lineHeight: 1.5 }}>
        SOMA reads your data to sharpen your hormone picture — it never writes or shares it.
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
        {PERMISSIONS.map(([label, Icon]) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              background: t.card,
              borderRadius: 14,
              border: `1px solid ${t.line}`,
            }}
          >
            <Icon size={18} color={t.sage} />
            <span style={{ flex: 1, fontSize: 14.5, color: t.ink, fontWeight: 550 }}>{label}</span>
            <Check size={17} color={t.sage} strokeWidth={2.5} />
          </div>
        ))}
      </div>

      <PrimaryButton t={t} onClick={onConnect}>
        Allow access
      </PrimaryButton>
      <QuietButton t={t} onClick={onClose} style={{ marginTop: 8 }}>
        Maybe later
      </QuietButton>
    </BottomSheet>
  );
}
