/**
 * Opioid MME totalling, CDC risk stratification and equianalgesic rotation.
 *
 * Pulled out of the page so the arithmetic can be hand-checked and compared
 * against the pre-migration page. Every multiplier, threshold and rounding step
 * below is copied verbatim from that page.
 *
 * KNOWN FAULTS, preserved deliberately (migration rule: identical numbers;
 * a factor that looks wrong is reported, never silently changed). Recorded in
 * .claude/redesign-tracker.md:
 *   1. Tramadol is 0.1; the CDC 2022 conversion table uses 0.2.
 *   2. Oral hydromorphone is 4; the CDC 2022 table uses 5.
 *   3. Rotating TO the fentanyl patch divides the 24-hour mcg/hr figure by the
 *      dosing frequency. A patch delivers a constant rate, so selecting anything
 *      other than "once daily" halves or quarters the prescribed rate.
 */

export type OpioidDrugId =
  | "morphine_po"
  | "morphine_iv"
  | "oxycodone_po"
  | "hydrocodone_po"
  | "hydromorphone_po"
  | "hydromorphone_iv"
  | "fentanyl_patch"
  | "fentanyl_iv"
  | "codeine_po"
  | "tramadol_po"
  | "oxymorphone_po"
  | "oxymorphone_iv"
  | "tapentadol_po";

export interface OpioidDrugConfig {
  id: OpioidDrugId;
  name: string;
  brand: string;
  route: "Oral" | "IV / SC" | "Transdermal";
  unit: "mg" | "mcg" | "mcg/hr";
  multiplierToOralMorphine: number;
  standardDoseUnit: string;
}

export interface RegimenItem {
  id: string;
  drugId: OpioidDrugId;
  dosePerAdmin: number;
  frequencyTimesPerDay: number;
}

/** CDC 2022 / NCCN-style equianalgesic registry, as implemented on this page. */
export const OPIOID_REGISTRY: Record<OpioidDrugId, OpioidDrugConfig> = {
  morphine_po: { id: "morphine_po", name: "Morphine (Oral)", brand: "MS Contin, Roxanol", route: "Oral", unit: "mg", multiplierToOralMorphine: 1.0, standardDoseUnit: "mg" },
  morphine_iv: { id: "morphine_iv", name: "Morphine (IV / SC)", brand: "Infumorph", route: "IV / SC", unit: "mg", multiplierToOralMorphine: 3.0, standardDoseUnit: "mg" },
  oxycodone_po: { id: "oxycodone_po", name: "Oxycodone (Oral)", brand: "OxyContin, Roxicodone, Percocet", route: "Oral", unit: "mg", multiplierToOralMorphine: 1.5, standardDoseUnit: "mg" },
  hydrocodone_po: { id: "hydrocodone_po", name: "Hydrocodone (Oral)", brand: "Norco, Vicodin, Zohydro", route: "Oral", unit: "mg", multiplierToOralMorphine: 1.0, standardDoseUnit: "mg" },
  hydromorphone_po: { id: "hydromorphone_po", name: "Hydromorphone (Oral)", brand: "Dilaudid PO", route: "Oral", unit: "mg", multiplierToOralMorphine: 4.0, standardDoseUnit: "mg" },
  hydromorphone_iv: { id: "hydromorphone_iv", name: "Hydromorphone (IV / SC)", brand: "Dilaudid IV", route: "IV / SC", unit: "mg", multiplierToOralMorphine: 20.0, standardDoseUnit: "mg" },
  fentanyl_patch: { id: "fentanyl_patch", name: "Fentanyl (Transdermal Patch)", brand: "Duragesic (q72h)", route: "Transdermal", unit: "mcg/hr", multiplierToOralMorphine: 2.4, standardDoseUnit: "mcg/hr" },
  fentanyl_iv: { id: "fentanyl_iv", name: "Fentanyl (IV / SC)", brand: "Sublimaze", route: "IV / SC", unit: "mcg", multiplierToOralMorphine: 0.3, standardDoseUnit: "mcg" },
  codeine_po: { id: "codeine_po", name: "Codeine (Oral)", brand: "Tylenol #3", route: "Oral", unit: "mg", multiplierToOralMorphine: 0.15, standardDoseUnit: "mg" },
  tramadol_po: { id: "tramadol_po", name: "Tramadol (Oral)", brand: "Ultram", route: "Oral", unit: "mg", multiplierToOralMorphine: 0.1, standardDoseUnit: "mg" },
  oxymorphone_po: { id: "oxymorphone_po", name: "Oxymorphone (Oral)", brand: "Opana PO", route: "Oral", unit: "mg", multiplierToOralMorphine: 3.0, standardDoseUnit: "mg" },
  oxymorphone_iv: { id: "oxymorphone_iv", name: "Oxymorphone (IV)", brand: "Opana IV", route: "IV / SC", unit: "mg", multiplierToOralMorphine: 30.0, standardDoseUnit: "mg" },
  tapentadol_po: { id: "tapentadol_po", name: "Tapentadol (Oral)", brand: "Nucynta", route: "Oral", unit: "mg", multiplierToOralMorphine: 0.4, standardDoseUnit: "mg" },
};

