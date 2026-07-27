import type { Profile } from "../types";

export type LabMarker = {
  key: string;
  name: string;
  unit: string;
  low: number;
  high: number;
  note?: string;
};

/**
 * Optional manual entry for real bloodwork. Ranges are typical adult reference
 * ranges and vary by lab, age and sex — the sheet says so, and nothing here is
 * presented as an interpretation.
 */
export function labMarkers(profile: Profile | null): LabMarker[] {
  const male = profile?.sex === "Male";
  return [
    { key: "cortisol", name: "Cortisol (morning)", unit: "µg/dL", low: 6, high: 23 },
    {
      key: "testosterone",
      name: "Testosterone",
      unit: "ng/dL",
      low: male ? 300 : 15,
      high: male ? 900 : 70,
    },
    { key: "estradiol", name: "Estradiol", unit: "pg/mL", low: 30, high: 400, note: "varies across your cycle" },
    { key: "tsh", name: "TSH (thyroid)", unit: "mIU/L", low: 0.4, high: 4 },
    { key: "vitd", name: "Vitamin D", unit: "ng/mL", low: 30, high: 50 },
    { key: "ferritin", name: "Ferritin (iron)", unit: "ng/mL", low: 30, high: 200 },
  ];
}

export type Band = { label: string; color: string; bg: string };

/** Where an entered value sits against the typical range. */
export function bandFor(
  raw: string,
  marker: LabMarker,
  dark: boolean,
  sage: string,
  sageSoft: string
): Band | null {
  const n = parseFloat(raw);
  if (raw === "" || Number.isNaN(n)) return null;
  if (n < marker.low) return { label: "Below range", color: "#6E8FC9", bg: dark ? "#182430" : "#E9F0F8" };
  if (n > marker.high) return { label: "Above range", color: "#D98A5A", bg: dark ? "#2A2016" : "#FBEDE2" };
  return { label: "In range", color: sage, bg: sageSoft };
}
