/**
 * The science behind the "Physical Properties of Liquids" practical (Pharmaceutics lab,
 * owner's shortlist 2026-10-25): the reference property data of the three samples, their
 * temperature dependence, and the small helpers the experiment needs (concordance, %
 * difference, flow time, mixing of a carried-over residue).
 *
 * PURE: no React, no DOM, no renderer. Units are in every name or comment. Invalid input
 * returns NaN (never throws), as in calculations/pharmaceutics.ts, whose tested equations
 * (pycnometer, ostwaldViscosity, capillaryRise*, relativeCapillaryTension) the experiment
 * uses for the method itself.
 *
 * WHERE EVERY NUMBER COMES FROM (published values, not invented):
 *  - Water: the shared tables in calculations/pharmaceutics.ts (Kell/CRC density, IAPWS 2008
 *    viscosity, IAPWS 2014 surface tension), linearly interpolated between 15, 20, 25, 30 °C.
 *  - Ethanol (absolute):
 *      density 0.78945 g/mL at 20 °C and 0.78522 g/mL at 25 °C — Lange's Handbook of Chemistry,
 *        10th ed., as tabulated at https://www.chemeurope.com/en/encyclopedia/Ethanol_(data_page).html
 *        (linear between them, −0.000846 g/mL per °C);
 *      viscosity 1.074 mPa·s at 25 °C and 0.694 mPa·s at 50 °C — CRC Handbook of Chemistry and
 *        Physics, 95th ed., p. 6-2, via PubChem CID 702 (https://pubchem.ncbi.nlm.nih.gov/compound/702),
 *        joined by the Andrade equation ln η = A + B/T. CONFLICT: other compilations differ by ~3 % at
 *        25 °C (CHERIC, via the chemeurope page above, gives 1.040). This module uses CRC and says so
 *        on screen; the report's acceptance band is wider than the method's precision for that reason;
 *      surface tension γ = 24.05 − 0.0832·t mN/m — Jasper, J. Phys. Chem. Ref. Data 1, 841 (1972),
 *        https://doi.org/10.1063/1.3253106 (22.39 at 20 °C; 21.97 at 25 °C, the CRC 95th ed. value).
 *  - Glycerol–water, 50 % w/w (the strength this practical uses):
 *      density — Volk & Kähler, Exp. Fluids 59, 75 (2018), https://doi.org/10.1007/s00348-018-2527-y,
 *        fitted to Bosart & Snoddy (1928); < 0.07 % error at 15–30 °C. Coefficients copied from the
 *        authors' published MATLAB function (the article's supplementary file 1);
 *      viscosity — Cheng, Ind. Eng. Chem. Res. 47, 3285 (2008), https://doi.org/10.1021/ie071349z,
 *        fitted to Segur & Oberstar (1951) / Glycerine Producers' Association data (gives
 *        6.0 mPa·s at 20 °C for 50 % w/w, the tabulated value);
 *      surface tension — TEACHING ESTIMATE, UNVERIFIED (sources conflict, ~61–71 mN/m): 70.0 mN/m at 18 °C for 50 % w/w (International Critical
 *        Tables, as reproduced in Lange's Handbook), carried to other temperatures with the same
 *        relative temperature coefficient as water. Labelled a teaching estimate on screen.
 *  The compiled list, with every conflict and unverified value: docs/virtual-labs/PHARMACEUTICS_REFERENCE_DATA.md.
 *
 * Everything the simulation adds on top of those data (viscometer constant, bath and item time
 * constants, residue volumes, reaction-time scatter) is a TEACHING VALUE, named as such in the
 * experiment's METHOD object.
 */
import { WATER_DENSITY, WATER_SURFACE_TENSION, WATER_VISCOSITY } from "./pharmaceutics";

export type Liquid = "water" | "ethanol" | "glycerol";
export const LIQUIDS: Liquid[] = ["water", "ethanol", "glycerol"];
/** The glycerol–water mixture's strength, mass fraction of glycerol. */
export const GLYCEROL_MASS_FRACTION = 0.5;

const ok = (...xs: number[]) => xs.every((x) => Number.isFinite(x));

