// ============================================================
// The bench calculators
// ============================================================
//
// Small, exact, and shown with their working — the student sees the arithmetic,
// not just an answer. Every function returns `null` rather than a number it
// cannot justify, because a calculator that prints NaN or a confidently wrong
// figure is worse than one that says "I need the weight".
//
// These are teaching implementations of standard formulae. The site's full
// calculators at /calculation-tools remain the deeper tools; the point of
// having them here is that the student never has to leave the counter.

export interface CalcResult {
  value: number;
  unit: string;
  /** The steps, in order, each a complete line. */
  working: string[];
  /** Anything the number does not say for itself. */
  note?: string;
}

const round = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;

const finite = (...values: (number | null | undefined)[]) =>
  values.every((v) => typeof v === "number" && Number.isFinite(v));

// ─── Dose and quantity ───────────────────────────────────────────────────────

/** Weight-based dose: mg/kg × kg. */
export function weightBasedDose(mgPerKg: number, weightKg: number, dosesPerDay?: number): CalcResult | null {
  if (!finite(mgPerKg, weightKg) || mgPerKg <= 0 || weightKg <= 0) return null;
  const daily = mgPerKg * weightKg;
  const working = [`${mgPerKg} mg/kg × ${weightKg} kg = ${round(daily)} mg`];
  if (dosesPerDay && dosesPerDay > 0) {
    const perDose = daily / dosesPerDay;
    working.push(`${round(daily)} mg ÷ ${dosesPerDay} doses = ${round(perDose)} mg per dose`);
    return { value: round(perDose), unit: "mg per dose", working, note: `Total ${round(daily)} mg per day.` };
  }
  return { value: round(daily), unit: "mg", working };
}

/** Quantity to supply: dose × times per day × days. */
export function quantityForCourse(doseUnits: number, perDay: number, days: number): CalcResult | null {
  if (!finite(doseUnits, perDay, days) || doseUnits <= 0 || perDay <= 0 || days <= 0) return null;
  const total = doseUnits * perDay * days;
  return {
    value: round(total),
    unit: "units",
    working: [`${doseUnits} per dose × ${perDay} doses/day = ${round(doseUnits * perDay)} per day`, `${round(doseUnits * perDay)} × ${days} days = ${round(total)} units`],
  };
}

/** Days a supply lasts. Floored — a part-day is not a day's supply. */
export function daysSupplyCalc(quantity: number, doseUnits: number, perDay: number): CalcResult | null {
  if (!finite(quantity, doseUnits, perDay) || quantity <= 0 || doseUnits <= 0 || perDay <= 0) return null;
  const perDayTotal = doseUnits * perDay;
  const days = Math.floor(quantity / perDayTotal);
  return {
    value: days,
    unit: "days",
    working: [`${doseUnits} × ${perDay} = ${round(perDayTotal)} units used per day`, `${quantity} ÷ ${round(perDayTotal)} = ${round(quantity / perDayTotal)} → ${days} whole days`],
    note: quantity % perDayTotal === 0 ? undefined : `${round(quantity - days * perDayTotal)} units left over.`,
  };
}

// ─── Body measures ───────────────────────────────────────────────────────────

/** BMI = weight (kg) ÷ height (m)². */
export function bmi(weightKg: number, heightCm: number): CalcResult | null {
  if (!finite(weightKg, heightCm) || weightKg <= 0 || heightCm <= 0) return null;
  const m = heightCm / 100;
  const value = weightKg / (m * m);
  const band = value < 18.5 ? "underweight" : value < 25 ? "normal" : value < 30 ? "overweight" : "obese";
  return {
    value: round(value, 1),
    unit: "kg/m²",
    working: [`${heightCm} cm = ${round(m, 2)} m`, `${weightKg} ÷ (${round(m, 2)})² = ${round(value, 1)} kg/m²`],
    note: `WHO band: ${band}. BMI does not distinguish muscle from fat, and its cut-offs differ for South Asian populations.`,
  };
}

/** Body surface area, Mosteller: √(height cm × weight kg ÷ 3600). */
export function bsaMosteller(weightKg: number, heightCm: number): CalcResult | null {
  if (!finite(weightKg, heightCm) || weightKg <= 0 || heightCm <= 0) return null;
  const value = Math.sqrt((heightCm * weightKg) / 3600);
  return {
    value: round(value, 2),
    unit: "m²",
    working: [`(${heightCm} × ${weightKg}) ÷ 3600 = ${round((heightCm * weightKg) / 3600, 4)}`, `√${round((heightCm * weightKg) / 3600, 4)} = ${round(value, 2)} m²`],
  };
}

/**
 * Cockcroft-Gault creatinine clearance, mL/min.
 *
 * Deliberately labelled as creatinine clearance, not eGFR: they are different
 * quantities, and most renal dosing tables are written against this one.
 */
