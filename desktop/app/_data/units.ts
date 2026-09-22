/**
 * The quick unit converter (spec §10).
 *
 * Scope, deliberately narrow: this is the bench conversion a student wants
 * without opening anything — mg ↔ g ↔ kg, mL ↔ L, mg/mL ↔ g/L, mol ↔ mmol,
 * mm ↔ cm ↔ m, °C ↔ °F ↔ K, and the % ↔ molar conversion that needs a molar
 * mass. Anything deeper (ratio strengths, mEq, density-based weight/volume)
 * already has a full calculator of its own, and this page links to it rather
 * than growing a second, divergent implementation.
 *
 * The mass, volume and amount factors are IMPORTED from the shared calculator
 * kit, not retyped, so the converter and the 104 calculators can never disagree.
 *
 * Temperature is kept apart from the rest on purpose: it has an offset, so it
 * is not a multiplying factor and cannot live in the same table (see the
 * kit's own note — there is no unit conversion beyond mass/volume/amount there
 * for exactly this reason).
 */

import { AMOUNT_TO_MOL, MASS_TO_G, VOLUME_TO_ML } from "@/components/calculators/lab-math";

export type LinearFamily = {
  id: string;
  label: string;
  /** Unit → value of one unit in the family's canonical unit. */
  units: Record<string, number>;
  canonical: string;
  note?: string;
  /** A calculator that goes further with this family. */
  slug?: string;
};

/** Families where conversion is a single multiplication. */
export const LINEAR_FAMILIES: LinearFamily[] = [
  {
    id: "mass",
    label: "Mass",
    units: { ...MASS_TO_G, ng: 1e-9, lb: 453.59237, oz: 28.349523125 },
    canonical: "g",
    note: "1 lb = 0.45359237 kg exactly. Weight-based dosing is done in kg.",
    slug: "MassConversionCalculator",
  },
  {
    id: "volume",
    label: "Volume",
    units: { ...VOLUME_TO_ML, "cm³": 1, "fl oz (US)": 29.5735295625, "tsp (5 mL)": 5, "tbsp (15 mL)": 15 },
    canonical: "mL",
    note: "1 mL = 1 cm³. The 5 mL teaspoon is the metric medicine spoon, not a kitchen one.",
    slug: "VolumeConversionCalculator",
  },
  {
    id: "amount",
    label: "Amount of substance",
    units: { ...AMOUNT_TO_MOL, nmol: 1e-9 },
    canonical: "mol",
    note: "moles = mass (g) ÷ molar mass (g/mol).",
  },
  {
    id: "concentration",
    label: "Mass concentration",
    units: {
      "µg/mL": 1e-3,
      "mg/mL": 1,
      "g/L": 1,
      "g/mL": 1000,
      "mg/L": 1e-3,
      "µg/L": 1e-6,
      "mg/dL": 1e-2,
      "ppm (aqueous)": 1e-3,
    },
    canonical: "mg/mL",
    note: "ppm equals mg/L only when the solution's density is 1 g/mL. mg/dL is the usual laboratory unit for glucose and creatinine.",
    slug: "StrengthConversionCalculator",
  },
  {
    id: "length",
    label: "Length",
    units: { mm: 0.1, cm: 1, m: 100, in: 2.54, ft: 30.48 },
    canonical: "cm",
    note: "1 inch = 2.54 cm exactly. Height for BSA and BMI is entered in cm or m.",
  },
  {
    id: "time",
    label: "Time",
    units: { s: 1, min: 60, h: 3600, day: 86400, week: 604800 },
    canonical: "s",
    note: "Rate constants carry a time unit — make sure kₑ and t½ use the same one.",
  },
];

/** Converts within one linear family. Returns null on an unknown unit. */
export function convertLinear(
  family: LinearFamily,
  value: number,
  from: string,
  to: string,
): number | null {
  const fromFactor = family.units[from];
  const toFactor = family.units[to];
  if (fromFactor === undefined || toFactor === undefined) return null;
  if (!Number.isFinite(value)) return null;
  return (value * fromFactor) / toFactor;
}

/* ── Temperature: an offset scale, handled on its own ──────────────────── */

export const TEMPERATURE_UNITS = ["°C", "°F", "K"] as const;
export type TemperatureUnit = (typeof TEMPERATURE_UNITS)[number];

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit,
): number | null {
  if (!Number.isFinite(value)) return null;
  // Everything goes through Celsius.
  let celsius: number;
  if (from === "°C") celsius = value;
  else if (from === "°F") celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15;

  if (to === "°C") return celsius;
  if (to === "°F") return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

/** Below absolute zero is not a temperature; the UI says so rather than showing it. */
export function isBelowAbsoluteZero(value: number, unit: TemperatureUnit): boolean {
  const kelvin = convertTemperature(value, unit, "K");
  return kelvin !== null && kelvin < 0;
}

/* ── Percentage ↔ molarity: needs a molar mass ─────────────────────────── */

export const MOLAR_UNITS = ["M", "mM", "µM", "nM"] as const;
export type MolarUnit = (typeof MOLAR_UNITS)[number];

const MOLAR_TO_M: Record<MolarUnit, number> = { M: 1, mM: 1e-3, "µM": 1e-6, nM: 1e-9 };

/**
 * % w/v → molarity. 1% w/v is 10 g/L, so M = 10 × percent / molar mass.
 * Returns null when the molar mass is missing or not positive — never NaN.
 */
export function percentToMolar(percent: number, molarMass: number, unit: MolarUnit): number | null {
  if (!Number.isFinite(percent) || !Number.isFinite(molarMass) || molarMass <= 0) return null;
  const molar = (percent * 10) / molarMass;
  return molar / MOLAR_TO_M[unit];
}

/** Molarity → % w/v. The inverse of the above. */
export function molarToPercent(value: number, unit: MolarUnit, molarMass: number): number | null {
  if (!Number.isFinite(value) || !Number.isFinite(molarMass) || molarMass <= 0) return null;
  const molar = value * MOLAR_TO_M[unit];
  return (molar * molarMass) / 10;
}
