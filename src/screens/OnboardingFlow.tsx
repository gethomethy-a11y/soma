import { useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft, Info, ShieldCheck, Sparkles } from "lucide-react";
import { FONT, type Theme } from "../theme";
import { Chip, chipWrap } from "../components/Chip";
import { SomaMark } from "../components/SomaMark";
import { BuildingProfile } from "./BuildingProfile";
import type { Profile, Sex } from "../types";

const ACTIVITY = ["Sedentary", "Light", "Moderate", "Very active"];
const GOALS = [
  "Lower my cortisol",
  "Balance my hormones",
  "Steadier energy",
  "Better sleep",
  "Clearer skin",
  "Support testosterone",
  "Ease PMS",
  "Fewer cravings",
];
const DIETS = ["Omnivore", "Mediterranean", "Vegetarian", "Vegan", "Low-carb", "Pescatarian"];
const SLEEP_QUALITY = ["Poor", "Fair", "Good", "Great"];
const SEXES: Sex[] = ["Female", "Male", "Intersex", "Prefer not to say"];

const EMPTY: Profile = {
  name: "",
  age: 29,
  sex: "",
  daysSince: 8,
  cycleLength: 28,
  regular: "",
  activity: "",
  goals: [],
  sleep: "",
  stress: 5,
  diet: "",
};

/**
 * The first thing a new user sees — always. There is no demo or skip state:
 * the app has nothing to show until it knows who it's talking to.
 */
export function OnboardingFlow({ t, dark, onDone }: { t: Theme; dark: boolean; onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Profile>(EMPTY);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const toggleGoal = (goal: string) =>
    setAnswers((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
    }));

  const cycling = answers.sex === "Female";
  const steps = buildSteps({ t, answers, set, toggleGoal, cycling });

  if (step >= steps.length) {
    return <BuildingProfile t={t} dark={dark} profile={answers} onDone={() => onDone(answers)} />;
  }

  const current = steps[step];

  return (
    <div style={{ minHeight: "100%", background: t.bg, display: "flex", flexDirection: "column", fontFamily: FONT }}>
      <div style={{ padding: "20px 18px 0" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 3,
                background: i <= step ? t.sage : t.line,
                transition: "background .4s",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: "22px 22px 12px", overflowY: "auto" }}>{current.render}</div>

      <div
        style={{
          padding: "12px 18px 26px",
          display: "flex",
          gap: 12,
          borderTop: `1px solid ${t.line}`,
          background: t.bg,
        }}
      >
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              width: 52,
              borderRadius: 16,
              border: `1.5px solid ${t.line}`,
              background: t.card,
              color: t.ink,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <button
          disabled={!current.valid}
          onClick={() => setStep(step + 1)}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 16,
            border: "none",
            cursor: current.valid ? "pointer" : "default",
            background: current.valid ? t.ink : t.line,
            color: current.valid ? t.bg : t.faint,
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 650,
            transition: "all .2s",
          }}
        >
          {step === 0 ? "Get started" : step === steps.length - 1 ? "Build my profile" : "Continue"}
        </button>
      </div>
    </div>
  );
}

type Step = { valid: boolean; render: ReactNode };

