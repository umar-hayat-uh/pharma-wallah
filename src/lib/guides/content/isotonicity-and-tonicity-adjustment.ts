import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples and practice answers was
 * recomputed in Python before drafting. Drugs are "Drug A", "Drug B"… and every
 * E-value, freezing-point depression and concentration is illustrative: the
 * guide teaches the arithmetic, never a formulation to make. Real E-values come
 * from a reference table, which a reviewer checks against the cited texts.
 *
 * The linked Isotonicity Calculator converts mM to % w/v without the molar mass
 * (a recorded fault), so this guide teaches the correct conversion and sends
 * students only to its % w/v and mg/mL paths.
 */
export const guide: Guide = {
  slug: "isotonicity-and-tonicity-adjustment",
  title: "Isotonicity and Tonicity Adjustment: Sodium Chloride Equivalents and Freezing-Point Depression",
  description:
    "Adjust eye drops and injections to isotonicity step by step: sodium chloride equivalents, freezing-point depression, the White–Vincent method and osmolarity.",
  category: "Pharmaceutics",
  objectives: [
    "Explain what isotonic, hypotonic and hypertonic mean, and why tonicity matters for eye drops, nasal drops and injections.",
    "Calculate how much sodium chloride to add to a preparation using sodium chloride equivalents (E-values).",
    "Calculate the sodium chloride needed by the freezing-point depression method.",
    "Convert a millimolar concentration to % w/v correctly, using the molar mass, before using an E-value.",
    "Estimate an E-value from a substance's molar mass and its Liso value, and use the White–Vincent method to find a volume of isotonic solution.",
    "Calculate ideal osmolarity in mOsm/L and explain why it differs from measured osmolality and from tonicity.",
  ],
  intro: [
    "Body fluids such as blood plasma and tears have a characteristic osmotic pressure. A solution placed in contact with them, such as an eye drop or an injection, is most comfortable and safest when it exerts the same effective osmotic pressure. A 0.9% w/v solution of sodium chloride is the classic reference: it is taken as isotonic with blood and tears, and both freeze at about −0.52 °C.",
    "Most drug solutions are not isotonic on their own. A small amount of drug in water is usually hypotonic, so the pharmacist adds an adjusting substance, most often sodium chloride, to bring the total up to the equivalent of 0.9% sodium chloride. This guide teaches the two classic ways to calculate that amount — sodium chloride equivalents and freezing-point depression — plus the White–Vincent method, the molar-mass conversion students most often get wrong, and how osmolarity relates to all of them.",
    "All drugs are called Drug A, Drug B and so on, and every E-value and freezing-point depression here is illustrative. Real values come from a reference table in a pharmaceutics or pharmaceutical-calculations text, and every real formulation is checked by a pharmacist.",
  ],
  terms: [
    {
      term: "Osmotic pressure",
      definition:
        "The pressure that would have to be applied to a solution to stop water moving into it across a semipermeable membrane. It depends on the number of dissolved particles, not their size or identity.",
    },
    {
      term: "Isotonic",
      definition:
        "Having the same effective osmotic pressure as a body fluid, so cells in contact with it neither swell nor shrink. 0.9% w/v sodium chloride is the usual reference.",
    },
    {
      term: "Hypotonic and hypertonic",
      definition:
        "Hypotonic: lower effective osmotic pressure than the body fluid; water moves into cells, which can swell and burst. Hypertonic: higher; water moves out and cells shrink.",
    },
    {
      term: "Iso-osmotic",
      definition:
        "Having the same osmotic pressure as the body fluid as measured across an ideal membrane. A solution can be iso-osmotic and still not isotonic if its solute crosses the cell membrane freely.",
    },
    {
      term: "Colligative property",
      definition:
        "A property that depends only on the number of dissolved particles: osmotic pressure, freezing-point depression, boiling-point elevation and vapour-pressure lowering. This is why one can be calculated from another.",
    },
    {
      term: "Sodium chloride equivalent (E-value)",
      definition:
        "The mass of sodium chloride that has the same osmotic effect as 1 g of the substance. A substance with E = 0.20 behaves, osmotically, like 0.20 g of sodium chloride per gram.",
    },
    {
      term: "Freezing-point depression (ΔTf)",
      definition:
        "How far below 0 °C a solution freezes. Blood and tears freeze at about −0.52 °C, so an isotonic solution has ΔTf ≈ 0.52 °C.",
    },
    {
      term: "Dissociation factor (i) and Liso",
      definition:
        "i is the number of particles a substance gives in solution (about 1.8 for sodium chloride at these concentrations, not exactly 2). Liso is an empirical value that combines i with the freezing-point constant of water, used to estimate ΔTf and E.",
    },
    {
      term: "Osmolarity and osmolality",
      definition:
        "Osmolarity is osmoles of particles per litre of solution (mOsm/L), usually calculated. Osmolality is osmoles per kilogram of water (mOsm/kg), usually measured with an osmometer.",
    },
  ],
  sections: [
    {
      id: "why-tonicity",
      heading: "Why tonicity matters, and what 0.9% means",
      blocks: [
        {
          kind: "p",
          text: "When a red blood cell sits in a hypotonic solution, water moves into it and it can swell and burst (haemolysis). In a hypertonic solution water moves out and the cell shrinks. The eye is similar: a strongly hypotonic or hypertonic drop stings and makes the eye water, which washes the drug away. Injections given in large volumes, and anything put into the eye, nose or a body cavity, are therefore adjusted towards isotonicity where the drug allows it.",
        },
        {
          kind: "p",
          text: "Every colligative property depends on the number of particles. Freezing-point depression is the one most easily measured, so pharmacy uses it as the yardstick: blood and tears freeze at about −0.52 °C, and so does a 0.9% w/v solution of sodium chloride. Any solution whose freezing point is depressed by 0.52 °C has the same number of osmotically active particles, and is therefore iso-osmotic with those fluids.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Iso-osmotic is not always isotonic",
          text: "Some solutes, boric acid for example, cross the red-cell membrane freely. A solution of such a substance can have the right freezing point and still let water and solute move into cells, so it behaves as hypotonic towards them. The calculations below give iso-osmotic solutions; whether that is truly isotonic for a given membrane is a question the reference texts answer substance by substance.",
        },
        {
          kind: "formula",
          expr: "ΔTf = Kf × i × m",
          where: [
            { sym: "ΔTf", meaning: "freezing-point depression, °C" },
            { sym: "Kf", meaning: "cryoscopic constant of water, 1.86 °C·kg/mol" },
            { sym: "i", meaning: "number of particles per formula unit in solution (dissociation factor)" },
            { sym: "m", meaning: "molality of the solute, mol/kg of water (close to molarity for dilute solutions)" },
          ],
          note: "Pharmaceutical texts often write ΔTf = Liso × c, where c is the molar concentration and Liso folds Kf and i together. Liso is about 1.9 for a non-electrolyte and about 3.4 for a 1:1 salt such as sodium chloride.",
        },
      ],
    },
    {
      id: "nacl-equivalents",
      heading: "The sodium chloride equivalent method",
      blocks: [
        {
          kind: "p",
          text: "This is the method used most in practice. Each ingredient is converted into the amount of sodium chloride that would have the same osmotic effect, using its E-value. You add those amounts up, compare the total with what a fully isotonic volume of 0.9% sodium chloride would contain, and add the difference as sodium chloride.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Find the sodium chloride an isotonic solution of the final volume would contain: 0.9 g per 100 mL, so 0.009 × volume (mL) grams.",
            "For each ingredient, find its mass in the final volume (g), then multiply by its E-value. This is its sodium chloride equivalent in grams.",
            "Add up the sodium chloride equivalents of all ingredients.",
            "Subtract the total from step 1. The result is the sodium chloride to add. If it is negative, the solution is already hypertonic and no sodium chloride should be added.",
            "If another adjusting substance is used instead of sodium chloride, divide the sodium chloride still needed by that substance's E-value.",
          ],
        },
        {
          kind: "formula",
          expr: "NaCl to add (g) = 0.009 × V − Σ (wᵢ × Eᵢ)",
          where: [
            { sym: "V", meaning: "final volume of the preparation, mL" },
            { sym: "0.009 × V", meaning: "grams of NaCl in an isotonic (0.9% w/v) solution of that volume" },
            { sym: "wᵢ", meaning: "mass of ingredient i in the final volume, g" },
            { sym: "Eᵢ", meaning: "sodium chloride equivalent of ingredient i (dimensionless, g NaCl per g substance)" },
          ],
          note: "Per 100 mL, the same rule reads: % NaCl to add = 0.9 − Σ (% w/v of each ingredient × E). That is what the Isotonicity Calculator shows.",
        },
        {
          kind: "example",
          title: "Example 1: an eye drop with a drug and a preservative",
          problem:
            "Make 30 mL of an eye drop containing Drug A 1% w/v (illustrative E = 0.20) and a preservative 0.01% w/v (illustrative E = 0.16), made isotonic with sodium chloride. How much sodium chloride is needed? How much of Agent X (illustrative E = 0.50) would be needed instead?",
          steps: [
            "Isotonic reference: 0.009 × 30 mL = 0.27 g NaCl.",
            "Drug A: 1% of 30 mL = 0.30 g; 0.30 g × 0.20 = 0.06 g NaCl equivalent.",
            "Preservative: 0.01% of 30 mL = 0.003 g; 0.003 g × 0.16 = 0.00048 g NaCl equivalent.",
            "Total equivalent = 0.06 + 0.00048 = 0.06048 g.",
            "NaCl to add = 0.27 − 0.06048 = 0.20952 g, about 0.210 g.",
            "Using Agent X instead: 0.20952 g ÷ 0.50 = 0.41904 g, about 0.419 g.",
          ],
          answer: "About 0.210 g of sodium chloride, or about 0.419 g of Agent X.",
          note: "The preservative's contribution is tiny at 0.01%, but writing it down keeps the method complete. Illustrative values only.",
        },
      ],
    },
    {
      id: "freezing-point",
      heading: "The freezing-point depression method",
      blocks: [
        {
          kind: "p",
          text: "If you know how much a solution of the drug depresses the freezing point (from a table, or measured), you can work out how much adjusting substance is needed to bring the total depression to 0.52 °C. The textbook form uses the depression produced by a 1% solution of the adjusting substance; for sodium chloride that is about 0.58 °C.",
        },
        {
          kind: "formula",
          expr: "% w/v of adjusting substance = (0.52 − a) ÷ b",
          where: [
            { sym: "0.52", meaning: "ΔTf of blood and tears, °C" },
            { sym: "a", meaning: "ΔTf of the unadjusted solution (the drug at its actual strength), °C" },
            { sym: "b", meaning: "ΔTf of a 1% w/v solution of the adjusting substance, °C (about 0.58 for NaCl)" },
          ],
          note: "If a table gives ΔTf for a 1% solution of the drug, multiply by the drug's actual % strength to get a (ΔTf is close to proportional to concentration in dilute solutions).",
        },
        {
          kind: "example",
          title: "Example 2: freezing-point method",
          problem:
            "A 1% w/v solution of Drug B depresses the freezing point by an illustrative 0.08 °C. How much sodium chloride is needed to make 50 mL of a 2% w/v solution of Drug B isotonic?",
          steps: [
            "a for a 2% solution = 2 × 0.08 °C = 0.16 °C.",
            "% NaCl = (0.52 − 0.16) ÷ 0.58 = 0.36 ÷ 0.58 = 0.6207% w/v.",
            "In 50 mL: 0.6207 g/100 mL × 50 mL = 0.3103 g.",
          ],
          answer: "About 0.310 g of sodium chloride.",
          note: "The two methods agree when the E-value and the ΔTf data are consistent; small differences come from rounding in the tables.",
        },
        {
          kind: "table",
          caption: "The three classic methods at a glance",
          head: ["Method", "Data you need", "What it gives", "Best used when"],
          rows: [
            ["Sodium chloride equivalent", "E-value of each ingredient", "Grams of NaCl (or other agent) to add", "Several ingredients; the usual compounding method"],
            ["Freezing-point depression", "ΔTf of the drug solution and of 1% adjusting agent", "% w/v of adjusting agent", "ΔTf data are available, or ΔTf is measured"],
            ["White–Vincent", "E-value of the drug", "mL of water that makes the drug isotonic", "Making up with a ready isotonic vehicle"],
          ],
        },
      ],
    },
    {
      id: "units-and-e-values",
      heading: "Getting concentrations into % w/v, and estimating E",
      blocks: [
        {
          kind: "p",
          text: "Every E-value calculation needs the ingredient's mass in grams, or its strength in % w/v (grams per 100 mL). A strength in mg/mL is easy: 1% w/v is 1 g per 100 mL, which is 10 mg/mL, so divide mg/mL by 10. A strength in millimoles per litre (mM) is different, because millimoles count molecules, not mass. You cannot turn moles into grams without the molar mass.",
        },
        {
          kind: "formula",
          expr: "% w/v = c (mmol/L) × M (g/mol) ÷ 10,000",
          where: [
            { sym: "c", meaning: "concentration in mmol/L (mM)" },
            { sym: "M", meaning: "molar mass of the substance, g/mol" },
            { sym: "10,000", meaning: "1 mmol/L × M g/mol = M mg/L = M × 10⁻⁴ g per 100 mL" },
          ],
          note: "Two substances at the same mM can have very different % w/v. Any shortcut that multiplies mM by a fixed number, ignoring the molar mass, is wrong.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Use the calculator's % w/v or mg/mL input",
          text: "The Isotonicity Calculator on this site converts mM to % w/v with a fixed factor that ignores molar mass, so its mM path gives wrong answers. Convert mM to % w/v yourself with the formula above, then enter % w/v.",
        },
        {
          kind: "p",
          text: "If no E-value is listed for a substance, it can be estimated from its molar mass and the Liso value for its type of electrolyte. This works because the osmotic effect per gram is proportional to the number of particles per gram.",
        },
        {
          kind: "formula",
          expr: "E ≈ 17 × Liso ÷ M",
          where: [
            { sym: "Liso", meaning: "empirical value for the electrolyte type (see table)" },
            { sym: "M", meaning: "molar mass, g/mol" },
            { sym: "17", meaning: "a constant that comes from sodium chloride's own M (58.45) and Liso (3.4)" },
          ],
          note: "Check: for sodium chloride, 17 × 3.4 ÷ 58.44 = 0.989, close to its defined E of 1.00.",
        },
        {
          kind: "table",
          caption: "Approximate Liso values by type of solute (as tabulated in physical-pharmacy texts; a reviewer checks against the cited text)",
          head: ["Type of solute", "Example of type", "Liso (approx.)"],
          rows: [
            ["Non-electrolyte", "sugars, glycerin", "1.9"],
            ["Weak electrolyte", "weak acids and bases, largely un-ionised", "2.0"],
            ["Uni-univalent salt (1:1)", "sodium chloride type", "3.4"],
            ["Uni-divalent salt", "sodium sulfate type", "4.3"],
            ["Di-univalent salt", "calcium chloride type", "4.8"],
          ],
        },
        {
          kind: "example",
          title: "Example 3: from mM to % w/v, then an estimated E",
          problem:
            "A solution contains 40 mM of Drug C, a non-electrolyte with molar mass 250 g/mol. Convert to % w/v, estimate its E-value, and find the sodium chloride to add per 100 mL.",
          steps: [
            "% w/v = 40 × 250 ÷ 10,000 = 1.0% w/v.",
            "A shortcut of '× 0.001' would give 0.04% — 25 times too small for this molar mass.",
            "E ≈ 17 × 1.9 ÷ 250 = 0.1292.",
            "NaCl equivalent per 100 mL = 1.0 × 0.1292 = 0.1292 g.",
            "NaCl to add = 0.9 − 0.1292 = 0.7708 g per 100 mL.",
          ],
          answer: "1.0% w/v; E ≈ 0.129; add about 0.771 g NaCl per 100 mL.",
        },
      ],
    },
    {
      id: "white-vincent",
      heading: "The White–Vincent method",
      blocks: [
        {
          kind: "p",
          text: "Sometimes it is easier to dissolve the drug in just enough water to make it isotonic, then make up to volume with a ready-made isotonic vehicle (such as 0.9% sodium chloride or an isotonic buffer). The White–Vincent method gives that volume of water.",
        },
        {
          kind: "formula",
          expr: "V = w × E × 111.1",
          where: [
            { sym: "V", meaning: "volume of water, mL, that makes the drug isotonic" },
            { sym: "w", meaning: "mass of drug, g" },
            { sym: "E", meaning: "sodium chloride equivalent of the drug" },
            { sym: "111.1", meaning: "100 ÷ 0.9: the mL of isotonic solution that 1 g of NaCl makes" },
          ],
        },
        {
          kind: "example",
          title: "Example 4: White–Vincent volume",
          problem:
            "A prescription needs 0.3 g of Drug D (illustrative E = 0.20) in 30 mL. What volume of water makes the drug isotonic, and how is the rest made up?",
          steps: [
            "V = 0.3 g × 0.20 × 111.1 = 6.666 mL, about 6.67 mL.",
            "Dissolve the drug in water to make 6.67 mL — this solution is isotonic.",
            "Make up to 30 mL with an isotonic vehicle: about 23.3 mL more.",
          ],
          answer: "About 6.67 mL of water, then isotonic vehicle to 30 mL.",
        },
      ],
    },
    {
      id: "osmolarity",
      heading: "Osmolarity: counting particles",
      blocks: [
        {
          kind: "p",
          text: "Labels of parenteral fluids often state osmolarity in mOsm/L. Ideal osmolarity counts each particle the substance gives: one for a non-electrolyte such as glucose, two for sodium chloride (Na⁺ and Cl⁻), three for calcium chloride.",
        },
        {
          kind: "formula",
          expr: "Osmolarity (mOsm/L) = [concentration (g/L) ÷ M (g/mol)] × n × 1000",
          where: [
            { sym: "M", meaning: "molar mass, g/mol" },
            { sym: "n", meaning: "number of particles per formula unit, assuming complete dissociation" },
            { sym: "× 1000", meaning: "converts osmol/L to mOsm/L" },
          ],
          note: "This is an ideal value. Real solutions do not dissociate completely, so measured osmolality is lower.",
        },
        {
          kind: "example",
          title: "Example 5: ideal osmolarity of two common reference solutions",
          problem: "Calculate the ideal osmolarity of 0.9% w/v sodium chloride (M = 58.44 g/mol) and 5% w/v anhydrous glucose (M = 180.16 g/mol).",
          steps: [
            "0.9% w/v = 9 g/L. 9 ÷ 58.44 = 0.1540 mol/L; × 2 particles × 1000 = 308 mOsm/L.",
            "5% w/v = 50 g/L. 50 ÷ 180.16 = 0.2775 mol/L; × 1 particle × 1000 = 277.5 mOsm/L.",
          ],
          answer: "About 308 mOsm/L and 278 mOsm/L.",
          note: "The 308 figure is higher than the roughly 290 mOsm/kg measured for body fluids because sodium chloride does not behave ideally. Glucose solutions are iso-osmotic in the bottle, but glucose is taken up by cells and metabolised, so its effect on cells in the body is not the same as an isotonic salt solution.",
        },
      ],
    },
  ],
  mistakes: [
    "Forgetting to scale to the final volume: 0.9% is per 100 mL. For 30 mL the isotonic amount is 0.27 g, not 0.9 g.",
    "Multiplying the drug's % strength by E but then subtracting from the per-100-mL figure for a different volume. Keep everything per 100 mL, or everything in grams for the final volume — not a mixture.",
    "Converting mM to % w/v without the molar mass. Moles count molecules; you need M to get grams. Use % w/v = mM × M ÷ 10,000.",
    "Using a negative 'NaCl to add'. If the sum of equivalents is already above 0.009 × V, the solution is hypertonic: add nothing and consider whether the formula needs changing.",
    "Dividing by the wrong E when substituting another adjusting agent. Grams of agent = grams of NaCl still needed ÷ E of the agent, not × E.",
    "Using the ΔTf of a 1% drug solution as if it were the ΔTf at the actual strength. Multiply by the % strength first.",
    "Treating iso-osmotic as isotonic for solutes that cross cell membranes freely, or quoting ideal osmolarity as if it were measured osmolality.",
  ],
  practice: [
    {
      q: "Make 60 mL of a solution containing Drug E 1.5% w/v (illustrative E = 0.22) isotonic with sodium chloride. How much sodium chloride is needed?",
      answer: "0.342 g of sodium chloride.",
      working: [
        "Isotonic reference: 0.009 × 60 mL = 0.54 g NaCl.",
        "Drug E: 1.5% of 60 mL = 0.9 g; 0.9 g × 0.22 = 0.198 g NaCl equivalent.",
        "NaCl to add = 0.54 − 0.198 = 0.342 g.",
      ],
    },
    {
      q: "An unadjusted drug solution freezes at −0.12 °C. Using b = 0.58 °C for 1% sodium chloride, how much sodium chloride is needed for 50 mL?",
      answer: "About 0.345 g (0.690% w/v).",
      working: [
        "a = 0.12 °C.",
        "% NaCl = (0.52 − 0.12) ÷ 0.58 = 0.40 ÷ 0.58 = 0.6897% w/v.",
        "In 50 mL: 0.6897 × 50 ÷ 100 = 0.3448 g.",
      ],
    },
    {
      q: "A solution contains 15 mM of Drug F (molar mass 342.3 g/mol). What is its strength in % w/v?",
      answer: "About 0.513% w/v.",
      working: [
        "% w/v = mM × M ÷ 10,000.",
        "= 15 × 342.3 ÷ 10,000 = 0.51345% w/v.",
      ],
    },
    {
      q: "Estimate the E-value of Drug G, a 1:1 (uni-univalent) salt with molar mass 300 g/mol, using Liso = 3.4.",
      answer: "E ≈ 0.193.",
      working: [
        "E ≈ 17 × Liso ÷ M.",
        "= 17 × 3.4 ÷ 300 = 57.8 ÷ 300 = 0.1927.",
      ],
    },
    {
      q: "Calculate the ideal osmolarity of 0.45% w/v sodium chloride (M = 58.44 g/mol). Is it hypo-, iso- or hypertonic relative to 0.9%?",
      answer: "About 154 mOsm/L — half of 0.9% sodium chloride, so hypotonic.",
      working: [
        "0.45% w/v = 4.5 g/L.",
        "4.5 ÷ 58.44 = 0.07700 mol/L.",
        "× 2 particles × 1000 = 154.0 mOsm/L, half the 308 mOsm/L of 0.9% NaCl.",
      ],
    },
    {
      q: "By the White–Vincent method, what volume of water makes 0.5 g of Drug H (illustrative E = 0.18) isotonic?",
      answer: "About 10.0 mL.",
      working: [
        "V = w × E × 111.1.",
        "= 0.5 × 0.18 × 111.1 = 9.999 mL, about 10.0 mL.",
      ],
    },
    {
      q: "A preparation still needs the equivalent of 0.25 g of sodium chloride. How much of Agent Y (illustrative E = 0.50) should be used instead?",
      answer: "0.5 g of Agent Y.",
      working: [
        "Grams of agent = NaCl still needed ÷ E of the agent.",
        "= 0.25 ÷ 0.50 = 0.5 g.",
        "Check: 0.5 g × 0.50 = 0.25 g NaCl equivalent.",
      ],
    },
    {
      q: "A 2% w/v solution of Drug J (illustrative E = 0.12) contains nothing else. Is it isotonic? If not, how much sodium chloride should be added per 100 mL?",
      answer: "Hypotonic (0.24% NaCl equivalent); add 0.66 g NaCl per 100 mL.",
      working: [
        "NaCl equivalent per 100 mL = 2 × 0.12 = 0.24 g.",
        "0.24 is below 0.9, so the solution is hypotonic.",
        "NaCl to add = 0.9 − 0.24 = 0.66 g per 100 mL.",
      ],
    },
  ],
  limitations: [
    "Every E-value and ΔTf in this guide is illustrative. Real values come from a reference table and vary with concentration; use the value listed for a strength close to yours.",
    "The methods give iso-osmotic solutions. Whether that is isotonic for a particular membrane depends on whether the solute crosses it; some solutes (boric acid, urea, glucose once metabolised) behave differently in the body.",
    "Not every preparation should be isotonic. Some injections are deliberately hypertonic, some drugs are too concentrated to adjust, and pH, stability and comfort also matter. The final formula is decided by a pharmacist using the product's own information.",
    "Ideal osmolarity assumes complete dissociation and ideal behaviour. Measured osmolality is lower, and the pharmacopoeial chapter on osmolality describes how it is measured.",
  ],
  refs: ["martin8", "ansel16", "uspOsmolality", "bipmSI"],
  relatedTools: [
    {
      slug: "isotonicity-calculator",
      name: "Isotonicity Calculator",
      why: "Sums % w/v × E for each ingredient and gives NaCl to add per 100 mL (0.9 − Σ), the method in this guide. Enter strengths in % w/v or mg/mL only: its mM option ignores molar mass and gives wrong answers.",
    },
  ],
  relatedGuides: ["dilution-and-concentration", "compounding-and-formula-scaling", "dose-calculations"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
