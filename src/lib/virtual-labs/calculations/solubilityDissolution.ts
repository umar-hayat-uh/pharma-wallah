/**
 * The extra science for the Pharmaceutics "Solubility & Dissolution Studies" module
 * (2026-10-25). The shared, tested formulas (gravimetric solubility, USP descriptive terms,
 * parts of solvent, the cumulative-dissolution sampling corrections, first-order release)
 * live in `pharmaceutics.ts`; this file adds the paracetamol data and the teaching models
 * the experiment needs.
 *
 * PURE: no React, no DOM, no renderer. Inputs and outputs in the units their names state;
 * invalid input gives NaN (never throws).
 *
 * PUBLISHED DATA vs TEACHING VALUES — every constant says which it is.
 */

const fin = (...xs: number[]) => xs.every((x) => Number.isFinite(x));
const pos = (...xs: number[]) => xs.every((x) => Number.isFinite(x) && x > 0);

// ── Paracetamol in water: published solubility ────────────────────────────

/**
 * Solubility of paracetamol in water, g of paracetamol per kg of WATER (solvent, not
 * solution), measured gravimetrically with excess solid after ≥ 72 h of agitation.
 * PUBLISHED DATA: Granberg R. A., Rasmuson Å. C., "Solubility of Paracetamol in Pure
 * Solvents", J. Chem. Eng. Data 1999, 44, 1391–1395 (doi:10.1021/je990124v), Table 2
 * (0–25 °C) and Table 1 (30 °C: 17.39 ± 0.02 g/kg, n = 7).
 *
 * The data cover 0–30 °C only — no value at 37 °C is verified, which is why the solubility
 * activity runs at 25 °C. At 25 °C the data give ≈ 68 parts of water per part, i.e. USP
 * "sparingly soluble" (30–100 parts). The Merck Index's "very slightly soluble in cold water"
 * contradicts the measured data; the lab follows the measurements.
 */
export const PARACETAMOL_SOLUBILITY_WATER: readonly (readonly [number, number])[] = [
  [0, 7.21],
  [5, 8.21],
  [10, 9.44],
  [15, 10.97],
  [20, 12.78],
  [25, 14.9],
  [30, 17.39],
];

const K = (tC: number) => tC + 273.15;

/**
 * Paracetamol solubility in water (g/kg water) at `tC` °C. At a tabulated temperature it
 * returns the published value exactly; between two, it interpolates ln(Cs) linearly in 1/T
 * (a piecewise van 't Hoff relation), so temperature always moves the result consistently
 * with the data. Outside the measured 0–30 °C range it returns NaN rather than extrapolate.
 */
export function paracetamolSolubility(tC: number): number {
  const t = PARACETAMOL_SOLUBILITY_WATER;
  if (!fin(tC) || tC < t[0][0] || tC > t[t.length - 1][0]) return NaN;
  for (let i = 0; i < t.length; i++) if (Math.abs(tC - t[i][0]) < 1e-9) return t[i][1];
  for (let i = 1; i < t.length; i++) {
    if (tC < t[i][0]) {
      const [t0, c0] = t[i - 1];
      const [t1, c1] = t[i];
      const f = (1 / K(tC) - 1 / K(t0)) / (1 / K(t1) - 1 / K(t0));
      return Math.exp(Math.log(c0) + f * (Math.log(c1) - Math.log(c0)));
    }
  }
  return NaN;
}

/**
 * Least-squares van 't Hoff fit, ln Cs = a + b/T, over (t °C, Cs) points. The apparent
 * enthalpy of solution is ΔH = −b·R (kJ/mol). For the water data above ΔH ≈ +19 kJ/mol:
 * dissolution is endothermic, so solubility rises with temperature.
 */
