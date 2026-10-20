/**
 * Acid–base titration chemistry for the Pharmaceutical Chemistry lab: citric acid
 * (a triprotic weak acid) titrated with sodium hydroxide.
 *
 * Model assumptions, stated once and printed in the lab's briefing:
 *  - concentrations stand in for activities (no ionic-strength correction);
 *  - 25 °C, Kw = 1.0 × 10⁻¹⁴;
 *  - pKa values of citric acid 3.13, 4.76, 6.40 (thermodynamic values);
 *  - volumes are additive.
 * Every function is pure and unit-explicit: volumes in mL, amounts in mmol, masses in
 * mg or g as named, concentrations in mol/L (≡ mmol/mL).
 */

export const CITRIC = {
  formula: "C₆H₈O₇·H₂O",
  molarMassMonohydrate: 210.14, // g/mol
  molarMassAnhydrous: 192.12, // g/mol
  pKa: [3.13, 4.76, 6.4] as const,
  /** mol NaOH that react with 1 mol citric acid (all three carboxyl groups). */
  protons: 3,
};

const KW = 1e-14;

export interface IndicatorDef {
  id: "phenolphthalein" | "methyl-orange" | "bromothymol-blue";
  name: string;
  pKin: number;
  range: [number, number];
  /** Colour of the acid form and the base form, as linear RGB 0–1 at drop-dose strength. */
  acid: [number, number, number, number]; // r, g, b, alpha (alpha 0 = colourless)
  base: [number, number, number, number];
}

/**
 * pKin and transition ranges are the commonly tabulated values (e.g. Vogel's Textbook of
 * Quantitative Chemical Analysis). Colours are display choices, not measurements.
 */
export const INDICATORS: Record<IndicatorDef["id"], IndicatorDef> = {
  phenolphthalein: { id: "phenolphthalein", name: "Phenolphthalein", pKin: 9.4, range: [8.2, 10.0], acid: [1, 1, 1, 0], base: [0.86, 0.12, 0.55, 0.85] },
  "methyl-orange": { id: "methyl-orange", name: "Methyl orange", pKin: 3.46, range: [3.1, 4.4], acid: [0.86, 0.16, 0.12, 0.7], base: [0.98, 0.78, 0.18, 0.6] },
  "bromothymol-blue": { id: "bromothymol-blue", name: "Bromothymol blue", pKin: 7.1, range: [6.0, 7.6], acid: [0.95, 0.85, 0.2, 0.55], base: [0.15, 0.35, 0.85, 0.7] },
};

/**
 * pH of a citric-acid solution after adding base, by solving the charge balance
 *   [H⁺] + [Na⁺] = [OH⁻] + [H₂A⁻] + 2[HA²⁻] + 3[A³⁻]
 * with bisection on log[H⁺] (monotonic, so it always converges).
 *
 * @param acidMmol   citric acid present (mmol)
 * @param baseMmol   NaOH added (mmol)
 * @param volumeMl   total solution volume (mL)
 */
export function citricPH(acidMmol: number, baseMmol: number, volumeMl: number): number {
  if (!(volumeMl > 0) || acidMmol < 0 || baseMmol < 0) return NaN;
  const ca = acidMmol / volumeMl; // mol/L
  const na = baseMmol / volumeMl;
  const [k1, k2, k3] = CITRIC.pKa.map((p) => 10 ** -p);
  const imbalance = (h: number) => {
    const d = h * h * h + k1 * h * h + k1 * k2 * h + k1 * k2 * k3;
    const anionCharge = ca * (k1 * h * h + 2 * k1 * k2 * h + 3 * k1 * k2 * k3) / d;
    return h + na - KW / h - anionCharge; // positive → too much H⁺ assumed
  };
  let lo = -14.5; // log10 h
  let hi = 0.5;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (imbalance(10 ** mid) > 0) hi = mid;
    else lo = mid;
  }
  return -(lo + hi) / 2;
}

/** Fraction of an indicator in its base (coloured, for phenolphthalein) form. */
export function indicatorBaseFraction(ind: IndicatorDef, pH: number): number {
  return 1 / (1 + 10 ** (ind.pKin - pH));
}

/**
 * Visual endpoint in this teaching model: the first permanent faint pink of
 * phenolphthalein, taken as 20 % of the indicator in its pink form (pH ≈ 8.8).
 * Stated so the indicator error the report prints is traceable.
 */
export const FAINT_PINK_FRACTION = 0.2;
/** Beyond this the pink is plainly deep: the endpoint was overshot. */
export const DEEP_PINK_FRACTION = 0.93;

/** Volume of titrant (mL) at stoichiometric equivalence for a given amount of acid. */
export function equivalenceVolume(acidMmol: number, titrantMolar: number): number {
  if (!(titrantMolar > 0)) return NaN;
  return (acidMmol * CITRIC.protons) / titrantMolar;
}

/** Titre = final − initial burette reading, mL. Readings must be ordered and on-scale. */
export function titre(initialMl: number, finalMl: number, capacityMl = 50): number {
  if (![initialMl, finalMl].every(Number.isFinite)) return NaN;
  if (initialMl < 0 || finalMl > capacityMl || finalMl < initialMl) return NaN;
  return finalMl - initialMl;
}

export interface AssayInput {
  titreMl: number;
  titrantMolar: number; // standardised molarity, mol/L
  aliquotMl: number; // volume pipetted
  flaskMl: number; // volume the sample was made up to
  sampleMassG: number; // mass weighed, g
}

/**
 * Assay of citric acid monohydrate, % w/w:
 *
 *   n(NaOH)  = V_titre (mL) × c (mmol/mL)                       mmol
 *   n(acid)  = n(NaOH) / 3                                       mmol
 *   m(acid in aliquot) = n(acid) × 210.14 mg/mmol                mg
 *   m(acid in sample)  = m(aliquot) × V_flask / V_aliquot        mg
 *   assay %  = m(acid in sample) / (sample mass × 1000 mg/g) × 100
 *
 * Equivalently each 1 mL of 0.1 M NaOH ≡ 7.005 mg C₆H₈O₇·H₂O.
 */
export function assayPercent(i: AssayInput): number {
  const vals = [i.titreMl, i.titrantMolar, i.aliquotMl, i.flaskMl, i.sampleMassG];
  if (!vals.every((v) => Number.isFinite(v) && v > 0)) return NaN;
  const naoh = i.titreMl * i.titrantMolar;
  const acid = naoh / CITRIC.protons;
  const mgAliquot = acid * CITRIC.molarMassMonohydrate;
  const mgSample = mgAliquot * (i.flaskMl / i.aliquotMl);
  return (mgSample / (i.sampleMassG * 1000)) * 100;
}

/** mg of C₆H₈O₇·H₂O equivalent to 1 mL of titrant of the given molarity. */
export function equivalenceFactorMg(titrantMolar: number): number {
  return (titrantMolar * CITRIC.molarMassMonohydrate) / CITRIC.protons;
}

/** Mean and range of concordant titres. Concordant = within `tol` mL of each other. */
export function concordance(titres: number[], tol = 0.1): { mean: number; range: number; concordant: boolean } {
  const t = titres.filter(Number.isFinite);
  if (t.length === 0) return { mean: NaN, range: NaN, concordant: false };
  const range = Math.max(...t) - Math.min(...t);
  return { mean: t.reduce((a, b) => a + b, 0) / t.length, range, concordant: t.length >= 2 && range <= tol + 1e-9 };
}
