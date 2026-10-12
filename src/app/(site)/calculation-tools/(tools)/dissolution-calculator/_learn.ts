import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Dissolution Calculator. The worked example uses 2
 * readings per time point and the page's practical-sheet correction; it was
 * recomputed independently in Python: 36.1038 % at 10 min, 56.6121 % at 20 min,
 * 68.0337 % at 30 min and 74.4433 % at 45 min. The page prints the same.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "four time points, two readings each",
    scenario:
      "Illustrative values. A 250 mg tablet is tested in 900 mL of medium. At 10, 20, 30 and 45 min a 5 mL sample is withdrawn, diluted 1 in 10 and read twice. The calibration line in the same medium is Y = 0.0021 + 0.0312X (X in µg/mL). Set 'Absorbance readings per time point' to 2 and use four time points.",
    given: [
      { label: "Label claim", value: "250 mg" },
      { label: "Medium volume V / sample Vs", value: "900 mL / 5 mL" },
      { label: "Dilution factor", value: "10" },
      { label: "Calibration a, b (µg/mL)", value: "0.0021, 0.0312" },
      { label: "10 min (B1, B2)", value: "0.312, 0.318" },
      { label: "20 min (B1, B2)", value: "0.488, 0.494" },
      { label: "30 min (B1, B2)", value: "0.592, 0.586" },
      { label: "45 min (B1, B2)", value: "0.641, 0.647" },
    ],
    steps: [
      {
        label: "10 min — average, concentration, dilution",
        working: "Y = (0.312 + 0.318) / 2 = 0.315 AU\nX = (0.315 − 0.0021) / 0.0312 = 10.0288 µg/mL\nC = 10.0288 × 10 = 100.288 µg/mL   (first point: CF = 0)",
      },
      {
        label: "10 min — amount dissolved and % release",
        working: "Amount = 100.288 µg/mL × 0.001 × 900 mL = 90.2596 mg\n% release = 90.2596 / 250 × 100 = 36.10 %",
      },
      {
        label: "20 min — correct for the 5 mL already removed",
        working: "Y = 0.491 → X = 15.6699 → C = 156.699 µg/mL\nCF = (5 / 900) × 100.288 = 0.557158 µg/mL\nCorrected C = 156.699 + 0.557158 = 157.256 µg/mL",
      },
      {
        label: "20 min — amount and % release",
        working: "Amount = 157.256 × 0.001 × 900 = 141.53 mg\n% release = 141.53 / 250 × 100 = 56.61 %",
      },
      {
        label: "30 and 45 min — same steps",
        working: "30 min: C = 188.109, CF = 0.873644, corrected 188.983 µg/mL → 170.084 mg → 68.03 %\n45 min: C = 205.737, CF = 1.0499, corrected 206.787 µg/mL → 186.108 mg → 74.44 %",
      },
    ],
    answer: "% drug release: 36.10 % (10 min), 56.61 % (20 min), 68.03 % (30 min), 74.44 % (45 min)",
    interpretation:
      "The correction is small here (about 0.5 % of the concentration per sample, because 5 mL is 1/180 of the medium) but it grows with every withdrawal. Whether 74.44 % at 45 min meets the specification is decided by the Q value and stage criteria in the monograph or product specification, not by the profile alone.",
  },
  mistakes: [
    "Forgetting the dilution factor. The calibration gives the concentration in the cuvette; the vessel concentration is that value × DF.",
    "Leaving the concentration in µg/mL when multiplying by the medium volume in mL. µg/mL × mL gives µg — convert to mg/mL first, or the % release comes out 1000 times too high.",
    "Using a calibration line prepared in a different medium or at a different wavelength from the dissolution samples.",
    "Applying the withdrawal correction at the first time point. Nothing has been removed before the first sample, so CF = 0.",
    "Reporting % release from one vessel as if it were the batch result. Dissolution tests use several vessels, and the acceptance stages are defined per unit and on the mean.",
  ],
  limitations: [
    "This tool applies only the practical-sheet correction, CF = (Vs / V) × the previous corrected concentration. Some manuals instead add (Vs / V) × the sum of all earlier measured concentrations; the two give slightly different later values, so use the method your practical specifies (the Cumulative Drug Release Calculator offers other corrections).",
    "It assumes the medium volume V stays constant because each withdrawn sample is replaced with fresh medium.",
    "The calibration line is assumed to be linear over every absorbance read; a reading above the top standard is an extrapolation.",
    "It calculates a single release profile. Profile comparison (for example the f2 similarity factor) and S1–S3 acceptance testing are separate steps.",
  ],
  refs: ["uspDissolution", "fdaDissolution1997", "aulton6"],
  related: [
    {
      slug: "calibration-curve-calculator",
      name: "Calibration Curve Calculator",
      why: "Builds the Y = a + bX line this tool needs and sends it here.",
    },
    {
      slug: "cumulative-drug-release-calculator",
      name: "Cumulative Drug Release Calculator",
      why: "If your practical uses a different withdrawal-correction method.",
    },
    {
      slug: "dissolution-rate-constant-calculator",
      name: "Dissolution Rate Constant Calculator",
      why: "To go from a release profile to a dissolution rate constant.",
    },
  ],
};
