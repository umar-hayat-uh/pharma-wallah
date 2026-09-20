/**
 * Vancomycin one-compartment PK: clearance, steady-state peak/trough, AUC24 and
 * the dose-optimiser search.
 *
 * Pulled out of the page so the arithmetic can be hand-checked and compared
 * against the pre-migration page. Every constant, candidate list, clamp and
 * rounding step below is copied verbatim from that page.
 */

export type Sex = "male" | "female";
export type WeightMethod = "auto" | "actual" | "ibw" | "adjbw";

/** Devine ideal body weight, floored at the base value. */
export function calculateIBW(heightInches: number, sex: Sex): number {
  const base = sex === "male" ? 50.0 : 45.5;
  const ibw = base + 2.3 * (heightInches - 60);
  return Math.max(ibw, sex === "male" ? 50 : 45.5);
}

export const calculateAdjBW = (actualKg: number, ibwKg: number) => ibwKg + 0.4 * (actualKg - ibwKg);

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateCrCl(age: number, weightKg: number, scrMgDl: number, sex: Sex): number {
  if (age <= 0 || weightKg <= 0 || scrMgDl <= 0) return 0;
  let crcl = ((140 - age) * weightKg) / (72 * scrMgDl);
  if (sex === "female") crcl *= 0.85;
  return Math.round(crcl * 10) / 10;
}

/** Matzke elimination rate constant (hr⁻¹), floored at 0.005. */
export const calculateKe = (crcl: number) => Math.max(0.00083 * crcl + 0.0044, 0.005);

export interface PkResults {
  Vd: number;
  ke: number;
  halfLife: number;
  clearanceLhr: number;
  cMaxSs: number;
  cMinSs: number;
  auc24: number;
  aucMic: number;
  totalDailyDose: number;
  recommendedLoadingDose: number;
}

export function calculatePk(
  weightKg: number,
  crcl: number,
  dose: number,
  interval: number,
  infusionTime: number,
  mic: number,
): PkResults | null {
  if (!weightKg || !crcl || !dose || !interval || !mic) return null;

  // Vd uses actual body weight at 0.7 L/kg.
  const Vd = Math.round(0.7 * weightKg * 10) / 10;
  const ke = calculateKe(crcl);
  const halfLife = Math.round((0.693 / ke) * 10) / 10;
  const clearanceLhr = Math.round(Vd * ke * 100) / 100;

  const tInf = infusionTime;
  const tau = interval;

  // Cmax,ss = [D / (tinf · Vd · ke)] · (1 − e^−ke·tinf) / (1 − e^−ke·tau)
  const numeratorPeak = (dose / (tInf * Vd * ke)) * (1 - Math.exp(-ke * tInf));
  const denominatorPeak = 1 - Math.exp(-ke * tau);
  const cMaxSs = Math.round((numeratorPeak / denominatorPeak) * 10) / 10;

  // Cmin,ss = Cmax,ss · e^−ke·(tau − tinf)
  const cMinSs = Math.round(cMaxSs * Math.exp(-ke * (tau - tInf)) * 10) / 10;

  const totalDailyDose = dose * (24 / tau);
  const auc24 = Math.round((totalDailyDose / clearanceLhr) * 10) / 10;
  const aucMic = Math.round((auc24 / mic) * 10) / 10;

  // 25–35 mg/kg actual weight, rounded to the nearest 250 mg, capped at 3000 mg.
  const recommendedLoadingDose = Math.min(Math.round((25 * weightKg) / 250) * 250, 3000);

  return {
    Vd,
    ke: Math.round(ke * 10000) / 10000,
    halfLife,
    clearanceLhr,
    cMaxSs,
    cMinSs,
    auc24,
    aucMic,
    totalDailyDose,
    recommendedLoadingDose,
  };
}

export interface Regimen {
  dose: number;
  interval: number;
  auc24: number;
  aucMic: number;
  cMin: number;
}

const OPTIMISER_INTERVALS = [8, 12, 18, 24, 36, 48];
const OPTIMISER_DOSES = [500, 750, 1000, 1250, 1500, 1750, 2000];

