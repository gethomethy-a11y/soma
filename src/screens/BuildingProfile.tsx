import { useEffect, useMemo, useState } from "react";
import { FONT, type Theme } from "../theme";
import { Card } from "../components/Card";
import { Ring } from "../components/Ring";
import { CycleRing } from "../components/CycleRing";
import { SomaMark } from "../components/SomaMark";
import { cycleInfo, hasCycle } from "../data/cycle";
import type { Profile } from "../types";

/**
 * The beat between onboarding and Home: a short "reading your hormones" moment,
 * then a first look at what SOMA now knows — and an honest note that nothing is
 * estimated until the user runs a scan.
 */
export function BuildingProfile({
  t,
  dark,
  profile,
  onDone,
}: {
  t: Theme;
  dark: boolean;
  profile: Profile;
  onDone: () => void;
}) {
  const [done, setDone] = useState(false);
  const ci = useMemo(() => cycleInfo(profile), [profile]);
  const cycling = hasCycle(profile);

  useEffect(() => {
    const id = setTimeout(() => setDone(true), 2000);
    return () => clearTimeout(id);
  }, []);

  if (!done) {
    return (
      <div style={{ minHeight: "100%", background: t.bg, display: "grid", placeItems: "center", fontFamily: FONT }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              margin: "0 auto 20px",
              display: "grid",
              placeItems: "center",
              background: `linear-gradient(150deg, ${t.sage}, ${t.blue})`,
              animation: "pulse 1.4s ease-in-out infinite",
            }}
          >
            <SomaMark size={34} />
          </div>
          <div style={{ fontSize: 19, fontWeight: 650, color: t.ink }}>Reading your hormones</div>
          <div style={{ fontSize: 14.5, color: t.sub, marginTop: 6 }}>Building your picture…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: t.bg, fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 22px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 650, letterSpacing: ".1em", textTransform: "uppercase", color: t.sage }}>
          You're all set
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 750, color: t.ink, margin: "8px 0 22px", letterSpacing: "-.02em" }}>
          Nice to meet you, {profile.name}
        </h1>

        {cycling ? (
          <Card t={t} pad={22}>
            <div style={{ display: "grid", placeItems: "center" }}>
              <CycleRing t={t} dark={dark} day={ci.day} len={ci.len} phaseKey={ci.key} />
            </div>
            <div style={{ fontSize: 14.5, color: t.sub, lineHeight: 1.5, marginTop: 14 }}>{ci.phase.story}</div>
          </Card>
        ) : (
          <Card t={t} pad={22}>
            <div style={{ display: "grid", placeItems: "center" }}>
              <Ring value={72} color={t.sage} track={t.line}>
                <div>
                  <div style={{ fontSize: 40, fontWeight: 750, color: t.ink }}>72</div>
                  <div style={{ fontSize: 12, color: t.sub, fontWeight: 650 }}>BASELINE</div>
                </div>
              </Ring>
            </div>
            <div style={{ fontSize: 14.5, color: t.sub, marginTop: 12, lineHeight: 1.5 }}>
              SOMA will track your daily hormone rhythm — cortisol and testosterone peak in the morning, melatonin at
              night.
            </div>
          </Card>
        )}

        <Card t={t} style={{ textAlign: "left", marginTop: 14, display: "flex", gap: 13, alignItems: "flex-start" }}>
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
            <SomaMark size={24} color={t.sage} marker={t.sage} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.ink }}>Now run your first check</div>
            <div style={{ fontSize: 13.5, color: t.sub, lineHeight: 1.5, marginTop: 2 }}>
              Swipe through a 60-second check for each hormone to see where you stand. Nothing's estimated until you do.
            </div>
          </div>
        </Card>

        <Card t={t} style={{ textAlign: "left", marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: t.sub, marginBottom: 10 }}>Your focus</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {profile.goals.map((goal) => (
              <span
                key={goal}
                style={{
                  padding: "8px 13px",
                  borderRadius: 12,
                  background: t.sageSoft,
                  color: t.sage,
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                {goal}
              </span>
            ))}
          </div>
        </Card>

        <p style={{ fontSize: 11.5, color: t.faint, lineHeight: 1.5, marginTop: 18 }}>
          Readings are symptom estimates — educational, not a diagnosis.
        </p>
      </div>

      <div style={{ padding: "12px 18px 26px", background: t.bg }}>
        <button
          onClick={onDone}
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 16,
            border: "none",
            background: t.ink,
            color: t.bg,
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 650,
            cursor: "pointer",
          }}
        >
          Enter SOMA
        </button>
      </div>
    </div>
  );
}
