import type { ReactNode } from "react";
import { RADIUS, type Theme } from "../theme";

/**
 * Modal sheet that rises from the bottom of the phone shell. Tapping the
 * scrim closes it; taps inside are contained.
 */
export function BottomSheet({
  t,
  onClose,
  children,
  zIndex = 60,
  maxHeight = "90%",
  pad = "16px 22px 30px",
  scroll = true,
}: {
  t: Theme;
  onClose: () => void;
  children: ReactNode;
  zIndex?: number;
  maxHeight?: string;
  pad?: string;
  scroll?: boolean;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        alignItems: "flex-end",
        zIndex,
        animation: "fade .25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight,
          overflowY: scroll ? "auto" : "visible",
          background: t.bg,
          borderRadius: `${RADIUS.sheet}px ${RADIUS.sheet}px 0 0`,
          padding: pad,
          animation: "slideUp .3s cubic-bezier(.22,1,.36,1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ width: 38, height: 5, borderRadius: 3, background: t.line, margin: "0 auto 16px", flexShrink: 0 }} />
        {children}
      </div>
    </div>
  );
}
