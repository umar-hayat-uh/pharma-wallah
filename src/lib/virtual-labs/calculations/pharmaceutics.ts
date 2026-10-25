/**
 * The science for the Pharmaceutics lab's three shortlisted experiments (owner's brief,
 * 2026-10-25): solution preparation & dilution, physical properties of liquids (density /
 * specific gravity, viscosity, surface tension), and solubility & dissolution.
 *
 * PURE: no React, no DOM, no renderer. Every function takes and returns numbers in the units
 * its name or comment states and returns NaN for invalid input (never throws), so an
 * experiment can refuse the action with an explanation rather than crash.
 *
 * Reference constants are published values, sourced inline. Method choices that are a
 * teaching simplification say so in their comment.
 */

const ok = (...xs: number[]) => xs.every((x) => Number.isFinite(x));
const pos = (...xs: number[]) => xs.every((x) => Number.isFinite(x) && x > 0);

/** Round to `n` significant figures (n ≥ 1). 0 stays 0; non-finite passes through. */
export function sigFig(x: number, n: number): number {
  if (!Number.isFinite(x) || x === 0) return x;
  const k = Math.max(1, Math.floor(n));
  return Number(x.toPrecision(k));
}

// ── 1. Solution preparation & dilution ────────────────────────────────────

/** Mass concentration (mg/mL ≡ g/L) of `massMg` dissolved to `volumeMl`. */
export function massConcentration(massMg: number, volumeMl: number): number {
  return ok(massMg) && massMg >= 0 && pos(volumeMl) ? massMg / volumeMl : NaN;
}

/** Percentage strength % w/v (g per 100 mL). */
export function percentWv(massG: number, volumeMl: number): number {
  return ok(massG) && massG >= 0 && pos(volumeMl) ? (massG / volumeMl) * 100 : NaN;
}

/** Molar concentration (mol/L): C = m / (Mr · V). Mass g, Mr g/mol, volume mL. */
export function molarity(massG: number, mrGPerMol: number, volumeMl: number): number {
  return ok(massG) && massG >= 0 && pos(mrGPerMol, volumeMl) ? massG / mrGPerMol / (volumeMl / 1000) : NaN;
}

/** Mass (g) of solute needed for `molar` mol/L in `volumeMl` mL: m = C · V · Mr. */
export function massForMolarity(molar: number, mrGPerMol: number, volumeMl: number): number {
  return pos(molar, mrGPerMol, volumeMl) ? molar * (volumeMl / 1000) * mrGPerMol : NaN;
}

/**
 * Stock volume V1 for C1·V1 = C2·V2 (any one concentration unit for C1 and C2, any one volume
 * unit for V1 and V2). A dilution cannot concentrate: C2 > C1 is invalid, and so is V1 > V2.
 */
export function dilutionStockVolume(c1: number, c2: number, v2: number): number {
  if (!pos(c1, c2, v2) || c2 > c1) return NaN;
  return (c2 * v2) / c1;
}

/** Concentration after each stage of a serial dilution, stage i diluted by factor `factors[i]` (≥ 1). */
export function serialDilution(c0: number, factors: number[]): number[] {
  if (!pos(c0) || factors.length === 0 || factors.some((f) => !Number.isFinite(f) || f < 1)) return [];
  const out: number[] = [];
  let c = c0;
  for (const f of factors) {
    c = c / f;
    out.push(c);
  }
  return out;
}

/** Dilution factor of one stage: final volume ÷ aliquot volume. */
export function dilutionFactor(aliquotMl: number, finalMl: number): number {
  return pos(aliquotMl, finalMl) && aliquotMl <= finalMl ? finalMl / aliquotMl : NaN;
}

// ── 2. Physical properties of liquids ─────────────────────────────────────

