/**
 * The catalogue shown on the Android app's home screen.
 *
 * Deliberately separate from the web hub's `allTools` array in
 * `src/app/(site)/calculation-tools/CalculationToolsClient.tsx`: the web hub
 * lists 87 tools (before the six analytical practicals of 2026-09-13), but 11 more tool directories exist — six are linked only
 * from `src/app/clinical/dose-calculators/page.tsx` and five are linked from
 * nowhere at all. Offline, there is no clinical subdomain to reach them
 * through, so the app ships every one (104 as of 2026-09-13).
 *
 * DRIFT IS HANDLED, NOT ASSUMED: `mobile/app/_generated/tool-slugs.ts` is
 * regenerated from the directory listing on every mobile build, and the home
 * screen renders any slug missing from this file under an automatic
 * "More Tools" group. Adding a calculator can therefore never make it
 * unreachable in the app — at worst it lands in the wrong category.
 */

export type ToolCategory = {
  id: string;
  label: string;
  desc: string;
  /** Tool slugs, in display order. The slug is the directory name. */
  slugs: string[];
};

/** slug → display name. Names match the web hub so the two catalogues read alike. */
export const TOOL_NAMES: Record<string, string> = {
  // Pharmaceutical Chemistry
  "molarity-calculator": "Molarity Calculator",
  "mass-molarity-calculator": "Mass–Molarity Calculator",
  "mg-ml-to-molarity-calculator": "mg/mL ↔ Molarity Calculator",
  "normality-calculator": "Normality Calculator",
  "percentage-solution-calculator": "Percentage Solution Calculator (w/v, w/w, v/v)",
  "ppm-ppb-calculator": "ppm / ppb Calculator",
  "dilution-calculator": "Dilution Calculator (C₁V₁ = C₂V₂)",
  "serial-dilution-calculator": "Serial Dilution Calculator",
  "theoretical-yield-calculator": "Theoretical Yield Calculator",
  "percentage-yield-calculator": "Percentage Yield Calculator",
  "molecular-weight-finder": "Molecular Weight Finder",
  "solubility-calculator": "Solubility Calculator",
  "heat-formation-calculator": "Heat of Formation Calculator",
  "pH-pka-relationship-calculator": "pH–pKa Calculator (Henderson–Hasselbalch)",
  "combined-pka-suite": "Combined pKa Suite",
  HeatOfNeutralizationCalculator: "Heat Of Neutralization Calculator",

  // Unit Conversion
  MassConversionCalculator: "Mass Conversion Calculator",
  VolumeConversionCalculator: "Volume Conversion Calculator",
  ElectrolyteConversionCalculator: "mmol ↔ mEq ↔ mg Calculator",
  TemperatureConversionCalculator: "Temperature Conversion Calculator",
  StrengthConversionCalculator: "Strength Conversion Calculator",
  DensityConversionCalculator: "Weight/Volume Conversion Calculator (Density-Based)",

  // Pharmaceutics
  "powder-flowability-calculator": "Powder Flowability Calculator",
  "surface-area-particle-size-calculator": "Surface Area–Particle Size Calculator",
  "compressibility-index-calculator": "Compressibility Index Calculator",
  "porosity-calculator": "Porosity Calculator",
  "density-calculator": "Density Calculator",
  "relative-density-bottle-calculator": "Density & Relative Density Bottle Calculator",
  "master-formula-calculator": "Master Formula Calculator",
  "uv-spectrum-plotter": "UV-Vis Spectrum Plotter",
  "percentage-recovery-calculator": "Percentage Recovery Calculator",
  "calibration-curve-calculator": "Calibration Curve Calculator",
  "accuracy-recovery-calculator": "Accuracy & % Recovery Calculator",
  "dissolution-calculator": "Dissolution Calculator",
  "cumulative-drug-release-calculator": "Cumulative Drug Release Calculator",
  "dialysis-diffusion-calculator": "Dialysis Membrane / Diffusion Calculator",
  "partition-coefficient-calculator": "Partition / Distribution Coefficient Calculator",
  "wbc-count-calculator": "WBC Count Calculator",
  "rbc-count-calculator": "RBC Count Calculator",
  "tablet-disintegration-dissolution-profile-plotter": "Tablet Dissolution Profile Plotter",
  "content-uniformity-calculator": "Content Uniformity Calculator",
  "osmolarity-calculators": "Osmolarity Calculator",
  "osmolality-calculators": "Osmolality Calculator",
  "isotonicity-calculator": "Isotonicity Calculator",
  "sterile-dose-volume": "Sterile Dose Volume Calculator",
  "drug-excipient-compatibility-predictor": "Drug–Excipient Compatibility Predictor",

  // Biopharmaceutics & Pharmacokinetics
  "half-life-calculator": "Half-Life Calculator",
  "ke-calculator": "Ke Calculator",
  "clearance-calculator": "Clearance Calculator",
  "volume-distribution-calculator": "Volume of Distribution Calculator",
  "auc-estimator": "AUC Estimator",
  "bioavailability-calculator": "Bioavailability Calculator",
  "loading-dose-calculator": "Loading Dose Calculator",
  "maintenance-dose-calculator": "Maintenance Dose Calculator",
  "order-kinetics-calculator": "First-Order vs Zero-Order Kinetics Tool",
  "bioequivalence-calculator": "Bioequivalence Calculator",
  AccumulationIndexCalculator: "Accumulation Index Calculator",
  MeanResidenceTimeCalculator: "Mean Residence Time Calculator",
  "drug-half-life-calculator": "Drug Half-Life Calculator (Multiple Dose)",
  "vancomycin-auc-calculator": "Vancomycin AUC/MIC Calculator",

  // Pharmacology
  "animal-dose": "Animal Weight-Based Dose Calculator",
  "serial-diluation": "Serial Dose Calculator",
  "drug-receptor-binding-affinity-tool": "Drug–Receptor Binding Affinity Tool",
  "therapeutic-index-calculator": "Therapeutic Index Calculator",
  "dose-response-curve-generator": "Dose–Response Curve Generator",
  "ed50-td50-ld50-calculator": "ED50 / TD50 / LD50 Calculator",
  AntagonismSimulator: "Antagonism Simulator",
  EmaxModelCalculator: "Emax Model Calculator",

  // Pharmaceutical Analysis
  "law-absorbance-calculator": "Beer-Lambert Law Calculator",
  "uv-analyzer-tool": "UV-Vis Peak Analyzer",
  "chromatographic-resolution-calculator": "Chromatographic Resolution Calculator",
  "rf-value-calculator": "TLC Rf Analyzer",
  "percent-purity-calculator": "Percent Purity Calculator",
  "ash-value-calculator": "Ash Value Calculator",

  // Microbiology
  "cfu-calculator": "Colony Counter & CFU Calculator",
  "sterilization-calculator": "Sterilization Calculator",
  "zone-of-inhibition-calculator": "Zone of Inhibition Calculator",
  DValueCalculator: "D-Value Calculator",
  FValueCalculator: "F-Value Calculator",
  LogReductionCalculator: "Log Reduction Calculator",

  // Pharmaceutical Engineering
  "heat-transfer-area": "Heat Transfer Area Calculator",
  "reynolds-number": "Reynolds Number Calculator",
  "drying-rate": "Drying Rate Calculator",
  "mixing-time-estimator": "Mixing Time Estimator",

  // Clinical & Hospital Pharmacy
  "bsa-calculator": "BSA Calculator",
  "bmi-calculator": "BMI Calculator",
  "pedriatic-calculator": "Pediatric Dose Calculator",
  "iv-drip-rate-calculator": "IV Drip Rate Calculator",
  "creatinine-calculator": "Creatinine Calculator",
  "gfr-calculator": "GFR Calculator",
  "child-pugh-calculator": "Child-Pugh Calculator",
  "qt-interval-calculator": "QT Interval Calculator",
  "anti-coagulation-risk-calculator": "Anticoagulation Risk Calculator",
  CorrectedCalciumCalculator: "Corrected Calcium Calculator",
  SodiumCorrectionCalculator: "Sodium Correction Calculator",
  AnionGapCalculator: "Anion Gap Calculator",
  InsulinSensitivityCalculator: "Insulin Sensitivity Calculator",
  GeriatricDosingCalculator: "Geriatric Dose Calculator",
  "renal-dosing-adjuster": "Renal Dose Adjustment Calculator",
  OpioidMMECalculator: "Opioid MME Calculator",
  OpioidConversionCalculator: "Opioid Conversion Calculator",
  "reconstitution-calculator": "Reconstitution Calculator",
  tpn: "TPN Calculator",
  OsmolarGapCalculator: "Osmolar Gap Calculator",
};

