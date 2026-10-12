import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Serial Dilution Calculator. Worked example traced
 * through `computeChain` in _dilution.ts (keep-full off) and the chain report in
 * _report.ts (volumes to 3 significant figures, concentrations with formatSig 4),
 * and recomputed in Python: 2.00 mL per transfer, 10.0 mL diluent, 1:32 overall,
 * 31.25 µg/mL in T5.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "doubling dilutions of an antibiotic for an MIC practical",
    scenario:
      "For a broth-dilution practical you have an ampicillin stock of 1000 µg/mL and need five doubling (1:2) dilutions, each tube made up to 4 mL. What goes into each tube, and what concentration does the last tube hold? (Illustrative values.)",
    given: [
      { label: "Mode", value: "Serial dilution" },
      { label: "Stock concentration, C₁", value: "1000 µg/mL" },
      { label: "Number of steps", value: "5" },
      { label: "Dilution factor per step", value: "2 (1:2)" },
      { label: "Final volume in each tube", value: "4 mL" },
      { label: "Keep full volume", value: "Off" },
    ],
    steps: [
      { label: "Volume taken per tube", working: "Volume taken = final volume ÷ X = 4 mL ÷ 2 = 2.00 mL" },
      { label: "Diluent per tube", working: "Diluent = 4 mL − 2.00 mL = 2.00 mL" },
      { label: "Concentration tube by tube", working: "T1 = 1000 × 1/2 = 500 µg/mL\nT2 = 250, T3 = 125, T4 = 62.5 µg/mL\nT5 = 62.5 × 1/2 = 31.25 µg/mL" },
      { label: "Overall factor and final concentration", working: "Overall factor = 2⁵ = 32\nC_final = 1000 ÷ 32 = 31.25 µg/mL" },
      { label: "Materials", working: "Stock required = T1 volume taken = 2.00 mL\nTotal diluent = 5 × 2.00 mL = 10.0 mL" },
    ],
    answer: "Put 2.00 mL of diluent in each of five tubes, transfer 2.00 mL along the series, and T5 holds 31.25 µg/mL (overall 1:32).",
    interpretation:
      "The calculator's summary reads: stock required 2.00 mL, total diluent 10.0 mL, overall dilution factor 1:32, final concentration 31.25 µg/mL. Because each tube gives 2.00 mL to the next, T1–T4 are left with 2.00 mL and T5 with 4.00 mL; switch on \"keep full volume\" if every tube must end at 4 mL.",
  },
  mistakes: [
    "Reading 1:10 as 1 part plus 10 parts. Here 1:X means 1 part in X parts in total (1 mL + 9 mL for 1:10); some older texts write that as 1:9, so check your manual's convention before pipetting.",
    "Adding the step factors instead of multiplying them: five 1:10 steps give 1:100,000, not 1:50.",
    "Using the same tip down the series, or transferring before the tube is mixed. Carry-over and unmixed layers make every later tube wrong, because each tube is made from the one before.",
    "Forgetting that each tube gives up a transfer. Without keep-full, every tube except the last ends with less than the stated final volume.",
    "Mixing mass and molar units: µg/mL and mM cannot be compared without the molecular weight, so the target must be entered in the same family as the stock.",
  ],
  limitations: [
    "Pipetting errors compound along the series: if each transfer is 1% off, the last of six tubes can be about 6% off. Prefer fewer, larger steps when only the final concentration matters.",
    "The calculation assumes the diluent contains none of the drug and that the transferred volume and diluent add to the stated final volume.",
    "It describes concentration only. Adsorption to plastic, degradation and solubility limits at the top of the series are not modelled.",
  ],
  refs: ["ansel16", "martin8"],
  related: [
    { slug: "dilution-calculator", name: "Dilution Calculator (C₁V₁ = C₂V₂)", why: "A single-step dilution when the stock volume is easy to measure." },
    { slug: "calibration-curve-calculator", name: "Calibration Curve Calculator", why: "Fit the standards from a dilution series and read off an unknown." },
    { slug: "cfu-calculator", name: "Colony Counter & CFU Calculator", why: "Turn a colony count on a plate from a dilution series back into CFU/mL." },
  ],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
