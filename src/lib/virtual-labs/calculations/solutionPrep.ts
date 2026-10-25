/**
 * Solution preparation & dilution — the experiment-specific science (2026-10-25), on top of
 * the tested formulas in `pharmaceutics.ts`.
 *
 * PURE: no React, no DOM, no renderer. Units are in every name or comment. Invalid input gives
 * NaN (never a throw), so the experiment can refuse an action with an explanation.
 *
 * Sodium chloride constants are published values (sources inline). The volume model is a
 * teaching approximation that is still physically honest: a crystal occupies its own volume,
 * and once dissolved it occupies its (smaller) apparent molar volume — so a flask made up to
 * the mark over undissolved crystals ends up slightly BELOW the mark once they dissolve.
 */
import { massConcentration, massForMolarity, molarity, percentWv } from "./pharmaceutics";

export type ConcUnit = "% w/v" | "mg/mL" | "mol/L";

/** Sodium chloride, NaCl: Mr = 22.990 + 35.453 = 58.44 g/mol (IUPAC standard atomic weights; PubChem CID 5234). */
export const NACL_MR = 58.44;
/** Density of crystalline NaCl, g/cm³ (CRC Handbook of Chemistry and Physics, "Physical constants of inorganic compounds"). */
export const NACL_SOLID_DENSITY = 2.165;
/**
 * Apparent molar volume of NaCl in water at infinite dilution, 25 °C, cm³/mol (≈ 16.6; Millero,
 * "The molal volumes of electrolytes", Chem. Rev. 1971, 71, 147). At 0.15 mol/L the true value is
 * a little higher (~17.5); the difference moves a 100 mL flask by < 0.02 mL, below what the lab
 * draws, so the infinite-dilution value is used throughout.
 */
export const NACL_APPARENT_MOLAR_VOLUME = 16.6;

/** Volume (mL) one gram of NaCl occupies as crystals: 1 / ρ. */
export const SOLID_ML_PER_G = 1 / NACL_SOLID_DENSITY; // 0.4619 mL/g
/** Volume (mL) one gram of NaCl adds to a solution once dissolved: φV / Mr. */
export const DISSOLVED_ML_PER_G = NACL_APPARENT_MOLAR_VOLUME / NACL_MR; // 0.2841 mL/g

const fin = (...xs: number[]) => xs.every((x) => Number.isFinite(x));

/**
 * Mass of solute (g) for `volumeMl` of a solution of concentration `conc` in `unit`.
 *   % w/v : m = C(g/100 mL) × V / 100
 *   mg/mL : m = C(mg/mL) × V(mL) / 1000
 *   mol/L : m = C(mol/L) × V(L) × Mr(g/mol)
 */
export function massForConcentration(unit: ConcUnit, conc: number, volumeMl: number, mr = NACL_MR): number {
  if (!fin(conc, volumeMl, mr) || conc <= 0 || volumeMl <= 0 || mr <= 0) return NaN;
  if (unit === "% w/v") return (conc * volumeMl) / 100;
  if (unit === "mg/mL") return (conc * volumeMl) / 1000;
  return massForMolarity(conc, mr, volumeMl);
}

/** Concentration in `unit` of `massG` g dissolved to `volumeMl` mL. */
export function concentrationFromMass(unit: ConcUnit, massG: number, volumeMl: number, mr = NACL_MR): number {
  if (unit === "% w/v") return percentWv(massG, volumeMl);
  if (unit === "mg/mL") return massConcentration(massG * 1000, volumeMl);
  return molarity(massG, mr, volumeMl);
}

/** Convert a concentration in g/mL to `unit`. */
export function fromGPerMl(unit: ConcUnit, gPerMl: number, mr = NACL_MR): number {
  if (!fin(gPerMl, mr) || gPerMl < 0 || mr <= 0) return NaN;
  if (unit === "% w/v") return gPerMl * 100;
  if (unit === "mg/mL") return gPerMl * 1000;
  return (gPerMl * 1000) / mr;
}

/** Volume (mL) of water + dissolved NaCl + undissolved crystals — what the meniscus sees. */
export function solutionVolumeMl(waterMl: number, dissolvedG: number, solidG = 0): number {
  if (!fin(waterMl, dissolvedG, solidG) || waterMl < 0 || dissolvedG < 0 || solidG < 0) return NaN;
  return waterMl + dissolvedG * DISSOLVED_ML_PER_G + solidG * SOLID_ML_PER_G;
}

/**
 * True concentration (g/mL) once every crystal has dissolved: total NaCl over the volume the
 * liquid will occupy then. This is what an assay of the flask would find.
 */
export function trueConcentrationGPerMl(waterMl: number, dissolvedG: number, solidG = 0): number {
  const total = dissolvedG + solidG;
  const v = solutionVolumeMl(waterMl, total, 0);
  return Number.isFinite(v) && v > 0 ? total / v : NaN;
}

export type MeniscusPosition = "empty" | "below" | "at" | "above";

/** Where the bottom of the meniscus sits against a one-mark line, within ±`bandMl` counted as "at". */
export function meniscusPosition(volumeMl: number, markMl: number, bandMl: number): MeniscusPosition {
  if (!fin(volumeMl, markMl, bandMl) || volumeMl <= 0) return "empty";
  if (volumeMl < markMl - bandMl) return "below";
  if (volumeMl <= markMl + bandMl) return "at";
  return "above";
}

/** (actual − target) ÷ target × 100. NaN for a non-positive target. */
export function deviationPercent(actual: number, target: number): number {
  return fin(actual, target) && target > 0 ? ((actual - target) / target) * 100 : NaN;
}

/** True when `value` is within `rel` (a fraction, e.g. 0.001 = 0.1 %) of `expected`. */
export function withinRelative(value: number, expected: number, rel: number): boolean {
  return fin(value, expected, rel) && expected > 0 && Math.abs(value - expected) <= rel * expected;
}

/** Four significant figures, as a string, for reporting a concentration. */
export function fourSf(x: number): string {
  return Number.isFinite(x) ? x.toPrecision(4) : "—";
}
