import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Molarity Calculator. Worked example traced through
 * the "amount" branch for a solid in page.tsx (mass = M × MW × V(L), printed with
 * toFixed(4)) and recomputed in Python: 0.2 × 84.01 × 0.25 = 4.2005 g.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "weighing sodium bicarbonate for a 0.2 M solution",
    scenario:
      "A practical asks for 250 mL of 0.2 M sodium bicarbonate (NaHCO₃, MW 84.01 g/mol) to use as a mild base in an acid–base experiment. How much solid do you weigh? (Illustrative values.)",
    given: [
      { label: "Mode / substance", value: "Amount from target molarity · Solid" },
      { label: "Target molarity", value: "0.2 mol/L" },
      { label: "Molecular weight, MW", value: "84.01 g/mol" },
      { label: "Final volume", value: "250 mL" },
    ],
    steps: [
      { label: "Write the formula", working: "Mass (g) = M × MW × V(L)" },
      { label: "Convert the volume to litres", working: "V = 250 mL × 0.001 = 0.2500 L" },
      { label: "Moles needed", working: "n = M × V = 0.2 mol/L × 0.2500 L = 0.05 mol" },
      { label: "Convert moles to grams", working: "Mass = 0.05 mol × 84.01 g/mol = 4.2005 g" },
    ],
    answer: "Weigh 4.2005 g of NaHCO₃ (about 4.20 g on a two-decimal balance), dissolve and make up to 250 mL.",
    interpretation:
      "The calculator prints 4.2005 g and the instruction \"Dissolve and make up to 250 mL for 0.2 M\". Dissolve the solid in less than 250 mL of water and then make up to the mark in a volumetric flask; adding 4.2 g to 250 mL of water gives slightly more than 250 mL of solution and so slightly less than 0.2 M.",
  },
  mistakes: [
    "Using the molecular weight of a different form from the one you weigh — an anhydrous MW for a hydrate (CuSO₄·5H₂O is 249.68, anhydrous CuSO₄ is 159.61 g/mol), or the free base for a salt.",
    "Leaving the volume in mL in the formula. M × MW × 250 instead of × 0.250 gives an answer 1000 times too large; the calculator converts for you only if the unit selector matches what you typed.",
    "Adding the solute to the full final volume of solvent instead of making up to volume. Molarity is per litre of solution, not per litre of solvent.",
    "For a concentrated liquid reagent, ignoring specific gravity and purity: 37% HCl is not 'pure HCl', and 1 mL of it does not weigh 1 g.",
    "Confusing molarity (mol/L of solution) with molality (mol/kg of solvent) or with normality, which counts equivalents rather than moles.",
  ],
  limitations: [
    "Molarity changes slightly with temperature because the solution's volume does; volumetric glassware is calibrated at a stated temperature, usually 20 °C.",
    "The liquid-reagent formula uses the label's specific gravity and % w/w assay; a bottle that has absorbed water or lost gas (concentrated HCl, ammonia) is weaker than the label says, so standardise by titration when the exact concentration matters.",
    "The result is only as good as the purity of the solid. A 98% pure reagent weighed as if it were 100% gives a solution about 2% weaker.",
  ],
  refs: ["iupacGoldBook", "bipmSI", "martin8"],
  related: [
    { slug: "mg-ml-to-molarity-calculator", name: "mg/mL ↔ Molarity Calculator", why: "Convert a molar concentration to the mg/mL figure a drug label or assay uses." },
    { slug: "dilution-calculator", name: "Dilution Calculator (C₁V₁ = C₂V₂)", why: "Dilute the stock you have just made to a working concentration." },
    { slug: "percentage-solution-calculator", name: "Percentage Solution Calculator (w/v, w/w, v/v)", why: "When the method states strength as % w/v rather than mol/L." },
  ],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
