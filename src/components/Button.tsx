import type { CSSProperties, ReactNode } from "react";
import { FONT, type Theme } from "../theme";

type Props = {
  t: Theme;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
};

/** Solid ink button — the single primary action on a screen or sheet. */
export function PrimaryButton({ t, children, onClick, disabled, style }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: 15,
        borderRadius: 15,
        border: "none",
        background: disabled ? t.line : t.ink,
        color: disabled ? t.faint : t.bg,
        fontFamily: FONT,
        fontSize: 15.5,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        transition: "all .2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Outlined secondary action. */
export function SecondaryButton({ t, children, onClick, style }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: 13,
        borderRadius: 15,
        border: `1.5px solid ${t.line}`,
        background: t.card,
        color: t.ink,
        fontFamily: FONT,
        fontSize: 14.5,
        fontWeight: 650,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Text-only dismissal, e.g. "Not now" / "Maybe later". */
export function QuietButton({ t, children, onClick, style }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 15,
        border: "none",
        background: "transparent",
        color: t.sub,
        fontFamily: FONT,
        fontSize: 14.5,
        fontWeight: 600,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** iOS-style switch. */
export function Toggle({ t, on, set }: { t: Theme; on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      onClick={() => set(!on)}
      style={{
        width: 48,
        height: 29,
        borderRadius: 15,
        border: "none",
        cursor: "pointer",
        background: on ? t.sage : t.line,
        position: "relative",
        transition: "background .25s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 22 : 3,
          width: 23,
          height: 23,
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.25)",
          transition: "left .25s cubic-bezier(.4,1.3,.6,1)",
        }}
      />
    </button>
  );
}
