import type { ReactNode } from "react";
import { FONT, type Theme } from "../theme";

/** Selectable option chip — used across onboarding and Learn filters. */
export function Chip({
  t,
  active,
  children,
  onClick,
  full,
}: {
  t: Theme;
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  /** Take the whole row instead of sharing it. */
  full?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "13px 16px",
        borderRadius: 15,
        border: `1.5px solid ${active ? t.sage : t.line}`,
        background: active ? t.sageSoft : t.card,
        color: active ? t.sage : t.ink,
        fontFamily: FONT,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        flex: full ? "1 1 100%" : "1 1 44%",
        transition: "all .18s",
        textAlign: "left",
      }}
    >
      {children}
    </button>
  );
}

/** Compact filter pill, e.g. the Learn category row. */
export function FilterChip({ t, active, children, onClick }: { t: Theme; active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        whiteSpace: "nowrap",
        padding: "8px 15px",
        borderRadius: 20,
        border: `1px solid ${active ? t.ink : t.line}`,
        cursor: "pointer",
        background: active ? t.ink : t.card,
        color: active ? t.bg : t.sub,
        fontFamily: FONT,
        fontSize: 13.5,
        fontWeight: 650,
        transition: "all .18s",
      }}
    >
      {children}
    </button>
  );
}

export const chipWrap = { display: "flex", flexWrap: "wrap" as const, gap: 10 };