export function cockcroftGault(ageYears: number, weightKg: number, serumCreatinineMgDl: number, female: boolean): CalcResult | null {
  if (!finite(ageYears, weightKg, serumCreatinineMgDl)) return null;
  if (ageYears < 18 || weightKg <= 0 || serumCreatinineMgDl <= 0) return null;
  const base = ((140 - ageYears) * weightKg) / (72 * serumCreatinineMgDl);
  const value = female ? base * 0.85 : base;
  const working = [
    `(140 − ${ageYears}) × ${weightKg} = ${round((140 - ageYears) * weightKg)}`,
    `72 × ${serumCreatinineMgDl} = ${round(72 * serumCreatinineMgDl)}`,
    `${round((140 - ageYears) * weightKg)} ÷ ${round(72 * serumCreatinineMgDl)} = ${round(base, 1)} mL/min`,
  ];
  if (female) working.push(`× 0.85 (female) = ${round(value, 1)} mL/min`);
  return {
    value: round(value, 1),
    unit: "mL/min",
    working,
    note: "Creatinine clearance, not eGFR. Not validated below 18 years, and unreliable at extremes of body weight or in unstable renal function.",
  };
}

// ─── Paediatric rules ────────────────────────────────────────────────────────

/**
 * Clark's rule (metric form): adult dose × weight ÷ 70 kg.
 *
 * These historical rules are included because students are examined on them,
 * with the caveat stated every time: a licensed weight-based dose supersedes
 * them wherever one exists.
 */
export function clarksRule(adultDose: number, weightKg: number): CalcResult | null {
  if (!finite(adultDose, weightKg) || adultDose <= 0 || weightKg <= 0) return null;
  const value = (adultDose * weightKg) / 70;
  return {
    value: round(value, 1),
    unit: "mg",
    working: [`${adultDose} mg × ${weightKg} kg ÷ 70 kg = ${round(value, 1)} mg`],
    note: "Clark's rule, metric form (70 kg reference adult). An approximation — always use the licensed paediatric dose where one exists.",
  };
}

/** Young's rule: adult dose × age ÷ (age + 12). For ages 1–12 years. */
export function youngsRule(adultDose: number, ageYears: number): CalcResult | null {
  if (!finite(adultDose, ageYears) || adultDose <= 0 || ageYears <= 0) return null;
  const value = (adultDose * ageYears) / (ageYears + 12);
  return {
    value: round(value, 1),
    unit: "mg",
    working: [`${ageYears} + 12 = ${ageYears + 12}`, `${adultDose} mg × ${ageYears} ÷ ${ageYears + 12} = ${round(value, 1)} mg`],
    note:
      ageYears > 12
        ? "Young's rule is intended for 1–12 years; above that an adult dose is usually appropriate."
        : "Young's rule uses age alone and ignores weight — an approximation, superseded by a licensed weight-based dose.",
  };
}

/** BSA method: adult dose × BSA ÷ 1.73 m². */
export function bsaDose(adultDose: number, bsaM2: number): CalcResult | null {
  if (!finite(adultDose, bsaM2) || adultDose <= 0 || bsaM2 <= 0) return null;
  const value = (adultDose * bsaM2) / 1.73;
  return {
    value: round(value, 1),
    unit: "mg",
    working: [`${adultDose} mg × ${bsaM2} m² ÷ 1.73 m² = ${round(value, 1)} mg`],
    note: "Surface-area method, against a 1.73 m² reference adult.",
  };
}

// ─── Concentration ───────────────────────────────────────────────────────────

/** C₁V₁ = C₂V₂ — solve for the missing one of four. */
export function dilution(c1: number | null, v1: number | null, c2: number | null, v2: number | null): CalcResult | null {
  const known = [c1, v1, c2, v2].filter((x) => typeof x === "number" && Number.isFinite(x) && (x as number) > 0).length;
  if (known !== 3) return null;
  if (c1 === null || !Number.isFinite(c1 as number)) {
    if (!finite(v1, c2, v2) || (v1 as number) <= 0) return null;
    const value = ((c2 as number) * (v2 as number)) / (v1 as number);
    return { value: round(value, 3), unit: "concentration (C₁)", working: [`C₁ = C₂V₂ ÷ V₁`, `(${c2} × ${v2}) ÷ ${v1} = ${round(value, 3)}`] };
  }
  if (v1 === null || !Number.isFinite(v1 as number)) {
    if (!finite(c1, c2, v2) || (c1 as number) <= 0) return null;
    const value = ((c2 as number) * (v2 as number)) / (c1 as number);
    return { value: round(value, 3), unit: "volume (V₁)", working: [`V₁ = C₂V₂ ÷ C₁`, `(${c2} × ${v2}) ÷ ${c1} = ${round(value, 3)}`] };
  }
  if (c2 === null || !Number.isFinite(c2 as number)) {
    if (!finite(c1, v1, v2) || (v2 as number) <= 0) return null;
    const value = ((c1 as number) * (v1 as number)) / (v2 as number);
    return { value: round(value, 3), unit: "concentration (C₂)", working: [`C₂ = C₁V₁ ÷ V₂`, `(${c1} × ${v1}) ÷ ${v2} = ${round(value, 3)}`] };
  }
  if (!finite(c1, v1, c2) || (c2 as number) <= 0) return null;
  const value = ((c1 as number) * (v1 as number)) / (c2 as number);
  return { value: round(value, 3), unit: "volume (V₂)", working: [`V₂ = C₁V₁ ÷ C₂`, `(${c1} × ${v1}) ÷ ${c2} = ${round(value, 3)}`] };
}

