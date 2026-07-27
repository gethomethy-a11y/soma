import type { CSSProperties, ReactNode } from "react";
import { RADIUS, type Theme } from "../theme";

type CardProps = {
  t: Theme;
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  pad?: number;
};

/** The one surface every screen is built from. */
export function Card({ t, children, style, onClick, pad = 18 }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: t.card,
        borderRadius: RADIUS.card,
        padding: pad,
        boxShadow: t.shadow,
        border: `1px solid ${t.line}`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Scrollable screen body. The bottom padding clears the tab bar. */
export function Screen({ children }: { children: ReactNode }) {
  return <div style={{ padding: "0 18px 120px", animation: "fade .5s ease both" }}>{children}</div>;
}

/** Uppercase section label, with optional right-hand action. */
export function Eyebrow({ t, children, right }: { t: Theme; children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "26px 2px 12px" }}>
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 650,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: t.sub,
        }}
      >
        {children}
      </span>
      {right}
    </div>
  );
}

/** Big screen title, e.g. "Your hormones". */
export function ScreenTitle({ t, children, sub }: { t: Theme; children: ReactNode; sub?: string }) {
  return (
    <>
      <div style={{ paddingTop: 8, fontSize: 28, fontWeight: 750, color: t.ink, letterSpacing: "-.02em" }}>{children}</div>
      {sub && <div style={{ fontSize: 14, color: t.sub, marginTop: 4, lineHeight: 1.5 }}>{sub}</div>}
    </>
  );
}
