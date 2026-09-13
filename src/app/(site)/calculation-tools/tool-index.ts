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
      { name: "Molarity Calculator", slug: "molarity-calculator", desc: "" },
      { name: "Mass–Molarity Calculator", slug: "mass-molarity-calculator", desc: "" },
      { name: "mg/mL ↔ Molarity Calculator", slug: "mg-ml-to-molarity-calculator", desc: "" },
      { name: "Normality Calculator", slug: "normality-calculator", desc: "" },
      { name: "Percentage Solution Calculator (w/v, w/w, v/v)", slug: "percentage-solution-calculator", desc: "" },
      { name: "ppm / ppb Calculator", slug: "ppm-ppb-calculator", desc: "" },
      { name: "Dilution Calculator (C₁V₁ = C₂V₂)", slug: "dilution-calculator", desc: "" },
      { name: "Serial Dilution Calculator", slug: "serial-dilution-calculator", desc: "" },
      { name: "Theoretical Yield Calculator", slug: "theoretical-yield-calculator", desc: "" },
      { name: "Percentage Yield Calculator", slug: "percentage-yield-calculator", desc: "" },
      { name: "Molecular Weight Finder", slug: "molecular-weight-finder", desc: "" },
      { name: "Solubility Calculator", slug: "solubility-calculator", desc: "" },
      { name: "Heat of Formation Calculator", slug: "heat-formation-calculator", desc: "" },
      { name: "pH–pKa Calculator (Henderson–Hasselbalch)", slug: "pH-pka-relationship-calculator", desc: "" },
      { name: "Combined pKa Suite", slug: "combined-pka-suite", desc: "" },
      { name: "Heat Of Neutralization Calculator", slug: "HeatOfNeutralizationCalculator", desc: "" },
    ],
  },
  {
    id: "unit-conversion",
    label: "Unit Conversion",
    desc: "Convert between pharmaceutical units: mass, volume, concentration",
    tools: [
      { name: "Mass Conversion Calculator", slug: "MassConversionCalculator", desc: "" },
      { name: "Volume Conversion Calculator", slug: "VolumeConversionCalculator", desc: "" },
      { name: "mmol ↔ mEq ↔ mg Calculator", slug: "ElectrolyteConversionCalculator", desc: "" },
      { name: "Temperature Conversion Calculator", slug: "TemperatureConversionCalculator", desc: "" },
      { name: "Strength Conversion Calculator", slug: "StrengthConversionCalculator", desc: "" },
      { name: "Weight/Volume Conversion Calculator (Density-Based)", slug: "DensityConversionCalculator", desc: "" },
    ],
  },
  {
    id: "pharmaceutics",
    label: "Pharmaceutics",
    desc: "Formulation, powder, dissolution and dosage form calculations",
    tools: [
      { name: "Powder Flowability Calculator", slug: "powder-flowability-calculator", desc: "" },
      { name: "Surface Area–Particle Size Calculator", slug: "surface-area-particle-size-calculator", desc: "" },
      { name: "Compressibility Index Calculator", slug: "compressibility-index-calculator", desc: "" },
      { name: "Porosity Calculator", slug: "porosity-calculator", desc: "" },
      { name: "Density Calculator", slug: "density-calculator", desc: "" },
      { name: "Density & Relative Density Bottle Calculator", slug: "relative-density-bottle-calculator", desc: "" },
      { name: "Tablet Dissolution Profile Plotter", slug: "tablet-disintegration-dissolution-profile-plotter", desc: "" },
      { name: "Content Uniformity Calculator", slug: "content-uniformity-calculator", desc: "" },
      { name: "Osmolarity Calculator", slug: "osmolarity-calculators", desc: "" },
      { name: "Osmolality Calculator", slug: "osmolality-calculators", desc: "" },
      { name: "Isotonicity Calculator", slug: "isotonicity-calculator", desc: "" },
      { name: "Sterile Dose Volume Calculator", slug: "sterile-dose-volume", desc: "" },
      { name: "Drug–Excipient Compatibility Predictor", slug: "drug-excipient-compatibility-predictor", desc: "" },
      { name: "Master Formula Calculator", slug: "master-formula-calculator", desc: "" },
    ],
  },
  {
    id: "biopharmaceutics-pharmacokinetics",
    label: "Biopharmaceutics & Pharmacokinetics",
    desc: "ADME parameters, half-life, clearance and kinetics tools",
    tools: [
      { name: "Half-Life Calculator", slug: "half-life-calculator", desc: "" },
      { name: "Ke Calculator", slug: "ke-calculator", desc: "" },
      { name: "Clearance Calculator", slug: "clearance-calculator", desc: "" },
      { name: "Volume of Distribution Calculator", slug: "volume-distribution-calculator", desc: "" },
      { name: "AUC Estimator", slug: "auc-estimator", desc: "" },
      { name: "Bioavailability Calculator", slug: "bioavailability-calculator", desc: "" },
      { name: "Loading Dose Calculator", slug: "loading-dose-calculator", desc: "" },
      { name: "Maintenance Dose Calculator", slug: "maintenance-dose-calculator", desc: "" },
      { name: "First-Order vs Zero-Order Kinetics Tool", slug: "order-kinetics-calculator", desc: "" },
      { name: "Bioequivalence Calculator", slug: "bioequivalence-calculator", desc: "" },
      { name: "Accumulation Index Calculator", slug: "AccumulationIndexCalculator", desc: "" },
      { name: "Mean Residence Time Calculator", slug: "MeanResidenceTimeCalculator", desc: "" },
    ],
  },
  {
    id: "pharmacology",
    label: "Pharmacology",
    desc: "Drug-receptor interactions, dose-response and safety margins",
    tools: [
      { name: "Animal Weight-Based Dose Calculator", slug: "animal-dose", desc: "" },
      { name: "Serial Dose Calculator", slug: "serial-diluation", desc: "" },
      { name: "Drug–Receptor Binding Affinity Tool", slug: "drug-receptor-binding-affinity-tool", desc: "" },
      { name: "Therapeutic Index Calculator", slug: "therapeutic-index-calculator", desc: "" },
      { name: "Dose–Response Curve Generator", slug: "dose-response-curve-generator", desc: "" },
      { name: "ED50 / TD50 / LD50 Calculator", slug: "ed50-td50-ld50-calculator", desc: "" },
    ],
  },
  {
    id: "pharmaceutical-analysis",
    label: "Pharmaceutical Analysis",
    desc: "Spectroscopy, chromatography, purity and assay calculations",
    tools: [
      { name: "Beer-Lambert Law Calculator", slug: "law-absorbance-calculator", desc: "" },
      { name: "UV-Vis Peak Analyzer", slug: "uv-analyzer-tool", desc: "" },
      { name: "UV-Vis Spectrum Plotter", slug: "uv-spectrum-plotter", desc: "" },
      { name: "Chromatographic Resolution Calculator", slug: "chromatographic-resolution-calculator", desc: "" },
      { name: "Rf Value Calculator", slug: "rf-value-calculator", desc: "" },
      { name: "Percent Purity Calculator", slug: "percent-purity-calculator", desc: "" },
      { name: "Percentage Recovery Calculator", slug: "percentage-recovery-calculator", desc: "" },
      { name: "Ash Value Calculator", slug: "ash-value-calculator", desc: "" },
    ],
  },
  {
    id: "physiology",
    label: "Physiology",
    desc: "Hemocytometry and blood-cell counting for the physiology lab",
    tools: [
      { name: "WBC Count Calculator", slug: "wbc-count-calculator", desc: "" },
      { name: "RBC Count Calculator", slug: "rbc-count-calculator", desc: "" },
    ],
  },
  {
    id: "microbiology",
    label: "Microbiology",
    desc: "Microbial quantification, sterilization and antimicrobial testing",
    tools: [
      { name: "CFU Calculator", slug: "cfu-calculator", desc: "" },
      { name: "Sterilization Calculator", slug: "sterilization-calculator", desc: "" },
      { name: "Zone of Inhibition Calculator", slug: "zone-of-inhibition-calculator", desc: "" },
      { name: "D-Value Calculator", slug: "DValueCalculator", desc: "" },
      { name: "F-Value Calculator", slug: "FValueCalculator", desc: "" },
      { name: "Log Reduction Calculator", slug: "LogReductionCalculator", desc: "" },
    ],
  },
  {
    id: "pharmaceutical-engineering",
    label: "Pharmaceutical Engineering",
    desc: "Industrial processes, heat transfer and scale-up calculations",
    tools: [
      { name: "Heat Transfer Area Calculator", slug: "heat-transfer-area", desc: "" },
      { name: "Reynolds Number Calculator", slug: "reynolds-number", desc: "" },
      { name: "Drying Rate Calculator", slug: "drying-rate", desc: "" },
      { name: "Mixing Time Estimator", slug: "mixing-time-estimator", desc: "" },
    ],
  },
  {
    id: "clinical-hospital-pharmacy",
    label: "Clinical & Hospital Pharmacy",
    desc: "Patient-specific dosing, renal/hepatic adjustments and clinical tools",
    tools: [
      { name: "BSA Calculator", slug: "bsa-calculator", desc: "" },
      { name: "BMI Calculator", slug: "bmi-calculator", desc: "" },
      { name: "Pediatric Dose Calculator", slug: "pedriatic-calculator", desc: "" },
      { name: "IV Drip Rate Calculator", slug: "iv-drip-rate-calculator", desc: "" },
      { name: "Creatinine Calculator", slug: "creatinine-calculator", desc: "" },
      { name: "GFR Calculator", slug: "gfr-calculator", desc: "" },
      { name: "Child-Pugh Calculator", slug: "child-pugh-calculator", desc: "" },
      { name: "QT Interval Calculator", slug: "qt-interval-calculator", desc: "" },
      { name: "Anticoagulation Risk Calculator", slug: "anti-coagulation-risk-calculator", desc: "" },
      { name: "Corrected Calcium Calculator", slug: "CorrectedCalciumCalculator", desc: "" },
      { name: "Sodium Correction Calculator", slug: "SodiumCorrectionCalculator", desc: "" },
      { name: "Anion Gap Calculator", slug: "AnionGapCalculator", desc: "" },
      { name: "Insulin Sensitivity Calculator", slug: "InsulinSensitivityCalculator", desc: "" },
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
export const START_HERE: { slug: string; formula: string }[] = [
  { slug: "dilution-calculator", formula: "C₁V₁ = C₂V₂" },
  { slug: "molarity-calculator", formula: "M = n / V" },
  { slug: "half-life-calculator", formula: "t½ = 0.693 / k" },
  { slug: "bsa-calculator", formula: "BSA" },
  { slug: "iv-drip-rate-calculator", formula: "gtt/min" },
];
