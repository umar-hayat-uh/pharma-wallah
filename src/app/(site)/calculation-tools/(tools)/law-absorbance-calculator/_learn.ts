import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Beer–Lambert calculator. The worked example uses the
 * "Solve for concentration" mode with the page's own NADH preset (ε = 6220
 * M⁻¹cm⁻¹ at 340 nm), the concentration unit set to μM. Figures match what the
 * page prints (concentration in toExponential(4), T to 2 dp) and were
 * recomputed in Python.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "NADH concentration from its absorbance at 340 nm",
    scenario:
      "A solution of NADH is read at 340 nm in a standard 1 cm quartz cuvette against a buffer blank, giving A = 0.452. The molar absorptivity of NADH at 340 nm is 6220 M⁻¹cm⁻¹. Find the concentration in μM and the transmittance.",
    given: [
      { label: "Absorbance (A)", value: "0.452" },
      { label: "Molar absorptivity (ε)", value: "6220 M⁻¹cm⁻¹" },
      { label: "Path length (l)", value: "1 cm" },
      { label: "Report concentration in", value: "μM" },
    ],
    steps: [
      { label: "Rearrange the law", working: "A = ε · c · l  →  c = A ÷ (ε · l)" },
      { label: "Substitute", working: "c = 0.452 ÷ (6220 M⁻¹cm⁻¹ × 1 cm) = 7.2669 × 10⁻⁵ M" },
      { label: "Convert to μM", working: "7.2669 × 10⁻⁵ M × 10⁶ μM/M = 72.669 μM (shown as 7.2669e+1)" },
      { label: "Transmittance", working: "T = 10⁻ᴬ × 100 = 10⁻⁰·⁴⁵² × 100 = 35.32 %" },
    ],
    answer: "c ≈ 72.67 μM (7.2669 × 10⁻⁵ M); T = 35.32 %.",
    interpretation:
      "About a third of the 340 nm light gets through the cell, and an absorbance of 0.452 sits in the 0.1–1.0 range where readings are most reliable, so the concentration can be trusted as far as ε can. The result is only as good as the ε used: it holds for this wavelength, solvent and pH, and it says nothing about whether the absorbance came from NADH alone. Any other species absorbing at 340 nm is counted as NADH.",
  },
  mistakes: [
    "Entering a 10 mm cell as '10' with the unit left on cm. That makes l ten times too long and the concentration ten times too small (7.27 μM instead of 72.67 μM here).",
    "Using a specific absorbance A(1 %, 1 cm) as if it were ε. Convert first: ε = A(1 %, 1 cm) × MW ÷ 10.",
    "Reading the concentration in the wrong unit: the solved value is reported in the unit selected in the concentration field, so 7.2669e+1 with μM selected is 72.67 μM, not 72.67 M.",
    "Not zeroing the instrument on a blank of the same solvent or buffer, so the solvent's own absorbance is counted as sample.",
    "Measuring off λmax, or using an ε quoted at a different wavelength, solvent or pH.",
    "Trusting a reading above about 1.0. Stray light makes the response non-linear there; dilute the sample and multiply back by the dilution factor.",
  ],
  limitations: [
    "Linear only over a limited range — roughly A 0.1 to 1.0 on most instruments. At high concentration, molecular interactions and stray light bend the line.",
    "Assumes monochromatic light; a wide spectral bandwidth relative to the absorption band lowers the apparent ε.",
    "Assumes a clear, homogeneous, non-scattering solution in which the analyte does not associate, dissociate or react as concentration changes.",
    "Assumes the analyte is the only absorbing species at that wavelength; mixtures need a separation or a multi-wavelength method.",
    "Uses one literature ε. For a regulated assay, ε (or the slope) comes from a calibration with reference standards on the same instrument.",
  ],
  refs: ["harris10", "iupacGoldBook"],
  related: [
    {
      slug: "calibration-curve-calculator",
      name: "Calibration Curve Calculator",
      why: "Fit your own standards instead of relying on a literature ε, and check linearity with R².",
    },
    {
      slug: "uv-spectrum-plotter",
      name: "UV-Vis Spectrum Plotter",
      why: "Find λmax from a scan before choosing the wavelength to measure at.",
    },
    {
      slug: "mg-ml-to-molarity-calculator",
      name: "mg/mL ↔ Molarity Calculator",
      why: "Turn a molar result into mg/mL (or the reverse) using the molecular weight.",
    },
  ],
};