export const CATEGORIES: ToolCategory[] = [
  {
    id: "pharma-chem",
    label: "Pharmaceutical Chemistry",
    desc: "Solution prep, concentration & chemical analysis",
    slugs: [
      "molarity-calculator",
      "mass-molarity-calculator",
      "mg-ml-to-molarity-calculator",
      "normality-calculator",
      "percentage-solution-calculator",
      "ppm-ppb-calculator",
      "dilution-calculator",
      "serial-dilution-calculator",
      "theoretical-yield-calculator",
      "percentage-yield-calculator",
      "molecular-weight-finder",
      "solubility-calculator",
      "heat-formation-calculator",
      "pH-pka-relationship-calculator",
      "combined-pka-suite",
      "HeatOfNeutralizationCalculator",
    ],
  },
  {
    id: "unit-conversion",
    label: "Unit Conversion",
    desc: "Mass, volume, temperature and strength conversions",
    slugs: [
      "MassConversionCalculator",
      "VolumeConversionCalculator",
      "ElectrolyteConversionCalculator",
      "TemperatureConversionCalculator",
      "StrengthConversionCalculator",
      "DensityConversionCalculator",
    ],
  },
  {
    id: "pharmaceutics",
    label: "Pharmaceutics",
    desc: "Formulation, powder, dissolution and dosage form",
    slugs: [
      "powder-flowability-calculator",
      "surface-area-particle-size-calculator",
      "compressibility-index-calculator",
      "porosity-calculator",
      "density-calculator",
      "relative-density-bottle-calculator",
      "tablet-disintegration-dissolution-profile-plotter",
      "content-uniformity-calculator",
      "osmolarity-calculators",
      "osmolality-calculators",
      "isotonicity-calculator",
      "sterile-dose-volume",
      "drug-excipient-compatibility-predictor",
      "master-formula-calculator",
      "dissolution-calculator",
      "cumulative-drug-release-calculator",
    ],
  },
  {
    id: "biopharmaceutics-pharmacokinetics",
    label: "Biopharmaceutics & Pharmacokinetics",
    desc: "ADME parameters, half-life, clearance and kinetics",
    slugs: [
      "half-life-calculator",
      "drug-half-life-calculator",
      "ke-calculator",
      "clearance-calculator",
      "volume-distribution-calculator",
      "auc-estimator",
      "bioavailability-calculator",
      "loading-dose-calculator",
      "maintenance-dose-calculator",
      "order-kinetics-calculator",
      "bioequivalence-calculator",
      "AccumulationIndexCalculator",
      "MeanResidenceTimeCalculator",
      "dialysis-diffusion-calculator",
      "partition-coefficient-calculator",
      "vancomycin-auc-calculator",
    ],
  },
  {
    id: "pharmacology",
    label: "Pharmacology",
    desc: "Drug-receptor interactions, dose-response and safety",
    slugs: [
      "animal-dose",
      "serial-diluation",
      "drug-receptor-binding-affinity-tool",
      "therapeutic-index-calculator",
      "dose-response-curve-generator",
      "ed50-td50-ld50-calculator",
      "EmaxModelCalculator",
      "AntagonismSimulator",
    ],
  },
  {
    id: "pharmaceutical-analysis",
    label: "Pharmaceutical Analysis",
    desc: "Spectroscopy, chromatography, purity and assay",
    slugs: [
      "law-absorbance-calculator",
      "uv-analyzer-tool",
      "uv-spectrum-plotter",
      "calibration-curve-calculator",
      "chromatographic-resolution-calculator",
      "rf-value-calculator",
      "percent-purity-calculator",
      "percentage-recovery-calculator",
      "accuracy-recovery-calculator",
      "ash-value-calculator",
    ],
  },
  {
    id: "physiology",
    label: "Physiology",
    desc: "Hemocytometry and blood-cell counting",
    slugs: ["wbc-count-calculator", "rbc-count-calculator"],
  },
  {
    id: "microbiology",
    label: "Microbiology",
    desc: "Microbial quantification, sterilization and testing",
    slugs: [
      "cfu-calculator",
      "sterilization-calculator",
      "zone-of-inhibition-calculator",
      "DValueCalculator",
      "FValueCalculator",
      "LogReductionCalculator",
    ],
  },
  {
    id: "pharmaceutical-engineering",
    label: "Pharmaceutical Engineering",
    desc: "Industrial processes, heat transfer and scale-up",
    slugs: [
      "heat-transfer-area",
      "reynolds-number",
      "drying-rate",
      "mixing-time-estimator",
    ],
  },
  {
    id: "clinical-hospital-pharmacy",
    label: "Clinical & Hospital Pharmacy",
    desc: "Patient-specific dosing and renal/hepatic adjustments",
    slugs: [
      "bsa-calculator",
      "bmi-calculator",
      "pedriatic-calculator",
      "GeriatricDosingCalculator",
      "iv-drip-rate-calculator",
      "creatinine-calculator",
      "gfr-calculator",
      "renal-dosing-adjuster",
      "child-pugh-calculator",
      "qt-interval-calculator",
      "anti-coagulation-risk-calculator",
      "CorrectedCalciumCalculator",
      "SodiumCorrectionCalculator",
      "AnionGapCalculator",
      "OsmolarGapCalculator",
      "InsulinSensitivityCalculator",
      "OpioidMMECalculator",
      "OpioidConversionCalculator",
      "reconstitution-calculator",
      "tpn",
    ],
  },
];

