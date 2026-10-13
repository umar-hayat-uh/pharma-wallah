import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples and practice answers was
 * recomputed in Python before drafting. Ingredients are "Drug A", "Ingredient
 * X"… and every formula is illustrative: it teaches the arithmetic of scaling,
 * not a product to make. Not linked: percentage-solution-calculator (recorded
 * unit-conversion faults).
 */
export const guide: Guide = {
  slug: "compounding-and-formula-scaling",
  title: "Compounding Calculations: Scaling a Master Formula and Percentage Strength",
  description:
    "Scale a master formula up or down, handle q.s., parts and percentage ingredients correctly, and work percentage and ratio strength into grams and millilitres.",
  category: "Pharmaceutics",
  objectives: [
    "Calculate a scaling factor and use it to enlarge or reduce every ingredient of a master formula.",
    "Explain why percentage ingredients and q.s. ingredients are not multiplied by the scaling factor, and handle them correctly.",
    "Scale a formula written in parts to any final quantity.",
    "Convert percentage strength (w/v, w/w, v/v) and ratio strength into the amount to weigh or measure.",
    "Use the aliquot method when a required amount is below the minimum a balance can weigh accurately.",
    "Check a scaled formula by recalculating the total and the amount per dose unit.",
  ],
  intro: [
    "A master formula is the authorised recipe for a preparation: every ingredient and its quantity for a stated batch size, such as 1000 mL of an oral solution or 1000 capsules. In practice you rarely make exactly that batch. A prescription might need 150 mL, or the pharmacy might make 60 capsules. The job is to reduce or enlarge every ingredient in the same proportion, so the strength of the final preparation is unchanged.",
    "The core arithmetic is a single multiplication, but the traps are in the details: units that must be converted before the factor is calculated, ingredients written as percentages or 'q.s.' that must not be multiplied, formulas written in parts, and quantities so small a balance cannot weigh them. This guide works through each in turn, with percentage and ratio strength along the way.",
    "Every formula here is illustrative and uses names like Drug A and Ingredient X. Real preparations follow the authorised master formula, pharmacopoeial standards and the pharmacist's professional checks.",
  ],
  terms: [
    {
      term: "Master formula",
      definition:
        "The authorised list of ingredients, quantities and method for a stated batch size of a preparation.",
    },
    {
      term: "Scaling factor",
      definition:
        "Desired quantity ÷ master formula quantity, both in the same unit. Multiplying each ingredient by it keeps the proportions, and so the strength, unchanged.",
    },
    {
      term: "q.s. (quantum sufficit)",
      definition:
        "'As much as is sufficient': add enough of this ingredient (usually the vehicle) to make the preparation up to the final volume or weight. It has no fixed amount of its own.",
    },
    {
      term: "Parts",
      definition:
        "A way of writing a formula as proportions (for example 2 parts : 3 parts : 15 parts) rather than fixed amounts. The total number of parts corresponds to the whole batch.",
    },
    {
      term: "Percentage strength",
      definition:
        "Amount of ingredient per 100 units of preparation: w/v is grams per 100 mL, w/w is grams per 100 g, v/v is millilitres per 100 mL.",
    },
    {
      term: "Ratio strength",
      definition:
        "Strength written as 1 part in x parts, such as 1:5000 w/v (1 g in 5000 mL). Used for very dilute preparations.",
    },
    {
      term: "Minimum weighable quantity",
      definition:
        "The smallest amount a particular balance can weigh within the accuracy required. It depends on the balance and on the acceptable error.",
    },
    {
      term: "Aliquot method",
      definition:
        "Weighing a larger, accurately weighable amount, mixing it with a known amount of diluent, and taking a measured portion of the mixture that contains the small amount needed.",
    },
  ],
  sections: [
    {
      id: "scaling-factor",
      heading: "The scaling factor",
      blocks: [
        {
          kind: "formula",
          expr: "Scaling factor = desired quantity ÷ master formula quantity;   Required amount = master amount × scaling factor",
          where: [
            { sym: "desired quantity", meaning: "the batch size you want to make, in the same unit as the master batch" },
            { sym: "master formula quantity", meaning: "the batch size the master formula is written for" },
          ],
          note: "Convert first. A master formula for 1 L and a desired 150 mL must both be in mL (or both in L) before dividing.",
        },
        {
          kind: "p",
          text: "A factor below 1 reduces the formula; above 1 enlarges it. Keep the factor unrounded (or to several significant figures) and round only the final amounts, to the precision your balance or measure can deliver.",
        },
        {
          kind: "example",
          title: "Example 1: reducing an oral solution",
          problem:
            "An illustrative master formula for 1000 mL of an oral solution contains Drug A 5 g, sucrose 650 g, glycerin 100 mL, a preservative 1 g and purified water q.s. to 1000 mL. Scale it to 150 mL.",
          steps: [
            "Same unit: 1000 mL and 150 mL. Scaling factor = 150 ÷ 1000 = 0.15.",
            "Drug A: 5 g × 0.15 = 0.75 g.",
            "Sucrose: 650 g × 0.15 = 97.5 g.",
            "Glycerin: 100 mL × 0.15 = 15 mL.",
            "Preservative: 1 g × 0.15 = 0.15 g.",
            "Purified water: not multiplied — q.s. to 150 mL.",
          ],
          answer: "Drug A 0.75 g, sucrose 97.5 g, glycerin 15 mL, preservative 0.15 g, purified water q.s. to 150 mL.",
          note: "Check: Drug A was 5 g in 1000 mL (0.5% w/v); 0.75 g in 150 mL is still 0.5% w/v.",
        },
      ],
    },
    {
      id: "special-ingredients",
      heading: "Ingredients you must not multiply: q.s. and percentages",
      blocks: [
        {
          kind: "p",
          text: "Two kinds of entry in a master formula do not scale. A q.s. ingredient has no amount — it is whatever brings the batch to its final volume or weight, so in the scaled formula it is simply 'q.s. to' the new size. A percentage is a concentration, and a concentration does not change when the batch does: 2% w/v is 2% in 1000 mL and 2% in 40 mL. What changes is the mass that percentage represents, which you calculate from the new batch size.",
        },
        {
          kind: "table",
          caption: "How each type of formula entry is handled when scaling",
          head: ["Entry in master formula", "What to do", "Example (master 1000 mL → 150 mL)"],
          rows: [
            ["Fixed amount (g, mg, mL)", "Multiply by the scaling factor", "100 mL × 0.15 = 15 mL"],
            ["Percentage (% w/v, w/w, v/v)", "Keep the %, then calculate the amount for the new batch", "2% w/v → 2 g/100 mL × 150 mL = 3 g"],
            ["q.s.", "Do not multiply; make up to the new final quantity", "water q.s. to 150 mL"],
            ["Parts", "Divide the batch by the total parts, then multiply", "see the parts section"],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Using the Master Formula Calculator",
          text: "The calculator carries '%' and 'q.s.' ingredients over unchanged, which is correct, but it does not convert a percentage into grams for you. Work that out from the percentage and the new batch size, as in practice question 8.",
        },
      ],
    },
    {
      id: "parts",
      heading: "Formulas written in parts",
      blocks: [
        {
          kind: "formula",
          expr: "Amount of one part = final quantity ÷ total parts;   Amount of ingredient = its parts × amount of one part",
          note: "All parts must be in the same kind of unit (parts by weight for an ointment, for instance).",
        },
        {
          kind: "example",
          title: "Example 2: an ointment by parts",
          problem:
            "An illustrative ointment contains Ingredient X 2 parts, Ingredient Y 3 parts and ointment base 15 parts, by weight. Make 60 g.",
          steps: [
            "Total parts = 2 + 3 + 15 = 20.",
            "One part = 60 g ÷ 20 = 3 g.",
            "X = 2 × 3 = 6 g; Y = 3 × 3 = 9 g; base = 15 × 3 = 45 g.",
            "Check: 6 + 9 + 45 = 60 g.",
          ],
          answer: "Ingredient X 6 g, Ingredient Y 9 g, base 45 g.",
        },
      ],
    },
    {
      id: "percentage-strength",
      heading: "Percentage and ratio strength",
      blocks: [
        {
          kind: "formula",
          expr: "Amount = % strength × total quantity ÷ 100",
          where: [
            { sym: "w/v", meaning: "% × total volume (mL) ÷ 100 gives grams" },
            { sym: "w/w", meaning: "% × total weight (g) ÷ 100 gives grams" },
            { sym: "v/v", meaning: "% × total volume (mL) ÷ 100 gives millilitres" },
          ],
          note: "Unless a different convention is stated, solids in liquids are w/v, solids in solids are w/w, and liquids in liquids are v/v. 1% w/v = 1 g/100 mL = 10 mg/mL.",
        },
        {
          kind: "example",
          title: "Example 3: three kinds of percentage",
          problem:
            "How much is needed for (a) 250 mL of a 2% w/v solution, (b) 60 g of a 0.5% w/w cream, and (c) 500 mL of a 70% v/v solution?",
          steps: [
            "(a) 2 × 250 ÷ 100 = 5 g of solute.",
            "(b) 0.5 × 60 ÷ 100 = 0.3 g of ingredient.",
            "(c) 70 × 500 ÷ 100 = 350 mL of the liquid, made up to 500 mL.",
          ],
          answer: "(a) 5 g; (b) 0.3 g; (c) 350 mL.",
          note: "For v/v mixtures, make up to the final volume rather than adding 150 mL of diluent: liquids such as alcohol and water contract when mixed.",
        },
        {
          kind: "formula",
          expr: "Ratio 1 : x  =  (100 ÷ x)%;   Amount = total quantity ÷ x",
          where: [{ sym: "x", meaning: "the number of parts of preparation containing 1 part of ingredient" }],
        },
        {
          kind: "example",
          title: "Example 4: ratio strength",
          problem: "How much of Drug B is needed for 200 mL of a 1:5000 w/v solution? What is this as a percentage?",
          steps: [
            "1:5000 w/v means 1 g in 5000 mL.",
            "Amount = 200 mL ÷ 5000 = 0.04 g = 40 mg.",
            "As a percentage: 100 ÷ 5000 = 0.02% w/v.",
          ],
          answer: "40 mg; 0.02% w/v.",
        },
      ],
    },
    {
      id: "dose-units",
      heading: "Scaling formulas for tablets, capsules and suppositories",
      blocks: [
        {
          kind: "p",
          text: "When the batch is counted in units (1000 capsules), the scaling factor is units wanted ÷ units in the master formula. Afterwards, divide each scaled amount by the number of units to check the amount per unit is what the formula intends.",
        },
        {
          kind: "example",
          title: "Example 5: capsules",
          problem:
            "An illustrative master formula for 1000 capsules contains Drug C 25 g and lactose 175 g. Scale it to 60 capsules and check the content of each capsule.",
          steps: [
            "Scaling factor = 60 ÷ 1000 = 0.06.",
            "Drug C: 25 g × 0.06 = 1.5 g. Lactose: 175 g × 0.06 = 10.5 g.",
            "Per capsule: Drug C 1.5 g ÷ 60 = 0.025 g = 25 mg; total fill (1.5 + 10.5) g ÷ 60 = 0.200 g = 200 mg.",
          ],
          answer: "Drug C 1.5 g and lactose 10.5 g; 25 mg drug in a 200 mg fill per capsule.",
          note: "In practice a small excess is often prepared because some powder is lost on equipment. How much is set by the pharmacy's procedure; scale from the number you will actually make.",
        },
      ],
    },
    {
      id: "aliquot",
      heading: "When the amount is too small to weigh: the aliquot method",
      blocks: [
        {
          kind: "p",
          text: "Scaling down can produce an amount below the minimum weighable quantity of the balance. Weighing it directly would carry an unacceptable percentage error. Instead, weigh a larger amount that the balance can handle, dilute it with a known amount of an inert diluent, mix well, and weigh out the fraction of the mixture that contains what you need.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Choose a multiple of the required amount that is at or above the minimum weighable quantity.",
            "Weigh that amount of drug and dilute it to a total mass that is the same multiple of a weighable aliquot.",
            "Mix thoroughly so the drug is evenly distributed.",
            "Weigh the aliquot: it contains the required amount of drug.",
          ],
        },
        {
          kind: "example",
          title: "Example 6: weighing 40 mg on a balance that cannot weigh it accurately",
          problem:
            "A preparation needs 40 mg of Drug D. The balance's minimum weighable quantity is (illustratively) 120 mg. Use lactose as the diluent.",
          steps: [
            "Weigh 120 mg of Drug D (three times the amount needed).",
            "Add lactose to a total of 1200 mg and mix thoroughly. The mixture is 120 ÷ 1200 = 0.1 (1 in 10) Drug D.",
            "Weigh 40 mg ÷ 0.1 = 400 mg of the mixture.",
            "Check: 400 mg × 0.1 = 40 mg of Drug D, and every weighing (120, 1080 of lactose, 400) is above 120 mg.",
          ],
          answer: "Weigh 120 mg of drug, dilute to 1200 mg with lactose, and take 400 mg of the mixture.",
        },
      ],
    },
  ],
  mistakes: [
    "Calculating the scaling factor with mismatched units, such as 150 mL ÷ 1 L = 150. Convert to the same unit first: 150 ÷ 1000 = 0.15.",
    "Inverting the factor (master ÷ desired), which enlarges a formula that should shrink.",
    "Multiplying a q.s. ingredient. It has no amount; make up to the new final quantity.",
    "Multiplying a percentage by the scaling factor (turning 2% into 0.3%). The percentage stays; the grams change.",
    "Forgetting to add up all the parts, or dividing the batch by one ingredient's parts instead of the total.",
    "Adding the solvent in a v/v preparation instead of making up to volume.",
    "Rounding the scaling factor or intermediate amounts too early, then multiplying the rounding error through every ingredient.",
    "Weighing an amount below the balance's minimum weighable quantity instead of using an aliquot.",
  ],
  practice: [
    {
      q: "A master formula is written for 500 mL. What scaling factor is needed to make 75 mL?",
      answer: "0.15.",
      working: ["Both in mL: 75 ÷ 500 = 0.15."],
    },
    {
      q: "An illustrative master formula for 2 kg of an ointment contains 150 g of Ingredient P. How much is needed for 30 g?",
      answer: "2.25 g.",
      working: [
        "Convert: 2 kg = 2000 g.",
        "Scaling factor = 30 ÷ 2000 = 0.015.",
        "150 g × 0.015 = 2.25 g.",
      ],
    },
    {
      q: "A powder is made from Ingredient Q 1 part, Ingredient R 4 parts and diluent 15 parts. Make 100 g.",
      answer: "Q 5 g, R 20 g, diluent 75 g.",
      working: [
        "Total parts = 1 + 4 + 15 = 20; one part = 100 ÷ 20 = 5 g.",
        "Q = 1 × 5 = 5 g; R = 4 × 5 = 20 g; diluent = 15 × 5 = 75 g.",
      ],
    },
    {
      q: "How much Drug E is needed for 30 mL of a 0.1% w/v solution?",
      answer: "0.03 g (30 mg).",
      working: ["0.1 × 30 ÷ 100 = 0.03 g.", "0.03 g × 1000 = 30 mg."],
    },
    {
      q: "Express 1:2000 w/v as a percentage, and find the amount of drug in 500 mL.",
      answer: "0.05% w/v; 0.25 g (250 mg).",
      working: ["100 ÷ 2000 = 0.05% w/v.", "500 mL ÷ 2000 = 0.25 g."],
    },
    {
      q: "A master formula for 1000 mL contains 12 g of Drug F. What volume of the finished preparation contains 60 mg?",
      answer: "5 mL.",
      working: [
        "Concentration = 12 g ÷ 1000 mL = 12 mg/mL.",
        "Volume = 60 mg ÷ 12 mg/mL = 5 mL.",
      ],
    },
    {
      q: "A master formula for 1.5 L contains 45 g of Ingredient S. How much is needed for 250 mL?",
      answer: "7.5 g.",
      working: [
        "Convert: 1.5 L = 1500 mL.",
        "Scaling factor = 250 ÷ 1500 = 0.16667.",
        "45 g × 0.16667 = 7.5 g. (Keep the factor unrounded: 45 × 250 ÷ 1500 = 7.5 exactly.)",
      ],
    },
    {
      q: "An illustrative formula reads: Drug G 2% w/v, preservative 0.1% w/v, vehicle q.s. 100 mL. Write the formula for 40 mL in grams.",
      answer: "Drug G 0.8 g, preservative 0.04 g, vehicle q.s. to 40 mL.",
      working: [
        "Percentages stay the same; calculate grams for 40 mL.",
        "Drug G: 2 × 40 ÷ 100 = 0.8 g.",
        "Preservative: 0.1 × 40 ÷ 100 = 0.04 g.",
        "Vehicle: q.s. to 40 mL (not multiplied).",
      ],
    },
  ],
  limitations: [
    "Every formula and amount here is illustrative. Real preparations follow the authorised master formula and the pharmacopoeia, and are checked by a pharmacist.",
    "Scaling assumes the method works the same at every batch size. Very small or very large batches can behave differently (mixing, losses on equipment, heat), and some formulas specify their own minimum batch.",
    "The minimum weighable quantity depends on the specific balance and the accuracy required; the figure in Example 6 is illustrative.",
    "This guide does not cover dilution of stock solutions or alligation; see the dilution and concentration guide.",
  ],
  refs: ["ansel16", "aulton6", "bipmSI"],
  relatedTools: [
    {
      slug: "master-formula-calculator",
      name: "Master Formula Calculator",
      why: "Calculates the scaling factor as desired ÷ master quantity (converting L/mL or kg/g first), multiplies fixed amounts, and carries % and q.s. ingredients over unchanged — the rules in this guide.",
    },
  ],
  relatedGuides: ["dilution-and-concentration", "dose-calculations", "isotonicity-and-tonicity-adjustment"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