/** Linear interpolation in a {°C: value} table; NaN outside the table's range. */
export function interpTable(table: Record<number, number>, tC: number): number {
  if (!ok(tC)) return NaN;
  const ts = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (tC < ts[0] - 1e-9 || tC > ts[ts.length - 1] + 1e-9) return NaN;
  for (let i = 1; i < ts.length; i++) {
    if (tC <= ts[i] + 1e-9) {
      const [a, b] = [ts[i - 1], ts[i]];
      return table[a] + ((tC - a) / (b - a)) * (table[b] - table[a]);
    }
  }
  return table[ts[ts.length - 1]];
}

export const waterDensity = (tC: number) => interpTable(WATER_DENSITY, tC); // g/mL
export const waterViscosity = (tC: number) => interpTable(WATER_VISCOSITY, tC); // mPa·s
export const waterSurfaceTension = (tC: number) => interpTable(WATER_SURFACE_TENSION, tC); // mN/m

/** The data are used only where they were measured or validated. */
const inRange = (tC: number) => ok(tC) && tC >= 15 && tC <= 30;

// ── Ethanol ────────────────────────────────────────────────────────────────

const ETH_RHO_20 = 0.78945;
const ETH_RHO_25 = 0.78522;
/** Ethanol density, g/mL (Lange's table, linear between 20 and 25 °C; used 15–30 °C). */
export function ethanolDensity(tC: number): number {
  return inRange(tC) ? ETH_RHO_25 + ((ETH_RHO_25 - ETH_RHO_20) / 5) * (tC - 25) : NaN;
}

const ETH_ETA_25 = 1.074;
const ETH_ETA_50 = 0.694;
const K = (tC: number) => tC + 273.15;
/** Andrade B (K) from the two CRC values: B = ln(η25/η50) / (1/T25 − 1/T50). */
export const ETHANOL_ANDRADE_B = Math.log(ETH_ETA_25 / ETH_ETA_50) / (1 / K(25) - 1 / K(50));
/** Ethanol viscosity, mPa·s (Andrade through CRC 25 and 50 °C). */
export function ethanolViscosity(tC: number): number {
  return inRange(tC) ? ETH_ETA_25 * Math.exp(ETHANOL_ANDRADE_B * (1 / K(tC) - 1 / K(25))) : NaN;
}

/** Ethanol surface tension against air, mN/m (Jasper 1972). */
export function ethanolSurfaceTension(tC: number): number {
  return inRange(tC) ? 24.05 - 0.0832 * tC : NaN;
}

// ── Glycerol–water ─────────────────────────────────────────────────────────

/** Volk & Kähler (2018) density of an aqueous glycerol solution, g/mL. w = mass fraction of glycerol (0–1). */
export function glycerolWaterDensity(w: number, tC: number): number {
  if (!ok(w, tC) || w < 0 || w > 1 || tC < 0 || tC > 100) return NaN;
  const c = 1.78e-6 * tC * tC - 1.82e-4 * tC + 1.41e-2;
  const contraction = 1 + c * Math.pow(Math.sin(Math.pow(w, 1.31) * Math.PI), 0.81);
  const rhoW = 1000 * (1 - Math.pow(Math.abs((tC - 3.98) / 615), 1.71));
  const rhoG = 1273 - tC * 0.612;
  if (w === 0) return (contraction * rhoW) / 1000;
  const rho = contraction * (rhoW + (rhoG - rhoW) / (1 + (rhoG / rhoW) * (1 / w - 1)));
  return rho / 1000; // kg/m³ → g/mL
}

/** Cheng (2008) viscosity of an aqueous glycerol solution, mPa·s. */
export function glycerolWaterViscosity(w: number, tC: number): number {
  if (!ok(w, tC) || w < 0 || w > 1 || tC < 0 || tC > 100) return NaN;
  const muW = 1.79 * Math.exp(((-1230 - tC) * tC) / (36100 + 360 * tC));
  const muG = 12100 * Math.exp(((-1233 + tC) * tC) / (9900 + 70 * tC));
  const a = 0.705 - 0.0017 * tC;
  const b = (4.9 + 0.036 * tC) * Math.pow(a, 2.5);
  const alpha = 1 - w + (a * b * w * (1 - w)) / (a * w + b * (1 - w));
  return muG * Math.exp(Math.log(muW / muG) * alpha);
}

