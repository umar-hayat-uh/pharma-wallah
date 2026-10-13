import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * Electrolyte Units: Converting mg, mmol, mEq and mOsmol.
 *
 * DRAFT (2026-10-13): not listed, not in the sitemap. Every figure in the
 * examples, tables and practice answers was recomputed with python3 on
 * 2026-10-13, using atomic masses Na 22.99, K 39.10, Cl 35.45, Ca 40.08,
 * Mg 24.31, S 32.06, O 16.00, H 1.008, C 12.01. Products and strengths are
 * used only to make the arithmetic concrete; nothing here is dosing advice.
 *
 * Not linked: `osmolarity-calculators` (TPN factors 10× high),
 * `ppm-ppb-calculator` (mg/L → M ignores molar mass) and
 * `mass-conversion-calculator` (its "conversion factor" line is inverted).
 */
export const guide: Guide = {
  slug: "electrolyte-units-mmol-meq-mosmol",
  title: "Electrolyte Units: Converting mg, mmol, mEq and mOsmol",
  description:
    "Convert between milligrams, millimoles, milliequivalents and milliosmoles for sodium, potassium, calcium and magnesium salts, with worked examples and practice.",
  category: "Pharmaceutical Calculations",

  objectives: [
    "Convert a mass of an electrolyte salt to millimoles of each ion, using the molar mass of the exact salt weighed, including water of crystallisation.",
    "Convert millimoles to milliequivalents using the ion's charge, and explain why mmol and mEq are equal for monovalent ions only.",
    "Calculate the ideal (theoretical) osmolarity of a solution from the number of particles each formula unit releases.",
    "Convert laboratory results between mg/dL, mmol/L and mEq/L.",
    "Recognise the cases where these simple conversions mislead, such as phosphate and non-ideal solutions.",
  ],

  intro: [
    "Electrolyte strengths reach a pharmacist in at least four units. A vial label may give the salt in mg/mL or as a percentage; a prescription may ask for millimoles or milliequivalents of the ion; a laboratory report may give serum calcium in mg/dL or mmol/L; and a parenteral fluid is described by its osmolarity in mOsmol/L. Each unit is useful in its place, and all of them describe the same chemistry.",
    "Moving between them needs only three ideas: a mole is a fixed number of particles, so dividing a mass by the molar mass counts the particles; an equivalent weights each ion by its charge; and an osmole counts every dissolved particle, whatever its charge. The hard part is bookkeeping — using the right molar mass (salt or ion, hydrated or anhydrous) and remembering how many ions each formula unit releases.",
    "The products and strengths in this guide are there to make the arithmetic concrete. They are illustrative, not dosing advice; electrolyte replacement must follow approved protocols, the product information and the supervising pharmacist.",
  ],

  terms: [
    {
      term: "Millimole (mmol)",
      definition:
        "One-thousandth of a mole. The number of millimoles = mass in mg ÷ molar mass in g/mol (numerically the same as mg/mmol).",
    },
    {
      term: "Molar mass",
      definition:
        "The mass of one mole of a substance, in g/mol. For a salt it is the sum of the atomic masses in its formula, including any water of crystallisation.",
    },
    {
      term: "Valence (charge)",
      definition:
        "The size of the charge on an ion, ignoring its sign: 1 for Na⁺, K⁺, Cl⁻ and HCO₃⁻; 2 for Ca²⁺, Mg²⁺ and SO₄²⁻.",
    },
    {
      term: "Milliequivalent (mEq)",
      definition:
        "A millimole of an ion multiplied by its valence: mEq = mmol × valence. It measures amount of charge, which is what electrical neutrality in body fluids balances.",
    },
    {
      term: "Equivalent weight",
      definition:
        "The mass of an ion that carries one equivalent of charge: molar mass ÷ valence. For calcium, 40.08 ÷ 2 = 20.04 mg per mEq.",
    },
    {
      term: "Milliosmole (mOsmol)",
      definition:
        "A millimole of dissolved particles, whatever their charge. Ideally, one millimole of NaCl gives 2 mOsmol (Na⁺ and Cl⁻); one millimole of glucose gives 1 mOsmol.",
    },
    {
      term: "Osmolarity and osmolality",
      definition:
        "Osmolarity is mOsmol per litre of solution; osmolality is mOsmol per kilogram of solvent. Calculated values are ideal; measured values are lower for electrolytes because ions do not behave fully independently.",
    },
    {
      term: "Hydrate",
      definition:
        "A salt that includes water in its crystals, such as CaCl₂·2H₂O or MgSO₄·7H₂O. The water adds to the molar mass, so a gram of hydrate contains less of the ion than a gram of the anhydrous salt.",
    },
  ],

  sections: [
    {
      id: "mass-to-mmol",
      heading: "From milligrams to millimoles",
      blocks: [
        {
          kind: "p",
          text: "Dividing a mass by a molar mass counts how many moles of formula units it contains. Because one formula unit of a salt releases a fixed number of each ion, the millimoles of each ion follow directly. The single most important habit is to use the molar mass of what was actually weighed: the salt, not the ion, and the hydrate if the label names a hydrate.",
        },
        {
          kind: "formula",
          expr: "mmol of salt = mass of salt (mg) ÷ molar mass of salt (g/mol)      mmol of ion = mmol of salt × number of that ion per formula unit",
          where: [
            { sym: "mass of salt", meaning: "in mg, from the label strength × volume" },
            { sym: "molar mass", meaning: "g/mol of the exact salt, including water of crystallisation" },
          ],
          note: "Units check: mg ÷ (g/mol) = mg ÷ (mg/mmol) = mmol.",
        },
        {
          kind: "table",
          caption: "Molar masses of some common electrolyte salts (from the atomic masses listed in the source note)",
          head: ["Salt", "Formula", "Molar mass (g/mol)", "Ions released per formula unit"],
          rows: [
            ["Sodium chloride", "NaCl", "58.44", "1 Na⁺ + 1 Cl⁻"],
            ["Potassium chloride", "KCl", "74.55", "1 K⁺ + 1 Cl⁻"],
            ["Sodium bicarbonate", "NaHCO₃", "84.01", "1 Na⁺ + 1 HCO₃⁻"],
            ["Calcium chloride dihydrate", "CaCl₂·2H₂O", "147.01", "1 Ca²⁺ + 2 Cl⁻"],
            ["Magnesium sulfate heptahydrate", "MgSO₄·7H₂O", "246.48", "1 Mg²⁺ + 1 SO₄²⁻"],
            ["Calcium gluconate monohydrate", "C₁₂H₂₂CaO₁₄·H₂O", "448.39", "1 Ca²⁺ + 2 gluconate"],
          ],
        },
        {
          kind: "example",
          title: "Example 1: Potassium chloride concentrate",
          problem:
            "A potassium chloride concentrate is 15% w/v. How many millimoles of K⁺ are in a 10 mL ampoule, and per mL?",
          steps: [
            "15% w/v = 15 g per 100 mL = 150 mg/mL.",
            "Mass in 10 mL = 150 × 10 = 1500 mg of KCl.",
            "mmol KCl = 1500 ÷ 74.55 = 20.12 mmol; one K⁺ per KCl, so 20.12 mmol K⁺.",
            "Per mL: 150 ÷ 74.55 = 2.012 mmol/mL.",
          ],
          answer: "About 20 mmol of K⁺ in 10 mL (2.0 mmol/mL).",
          note: "Concentrated potassium is a high-risk medicine and must always be diluted before infusion; this example is about the arithmetic only.",
        },
      ],
    },
    {
      id: "mmol-to-meq",
      heading: "From millimoles to milliequivalents",
      blocks: [
        {
          kind: "p",
          text: "An equivalent counts charge rather than particles. One millimole of Na⁺ carries one millimole of positive charge, so it is 1 mEq. One millimole of Ca²⁺ carries twice as much charge, so it is 2 mEq. Body fluids must contain equal numbers of positive and negative charges, which is why clinical chemistry has long reported electrolytes in mEq/L.",
        },
        {
          kind: "formula",
          expr: "mEq = mmol × valence      mg = mEq × (molar mass of the ion ÷ valence)",
          where: [
            { sym: "valence", meaning: "the size of the ion's charge: 1 for Na⁺, K⁺, Cl⁻, HCO₃⁻; 2 for Ca²⁺, Mg²⁺" },
            { sym: "molar mass ÷ valence", meaning: "the equivalent weight, in mg per mEq" },
          ],
          note: "For a monovalent ion, mmol and mEq are numerically identical. For a divalent ion, mEq is twice mmol.",
        },
        {
          kind: "table",
          caption: "Milligrams of the ion itself per mmol and per mEq",
          head: ["Ion", "Valence", "mg per mmol", "mg per mEq"],
          rows: [
            ["Na⁺", "1", "22.99", "22.99"],
            ["K⁺", "1", "39.10", "39.10"],
            ["Cl⁻", "1", "35.45", "35.45"],
            ["HCO₃⁻", "1", "61.02", "61.02"],
            ["Ca²⁺", "2", "40.08", "20.04"],
            ["Mg²⁺", "2", "24.31", "12.16"],
          ],
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Mass of the ion or mass of the salt?",
          text: "The table gives the mass of the ion alone. 1 mmol of K⁺ weighs 39.10 mg, but the KCl that supplies it weighs 74.55 mg. Read carefully whether a strength refers to the ion (\"40 mg calcium\") or to the salt (\"500 mg calcium gluconate\").",
        },
        {
          kind: "example",
          title: "Example 2: Calcium chloride dihydrate",
          problem:
            "How many mmol of Ca²⁺, mEq of Ca²⁺ and mmol of Cl⁻ are in 1 g of calcium chloride dihydrate (CaCl₂·2H₂O, 147.01 g/mol)?",
          steps: [
            "mmol CaCl₂·2H₂O = 1000 mg ÷ 147.01 = 6.802 mmol.",
            "Each unit releases one Ca²⁺: 6.802 mmol Ca²⁺.",
            "mEq Ca²⁺ = 6.802 × 2 = 13.60 mEq.",
            "Each unit releases two Cl⁻: 6.802 × 2 = 13.60 mmol Cl⁻ (also 13.60 mEq, since Cl⁻ is monovalent).",
          ],
          answer: "6.80 mmol (13.6 mEq) of Ca²⁺ and 13.6 mmol of Cl⁻.",
          note: "The positive and negative milliequivalents are equal (13.60 each), as electrical neutrality requires. That is a quick check on any salt calculation.",
        },
      ],
    },
    {
      id: "osmolarity",
      heading: "Milliosmoles and ideal osmolarity",
      blocks: [
        {
          kind: "p",
          text: "Osmotic pressure depends on the number of dissolved particles, not on their size or charge. To estimate it, count the particles each formula unit releases when it dissolves completely: NaCl gives two (Na⁺ and Cl⁻), CaCl₂ three, glucose one, because it does not ionise. Multiplying millimoles by that number gives the ideal milliosmoles.",
        },
        {
          kind: "formula",
          expr: "mOsmol/L (ideal) = (g/L ÷ molar mass) × 1000 × number of particles per formula unit",
          where: [
            { sym: "g/L", meaning: "concentration of the substance in grams per litre" },
            { sym: "molar mass", meaning: "g/mol of the substance as weighed" },
            { sym: "number of particles", meaning: "1 for a non-electrolyte; the number of ions for a fully dissociated salt" },
          ],
          note: "This is the theoretical value. Measured osmolality of electrolyte solutions is lower, because ions in solution do not act fully independently.",
        },
        {
          kind: "example",
          title: "Example 3: Sodium chloride 0.9% w/v",
          problem: "Find the mmol/L of Na⁺, the mEq/L of Na⁺, and the ideal osmolarity of 0.9% w/v sodium chloride.",
          steps: [
            "0.9% w/v = 9 g/L = 9000 mg/L.",
            "mmol/L NaCl = 9000 ÷ 58.44 = 154.0 mmol/L, giving 154 mmol/L of Na⁺ and 154 mmol/L of Cl⁻.",
            "Na⁺ is monovalent, so 154 mEq/L.",
            "Ideal osmolarity = 154.0 × 2 particles = 308 mOsmol/L.",
          ],
          answer: "154 mmol/L = 154 mEq/L of Na⁺ (and of Cl⁻); ideal osmolarity 308 mOsmol/L.",
          note: "The measured osmolality of this solution is lower than 308 because of non-ideal behaviour. The ideal figure is still the one used for quick comparisons.",
        },
        {
          kind: "example",
          title: "Example 4: Particles from a divalent salt",
          problem: "What is the ideal number of milliosmoles in 1 g of CaCl₂·2H₂O?",
          steps: [
            "mmol = 1000 ÷ 147.01 = 6.802 mmol.",
            "Particles per unit = 1 Ca²⁺ + 2 Cl⁻ = 3 (the water of crystallisation simply joins the solvent).",
            "mOsmol = 6.802 × 3 = 20.41 mOsmol.",
          ],
          answer: "About 20.4 mOsmol (ideal).",
        },
      ],
    },
    {
      id: "lab-units",
      heading: "Laboratory results: mg/dL, mmol/L and mEq/L",
      blocks: [
        {
          kind: "p",
          text: "Laboratories report the same electrolytes in different units. Many reports give calcium and magnesium in mg/dL, while many textbooks and guidelines use mmol/L, so you will need to move between them. One decilitre is 100 mL, so a value in mg/dL times 10 gives mg/L; dividing by the ion's molar mass then gives mmol/L.",
        },
        {
          kind: "formula",
          expr: "mmol/L = (mg/dL × 10) ÷ molar mass of the ion      mg/dL = mmol/L × molar mass ÷ 10      mEq/L = mmol/L × valence",
          where: [
            { sym: "mg/dL", meaning: "milligrams per decilitre (100 mL)" },
            { sym: "molar mass of the ion", meaning: "e.g. 40.08 for calcium, 24.31 for magnesium" },
          ],
        },
        {
          kind: "example",
          title: "Example 5: Serum magnesium",
          problem: "A serum magnesium is reported as 2.0 mg/dL. Express it in mmol/L and mEq/L.",
          steps: [
            "2.0 mg/dL × 10 = 20 mg/L.",
            "mmol/L = 20 ÷ 24.31 = 0.8227 mmol/L.",
            "Mg²⁺ is divalent: mEq/L = 0.8227 × 2 = 1.645 mEq/L.",
          ],
          answer: "0.82 mmol/L = 1.65 mEq/L.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Phosphate is the exception",
          text: "Phosphate in the body exists as a mixture of HPO₄²⁻ and H₂PO₄⁻, whose proportions depend on pH, so its average charge is not a fixed whole number. That makes \"mEq of phosphate\" ambiguous. Phosphate is therefore prescribed and reported in millimoles (of phosphate or of phosphorus), never converted to mEq with an assumed valence of 3.",
        },
      ],
    },
  ],

  mistakes: [
    "Using the molar mass of the ion when the salt was weighed, or of the anhydrous salt when the hydrate was weighed.",
    "Forgetting that a divalent ion has twice as many mEq as mmol, or applying the factor of 2 to a monovalent ion.",
    "Forgetting how many of an ion each formula unit releases: CaCl₂ gives two Cl⁻ per Ca²⁺.",
    "Counting particles for osmolarity from charge instead of number: one CaCl₂ gives 3 mOsmol, not 4.",
    "Treating calculated (ideal) osmolarity as the measured osmolality of an electrolyte solution.",
    "Converting mg/dL to mmol/L without multiplying by 10 first (1 dL = 100 mL, not 1 L).",
    "Converting phosphate to mEq with an assumed valence of 3.",
  ],

  practice: [
    {
      q: "How many millimoles of sodium are in 500 mg of sodium chloride?",
      answer: "8.56 mmol of Na⁺ (8.56 mEq).",
      working: [
        "mmol NaCl = 500 ÷ 58.44 = 8.556 mmol.",
        "One Na⁺ per NaCl: 8.556 mmol Na⁺, which is also 8.556 mEq because Na⁺ is monovalent.",
      ],
    },
    {
      q: "Sodium bicarbonate 8.4% w/v: how many mmol of bicarbonate are in 50 mL, and per mL?",
      answer: "About 50 mmol (50 mEq) in 50 mL; about 1.0 mmol/mL.",
      working: [
        "8.4% w/v = 84 mg/mL; in 50 mL: 84 × 50 = 4200 mg.",
        "mmol = 4200 ÷ 84.01 = 49.995, about 50 mmol HCO₃⁻.",
        "Per mL: 84 ÷ 84.01 = 0.9999, about 1.0 mmol/mL (= 1.0 mEq/mL).",
      ],
    },
    {
      q: "A serum calcium is 2.3 mmol/L. What is it in mg/dL and in mEq/L?",
      answer: "9.22 mg/dL; 4.6 mEq/L.",
      working: [
        "mg/L = 2.3 × 40.08 = 92.18 mg/L; ÷ 10 = 9.218 mg/dL.",
        "mEq/L = 2.3 × 2 = 4.6 mEq/L.",
      ],
    },
    {
      q: "Magnesium sulfate heptahydrate 50% w/v: how many mmol and mEq of Mg²⁺ are in 2 mL?",
      answer: "4.06 mmol = 8.11 mEq of Mg²⁺.",
      working: [
        "50% w/v = 500 mg/mL; 2 mL = 1000 mg of MgSO₄·7H₂O.",
        "mmol = 1000 ÷ 246.48 = 4.057 mmol of Mg²⁺.",
        "mEq = 4.057 × 2 = 8.114 mEq.",
      ],
    },
    {
      q: "An amount of 40 mEq of potassium is to be supplied as potassium chloride. What mass of K⁺ is that, and what mass of KCl?",
      answer: "1564 mg of K⁺, supplied by about 2.98 g of KCl.",
      working: [
        "K⁺ is monovalent, so 40 mEq = 40 mmol.",
        "Mass of K⁺ = 40 × 39.10 = 1564 mg.",
        "Mass of KCl = 40 × 74.55 = 2982 mg ≈ 2.98 g.",
      ],
    },
    {
      q: "What is the ideal osmolarity of a 5% w/v solution of anhydrous glucose (180.16 g/mol)?",
      answer: "About 278 mOsmol/L.",
      working: [
        "5% w/v = 50 g/L = 50,000 mg/L.",
        "mmol/L = 50,000 ÷ 180.16 = 277.5 mmol/L.",
        "Glucose does not ionise (1 particle), so ideal osmolarity ≈ 277.5 mOsmol/L.",
      ],
    },
    {
      q: "Calcium gluconate 10% w/v is made from calcium gluconate monohydrate (448.39 g/mol). How many mmol and mEq of Ca²⁺ are in 10 mL?",
      answer: "2.23 mmol = 4.46 mEq of Ca²⁺ (0.446 mEq/mL).",
      working: [
        "10% w/v = 100 mg/mL; 10 mL = 1000 mg.",
        "mmol = 1000 ÷ 448.39 = 2.230 mmol of Ca²⁺ (one Ca²⁺ per formula unit).",
        "mEq = 2.230 × 2 = 4.460 mEq; per mL, 4.460 ÷ 10 = 0.446 mEq/mL.",
      ],
    },
    {
      q: "A serum sodium is 140 mEq/L. What mass of sodium is that per litre?",
      answer: "3219 mg/L (about 3.22 g/L) of sodium.",
      working: [
        "Na⁺ is monovalent: 140 mEq/L = 140 mmol/L.",
        "Mass = 140 × 22.99 = 3218.6 mg/L ≈ 3.22 g/L.",
      ],
    },
  ],

  limitations: [
    "Calculated osmolarity assumes complete dissociation and ideal behaviour. Measured osmolality of electrolyte solutions is lower; where tonicity matters, the measured value or an official method takes precedence.",
    "Atomic masses are rounded to two decimal places, so final digits may differ slightly from values printed on product labels. Use the label's stated mmol content where one is given.",
    "Phosphate, and any ion whose charge depends on pH, should be handled in millimoles, not milliequivalents.",
    "The products and strengths here are illustrative. They are not dosing advice; electrolyte therapy must follow approved protocols, product information and the supervising pharmacist.",
  ],

  refs: ["ansel16", "uspOsmolality", "iupacGoldBook", "bipmSI"],

  relatedTools: [
    {
      slug: "electrolyte-conversion-calculator",
      name: "mmol ↔ mEq ↔ mg Calculator",
      why: "Converts between mg, mmol and mEq of the ion itself (not the salt) for Na⁺, K⁺, Ca²⁺, Mg²⁺, Cl⁻ and HCO₃⁻, as in the mEq section. Do not use its phosphate option, which assumes a valence of 3.",
    },
    {
      slug: "mg-ml-to-molarity-calculator",
      name: "mg/mL ↔ Molarity Calculator",
      why: "Divides mg/mL by the molar mass to give mol/L and mmol/L — the salt-to-millimole step in Examples 1 and 3, when you enter the molar mass of the salt weighed.",
    },
  ],

  relatedGuides: ["dilution-and-concentration", "dose-calculations"],

  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
