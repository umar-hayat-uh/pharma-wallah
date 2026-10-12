import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Calibration Curve Calculator. The worked example was
 * recomputed independently with Python's statistics.linear_regression:
 * m = 0.0397, c = 0.0012, R² = 0.999513, unknown X = 12.8665 µg/mL.
 * The page prints m 0.0397, c 0.0012, R² 0.9995 and 12.87 µg/mL.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "five UV standards and one unknown",
    scenario:
      "Illustrative values. Five standard solutions of a drug (4–20 µg/mL) are read at the drug's λmax against a solvent blank. A tablet extract, diluted to fall inside the range, reads 0.512 AU. Enter the five standards, unit µg/mL, and the unknown absorbance.",
    given: [
      { label: "Concentrations X (µg/mL)", value: "4, 8, 12, 16, 20" },
      { label: "Absorbances Y (AU)", value: "0.158, 0.321, 0.474, 0.645, 0.790" },
      { label: "Number of standards (n)", value: "5" },
      { label: "Unknown absorbance", value: "0.512 AU" },
    ],
    steps: [
      {
        label: "Sums",
        working: "ΣX = 60   ΣY = 2.388   ΣXY = 35.008   ΣX² = 880",
      },
      {
        label: "Slope m = [nΣxy − (Σx)(Σy)] / [nΣx² − (Σx)²]",
        working: "m = (5 × 35.008 − 60 × 2.388) / (5 × 880 − 60²)\n  = (175.04 − 143.28) / (4,400 − 3,600)\n  = 31.76 / 800 = 0.0397 AU per µg/mL",
      },
      {
        label: "Intercept c = [Σy − mΣx] / n",
        working: "c = (2.388 − 0.0397 × 60) / 5 = (2.388 − 2.382) / 5 = 0.0012 AU",
      },
      {
        label: "Goodness of fit R² = 1 − SSE / SST",
        working: "R² = 1 − (0.0001228 / 0.252297) = 0.999513",
      },
      {
        label: "Unknown: X = (Y − c) / m",
        working: "X = (0.512 − 0.0012) / 0.0397 = 0.5108 / 0.0397 = 12.8665 µg/mL",
      },
    ],
    answer: "Y = 0.0397X + 0.0012 · R² = 0.9995 · unknown = 12.87 µg/mL",
    interpretation:
      "12.87 µg/mL is the concentration in the cuvette, inside the 4–20 µg/mL range of the standards, so it is an interpolation. To report the drug content of the tablet you still multiply by every dilution made from the tablet to the cuvette. A high R² is necessary but not sufficient: look at the graph for points that curve away from the line.",
  },
  mistakes: [
    "Swapping the axes. Concentration (what you prepared) is X and absorbance (what you measured) is Y; regressing X on Y gives a different line.",
    "Adding a (0, 0) point that was never measured. It forces the line towards the origin; enter only the readings you actually recorded.",
    "Reading an unknown that lies above the top standard. The result is an extrapolation — dilute the sample so its absorbance falls within the curve.",
    "Forgetting the dilution factor. The calibration gives the concentration in the cuvette, not in the original sample.",
    "Judging linearity by R² alone. A curved set of points can still give R² above 0.99; check the residuals or the plot.",
    "Using a curve prepared in a different solvent or at a different wavelength from the one the sample was read in.",
  ],
  limitations: [
    "Ordinary least squares assumes the error is in Y only and is similar across the range; it does not weight points.",
    "A straight line is valid only where Beer–Lambert behaviour holds. At high absorbance, stray light and instrument limits bend the curve.",
    "R² describes the fit to these standards; it says nothing about the accuracy of the standards themselves or of an unknown read on another day.",
    "Acceptance criteria for linearity (minimum R², number of levels, range) come from the method protocol or monograph, not from this calculator.",
  ],
  refs: ["harris10", "ichQ2R2", "uspValidation"],
  related: [
    {
      slug: "dissolution-calculator",
      name: "Dissolution Calculator",
      why: "Uses this line (as Y = a + bX) to turn dissolution absorbances into % drug release.",
    },
    {
      slug: "accuracy-recovery-calculator",
      name: "Accuracy & % Recovery Calculator",
      why: "Checks how close concentrations read from the curve are to the amounts you added.",
    },
    {
      slug: "uv-spectrum-plotter",
      name: "UV-Vis Spectrum Plotter",
      why: "To find the λmax at which the standards should be read.",
    },
  ],
  guide: { slug: "accuracy-precision-recovery", title: "Accuracy, Precision and Percentage Recovery in Pharmaceutical Analysis" },
};