export function vantHoffFit(points: readonly (readonly [number, number])[]): { a: number; b: number; dHkJPerMol: number; r2: number } {
  const pts = points.filter(([t, c]) => fin(t, c) && c > 0);
  if (pts.length < 2) return { a: NaN, b: NaN, dHkJPerMol: NaN, r2: NaN };
  const xs = pts.map(([t]) => 1 / K(t));
  const ys = pts.map(([, c]) => Math.log(c));
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  const b = sxy / sxx;
  const a = my - b * mx;
  return { a, b, dHkJPerMol: (-b * 8.314462618) / 1000, r2: syy > 0 ? (sxy * sxy) / (sxx * syy) : 1 };
}

/**
 * g per kg of solvent → g per 100 mL of SOLUTION: w = Cs/(1000 + Cs) is the mass fraction,
 * times the solution density (g/mL) × 100. TEACHING ASSUMPTION (stated on screen): the
 * density of a dilute (≈ 1.5 % w/w) paracetamol solution is taken as that of water at the
 * same temperature; the error this introduces is well under 1 %.
 */
export function gPerKgToGPer100Ml(gPerKgSolvent: number, solutionDensityGPerMl: number): number {
  if (!fin(gPerKgSolvent) || gPerKgSolvent < 0 || !pos(solutionDensityGPerMl)) return NaN;
  return (gPerKgSolvent / (1000 + gPerKgSolvent)) * solutionDensityGPerMl * 100;
}

/**
 * Exponential approach to saturation over `hours`: dissolved → cap with time constant
 * `tauH` (h). Works both ways: a supersaturated solution (dissolved > cap, e.g. after the
 * temperature is lowered) relaxes down to the cap. TEACHING MODEL — the real rate depends
 * on particle size and agitation; Granberg & Rasmuson found ~5 h to equilibrium with
 * stirring (acetone), and equilibrated water for ≥ 72 h.
 */
export function approachSaturation(dissolvedG: number, capG: number, hours: number, tauH: number): number {
  if (!fin(dissolvedG, capG, hours) || hours < 0 || !pos(tauH)) return NaN;
  return capG + (dissolvedG - capG) * Math.exp(-hours / tauH);
}

/** Dried to constant mass: two consecutive weighings (g), the second after further drying, differ by ≤ `tolG` (Ph. Eur.: 0.5 mg). */
export function isConstantMass(previousG: number, latestG: number, tolG = 0.0005): boolean {
  return fin(previousG, latestG) && Math.abs(latestG - previousG) <= tolG + 1e-12;
}

// ── Dissolution ───────────────────────────────────────────────────────────

/** Volume (mL) of medium that the whole dose would saturate: dose (mg) ÷ solubility (mg/mL). */
export function saturationVolumeMl(doseMg: number, solubilityMgPerMl: number): number {
  return pos(doseMg, solubilityMgPerMl) ? doseMg / solubilityMgPerMl : NaN;
}

/**
 * Sink-condition ratio: medium volume ÷ the volume the dose would saturate. USP ⟨1092⟩
 * describes sink conditions as a medium volume at least three times that needed to form a
 * saturated solution of the drug, i.e. ratio ≥ 3.
 */
export function sinkRatio(mediumMl: number, doseMg: number, solubilityMgPerMl: number): number {
  const v = saturationVolumeMl(doseMg, solubilityMgPerMl);
  return pos(mediumMl) && Number.isFinite(v) ? mediumMl / v : NaN;
}

/**
 * First-order rate constant k (min⁻¹) at a paddle speed and a medium temperature, from a
 * reference value. TEACHING RELATION (labelled on screen): k ∝ (rpm)^α through the
 * thinning of the diffusion boundary layer (α = 0.5 by default), and an Arrhenius-type
 * temperature term with an apparent activation energy for a diffusion-controlled process
 * (default 20 kJ/mol). Neither exponent is a measured property of any product.
 */
