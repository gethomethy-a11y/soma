import { useEffect, useState, type ReactNode } from "react";
import { Battery } from "lucide-react";
import { FONT, pageBackdrop, type Theme } from "../theme";

/**
 * The phone-shaped frame the whole app lives inside. On a desktop browser this
 * reads as a device preview; on a phone it fills the screen.
 */
export function PhoneShell({ t, dark, children }: { t: Theme; dark: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: pageBackdrop(dark),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        boxSizing: "border-box",
        fontFamily: FONT,
      }}
    >
      <GlobalKeyframes t={t} />
      <div
        style={{
          width: "100%",
          maxWidth: 428,
          height: "100%",
          maxHeight: 924,
          background: t.bg,
          borderRadius: 44,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          boxShadow: t.shadowLg,
          border: `1px solid ${t.line}`,
          fontFamily: FONT,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Faux iOS status bar — sells the native feel. */
export function StatusBar({ t }: { t: Theme }) {
  const [time, setTime] = useState(() => clockLabel());

  useEffect(() => {
    const id = setInterval(() => setTime(clockLabel()), 20_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 26px 4px",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 650, color: t.ink }}>{time}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center", color: t.ink }}>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 11 }}>
          {[4, 7, 9, 11].map((h) => (
            <span key={h} style={{ width: 3, height: h, borderRadius: 1, background: t.ink }} />
          ))}
        </div>
        <Battery size={20} strokeWidth={2} />
      </div>
    </div>
  );
}

function clockLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false });
}

function GlobalKeyframes({ t }: { t: Theme }) {
  return (
    <style>{`
      @keyframes fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
      @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.08); opacity: .85 } }
      @keyframes bounce { 0%,60%,100% { transform: translateY(0); opacity: .5 } 30% { transform: translateY(-5px); opacity: 1 } }
      @keyframes slideUp { from { transform: translateY(100%) } to { transform: none } }
      *::-webkit-scrollbar { display: none }
      input::placeholder { color: ${t.faint} }
    `}</style>
  );
}
