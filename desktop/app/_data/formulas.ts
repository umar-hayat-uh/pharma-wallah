/**
 * The offline formula reference (spec §14, §18).
 *
 * These are the standard identities a Pharm-D course teaches — they are stated
 * here so a student can look one up without opening a calculator, and every one
 * of them links to the PharmaWallah tool that applies it.
 *
 * Scope, stated honestly: this is a reference to the *identity*, with its
 * symbols defined. The linked calculator is the authority on how PharmaWallah
 * applies it (rounding, units, edge cases, and the caveats its own "how this is
 * calculated" panel sets out). Nothing here is a clinical protocol.
 *
 * `slug` must be a real tool directory; `formulaTools()` drops any entry whose
 * calculator is not in this build rather than rendering a dead link.
 */

import { ALL_SLUGS } from "./catalog";

export type FormulaEntry = {
  id: string;
  group: string;
  name: string;
  /** The identity itself, as it is written on a whiteboard. */
  expression: string;
  /** Every symbol in `expression`, defined. */
  symbols: { symbol: string; meaning: string }[];
  /** When to reach for it, or what it assumes. */
  note?: string;
  /** The calculator that applies it, if there is one. */
  slug?: string;
  keywords?: string[];
};

export const FORMULA_GROUPS = [
  "Solutions & concentration",
  "Physical pharmacy",
  "Pharmaceutical analysis",
  "Pharmacokinetics",
  "Clinical dosing",
  "Stability & sterilisation",
] as const;

