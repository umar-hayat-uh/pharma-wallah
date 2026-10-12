import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Percentage Solution Calculator. Worked example traced
 * through `calculate("wv", "solute", …)` in page.tsx: (pct ÷ 100) × solution,
 * rounded to the chosen decimals, then Number#toString. Recomputed in Python:
 * (3.8 ÷ 100) × 150 = 5.7. Built on matching units (g with mL) because the page
 * does not convert units.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "sodium citrate anticoagulant for a haematology practical",
    scenario:
      "Blood samples for an ESR practical are collected into 3.8% w/v trisodium citrate. You need 150 mL of the solution. How much trisodium citrate do you weigh? (Illustrative values.)",
    given: [
      { label: "Percentage type", value: "Weight/Volume (w/v)" },
      { label: "Solve for", value: "Solute Amount" },
      { label: "Percentage", value: "3.8 %" },
      { label: "Total solution volume", value: "150 mL (solute unit g)" },
    ],
    steps: [
      { label: "Meaning of the strength", working: "3.8% w/v = 3.8 g of solute in every 100 mL of finished solution" },
      { label: "Write the formula", working: "Solute (g) = (% ÷ 100) × solution volume (mL)" },
      { label: "Substitute", working: "Solute = (3.8 ÷ 100) × 150 = 0.038 × 150" },
      { label: "Result", working: "Solute = 5.7 g" },
    ],
    answer: "Weigh 5.7 g of trisodium citrate, dissolve it in less than 150 mL of water, then make up to 150 mL.",
    interpretation:
      "The calculator prints 5.7 g with the instruction to make up to a final volume of 150 mL. The percentage refers to the finished solution, so the water is whatever it takes to reach 150 mL — not 150 mL of water. Check which salt form your method means: the dihydrate and anhydrous salts differ in mass.",
  },
  mistakes: [
    "Calculating the percentage on the solvent instead of the whole solution: 3.8 g + 150 mL of water is not 3.8% w/v. Make up to the final volume (w/v, v/v) or final mass (w/w).",
    "Picking units that do not match the definition. This calculator does not convert, so for w/v enter grams with millilitres; 0.9% of a solution entered as 1 L gives 0.009 g instead of the correct 9 g — enter 1000 mL.",
    "Mixing up w/v and w/w for semi-solids and concentrated acids: a 10% w/w ointment means 10 g per 100 g of ointment, and the base must be weighed, not measured by volume.",
    "Assuming v/v volumes add up: 70 mL of ethanol plus 30 mL of water gives slightly less than 100 mL, so 70% v/v ethanol is made by making up 70 mL of ethanol to 100 mL.",
    "Confusing percentage with ratio strength: 1 in 1000 is 0.1%, and 1:1000 adrenaline is 1 mg/mL — not 1%.",
  ],
  limitations: [
    "The page uses the numbers exactly as entered and applies no unit conversion, so the answer is only correct when solute and solution units match the percentage type.",
    "For w/v and v/v solutions the 'Solvent Amount' result is solution − solute, which assumes volumes are additive and, for w/v, subtracts a mass from a volume. Use it only as a rough guide; in practice dissolve and make up to volume.",
    "A percentage says nothing about osmotic or molar strength. Two 1% w/v solutions of different drugs contain different numbers of molecules.",
  ],
  refs: ["ansel16", "martin8"],
  related: [
    { slug: "dilution-calculator", name: "Dilution Calculator (C₁V₁ = C₂V₂)", why: "Dilute a percentage stock to a weaker strength." },
    { slug: "molarity-calculator", name: "Molarity Calculator", why: "When the method asks for mol/L rather than a percentage." },
    { slug: "isotonicity-calculator", name: "Isotonicity Calculator", why: "Check whether a % w/v eye drop or injection is isotonic." },
  ],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
