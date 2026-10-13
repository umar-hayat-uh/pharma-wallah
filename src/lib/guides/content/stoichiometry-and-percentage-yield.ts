import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples and practice answers was
 * recomputed in Python. Molar masses are built from the abridged standard
 * atomic weights H 1.008, C 12.011, N 14.007, O 15.999, Na 22.990,
 * Mg 24.305, Cl 35.45; intermediate moles are carried unrounded and shown to
 * four significant figures. The reactions are standard teaching preparations;
 * the masses and yields are illustrative.
 *
 * Deliberately NOT linked: molecular-weight-finder ("Moles in 10 mg" prints
 * mmol labelled as mol, and the parser rejects Ca(OH)2-style formulas).
 */
export const guide: Guide = {
  slug: "stoichiometry-and-percentage-yield",
  title: "Stoichiometry, Limiting Reactant, Theoretical and Percentage Yield",
  description:
    "Work out molar masses, moles, the limiting reactant, theoretical yield and percentage yield for a preparation, step by step with worked examples.",
  category: "Pharmaceutical Chemistry",
  objectives: [
    "Calculate the molar mass of a compound from its formula and convert between mass and amount (moles).",
    "Use the mole ratio from a balanced equation to relate reactants and products.",
    "Identify the limiting reactant by comparing moles ÷ stoichiometric coefficient, and calculate how much of the excess reactant is left.",
    "Calculate the theoretical yield and the percentage yield of a preparation, including reactions that are not 1 : 1.",
    "Correct the theoretical yield for reagent purity and calculate the overall yield of a multi-step synthesis.",
  ],
  intro: [
    "In the pharmaceutical chemistry laboratory, almost every preparation ends with the same question: how much product did you get, compared with how much you could have got? Answering it needs a short chain of reasoning — molar masses, moles, the balanced equation, the limiting reactant, the theoretical yield and finally the percentage yield. Each link is simple; most wrong answers come from skipping one.",
    "This guide works through that chain using standard teaching preparations, such as aspirin from salicylic acid and paracetamol from 4-aminophenol, plus an inorganic precipitation where the mole ratio is not 1 : 1. Each step has a worked example, and the practice questions at the end have full working so you can check your lab-record calculations.",
    "The masses and yields here are illustrative. Your practical manual's quantities, and the purity and form (anhydrous or hydrate) of the reagents you actually weigh, decide the numbers in your own record.",
  ],
  terms: [
    {
      term: "Mole (mol)",
      definition:
        "The SI unit of amount of substance. One mole contains exactly 6.022 140 76 × 10²³ specified entities (atoms, molecules or ions).",
    },
    {
      term: "Molar mass (M)",
      definition:
        "The mass of one mole of a substance, in g/mol. Numerically equal to the relative molecular mass (molecular weight) calculated from standard atomic weights.",
    },
    {
      term: "Stoichiometric coefficient",
      definition:
        "The number in front of each species in a balanced equation. Coefficients give mole ratios, not mass ratios.",
    },
    {
      term: "Limiting reactant (limiting reagent)",
      definition: "The reactant that would be used up first if the reaction went to completion. It sets the maximum amount of product.",
    },
    {
      term: "Excess reactant",
      definition:
        "Any reactant present in more than the amount needed to react with the limiting reactant. Some of it remains when the reaction is complete.",
    },
    {
      term: "Theoretical yield",
      definition:
        "The mass of product that would be obtained if the limiting reactant were converted completely, with no side reactions and no losses.",
    },
    {
      term: "Actual yield",
      definition: "The mass of dry, purified product actually obtained and weighed.",
    },
    {
      term: "Percentage yield",
      definition: "Actual yield ÷ theoretical yield × 100%. It measures how efficiently the preparation turned reactant into isolated product.",
    },
  ],
  sections: [
    {
      id: "molar-mass",
      heading: "Molar mass and moles",
      blocks: [
        {
          kind: "p",
          text: "Chemical equations count particles, but balances weigh grams. Molar mass is the bridge. Add up the standard atomic weights of every atom in the formula to get the molar mass in g/mol; then divide a mass by the molar mass to get moles, or multiply moles by molar mass to get a mass.",
        },
        {
          kind: "formula",
          expr: "M = Σ (number of atoms × atomic weight);   n = m ÷ M;   m = n × M",
          where: [
            { sym: "M", meaning: "molar mass, in g/mol" },
            { sym: "n", meaning: "amount of substance, in mol" },
            { sym: "m", meaning: "mass, in g" },
          ],
          note: "If a mass is in mg, n = m ÷ M gives mmol. Keep the units written beside every number.",
        },
        {
          kind: "example",
          title: "Example 1: molar mass of aspirin",
          problem:
            "Calculate the molar mass of aspirin, C₉H₈O₄, using atomic weights C 12.011, H 1.008 and O 15.999.",
          steps: [
            "Carbon: 9 × 12.011 = 108.099.",
            "Hydrogen: 8 × 1.008 = 8.064.",
            "Oxygen: 4 × 15.999 = 63.996.",
            "M = 108.099 + 8.064 + 63.996 = 180.159 g/mol.",
          ],
          answer: "180.16 g/mol.",
          note: "With the same atomic weights, salicylic acid (C₇H₆O₃) is 138.12 g/mol and acetic anhydride (C₄H₆O₃) is 102.09 g/mol.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Use the formula you actually weigh",
          text: "A hydrate carries its water into the molar mass. If the reagent bottle says it is a hydrate, the molar mass must include the water of crystallisation, otherwise every mole calculation from that mass is too high.",
        },
      ],
    },
    {
      id: "limiting-reactant",
      heading: "Mole ratios and the limiting reactant",
      blocks: [
        {
          kind: "p",
          text: "A balanced equation says how many moles of each substance react together. To find which reactant runs out first, divide each reactant's moles by its coefficient in the equation. The reactant with the smallest value is limiting; that value (the extent of reaction) tells you how many 'equation-sized portions' can actually happen.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Write and balance the equation.",
            "Convert each reactant's mass (or volume × density) to moles.",
            "Divide each reactant's moles by its coefficient. The smallest result is the extent, ξ, and that reactant is limiting.",
            "Moles of product = ξ × the product's coefficient.",
            "Theoretical yield = moles of product × molar mass of product.",
            "Excess left = moles of excess reactant − ξ × its coefficient.",
          ],
        },
        {
          kind: "formula",
          expr: "ξ = smallest of (n_reactant ÷ coefficient);   n_product = ξ × coefficient_product;   Theoretical yield (g) = n_product × M_product",
          where: [
            { sym: "ξ", meaning: "extent of reaction, in mol" },
            { sym: "n_reactant", meaning: "moles of each reactant present" },
            { sym: "M_product", meaning: "molar mass of the product, in g/mol" },
          ],
        },
        {
          kind: "example",
          title: "Example 2: aspirin from salicylic acid (1 : 1)",
          problem:
            "C₇H₆O₃ + C₄H₆O₃ → C₉H₈O₄ + CH₃COOH. A student reacts 2.50 g of salicylic acid (138.12 g/mol) with 4.0 mL of acetic anhydride (density 1.08 g/mL, 102.09 g/mol). Find the limiting reactant, the theoretical yield of aspirin (180.16 g/mol) and the acetic anhydride left over.",
          steps: [
            "Salicylic acid: 2.50 g ÷ 138.12 g/mol = 0.01810 mol.",
            "Acetic anhydride: 4.0 mL × 1.08 g/mL = 4.32 g; 4.32 g ÷ 102.09 g/mol = 0.04232 mol.",
            "Both coefficients are 1, so compare moles directly: 0.01810 < 0.04232, so salicylic acid is limiting (ξ = 0.01810 mol).",
            "Aspirin = 0.01810 mol × 180.16 g/mol = 3.261 g.",
            "Acetic anhydride left = 0.04232 − 0.01810 = 0.02422 mol = 0.02422 × 102.09 = 2.472 g.",
          ],
          answer: "Salicylic acid is limiting; theoretical yield 3.261 g of aspirin; about 2.47 g of acetic anhydride remains.",
          note: "The anhydride is used in excess on purpose, to drive the reaction and because some is lost to moisture. Excess reagent never raises the theoretical yield.",
        },
        {
          kind: "example",
          title: "Example 3: a reaction that is not 1 : 1",
          problem:
            "MgCl₂ + 2 NaOH → Mg(OH)₂ + 2 NaCl. 5.00 g of MgCl₂ (95.21 g/mol) is mixed with 3.20 g of NaOH (40.00 g/mol). Find the limiting reactant, the theoretical yield of Mg(OH)₂ (58.32 g/mol) and the MgCl₂ left over.",
          steps: [
            "MgCl₂: 5.00 ÷ 95.21 = 0.05252 mol; ÷ coefficient 1 = 0.05252.",
            "NaOH: 3.20 ÷ 40.00 = 0.08000 mol; ÷ coefficient 2 = 0.04000.",
            "0.04000 < 0.05252, so NaOH is limiting, even though there are more moles of it. ξ = 0.04000 mol.",
            "Mg(OH)₂ = ξ × 1 = 0.04000 mol; mass = 0.04000 × 58.32 = 2.333 g.",
            "MgCl₂ left = 0.05252 − 0.04000 = 0.01252 mol = 0.01252 × 95.21 = 1.192 g.",
          ],
          answer: "NaOH is limiting; theoretical yield 2.333 g of Mg(OH)₂; about 1.19 g of MgCl₂ remains.",
          note: "Comparing raw moles (0.0800 against 0.0525) would wrongly make MgCl₂ the limiting reactant. Always divide by the coefficient first.",
        },
      ],
    },
    {
      id: "percentage-yield",
      heading: "Percentage yield",
      blocks: [
        {
          kind: "formula",
          expr: "Percentage yield = actual yield ÷ theoretical yield × 100%",
          where: [
            { sym: "actual yield", meaning: "mass of dry, purified product weighed, in g" },
            { sym: "theoretical yield", meaning: "maximum mass of the same product, in g" },
          ],
          note: "Both masses must be of the same substance and in the same unit. Divide product by product — never product by starting material.",
        },
        {
          kind: "example",
          title: "Example 4: percentage yield of aspirin",
          problem:
            "In Example 2 the theoretical yield was 3.261 g. After recrystallisation and drying to constant weight, the student weighs 2.61 g of aspirin. What is the percentage yield?",
          steps: [
            "Percentage yield = 2.61 g ÷ 3.261 g × 100.",
            "= 0.8004 × 100 = 80.0%.",
          ],
          answer: "80.0%.",
          note: "Losses come from incomplete reaction, product left in the filtrate after recrystallisation, and transfers. A yield above 100% almost always means a wet or impure product, or a wrong theoretical yield.",
        },
        {
          kind: "table",
          caption: "Common reasons a percentage yield is lower — or higher — than expected",
          head: ["Observation", "Likely cause", "What to check"],
          rows: [
            ["Yield well below expected", "Incomplete reaction, product lost in mother liquor, transfer losses", "Reaction time and temperature; volume of recrystallisation solvent; rinsing technique"],
            ["Yield above 100%", "Product still wet or holding solvent; impurities; unreacted reagent", "Dry to constant weight; melting point; TLC"],
            ["Yield above 100% and product looks dry", "Theoretical yield wrong", "Limiting reactant, mole ratio, molar mass (hydrate vs anhydrous)"],
            ["High yield but poor melting point", "Impure product", "Recrystallise again; percentage yield says nothing about purity"],
          ],
        },
      ],
    },
    {
      id: "purity-multistep",
      heading: "Reagent purity and multi-step syntheses",
      blocks: [
        {
          kind: "p",
          text: "If a starting material is not pure, only the pure fraction can react, so the theoretical yield must be based on the mass of pure compound. And in a synthesis of several steps, each step loses some material: the overall yield is the product of the step yields (as decimals), which falls quickly as steps are added.",
        },
        {
          kind: "formula",
          expr: "Mass of pure reactant = mass weighed × purity (as a decimal);   Overall yield = Y₁ × Y₂ × Y₃ × … × 100%",
          where: [
            { sym: "purity", meaning: "the assay of the reagent, e.g. 95% = 0.95" },
            { sym: "Y₁, Y₂, …", meaning: "the yield of each step, as a decimal" },
          ],
        },
        {
          kind: "example",
          title: "Example 5: overall yield of a three-step synthesis",
          problem: "An illustrative synthesis has three steps with yields of 80%, 65% and 90%. What is the overall yield?",
          steps: [
            "Convert to decimals: 0.80, 0.65, 0.90.",
            "Multiply: 0.80 × 0.65 = 0.52; 0.52 × 0.90 = 0.468.",
            "Overall yield = 0.468 × 100 = 46.8%.",
          ],
          answer: "46.8%.",
          note: "The overall yield is never the average of the step yields (here 78.3%). Even three good steps can lose more than half the material.",
        },
      ],
    },
  ],
  mistakes: [
    "Basing the theoretical yield on the reactant in excess. Only the limiting reactant sets the maximum.",
    "Comparing raw moles to find the limiting reactant when the coefficients are not equal. Divide each by its coefficient first (Example 3).",
    "Treating the coefficients as mass ratios. '2 NaOH' means two moles, not two grams.",
    "Dividing the mass of product by the mass of starting material and calling it a yield. Theoretical and actual yields must both be masses of the product.",
    "Using the anhydrous molar mass for a hydrate (or the reverse), which shifts every mole calculation.",
    "Forgetting the density when a liquid reagent is measured by volume: mass = volume × density.",
    "Weighing the product before it is dry, which gives an inflated actual yield — the usual reason for a yield above 100%.",
    "Rounding moles too early. Carry at least four significant figures through the calculation and round only the final answer.",
  ],
  practice: [
    {
      q: "How many moles are in 5.00 g of NaCl (58.44 g/mol)? What is the mass of 0.250 mol of water (18.015 g/mol)?",
      answer: "0.08556 mol NaCl; 4.504 g of water.",
      working: [
        "n = m ÷ M = 5.00 g ÷ 58.44 g/mol = 0.08556 mol.",
        "m = n × M = 0.250 mol × 18.015 g/mol = 4.504 g.",
      ],
    },
    {
      q: "Calculate the molar mass of paracetamol, C₈H₉NO₂ (C 12.011, H 1.008, N 14.007, O 15.999).",
      answer: "151.17 g/mol (151.165).",
      working: [
        "C: 8 × 12.011 = 96.088. H: 9 × 1.008 = 9.072.",
        "N: 1 × 14.007 = 14.007. O: 2 × 15.999 = 31.998.",
        "Sum = 96.088 + 9.072 + 14.007 + 31.998 = 151.165 g/mol.",
      ],
    },
    {
      q: "Paracetamol is made from 4-aminophenol (C₆H₇NO, 109.13 g/mol) and excess acetic anhydride, 1 : 1. What is the theoretical yield from 3.00 g of 4-aminophenol?",
      answer: "4.156 g of paracetamol.",
      working: [
        "n(4-aminophenol) = 3.00 g ÷ 109.13 g/mol = 0.02749 mol.",
        "1 : 1, so n(paracetamol) = 0.02749 mol.",
        "Mass = 0.02749 mol × 151.17 g/mol = 4.156 g.",
      ],
    },
    {
      q: "In the preparation in question 3, the student obtains 3.35 g of dry paracetamol. What is the percentage yield?",
      answer: "80.6%.",
      working: ["Percentage yield = 3.35 g ÷ 4.156 g × 100 = 80.6%."],
    },
    {
      q: "1.50 g of 4-aminophenol (109.13 g/mol) is reacted with 1.80 g of acetic anhydride (102.09 g/mol), 1 : 1. Which is limiting, and what is the theoretical yield of paracetamol (151.17 g/mol)?",
      answer: "4-Aminophenol is limiting; theoretical yield 2.078 g.",
      working: [
        "4-Aminophenol: 1.50 ÷ 109.13 = 0.01375 mol.",
        "Acetic anhydride: 1.80 ÷ 102.09 = 0.01763 mol.",
        "Coefficients are both 1; 0.01375 < 0.01763, so 4-aminophenol is limiting.",
        "Theoretical yield = 0.01375 × 151.17 = 2.078 g.",
      ],
    },
    {
      q: "Using MgCl₂ + 2 NaOH → Mg(OH)₂ + 2 NaCl with MgCl₂ in excess, what mass of Mg(OH)₂ (58.32 g/mol) can 2.00 g of NaOH (40.00 g/mol) give?",
      answer: "1.458 g of Mg(OH)₂.",
      working: [
        "n(NaOH) = 2.00 ÷ 40.00 = 0.05000 mol.",
        "Mole ratio Mg(OH)₂ : NaOH = 1 : 2, so n(Mg(OH)₂) = 0.05000 ÷ 2 = 0.02500 mol.",
        "Mass = 0.02500 × 58.32 = 1.458 g.",
      ],
    },
    {
      q: "A student uses 2.00 g of salicylic acid (138.12 g/mol) that is 95.0% pure, with excess acetic anhydride. What is the theoretical yield of aspirin (180.16 g/mol)? What would it be if the purity were ignored?",
      answer: "2.478 g (2.609 g if purity is ignored).",
      working: [
        "Pure salicylic acid = 2.00 g × 0.950 = 1.90 g.",
        "n = 1.90 ÷ 138.12 = 0.01376 mol, so aspirin = 0.01376 × 180.16 = 2.478 g.",
        "Ignoring purity: 2.00 ÷ 138.12 × 180.16 = 2.609 g — an overestimate that would make the percentage yield look too low.",
      ],
    },
    {
      q: "A two-step synthesis has illustrative step yields of 72% and 85%. What is the overall yield? If complete conversion would give 25.0 g of final product, how much do you expect to isolate?",
      answer: "61.2%; 15.3 g.",
      working: [
        "Overall yield = 0.72 × 0.85 × 100 = 61.2%.",
        "Expected mass = 25.0 g × 0.612 = 15.3 g.",
      ],
    },
  ],
  limitations: [
    "Theoretical yield assumes the reaction goes to completion with no side reactions. Equilibrium reactions and competing pathways set a lower real maximum.",
    "Percentage yield measures quantity, not quality. A product's identity and purity must be checked separately (melting point, TLC, or an assay).",
    "Molar masses depend on the atomic weights used. Small differences between tables change the last decimal place, so state the values you used in a lab record.",
    "The masses and yields here are illustrative. Follow your practical manual's quantities, safety instructions and reporting format.",
  ],
  refs: ["vogel5", "bipmSI", "iupacGoldBook"],
  relatedTools: [
    {
      slug: "theoretical-yield-calculator",
      name: "Theoretical Yield Calculator",
      why: "Its Reaction stoichiometry mode does exactly the steps in this guide: moles ÷ coefficient for each reactant, the smallest as the extent ξ, product moles = ξ × coefficient, and the excess left over, with a printable working.",
    },
    {
      slug: "percentage-yield-calculator",
      name: "Percentage Yield Calculator",
      why: "Calculates actual ÷ theoretical × 100 with mg, g and kg converted to grams first, and flags a yield over 100% with the same causes listed in this guide.",
    },
  ],
  relatedGuides: ["dilution-and-concentration", "ph-pka-and-henderson-hasselbalch", "accuracy-precision-recovery"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
