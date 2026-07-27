import { useEffect, useState, type ReactNode } from "react";

type Props = {
  /** 0–100. */
  value: number;
  size?: number;
  stroke?: number;
  color: string;
  track: string;
  /** Stagger the fill animation, in ms. */
  delay?: number;
  children?: ReactNode;
};

/**
 * Animated progress ring. Starts at zero and eases to `value` on mount so the
 * number always feels earned rather than pre-filled.
 */
export function Ring({ value, size = 132, stroke = 12, color, track, delay = 0, children }: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [p, setP] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setP(value), delay + 60);
    return () => clearTimeout(id);
  }, [value, delay]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (p / 100) * circ}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
    </div>
  );
}

/** The same ring at strip/list scale. */
export function MiniRing({ value, size = 52, stroke = 6, color, track, delay = 0, children }: Props) {
  return <Ring value={value} size={size} stroke={stroke} color={color} track={track} delay={delay}>{children}</Ring>;
}

/** Empty-state stand-in for the score ring, before any scan exists. */
export function EmptyRing({ size = 108, stroke = 11, track, ink }: { size?: number; stroke?: number; track: string; ink: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        border: `${stroke}px solid ${track}`,
        display: "grid",
        placeItems: "center",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 800, color: ink }}>?</span>
    </div>
  );
}
