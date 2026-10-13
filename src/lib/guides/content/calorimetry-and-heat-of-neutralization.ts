import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * Calorimetry and the Heat of Neutralization (q = m·c·ΔT).
 *
 * DRAFT (2026-10-13): not listed, not in the sitemap. Every figure in the
 * examples, tables and practice answers was recomputed with python3 on
 * 2026-10-13. Temperatures are illustrative readings for practising the
 * arithmetic. The guide deliberately quotes no literature value for the
 * enthalpy of neutralization beyond "close to −57 kJ/mol" — a reviewer should
 * attach the textbook value the course uses (see
 * content/briefs/calorimetry-and-heat-of-neutralization.md).
 *
 * `heat-formation-calculator` is not linked: despite its name it computes a
 * heat of solution (van 't Hoff), not a heat of formation.
 */
export const guide: Guide = {
  slug: "calorimetry-and-heat-of-neutralization",
  title: "Calorimetry and the Heat of Neutralization (q = m·c·ΔT)",
  description:
    "How a coffee-cup calorimeter measures heat, q = m·c·ΔT, the molar enthalpy of neutralization with its sign, limiting reactants and the calorimeter constant.",
  category: "Pharmaceutical Chemistry",

  objectives: [
    "Calculate the heat absorbed by a solution from its mass, specific heat capacity and temperature change using q = m·c·ΔT.",
    "Calculate the molar enthalpy of neutralization from a calorimetry run, with the correct sign and units.",
    "Identify the limiting reactant and the moles of water formed, including for a diprotic acid.",
    "Determine a calorimeter constant by the method of mixtures and use it to correct a result.",
    "Explain the sources of error in simple calorimetry and why measured values are usually smaller than literature values.",
  ],

  intro: [
    "When an acid and a base are mixed, the solution warms up. The reaction H⁺ + OH⁻ → H₂O releases energy, and that energy goes into heating the water around it. Measure how much the temperature rises, know how much liquid was heated and how much heat it takes to warm it, and you have measured the energy released by the reaction. That is calorimetry, and the heat of neutralization practical is usually the first time pharmacy students meet it.",
    "The same idea reaches well beyond acids and bases. Calorimetry measures the heat of dissolving a salt, which explains why some solutions cool as they are made; differential scanning calorimetry, a key technique for studying polymorphs and drug–excipient compatibility, rests on the same principle of tracking heat flow. Getting the simple coffee-cup version right builds the habits you need for all of them: consistent units, careful signs and honest treatment of heat losses.",
    "The readings in the examples are illustrative values for practising the arithmetic. Your practical manual's procedure and data take precedence.",
  ],

  terms: [
    {
      term: "System and surroundings",
      definition:
        "The system is the reaction itself (the acid and base reacting); the surroundings are everything else, mainly the water the reactants are dissolved in. The calorimeter measures heat gained or lost by the surroundings.",
    },
    {
      term: "Heat (q)",
      definition:
        "Energy transferred because of a temperature difference, in joules (J). 1 kJ = 1000 J.",
    },
    {
      term: "Specific heat capacity (c)",
      definition:
        "The heat needed to raise 1 g of a substance by 1 °C, in J/(g·°C). For water and dilute aqueous solutions about 4.18 J/(g·°C) is used.",
    },
    {
      term: "Temperature change (ΔT)",
      definition:
        "Final temperature minus initial temperature. A change of 1 °C is the same size as a change of 1 K, so ΔT has the same value in either unit.",
    },
    {
      term: "Exothermic and endothermic",
      definition:
        "An exothermic process releases heat to the surroundings (the solution warms; ΔH is negative). An endothermic process absorbs heat (the solution cools; ΔH is positive).",
    },
    {
      term: "Enthalpy change (ΔH)",
      definition:
        "The heat exchanged at constant pressure, usually given per mole of reaction in kJ/mol. For neutralization it is quoted per mole of water formed.",
    },
    {
      term: "Enthalpy of neutralization",
      definition:
        "The enthalpy change when an acid and a base react to form one mole of water. For dilute strong acids with strong bases it is close to −57 kJ/mol, because the reaction in every case is H⁺ + OH⁻ → H₂O.",
    },
    {
      term: "Calorimeter constant (heat capacity of the calorimeter)",
      definition:
        "The heat, in J/°C, absorbed by the cup, stirrer and thermometer for each degree the contents change. A coffee cup's is small but not zero.",
    },
  ],

  sections: [
    {
      id: "q-mc-delta-t",
      heading: "The heat equation q = m·c·ΔT",
      blocks: [
        {
          kind: "p",
          text: "The heat needed to warm something depends on three things: how much of it there is, what it is made of, and how far its temperature changes. Twice the mass needs twice the heat; water needs far more heat per gram than a metal does; and warming by 10 °C takes ten times as much heat as warming by 1 °C. Multiplying the three together gives the heat.",
        },
        {
          kind: "formula",
          expr: "q = m × c × ΔT",
          where: [
            { sym: "q", meaning: "heat absorbed by the solution (J)" },
            { sym: "m", meaning: "mass of the solution (g) — the combined mass of the acid and base solutions" },
            { sym: "c", meaning: "specific heat capacity of the solution (J/(g·°C)), taken as 4.18 for dilute aqueous solutions" },
            { sym: "ΔT", meaning: "final temperature − initial temperature (°C or K)" },
          ],
          note: "Volumes are usually converted to mass by assuming a density of 1.00 g/mL for dilute aqueous solutions: 100 mL ≈ 100 g.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Use the total mass",
          text: "The heat warms the whole mixture, so m is the mass of acid solution plus base solution, not just one of them, and not the mass of the dissolved acid alone.",
        },
      ],
    },
    {
      id: "enthalpy-of-neutralization",
      heading: "From heat to molar enthalpy of neutralization",
      blocks: [
        {
          kind: "p",
          text: "q tells you how much heat the solution gained. To compare experiments of different sizes, divide by the amount of reaction: the moles of water formed. And because the heat the solution gained is heat the reaction gave out, the enthalpy change of the reaction has the opposite sign.",
        },
        {
          kind: "formula",
          expr: "ΔH(neutralization) = −q ÷ n(water)      in kJ/mol, with q converted to kJ",
          where: [
            { sym: "q", meaning: "heat absorbed by the solution (J ÷ 1000 = kJ)" },
            { sym: "n(water)", meaning: "moles of water formed = moles of the limiting reactant's H⁺ or OH⁻" },
            { sym: "−", meaning: "the solution warmed (q positive), so the reaction released heat: ΔH negative" },
          ],
          note: "Moles from a solution: n = concentration (mol/L) × volume (L). 50 mL of 1.0 M is 1.0 × 0.050 = 0.050 mol.",
        },
        {
          kind: "example",
          title: "Example 1: Hydrochloric acid and sodium hydroxide",
          problem:
            "50.0 mL of 1.0 M HCl and 50.0 mL of 1.0 M NaOH, both at 22.0 °C, are mixed in a polystyrene cup. The highest temperature reached is 28.7 °C. Find q and ΔH of neutralization. Take the density as 1.00 g/mL and c = 4.18 J/(g·°C).",
          steps: [
            "m = 50.0 + 50.0 = 100 g; ΔT = 28.7 − 22.0 = 6.7 °C.",
            "q = 100 × 4.18 × 6.7 = 2800.6 J = 2.8006 kJ.",
            "n(HCl) = n(NaOH) = 1.0 × 0.0500 = 0.0500 mol, so 0.0500 mol of water forms.",
            "ΔH = −2.8006 ÷ 0.0500 = −56.0 kJ/mol.",
          ],
          answer: "q ≈ 2.80 kJ; ΔH ≈ −56.0 kJ/mol of water formed.",
          note: "The result is slightly smaller in size than the commonly quoted value close to −57 kJ/mol, as expected: some heat escapes and the cup itself absorbs some.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Keep the sign",
          text: "A warming solution means an exothermic reaction, so ΔH is written with a minus sign. Some calculators, including the one linked from this guide, report the molar value with the sign of the temperature change (positive when the mixture warms). When you write up the practical, give ΔH as negative.",
        },
      ],
    },
    {
      id: "limiting-reactant",
      heading: "Limiting reactants and diprotic acids",
      blocks: [
        {
          kind: "p",
          text: "Only as much water forms as the smaller amount of H⁺ or OH⁻ allows. If one solution is in excess, the extra simply goes along for the ride: it adds to the mass being heated but does not react. So always work out the moles of H⁺ and OH⁻ separately and divide by the smaller.",
        },
        {
          kind: "list",
          items: [
            "Monoprotic acid (HCl, HNO₃, CH₃COOH): moles of H⁺ = moles of acid.",
            "Diprotic acid (H₂SO₄): moles of H⁺ = 2 × moles of acid, when both protons are neutralized.",
            "Monobasic base (NaOH, KOH): moles of OH⁻ = moles of base.",
            "Water formed = the smaller of moles of H⁺ and moles of OH⁻.",
          ],
        },
        {
          kind: "example",
          title: "Example 2: Sulfuric acid",
          problem:
            "25.0 mL of 1.0 M H₂SO₄ is mixed with 50.0 mL of 1.0 M NaOH. The temperature rises by 8.6 °C. Find ΔH per mole of water formed (density 1.00 g/mL, c = 4.18 J/(g·°C)).",
          steps: [
            "n(H⁺) = 2 × 1.0 × 0.0250 = 0.0500 mol; n(OH⁻) = 1.0 × 0.0500 = 0.0500 mol. Neither is in excess; 0.0500 mol of water forms.",
            "m = 25.0 + 50.0 = 75 g.",
            "q = 75 × 4.18 × 8.6 = 2696.1 J = 2.6961 kJ.",
            "ΔH = −2.6961 ÷ 0.0500 = −53.9 kJ/mol of water.",
          ],
          answer: "ΔH ≈ −53.9 kJ per mole of water formed.",
          note: "Quote the value per mole of water, not per mole of H₂SO₄ (which would be twice as large), unless the question asks otherwise.",
        },
      ],
    },
    {
      id: "calorimeter-constant",
      heading: "Correcting for the calorimeter",
      blocks: [
        {
          kind: "p",
          text: "Some of the heat released warms the cup, the thermometer and the stirrer rather than the solution. The calorimeter constant, C_cal, measures how much. A common way to find it is the method of mixtures: mix known masses of hot and cold water in the calorimeter. The heat lost by the hot water should equal the heat gained by the cold water; any shortfall went into the calorimeter.",
        },
        {
          kind: "formula",
          expr: "C_cal = [m_hot × c × (T_hot − T_final) − m_cold × c × (T_final − T_cold)] ÷ (T_final − T_cold)      q(corrected) = (m × c + C_cal) × ΔT",
          where: [
            { sym: "C_cal", meaning: "calorimeter constant (J/°C)" },
            { sym: "m_hot, m_cold", meaning: "masses of hot and cold water (g)" },
            { sym: "T_hot, T_cold, T_final", meaning: "starting temperatures and the final mixed temperature (°C)" },
          ],
          note: "The calorimeter starts at the cold-water temperature and ends at the final temperature, so it warms by T_final − T_cold.",
        },
        {
          kind: "example",
          title: "Example 3: Finding the calorimeter constant",
          problem:
            "50.0 g of water at 20.0 °C is in the calorimeter. 50.0 g of water at 45.0 °C is added, and the mixture settles at 32.0 °C. Find C_cal.",
          steps: [
            "Heat lost by hot water = 50.0 × 4.18 × (45.0 − 32.0) = 2717 J.",
            "Heat gained by cold water = 50.0 × 4.18 × (32.0 − 20.0) = 2508 J.",
            "Heat gained by the calorimeter = 2717 − 2508 = 209 J.",
            "C_cal = 209 ÷ (32.0 − 20.0) = 17.4 J/°C.",
          ],
          answer: "C_cal ≈ 17.4 J/°C.",
        },
        {
          kind: "example",
          title: "Example 4: Using the constant, with a reactant in excess",
          problem:
            "In the same calorimeter (C_cal = 17.4 J/°C), 50.0 mL of 1.0 M HCl is mixed with 60.0 mL of 1.0 M NaOH. The temperature rises by 5.9 °C. Find ΔH with and without the correction.",
          steps: [
            "n(H⁺) = 0.0500 mol; n(OH⁻) = 0.0600 mol. HCl is limiting: 0.0500 mol of water forms.",
            "m = 50.0 + 60.0 = 110 g; m × c = 110 × 4.18 = 459.8 J/°C.",
            "Without correction: q = 459.8 × 5.9 = 2712.8 J; ΔH = −2.7128 ÷ 0.0500 = −54.3 kJ/mol.",
            "With correction: q = (459.8 + 17.4) × 5.9 = 477.2 × 5.9 = 2815.5 J; ΔH = −2.8155 ÷ 0.0500 = −56.3 kJ/mol.",
          ],
          answer: "ΔH ≈ −56.3 kJ/mol corrected (−54.3 kJ/mol uncorrected).",
          note: "The excess NaOH still counts in the mass heated (110 g), but not in the moles of water formed.",
        },
      ],
    },
    {
      id: "good-practice",
      heading: "Errors and good practice",
      blocks: [
        {
          kind: "table",
          caption: "Common sources of error in coffee-cup calorimetry",
          head: ["Source", "Effect on the size of ΔH", "How to reduce it"],
          rows: [
            ["Heat lost to the air and bench", "Too small", "Use a lid, insulate the cup, read the maximum temperature promptly"],
            ["Heat absorbed by the cup and thermometer", "Too small", "Determine and include the calorimeter constant"],
            ["Solutions at different starting temperatures", "Either way", "Let both reach the same temperature, or use the average as T initial"],
            ["Slow mixing or a delayed reading", "Too small", "Stir steadily; record temperature against time and extrapolate back to the moment of mixing"],
            ["Assuming density 1.00 g/mL and c = 4.18", "Small either way", "Acceptable for dilute solutions; use measured values for concentrated ones"],
          ],
        },
        {
          kind: "p",
          text: "Weak acids and weak bases usually give a smaller enthalpy of neutralization than strong ones. Before the weak acid can react, it must ionise, and ionisation generally takes in some energy, which is subtracted from the heat released. That difference is a real chemical effect, not an experimental error, and is worth discussing in a practical report.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Safety",
          text: "Sodium hydroxide and concentrated acids are corrosive. Wear eye protection, add solutions carefully, and follow your practical manual's procedure and concentrations; this guide covers the calculation only.",
        },
      ],
    },
  ],

  mistakes: [
    "Using the mass of only one solution, or of the solute alone, instead of the total mass of the mixture.",
    "Forgetting to convert q from J to kJ before dividing by moles, giving a ΔH 1000 times too large.",
    "Dropping the minus sign: a solution that warms means an exothermic reaction and a negative ΔH.",
    "Dividing by the moles of the reactant in excess instead of the limiting one.",
    "Forgetting that each mole of H₂SO₄ supplies two moles of H⁺.",
    "Converting temperatures to kelvin and then subtracting 273 twice, or thinking a change of 1 °C differs from a change of 1 K.",
    "Ignoring the heat absorbed by the calorimeter and then treating the low result as the true value.",
  ],

  practice: [
    {
      q: "100 g of a dilute aqueous solution (c = 4.18 J/(g·°C)) warms by 5.5 °C. How much heat did it absorb?",
      answer: "2299 J (2.30 kJ).",
      working: ["q = m × c × ΔT = 100 × 4.18 × 5.5 = 2299 J = 2.299 kJ."],
    },
    {
      q: "25.0 mL of 2.0 M HCl and 25.0 mL of 2.0 M NaOH are mixed; the temperature rises from 21.0 °C to 34.2 °C. Find ΔH of neutralization (density 1.00 g/mL, c = 4.18 J/(g·°C)).",
      answer: "ΔH ≈ −55.2 kJ/mol.",
      working: [
        "m = 50 g; ΔT = 34.2 − 21.0 = 13.2 °C.",
        "q = 50 × 4.18 × 13.2 = 2758.8 J = 2.7588 kJ.",
        "n = 2.0 × 0.0250 = 0.0500 mol of water.",
        "ΔH = −2.7588 ÷ 0.0500 = −55.18 kJ/mol.",
      ],
    },
    {
      q: "40.0 mL of 1.0 M HCl is mixed with 50.0 mL of 1.0 M NaOH and the temperature rises by 5.9 °C. Find ΔH (density 1.00 g/mL, c = 4.18 J/(g·°C)).",
      answer: "ΔH ≈ −55.5 kJ/mol.",
      working: [
        "n(H⁺) = 0.0400 mol; n(OH⁻) = 0.0500 mol; HCl is limiting, so 0.0400 mol of water forms.",
        "m = 40.0 + 50.0 = 90 g.",
        "q = 90 × 4.18 × 5.9 = 2219.6 J = 2.2196 kJ.",
        "ΔH = −2.2196 ÷ 0.0400 = −55.49 kJ/mol.",
      ],
    },
    {
      q: "100 g of solution in a calorimeter with C_cal = 25 J/°C warms by 6.4 °C when 0.0500 mol of water is formed. Find q (corrected) and ΔH.",
      answer: "q ≈ 2835 J; ΔH ≈ −56.7 kJ/mol.",
      working: [
        "q = (m × c + C_cal) × ΔT = (100 × 4.18 + 25) × 6.4 = 443 × 6.4 = 2835.2 J.",
        "ΔH = −2.8352 ÷ 0.0500 = −56.70 kJ/mol.",
      ],
    },
    {
      q: "A mixture's temperature is recorded as 298.15 K before and 304.65 K after. What is ΔT in °C, and the heat absorbed by 100 g of solution (c = 4.18 J/(g·°C))?",
      answer: "ΔT = 6.5 °C; q = 2717 J.",
      working: [
        "ΔT = 304.65 − 298.15 = 6.5 K, which is also 6.5 °C (a degree Celsius and a kelvin are the same size).",
        "q = 100 × 4.18 × 6.5 = 2717 J.",
      ],
    },
    {
      q: "Taking an illustrative ΔH of −57 kJ/mol, what temperature rise would you expect when 0.025 mol of water is formed in 100 g of solution (c = 4.18 J/(g·°C)), ignoring heat losses?",
      answer: "About 3.4 °C.",
      working: [
        "Heat released = 0.025 × 57,000 J = 1425 J.",
        "ΔT = q ÷ (m × c) = 1425 ÷ (100 × 4.18) = 3.409 °C.",
      ],
    },
    {
      q: "40.0 g of water at 20.0 °C is in a calorimeter. 40.0 g of water at 50.0 °C is added and the mixture settles at 34.2 °C. Find the calorimeter constant (c = 4.18 J/(g·°C)).",
      answer: "C_cal ≈ 18.8 J/°C.",
      working: [
        "Heat lost by hot water = 40.0 × 4.18 × (50.0 − 34.2) = 2641.8 J.",
        "Heat gained by cold water = 40.0 × 4.18 × (34.2 − 20.0) = 2374.2 J.",
        "Heat gained by calorimeter = 2641.8 − 2374.2 = 267.5 J.",
        "C_cal = 267.5 ÷ 14.2 = 18.84 J/°C.",
      ],
    },
    {
      q: "A neutralization releases 1.85 kJ of heat into the solution while forming 0.0325 mol of water. What is ΔH of neutralization?",
      answer: "ΔH ≈ −56.9 kJ/mol.",
      working: [
        "The solution gained 1.85 kJ, so the reaction released 1.85 kJ: q(reaction) = −1.85 kJ.",
        "ΔH = −1.85 ÷ 0.0325 = −56.92 kJ/mol.",
      ],
    },
  ],

  limitations: [
    "The method assumes no heat is lost to the air and that the solution has the density and specific heat capacity of water. Both are approximations, good for dilute solutions and poor for concentrated ones.",
    "A simple cup calorimeter typically gives enthalpies somewhat smaller in size than literature values; the calorimeter constant and temperature extrapolation reduce but do not remove that bias.",
    "The value close to −57 kJ/mol applies to dilute strong acids with strong bases. Weak acids and bases, and concentrated solutions, give different values for real chemical reasons.",
    "This guide teaches the calculation for coursework. Follow your practical manual for procedure, concentrations and safety.",
  ],

  refs: ["martin8", "iupacGoldBook", "bipmSI"],

  relatedTools: [
    {
      slug: "heat-of-neutralization-calculator",
      name: "Heat Of Neutralization Calculator",
      why: "Computes q = (m_acid + m_base) × c × ΔT and q ÷ n, as in Example 1. It reports the molar value with the sign of the temperature change (positive when the mixture warms), so write ΔH as negative, and it does not include a calorimeter constant.",
    },
  ],

  relatedGuides: ["electrolyte-units-mmol-meq-mosmol", "reynolds-number-and-fluid-flow"],

  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