/**
 * Density of air-free water (g/mL) at 15–30 °C and 0.1 MPa, as tabulated in the CRC Handbook of
 * Chemistry and Physics ("Properties of water in the range 0–100 °C"). Re-checked 2026-10-25 against
 * the NIST Chemistry WebBook (IAPWS-95): 0.999103 / 0.998207 / 0.997048 / 0.995649 g/mL — every
 * value below is that number rounded to 5 decimals.
 */
export const WATER_DENSITY: Record<number, number> = {
  15: 0.99910, 20: 0.99821, 25: 0.99705, 30: 0.99565,
};
/**
 * Dynamic viscosity of water (mPa·s) at 0.1 MPa — IAPWS 2008 (Huber et al., J. Phys. Chem. Ref.
 * Data 38, 101). Re-derived 2026-10-25 from the release's equations (check value 889.735100 µPa·s
 * at 298.15 K / 998 kg/m³ reproduced) and the NIST WebBook: 1.13757 / 1.00160 / 0.890022 / 0.797222.
 * 15 °C was 1.1375 before 2026-10-25; 1.13757 rounds to 1.1376.
 */
export const WATER_VISCOSITY: Record<number, number> = {
  15: 1.1376, 20: 1.0016, 25: 0.8900, 30: 0.7972,
};
/**
 * Surface tension of water against air (mN/m) — IAPWS R1-76(2014): σ = 235.8 τ^1.256 (1 − 0.625 τ),
 * τ = 1 − T/647.096 K. Re-derived 2026-10-25: 73.486 / 72.736 / 71.972 / 71.194 mN/m.
 * 30 °C was 71.18 before 2026-10-25; 71.194 rounds to 71.19.
 */
export const WATER_SURFACE_TENSION: Record<number, number> = {
  15: 73.49, 20: 72.74, 25: 71.97, 30: 71.19,
};
/** Standard gravity, m/s² (CGPM 1901). */
export const G = 9.80665;

/** Density ρ = m / V (g/mL). */
export function density(massG: number, volumeMl: number): number {
  return ok(massG) && massG >= 0 && pos(volumeMl) ? massG / volumeMl : NaN;
}

/** Specific gravity (dimensionless) = ρ_sample ÷ ρ_reference, both in the same unit and at the stated temperatures. */
export function specificGravity(rhoSample: number, rhoReference: number): number {
  return pos(rhoSample, rhoReference) ? rhoSample / rhoReference : NaN;
}

/**
 * Pycnometer (specific-gravity bottle) method, all weighings in g at one temperature t:
 * SG(t/t) = (m_sample-filled − m_empty) ÷ (m_water-filled − m_empty); ρ_sample = SG · ρ_water(t).
 * The bottle's own volume cancels, which is why the method does not need it.
 * The ratio of weighings in air is exactly what USP <841> calls specific gravity. Converting it to a
 * density as SG · ρ_water ignores air buoyancy (≈ 0.0012 g/mL), an error of ρ_air·(1 − SG): about
 * −0.0003 g/mL for SG 1.26, +0.0003 g/mL for ethanol — below a teaching balance's resolution here.
 */
export function pycnometer(emptyG: number, sampleFilledG: number, waterFilledG: number, rhoWater: number) {
  const ms = sampleFilledG - emptyG;
  const mw = waterFilledG - emptyG;
  if (!ok(emptyG, sampleFilledG, waterFilledG) || !pos(ms, mw, rhoWater)) return { sg: NaN, density: NaN, volumeMl: NaN };
  const sg = ms / mw;
  return { sg, density: sg * rhoWater, volumeMl: mw / rhoWater };
}

/**
 * Ostwald (U-tube capillary) viscometer, relative method against water in the SAME viscometer at
 * the SAME temperature: η1 / η2 = (ρ1 · t1) / (ρ2 · t2) (i.e. ν = K·t with one constant K).
 * Valid for Newtonian liquids with flow times long enough that the kinetic-energy correction is
 * negligible. ISO 3105 sets a 200 s minimum flow time for most BS/U-tube sizes (300 s for size A,
 * whose constant is ≈ 0.003 mm²/s² per the Cannon size-A listing); teaching Ostwald tubes are often
 * run faster, which adds a small, uncorrected kinetic-energy error — a teaching simplification.
 * Returns η of the sample in the unit of `etaRef`.
 */
