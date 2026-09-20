/**
 * TPN admixture engine: macronutrient grams and volumes, calories, nitrogen
 * balance, osmolarity and the ASPEN-referenced safety checks.
 *
 * Pulled out of the page so the arithmetic can be hand-checked and compared
 * against the pre-migration page. Every concentration, coefficient, threshold
 * and rounding step below is copied verbatim from that page.
 */

export type PatientPopulation = "adult" | "pediatric";
export type LineType = "central" | "peripheral";

export interface MacroSource {
  id: string;
  label: string;
  concentrationPct: number;
  kcalPerGram: number;
  /** g nitrogen per g amino acid. */
  proteinFraction?: number;
}

export const AMINO_ACID_SOURCES: MacroSource[] = [
  { id: "aa-10", label: "Amino Acids 10%", concentrationPct: 10, kcalPerGram: 4, proteinFraction: 0.16 },
  { id: "aa-15", label: "Amino Acids 15%", concentrationPct: 15, kcalPerGram: 4, proteinFraction: 0.16 },
  { id: "aa-8.5", label: "Amino Acids 8.5%", concentrationPct: 8.5, kcalPerGram: 4, proteinFraction: 0.16 },
];

export const DEXTROSE_SOURCES: MacroSource[] = [
  { id: "dex-50", label: "Dextrose 50%", concentrationPct: 50, kcalPerGram: 3.4 },
  { id: "dex-70", label: "Dextrose 70%", concentrationPct: 70, kcalPerGram: 3.4 },
  { id: "dex-20", label: "Dextrose 20%", concentrationPct: 20, kcalPerGram: 3.4 },
];

export const LIPID_SOURCES: MacroSource[] = [
  { id: "lip-20", label: "Lipid Emulsion 20%", concentrationPct: 20, kcalPerGram: 10 },
  { id: "lip-30", label: "Lipid Emulsion 30%", concentrationPct: 30, kcalPerGram: 10 },
  { id: "lip-10", label: "Lipid Emulsion 10%", concentrationPct: 10, kcalPerGram: 9 },
];

export interface ElectrolyteDef {
  id: string;
  label: string;
  unit: "mEq" | "mmol";
  adultRangePerDay: string;
  pedRangePerKgDay: string;
  /** Approximate osmotic contribution per mEq or mmol added. */
  mOsmPerUnit: number;
}

export const ELECTROLYTE_DEFS: ElectrolyteDef[] = [
  { id: "sodium", label: "Sodium (as NaCl/NaAc)", unit: "mEq", adultRangePerDay: "1–2 mEq/kg/day", pedRangePerKgDay: "2–5 mEq/kg/day", mOsmPerUnit: 2 },
  { id: "potassium", label: "Potassium (as KCl/KPhos)", unit: "mEq", adultRangePerDay: "1–2 mEq/kg/day", pedRangePerKgDay: "2–4 mEq/kg/day", mOsmPerUnit: 2 },
  { id: "calcium", label: "Calcium Gluconate", unit: "mEq", adultRangePerDay: "10–15 mEq/day", pedRangePerKgDay: "0.5–4 mEq/kg/day", mOsmPerUnit: 1.4 },
  { id: "magnesium", label: "Magnesium Sulfate", unit: "mEq", adultRangePerDay: "8–20 mEq/day", pedRangePerKgDay: "0.3–0.5 mEq/kg/day", mOsmPerUnit: 1 },
  { id: "phosphate", label: "Phosphate (as KPhos/NaPhos)", unit: "mmol", adultRangePerDay: "20–40 mmol/day", pedRangePerKgDay: "0.5–2 mmol/kg/day", mOsmPerUnit: 2 },
];

export interface TpnInputs {
  population: PatientPopulation;
  weightKg: string;
  totalFluidMlKg: string;
  useFluidOverride: boolean;
  totalFluidOverrideMl: string;
  proteinGKgDay: string;
  dextroseGKgDay: string;
  lipidGKgDay: string;
  aaSource: MacroSource;
  dexSource: MacroSource;
  lipSource: MacroSource;
  lineType: LineType;
  electrolyteAmounts: Record<string, string>;
  mviMl: string;
  traceElementsMl: string;
}

