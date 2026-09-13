/**
 * The calculator hub's registry — every tool listed on /calculation-tools.
 *
 * Tools are nested inside their subject, so a tool cannot be registered without
 * a category. (The old hub kept a flat `allTools` list plus name strings in
 * `categories[].toolNames`; a tool added to one but not the other silently
 * rendered nowhere — MEMORY.md gotcha 9.)
 *
 * Adding a tool: create `(tools)/<slug>/page.tsx`, then add `{ name, slug, desc }`
 * to its subject below. `desc` says what the tool computes, in under ~75
 * characters, and is searched as well as shown. The Android app keeps its own
 * catalogue in `mobile/app/_data/tool-registry.ts` — update that too.
 *
 * Deliberately NOT listed: the six tools linked from
 * `src/app/clinical/dose-calculators/page.tsx`, and five tools reachable only by
 * URL (see CLAUDE.md §7 "Calculation tools hub").
 *
 * Plain data, no "use client": imported by the server page and the client island.
 */

export type HubTool = {
  name: string;
  /** Directory under `(tools)/`, i.e. the URL segment after /calculation-tools/. */
  slug: string;
  /** What it computes, one line. */
  desc: string;
};

export type HubSubject = {
  /** Also the in-page anchor. */
  id: string;
  label: string;
  desc: string;
  tools: HubTool[];
};

export const toolHref = (slug: string) => `/calculation-tools/${slug}`;