const ENTRIES: FormulaEntry[] = [
  /* ── Solutions & concentration ─────────────────────────────────────── */
  {
    id: "dilution",
    group: "Solutions & concentration",
    name: "Dilution",
    expression: "C₁ × V₁ = C₂ × V₂",
    symbols: [
      { symbol: "C₁", meaning: "concentration of the stock solution" },
      { symbol: "V₁", meaning: "volume of stock taken" },
      { symbol: "C₂", meaning: "concentration wanted" },
      { symbol: "V₂", meaning: "final volume after making up" },
    ],
    note: "C₁ and C₂ must be in the same unit, and so must V₁ and V₂. Valid only when solute is conserved — i.e. dilution, not a reaction.",
    slug: "dilution-calculator",
    keywords: ["c1v1", "stock", "dilute"],
  },
  {
    id: "molarity",
    group: "Solutions & concentration",
    name: "Molarity",
    expression: "M = n / V = m / (MW × V)",
    symbols: [
      { symbol: "M", meaning: "molarity, mol/L" },
      { symbol: "n", meaning: "amount of solute, mol" },
      { symbol: "m", meaning: "mass of solute, g" },
      { symbol: "MW", meaning: "molar mass, g/mol" },
      { symbol: "V", meaning: "volume of solution, L (not volume of solvent)" },
    ],
    slug: "molarity-calculator",
    keywords: ["molar", "mol/L", "concentration"],
  },
  {
    id: "normality",
    group: "Solutions & concentration",
    name: "Normality",
    expression: "N = M × n",
    symbols: [
      { symbol: "N", meaning: "normality, eq/L" },
      { symbol: "M", meaning: "molarity, mol/L" },
      { symbol: "n", meaning: "equivalents per mole (valence, or replaceable H⁺/OH⁻)" },
    ],
    note: "n depends on the reaction, not on the compound alone — H₂SO₄ is 2 N per mole in a full neutralisation and 1 N in a half one.",
    slug: "normality-calculator",
    keywords: ["equivalent", "titration"],
  },
  {
    id: "percent-wv",
    group: "Solutions & concentration",
    name: "Percentage strength",
    expression: "% w/v = (g solute / mL solution) × 100",
    symbols: [
      { symbol: "% w/v", meaning: "grams of solute in 100 mL of solution" },
      { symbol: "% w/w", meaning: "grams of solute in 100 g of preparation" },
      { symbol: "% v/v", meaning: "mL of solute in 100 mL of solution" },
    ],
    note: "1% w/v = 10 mg/mL. Say which of the three you mean — they are not interchangeable.",
    slug: "percentage-solution-calculator",
    keywords: ["percent", "strength", "w/v"],
  },
  {
    id: "ppm",
    group: "Solutions & concentration",
    name: "Parts per million",
    expression: "ppm = (mass solute / mass solution) × 10⁶",
    symbols: [
      { symbol: "ppm", meaning: "parts per million" },
      { symbol: "ppb", meaning: "parts per billion, × 10⁹" },
    ],
    note: "For a dilute aqueous solution (density ≈ 1 g/mL) 1 ppm = 1 mg/L. That equivalence fails for anything else.",
    slug: "ppm-ppb-calculator",
    keywords: ["ppb", "trace", "impurity"],
  },
  {
    id: "alligation",
    group: "Solutions & concentration",
    name: "Serial dilution factor",
    expression: "Cₙ = C₀ / Dⁿ",
    symbols: [
      { symbol: "Cₙ", meaning: "concentration after n steps" },
      { symbol: "C₀", meaning: "starting concentration" },
      { symbol: "D", meaning: "dilution factor at each step (e.g. 10 for a 1:10)" },
      { symbol: "n", meaning: "number of steps" },
    ],
    slug: "serial-dilution-calculator",
    keywords: ["serial", "tenfold", "log dilution"],
  },
  {
    id: "henderson",
    group: "Solutions & concentration",
    name: "Henderson–Hasselbalch",
    expression: "pH = pKa + log([A⁻] / [HA])",
    symbols: [
      { symbol: "pKa", meaning: "acid dissociation constant of the drug, as −log Ka" },
      { symbol: "[A⁻]", meaning: "concentration of the ionised (conjugate base) form" },
      { symbol: "[HA]", meaning: "concentration of the unionised acid" },
    ],
    note: "For a base, pH = pKa + log([base]/[conjugate acid]). At pH = pKa the two forms are equal.",
    slug: "pH-pka-relationship-calculator",
    keywords: ["pka", "buffer", "ionisation", "ionization"],
  },
  {
    id: "isotonicity",
    group: "Solutions & concentration",
    name: "Sodium chloride equivalent",
    expression: "NaCl needed = (0.9 × V / 100) − Σ(E × w)",
    symbols: [
      { symbol: "V", meaning: "final volume, mL" },
      { symbol: "E", meaning: "sodium chloride equivalent of an ingredient" },
      { symbol: "w", meaning: "grams of that ingredient in the preparation" },
      { symbol: "0.9", meaning: "% w/v NaCl that is isotonic with blood and tears" },
    ],
    slug: "isotonicity-calculator",
    keywords: ["tonicity", "E value", "ophthalmic", "isotonic"],
  },

  /* ── Physical pharmacy ─────────────────────────────────────────────── */
  {
    id: "density",
    group: "Physical pharmacy",
    name: "Density and relative density",
    expression: "ρ = m / V ;  RD = ρ_sample / ρ_water",
    symbols: [
      { symbol: "ρ", meaning: "density, g/mL" },
      { symbol: "m", meaning: "mass, g" },
      { symbol: "V", meaning: "volume, mL" },
      { symbol: "RD", meaning: "relative density (specific gravity), dimensionless" },
    ],
    note: "Both densities must be at a stated temperature; water is 0.99704 g/mL at 25 °C.",
    slug: "relative-density-bottle-calculator",
    keywords: ["specific gravity", "pycnometer", "bottle"],
  },
  {
    id: "porosity",
    group: "Physical pharmacy",
    name: "Porosity",
    expression: "ε = 1 − (ρ_bulk / ρ_true)",
    symbols: [
      { symbol: "ε", meaning: "porosity, as a fraction (×100 for %)" },
      { symbol: "ρ_bulk", meaning: "bulk density of the powder bed" },
      { symbol: "ρ_true", meaning: "true density of the solid" },
    ],
    slug: "porosity-calculator",
    keywords: ["void", "powder", "bulk density"],
  },
  {
    id: "carr",
    group: "Physical pharmacy",
    name: "Carr's index and Hausner ratio",
    expression: "CI = ((ρ_tapped − ρ_bulk) / ρ_tapped) × 100 ;  HR = ρ_tapped / ρ_bulk",
    symbols: [
      { symbol: "CI", meaning: "Carr's compressibility index, %" },
      { symbol: "HR", meaning: "Hausner ratio, dimensionless" },
    ],
    note: "Lower is better: CI ≤ 15% and HR < 1.25 describe good flow.",
    slug: "compressibility-index-calculator",
    keywords: ["flow", "hausner", "carr", "tapped"],
  },
  {
    id: "partition",
    group: "Physical pharmacy",
    name: "Partition coefficient",
    expression: "P = C_oil / C_water ;  log D = log P − log(1 + 10^(pH − pKa))",
    symbols: [
      { symbol: "P", meaning: "partition coefficient of the unionised drug" },
      { symbol: "log D", meaning: "distribution coefficient at a stated pH" },
    ],
    note: "The log D correction shown is for a monoprotic acid; a base uses (pKa − pH).",
    slug: "partition-coefficient-calculator",
    keywords: ["logP", "logD", "lipophilicity", "octanol"],
  },
  {
    id: "reynolds",
    group: "Physical pharmacy",
    name: "Reynolds number",
    expression: "Re = (ρ × v × d) / η",
    symbols: [
      { symbol: "ρ", meaning: "fluid density" },
      { symbol: "v", meaning: "velocity" },
      { symbol: "d", meaning: "characteristic diameter" },
      { symbol: "η", meaning: "dynamic viscosity" },
    ],
    note: "In a pipe: laminar below ~2100, turbulent above ~4000.",
    slug: "reynolds-number",
    keywords: ["laminar", "turbulent", "flow", "viscosity"],
  },

  /* ── Pharmaceutical analysis ───────────────────────────────────────── */
  {
    id: "beer-lambert",
    group: "Pharmaceutical analysis",
    name: "Beer–Lambert law",
    expression: "A = ε × c × l",
    symbols: [
      { symbol: "A", meaning: "absorbance, dimensionless" },
      { symbol: "ε", meaning: "molar absorptivity, L·mol⁻¹·cm⁻¹" },
      { symbol: "c", meaning: "concentration, mol/L" },
      { symbol: "l", meaning: "path length, cm (usually 1)" },
    ],
    note: "Linear only over a limited range — typically A between about 0.2 and 0.8.",
    slug: "law-absorbance-calculator",
    keywords: ["absorbance", "uv", "spectrophotometry", "epsilon"],
  },
  {
    id: "regression",
    group: "Pharmaceutical analysis",
    name: "Linear regression (calibration curve)",
    expression: "y = mx + c ;  m = Σ((x−x̄)(y−ȳ)) / Σ(x−x̄)²",
    symbols: [
      { symbol: "m", meaning: "slope — response per unit concentration" },
      { symbol: "c", meaning: "intercept — response at zero concentration" },
      { symbol: "R²", meaning: "coefficient of determination; how much of the variation the line explains" },
      { symbol: "x_unknown", meaning: "(y − c) / m" },
    ],
    note: "A high R² does not prove the method is accurate — it only says the points lie on a line.",
    slug: "calibration-curve-calculator",
    keywords: ["slope", "intercept", "R2", "least squares", "standard curve"],
  },
  {
    id: "rf",
    group: "Pharmaceutical analysis",
    name: "Retardation factor (TLC)",
    expression: "Rf = distance travelled by the spot / distance travelled by the solvent front",
    symbols: [
      { symbol: "Rf", meaning: "between 0 and 1; both distances are measured from the baseline" },
    ],
    note: "Rf is only comparable between plates run in the same system.",
    slug: "rf-value-calculator",
    keywords: ["tlc", "chromatography", "spot", "solvent front"],
  },
  {
    id: "resolution",
    group: "Pharmaceutical analysis",
    name: "Chromatographic resolution",
    expression: "Rs = 2(t₂ − t₁) / (w₁ + w₂)",
    symbols: [
      { symbol: "t", meaning: "retention time of each peak" },
      { symbol: "w", meaning: "peak width at the baseline, in the same time unit" },
    ],
    note: "Rs ≥ 1.5 is baseline separation.",
    slug: "chromatographic-resolution-calculator",
    keywords: ["hplc", "peak", "separation", "retention"],
  },
  {
    id: "recovery",
    group: "Pharmaceutical analysis",
    name: "Percentage recovery and error",
    expression: "% recovery = (found / added) × 100 ;  % error = ((found − true) / true) × 100",
    symbols: [
      { symbol: "found", meaning: "amount the assay measured" },
      { symbol: "added", meaning: "amount spiked into the sample" },
    ],
    note: "Recovery measures accuracy; repeat measurements of the same sample measure precision. They are different claims.",
    slug: "accuracy-recovery-calculator",
    keywords: ["accuracy", "spike", "assay", "error", "deviation"],
  },
  {
    id: "yield",
    group: "Pharmaceutical analysis",
    name: "Percentage yield",
    expression: "% yield = (actual yield / theoretical yield) × 100",
    symbols: [
      { symbol: "theoretical yield", meaning: "mass obtainable if the limiting reactant reacted completely" },
    ],
    slug: "percentage-yield-calculator",
    keywords: ["yield", "synthesis", "limiting reactant"],
  },

  /* ── Pharmacokinetics ──────────────────────────────────────────────── */
  {
    id: "half-life",
    group: "Pharmacokinetics",
    name: "Elimination half-life",
    expression: "t½ = 0.693 / kₑ",
    symbols: [
      { symbol: "t½", meaning: "time for the concentration to fall by half" },
      { symbol: "kₑ", meaning: "first-order elimination rate constant, time⁻¹" },
    ],
    note: "First-order only. About 4–5 half-lives to reach steady state, and the same to wash out.",
    slug: "half-life-calculator",
    keywords: ["t1/2", "elimination", "ke", "0.693"],
  },
  {
    id: "ke",
    group: "Pharmacokinetics",
    name: "Elimination rate constant",
    expression: "kₑ = ln(C₁ / C₂) / (t₂ − t₁) = CL / Vd",
    symbols: [
      { symbol: "C₁, C₂", meaning: "concentrations at two times on the log-linear phase" },
      { symbol: "CL", meaning: "clearance" },
      { symbol: "Vd", meaning: "volume of distribution" },
    ],
    slug: "ke-calculator",
    keywords: ["rate constant", "slope", "elimination"],
  },
  {
    id: "vd",
    group: "Pharmacokinetics",
    name: "Volume of distribution",
    expression: "Vd = Dose / C₀",
    symbols: [
      { symbol: "Vd", meaning: "apparent volume, L (or L/kg)" },
      { symbol: "C₀", meaning: "concentration extrapolated back to time zero" },
    ],
    note: "Apparent, not anatomical — a Vd of 500 L does not mean 500 L of fluid.",
    slug: "volume-distribution-calculator",
    keywords: ["distribution", "apparent volume"],
  },
  {
    id: "clearance",
    group: "Pharmacokinetics",
    name: "Clearance",
    expression: "CL = kₑ × Vd = Dose / AUC",
    symbols: [
      { symbol: "CL", meaning: "volume of plasma cleared of drug per unit time" },
      { symbol: "AUC", meaning: "area under the concentration–time curve" },
    ],
    slug: "clearance-calculator",
    keywords: ["clearance", "CL", "AUC"],
  },
  {
    id: "auc",
    group: "Pharmacokinetics",
    name: "AUC by the trapezoidal rule",
    expression: "AUC = Σ ((C₁ + C₂) / 2) × (t₂ − t₁)",
    symbols: [
      { symbol: "AUC", meaning: "area under the curve, concentration × time" },
    ],
    note: "The linear trapezoidal rule overestimates on a falling log-linear phase; the log-trapezoidal rule is used there.",
    slug: "auc-estimator",
    keywords: ["trapezoid", "exposure", "area"],
  },
  {
    id: "bioavailability",
    group: "Pharmacokinetics",
    name: "Absolute bioavailability",
    expression: "F = (AUC_oral × Dose_IV) / (AUC_IV × Dose_oral)",
    symbols: [
      { symbol: "F", meaning: "fraction of the dose reaching the systemic circulation (0–1)" },
    ],
    slug: "bioavailability-calculator",
    keywords: ["F", "bioavailability", "absolute"],
  },
  {
    id: "loading",
    group: "Pharmacokinetics",
    name: "Loading and maintenance dose",
    expression: "LD = (Css × Vd) / F ;  MD = (Css × CL × τ) / F",
    symbols: [
      { symbol: "Css", meaning: "target steady-state concentration" },
      { symbol: "τ", meaning: "dosing interval" },
      { symbol: "F", meaning: "bioavailability" },
    ],
    note: "A loading dose fills the volume; a maintenance dose replaces what is cleared.",
    slug: "loading-dose-calculator",
    keywords: ["loading", "maintenance", "steady state", "Css"],
  },
  {
    id: "first-order",
    group: "Pharmacokinetics",
    name: "First- and zero-order kinetics",
    expression: "First order: ln C = ln C₀ − kt ;  Zero order: C = C₀ − k₀t",
    symbols: [
      { symbol: "k", meaning: "first-order rate constant, time⁻¹" },
      { symbol: "k₀", meaning: "zero-order rate, concentration/time" },
    ],
    note: "First order gives a straight line on a log plot; zero order on a linear one.",
    slug: "order-kinetics-calculator",
    keywords: ["zero order", "first order", "kinetics", "2.303"],
  },
  {
    id: "higuchi",
    group: "Pharmacokinetics",
    name: "Cumulative drug release",
    expression: "% released = (amount released at t / total amount) × 100",
    symbols: [
      { symbol: "correction", meaning: "sampled volume removed must be added back in, or release is underestimated" },
    ],
    note: "The correction method matters — this app offers two and states which one produced a figure.",
    slug: "cumulative-drug-release-calculator",
    keywords: ["dissolution", "release", "profile", "higuchi"],
  },

  /* ── Clinical dosing ───────────────────────────────────────────────── */
  {
    id: "bsa",
    group: "Clinical dosing",
    name: "Body surface area (Mosteller)",
    expression: "BSA (m²) = √((height cm × weight kg) / 3600)",
    symbols: [
      { symbol: "BSA", meaning: "body surface area, m²" },
    ],
    note: "Mosteller is the usual bedside formula; Du Bois and Haycock give slightly different figures. State which you used.",
    slug: "bsa-calculator",
    keywords: ["mosteller", "surface area", "chemotherapy"],
  },
  {
    id: "bmi",
    group: "Clinical dosing",
    name: "Body mass index",
    expression: "BMI = weight (kg) / height (m)²",
    symbols: [{ symbol: "BMI", meaning: "kg/m²" }],
    slug: "bmi-calculator",
    keywords: ["bmi", "obesity", "weight"],
  },
  {
    id: "cockcroft",
    group: "Clinical dosing",
    name: "Creatinine clearance (Cockcroft–Gault)",
    expression: "CrCl = ((140 − age) × weight) / (72 × SCr) × 0.85 if female",
    symbols: [
      { symbol: "CrCl", meaning: "mL/min" },
      { symbol: "weight", meaning: "kg — which weight (actual, ideal, adjusted) is a clinical decision" },
      { symbol: "SCr", meaning: "serum creatinine, mg/dL" },
    ],
    note: "Cockcroft–Gault estimates creatinine clearance, not eGFR, and most renal dose adjustments in drug labelling are written against it.",
    slug: "creatinine-calculator",
    keywords: ["crcl", "renal", "cockcroft", "gault", "kidney"],
  },
  {
    id: "clark",
    group: "Clinical dosing",
    name: "Paediatric dose (Clark's and Young's rules)",
    expression: "Clark: dose = adult dose × (weight lb / 150) ;  Young: dose = adult dose × age / (age + 12)",
    symbols: [
      { symbol: "age", meaning: "years, for Young's rule" },
    ],
    note: "Both are historical approximations. Where a weight-based paediatric dose exists, use it instead.",
    slug: "pedriatic-calculator",
    keywords: ["paediatric", "pediatric", "child", "clark", "young"],
  },
  {
    id: "drip",
    group: "Clinical dosing",
    name: "IV drip rate",
    expression: "drops/min = (volume mL × drop factor) / time in minutes",
    symbols: [
      { symbol: "drop factor", meaning: "gtt/mL of the giving set — 10, 15, 20 or 60" },
    ],
    slug: "iv-drip-rate-calculator",
    keywords: ["infusion", "gtt", "drops", "drip"],
  },
  {
    id: "anion-gap",
    group: "Clinical dosing",
    name: "Anion gap",
    expression: "AG = Na⁺ − (Cl⁻ + HCO₃⁻)",
    symbols: [
      { symbol: "AG", meaning: "mEq/L; some laboratories include K⁺" },
    ],
    note: "Correct for albumin: add 2.5 mEq/L for every 1 g/dL the albumin is below 4.",
    slug: "AnionGapCalculator",
    keywords: ["acidosis", "gap", "electrolyte"],
  },
  {
    id: "corrected-calcium",
    group: "Clinical dosing",
    name: "Corrected calcium",
    expression: "Corrected Ca = measured Ca + 0.8 × (4.0 − albumin g/dL)",
    symbols: [
      { symbol: "measured Ca", meaning: "total serum calcium, mg/dL" },
    ],
    note: "An approximation only; ionised calcium is the measurement that settles the question.",
    slug: "CorrectedCalciumCalculator",
    keywords: ["calcium", "albumin", "hypocalcaemia"],
  },

  /* ── Stability & sterilisation ─────────────────────────────────────── */
  {
    id: "shelf-life",
    group: "Stability & sterilisation",
    name: "Shelf life (t₉₀)",
    expression: "First order: t₉₀ = 0.105 / k ;  Zero order: t₉₀ = 0.1 × C₀ / k₀",
    symbols: [
      { symbol: "t₉₀", meaning: "time until 90% of the label claim remains" },
      { symbol: "0.105", meaning: "−ln(0.9)" },
    ],
    slug: "order-kinetics-calculator",
    keywords: ["expiry", "stability", "t90", "degradation"],
  },
  {
    id: "arrhenius",
    group: "Stability & sterilisation",
    name: "Arrhenius equation",
    expression: "k = A·e^(−Ea/RT) ;  ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂)",
    symbols: [
      { symbol: "Ea", meaning: "activation energy, J/mol" },
      { symbol: "R", meaning: "8.314 J·mol⁻¹·K⁻¹" },
      { symbol: "T", meaning: "absolute temperature, K — never °C" },
    ],
    note: "The basis of accelerated stability testing. Extrapolating outside the tested range is not supported by the data.",
    slug: "heat-formation-calculator",
    keywords: ["arrhenius", "accelerated", "activation energy", "stability"],
  },
  {
    id: "d-value",
    group: "Stability & sterilisation",
    name: "D value and log reduction",
    expression: "D = t / (log N₀ − log N) ;  log reduction = log(N₀ / N)",
    symbols: [
      { symbol: "D", meaning: "time to reduce the population tenfold at a stated temperature" },
      { symbol: "N₀, N", meaning: "population before and after" },
    ],
    slug: "DValueCalculator",
    keywords: ["decimal reduction", "sterilisation", "log kill", "bioburden"],
  },
  {
    id: "z-value",
    group: "Stability & sterilisation",
    name: "Z value and F₀",
    expression: "Z = (T₂ − T₁) / (log D₁ − log D₂) ;  F₀ = Σ 10^((T − 121.1)/z) × Δt",
    symbols: [
      { symbol: "Z", meaning: "temperature change that alters D tenfold; ~10 °C for moist heat" },
      { symbol: "F₀", meaning: "equivalent minutes at 121.1 °C with z = 10 °C" },
    ],
    slug: "FValueCalculator",
    keywords: ["autoclave", "F0", "z value", "moist heat"],
  },
  {
    id: "cfu",
    group: "Stability & sterilisation",
    name: "Colony-forming units",
    expression: "CFU/mL = colonies counted / (dilution factor × volume plated in mL)",
    symbols: [
      { symbol: "dilution factor", meaning: "e.g. 10⁻⁴ for a 1-in-10 000 dilution" },
    ],
    note: "Countable plates are conventionally 30–300 colonies; outside that the figure is an estimate.",
    slug: "cfu-calculator",
    keywords: ["cfu", "plate count", "colony", "microbiology"],
  },
];

/** Only formulas whose calculator is present in this build keep their link. */
export function allFormulas(): FormulaEntry[] {
  const present = new Set(ALL_SLUGS);
  return ENTRIES.map((entry) =>
    entry.slug && !present.has(entry.slug) ? { ...entry, slug: undefined } : entry,
  );
}

const fold = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[₀-₉]/g, (digit) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit)))
    .replace(/[^a-z0-9]/g, "");

export function searchFormulas(query: string): FormulaEntry[] {
  const all = allFormulas();
  const q = fold(query);
  if (!q) return all;

  return all.filter((entry) => {
    const haystack = [
      entry.name,
      entry.expression,
      entry.group,
      entry.note ?? "",
      ...(entry.keywords ?? []),
      ...entry.symbols.map((symbol) => `${symbol.symbol} ${symbol.meaning}`),
    ].map(fold);
    return haystack.some((value) => value.includes(q));
  });
}