export function calculateTpn(input: TpnInputs) {
  const wt = parseFloat(input.weightKg) || 0;

  const fluidPerKg = parseFloat(input.totalFluidMlKg) || 0;
  const targetFluidMl = input.useFluidOverride
    ? parseFloat(input.totalFluidOverrideMl) || 0
    : wt * fluidPerKg;

  // Protein / amino acids
  const proteinGKg = parseFloat(input.proteinGKgDay) || 0;
  const totalProteinG = proteinGKg * wt;
  const aaVolumeMl =
    input.aaSource.concentrationPct > 0 ? totalProteinG / (input.aaSource.concentrationPct / 100) : 0;
  const proteinKcal = totalProteinG * input.aaSource.kcalPerGram;
  const nitrogenG = totalProteinG * (input.aaSource.proteinFraction || 0.16);

  // Dextrose
  const dexGKg = parseFloat(input.dextroseGKgDay) || 0;
  const totalDextroseG = dexGKg * wt;
  const dexVolumeMl =
    input.dexSource.concentrationPct > 0 ? totalDextroseG / (input.dexSource.concentrationPct / 100) : 0;
  const dextroseKcal = totalDextroseG * input.dexSource.kcalPerGram;
  const girMgKgMin = wt > 0 ? (totalDextroseG * 1000) / (wt * 1440) : 0;

  // Lipids
  const lipGKg = parseFloat(input.lipidGKgDay) || 0;
  const totalLipidG = lipGKg * wt;
  const lipVolumeMl =
    input.lipSource.concentrationPct > 0 ? totalLipidG / (input.lipSource.concentrationPct / 100) : 0;
  const lipidKcal = totalLipidG * input.lipSource.kcalPerGram;

  // Calories
  const nonProteinKcal = dextroseKcal + lipidKcal;
  const totalKcal = proteinKcal + nonProteinKcal;
  const kcalPerKg = wt > 0 ? totalKcal / wt : 0;
  const nonProteinKcalPerGN = nitrogenG > 0 ? nonProteinKcal / nitrogenG : 0;
  const dextrosePctOfNonProtein = nonProteinKcal > 0 ? (dextroseKcal / nonProteinKcal) * 100 : 0;
  const lipidPctOfNonProtein = nonProteinKcal > 0 ? (lipidKcal / nonProteinKcal) * 100 : 0;
  const lipidPctOfTotalKcal = totalKcal > 0 ? (lipidKcal / totalKcal) * 100 : 0;

  const mviVol = parseFloat(input.mviMl) || 0;
  const traceVol = parseFloat(input.traceElementsMl) || 0;

  // Electrolytes: osmotic load and approximate added stock volume (0.05 mL per unit).
  let electrolyteMOsm = 0;
  let electrolyteAddedVolMl = 0;
  ELECTROLYTE_DEFS.forEach((e) => {
    const amt = parseFloat(input.electrolyteAmounts[e.id]) || 0;
    electrolyteMOsm += amt * e.mOsmPerUnit;
    electrolyteAddedVolMl += amt * 0.05;
  });

  // Approximate clinical osmolarity: dextrose ~5 mOsm/g, amino acids ~10 mOsm/g,
  // lipids near-isotonic and therefore ignored here.
  const dextroseMOsmContribution = totalDextroseG * 5;
  const aminoAcidMOsmContribution = totalProteinG * 10;
  const totalMOsmLoad = dextroseMOsmContribution + aminoAcidMOsmContribution + electrolyteMOsm;

  const totalVolumeMl = aaVolumeMl + dexVolumeMl + lipVolumeMl + mviVol + traceVol + electrolyteAddedVolMl;
  const finalOsmolarity = totalVolumeMl > 0 ? (totalMOsmLoad / totalVolumeMl) * 1000 : 0;

  const exceedsPeripheralLimit = input.lineType === "peripheral" && finalOsmolarity > 900;
  const nearPeripheralLimit =
    input.lineType === "peripheral" && finalOsmolarity > 750 && finalOsmolarity <= 900;

  const volumeDifferenceMl = totalVolumeMl - targetFluidMl;
  const freeWaterNeededMl = Math.max(0, targetFluidMl - totalVolumeMl);
  const finalBagVolumeMl = totalVolumeMl + freeWaterNeededMl;
  const infusionRateMlHr = finalBagVolumeMl / 24;

  const lipidMaxGKg = input.population === "pediatric" ? 3 : 2.5;
  const lipidExceedsMax = lipGKg > lipidMaxGKg;

  const girMaxMgKgMin = input.population === "pediatric" ? 13 : 5;
  const girExceedsMax = girMgKgMin > girMaxMgKgMin;

  return {
    wt, targetFluidMl,
    totalProteinG, aaVolumeMl, proteinKcal, nitrogenG,
    totalDextroseG, dexVolumeMl, dextroseKcal, girMgKgMin,
    totalLipidG, lipVolumeMl, lipidKcal,
    nonProteinKcal, totalKcal, kcalPerKg, nonProteinKcalPerGN,
    dextrosePctOfNonProtein, lipidPctOfNonProtein, lipidPctOfTotalKcal,
    mviVol, traceVol, electrolyteMOsm, electrolyteAddedVolMl, totalMOsmLoad,
    totalVolumeMl, finalOsmolarity,
    exceedsPeripheralLimit, nearPeripheralLimit,
    volumeDifferenceMl, freeWaterNeededMl, finalBagVolumeMl, infusionRateMlHr,
    lipidMaxGKg, lipidExceedsMax, girMaxMgKgMin, girExceedsMax,
    isValid: wt > 0 && targetFluidMl > 0,
  };
}

export type TpnCalculation = ReturnType<typeof calculateTpn>;
