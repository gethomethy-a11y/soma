import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Check, ChevronRight, Crown, Flame, Heart, MessageCircle } from "lucide-react";
import { FONT, scoreColor, scoreHeadline, scoreWord, shareColor } from "../theme";
import { Card, Eyebrow, Screen } from "../components/Card";
import { EmptyRing, MiniRing, Ring } from "../components/Ring";
import { CycleRing } from "../components/CycleRing";
import { FEATURED_COPY, FEATURED_HORMONE, HORMONES, accentOf, tintOf } from "../data/hormones";
import { cycleEnergyCurve, cycleInfo, hasCycle } from "../data/cycle";
import { hormoneList } from "../lib/score";
import { useApp } from "../hooks/useApp";
import type { HormoneKey, HormoneReading, ShareData } from "../types";
import type { Theme } from "../theme";

type Props = {
  goCoach: () => void;
  goHormones: () => void;
  openHormone: (h: HormoneReading) => void;
  openCheck: (key: HormoneKey) => void;
  openConnect: () => void;
  openPaywall: () => void;
  openShare: (data: ShareData) => void;
};

export function HomeScreen({ goCoach, goHormones, openHormone, openCheck, openConnect, openPaywall, openShare }: Props) {
  const { t, dark, profile, scans, history, premium, streak, score, focus, toggleFocus, connected } = useApp();

  const ci = useMemo(() => cycleInfo(profile), [profile]);
  const list = useMemo(() => hormoneList(profile, scans), [profile, scans]);
  const curve = useMemo(() => cycleEnergyCurve(ci.len), [ci.len]);

  const cycling = hasCycle(profile);
  const phase = ci.phase;
  const phaseAccent = dark ? phase.cd : phase.c;
  const featured = HORMONES[FEATURED_HORMONE];
  const doneCount = focus.filter((f) => f.done).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Screen>
      <div style={{ paddingTop: 8, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 15, color: t.sub, fontWeight: 550 }}>{greeting},</div>
          <div style={{ fontSize: 28, fontWeight: 750, color: t.ink, letterSpacing: "-.02em" }}>
            {profile?.name || "there"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: t.card,
            border: `1px solid ${t.line}`,
            borderRadius: 20,
            padding: "7px 13px",
            boxShadow: t.shadow,
          }}
        >
          <Flame size={16} color="#E08A46" />
          <span style={{ fontSize: 13.5, fontWeight: 750, color: t.ink }}>{streak}</span>
          <span style={{ fontSize: 12, color: t.sub, fontWeight: 600 }}>day{streak === 1 ? "" : "s"}</span>
        </div>
      </div>

      {/* The one shareable number. Null until the first scan — never invented. */}
      <Card t={t} pad={20} style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 18 }}>
        {score != null ? (
          <>
            <Ring value={score} size={108} stroke={11} color={scoreColor(score, t)} track={t.line}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: t.ink, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 10.5, color: t.sub, fontWeight: 700, letterSpacing: ".05em" }}>SCORE</div>
              </div>
            </Ring>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16.5, fontWeight: 750, color: t.ink, lineHeight: 1.25 }}>{scoreHeadline(score)}</div>
              <div style={{ fontSize: 12.5, color: t.sub, marginTop: 4 }}>From your scans · not a diagnosis</div>
              <button
                onClick={() =>
                  openShare({ label: "hormone", score, status: scoreWord(score), color: shareColor(score) })
                }
                style={{
                  marginTop: 10,
                  padding: "9px 16px",
                  borderRadius: 13,
                  border: "none",
                  background: t.ink,
                  color: t.bg,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Share my score
              </button>
            </div>
          </>
        ) : (
          <>
            <EmptyRing track={t.line} ink={t.faint} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16.5, fontWeight: 750, color: t.ink, lineHeight: 1.25 }}>
                What's your hormone score?
              </div>
              <div style={{ fontSize: 13, color: t.sub, marginTop: 4, lineHeight: 1.45 }}>
                Run your first 60-second scan to find out.
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Trends — the premium payoff. */}
      <Card t={t} onClick={premium ? undefined : openPaywall} style={{ marginTop: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14.5, fontWeight: 750, color: t.ink }}>Your score over time</span>
          {!premium && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 750,
                color: "#E7B569",
                background: dark ? "#2A2214" : "#FBF0DE",
                padding: "5px 11px",
                borderRadius: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Crown size={12} /> PREMIUM
            </span>
          )}
        </div>
        {premium ? (
          history.length >= 2 ? (
            <div style={{ height: 74, marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.sage} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={t.sage} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: t.sub }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[20, 100]} />
                  <Area type="monotone" dataKey="v" stroke={t.sage} strokeWidth={2.4} fill="url(#scoreTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: t.sub, marginTop: 8, lineHeight: 1.45 }}>
              Tracking started — scan again tomorrow and your trend line begins.
            </div>
          )
        ) : (
          <div style={{ fontSize: 13, color: t.sub, marginTop: 8, lineHeight: 1.45 }}>
            See whether you're actually improving week over week.
          </div>
        )}
      </Card>

      {/* The viral hook, up top. */}
      <Eyebrow
        t={t}
        right={
          <span onClick={goHormones} style={{ fontSize: 13, color: t.sage, fontWeight: 650, cursor: "pointer" }}>
            See all
          </span>
        }
      >
        Your hormones today
      </Eyebrow>
      <HormoneStrip t={t} dark={dark} list={list} onOpen={openHormone} />

      <Card
        t={t}
        onClick={() => openCheck(FEATURED_HORMONE)}
        style={{ marginTop: 14, background: tintOf(featured, dark), border: `1px solid ${t.line}` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: ".06em",
              color: accentOf(featured, dark),
              textTransform: "uppercase",
            }}
          >
            {FEATURED_COPY.eyebrow}
          </span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 750, color: t.ink, lineHeight: 1.3, marginBottom: 6 }}>
          {FEATURED_COPY.title}
        </div>
        <p style={{ fontSize: 14, color: t.ink, lineHeight: 1.5, margin: 0, opacity: 0.85 }}>{FEATURED_COPY.body}</p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            marginTop: 12,
            fontSize: 13.5,
            fontWeight: 650,
            color: accentOf(featured, dark),
          }}
        >
          Start the scan <ChevronRight size={16} />
        </div>
      </Card>

      {cycling && (
        <>
          <Eyebrow t={t}>Where your cycle sits</Eyebrow>
          <Card
            t={t}
            pad={22}
            style={{ textAlign: "center", background: dark ? phase.softD : phase.soft, border: `1px solid ${t.line}` }}
          >
            <div style={{ display: "grid", placeItems: "center" }}>
              <CycleRing t={t} dark={dark} day={ci.day} len={ci.len} phaseKey={ci.key} />
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: t.card,
                borderRadius: 20,
                padding: "6px 13px",
                marginTop: 16,
                boxShadow: t.shadow,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 8, background: phaseAccent }} />
              <span style={{ fontSize: 13, fontWeight: 650, color: t.ink }}>{phase.hormone}</span>
            </div>
            <p style={{ fontSize: 14.5, color: t.ink, lineHeight: 1.55, margin: "14px 4px 0", opacity: 0.9 }}>
              {phase.story}
            </p>
          </Card>
        </>
      )}

      <Eyebrow t={t}>How you'll likely feel</Eyebrow>
      <FeelRow t={t} feel={phase.feel} accent={cycling ? phaseAccent : t.sage} />

      <Eyebrow
        t={t}
        right={
          <span style={{ fontSize: 13, color: t.sage, fontWeight: 650 }}>
            {doneCount}/{focus.length} done
          </span>
        }
      >
        Today's focus
      </Eyebrow>
      <Card t={t} pad={6}>
        {focus.map((action, i) => (
          <div
            key={action.t}
            onClick={() => toggleFocus(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "13px 12px",
              cursor: "pointer",
              borderBottom: i < focus.length - 1 ? `1px solid ${t.line}` : "none",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 9,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                background: action.done ? t.sage : "transparent",
                border: `1.5px solid ${action.done ? t.sage : t.line}`,
                transition: "all .2s",
              }}
            >
              {action.done && <Check size={16} color="#fff" strokeWidth={3} />}
            </div>
            <action.Icon size={19} color={t.sub} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: action.done ? t.faint : t.ink,
                  textDecoration: action.done ? "line-through" : "none",
                }}
              >
                {action.t}
              </div>
              <div style={{ fontSize: 12.5, color: t.sub }}>{action.n}</div>
            </div>
          </div>
        ))}
      </Card>

      {cycling && (
        <>
          <Eyebrow t={t} right={<span style={{ fontSize: 12.5, color: t.sub, fontWeight: 600 }}>You are here</span>}>
            Energy across your cycle
          </Eyebrow>
          <Card t={t}>
            <div style={{ height: 96 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cycleCurve" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={phaseAccent} stopOpacity={0.34} />
                      <stop offset="100%" stopColor={phaseAccent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="d"
                    ticks={[1, 7, 14, 21, ci.len]}
                    tick={{ fontSize: 10, fill: t.sub }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={[20, 100]} />
                  <Tooltip content={<ChartTooltip t={t} />} cursor={false} />
                  <Area type="monotone" dataKey="v" stroke={phaseAccent} strokeWidth={2.6} fill="url(#cycleCurve)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 13, color: t.sub, lineHeight: 1.5, marginTop: 6, textAlign: "center" }}>
              Estrogen lifts energy to ovulation, then eases toward your period. Plan the hard stuff for the peak.
            </div>
          </Card>
        </>
      )}

      {!connected && (
        <Card t={t} onClick={openConnect} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 13 }}>
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
            <Heart size={20} color={t.sage} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: t.ink }}>Connect Apple Health</div>
            <div style={{ fontSize: 13, color: t.sub }}>Sharpen your hormone picture automatically</div>
          </div>
          <ChevronRight size={20} color={t.faint} />
        </Card>
      )}

      <Card
        t={t}
        onClick={goCoach}
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: `linear-gradient(135deg, ${t.sage}, ${t.blue})`,
          border: "none",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "rgba(255,255,255,.2)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <MessageCircle size={22} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "#fff" }}>Ask about your hormones</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)" }}>Real answers, no TikTok myths.</div>
        </div>
        <ChevronRight size={22} color="#fff" />
      </Card>

      <p style={{ fontSize: 11.5, color: t.faint, lineHeight: 1.5, textAlign: "center", margin: "18px 8px 0" }}>
        Hormone readings are symptom estimates — educational, not a diagnosis.
      </p>
    </Screen>
  );
}