export function releaseRateConstant(
  kRef: number,
  rpm: number,
  tempC: number,
  opts: { rpmRef?: number; tempRefC?: number; rpmExponent?: number; eaKJPerMol?: number } = {},
): number {
  const { rpmRef = 50, tempRefC = 37, rpmExponent = 0.5, eaKJPerMol = 20 } = opts;
  if (!pos(kRef, rpmRef) || !fin(rpm, tempC, tempRefC, rpmExponent, eaKJPerMol) || rpm < 0 || tempC <= -273.15) return NaN;
  if (rpm === 0) return 0;
  const tTerm = Math.exp(((-eaKJPerMol * 1000) / 8.314462618) * (1 / K(tempC) - 1 / K(tempRefC)));
  return kRef * (rpm / rpmRef) ** rpmExponent * tTerm;
}

/** One first-order step: the released fraction F moves toward Fmax by 1 − e^(−k·dt). */
export function stepFirstOrder(f: number, fMax: number, k: number, dtMin: number): number {
  if (!fin(f, fMax, k, dtMin) || k < 0 || dtMin < 0) return NaN;
  if (f >= fMax) return f;
  return fMax - (fMax - f) * Math.exp(-k * dtMin);
}

/** Beer–Lambert calibration line: A = slope · C + intercept (C in µg/mL, 1 cm cell). */
export function absorbanceFor(cUgPerMl: number, slope: number, intercept: number): number {
  return fin(cUgPerMl, slope, intercept) && cUgPerMl >= 0 ? slope * cUgPerMl + intercept : NaN;
}

/** Inverse calibration: C (µg/mL in the cuvette) = (A − intercept) ÷ slope. */
export function concentrationFromAbsorbance(a: number, slope: number, intercept: number): number {
  if (!fin(a, intercept) || !pos(slope)) return NaN;
  return Math.max(0, (a - intercept) / slope);
}

/** Concentration of the withdrawn sample (mg/mL) from the cuvette reading and the dilution factor applied before reading. */
export function sampleConcentrationMgPerMl(a: number, slope: number, intercept: number, dilutionFactor: number): number {
  const c = concentrationFromAbsorbance(a, slope, intercept);
  return Number.isFinite(c) && Number.isFinite(dilutionFactor) && dilutionFactor >= 1 ? (c * dilutionFactor) / 1000 : NaN;
}

/**
 * What a spectrophotometer DISPLAYS for a solution whose ideal (linear) absorbance is
 * `aLinear`. Up to `linearMax` the display follows Beer's law; above it, stray light and
 * instrument non-linearity make the reading fall BELOW the line (a negative deviation),
 * modelled as A − c·(A − linearMax)² — a TEACHING MODEL. Above `overRange` the instrument
 * shows OVER (NaN here).
 */
export function displayedAbsorbance(aLinear: number, linearMax = 1.0, curvature = 0.08, overRange = 3.0): number {
  if (!fin(aLinear, linearMax, curvature, overRange)) return NaN;
  if (aLinear > overRange) return NaN;
  if (aLinear <= linearMax) return aLinear;
  return aLinear - curvature * (aLinear - linearMax) ** 2;
}

/**
 * Sampling-time tolerance (min) for a scheduled time point. USP ⟨711⟩ allows ±2 % of the
 * stated time; the lab adds a TEACHING floor of 0.25 min so the earliest points can be hit
 * with the timer's 0.5-min steps.
 */
export function samplingTolerance(nominalMin: number, floorMin = 0.25): number {
  return pos(nominalMin) ? Math.max(0.02 * nominalMin, floorMin) : NaN;
}

/**
 * Teaching acceptance criterion for ONE unit, modelled on USP ⟨711⟩ stage S1 (each unit
 * not less than Q + 5 %). A real S1 test uses six units; the verdict here is for the single
 * tablet tested and is never a pharmacopoeial compliance claim.
 */
export function meetsS1Unit(percentDissolved: number, q: number): boolean {
  return fin(percentDissolved, q) && percentDissolved >= q + 5;
}
