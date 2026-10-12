import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * Dilution and Concentration Calculations.
 *
 * Every figure in the examples, tables and practice answers was recomputed
 * with python3 on 2026-10-12 before it was written here. Drug names are used
 * only to make the arithmetic concrete; the strengths are illustrative and are
 * not dosing advice.
 */
export const guide: Guide = {
  slug: "dilution-and-concentration",
  title: "Dilution and Concentration Calculations",
  description:
    "Molarity, mg/mL, % w/v, ratio strength and ppm explained, with C₁V₁ = C₂V₂, serial dilutions, alligation and stock solutions worked step by step.",
  category: "Pharmaceutical Chemistry & Compounding",

  objectives: [
    "Express one concentration in every common form — molarity, mg/mL, % w/v, % v/v, % w/w, ratio strength and ppm — and convert between them, using the molar mass where moles are involved.",
    "Use C₁V₁ = C₂V₂ correctly, state the assumption behind it, and tell the final volume apart from the volume of diluent to add.",
    "Plan a serial dilution and calculate the cumulative dilution factor and the concentration in every tube.",
    "Use alligation to find how much of two strengths to mix to obtain a third.",
    "Prepare a stock solution and a set of working solutions, and recalculate their true concentrations from what was actually weighed.",
    "Choose the right glassware and technique so that the solution on the bench matches the number on paper.",
  ],

  intro: [
    "Almost every practical in pharmaceutical chemistry, pharmaceutics and analysis starts with the same job: make a solution of a known strength, or make a weaker one from a stronger one. A calibration curve, a dissolution test, a microbiology plate and a compounded cream all depend on it. If the concentration is wrong at the start, every result that follows is wrong by the same factor, however carefully the rest of the experiment is done.",
    "The arithmetic itself is simple. What trips students up is the bookkeeping: mixing units (mg with g, mL with L), confusing \"1 in 10\" with \"1:10\", forgetting that a final volume includes the stock already in the flask, or using the molar mass of the base when the salt was weighed. This guide works through each way of expressing concentration, shows how to move between them, and then covers the four calculations you will use most: C₁V₁ = C₂V₂, serial dilution, alligation, and stock-plus-working solutions.",
    "Each section has worked examples with every step shown. The drugs named in the examples are there to make the numbers concrete; the strengths are illustrative values for practising the arithmetic, not dosing advice.",
  ],

  terms: [
    {
      term: "Solute, solvent, solution",
      definition:
        "The solute is the substance dissolved; the solvent (diluent) is the liquid it is dissolved in; the solution is the two together. Concentrations always describe solute per amount of solution, not per amount of solvent, unless stated otherwise.",
    },
    {
      term: "Molarity (amount concentration)",
      definition:
        "Moles of solute per litre of solution, unit mol/L, written M. 1 M = 1000 mM = 1,000,000 µM.",
    },
    {
      term: "Mass concentration",
      definition:
        "Mass of solute per volume of solution, such as mg/mL, g/L or µg/mL. 1 mg/mL is exactly 1 g/L.",
    },
    {
      term: "Percentage strength",
      definition:
        "% w/v is grams of solute in 100 mL of solution; % v/v is millilitres of solute in 100 mL of solution; % w/w is grams of solute in 100 g of the whole preparation.",
    },
    {
      term: "Ratio strength",
      definition:
        "A weak concentration written as 1:x, meaning 1 part of solute in x parts of the whole preparation. For a solid in a liquid, 1:1000 means 1 g in 1000 mL.",
    },
    {
      term: "Parts per million (ppm)",
      definition:
        "1 part of solute in 1,000,000 parts of the whole. For dilute water-based solutions, whose density is close to 1 g/mL, 1 ppm is taken as 1 mg/L, which is 1 µg/mL.",
    },
    {
      term: "Dilution factor",
      definition:
        "How many times weaker the diluted solution is than the one it came from: C₁ ÷ C₂, which equals V₂ ÷ V₁. A dilution factor of 10 is a \"1 in 10\" dilution.",
    },
    {
      term: "Stock solution and working solution",
      definition:
        "A stock solution is a concentrated solution prepared accurately and kept for use; working solutions are made from it by dilution to the strengths actually needed, such as calibration standards.",
    },
    {
      term: "Alligation",
      definition:
        "A quick method for finding the proportions in which two preparations of different strength must be mixed to give a preparation of an intermediate strength.",
    },
  ],

  sections: [
    {
      id: "expressing-concentration",
      heading: "Ways of expressing concentration",
      blocks: [
        {
          kind: "p",
          text: "The same solution can be described in several ways, and which one you meet depends on where you are. Analytical methods and pharmacology papers favour molarity or µg/mL; product labels and compounding formulas use percentages and mg/mL; very weak solutions such as adrenaline injections have traditionally been labelled by ratio strength; and trace limits, for example in water testing, are given in ppm. None of these is more correct than the others. They are different units for one quantity: how much solute is in how much solution.",
        },
        {
          kind: "formula",
          expr: "Molarity (M) = moles of solute ÷ volume of solution (L) = mass (g) ÷ [molar mass (g/mol) × volume (L)]",
          where: [
            { sym: "M", meaning: "mol/L" },
            { sym: "molar mass", meaning: "g/mol, for the exact form weighed (salt, hydrate or free base)" },
          ],
        },
        {
          kind: "list",
          items: [
            "% w/v = grams of solute in 100 mL of solution. 1% w/v = 1 g/100 mL = 10 mg/mL.",
            "% v/v = millilitres of solute in 100 mL of solution. Used for liquids in liquids, such as ethanol in water.",
            "% w/w = grams of solute in 100 g of preparation. Used for ointments, creams and powders, where everything is weighed.",
            "Ratio strength 1:x = 1 g in x mL (solid in liquid), 1 mL in x mL (liquid in liquid) or 1 g in x g (solid in solid).",
            "ppm = parts per million. Strictly a mass fraction; for dilute aqueous solutions 1 ppm ≈ 1 mg/L = 1 µg/mL.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Per solution, not per solvent",
          text: "A 0.9% w/v sodium chloride solution contains 0.9 g of sodium chloride in every 100 mL of finished solution. It is not 0.9 g added to 100 mL of water: the solid takes up some volume, so you dissolve it in less water and then make up to 100 mL.",
        },
      ],
    },
    {
      id: "converting",
      heading: "Converting between units",
      blocks: [
        {
          kind: "p",
          text: "Most conversions come down to two facts. First, 1 mg/mL equals 1 g/L, so a mass concentration in mg/mL divided by the molar mass in g/mol gives molarity directly. Second, a percentage w/v multiplied by 10 gives mg/mL, because 1 g in 100 mL is 1000 mg in 100 mL, which is 10 mg in each mL.",
        },
        {
          kind: "formula",
          expr: "mg/mL = % w/v × 10      M = (mg/mL) ÷ molar mass      mM = M × 1000",
          note: "Molarity needs the molar mass of the form you actually weighed. A salt or hydrate has a larger molar mass than the free drug.",
        },
        {
          kind: "table",
          caption: "Equivalent ways of writing weak solid-in-liquid concentrations (ppm assumes a dilute aqueous solution)",
          head: ["Ratio strength", "% w/v", "mg/mL", "ppm (mg/L)"],
          rows: [
            ["1:100", "1%", "10", "10,000"],
            ["1:1000", "0.1%", "1", "1000"],
            ["1:10,000", "0.01%", "0.1", "100"],
            ["1:100,000", "0.001%", "0.01", "10"],
          ],
        },
        {
          kind: "example",
          title: "Example 1: Sodium chloride 0.9% w/v in four units",
          problem:
            "Express a 0.9% w/v sodium chloride solution (molar mass 58.44 g/mol) in mg/mL, mol/L and mmol/L, and find the mass of sodium chloride needed for 500 mL.",
          steps: [
            "mg/mL = 0.9 × 10 = 9 mg/mL (which is also 9 g/L).",
            "Molarity = 9 g/L ÷ 58.44 g/mol = 0.1540 mol/L.",
            "In millimoles: 0.1540 × 1000 = 154.0 mmol/L.",
            "Mass for 500 mL = 0.9 g per 100 mL × 500 mL ÷ 100 mL = 4.5 g.",
          ],
          answer: "9 mg/mL = 0.1540 M = 154.0 mM; 4.5 g sodium chloride made up to 500 mL.",
        },
        {
          kind: "example",
          title: "Example 2: A weighed drug as molarity",
          problem:
            "250 mg of paracetamol (molar mass 151.16 g/mol) is dissolved and made up to 50 mL. What is the concentration in mg/mL and in mmol/L?",
          steps: [
            "Mass concentration = 250 mg ÷ 50 mL = 5 mg/mL = 5 g/L.",
            "Molarity = 5 g/L ÷ 151.16 g/mol = 0.03308 mol/L.",
            "In millimoles: 0.03308 × 1000 = 33.08 mmol/L.",
          ],
          answer: "5 mg/mL, which is 0.03308 M or 33.08 mM.",
        },
        {
          kind: "example",
          title: "Example 3: Percentage to ppm",
          problem: "A dilute aqueous solution is labelled 0.002% w/v. What is that in ppm?",
          steps: [
            "0.002% w/v = 0.002 g in 100 mL = 0.02 g in 1000 mL.",
            "0.02 g/L = 20 mg/L.",
            "For a dilute aqueous solution, 1 mg/L ≈ 1 ppm, so 20 mg/L ≈ 20 ppm.",
          ],
          answer: "About 20 ppm (20 mg/L).",
          note: "The ppm ≈ mg/L shortcut relies on the solution weighing about 1 g per mL. It is not valid for concentrated solutions or for solvents much lighter or heavier than water.",
        },
        {
          kind: "p",
          text: "Ratio strength converts to a percentage by dividing 100 by x: 1:1000 is 100 ÷ 1000 = 0.1%. Going the other way, divide 100 by the percentage: 0.02% is 1:(100 ÷ 0.02) = 1:5000. Ratio strengths are written with 1 as the first term, and a larger second number always means a weaker solution.",
        },
      ],
    },
    {
      id: "c1v1",
      heading: "C₁V₁ = C₂V₂ and the dilution factor",
      blocks: [
        {
          kind: "p",
          text: "When you dilute a solution you add solvent, but you do not add or remove any solute. The amount of solute you take from the concentrated solution (its concentration times the volume taken) is therefore the amount that ends up in the diluted solution (its concentration times its final volume). That single idea — the amount of solute is conserved — is the whole basis of the dilution equation.",
        },
        {
          kind: "formula",
          expr: "C₁ × V₁ = C₂ × V₂",
          where: [
            { sym: "C₁", meaning: "concentration of the solution you start from" },
            { sym: "V₁", meaning: "volume of it that you take" },
            { sym: "C₂", meaning: "concentration you want" },
            { sym: "V₂", meaning: "final total volume of the diluted solution" },
          ],
          note: "C₁ and C₂ must be in the same unit, and V₁ and V₂ in the same unit. Any concentration unit works as long as both sides match.",
        },
        {
          kind: "p",
          text: "V₂ is the final volume, not the volume of solvent you add. The diluent added is V₂ − V₁ only when the volumes are additive, which is close enough for dilute aqueous solutions but not for mixtures such as ethanol and water. That is why, in practice, you put V₁ into a volumetric flask and make up to the mark rather than measuring the diluent separately.",
        },
        {
          kind: "table",
          caption: "Dilution factor and what it means at the bench",
          head: ["Written as", "Dilution factor", "Stock : diluent", "Example for 10 mL final volume"],
          rows: [
            ["1 in 2", "2", "1 : 1", "5 mL stock + 5 mL diluent"],
            ["1 in 5", "5", "1 : 4", "2 mL stock + 8 mL diluent"],
            ["1 in 10", "10", "1 : 9", "1 mL stock + 9 mL diluent"],
            ["1 in 100", "100", "1 : 99", "0.1 mL stock + 9.9 mL diluent"],
          ],
        },
        {
          kind: "callout",
          tone: "caution",
          title: "\"1 in 10\" is not \"1 + 10\"",
          text: "A 1 in 10 dilution is one part stock in ten parts total: 1 part stock plus 9 parts diluent. Laboratories differ in whether \"1:10\" means 1 in 10 or 1 part to 10 parts (1 in 11), so write \"1 in 10\" or state the final volume to avoid ambiguity.",
        },
        {
          kind: "example",
          title: "Example 4: Ethanol 70% v/v from 95% v/v",
          problem: "How much 95% v/v ethanol is needed to prepare 250 mL of 70% v/v ethanol?",
          steps: [
            "C₁ = 95% v/v, C₂ = 70% v/v, V₂ = 250 mL; find V₁.",
            "V₁ = C₂ × V₂ ÷ C₁ = 70 × 250 ÷ 95 = 184.21 mL.",
            "Measure 184.2 mL of 95% ethanol and make up to 250 mL with purified water.",
          ],
          answer: "184.2 mL of 95% v/v ethanol, made up to 250 mL.",
          note: "Simply adding 250 − 184.21 = 65.79 mL of water would give slightly less than 250 mL, because ethanol and water contract when they mix. Making up to volume avoids the error.",
        },
        {
          kind: "example",
          title: "Example 5: Mixed units",
          problem: "You have a 2 mg/mL stock and need 20 mL of a 50 µg/mL solution. How much stock do you take?",
          steps: [
            "Put both concentrations in the same unit: 50 µg/mL = 0.05 mg/mL.",
            "V₁ = C₂ × V₂ ÷ C₁ = 0.05 × 20 ÷ 2 = 0.5 mL.",
            "Dilution factor = C₁ ÷ C₂ = 2 ÷ 0.05 = 40, which matches V₂ ÷ V₁ = 20 ÷ 0.5 = 40.",
          ],
          answer: "0.5 mL of stock made up to 20 mL (a 1 in 40 dilution).",
        },
      ],
    },
    {
      id: "serial-dilution",
      heading: "Serial dilutions and the cumulative dilution factor",
      blocks: [
        {
          kind: "p",
          text: "Some dilutions are too large to make in one step. A 1 in 1000 dilution into 10 mL would need 0.01 mL (10 µL) of stock, which is hard to measure accurately with ordinary glassware. A serial dilution splits the job into smaller steps: each tube is made from the one before it, and every transfer is a volume you can measure well.",
        },
        {
          kind: "formula",
          expr: "Overall dilution factor = DF₁ × DF₂ × DF₃ × …      Final concentration = C(stock) ÷ overall dilution factor",
          note: "Dilution factors multiply; they are never added. Three 1 in 10 steps give 1 in 1000, not 1 in 30.",
        },
        {
          kind: "example",
          title: "Example 6: Three 1 in 10 steps",
          problem:
            "Starting from a 1 mg/mL stock, you make three successive 1 in 10 dilutions, each to a final volume of 10 mL. What is in each tube?",
          steps: [
            "Each step: transfer 1 mL into 9 mL of diluent (final volume 10 mL), mix well before the next transfer.",
            "Tube 1: 1 mg/mL ÷ 10 = 0.1 mg/mL = 100 µg/mL.",
            "Tube 2: 0.1 ÷ 10 = 0.01 mg/mL = 10 µg/mL.",
            "Tube 3: 0.01 ÷ 10 = 0.001 mg/mL = 1 µg/mL.",
            "Overall dilution factor = 10 × 10 × 10 = 1000.",
          ],
          answer: "100, 10 and 1 µg/mL; overall dilution 1 in 1000.",
        },
        {
          kind: "p",
          text: "The steps do not have to be equal. Dilutions of 1 in 5, then 1 in 20, then 1 in 2 give an overall factor of 5 × 20 × 2 = 200; from a 5 mg/mL stock the last tube holds 5 ÷ 200 = 0.025 mg/mL, which is 25 µg/mL. Unequal steps are useful when you need to land on a particular final value.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Errors carry forward",
          text: "In a serial dilution each tube inherits any error in the tubes before it. Mix every tube thoroughly before taking from it, use a clean pipette tip for each transfer, and remember that the transfer removes volume from the tube it is taken from.",
        },
        {
          kind: "p",
          text: "The same arithmetic runs backwards in analysis. If you diluted a sample before measuring it, multiply the measured concentration by the total dilution factor to get the concentration in the original sample.",
        },
      ],
    },
    {
      id: "alligation",
      heading: "Alligation: mixing two strengths",
      blocks: [
        {
          kind: "p",
          text: "Sometimes you have two preparations of the same ingredient at different strengths and need something in between — for example a 5% w/w ointment from 10% and 2% stock ointments. Alligation (strictly, alligation alternate) gives the proportions without setting up simultaneous equations. A plain base or solvent with none of the ingredient counts as a 0% strength.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Write the higher strength, the lower strength and the wanted strength. The wanted strength must lie between the other two.",
            "Parts of the higher strength = wanted − lower.",
            "Parts of the lower strength = higher − wanted.",
            "Add the parts, then share the total quantity in that proportion.",
            "Check: the amount of ingredient in the mixture divided by its total should give the wanted strength.",
          ],
        },
        {
          kind: "example",
          title: "Example 7: A 5% w/w ointment from 10% and 2%",
          problem: "How much 10% w/w and 2% w/w ointment should be mixed to make 200 g of 5% w/w ointment?",
          steps: [
            "Parts of 10% = 5 − 2 = 3. Parts of 2% = 10 − 5 = 5. Total = 8 parts.",
            "10% ointment = 200 g × 3 ÷ 8 = 75 g.",
            "2% ointment = 200 g × 5 ÷ 8 = 125 g.",
            "Check: (0.10 × 75) + (0.02 × 125) = 7.5 + 2.5 = 10 g of ingredient in 200 g, which is 5% w/w.",
          ],
          answer: "75 g of the 10% ointment and 125 g of the 2% ointment.",
        },
        {
          kind: "p",
          text: "With a plain base as the lower strength, the method still works: to make 100 g of a 5% w/w preparation from a 20% w/w one, the parts are 5 − 0 = 5 of the 20% and 20 − 5 = 15 of base, so 25 g of the 20% preparation and 75 g of base. That is the same answer C₁V₁ = C₂V₂ gives with masses in place of volumes.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Weigh, or check that volumes add",
          text: "Alligation shares out quantities on the assumption that they add up. That holds for masses (% w/w), so it is safest for ointments, creams and powders. For liquids, mixing volumes is only approximate if the liquids contract on mixing, as ethanol and water do; prepare those by making up to volume.",
        },
      ],
    },
    {
      id: "stock-and-working",
      heading: "Preparing a stock and working solutions",
      blocks: [
        {
          kind: "p",
          text: "Analytical work almost never weighs out each calibration standard separately. Instead you weigh once, accurately, to make a stock solution, then dilute it to several working solutions. Weighing a few milligrams directly for each standard would carry a large relative weighing error; a single larger weighing followed by pipetting with volumetric glassware is more accurate.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Decide the stock concentration so that every working solution needs a convenient, accurately measurable volume of stock.",
            "Weigh the substance, record the actual mass, and transfer it quantitatively (rinse the weighing boat into the flask).",
            "Dissolve in part of the solvent, bring to room temperature, then make up to the mark and invert to mix.",
            "Calculate the real stock concentration from the mass actually weighed, not from the target mass.",
            "Make each working solution by pipetting stock into a volumetric flask and making up to volume.",
          ],
        },
        {
          kind: "example",
          title: "Example 8: Calibration standards from a weighed stock",
          problem:
            "You aim for a 100 µg/mL paracetamol stock by weighing 10 mg into a 100 mL volumetric flask. The balance reads 10.4 mg. You then prepare five working standards in 50 mL flasks, targeting 2, 4, 6, 8 and 10 µg/mL. What volumes do you pipette, and what are the true concentrations?",
          steps: [
            "Planned volumes (using the target 100 µg/mL): V₁ = C₂ × 50 ÷ 100, giving 1.0, 2.0, 3.0, 4.0 and 5.0 mL — all volumes with standard volumetric pipettes.",
            "Actual stock = 10.4 mg ÷ 100 mL = 0.104 mg/mL = 104 µg/mL.",
            "True concentration of each standard = V₁ × 104 ÷ 50.",
            "1.0 mL → 2.08 µg/mL; 2.0 mL → 4.16 µg/mL; 3.0 mL → 6.24 µg/mL; 4.0 mL → 8.32 µg/mL; 5.0 mL → 10.4 µg/mL.",
          ],
          answer: "Pipette 1.0, 2.0, 3.0, 4.0 and 5.0 mL; the standards are 2.08, 4.16, 6.24, 8.32 and 10.4 µg/mL.",
          note: "Keep the convenient pipette volumes and use the true concentrations in the calibration curve. Re-weighing to hit exactly 10.0 mg wastes time and adds handling.",
        },
      ],
    },
    {
      id: "lab-practice",
      heading: "Laboratory practice notes",
      blocks: [
        {
          kind: "p",
          text: "A correct calculation only produces a correct solution if the measuring is done properly. These habits make the difference between a solution that is right on paper and one that is right in the flask.",
        },
        {
          kind: "list",
          items: [
            "Use volumetric (graduated-to-contain) flasks for final volumes and volumetric (bulb) pipettes for exact transfers. Measuring cylinders and beakers are for approximate volumes only.",
            "\"Make up to volume\" means dissolving in less than the final volume, then adding solvent until the bottom of the meniscus sits on the mark at eye level.",
            "Let solutions that warm or cool on dissolving return to room temperature before making up, because glassware is calibrated at a stated temperature.",
            "Mix after making up by stoppering and inverting the flask several times; a solution is not uniform until it is mixed.",
            "Choose the stock concentration so that transfers are not tiny: very small volumes carry a larger relative error.",
            "Record the actual mass weighed, the flask and pipette sizes, and every dilution, so that anyone can recalculate your concentrations.",
            "Label every flask and tube with its contents, concentration and date as you make it, not afterwards.",
          ],
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Right compound, right form",
          text: "Check whether a concentration refers to the salt or the free base, and whether your material is a hydrate. Using the wrong molar mass gives a systematic error in every molar concentration you calculate. Where an official monograph or a validated method specifies how to prepare a solution, follow it exactly.",
        },
      ],
    },
  ],

  mistakes: [
    "Treating V₂ as the volume of diluent to add. V₂ is the final volume; the diluent is roughly V₂ − V₁, and for non-additive liquids you must make up to volume instead.",
    "Mixing units on the two sides of C₁V₁ = C₂V₂, for example mg/mL for C₁ and µg/mL for C₂, which makes the answer 1000 times wrong.",
    "Reading \"1 in 10\" as 1 part stock plus 10 parts diluent. 1 in 10 is 1 part stock plus 9 parts diluent, 10 parts in total.",
    "Adding dilution factors in a serial dilution instead of multiplying them: three 1 in 10 steps are 1 in 1000, not 1 in 30.",
    "Taking % w/v as grams per 100 mL of solvent rather than per 100 mL of finished solution.",
    "Using the molar mass of the free drug when the salt or hydrate was weighed, or the other way round.",
    "Using the target mass instead of the mass actually weighed when calculating the stock concentration, then carrying that error into every working standard.",
    "Applying ppm ≈ mg/L to concentrated solutions or non-aqueous solvents, where the density is not close to 1 g/mL.",
  ],

  practice: [
    {
      q: "A 2% w/v potassium chloride solution is prepared (molar mass 74.55 g/mol). What is its concentration in mg/mL and in mmol/L?",
      answer: "20 mg/mL, which is 268.3 mmol/L (0.2683 M).",
      working: [
        "mg/mL = 2 × 10 = 20 mg/mL = 20 g/L.",
        "Molarity = 20 ÷ 74.55 = 0.2683 mol/L.",
        "mmol/L = 0.2683 × 1000 = 268.3 mmol/L.",
      ],
    },
    {
      q: "How much of a 1 M stock solution is needed to prepare 500 mL of a 0.15 M solution, and roughly how much diluent will that need?",
      answer: "75 mL of stock, made up to 500 mL (about 425 mL of diluent).",
      working: [
        "V₁ = C₂ × V₂ ÷ C₁ = 0.15 × 500 ÷ 1 = 75 mL.",
        "Diluent ≈ V₂ − V₁ = 500 − 75 = 425 mL; in practice, make up to the 500 mL mark.",
      ],
    },
    {
      q: "Express a ratio strength of 1:5000 (solid in liquid) as % w/v, mg/mL and ppm.",
      answer: "0.02% w/v = 0.2 mg/mL ≈ 200 ppm.",
      working: [
        "1:5000 = 1 g in 5000 mL.",
        "% w/v = 100 ÷ 5000 = 0.02%.",
        "mg/mL = 1000 mg ÷ 5000 mL = 0.2 mg/mL = 200 mg/L.",
        "For a dilute aqueous solution, 200 mg/L ≈ 200 ppm.",
      ],
    },
    {
      q: "A 2 mg/mL stock is diluted 1 in 4, then 1 in 5, then 1 in 10. What is the overall dilution factor and the final concentration in µg/mL?",
      answer: "Overall dilution 1 in 200; final concentration 10 µg/mL.",
      working: [
        "Overall factor = 4 × 5 × 10 = 200.",
        "Final concentration = 2 mg/mL ÷ 200 = 0.01 mg/mL.",
        "0.01 mg/mL × 1000 = 10 µg/mL.",
      ],
    },
    {
      q: "How many grams of a 15% w/w cream and a 3% w/w cream are needed to make 120 g of a 6% w/w cream?",
      answer: "30 g of the 15% cream and 90 g of the 3% cream.",
      working: [
        "Parts of 15% = 6 − 3 = 3. Parts of 3% = 15 − 6 = 9. Total = 12 parts.",
        "15% cream = 120 × 3 ÷ 12 = 30 g. 3% cream = 120 × 9 ÷ 12 = 90 g.",
        "Check: (0.15 × 30) + (0.03 × 90) = 4.5 + 2.7 = 7.2 g in 120 g = 6% w/w.",
      ],
    },
    {
      q: "In an assay, 0.5 mL of a sample is made up to 25 mL in a volumetric flask, and the diluted solution measures 4.2 µg/mL. What was the concentration of the original sample?",
      answer: "210 µg/mL.",
      working: [
        "Dilution factor = V₂ ÷ V₁ = 25 ÷ 0.5 = 50.",
        "Original concentration = 4.2 × 50 = 210 µg/mL.",
      ],
    },
    {
      q: "A water sample contains 0.35 ppm of an impurity. How many milligrams are in 2 L? And what is 25 ppm as % w/v?",
      answer: "0.7 mg in 2 L; 25 ppm = 0.0025% w/v.",
      working: [
        "0.35 ppm ≈ 0.35 mg/L, so 2 L contain 0.35 × 2 = 0.7 mg.",
        "25 ppm = 25 g in 1,000,000 mL (dilute aqueous), so per 100 mL: 25 ÷ 1,000,000 × 100 = 0.0025 g.",
        "That is 0.0025% w/v.",
      ],
    },
    {
      q: "You weigh 50.6 mg of a reference substance into a 50 mL volumetric flask. You need about 100 mL of a 20 µg/mL working solution and you will use a 2 mL volumetric pipette. What is the stock concentration, the exact volume C₁V₁ = C₂V₂ asks for, and the true concentration if you pipette 2.00 mL?",
      answer: "Stock 1012 µg/mL; exact volume 1.976 mL; with 2.00 mL the working solution is 20.24 µg/mL.",
      working: [
        "Stock = 50.6 mg ÷ 50 mL = 1.012 mg/mL = 1012 µg/mL.",
        "Exact V₁ = 20 × 100 ÷ 1012 = 1.976 mL — not a standard pipette volume.",
        "Pipette 2.00 mL instead and recalculate: 2.00 × 1012 ÷ 100 = 20.24 µg/mL.",
        "Use 20.24 µg/mL in your calculations; it is 1.2% above the nominal 20 µg/mL.",
      ],
    },
  ],

  limitations: [
    "The calculations here assume ideal behaviour: complete dissolution, conservation of solute, and (for volume-based mixing) additive volumes. Real solutions can deviate, notably ethanol–water mixtures and concentrated solutions.",
    "ppm ≈ mg/L applies only to dilute aqueous solutions with a density close to 1 g/mL. For anything else, convert through the density or keep ppm as a strict mass fraction.",
    "This guide teaches the arithmetic for coursework and practicals. In a laboratory, a validated analytical method or an official pharmacopoeial monograph takes precedence over any general procedure described here.",
    "The drug examples use illustrative values chosen for the arithmetic. They are not dosing advice, and clinical preparation of medicines must follow approved protocols, product information and the supervising pharmacist.",
  ],

  refs: ["ansel16", "martin8", "iupacGoldBook", "bipmSI"],

  relatedTools: [
    {
      slug: "dilution-calculator",
      name: "Dilution Calculator (C₁V₁ = C₂V₂)",
      why: "Solves C₁V₁ = C₂V₂ for any missing term and shows the diluent volume and dilution factor, as in the C₁V₁ = C₂V₂ section.",
    },
    {
      slug: "serial-dilution-calculator",
      name: "Serial Dilution Calculator",
      why: "Plans multi-step dilutions, multiplying the step factors and giving each tube's concentration and transfer volumes.",
    },
    {
      slug: "mg-ml-to-molarity-calculator",
      name: "mg/mL ↔ Molarity Calculator",
      why: "Converts mg/mL to M, mM and µM by dividing by the molar mass, the conversion used in Examples 1 and 2.",
    },
    {
      slug: "mass-molarity-calculator",
      name: "Mass–Molarity Calculator",
      why: "Gives molarity from the mass weighed, the molar mass and the final volume — the stock-solution calculation.",
    },
  ],

  relatedGuides: ["accuracy-precision-recovery", "dose-calculations", "reaction-kinetics-drug-stability"],

  meta: {
    author: TEAM_AUTHOR,
    review: { status: "team-checked", checkedOn: "2026-10-12" },
    updated: "2026-10-12",
  },
};