function buildSteps({
  t,
  answers,
  set,
  toggleGoal,
  cycling,
}: {
  t: Theme;
  answers: Profile;
  set: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  toggleGoal: (goal: string) => void;
  cycling: boolean;
}): Step[] {
  const H = ({ children, s }: { children: ReactNode; s?: string }) => (
    <>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 750,
          letterSpacing: "-.02em",
          color: t.ink,
          margin: "8px 0 6px",
          lineHeight: 1.22,
        }}
      >
        {children}
      </h1>
      {s && <p style={{ fontSize: 15.5, color: t.sub, margin: "0 0 24px", lineHeight: 1.5 }}>{s}</p>}
    </>
  );

  const input: CSSProperties = {
    width: "100%",
    fontFamily: FONT,
    fontSize: 17,
    padding: "15px 16px",
    borderRadius: 15,
    border: `1.5px solid ${t.line}`,
    background: t.card2,
    color: t.ink,
    outline: "none",
    boxSizing: "border-box",
  };

  const Slider = ({
    value,
    onChange,
    min,
    max,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    label: string;
  }) => (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: t.sage }}
      />
      <div style={{ textAlign: "center", fontSize: 32, fontWeight: 750, color: t.sage, marginTop: 8 }}>
        {value}
        <span style={{ fontSize: 15, color: t.sub, fontWeight: 600 }}>{label}</span>
      </div>
    </div>
  );

  const steps: Step[] = [];

  steps.push({
    valid: true,
    render: (
      <div style={{ textAlign: "center", marginTop: 34 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            margin: "0 auto 22px",
            display: "grid",
            placeItems: "center",
            background: `linear-gradient(150deg, ${t.sage}, ${t.blue})`,
            boxShadow: t.shadowLg,
          }}
        >
          <SomaMark size={42} />
        </div>
        <H s="Cortisol, estrogen, testosterone, insulin — the hormones everyone's talking about. SOMA reads yours and cuts through the noise with what's actually true.">
          Meet SOMA
        </H>
        <div style={{ display: "grid", gap: 12, textAlign: "left", marginTop: 6 }}>
          {(
            [
              ["The science behind the trends", "Every viral claim, checked against real research.", ShieldCheck],
              ["Personal to your body", "Read against your cycle, sleep and stress.", Sparkles],
              ["Plain, not preachy", "What's happening, why, and what actually helps.", Info],
            ] as const
          ).map(([title, sub, Icon]) => (
            <div key={title} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: t.sageSoft,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={t.sage} />
              </div>
              <div>
                <div style={{ fontWeight: 650, color: t.ink, fontSize: 15 }}>{title}</div>
                <div style={{ color: t.sub, fontSize: 13.5, lineHeight: 1.45 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: t.faint, lineHeight: 1.5, marginTop: 22, textAlign: "left" }}>
          SOMA is educational and does not diagnose. For medical concerns, speak to a licensed clinician.
        </p>
      </div>
    ),
  });

  steps.push({
    valid: answers.name.trim().length > 0,
    render: (
      <>
        <H s="Your coach speaks with you, not at you.">What should we call you?</H>
        <input
          autoFocus
          style={input}
          placeholder="First name"
          value={answers.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </>
    ),
  });

  steps.push({
    valid: true,
    render: (
      <>
        <H s="This sets your baselines.">How old are you?</H>
        <Slider value={answers.age} onChange={(v) => set("age", v)} min={16} max={85} label=" years" />
      </>
    ),
  });

  steps.push({
    valid: !!answers.sex,
    render: (
      <>
        <H s="Everyone has all these hormones — the balance differs. Female unlocks the full cycle view.">
          Sex assigned at birth
        </H>
        <div style={chipWrap}>
          {SEXES.map((s) => (
            <Chip key={s} t={t} active={answers.sex === s} onClick={() => set("sex", s)}>
              {s}
            </Chip>
          ))}
        </div>
      </>
    ),
  });

  if (cycling) {
    steps.push({
      valid: !!answers.regular,
      render: (
        <>
          <H s="Roughly is fine — SOMA refines it as you go, or once you connect Apple Health.">Let's find your cycle</H>
          <div style={{ fontSize: 13, color: t.sub, marginBottom: 6, fontWeight: 600 }}>
            Your last period started · {answers.daysSince} days ago
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={answers.daysSince}
            onChange={(e) => set("daysSince", Number(e.target.value))}
            style={{ width: "100%", accentColor: t.sage }}
          />
          <div style={{ fontSize: 13, color: t.sub, margin: "18px 0 6px", fontWeight: 600 }}>
            Usual cycle length · {answers.cycleLength} days
          </div>
          <input
            type="range"
            min={21}
            max={40}
            value={answers.cycleLength}
            onChange={(e) => set("cycleLength", Number(e.target.value))}
            style={{ width: "100%", accentColor: t.sage }}
          />
          <div style={{ fontSize: 13, color: t.sub, margin: "20px 0 8px", fontWeight: 600 }}>Is it regular?</div>
          <div style={chipWrap}>
            {(["Regular", "Irregular", "Not sure"] as const).map((r) => (
              <Chip key={r} t={t} active={answers.regular === r} onClick={() => set("regular", r)}>
                {r}
              </Chip>
            ))}
          </div>
        </>
      ),
    });
  }

  steps.push({
    valid: !!answers.activity,
    render: (
      <>
        <H s="How active is a normal week?">Activity level</H>
        <div style={chipWrap}>
          {ACTIVITY.map((a) => (
            <Chip key={a} t={t} active={answers.activity === a} onClick={() => set("activity", a)} full>
              {a}
            </Chip>
          ))}
        </div>
      </>
    ),
  });

  steps.push({
    valid: answers.goals.length > 0,
    render: (
      <>
        <H s="Pick as many as feel true. This shapes your daily guidance.">What are you working on?</H>
        <div style={chipWrap}>
          {GOALS.map((g) => (
            <Chip key={g} t={t} active={answers.goals.includes(g)} onClick={() => toggleGoal(g)}>
              {g}
            </Chip>
          ))}
        </div>
      </>
    ),
  });

  steps.push({
    valid: !!answers.sleep,
    render: (
      <>
        <H s="Sleep is the biggest lever on nearly every hormone.">How's your sleep lately?</H>
        <div style={chipWrap}>
          {SLEEP_QUALITY.map((s) => (
            <Chip key={s} t={t} active={answers.sleep === s} onClick={() => set("sleep", s)}>
              {s}
            </Chip>
          ))}
        </div>
      </>
    ),
  });

  steps.push({
    valid: true,
    render: (
      <>
        <H s="1 is calm, 10 is running hot. This drives your cortisol.">Your typical stress</H>
        <Slider value={answers.stress} onChange={(v) => set("stress", v)} min={1} max={10} label=" / 10" />
      </>
    ),
  });

  steps.push({
    valid: !!answers.diet,
    render: (
      <>
        <H s="Food is one of the fastest ways to move your hormones.">Your diet</H>
        <div style={chipWrap}>
          {DIETS.map((d) => (
            <Chip key={d} t={t} active={answers.diet === d} onClick={() => set("diet", d)}>
              {d}
            </Chip>
          ))}
        </div>
      </>
    ),
  });

  return steps;
}
