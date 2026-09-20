/**
 * Geriatric dosing maths: Cockcroft-Gault clearance, sarcopenia correction and
 * the four "start low" dose-reduction rules.
 *
 * Pulled out of the page so the arithmetic can be hand-checked and compared
 * against the pre-migration page. Every constant, clamp and rounding step below
 * is copied verbatim from that page.
 */

export type GeriatricRule = "start_low_50" | "start_low_33" | "renal_crcl" | "frailty_adjusted";
export type WeightUnit = "kg" | "lbs";
export type ScrUnit = "mg/dL" | "umol/L";
export type FrailtyStatus = "robust" | "pre_frail" | "frail" | "severely_frail";

export const FRAILTY_MULTIPLIER: Record<FrailtyStatus, number> = {
  robust: 1.0,
  pre_frail: 0.85,
  frail: 0.7,
  severely_frail: 0.55,
};

export const FRAILTY_LABEL: Record<FrailtyStatus, { label: string; sub: string }> = {
  robust: { label: "Robust / fit", sub: "100% capacity" },
  pre_frail: { label: "Pre-frail", sub: "85% capacity" },
  frail: { label: "Frail", sub: "70% capacity" },
  severely_frail: { label: "Severely frail", sub: "55% capacity" },
};

export const toWeightKg = (rawWeight: number, unit: WeightUnit) =>
  unit === "lbs" ? Math.round(rawWeight * 0.453592 * 10) / 10 : rawWeight;

export const toScrMgDl = (rawScr: number, unit: ScrUnit) =>
  unit === "umol/L" ? Math.round((rawScr / 88.4) * 100) / 100 : rawScr;

/**
 * A creatinine below 0.8 mg/dL in a sarcopenic elder reflects low muscle mass,
 * not good renal function, so it is commonly rounded up before Cockcroft-Gault.
 */
export const toEffectiveScr = (scrMgDl: number, roundLowScr: boolean) =>
  roundLowScr && scrMgDl < 0.8 && scrMgDl > 0 ? 0.8 : scrMgDl;

export function cockcroftGault(age: number, weightKg: number, scr: number, sex: "male" | "female") {
  if (age <= 0 || weightKg <= 0 || scr <= 0) return 0;
  let val = ((140 - age) * weightKg) / (72 * scr);
  if (sex === "female") val *= 0.85;
  return Math.round(val * 10) / 10;
}

export interface RuleCalculations {
  dose50: number;
  dose33: number;
  doseRenal: number;
  doseFrailty: number;
  activeDose: number;
  activeRuleLabel: string;
  activeRationale: string;
  reductionPercent: number;
  renalFactor: number;
}

export function calculateRules(
  adultDose: number,
  crcl: number,
  frailtyMultiplier: number,
  rule: GeriatricRule,
): RuleCalculations | null {
  if (adultDose <= 0) return null;

  const dose50 = Math.round(adultDose * 0.5 * 100) / 100;
  const dose33 = Math.round(adultDose * 0.333 * 100) / 100;

  // Renal scaling is clamped to 20%–100% of the adult dose.
  const renalFactor = Math.min(1.0, Math.max(0.2, crcl / 100));
  const doseRenal = Math.round(adultDose * renalFactor * 100) / 100;

  // The combined rule has a lower floor of 15%.
  const combinedFactor = Math.min(1.0, Math.max(0.15, (crcl / 100) * frailtyMultiplier));
  const doseFrailty = Math.round(adultDose * combinedFactor * 100) / 100;

  let activeDose = dose50;
  let activeRuleLabel = "Standard Geriatric Start-Low (50%)";
  let activeRationale =
    "Standard conservative geriatric starting dose to minimize adverse drug events.";

  if (rule === "start_low_33") {
    activeDose = dose33;
    activeRuleLabel = "Conservative Start-Low (33%)";
    activeRationale =
      "Recommended for CNS-active, anticholinergic, or narrow therapeutic index agents in vulnerable elders.";
  } else if (rule === "renal_crcl") {
    activeDose = doseRenal;
    activeRuleLabel = "Renal Clearance Proportional Dosing";
    activeRationale = `Scaled proportionally to patient's calculated CrCl (${crcl} mL/min) relative to normal adult clearance.`;
  } else if (rule === "frailty_adjusted") {
    activeDose = doseFrailty;
    activeRuleLabel = "Multi-Factorial Frailty & Renal Adjusted";
    activeRationale = `Integrates ${crcl} mL/min renal clearance with a ${(frailtyMultiplier * 100).toFixed(0)}% frailty coefficient.`;
  }

  return {
    dose50,
    dose33,
    doseRenal,
    doseFrailty,
    activeDose,
    activeRuleLabel,
    activeRationale,
    reductionPercent: Math.round(((adultDose - activeDose) / adultDose) * 100),
    renalFactor: Math.round(renalFactor * 100),
  };
}
