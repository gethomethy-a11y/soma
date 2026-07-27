import { Info, ShieldCheck } from "lucide-react";
import type { Theme } from "../theme";
import { Card } from "./Card";

/**
 * Every hormone and scan surface carries this. SOMA reads symptoms, not blood —
 * the language has to say so plainly, everywhere, without being asked.
 */

export const DISCLAIMER_SHORT =
  "A symptom estimate to guide you — educational, not a diagnosis. For real levels, a blood test is the only way to know.";

export const DISCLAIMER_LONG =
  "SOMA estimates these from your cycle, sleep, stress and symptoms — no blood test needed. Adding real labs is optional, just for extra precision. Educational, not a diagnosis.";

export const DISCLAIMER_LEGAL =
  "SOMA is educational and does not diagnose or treat medical conditions. Hormone readings are estimates, not lab results. For medical concerns, consult a licensed clinician.";

/** Inline footnote, for use directly under a result. */
export function DisclaimerNote({ t, children = DISCLAIMER_SHORT }: { t: Theme; children?: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "16px 2px" }}>
      <Info size={15} color={t.faint} style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ margin: 0, fontSize: 12, color: t.faint, lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

/** Card-level version, for the bottom of a tab. */
export function DisclaimerCard({ t, children = DISCLAIMER_LONG }: { t: Theme; children?: string }) {
  return (
    <Card t={t} style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
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
        <ShieldCheck size={19} color={t.sage} />
      </div>
      <p style={{ margin: 0, fontSize: 13.5, color: t.sub, lineHeight: 1.5 }}>{children}</p>
    </Card>
  );
}