/** Horizontal strip of all six hormones, each with a mini ring. */
function HormoneStrip({
  t,
  dark,
  list,
  onOpen,
}: {
  t: Theme;
  dark: boolean;
  list: HormoneReading[];
  onOpen: (h: HormoneReading) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 11,
        overflowX: "auto",
        margin: "0 -18px",
        padding: "2px 18px 6px",
        scrollbarWidth: "none",
      }}
    >
      {list.map((h, i) => (
        <Card key={h.key} t={t} pad={15} onClick={() => onOpen(h)} style={{ minWidth: 138, maxWidth: 138 }}>
          <MiniRing
            value={h.level ?? 0}
            color={h.checked ? accentOf(h, dark) : t.line}
            track={t.line}
            delay={i * 80}
          >
            <span style={{ fontSize: 15, fontWeight: 750, color: h.checked ? t.ink : t.faint }}>{h.level ?? "—"}</span>
          </MiniRing>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.ink, marginTop: 11 }}>{h.name}</div>
          <div style={{ fontSize: 12.5, color: h.checked ? accentOf(h, dark) : t.faint, fontWeight: 600, marginTop: 2 }}>
            {h.status}
          </div>
          <div style={{ fontSize: 11.5, color: t.sub, marginTop: 1 }}>{h.tag}</div>
        </Card>
      ))}
    </div>
  );
}

