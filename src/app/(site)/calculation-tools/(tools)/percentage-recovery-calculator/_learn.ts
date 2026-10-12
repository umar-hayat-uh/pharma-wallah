import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Percentage Recovery Calculator. The worked example
 * uses the "Concentration × volume" mode and was recomputed independently
 * (Python): 0.25 mg/mL × 50 mL = 12.5 mg; 0.462 mg/mL × 25 mL = 11.55 mg;
 * 11.55 / 12.5 × 100 = 92.40 %. The page prints the same figures.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "recovery after a liquid–liquid extraction",
    scenario:
      "Illustrative values. A student shakes 50 mL of an aqueous drug solution (250 µg/mL) with an organic solvent, evaporates the organic layer and redissolves the residue in 25 mL of solvent. The redissolved extract assays at 0.462 mg/mL. How much of the drug was recovered? Enter it in Concentration × volume mode.",
    given: [
      { label: "Initial concentration (C₁)", value: "250 µg/mL" },
      { label: "Initial volume (V₁)", value: "50 mL" },
      { label: "Recovered concentration (C₂)", value: "0.462 mg/mL" },
      { label: "Final volume (V₂)", value: "25 mL" },
    ],
    steps: [
      {
        label: "Put both concentrations in the same unit",
        working: "C₁ = 250 µg/mL × 0.001 = 0.25 mg/mL\n(C₂ is already in mg/mL)",
      },
      {
        label: "Initial amount = C₁ × V₁",
        working: "0.25 mg/mL × 50 mL = 12.5 mg",
      },
      {
        label: "Amount recovered = C₂ × V₂",
        working: "0.462 mg/mL × 25 mL = 11.55 mg",
      },
      {
        label: "% Recovery = (recovered / initial) × 100",
        working: "(11.55 mg / 12.5 mg) × 100 = 0.924 × 100 = 92.40 %",
      },
      {
        label: "% Loss = 100 − % recovery",
        working: "100 − 92.40 = 7.60 %",
      },
    ],
    answer: "% Recovery = 92.40 % (7.60 % of the drug was not recovered)",
    interpretation:
      "Notice that the concentration went up (0.25 → 0.462 mg/mL) while the recovery is below 100 %: the extract was made up to half the original volume. Recovery compares amounts, never concentrations. Whether 92.40 % is acceptable depends on the procedure — the criteria come from your practical manual or validated method, not from this number alone.",
  },
  mistakes: [
    "Dividing the two concentrations instead of the two amounts. If the final volume differs from the initial volume, C₂ / C₁ is not the recovery — multiply each concentration by its own volume first.",
    "Using the concentration read in the cuvette without correcting for the dilution made before measuring it. C₂ must be the concentration of the whole recovered solution.",
    "Mixing units silently — for example taking 250 µg/mL and 0.462 mg/mL as if they were the same unit, which makes the recovery 1000 times wrong.",
    "Weighing a crystallised or extracted product before it is dry. Residual solvent or water adds mass and can push the result above 100 %.",
    "Confusing recovery with yield. Recovery compares the same substance before and after a step; percentage yield compares a reaction product with its theoretical amount from the limiting reactant.",
  ],
  limitations: [
    "Concentration × volume assumes each concentration applies uniformly to the whole volume entered with it (a well-mixed solution).",
    "A mass and a volume cannot be compared without the material's density, and IU cannot be turned into a mass without substance-specific data, so the calculator refuses those pairings rather than guessing.",
    "Recovery shows how much was lost or found, not why. It cannot tell transfer losses from degradation or incomplete extraction.",
    "Acceptance limits are not built in: they depend on the procedure and are set by the method protocol, SOP or pharmacopoeial monograph.",
  ],
  refs: ["ichQ2R2", "uspValidation", "ansel16"],
  related: [
    {
      slug: "accuracy-recovery-calculator",
      name: "Accuracy & % Recovery Calculator",
      why: "For spike-recovery studies with replicate trials: mean recovery, SD and %RSD.",
    },
    {
      slug: "percentage-yield-calculator",
      name: "Percentage Yield Calculator",
      why: "When the product is formed by a reaction rather than recovered unchanged.",
    },
    {
      slug: "dilution-calculator",
      name: "Dilution Calculator (C₁V₁ = C₂V₂)",
      why: "To work out the dilution between your recovered solution and the cuvette.",
    },
  ],
  guide: { slug: "accuracy-precision-recovery", title: "Accuracy, Precision and Percentage Recovery in Pharmaceutical Analysis" },
};
