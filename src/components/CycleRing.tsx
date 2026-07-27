import type { Theme } from "../theme";
import { PHASES } from "../data/cycle";
import type { CyclePhaseKey } from "../types";

/**
 * The four-phase cycle dial. Each phase is an arc; the active one thickens, and
 * a marker sits on today.
 */
export function CycleRing({
  t,
  dark,
  day,
  len,
  phaseKey,
  size = 200,
  stroke = 15,
}: {
  t: Theme;
  dark: boolean;
  day: number;
  len: number;
  phaseKey: CyclePhaseKey;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const ovulation = len - 14;
  const shade = dark ? "cd" : "c";

  const segments: { k: CyclePhaseKey; a: number; b: number }[] = [
    { k: "menstrual", a: 0, b: 5 },
    { k: "follicular", a: 5, b: ovulation - 1 },
    { k: "ovulation", a: ovulation - 1, b: ovulation + 1 },
    { k: "luteal", a: ovulation + 1, b: len },
  ];

  const point = (fraction: number) => {
    const angle = ((fraction * 360 - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const arc = (fromDay: number, toDay: number) => {
    const gap = 3.2;
    const large = (toDay - fromDay) / len > 0.5 ? 1 : 0;
    const start = point(fromDay / len + gap / 360);
    const end = point(toDay / len - gap / 360);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  };

  const marker = point((day - 0.5) / len);
  const phase = PHASES[phaseKey];

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        {segments.map((s) => (
          <path
            key={s.k}
            d={arc(s.a, s.b)}
            fill="none"
            stroke={PHASES[s.k][shade]}
            strokeWidth={s.k === phaseKey ? stroke + 3 : stroke}
            strokeLinecap="round"
            opacity={s.k === phaseKey ? 1 : 0.4}
          />
        ))}
        <circle cx={marker.x} cy={marker.y} r={9} fill={dark ? "#0B0C0E" : "#fff"} stroke={phase[shade]} strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 650,
              letterSpacing: ".06em",
              color: t.sub,
              textTransform: "uppercase",
            }}
          >
            Day {day}
          </div>
          <div style={{ fontSize: 26, fontWeight: 750, color: t.ink, lineHeight: 1.1, margin: "2px 0" }}>{phase.name}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: phase[shade] }}>{phase.tab}</div>
        </div>
      </div>
    </div>
  );
}
