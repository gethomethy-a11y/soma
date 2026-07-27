import { Activity, BookOpen, Home, MessageCircle, User, type LucideIcon } from "lucide-react";
import type { Theme } from "../theme";

export type TabId = "home" | "coach" | "hormones" | "learn" | "profile";

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "coach", label: "Coach", Icon: MessageCircle },
  { id: "hormones", label: "Hormones", Icon: Activity },
  { id: "learn", label: "Learn", Icon: BookOpen },
  { id: "profile", label: "Profile", Icon: User },
];

export function TabBar({ t, dark, tab, setTab }: { t: Theme; dark: boolean; tab: TabId; setTab: (id: TabId) => void }) {
  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        justifyContent: "space-around",
        padding: 8,
        borderTop: `1px solid ${t.line}`,
        background: dark ? "rgba(17,19,22,.85)" : "rgba(255,255,255,.85)",
        backdropFilter: "blur(20px)",
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 12px",
              flex: 1,
            }}
          >
            <Icon
              size={23}
              color={active ? t.sage : t.faint}
              strokeWidth={active ? 2.4 : 2}
              fill={active ? t.sage : "none"}
              fillOpacity={active ? 0.14 : 0}
            />
            <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 550, color: active ? t.sage : t.faint }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