/** Energy / sleep / stress / mood tiles for the current phase. */
function FeelRow({
  t,
  feel,
  accent,
}: {
  t: Theme;
  feel: { energy: [string, number]; sleep: [string, number]; stress: [string, number]; mood: [string, number] };
  accent: string;
}) {
  const items: [string, [string, number]][] = [
    ["Energy", feel.energy],
    ["Sleep", feel.sleep],
    ["Stress", feel.stress],
    ["Mood", feel.mood],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {items.map(([label, [word, value]]) => (
        <div key={label} style={{ background: t.card2, borderRadius: 16, padding: "13px 14px" }}>
          <div style={{ fontSize: 12.5, color: t.sub, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: t.ink, margin: "3px 0 8px" }}>{word}</div>
          <div style={{ height: 5, borderRadius: 3, background: t.line, overflow: "hidden" }}>
            <div
              style={{
                width: `${value}%`,
                height: "100%",
                borderRadius: 3,
                background: accent,
                transition: "width 1s cubic-bezier(.22,1,.36,1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shared recharts tooltip. */
export function ChartTooltip({
  t,
  active,
  payload,
}: {
  t: Theme;
  active?: boolean;
  payload?: { value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: t.ink,
        color: t.bg,
        padding: "5px 9px",
        borderRadius: 9,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: FONT,
      }}
    >
      {payload[0].value}
    </div>
  );
}