export function ostwaldViscosity(rhoSample: number, tSampleS: number, rhoRef: number, tRefS: number, etaRef: number): number {
  return pos(rhoSample, tSampleS, rhoRef, tRefS, etaRef) ? etaRef * ((rhoSample * tSampleS) / (rhoRef * tRefS)) : NaN;
}

/**
 * Capillary rise, absolute: γ = ρ g h r / (2 cos θ). Inputs ρ g/mL, h mm, r mm, θ degrees;
 * returns mN/m (Jurin's law). Assumes a clean, uniform-bore, vertical capillary whose radius is
 * small against the liquid's capillary length √(γ/ρg) (≈ 2.7 mm for water at 20 °C), so the
 * meniscus is a hemisphere, and ignores two small terms: the meniscus-volume correction (≈ r/3
 * added to h; 0.14 % for r = 0.25 mm, h ≈ 59 mm) and air density (strictly Δρ = ρ − ρ_air;
 * 0.12 % for water). θ ≈ 0 for water and most aqueous liquids on clean glass; θ ≥ 90° gives no
 * rise (NaN).
 */
export function capillaryRiseTension(rhoGPerMl: number, hMm: number, rMm: number, thetaDeg = 0): number {
  if (!pos(rhoGPerMl, hMm, rMm) || !ok(thetaDeg) || thetaDeg < 0 || thetaDeg >= 90) return NaN;
  const rho = rhoGPerMl * 1000; // kg/m³
  const h = hMm / 1000;
  const r = rMm / 1000;
  return ((rho * G * h * r) / (2 * Math.cos((thetaDeg * Math.PI) / 180))) * 1000; // N/m → mN/m
}

/** The rise (mm) a liquid of tension γ (mN/m) reaches in that capillary — the inverse, for the simulation. */
export function capillaryRiseHeight(gammaMnM: number, rhoGPerMl: number, rMm: number, thetaDeg = 0): number {
  if (!pos(gammaMnM, rhoGPerMl, rMm) || !ok(thetaDeg) || thetaDeg < 0 || thetaDeg >= 90) return NaN;
  const h = (2 * (gammaMnM / 1000) * Math.cos((thetaDeg * Math.PI) / 180)) / (rhoGPerMl * 1000 * G * (rMm / 1000));
  return h * 1000;
}

/**
 * Capillary rise, relative to water in the same capillary (r and θ ≈ 0 cancel):
 * γ1 = γ2 · (ρ1 · h1) / (ρ2 · h2). This is the form most teaching manuals use, because the
 * capillary radius need not be known.
 */
export function relativeCapillaryTension(rho1: number, h1: number, rho2: number, h2: number, gamma2: number): number {
  return pos(rho1, h1, rho2, h2, gamma2) ? gamma2 * ((rho1 * h1) / (rho2 * h2)) : NaN;
}

// ── 3. Solubility & dissolution ───────────────────────────────────────────

/**
 * Gravimetric solubility: a filtered aliquot of the SATURATED solution (excess solid still
 * present at equilibrium, at the stated temperature) is evaporated to constant mass.
 * Returns g of solute per 100 mL of saturated solution.
 */
export function gravimetricSolubility(residueG: number, aliquotMl: number): number {
  return ok(residueG) && residueG >= 0 && pos(aliquotMl) ? (residueG / aliquotMl) * 100 : NaN;
}