/** % w/v → mg/mL. 1% w/v is 1 g in 100 mL, i.e. 10 mg/mL. */
export function percentToMgPerMl(percentWv: number): CalcResult | null {
  if (!finite(percentWv) || percentWv <= 0) return null;
  const value = percentWv * 10;
  return {
    value: round(value, 3),
    unit: "mg/mL",
    working: [`${percentWv}% w/v = ${percentWv} g in 100 mL`, `${percentWv} g = ${round(percentWv * 1000)} mg`, `${round(percentWv * 1000)} mg ÷ 100 mL = ${round(value, 3)} mg/mL`],
  };
}

/** Volume of a liquid that contains a required dose. */
export function volumeForDose(doseMg: number, strengthMg: number, perMl: number): CalcResult | null {
  if (!finite(doseMg, strengthMg, perMl) || doseMg <= 0 || strengthMg <= 0 || perMl <= 0) return null;
  const mgPerMl = strengthMg / perMl;
  const value = doseMg / mgPerMl;
  return {
    value: round(value, 2),
    unit: "mL",
    working: [`${strengthMg} mg in ${perMl} mL = ${round(mgPerMl, 3)} mg/mL`, `${doseMg} mg ÷ ${round(mgPerMl, 3)} mg/mL = ${round(value, 2)} mL`],
  };
}

// ─── Infusion ────────────────────────────────────────────────────────────────

/** Gravity drip rate: (volume × drop factor) ÷ time in minutes. */
export function dripRate(volumeMl: number, dropFactor: number, minutes: number): CalcResult | null {
  if (!finite(volumeMl, dropFactor, minutes) || volumeMl <= 0 || dropFactor <= 0 || minutes <= 0) return null;
  const value = (volumeMl * dropFactor) / minutes;
  return {
    value: Math.round(value),
    unit: "drops/min",
    working: [`${volumeMl} mL × ${dropFactor} drops/mL = ${round(volumeMl * dropFactor)} drops`, `${round(volumeMl * dropFactor)} ÷ ${minutes} min = ${round(value, 1)} → ${Math.round(value)} drops/min`],
    note: "Rounded to whole drops — a drip cannot deliver a fraction of one.",
  };
}

/** Pump rate: volume ÷ hours. */
export function infusionRate(volumeMl: number, hours: number): CalcResult | null {
  if (!finite(volumeMl, hours) || volumeMl <= 0 || hours <= 0) return null;
  const value = volumeMl / hours;
  return { value: round(value, 1), unit: "mL/hour", working: [`${volumeMl} mL ÷ ${hours} h = ${round(value, 1)} mL/hour`] };
}

// ─── Unit conversion ─────────────────────────────────────────────────────────

export type UnitKind = "mass" | "volume" | "weight" | "temperature";

const MASS: Record<string, number> = { mcg: 0.001, mg: 1, g: 1000, kg: 1000000 };
const VOLUME: Record<string, number> = { mL: 1, L: 1000 };
const WEIGHT: Record<string, number> = { kg: 1, lb: 0.45359237, g: 0.001 };

export function convertUnits(value: number, from: string, to: string, kind: UnitKind): CalcResult | null {
  if (!finite(value)) return null;
  if (kind === "temperature") {
    if (from === to) return { value: round(value, 1), unit: to, working: ["No conversion needed."] };
    if (from === "°C" && to === "°F") {
      const out = value * 1.8 + 32;
      return { value: round(out, 1), unit: "°F", working: [`(${value} × 9/5) + 32 = ${round(out, 1)} °F`] };
    }
    if (from === "°F" && to === "°C") {
      const out = (value - 32) / 1.8;
      return { value: round(out, 1), unit: "°C", working: [`(${value} − 32) × 5/9 = ${round(out, 1)} °C`] };
    }
    return null;
  }
  const table = kind === "mass" ? MASS : kind === "volume" ? VOLUME : WEIGHT;
  const f = table[from];
  const t = table[to];
  if (!f || !t) return null;
  const out = (value * f) / t;
  return {
    value: round(out, 4),
    unit: to,
    working: [`${value} ${from} = ${round(value * f, 4)} ${kind === "mass" ? "mg" : kind === "volume" ? "mL" : "kg"} (base)`, `→ ${round(out, 4)} ${to}`],
  };
}

export const UNIT_CHOICES: Record<UnitKind, string[]> = {
  mass: ["mcg", "mg", "g", "kg"],
  volume: ["mL", "L"],
  weight: ["kg", "lb", "g"],
  temperature: ["°C", "°F"],
};