/** Teaching estimate: 50 % w/w glycerol at 18 °C, 70.0 mN/m (ICT via Lange's), as a ratio to water at 18 °C. */
export const GLYCEROL50_TENSION_RATIO = 70.0 / waterSurfaceTension(18);
/** Surface tension of the 50 % w/w mixture, mN/m — a teaching estimate (see the module comment). */
export function glycerolSurfaceTension(tC: number): number {
  return inRange(tC) ? GLYCEROL50_TENSION_RATIO * waterSurfaceTension(tC) : NaN;
}

// ── All three together ─────────────────────────────────────────────────────

export interface LiquidData {
  /** g/mL */ rho: number;
  /** mPa·s */ eta: number;
  /** mN/m */ gamma: number;
}

/** Reference properties of a sample at tC (15–30 °C). */
export function liquidData(liquid: Liquid, tC: number): LiquidData {
  switch (liquid) {
    case "water":
      return { rho: waterDensity(tC), eta: waterViscosity(tC), gamma: waterSurfaceTension(tC) };
    case "ethanol":
      return { rho: ethanolDensity(tC), eta: ethanolViscosity(tC), gamma: ethanolSurfaceTension(tC) };
    case "glycerol":
      return inRange(tC)
        ? { rho: glycerolWaterDensity(GLYCEROL_MASS_FRACTION, tC), eta: glycerolWaterViscosity(GLYCEROL_MASS_FRACTION, tC), gamma: glycerolSurfaceTension(tC) }
        : { rho: NaN, eta: NaN, gamma: NaN };
  }
}

/** Kinematic viscosity ν = η / ρ: mPa·s ÷ g/mL = mm²/s. */
export function kinematicViscosity(etaMPaS: number, rhoGPerMl: number): number {
  return ok(etaMPaS, rhoGPerMl) && etaMPaS > 0 && rhoGPerMl > 0 ? etaMPaS / rhoGPerMl : NaN;
}

/** Ostwald flow time, s, for a viscometer constant C (mm²/s²): t = ν / C. */
export function flowTime(nuMm2PerS: number, cMm2PerS2: number): number {
  return ok(nuMm2PerS, cMm2PerS2) && nuMm2PerS > 0 && cMm2PerS2 > 0 ? nuMm2PerS / cMm2PerS2 : NaN;
}

/**
 * Kinematic viscosity of a liquid contaminated by a small volume fraction φ of a residue —
 * the Arrhenius (1887) logarithmic mixing rule, ln ν = (1 − φ) ln ν_liquid + φ ln ν_residue.
 * An approximation, used only to give a carried-over residue an effect of the right sign
 * and a plausible size.
 */
export function mixedKinematic(nuLiquid: number, nuResidue: number, phiResidue: number): number {
  if (!ok(nuLiquid, nuResidue, phiResidue) || nuLiquid <= 0 || nuResidue <= 0 || phiResidue < 0 || phiResidue > 1) return NaN;
  return Math.exp((1 - phiResidue) * Math.log(nuLiquid) + phiResidue * Math.log(nuResidue));
}

/**
 * Concordant times: the most recent `n` recorded values whose range is within `maxRange` (s).
 * Returns the set and its mean, or null when the latest `n` do not agree.
 */
export function concordant(times: number[], n = 3, maxRange = 0.5): { set: number[]; mean: number } | null {
  if (times.length < n || times.some((t) => !ok(t))) return null;
  const set = times.slice(-n);
  if (Math.max(...set) - Math.min(...set) > maxRange + 1e-9) return null;
  return { set, mean: set.reduce((a, b) => a + b, 0) / n };
}

/** Signed % difference of a measured value from a reference: (measured − reference) ÷ reference × 100. */
export function percentDifference(measured: number, reference: number): number {
  return ok(measured, reference) && reference !== 0 ? ((measured - reference) / reference) * 100 : NaN;
}

/** The rise read ALONG a tube tilted by `tiltDeg` from vertical, for a true vertical rise h (mm): h / cos(tilt). */
export function readingAlongTilt(hMm: number, tiltDeg: number): number {
  return ok(hMm, tiltDeg) && hMm >= 0 && tiltDeg >= 0 && tiltDeg < 90 ? hMm / Math.cos((tiltDeg * Math.PI) / 180) : NaN;
}