export const HUB_SUBJECTS: HubSubject[] = [
  {
    id: "pharma-chem",
    label: "Pharmaceutical Chemistry",
    desc: "Solution prep, concentration & chemical analysis tools",
    tools: [
      { name: "Molarity Calculator", slug: "molarity-calculator", desc: "Molarity from mass, MW and volume, or amount needed for a target M" },
      { name: "Mass–Molarity Calculator", slug: "mass-molarity-calculator", desc: "Molarity from solute mass, molar mass and final volume, with moles" },
      { name: "mg/mL ↔ Molarity Calculator", slug: "mg-ml-to-molarity-calculator", desc: "Converts mg/mL to molarity in M, mM and µM using molecular weight" },
      { name: "Normality Calculator", slug: "normality-calculator", desc: "Normality via equivalent weight (MW ÷ n-factor), or amount for a target N" },
      { name: "Percentage Solution Calculator (w/v, w/w, v/v)", slug: "percentage-solution-calculator", desc: "Solves % w/v, v/v or w/w for the percentage, solute, solvent or total" },
      { name: "ppm / ppb Calculator", slug: "ppm-ppb-calculator", desc: "ppm, ppb, mg/L or M from solute mass and volume, or unit-to-unit conversion" },
      { name: "Dilution Calculator (C₁V₁ = C₂V₂)", slug: "dilution-calculator", desc: "C₁V₁ = C₂V₂ for any missing term, plus diluent volume and dilution factor" },
      { name: "Serial Dilution Calculator", slug: "serial-dilution-calculator", desc: "Simple, serial, stepwise and reverse dilution plans with tube volumes" },
      { name: "Theoretical Yield Calculator", slug: "theoretical-yield-calculator", desc: "Theoretical yield from the limiting reactant, simple or full stoichiometry" },
      { name: "Percentage Yield Calculator", slug: "percentage-yield-calculator", desc: "Percentage yield = actual ÷ theoretical yield × 100, mixed mg/g/kg units" },
      { name: "Molecular Weight Finder", slug: "molecular-weight-finder", desc: "Molar mass and % composition by element from a chemical formula" },
      { name: "Solubility Calculator", slug: "solubility-calculator", desc: "Solubility from normality and gram equivalent weight, S = N × G.W ÷ 10" },
      { name: "Heat of Formation Calculator", slug: "heat-formation-calculator", desc: "Enthalpy of solution by van't Hoff from solubilities at two temperatures" },
      { name: "pH–pKa Calculator (Henderson–Hasselbalch)", slug: "pH-pka-relationship-calculator", desc: "Henderson–Hasselbalch: solve pH, pKa or [A⁻]/[HA], with ionised fractions" },
      { name: "Combined pKa Suite", slug: "combined-pka-suite", desc: "Ka ↔ pKa, % ionised at a given pH, and weak-acid pH = ½(pKa − log C)" },
      { name: "Heat Of Neutralization Calculator", slug: "HeatOfNeutralizationCalculator", desc: "Heat released q = m·c·ΔT from a calorimetry run, with optional ΔH per mole" },
    ],
  },
  {
    id: "unit-conversion",
    label: "Unit Conversion",
    desc: "Convert between pharmaceutical units: mass, volume, concentration",
    tools: [
      { name: "Mass Conversion Calculator", slug: "MassConversionCalculator", desc: "Converts mass between mcg, mg, g, kg, oz and lb, showing every unit" },
      { name: "Volume Conversion Calculator", slug: "VolumeConversionCalculator", desc: "Converts volume between µL, mL, L, m³ and household tsp, tbsp, fl oz, gal" },
      { name: "mmol ↔ mEq ↔ mg Calculator", slug: "ElectrolyteConversionCalculator", desc: "mg ↔ mmol ↔ mEq for Na, K, Ca, Mg, Cl, HCO₃ and PO₄ via MW and valence" },
      { name: "Temperature Conversion Calculator", slug: "TemperatureConversionCalculator", desc: "°C, °F and K conversion, flagged against medicine-storage temperature bands" },
      { name: "Strength Conversion Calculator", slug: "StrengthConversionCalculator", desc: "Converts strengths between %, ratio (1:X), w/v, w/w and v/v" },
      { name: "Weight/Volume Conversion Calculator (Density-Based)", slug: "DensityConversionCalculator", desc: "Mass ↔ volume of a liquid from its density, with common vehicle presets" },
    ],
  },
  {
    id: "pharmaceutics",
    label: "Pharmaceutics",
    desc: "Formulation, powder, dissolution and dosage form calculations",
    tools: [
      { name: "Powder Flowability Calculator", slug: "powder-flowability-calculator", desc: "Carr's index and Hausner ratio from bulk and tapped density, flow class" },
      { name: "Surface Area–Particle Size Calculator", slug: "surface-area-particle-size-calculator", desc: "D10, D50, D90, span and specific surface area from sieve or laser data" },
      { name: "Compressibility Index Calculator", slug: "compressibility-index-calculator", desc: "Carr's index, Hausner ratio and bulk/tapped density from cylinder volumes" },
      { name: "Porosity Calculator", slug: "porosity-calculator", desc: "Porosity ε from true and bulk density, or from total and solid volume" },
      { name: "Density Calculator", slug: "density-calculator", desc: "True, bulk or tapped density = mass ÷ volume, with container correction" },
      { name: "Density & Relative Density Bottle Calculator", slug: "relative-density-bottle-calculator", desc: "Relative density (W₃ − W₁)/(W₂ − W₁) and density by pycnometer weighings" },
      { name: "Tablet Dissolution Profile Plotter", slug: "tablet-disintegration-dissolution-profile-plotter", desc: "Plots % disintegrated/dissolved vs time; T50, T90 and full disintegration" },
      { name: "Content Uniformity Calculator", slug: "content-uniformity-calculator", desc: "USP ⟨905⟩ acceptance value, mean, SD and RSD from 10 unit assays" },
      { name: "Osmolarity Calculator", slug: "osmolarity-calculators", desc: "Σ(C × i) osmolarity plus serum, plasma, IV fluid, TPN and buffer modes" },
      { name: "Osmolality Calculator", slug: "osmolality-calculators", desc: "Σ(C × i) osmolality plus serum, urine (incl. SG), plasma and blood modes" },
      { name: "Isotonicity Calculator", slug: "isotonicity-calculator", desc: "NaCl-equivalent (E-value) method: tonicity and NaCl to add per 100 mL" },
      { name: "Sterile Dose Volume Calculator", slug: "sterile-dose-volume", desc: "Injection volume to draw = dose ÷ concentration, with syringe guidance" },
      { name: "Drug–Excipient Compatibility Predictor", slug: "drug-excipient-compatibility-predictor", desc: "Rule-based risk score for chosen drug groups, excipients and conditions" },
      { name: "Master Formula Calculator", slug: "master-formula-calculator", desc: "Scales every ingredient of a master formula to a desired batch size" },
      { name: "Dissolution Calculator", slug: "dissolution-calculator", desc: "Absorbance → concentration → corrected concentration → % drug release over time" },
      { name: "Cumulative Drug Release Calculator", slug: "cumulative-drug-release-calculator", desc: "Cumulative drug amount and % release, corrected for sample withdrawal" },
    ],
  },
  {
    id: "biopharmaceutics-pharmacokinetics",
    label: "Biopharmaceutics & Pharmacokinetics",
    desc: "ADME parameters, half-life, clearance and kinetics tools",
    tools: [
      { name: "Half-Life Calculator", slug: "half-life-calculator", desc: "t½ from kₑ, from CL and Vd, or from two concentrations over time" },
      { name: "Ke Calculator", slug: "ke-calculator", desc: "Elimination rate constant kₑ from t½, from CL and Vd, or from dose and C₀" },
      { name: "Clearance Calculator", slug: "clearance-calculator", desc: "Clearance from dose ÷ AUC, or infusion rate ÷ steady-state concentration" },
      { name: "Volume of Distribution Calculator", slug: "volume-distribution-calculator", desc: "Apparent Vd = dose ÷ C₀, in L and L/kg with distribution band" },
      { name: "AUC Estimator", slug: "auc-estimator", desc: "AUC by linear trapezoidal rule with extrapolation to ∞, or F·dose ÷ CL" },
      { name: "Bioavailability Calculator", slug: "bioavailability-calculator", desc: "Relative/absolute F = (AUCtest/Dosetest) ÷ (AUCref/Doseref) × 100" },
      { name: "Loading Dose Calculator", slug: "loading-dose-calculator", desc: "Loading dose = Cₚ × Vd ÷ F by route, total and per kg" },
      { name: "Maintenance Dose Calculator", slug: "maintenance-dose-calculator", desc: "Maintenance dose = Css × CL × τ ÷ F, with accumulation and peak/trough" },
      { name: "First-Order vs Zero-Order Kinetics Tool", slug: "order-kinetics-calculator", desc: "Plots first-order, zero-order and Michaelis–Menten elimination curves" },
      { name: "Bioequivalence Calculator", slug: "bioequivalence-calculator", desc: "90% CI of test/reference AUC and Cmax ratios against the 80–125% limits" },
      { name: "Accumulation Index Calculator", slug: "AccumulationIndexCalculator", desc: "Accumulation ratio R = 1 ÷ (1 − e^(−kτ)) from half-life and dosing interval" },
      { name: "Mean Residence Time Calculator", slug: "MeanResidenceTimeCalculator", desc: "Mean residence time = AUMC ÷ AUC, or 1.44 × t½ for a one-compartment drug" },
      { name: "Dialysis Membrane / Diffusion Calculator", slug: "dialysis-diffusion-calculator", desc: "C₂/C₁, B and ln(1 − B) vs time, with slope and rate constant" },
      { name: "Partition / Distribution Coefficient Calculator", slug: "partition-coefficient-calculator", desc: "D, log D, [H⁺] and 1/[H⁺] across pH groups, with graphs" },
    ],
  },
  {
    id: "pharmacology",
    label: "Pharmacology",
    desc: "Drug-receptor interactions, dose-response and safety margins",
    tools: [
      { name: "Animal Weight-Based Dose Calculator", slug: "animal-dose", desc: "Animal dose scaled linearly by body weight, plus injection volume" },
      { name: "Serial Dose Calculator", slug: "serial-diluation", desc: "Dilution chain from a dissolved tablet to deliver a tiny animal dose volume" },
      { name: "Drug–Receptor Binding Affinity Tool", slug: "drug-receptor-binding-affinity-tool", desc: "Receptor occupancy from Kd/Ki, IC50 → Ki by Cheng–Prusoff, binding plots" },
      { name: "Therapeutic Index Calculator", slug: "therapeutic-index-calculator", desc: "Therapeutic index = TD50 ÷ ED50 with a safety-margin band" },
      { name: "Dose–Response Curve Generator", slug: "dose-response-curve-generator", desc: "Plots sigmoid Emax (Hill) curves for several drugs, linear and log scale" },
      { name: "ED50 / TD50 / LD50 Calculator", slug: "ed50-td50-ld50-calculator", desc: "Probit regression (Finney) on dose–mortality data for LD50 with 95% CI" },
    ],
  },
  {
    id: "pharmaceutical-analysis",
    label: "Pharmaceutical Analysis",
    desc: "Spectroscopy, chromatography, purity and assay calculations",
    tools: [
      { name: "Beer-Lambert Law Calculator", slug: "law-absorbance-calculator", desc: "Beer–Lambert A = εbc, solved for absorbance, concentration or ε, with %T" },
      { name: "UV-Vis Peak Analyzer", slug: "uv-analyzer-tool", desc: "A260/A280 nucleic-acid purity ratio and molar absorptivity from a peak" },
      { name: "UV-Vis Spectrum Plotter", slug: "uv-spectrum-plotter", desc: "Plots a UV-Vis spectrum with λmax and peaks, or fits a calibration line" },
      { name: "Chromatographic Resolution Calculator", slug: "chromatographic-resolution-calculator", desc: "Resolution Rs from retention times and widths, or Purnell (N, k, α)" },
      { name: "Rf Value Calculator", slug: "rf-value-calculator", desc: "Rf = compound distance ÷ solvent-front distance, for one or many spots" },
      { name: "Percent Purity Calculator", slug: "percent-purity-calculator", desc: "Titrimetric assay: % purity = V × N × E × D × 100 ÷ W, vs 98–102% limit" },
      { name: "Percentage Recovery Calculator", slug: "percentage-recovery-calculator", desc: "% recovery from initial and recovered amounts, or from C × V of each" },
      { name: "Ash Value Calculator", slug: "ash-value-calculator", desc: "Total, acid-insoluble or sulfated ash % = (W₃ − W₁) ÷ W₂ × 100" },
      { name: "Calibration Curve Calculator", slug: "calibration-curve-calculator", desc: "Least-squares line: slope, intercept, R² and an unknown's concentration" },
      { name: "Accuracy & % Recovery Calculator", slug: "accuracy-recovery-calculator", desc: "% recovery, % error, and mean, SD and %RSD across replicate trials" },
    ],
  },
  {
    id: "physiology",
    label: "Physiology",
    desc: "Hemocytometry and blood-cell counting for the physiology lab",
    tools: [
      { name: "WBC Count Calculator", slug: "wbc-count-calculator", desc: "Total WBC count from Neubauer chamber: cells × dilution ÷ volume counted" },
      { name: "RBC Count Calculator", slug: "rbc-count-calculator", desc: "RBC count from Neubauer chamber: cells × dilution ÷ volume counted" },
    ],
  },
  {
    id: "microbiology",
    label: "Microbiology",
    desc: "Microbial quantification, sterilization and antimicrobial testing",
    tools: [
      { name: "CFU Calculator", slug: "cfu-calculator", desc: "CFU/mL = colonies × dilution factor ÷ volume plated, with AI plate scan" },
      { name: "Sterilization Calculator", slug: "sterilization-calculator", desc: "F₀ = t × 10^((T − Tref)/z) for a hold at constant temperature" },
      { name: "Zone of Inhibition Calculator", slug: "zone-of-inhibition-calculator", desc: "Classes a disk-diffusion zone diameter as S, I or R by fixed cut-offs" },
      { name: "D-Value Calculator", slug: "DValueCalculator", desc: "D-value = exposure time ÷ log(N₀/N) from survivor counts" },
      { name: "F-Value Calculator", slug: "FValueCalculator", desc: "F = D × log reduction, and F₀ equivalent minutes at 121 °C via z-value" },
      { name: "Log Reduction Calculator", slug: "LogReductionCalculator", desc: "Log reduction log₁₀(N₀/N) and percent kill from before/after counts" },
    ],
  },
  {
    id: "pharmaceutical-engineering",
    label: "Pharmaceutical Engineering",
    desc: "Industrial processes, heat transfer and scale-up calculations",
    tools: [
      { name: "Heat Transfer Area Calculator", slug: "heat-transfer-area", desc: "Heat-exchanger area A = Q ÷ (U × ΔT), with an area-vs-U chart" },
      { name: "Reynolds Number Calculator", slug: "reynolds-number", desc: "Reynolds number ρvD/μ with flow regime and Darcy friction factor" },
      { name: "Drying Rate Calculator", slug: "drying-rate", desc: "Drying rate per m² and water removed from moisture content, time and area" },
      { name: "Mixing Time Estimator", slug: "mixing-time-estimator", desc: "Impeller Reynolds number, power number and mixing time from tank geometry" },
    ],
  },
  {
    id: "clinical-hospital-pharmacy",
    label: "Clinical & Hospital Pharmacy",
    desc: "Patient-specific dosing, renal/hepatic adjustments and clinical tools",
    tools: [
      { name: "BSA Calculator", slug: "bsa-calculator", desc: "Body surface area by Mosteller, DuBois, Haycock, Gehan–George or Boyd" },
      { name: "BMI Calculator", slug: "bmi-calculator", desc: "BMI with WHO/Asian bands, plus ideal, adjusted and lean body weight" },
      { name: "Pediatric Dose Calculator", slug: "pedriatic-calculator", desc: "Child dose by mg/kg, compared with Young's, Clark's and Fried's rules" },
      { name: "IV Drip Rate Calculator", slug: "iv-drip-rate-calculator", desc: "Drip rate (gtt/min) = volume × drop factor ÷ minutes, plus mL/h" },
      { name: "Creatinine Calculator", slug: "creatinine-calculator", desc: "CrCl by Cockcroft–Gault (actual/IBW/AdjBW) plus CKD-EPI 2021 eGFR" },
      { name: "GFR Calculator", slug: "gfr-calculator", desc: "eGFR by CKD-EPI 2021 (race-free) or MDRD, with KDIGO G and A staging" },
      { name: "Child-Pugh Calculator", slug: "child-pugh-calculator", desc: "Child-Pugh score and class A/B/C from 5 criteria, optional MELD-Na" },
      { name: "QT Interval Calculator", slug: "qt-interval-calculator", desc: "QTc by Fridericia, Bazett, Framingham or Hodges, with QRS adjustment" },
      { name: "Anticoagulation Risk Calculator", slug: "anti-coagulation-risk-calculator", desc: "CHA₂DS₂-VASc stroke and HAS-BLED bleeding scores, plus DOAC dosing" },
      { name: "Corrected Calcium Calculator", slug: "CorrectedCalciumCalculator", desc: "Albumin-corrected calcium = Ca + 0.8 × (4 − albumin)" },
      { name: "Sodium Correction Calculator", slug: "SodiumCorrectionCalculator", desc: "Glucose-corrected sodium = Na + 0.016 × (glucose − 100)" },
      { name: "Anion Gap Calculator", slug: "AnionGapCalculator", desc: "Anion gap = Na⁺ − (Cl⁻ + HCO₃⁻), optional albumin correction" },
      { name: "Insulin Sensitivity Calculator", slug: "InsulinSensitivityCalculator", desc: "ISF (1500–2200 rule), carb ratio (300–500 rule) and meal/correction bolus" },
    ],
  },
];

export const HUB_TOOL_COUNT = HUB_SUBJECTS.reduce((n, s) => n + s.tools.length, 0);

export function findTool(slug: string): HubTool | undefined {
  for (const subject of HUB_SUBJECTS) {
    const tool = subject.tools.find((t) => t.slug === slug);
    if (tool) return tool;
  }
  return undefined;
}

/**
 * The hero's "Common starting points" card. A hand-picked set of the tools a
 * first-year student reaches for, with the relation each one is built on — not a
 * popularity ranking (there is no usage data behind it, and the card says so by
 * its label). Slugs are looked up, so a removed tool drops out instead of 404ing.
 */
export const START_HERE: { slug: string; label: string; formula: string }[] = [
  { slug: "dilution-calculator", label: "Dilution", formula: "C₁V₁ = C₂V₂" },
  { slug: "molarity-calculator", label: "Molarity", formula: "M = n ÷ V" },
  { slug: "half-life-calculator", label: "Half-life", formula: "t½ = 0.693 ÷ kₑ" },
  { slug: "bsa-calculator", label: "Body surface area", formula: "√(h × w ÷ 3600)" },
  { slug: "iv-drip-rate-calculator", label: "IV drip rate", formula: "V × DF ÷ t" },
];