/** Factors that differ from the CDC 2022 table, surfaced on screen. */
export const FACTOR_DISCREPANCIES: Partial<Record<OpioidDrugId, { used: number; cdc: number }>> = {
  tramadol_po: { used: 0.1, cdc: 0.2 },
  hydromorphone_po: { used: 4.0, cdc: 5.0 },
};

export interface MmeCalculations {
  totalDailyMme: number;
  lineCalculations: Array<RegimenItem & { config: OpioidDrugConfig; dailyQuantity: number; itemDailyMme: number }>;
  riskTier: string;
  riskDirectives: string;
  naloxoneMandated: boolean;
  targetConfig: OpioidDrugConfig;
  unadjusted24hTargetDose: number;
  safe24hTargetDose: number;
  safeDosePerAdmin: number;
  breakthroughDoseMin: number;
  breakthroughDoseMax: number;
}

export function calculateMme(
  regimen: RegimenItem[],
  targetDrugId: OpioidDrugId,
  crossToleranceReduction: number,
  targetFrequency: number,
  concomitantBenzo: boolean,
  hasSleepApneaOrCopd: boolean,
): MmeCalculations {
  let totalDailyMme = 0;

  const lineCalculations = regimen.map((item) => {
    const config = OPIOID_REGISTRY[item.drugId];
    let dailyQuantity = item.dosePerAdmin * item.frequencyTimesPerDay;
    if (item.drugId === "fentanyl_patch") {
      // A patch delivers a constant mcg/hr, so the frequency does not multiply it.
      dailyQuantity = item.dosePerAdmin;
    }
    const itemDailyMme = dailyQuantity * config.multiplierToOralMorphine;
    totalDailyMme += itemDailyMme;
    return { ...item, config, dailyQuantity, itemDailyMme: Math.round(itemDailyMme * 10) / 10 };
  });

  totalDailyMme = Math.round(totalDailyMme * 10) / 10;

  // CDC risk stratification.
  let riskTier = "Low Overdose Risk (< 50 MME/day)";
  let riskDirectives = "Standard monitoring. Reassess pain and functional goals at regular intervals.";
  let naloxoneMandated = false;

  if (totalDailyMme >= 200) {
    riskTier = "Extreme Risk (≥ 200 MME/day — Palliative / Active Cancer)";
    riskDirectives = "Requires urgent specialist pain / palliative co-management. Immediate Naloxone co-prescription mandatory. Screen for respiratory depression and sleep apnea.";
    naloxoneMandated = true;
  } else if (totalDailyMme >= 90) {
    riskTier = "High Overdose Risk (≥ 90 MME/day — CDC Threshold)";
    riskDirectives = "Substantial overdose hazard (9x–10x baseline). Prescribe Naloxone (Narcan) rescue. Frequent urine drug monitoring & consider tapering.";
    naloxoneMandated = true;
  } else if (totalDailyMme >= 50) {
    riskTier = "Moderate Risk (50–89 MME/day — CDC Caution)";
    riskDirectives = "Carefully assess individual benefit vs. harm. Offer Naloxone co-prescription. Avoid concurrent benzodiazepines.";
    naloxoneMandated = concomitantBenzo || hasSleepApneaOrCopd;
  } else if (concomitantBenzo) {
    riskTier = "Elevated Risk (Concurrent Benzodiazepines / Sedatives)";
    riskDirectives = "FDA Black Box: Co-prescribing opioids and benzodiazepines causes profound sedation, respiratory depression, coma, and death. Co-prescribe Naloxone.";
    naloxoneMandated = true;
  }

  // Rotation to the target opioid.
  const targetConfig = OPIOID_REGISTRY[targetDrugId];
  const unadjusted24hTargetDose = totalDailyMme / targetConfig.multiplierToOralMorphine;
  const reductionMultiplier = (100 - crossToleranceReduction) / 100;
  const safe24hTargetDose = Math.round(unadjusted24hTargetDose * reductionMultiplier * 10) / 10;
  const safeDosePerAdmin = Math.round((safe24hTargetDose / targetFrequency) * 10) / 10;
  const breakthroughDoseMin = Math.round(safe24hTargetDose * 0.1 * 10) / 10;
  const breakthroughDoseMax = Math.round(safe24hTargetDose * 0.15 * 10) / 10;

  return {
    totalDailyMme,
    lineCalculations,
    riskTier,
    riskDirectives,
    naloxoneMandated,
    targetConfig,
    unadjusted24hTargetDose: Math.round(unadjusted24hTargetDose * 10) / 10,
    safe24hTargetDose,
    safeDosePerAdmin,
    breakthroughDoseMin,
    breakthroughDoseMax,
  };
}
