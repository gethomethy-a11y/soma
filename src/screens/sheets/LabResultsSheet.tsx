import { useMemo, useState } from "react";
import { FlaskConical, Heart } from "lucide-react";
import { FONT, type Theme } from "../../theme";
import { BottomSheet } from "../../components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "../../components/Button";
import { DisclaimerNote } from "../../components/Disclaimer";
import { bandFor, labMarkers } from "../../data/labs";
import type { Profile } from "../../types";

/**
 * Optional manual entry of real bloodwork. Values are shown against a typical
 * range and nothing more — no interpretation, no scoring, no diagnosis.
 */
export function LabResultsSheet({
  t,
  dark,
  profile,
  onClose,
  onConnect,
  goCoach,
}: {
  t: Theme;
  dark: boolean;
  profile: Profile | null;
  onClose: () => void;
  onConnect: () => void;
  goCoach: () => void;
}) {
  const markers = useMemo(() => labMarkers(profile), [profile]);
  const [values, setValues] = useState<Record<string, string>>({});
  const entered = Object.values(values).filter((v) => v !== "").length;

  return (
    <BottomSheet t={t} onClose={onClose} zIndex={60} maxHeight="90%">
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: t.sageSoft,
          display: "grid",
          placeItems: "center",
          margin: "0 auto 12px",
        }}
      >
        <FlaskConical size={25} color={t.sage} />
      </div>
      <div style={{ textAlign: "center", fontSize: 20, fontWeight: 750, color: t.ink }}>Already had a blood test?</div>
      <div style={{ textAlign: "center", fontSize: 14, color: t.sub, margin: "6px 10px 18px", lineHeight: 1.5 }}>
        Most people never need this — SOMA estimates your hormones on its own. But if you've had bloodwork, add it here
        for extra precision.
      </div>

      <SecondaryButton
        t={t}
        onClick={() => {
          onClose();
          onConnect();
        }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}
      >
        <Heart size={17} color={t.sage} /> Import from Apple Health
      </SecondaryButton>
      <div style={{ textAlign: "center", fontSize: 12.5, color: t.faint, margin: "4px 0 16px" }}>
        or enter them manually
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {markers.map((marker) => {
          const band = bandFor(values[marker.key] ?? "", marker, dark, t.sage, t.sageSoft);
          return (
            <div key={marker.key} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 15, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 650, color: t.ink }}>{marker.name}</div>
                  <div style={{ fontSize: 12, color: t.sub }}>
                    Typical {marker.low}–{marker.high} {marker.unit}
                    {marker.note ? ` · ${marker.note}` : ""}
                  </div>
                </div>
                <input
                  inputMode="decimal"
                  value={values[marker.key] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [marker.key]: e.target.value.replace(/[^0-9.]/g, "") }))
                  }
                  placeholder="—"
                  style={{
                    width: 72,
                    textAlign: "center",
                    fontFamily: FONT,
                    fontSize: 15,
                    padding: "9px 8px",
                    borderRadius: 11,
                    border: `1.5px solid ${t.line}`,
                    background: t.card2,
                    color: t.ink,
                    outline: "none",
                  }}
                />
              </div>
              {band && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 9,
                    padding: "5px 11px",
                    borderRadius: 20,
                    background: band.bg,
                    color: band.color,
                    fontSize: 12.5,
                    fontWeight: 650,
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: 7, background: band.color }} />
                  {band.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DisclaimerNote t={t}>
        Typical adult ranges — they vary by lab, age and sex. This is educational, not a diagnosis. Your doctor's
        interpretation is what counts.
      </DisclaimerNote>

      <PrimaryButton
        t={t}
        disabled={entered === 0}
        onClick={() => {
          onClose();
          goCoach();
        }}
      >
        {entered ? "Save & discuss with coach" : "Enter a value to continue"}
      </PrimaryButton>
    </BottomSheet>
  );
}
