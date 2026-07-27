import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Crown,
  Heart,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import { FONT, type Theme } from "../theme";
import { Card, Eyebrow, Screen, ScreenTitle } from "../components/Card";
import { Toggle } from "../components/Button";
import { DISCLAIMER_LEGAL } from "../components/Disclaimer";
import { cycleInfo, hasCycle } from "../data/cycle";
import { useApp } from "../hooks/useApp";

const PREMIUM_FEATURES = [
  "Track your hormones over time",
  "Re-scan anytime",
  "Your personal hormone plan",
  "Blood test insights",
  "Unlimited AI coach",
  "Apple Health sync",
];

export function ProfileScreen({ openConnect, openPaywall }: { openConnect: () => void; openPaywall: () => void }) {
  const { t, dark, setDark, profile, connected, premium } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [smartReminders, setSmartReminders] = useState(true);

  const ci = useMemo(() => cycleInfo(profile), [profile]);
  const cycling = hasCycle(profile);

  const wearables: { name: string; Icon: LucideIcon; on: boolean }[] = [
    { name: "Apple Health", Icon: Heart, on: connected },
    { name: "Oura Ring", Icon: Sun, on: false },
    { name: "WHOOP", Icon: Activity, on: false },
  ];

  return (
    <Screen>
      <ScreenTitle t={t}>Profile</ScreenTitle>

      <Card t={t} style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 15 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            background: `linear-gradient(150deg, ${t.sage}, ${t.blue})`,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>
            {(profile?.name || "S")[0].toUpperCase()}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: t.ink }}>{profile?.name || "Your name"}</div>
          <div style={{ fontSize: 13.5, color: t.sub, marginTop: 2 }}>
            {profile?.age ?? 29} · {profile?.sex || "—"} · {profile?.activity || "Moderate"}
          </div>
        </div>
      </Card>

      {cycling && (
        <Card t={t} style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 650,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              color: t.sub,
              marginBottom: 10,
            }}
          >
            Cycle settings
          </div>
          {(
            [
              ["Cycle length", `${ci.len} days`],
              ["Last period", `${profile?.daysSince ?? 8} days ago`],
              ["Regularity", profile?.regular || "Regular"],
            ] as const
          ).map(([label, value], i, arr) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "11px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${t.line}` : "none",
              }}
            >
              <span style={{ fontSize: 14.5, color: t.ink, fontWeight: 550 }}>{label}</span>
              <span style={{ fontSize: 14, color: t.sub }}>{value}</span>
            </div>
          ))}
        </Card>
      )}

      <Card
        t={t}
        style={{
          marginTop: 12,
          background: `linear-gradient(135deg, ${t.ink}, ${dark ? "#2A2D33" : "#3A3D44"})`,
          border: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Crown size={20} color="#E7B569" />
          <span style={{ fontSize: 17, fontWeight: 750, color: "#fff" }}>SOMA Premium</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", margin: "-4px 0 14px", lineHeight: 1.5 }}>
          Free: one scan of each hormone. Premium: track them over time + your plan.
        </div>
        <div style={{ display: "grid", gap: 9, marginBottom: 16 }}>
          {PREMIUM_FEATURES.map((feature) => (
            <div key={feature} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: "rgba(255,255,255,.92)" }}>
              <Check size={16} color={t.sage} strokeWidth={2.5} /> {feature}
            </div>
          ))}
        </div>
        {premium ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,255,255,.12)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            <Check size={17} color={t.sage} strokeWidth={3} /> Premium active
          </div>
        ) : (
          <button
            onClick={openPaywall}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 14,
              border: "none",
              background: "#fff",
              color: "#1A1B1D",
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Go Premium · $12/mo
          </button>
        )}
      </Card>

      <Eyebrow t={t}>Connected sources</Eyebrow>
      <Card t={t} pad={6}>
        {wearables.map((w, i) => (
          <div
            key={w.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "13px 12px",
              borderBottom: i < wearables.length - 1 ? `1px solid ${t.line}` : "none",
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 11, background: t.card2, display: "grid", placeItems: "center" }}>
              <w.Icon size={18} color={t.sub} />
            </div>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 550, color: t.ink }}>{w.name}</span>
            {w.on ? (
              <span style={{ fontSize: 12.5, fontWeight: 650, color: t.sage, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 7, background: t.sage }} />
                Connected
              </span>
            ) : (
              <button
                onClick={w.name === "Apple Health" ? openConnect : undefined}
                style={{
                  fontSize: 13,
                  fontWeight: 650,
                  color: t.ink,
                  background: t.card2,
                  border: "none",
                  padding: "7px 14px",
                  borderRadius: 11,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                Connect
              </button>
            )}
          </div>
        ))}
      </Card>

      <Eyebrow t={t}>Preferences</Eyebrow>
      <Card t={t} pad={6}>
        <div style={{ padding: "0 8px" }}>
          <Row t={t} Icon={dark ? Moon : Sun} label="Dark mode" right={<Toggle t={t} on={dark} set={setDark} />} />
          <Divider t={t} />
          <Row t={t} Icon={Bell} label="Notifications" right={<Toggle t={t} on={notifications} set={setNotifications} />} />
          <Divider t={t} />
          <Row t={t} Icon={Clock} label="Smart reminders" right={<Toggle t={t} on={smartReminders} set={setSmartReminders} />} />
        </div>
      </Card>

      <Eyebrow t={t}>Account</Eyebrow>
      <Card t={t} pad={6}>
        <div style={{ padding: "0 8px" }}>
          <Row t={t} Icon={User} label="Personal information" onClick={() => {}} />
          <Divider t={t} />
          <Row t={t} Icon={ShieldCheck} label="Privacy & data" onClick={() => {}} />
          <Divider t={t} />
          <Row t={t} Icon={Settings} label="Settings" onClick={() => {}} />
        </div>
      </Card>

      <div style={{ textAlign: "center", marginTop: 26, padding: "0 20px" }}>
        <div style={{ fontSize: 11.5, color: t.faint, lineHeight: 1.5 }}>{DISCLAIMER_LEGAL}</div>
        <div style={{ fontSize: 12, color: t.faint, marginTop: 10, fontWeight: 600 }}>SOMA · v1.2</div>
      </div>
    </Screen>
  );
}

function Row({
  t,
  Icon,
  label,
  right,
  onClick,
}: {
  t: Theme;
  Icon: LucideIcon;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 4px", cursor: onClick ? "pointer" : "default" }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 10, background: t.card2, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={17} color={t.sub} />
      </div>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 550, color: t.ink }}>{label}</span>
      {right}
      {onClick && !right && <ChevronRight size={18} color={t.faint} />}
    </div>
  );
}

const Divider = ({ t }: { t: Theme }) => <div style={{ height: 1, background: t.line }} />;