/**
 * USP General Notices 5.30 descriptive terms, from the parts of solvent needed per part of solute
 * (USP 35 table, re-read 2026-10-25: Very soluble "Less than 1"; Freely soluble "From 1 to 10";
 * Soluble "From 10 to 30"; Sparingly soluble "From 30 to 100"; Slightly soluble "From 100 to
 * 1000"; Very slightly soluble "From 1000 to 10,000"; Practically insoluble, or Insoluble
 * "10,000 and over"). The "from a to b" ranges share their end points, so an exact boundary is
 * given to the LESS-soluble term (a ≤ p < b) — the reading the table itself makes explicit at
 * both ends ("Less than 1" excludes 1; "10,000 and over" includes 10,000).
 */
export function solubilityTerm(partsSolventPerPartSolute: number): string {
  const p = partsSolventPerPartSolute;
  if (!Number.isFinite(p) || p < 0) return "invalid";
  if (p < 1) return "Very soluble";
  if (p < 10) return "Freely soluble";
  if (p < 30) return "Soluble";
  if (p < 100) return "Sparingly soluble";
  if (p < 1000) return "Slightly soluble";
  if (p < 10000) return "Very slightly soluble";
  return "Practically insoluble";
}

/** Parts of solvent per part of solute for a solubility in g/100 mL (≈ mL solvent per g; teaching approximation that solution ≈ solvent volume). */
export function partsSolvent(gPer100Ml: number): number {
  return pos(gPer100Ml) ? 100 / gPer100Ml : Infinity;
}

export interface DissolutionSample {
  /** Minutes from the start. */
  t: number;
  /** Measured drug concentration in the withdrawn sample, mg/mL. */
  c: number;
}

/**
 * Cumulative % of label claim dissolved, with the sampling correction the protocol requires.
 *
 * - `replace: true` — each withdrawn volume is replaced by fresh medium, so the vessel volume stays
 *   V0, but drug removed in earlier samples must be added back:
 *   Q_n = C_n · V0 + v · Σ_{i<n} C_i
 * - `replace: false` — no replacement, so the volume falls by v each time:
 *   Q_n = C_n · (V0 − (n−1)·v) + v · Σ_{i<n} C_i
 *
 * Volumes in mL, concentrations mg/mL, label claim mg. Samples must be in increasing time order.
 * Returns [] for invalid input.
 */
export function cumulativeDissolved(
  samples: DissolutionSample[],
  mediumMl: number,
  sampleMl: number,
  labelClaimMg: number,
  replace: boolean,
): { t: number; mg: number; percent: number }[] {
  if (!pos(mediumMl, sampleMl, labelClaimMg) || samples.length === 0) return [];
  if (!replace && mediumMl - (samples.length - 1) * sampleMl <= 0) return [];
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    if (!ok(s.t, s.c) || s.c < 0 || s.t < 0 || (i > 0 && s.t <= samples[i - 1].t)) return [];
  }
  let removed = 0;
  return samples.map((s, n) => {
    const v = replace ? mediumMl : mediumMl - n * sampleMl;
    const mg = s.c * v + removed;
    removed += s.c * sampleMl;
    return { t: s.t, mg, percent: (mg / labelClaimMg) * 100 };
  });
}

/** Uncorrected % dissolved (C · V0 / label) — shown beside the corrected value so the size of the correction is visible. */
export function uncorrectedPercent(c: number, mediumMl: number, labelClaimMg: number): number {
  return ok(c) && c >= 0 && pos(mediumMl, labelClaimMg) ? ((c * mediumMl) / labelClaimMg) * 100 : NaN;
}

/**
 * Teaching dissolution model (simulated data, not a product's real profile): first-order release
 * to a plateau, %(t) = Fmax · (1 − e^(−k t)). k in min⁻¹. Agitation and temperature act through k
 * in the experiment, never through the plotted points directly.
 */
export function firstOrderRelease(tMin: number, k: number, fMax = 100): number {
  return ok(tMin, k, fMax) && tMin >= 0 && k >= 0 ? fMax * (1 - Math.exp(-k * tMin)) : NaN;
}
