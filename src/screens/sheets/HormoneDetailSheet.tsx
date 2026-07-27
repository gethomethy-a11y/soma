import { Check, Droplet, X } from "lucide-react";
import type { Theme } from "../../theme";
import { BottomSheet } from "../../components/BottomSheet";
import { PrimaryButton, QuietButton } from "../../components/Button";
import { accentOf, tintOf } from "../../data/hormones";
import type { HormoneKey, HormoneReading } from "../../types";

/** Role, how it shows up, myth vs fact (the shareable bit), and the levers. */
export function HormoneDetailSheet({
  t,
  dark,
  hormone,
  onClose,
  onCheck,
  goCoach,
}: {
  t: Theme;
  dark: boolean;
  hormone: HormoneReading;
  onClose: () => void;
  onCheck: (key: HormoneKey) => void;
  goCoach: () => void;
}) {
  const accent = accentOf(hormone, dark);

  const label = (text: string, color = t.sub) => (
    <div
      style={{
        fontSize: 12.5,
        fontWeight: 650,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color,
        marginBottom: 8,
      }}
    >
      {text}
    </div>
  );

  return (
    <BottomSheet t={t} onClose={onClose} zIndex={50} maxHeight="88%" pad="16px 22px 30px">
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: tintOf(hormone, dark),
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Droplet size={24} color={accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 21, fontWeight: 750, color: t.ink }}>{hormone.name}</div>
          <div style={{ fontSize: 13, color: t.sub }}>{hormone.tag}</div>
        </div>
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 650,
            color: accent,
            background: tintOf(hormone, dark),
            padding: "6px 12px",
            borderRadius: 20,
          }}
        >
          {hormone.status}
        </span>
      </div>

      <p style={{ fontSize: 15, color: t.ink, lineHeight: 1.55, margin: "0 0 16px" }}>{hormone.role}</p>

      {label("How it shows up")}
      <p style={{ fontSize: 14.5, color: t.ink, lineHeight: 1.55, margin: "0 0 18px" }}>{hormone.shows}</p>

      {label("Myth check", accent)}
      <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            background: t.card,
            border: `1px solid ${t.line}`,
            borderRadius: 14,
            padding: "13px 14px",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: "#E7A2A2",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <X size={13} color="#fff" strokeWidth={3} />
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: ".04em" }}>
              Myth
            </span>
            <div style={{ fontSize: 14, color: t.ink, lineHeight: 1.5 }}>{hormone.myth}</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            background: t.card,
            border: `1px solid ${t.line}`,
            borderRadius: 14,
            padding: "13px 14px",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: t.sage,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <Check size={13} color="#fff" strokeWidth={3} />
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.sage, textTransform: "uppercase", letterSpacing: ".04em" }}>
              What's true
            </span>
            <div style={{ fontSize: 14, color: t.ink, lineHeight: 1.5 }}>{hormone.fact}</div>
          </div>
        </div>
      </div>

      {label("What actually moves it")}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {hormone.levers.map((lever) => (
          <span
            key={lever.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 14px",
              borderRadius: 14,
              background: t.card,
              border: `1px solid ${t.line}`,
              fontSize: 13.5,
              fontWeight: 600,
              color: t.ink,
            }}
          >
            <lever.Icon size={16} color={accent} />
            {lever.label}
          </span>
        ))}
      </div>

      <p style={{ fontSize: 11.5, color: t.faint, lineHeight: 1.5, margin: "0 0 16px" }}>
        {hormone.fromPhase
          ? "Estimated from where you are in your cycle. Educational, not a diagnosis."
          : "A symptom estimate — educational, not a diagnosis."}
      </p>

      <PrimaryButton
        t={t}
        onClick={() => {
          onClose();
          onCheck(hormone.key);
        }}
      >
        Scan your {hormone.name}
      </PrimaryButton>
      <QuietButton
        t={t}
        onClick={() => {
          onClose();
          goCoach();
        }}
        style={{ marginTop: 8 }}
      >
        Ask the coach about {hormone.name}
      </QuietButton>
    </BottomSheet>
  );
}
