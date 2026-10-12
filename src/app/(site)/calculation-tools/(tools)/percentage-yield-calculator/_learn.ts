import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the percentage yield calculator. The worked example is
 * the aspirin preparation (salicylic acid + excess acetic anhydride, 1 : 1).
 * The theoretical-yield step is shown because it is where most wrong answers
 * start; the page itself only divides the two masses. Every figure matches what
 * the page prints for 2.87 g against 3.913 g (ratio to 6 s.f., percentage to
 * 2 dp, loss to 4 s.f.) and was recomputed in Python. Molar masses: salicylic
 * acid 138.12 g/mol, aspirin 180.16 g/mol, acetic anhydride 102.09 g/mol.
 */
export const LEARN: CalcEducation = {
    workedExample: {
        title: "Percentage yield of aspirin from salicylic acid",
        scenario:
            "A student acetylates 3.00 g of salicylic acid with 5.0 mL of acetic anhydride (density 1.08 g/mL). After recrystallisation and drying to constant weight, 2.87 g of aspirin is weighed. Find the theoretical yield and the percentage yield.",
        given: [
            { label: "Salicylic acid (C₇H₆O₃)", value: "3.00 g, 138.12 g/mol" },
            { label: "Acetic anhydride", value: "5.0 mL × 1.08 g/mL, 102.09 g/mol" },
            { label: "Aspirin (C₉H₈O₄)", value: "180.16 g/mol" },
            { label: "Actual yield (dry)", value: "2.87 g" },
        ],
        steps: [
            { label: "Moles of each reactant", working: "Salicylic acid: 3.00 g ÷ 138.12 g/mol = 0.02172 mol\nAcetic anhydride: (5.0 × 1.08) g ÷ 102.09 g/mol = 0.05289 mol" },
            { label: "Limiting reactant (1 : 1 equation)", working: "0.02172 mol < 0.05289 mol, so salicylic acid is limiting" },
            { label: "Theoretical yield", working: "0.02172 mol × 180.16 g/mol = 3.913 g aspirin" },
            { label: "Percentage yield", working: "(Actual ÷ Theoretical) × 100 = (2.87 g ÷ 3.913 g) × 100 = 0.733453 × 100 = 73.35 %" },
            { label: "Product not recovered", working: "3.913 g − 2.87 g = 1.043 g (26.65 %)" },
        ],
        answer: "Theoretical yield = 3.913 g; percentage yield = 73.35 %.",
        interpretation:
            "About three-quarters of the aspirin the salicylic acid could form was isolated as dry solid; the rest was lost to incomplete reaction, to the mother liquor during recrystallisation and to transfers. A yield in this range is typical of a single-recrystallisation student preparation. The number says nothing about purity: a damp or contaminated product can give a higher yield, so record a melting point or a TLC alongside it.",
    },
    mistakes: [
        "Basing the theoretical yield on the reagent in excess. Here acetic anhydride would 'predict' 9.53 g of aspirin; only the limiting reactant's moles (with the equation's mole ratio) set the maximum.",
        "Comparing masses of different substances. Dividing 2.87 g of aspirin by 3.00 g of salicylic acid gives 95.7 %, which is not a yield; the theoretical yield must be a mass of the product.",
        "Weighing the product before it is dry. Retained water or solvent inflates the actual yield, and is the usual reason for a yield over 100 %.",
        "Ignoring the mole ratio when it is not 1 : 1. If two moles of reactant give one mole of product, halve the moles before multiplying by the product's molar mass.",
        "Using the anhydrous molar mass for a hydrate (or the reverse). The theoretical yield must use the molar mass of the form that is actually weighed.",
        "Mixing mg and g. 412 mg against 0.520 g is 79.23 %, not 792 %; this page converts both to grams first, but a hand calculation must too.",
    ],
    limitations: [
        "Assumes the theoretical yield is correct: a balanced equation, the right limiting reactant and the right molar mass of the isolated form.",
        "Assumes the actual yield is a mass of pure, dry product. Percentage yield measures quantity, not quality.",
        "The interpretation bands are general teaching guidance; what counts as a good yield depends on the reaction, the scale and the number of purification steps.",
    ],
    refs: ["vogel5", "iupacGoldBook"],
    related: [
        {
            slug: "theoretical-yield-calculator",
            name: "Theoretical Yield Calculator",
            why: "Find the limiting reactant and the maximum product mass from the balanced equation, then carry it over here.",
        },
        {
            slug: "percentage-recovery-calculator",
            name: "Percentage Recovery Calculator",
            why: "For recrystallisation or extraction of one substance, where you compare what you got back with what you started with.",
        },
    ],
};
