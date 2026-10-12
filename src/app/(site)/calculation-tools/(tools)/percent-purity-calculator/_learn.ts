import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the percent purity (titrimetric assay) calculator. The
 * worked example is an iodometric assay of ascorbic acid, chosen because its
 * equivalent factor uses n = 2, so it teaches the one step students most often
 * get wrong. W is in g and E in g/mEq, the only pairing the page's label and
 * its own figures support (see the redesign tracker, R3). Every figure matches
 * what the page prints (mEq and analyte to 4 dp, purity to 2 dp) and was
 * recomputed in Python.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "Iodometric assay of ascorbic acid",
    scenario:
      "0.1500 g of ascorbic acid (C₆H₈O₆, M = 176.12 g/mol) is dissolved and titrated directly with 0.1 N iodine (0.05 M I₂). The blank-corrected end point is 16.85 mL. Each molecule loses 2 electrons when iodine oxidises it to dehydroascorbic acid. Find the % purity.",
    given: [
      { label: "Sample weight (W)", value: "0.1500 g" },
      { label: "Titrant volume (V)", value: "16.85 mL" },
      { label: "Titrant normality (N)", value: "0.1 N" },
      { label: "Equivalent factor (E)", value: "0.08806 g/mEq" },
      { label: "Dilution factor (D)", value: "1" },
    ],
    steps: [
      { label: "Equivalent factor", working: "E = M ÷ n ÷ 1000 = 176.12 ÷ 2 ÷ 1000 = 0.08806 g/mEq" },
      { label: "Milliequivalents of titrant", working: "V × N = 16.85 mL × 0.1 mEq/mL = 1.6850 mEq" },
      { label: "Analyte found", working: "V × N × E × D = 1.6850 × 0.08806 × 1 = 0.1484 g" },
      { label: "Percent purity", working: "% purity = (16.85 × 0.1 × 0.08806 × 1 × 100) ÷ 0.1500 = 98.92 %" },
    ],
    answer: "% purity = 98.92 % — inside the 98–102 % band this calculator grades against.",
    interpretation:
      "The 0.1500 g taken contained 0.1484 g of material that reacted with iodine as ascorbic acid. That is what an assay measures: titratable analyte, not identity. Any impurity that also reduces iodine is counted as ascorbic acid, so a 'compliant' figure does not show the sample is free of impurities — that needs the monograph's identification and related-substance tests. The 98–102 % band is this page's teaching range; the individual monograph's limits decide compliance.",
  },
  mistakes: [
    "Forgetting n in the equivalent factor. For ascorbic acid with iodine n = 2, so E = 0.08806 g/mEq; using M ÷ 1000 = 0.17612 doubles the answer (197.84 % here).",
    "Mixing mass units: W in mg with E in g/mEq (or the reverse) makes the result 1000 times too small or too large. Keep both in g, or both in mg.",
    "Confusing molarity with normality. 0.05 M I₂ is 0.1 N, because each I₂ takes 2 electrons; entering 0.05 as N halves the result.",
    "Using the raw burette reading. Subtract the blank first, and for a back-titration enter the volume of titrant that actually reacted with the sample.",
    "Leaving D at 1 after titrating an aliquot. If the sample was made up to 100 mL and 20 mL was titrated, D = 5.",
    "Using the nominal normality of the titrant instead of its standardised value (e.g. 0.1 N on the label, 0.0987 N by standardisation).",
  ],
  limitations: [
    "Assumes one known, stoichiometric reaction between titrant and analyte; side reactions or interfering substances change the result.",
    "Assumes a sharp, correctly detected end point. Indicator error and over-titration add directly to V.",
    "The result is reported on the weight taken, as is; drying-loss or anhydrous-basis corrections required by a monograph are not applied.",
    "The compliance bands (98–102 %, 95–98 %) are general teaching ranges, not the limits of any particular monograph.",
  ],
  refs: ["beckettStenlake1", "harris10"],
  related: [
    {
      slug: "law-absorbance-calculator",
      name: "Beer-Lambert Law Calculator",
      why: "The spectrophotometric route to an assay, when the analyte is measured by absorbance instead of titration.",
    },
    {
      slug: "accuracy-recovery-calculator",
      name: "Accuracy & % Recovery Calculator",
      why: "Check the assay method itself: recover a known amount and report mean recovery and %RSD.",
    },
  ],
};