/** Searches for the regimen whose AUC/MIC lands closest to 500. */
export function findOptimalRegimen(weightKg: number, crcl: number, mic: number): Regimen | null {
  if (!weightKg || !crcl || !mic) return null;

  const ke = calculateKe(crcl);
  const Vd = 0.7 * weightKg;
  const clearance = Vd * ke;

  let best: Regimen | null = null;
  let closestDiffTo500 = Infinity;

  for (const tau of OPTIMISER_INTERVALS) {
    for (const d of OPTIMISER_DOSES) {
      const predAuc = (d * (24 / tau)) / clearance;
      const predAucMic = predAuc / mic;
      if (predAucMic >= 400 && predAucMic <= 600) {
        const diff = Math.abs(predAucMic - 500);
        if (diff < closestDiffTo500) {
          closestDiffTo500 = diff;
          const tInf = Math.max(1, d / 1000);
          const cMax =
            ((d / (tInf * Vd * ke)) * (1 - Math.exp(-ke * tInf))) / (1 - Math.exp(-ke * tau));
          best = {
            dose: d,
            interval: tau,
            auc24: Math.round(predAuc * 10) / 10,
            aucMic: Math.round(predAucMic * 10) / 10,
            cMin: Math.round(cMax * Math.exp(-ke * (tau - tInf)) * 10) / 10,
          };
        }
      }
    }
  }
  return best;
}

const ALTERNATIVE_DOSES = [750, 1000, 1250, 1500, 1750, 2000];

/** Regimens landing in a slightly widened 380–620 window; first five only. */
export function findAlternativeRegimens(
  weightKg: number,
  crcl: number,
  mic: number,
  currentDose: number,
  currentInterval: number,
): Array<Regimen & { isCurrent: boolean }> {
  if (!weightKg || !crcl) return [];

  const ke = calculateKe(crcl);
  const Vd = 0.7 * weightKg;
  const clearance = Vd * ke;
  const options: Array<Regimen & { isCurrent: boolean }> = [];

  for (const tau of OPTIMISER_INTERVALS) {
    for (const d of ALTERNATIVE_DOSES) {
      const predAuc = (d * (24 / tau)) / clearance;
      const predAucMic = predAuc / mic;
      if (predAucMic >= 380 && predAucMic <= 620) {
        const tInf = Math.max(1, d / 1000);
        const cMax =
          ((d / (tInf * Vd * ke)) * (1 - Math.exp(-ke * tInf))) / (1 - Math.exp(-ke * tau));
        options.push({
          dose: d,
          interval: tau,
          auc24: Math.round(predAuc * 10) / 10,
          aucMic: Math.round(predAucMic * 10) / 10,
          cMin: Math.round(cMax * Math.exp(-ke * (tau - tInf)) * 10) / 10,
          isCurrent: d === currentDose && tau === currentInterval,
        });
      }
    }
  }
  return options.slice(0, 5);
}

export interface TargetStatus {
  type: "therapeutic" | "subtherapeutic" | "supratherapeutic";
  label: string;
  message: string;
}

export function assessTarget(aucMic: number): TargetStatus {
  if (aucMic >= 400 && aucMic <= 600) {
    return {
      type: "therapeutic",
      label: "Target Therapeutic Range (400–600)",
      message:
        "Optimal exposure. Maximizes clinical cure for serious MRSA infections while minimizing nephrotoxicity risk.",
    };
  }
  if (aucMic < 400) {
    return {
      type: "subtherapeutic",
      label: "Subtherapeutic (< 400 mg·h/L)",
      message:
        "Under-exposure alert. Risk of treatment failure and selection of vancomycin-intermediate (VISA) strains. Increase dose or shorten interval.",
    };
  }
  return {
    type: "supratherapeutic",
    label: "Supratherapeutic / Toxic (> 600 mg·h/L)",
    message:
      "Excess exposure / Nephrotoxicity alert. High risk of acute kidney injury (AKI). Reduce dose or extend interval.",
  };
}

/** Weight-method heuristic: TBW if underweight, AdjBW if > 120% IBW, else IBW. */
export function recommendWeightMethod(weightKg: number, ibwKg: number, bmi: number) {
  if (!weightKg || !ibwKg) {
    return { autoRecommendedMethod: "actual" as const, autoReason: "Standard weight" };
  }
  if (weightKg < ibwKg) {
    return {
      autoRecommendedMethod: "actual" as const,
      autoReason: "Underweight (TBW < IBW): Actual total body weight recommended.",
    };
  }
  if (weightKg > 1.2 * ibwKg) {
    return {
      autoRecommendedMethod: "adjbw" as const,
      autoReason: `Obese (BMI ${bmi} kg/m²; TBW > 120% IBW): Adjusted Body Weight (AdjBW 40%) recommended for CrCl estimation to prevent clearance overestimation.`,
    };
  }
  return {
    autoRecommendedMethod: "ibw" as const,
    autoReason: "Normal Weight: Ideal Body Weight (IBW) standard for Cockcroft-Gault.",
  };
}
