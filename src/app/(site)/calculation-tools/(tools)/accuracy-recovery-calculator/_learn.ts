import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Accuracy & % Recovery Calculator. The worked example
 * uses "Multiple replicates" mode (unit µg/mL) and was recomputed independently
 * with Python's statistics module: recoveries 98.875 / 100.7 / 98.7917 %,
 * mean 99.4556 %, sample SD 1.07853 %, %RSD 1.08443 %. The page prints the same.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "spiked recovery at three levels",
    scenario:
      "Illustrative values. To check the accuracy of a UV assay, a placebo blend is spiked with the drug at 80 %, 100 % and 120 % of the working concentration (16, 20 and 24 µg/mL) and each preparation is assayed once. Choose Multiple replicates, set the unit to µg/mL and enter the three trials.",
    given: [
      { label: "Trial 1 (theoretical → found)", value: "16 → 15.82 µg/mL" },
      { label: "Trial 2 (theoretical → found)", value: "20 → 20.14 µg/mL" },
      { label: "Trial 3 (theoretical → found)", value: "24 → 23.71 µg/mL" },
      { label: "Number of trials (n)", value: "3" },
    ],
    steps: [
      {
        label: "% Recovery for each trial = (found / theoretical) × 100",
        working: "%R₁ = 15.82 / 16 × 100 = 98.875 %\n%R₂ = 20.14 / 20 × 100 = 100.7 %\n%R₃ = 23.71 / 24 × 100 = 98.7917 %",
      },
      {
        label: "Mean % recovery x̄ = Σ%Rᵢ / n",
        working: "(98.875 + 100.7 + 98.7917) / 3 = 298.367 / 3 = 99.4556 %",
      },
      {
        label: "Squared deviations (xᵢ − x̄)²",
        working: "0.337045 + 1.54864 + 0.440748 = 2.32644",
      },
      {
        label: "Sample SD = √[Σ(xᵢ − x̄)² / (n − 1)]",
        working: "√(2.32644 / 2) = √1.16322 = 1.07853 %",
      },
      {
        label: "%RSD = (SD / x̄) × 100",
        working: "(1.07853 / 99.4556) × 100 = 1.08443 %",
      },
      {
        label: "Mean % error and mean absolute error",
        working: "Mean % error = (−1.125 + 0.7 + (−1.20833)) / 3 = −0.54 %\nMean absolute error = (0.18 + 0.14 + 0.29) / 3 = 0.2033 µg/mL",
      },
    ],
    answer: "Mean recovery 99.46 % · SD 1.079 % · %RSD 1.08 % (n = 3)",
    interpretation:
      "On average the method found 0.54 percentage points less than was added (accuracy), and the three recoveries agree with each other to about 1 % RSD (precision). Three single determinations are a teaching set: a formal validation usually asks for more determinations, and whether these figures pass is decided by the acceptance criteria in the validation protocol or monograph — enter those limits in the optional range to check them.",
  },
  mistakes: [
    "Calculating recovery from the theoretical amount of the whole batch instead of the amount actually added to that preparation.",
    "Using the population SD (dividing by n) instead of the sample SD (n − 1). For a handful of replicates this understates the spread noticeably.",
    "Treating a good %RSD as proof of accuracy. Replicates can agree closely and still all be biased the same way — check the mean recovery as well.",
    "Entering theoretical and found values in different units (for example mg and µg). This calculator converts nothing, so both columns must already share the unit you selected.",
    "Leaving a blank trial row 'to fill in later'. Every visible row is part of n, so remove rows you did not run.",
    "Quoting a pass or fail without stating the limits. A recovery is only acceptable against criteria from the method protocol or monograph.",
  ],
  limitations: [
    "With n = 1 the sample SD and %RSD are undefined; with two or three trials they are rough estimates of precision.",
    "When the theoretical amounts differ between trials (80/100/120 % levels), the mean absolute error averages errors made at different levels — compare trials by % recovery instead.",
    "The calculator describes the data you enter; it does not detect outliers or test whether the bias is statistically significant.",
  ],
  refs: ["harris10", "ichQ2R2", "uspValidation"],
  related: [
    {
      slug: "percentage-recovery-calculator",
      name: "Percentage Recovery Calculator",
      why: "For a single recovery where the amounts are in different units or come from concentration × volume.",
    },
    {
      slug: "calibration-curve-calculator",
      name: "Calibration Curve Calculator",
      why: "To turn each absorbance into the 'found' concentration before entering it here.",
    },
  ],
  guide: { slug: "accuracy-precision-recovery", title: "Accuracy, Precision and Percentage Recovery in Pharmaceutical Analysis" },
};
