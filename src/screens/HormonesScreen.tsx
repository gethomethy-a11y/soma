import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronRight, Plus } from "lucide-react";
import { Card, Eyebrow, Screen, ScreenTitle } from "../components/Card";
import { MiniRing } from "../components/Ring";
import { DisclaimerCard } from "../components/Disclaimer";
import { ChartTooltip } from "./HomeScreen";
import { DAILY_RHYTHM, PHASES, cycleInfo, hasCycle, phaseForDay } from "../data/cycle";
import { accentOf } from "../data/hormones";
import { hormoneList } from "../lib/score";
import { useApp } from "../hooks/useApp";
import type { HormoneKey } from "../types";

export function HormonesScreen({
  openCheck,
  openLabs,
}: {
  openCheck: (key: HormoneKey) => void;
  openLabs: () => void;
}) {
  const { t, dark, profile, scans } = useApp();
  const ci = useMemo(() => cycleInfo(profile), [profile]);
  const list = useMemo(() => hormoneList(profile, scans), [profile, scans]);
  const cycling = hasCycle(profile);
  const shade = dark ? "cd" : "c";
  const timeline = Array.from({ length: ci.len }, (_, i) => i + 1);

  return (
    <Screen>
      <ScreenTitle t={t} sub="Tap any hormone for a 60-second scan.">
        Your hormones
      </ScreenTitle>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {list.map((h, i) => (
          <Card key={h.key} t={t} onClick={() => openCheck(h.key)} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <MiniRing
              value={h.level ?? 0}
              size={54}
              color={h.checked ? accentOf(h, dark) : t.line}
              track={t.line}
              delay={i * 70}
            >
              <span style={{ fontSize: 15, fontWeight: 750, color: h.checked ? t.ink : t.faint }}>{h.level ?? "—"}</span>
            </MiniRing>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.ink }}>{h.name}</div>
              <div style={{ fontSize: 13, color: t.sub, marginTop: 1 }}>{h.tag}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 650, color: h.checked ? accentOf(h, dark) : t.faint }}>
                {h.status}
              </div>
              <div style={{ fontSize: 11, color: h.checked ? t.sage : t.faint, fontWeight: 600, marginTop: 2 }}>
                {h.checked && !h.fromPhase ? "Scanned" : "Tap to scan"}
              </div>
            </div>
            <ChevronRight size={18} color={t.faint} />
          </Card>
        ))}
      </div>

      <Card
        t={t}
        onClick={openLabs}
        style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 13, borderStyle: "dashed" }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: t.sageSoft,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Plus size={20} color={t.sage} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: t.ink }}>Already had a blood test?</div>
          <div style={{ fontSize: 13, color: t.sub }}>Optional — SOMA estimates your hormones without one</div>
        </div>
        <ChevronRight size={20} color={t.faint} />
      </Card>

      {cycling ? (
        <>
          <Eyebrow
            t={t}
            right={
              <span style={{ fontSize: 13, fontWeight: 650, color: ci.phase[shade] }}>
                Day {ci.day} · {ci.phase.name}
              </span>
            }
          >
            Estrogen across the month
          </Eyebrow>
          <Card t={t}>
            <div style={{ display: "flex", gap: 2.5, alignItems: "flex-end", height: 44 }}>
              {timeline.map((d) => {
                const key = phaseForDay(d, ci.len);
                const isToday = d === ci.day;
                return (
                  <div
                    key={d}
                    style={{
                      flex: 1,
                      height: isToday ? "100%" : "62%",
                      borderRadius: 3,
                      background: PHASES[key][shade],
                      opacity: d <= ci.day ? 1 : 0.32,
                      position: "relative",
                    }}
                  >
                    {isToday && (
                      <span
                        style={{
                          position: "absolute",
                          top: -7,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 6,
                          height: 6,
                          borderRadius: 6,
                          background: t.ink,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              {Object.values(PHASES).map((p) => (
                <span
                  key={p.key}
                  style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: t.sub, fontWeight: 600 }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: 9, background: p[shade] }} />
                  {p.name}
                </span>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <>
          <Eyebrow t={t}>Your 24-hour rhythm</Eyebrow>
          <Card t={t}>
            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_RHYTHM} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rhythmFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.sage} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={t.sage} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="h" tick={{ fontSize: 10, fill: t.sub }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip t={t} />} cursor={false} />
                  <Area type="monotone" dataKey="cortisol" stroke={t.sage} strokeWidth={2.4} fill="url(#rhythmFill)" />
                  <Area
                    type="monotone"
                    dataKey="melatonin"
                    stroke={t.blue}
                    strokeWidth={2.4}
                    fill="none"
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 8, fontSize: 12.5, color: t.sub }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 3, background: t.sage, borderRadius: 2 }} />
                Cortisol
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 3, background: t.blue, borderRadius: 2 }} />
                Melatonin
              </span>
            </div>
          </Card>
        </>
      )}

      <DisclaimerCard t={t} />
    </Screen>
  );
}
