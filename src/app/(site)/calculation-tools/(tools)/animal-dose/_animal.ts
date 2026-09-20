/**
 * Weight-based animal dose extrapolation.
 *
 * Pulled out of the page so the arithmetic can be hand-checked and compared
 * against the pre-migration page. Every conversion factor, formula and the
 * display-rounding helper are copied verbatim from that page.
 *
 * KNOWN LIMITATION, preserved deliberately: this is straight linear scaling on
 * body weight (dose per gram × animal grams), not allometric scaling by body
 * surface area with the FDA/Km conversion factors. Linear scaling substantially
 * *under*-estimates a rodent dose, because small animals have a far higher
 * metabolic rate per unit mass. The page says so on screen; the numbers are
 * unchanged. Recorded in .claude/redesign-tracker.md.
 */

export type WeightUnit = "kg" | "g" | "lbs" | "mg";
export type DoseUnit = "mg" | "g" | "mcg";

export interface AnimalPreset {
  name: string;
  defaultWeightG: number;
  maxInjectVolMl: number;
}

export const ANIMAL_PRESETS: AnimalPreset[] = [
  { name: "Mouse (25g)", defaultWeightG: 25, maxInjectVolMl: 0.2 },
  { name: "Rat (200g)", defaultWeightG: 200, maxInjectVolMl: 1.0 },
  { name: "Guinea Pig (400g)", defaultWeightG: 400, maxInjectVolMl: 1.5 },
  { name: "Rabbit (2kg)", defaultWeightG: 2000, maxInjectVolMl: 3.0 },
];

export function toGrams(val: number, unit: WeightUnit): number {
  if (unit === "kg") return val * 1000;
  if (unit === "g") return val;
  if (unit === "lbs") return val * 453.59237;
  if (unit === "mg") return val / 1000;
  return val;
}

export function doseToMg(val: number, unit: DoseUnit): number {
  if (unit === "mg") return val;
  if (unit === "g") return val * 1000;
  if (unit === "mcg") return val / 1000;
  return val;
}

/** Display rounding: fewer decimals as the magnitude grows. */
export function fmt(n: number, maxDp = 4): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  let dp = maxDp;
  if (abs >= 100) dp = 2;
  else if (abs >= 10) dp = 3;
  else if (abs >= 1) dp = 3;
  return Number(n.toFixed(dp)).toString();
}

export function fmtUg(mg: number): string {
  if (!Number.isFinite(mg)) return "—";
  return `${fmt(mg * 1000, 2)} µg`;
}

export interface AnimalDoseResult {
  dosePerGram: number;
  animalDoseMg: number;
  animalDoseMgPerKg: number;
  injectionVolMl: number;
  injectionVolUl: number;
  isOverVolume: boolean;
  adultDoseInMg: number;
  adultWeightInGrams: number;
  animalWeightInGrams: number;
}

export function calculateAnimalDose(
  adultDose: string,
  adultDoseUnit: DoseUnit,
  adultWeight: string,
  adultWeightUnit: WeightUnit,
  animalWeight: string,
  animalWeightUnit: WeightUnit,
  stockConc: string,
  preset: AnimalPreset,
): AnimalDoseResult | null {
  const adultDoseInMg = doseToMg(parseFloat(adultDose) || 0, adultDoseUnit);
  const adultWeightInGrams = toGrams(parseFloat(adultWeight) || 0, adultWeightUnit);
  const animalWeightInGrams = toGrams(parseFloat(animalWeight) || 0, animalWeightUnit);
  const nStockConc = parseFloat(stockConc) || 0;

  if (!(adultDoseInMg > 0 && adultWeightInGrams > 0 && animalWeightInGrams > 0)) return null;

  const dosePerGram = adultDoseInMg / adultWeightInGrams;
  const animalDoseMg = dosePerGram * animalWeightInGrams;
  const animalDoseMgPerKg = (animalDoseMg / animalWeightInGrams) * 1000;

  const injectionVolMl = nStockConc > 0 ? animalDoseMg / nStockConc : 0;

  return {
    dosePerGram,
    animalDoseMg,
    animalDoseMgPerKg,
    injectionVolMl,
    injectionVolUl: injectionVolMl * 1000,
    isOverVolume: preset.maxInjectVolMl > 0 && injectionVolMl > preset.maxInjectVolMl,
    adultDoseInMg,
    adultWeightInGrams,
    animalWeightInGrams,
  };
}
