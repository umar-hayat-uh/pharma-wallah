import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Dilution Calculator. The worked example was traced
 * through `solve("V1", …)` in page.tsx (V₁ = C₂V₂ ÷ C₁, printed with toFixed(4))
 * and recomputed independently in Python: V₁ 0.6250, solvent 249.3750, factor 400.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "a dilute antiseptic rinse from a concentrate",
    scenario:
      "In a pharmaceutics practical you are asked to prepare 250 mL of a 0.05% w/v chlorhexidine gluconate rinse from a 20% w/v concentrate. How much concentrate do you measure, and how much water do you add? (Illustrative values for a bench exercise.)",
    given: [
      { label: "Stock concentration, C₁", value: "20 % w/v" },
      { label: "Target concentration, C₂", value: "0.05 % w/v" },
      { label: "Final volume, V₂", value: "250 mL" },
      { label: "Calculator mode", value: "Initial Volume (V₁)" },
    ],
    steps: [
      { label: "Write the equation", working: "C₁ × V₁ = C₂ × V₂  →  V₁ = C₂ × V₂ ÷ C₁" },
      { label: "Substitute (same % unit on both sides, volumes in mL)", working: "V₁ = (0.05 × 250) ÷ 20" },
      { label: "Amount of solute that must end up in the flask", working: "C₂ × V₂ = 0.05 × 250 = 12.5 (%·mL, i.e. 0.125 g of chlorhexidine gluconate)" },
      { label: "Volume of concentrate", working: "V₁ = 12.5 ÷ 20 = 0.6250 mL" },
      { label: "Diluent and dilution factor", working: "Water = V₂ − V₁ = 250 − 0.625 = 249.3750 mL\nDilution factor = C₁ ÷ C₂ = 20 ÷ 0.05 = 400 (a 1 in 400 dilution)" },
    ],
    answer: "Measure 0.625 mL of the 20% concentrate and make up to 250 mL with water (about 249.4 mL of water).",
    interpretation:
      "The calculator prints V₁ = 0.6250 and solvent to add = 249.3750. In practice you would not measure the water separately: pipette 0.625 mL into a 250 mL volumetric flask and make up to the mark. A volume as small as 0.625 mL needs a graduated pipette or micropipette, not a measuring cylinder — or make an intermediate 1 in 20 dilution first.",
  },
  mistakes: [
    "Mixing units between the two sides — entering C₁ in mg/mL and C₂ in % w/v, or V₁ in µL and V₂ in mL. The equation only balances when C₁ and C₂ share one unit and V₁ and V₂ share another.",
    "Treating V₂ as the volume of water to add. V₂ is the final total volume; the diluent is V₂ − V₁.",
    "Swapping C₁ and C₂. If the 'final' concentration comes out higher than the stock, the inputs are reversed — dilution can only lower a concentration.",
    "Reading a ratio strength as a percentage: 1:1000 is 0.1% w/v, not 1%. Convert ratio strengths to the same unit as the other concentration first.",
    "Using a measuring cylinder for a sub-millilitre V₁. The arithmetic is right but the measurement error can be larger than the volume itself.",
  ],
  limitations: [
    "C₁V₁ = C₂V₂ assumes the amount of solute is conserved and that the final volume is made up to the mark. Mixing liquids (for example ethanol and water) can change the total volume, so measure the final volume, not the sum of the parts.",
    "It applies to dilution with a solvent that contains none of the solute. Mixing two solutions of different strengths needs alligation or a mass balance instead.",
    "The result has no more precision than the volumes you can actually measure — round to what your pipette or flask can deliver.",
  ],
  refs: ["ansel16", "martin8"],
  related: [
    { slug: "serial-dilution-calculator", name: "Serial Dilution Calculator", why: "When one step would need a volume too small to pipette, split it into several smaller dilutions." },
    { slug: "percentage-solution-calculator", name: "Percentage Solution Calculator (w/v, w/w, v/v)", why: "Make the stock in the first place from a weighed solid." },
    { slug: "mg-ml-to-molarity-calculator", name: "mg/mL ↔ Molarity Calculator", why: "Put C₁ and C₂ into the same unit before diluting when one is molar and one is mass-based." },
  ],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