/**
 * Tools that cannot produce a result without a network connection. The home
 * screen and the tool shell badge these so a student offline in a lab knows
 * before tapping. None today: the CFU calculator used to post plate photos to
 * the Gemini-backed /api/scan-colonies route, but since 2026-09-16 it counts
 * colonies on the device with bundled OpenCV.js. Kept for the next tool that
 * genuinely needs the network.
 */
export const ONLINE_ONLY_SLUGS = new Set<string>([]);

/**
 * Card labels for the home-screen grid. Full names like
 * "Percentage Solution Calculator (w/v, w/w, v/v)" do not fit a three-column
 * phone layout, so the noise is stripped: a trailing type word ("Calculator",
 * "Tool", "Estimator", …) and any parenthetical. The full name still appears in
 * the app bar once the tool is open, and search matches against it.
 */
const SHORT_NAME_OVERRIDES: Record<string, string> = {
  "cfu-calculator": "Colony Counter",
  "order-kinetics-calculator": "Zero vs First Order",
  "drug-excipient-compatibility-predictor": "Drug–Excipient Fit",
  "surface-area-particle-size-calculator": "Surface Area / Size",
  "tablet-disintegration-dissolution-profile-plotter": "Dissolution Profile",
  "drug-receptor-binding-affinity-tool": "Receptor Binding",
  "anti-coagulation-risk-calculator": "Anticoagulation Risk",
  "vancomycin-auc-calculator": "Vancomycin AUC",
  "drug-half-life-calculator": "Half-Life (Multi-Dose)",
  "mg-ml-to-molarity-calculator": "mg/mL ↔ Molarity",
  ElectrolyteConversionCalculator: "mmol ↔ mEq ↔ mg",
  DensityConversionCalculator: "Weight / Volume",
  InsulinSensitivityCalculator: "Insulin Sensitivity",
  GeriatricDosingCalculator: "Geriatric Dose",
  "renal-dosing-adjuster": "Renal Adjustment",
  "chromatographic-resolution-calculator": "Chromatographic Res.",
  "zone-of-inhibition-calculator": "Zone of Inhibition",
  "volume-distribution-calculator": "Volume of Distribution",
  "law-absorbance-calculator": "Beer-Lambert",
  "relative-density-bottle-calculator": "Density Bottle",
  "percentage-recovery-calculator": "% Recovery",
  "percentage-yield-calculator": "% Yield",
  "master-formula-calculator": "Master Formula",
  "accuracy-recovery-calculator": "Accuracy & Recovery",
  "cumulative-drug-release-calculator": "Cumulative Release",
  "dialysis-diffusion-calculator": "Dialysis / Diffusion",
  "partition-coefficient-calculator": "Partition Coefficient",
};

const TYPE_SUFFIXES =
  /\s+(Calculator|Calculators|Tool|Finder|Estimator|Generator|Plotter|Predictor|Analyzer|Simulator|Suite)$/;

export function toolShortName(slug: string): string {
  const override = SHORT_NAME_OVERRIDES[slug];
  if (override) return override;

  const full = TOOL_NAMES[slug] ?? slug;
  return full
    .replace(/\s*\([^)]*\)/g, "") // drop "(w/v, w/w, v/v)" and friends
    .replace(TYPE_SUFFIXES, "")
    .trim();
}
