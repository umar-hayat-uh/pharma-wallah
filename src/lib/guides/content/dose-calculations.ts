import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * Every number in the examples and practice answers below was recomputed
 * independently in Python before publishing (content-review policy). All drugs
 * are named "Drug A", "Drug B"… and every dose is illustrative: this guide
 * teaches the arithmetic, never a dose to give.
 */
export const guide: Guide = {
  slug: "dose-calculations",
  title: "Pharmaceutical Dose Calculations: Units, Body Weight and Body Surface Area",
  description:
    "Work dose calculations step by step: metric units, dimensional analysis, mg/kg and mg/m² dosing, volume to give, IV infusion and drip rates.",
  category: "Pharmaceutical Calculations",
  objectives: [
    "Convert confidently between kg, g, mg, µg and ng, and between L, mL and µL, and explain why a µg/mg mix-up is a 1000-fold error.",
    "Set up any dose problem by dimensional analysis (the factor-label method), so the units tell you whether the answer is right.",
    "Calculate weight-based doses (mg/kg per dose and mg/kg/day divided into doses) and the volume to measure from a stated concentration.",
    "Calculate body surface area with the Mosteller formula and use it for mg/m² dosing.",
    "Calculate IV infusion rates in mL/h and gravity drip rates in drops per minute, and explain the role of displacement value in reconstitution.",
    "Check any answer for plausibility before it is used: estimate first, follow the units, and double-check independently.",
  ],
  intro: [
    "Almost every error in a dose calculation is an error of units, not of arithmetic. A student who multiplies 15 by 68 correctly but writes the result in micrograms instead of milligrams has produced an answer that is a thousand times wrong, and the multiplication will look perfect on paper. That is why this guide spends as much time on units and on checking as it does on formulas.",
    "We cover the metric units used in pharmacy, the factor-label method that ties every calculation together, dosing by body weight and by body surface area, working out how much liquid to measure, IV infusion and drip rates, and reconstitution of powders. Each idea has a worked example, and the practice questions at the end have full working so you can check yourself.",
    "All drugs here are called Drug A, Drug B and so on, and every dose is illustrative. The numbers are chosen to make the arithmetic clear. They are not doses for any real medicine and must never be used as such.",
  ],
  terms: [
    {
      term: "Dose",
      definition:
        "The amount of drug given at one time (for example 340 mg). Always pair it with a frequency: a dose without 'how often' is incomplete.",
    },
    {
      term: "Daily dose",
      definition:
        "The total amount given over 24 hours. A daily dose divided into three doses means each dose is one third of the daily total.",
    },
    {
      term: "Weight-based dose (mg/kg)",
      definition:
        "A dose stated per kilogram of body weight. It may be per dose (mg/kg) or per day (mg/kg/day); the two differ by the number of doses per day.",
    },
    {
      term: "Body surface area (BSA)",
      definition:
        "An estimate of the outer surface area of the body in square metres (m²), calculated from height and weight. Used where a dose is stated in mg/m².",
    },
    {
      term: "Concentration",
      definition:
        "The amount of drug in a stated volume, for example 50 mg/mL or 250 mg/5 mL. It is the bridge between a dose in milligrams and a volume in millilitres.",
    },
    {
      term: "Dimensional analysis (factor-label method)",
      definition:
        "Solving a problem by multiplying the starting quantity by conversion factors written as fractions, so that unwanted units cancel and only the wanted unit remains.",
    },
    {
      term: "Infusion rate",
      definition:
        "How fast an IV fluid runs, usually in mL/h for a pump. It can also be described as a drug rate, such as mg/h or µg/kg/min.",
    },
    {
      term: "Drop factor",
      definition:
        "The number of drops that make 1 mL in a given gravity giving set (gtt/mL). It is printed on the set's packaging; common values are 10, 15, 20 and 60 gtt/mL.",
    },
    {
      term: "Displacement value",
      definition:
        "The volume a dry powder occupies once dissolved. Adding diluent to a powder gives a final volume larger than the diluent alone, which changes the concentration.",
    },
  ],
  sections: [
    {
      id: "units",
      heading: "Metric units and prefixes",
      blocks: [
        {
          kind: "p",
          text: "Pharmacy uses the metric (SI) system. Mass is measured in grams and their multiples and fractions; volume in litres and their fractions. Each prefix means a fixed power of ten, so every conversion between neighbouring units in the table below is a factor of 1000.",
        },
        {
          kind: "table",
          caption: "Common mass and volume units in dose calculations",
          head: ["Unit", "Symbol", "Value", "Neighbour"],
          rows: [
            ["kilogram", "kg", "10³ g", "1 kg = 1000 g"],
            ["gram", "g", "1 g", "1 g = 1000 mg"],
            ["milligram", "mg", "10⁻³ g", "1 mg = 1000 µg"],
            ["microgram", "µg (often written mcg)", "10⁻⁶ g", "1 µg = 1000 ng"],
            ["nanogram", "ng", "10⁻⁹ g", "—"],
            ["litre", "L", "1 L", "1 L = 1000 mL"],
            ["millilitre", "mL", "10⁻³ L", "1 mL = 1000 µL"],
            ["microlitre", "µL", "10⁻⁶ L", "—"],
          ],
        },
        {
          kind: "p",
          text: "To move to a smaller unit (g to mg), multiply by 1000: the number gets bigger because the units are smaller. To move to a larger unit (mg to g), divide by 1000. Moving two steps (g to µg) is a factor of 1000 × 1000 = 1,000,000.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Why µg and mg errors are so dangerous",
          text: "A milligram is a thousand micrograms. If a dose meant as 250 µg is read or written as 250 mg, the patient receives a thousand times the intended amount; the reverse error gives a thousandth. Because 'µ' is easily misread by hand, many hospitals require 'mcg' to be written out, and never 'µg' or 'ug' on handwritten orders. Always write the unit next to every number, at every step.",
        },
        {
          kind: "example",
          title: "Example 1: converting between prefixes",
          problem: "Convert 0.25 mg to micrograms, 1500 µg to milligrams, and 0.5 g to micrograms.",
          steps: [
            "mg to µg is one step smaller, so multiply by 1000: 0.25 mg × 1000 µg/mg = 250 µg.",
            "µg to mg is one step larger, so divide by 1000: 1500 µg ÷ 1000 µg/mg = 1.5 mg.",
            "g to µg is two steps smaller, so multiply by 1000 × 1000: 0.5 g × 1,000,000 µg/g = 500,000 µg.",
          ],
          answer: "250 µg; 1.5 mg; 500,000 µg.",
          note: "Check the direction: going to a smaller unit must give a bigger number.",
        },
      ],
    },
    {
      id: "dimensional-analysis",
      heading: "Dimensional analysis: the one technique for every problem",
      blocks: [
        {
          kind: "p",
          text: "Dimensional analysis treats units as things that multiply and cancel, just like numbers. Every conversion factor is a fraction equal to one (1000 mg / 1 g is the same quantity on top and bottom), so multiplying by it changes the units without changing the amount. You arrange the fractions so that each unwanted unit appears once on top and once on the bottom, cancel them, and check that the unit left over is the one the question asks for.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Write down what you want, with its unit (for example: mL per dose).",
            "Write down what you are given, with units (weight in kg, dose in mg/kg, concentration in mg/mL).",
            "Start from the quantity that already has one of the wanted units, or from the patient's weight.",
            "Multiply by conversion factors written as fractions, arranged so units cancel.",
            "Cancel units, then do the arithmetic. If the remaining unit is not the one you wanted, the set-up is wrong — fix it before calculating.",
          ],
        },
        {
          kind: "formula",
          expr: "Volume (mL) = dose (mg) × 1 mL / concentration (mg)  =  dose ÷ concentration",
          where: [
            { sym: "dose", meaning: "the amount to give, in mg" },
            { sym: "concentration", meaning: "the strength of the liquid, in mg/mL" },
          ],
          note: "The mg cancel, leaving mL. If the strength is given per 5 mL, either convert it to mg/mL first or keep the 5 mL in the fraction.",
        },
        {
          kind: "p",
          text: "The same pattern solves conversions, weight-based doses, infusion rates and drip rates. Once the units cancel to the right answer, the numbers almost take care of themselves.",
        },
      ],
    },
    {
      id: "weight-based",
      heading: "Weight-based dosing (mg/kg)",
      blocks: [
        {
          kind: "p",
          text: "Many doses are stated per kilogram of body weight. The first question to ask is always: is this per dose or per day? 'mg/kg' alone usually means per dose; 'mg/kg/day' is a daily total that must then be divided by the number of doses in the day.",
        },
        {
          kind: "formula",
          expr: "Daily dose (mg) = weight (kg) × dose rate (mg/kg/day);   Dose per administration = daily dose ÷ number of doses per day",
        },
        {
          kind: "p",
          text: "Weight must be in kilograms. If a weight is given in pounds, convert first: 1 kg = 2.2046 lb, so kg = lb ÷ 2.2046 (2.2 is a common approximation).",
        },
        {
          kind: "example",
          title: "Example 2: mg/kg/day divided into doses, then volume to give",
          problem:
            "An adult weighs 68 kg. Drug A is prescribed at an illustrative 15 mg/kg/day, divided every 8 hours. Drug A is available as an oral suspension of 250 mg/5 mL. Find the daily dose, the dose per administration and the volume per dose.",
          steps: [
            "Daily dose = 68 kg × 15 mg/kg/day = 1020 mg/day.",
            "Every 8 hours means 24 ÷ 8 = 3 doses a day, so each dose = 1020 mg ÷ 3 = 340 mg.",
            "Concentration = 250 mg ÷ 5 mL = 50 mg/mL.",
            "Volume = 340 mg ÷ 50 mg/mL = 6.8 mL (mg cancel, mL remain).",
          ],
          answer: "1020 mg/day; 340 mg per dose; 6.8 mL per dose.",
          note: "Estimate: 15 × 70 ≈ 1050 mg a day, about 350 mg a dose — 340 mg is consistent. Illustrative figures only.",
        },
        {
          kind: "example",
          title: "Example 3: converting pounds to kilograms",
          problem: "A weight is recorded as 154 lb. Convert it to kilograms before using it in a mg/kg calculation.",
          steps: [
            "kg = lb ÷ 2.2046 = 154 ÷ 2.2046 = 69.85 kg.",
            "With the approximation 2.2, 154 ÷ 2.2 = 70.0 kg; the difference is about 0.2%.",
          ],
          answer: "About 69.9 kg (70 kg with the 2.2 approximation).",
          note: "Using 154 as if it were kilograms would more than double every weight-based dose.",
        },
      ],
    },
    {
      id: "bsa",
      heading: "Body surface area and mg/m² dosing",
      blocks: [
        {
          kind: "p",
          text: "Some drugs, especially in oncology, are dosed per square metre of body surface area, because BSA tracks some physiological measures more closely than weight alone. BSA cannot be measured easily, so it is estimated from height and weight. Several formulas exist; the Mosteller formula is widely used because it is simple.",
        },
        {
          kind: "formula",
          expr: "BSA (m²) = √( height (cm) × weight (kg) ÷ 3600 )",
          where: [
            { sym: "height", meaning: "in centimetres" },
            { sym: "weight", meaning: "in kilograms" },
          ],
          note: "Mosteller formula. Height must be in cm and weight in kg; other units give a wrong BSA. The 3600 is part of the formula, not a unit conversion you can drop.",
        },
        {
          kind: "formula",
          expr: "Dose (mg) = BSA (m²) × dose rate (mg/m²)",
        },
        {
          kind: "example",
          title: "Example 4: BSA by Mosteller, then a mg/m² dose",
          problem:
            "A patient is 170 cm tall and weighs 65 kg. Drug B is prescribed at an illustrative 75 mg/m². Calculate BSA and the dose.",
          steps: [
            "Height × weight = 170 × 65 = 11,050.",
            "11,050 ÷ 3600 = 3.0694.",
            "BSA = √3.0694 = 1.752 m² (1.75 m² to two decimals).",
            "Dose = 1.752 m² × 75 mg/m² = 131.4 mg. Using the rounded 1.75 m² gives 131.25 mg.",
          ],
          answer: "BSA ≈ 1.75 m²; dose ≈ 131 mg (131.4 mg unrounded).",
          note: "For scale, the same formula gives 1.44 m² for a 150 cm, 50 kg adult and 2.15 m² for a 185 cm, 90 kg adult, so 1.75 m² is plausible. State how you rounded: rounding BSA before multiplying changes the last figure.",
        },
      ],
    },
    {
      id: "infusions",
      heading: "IV infusion rates and drip rates",
      blocks: [
        {
          kind: "p",
          text: "An infusion pump is set in mL/h. If the prescription gives a drug rate (mg/h), convert it to a volume rate using the concentration of the bag. If the line runs by gravity, the nurse counts drops per minute, which depends on the giving set's drop factor.",
        },
        {
          kind: "formula",
          expr: "Pump rate (mL/h) = drug rate (mg/h) ÷ concentration (mg/mL)",
        },
        {
          kind: "formula",
          expr: "Drip rate (drops/min) = volume (mL) × drop factor (drops/mL) ÷ time (min)",
          where: [
            { sym: "drop factor", meaning: "from the giving set packaging, e.g. 20 drops/mL" },
            { sym: "time", meaning: "total infusion time converted to minutes" },
          ],
          note: "Drops cannot be split, so the result is rounded to a whole number for counting.",
        },
        {
          kind: "example",
          title: "Example 5: pump rate and gravity drip rate",
          problem:
            "(a) Drug C is to run at an illustrative 120 mg/h from a bag containing 500 mg in 250 mL. What pump rate is needed? (b) 1000 mL of fluid is to run over 8 hours through a set with a drop factor of 20 drops/mL. What is the drip rate?",
          steps: [
            "(a) Concentration = 500 mg ÷ 250 mL = 2 mg/mL.",
            "(a) Pump rate = 120 mg/h ÷ 2 mg/mL = 60 mL/h (mg cancel, mL/h remain).",
            "(b) Time = 8 h × 60 min/h = 480 min.",
            "(b) Drip rate = 1000 mL × 20 drops/mL ÷ 480 min = 41.67 drops/min, counted as about 42 drops/min.",
            "(b) As a check, the same infusion on a pump would be 1000 mL ÷ 8 h = 125 mL/h.",
          ],
          answer: "(a) 60 mL/h; (b) about 42 drops/min.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "A quick drip-rate shortcut",
          text: "With a 60 drops/mL (micro-drip) set, drops per minute equals mL per hour, because the 60 drops per mL and the 60 minutes per hour cancel. It is a useful cross-check, but only for that set.",
        },
      ],
    },
    {
      id: "reconstitution",
      heading: "Reconstitution and displacement value",
      blocks: [
        {
          kind: "p",
          text: "Many injections are supplied as dry powder in a vial and dissolved (reconstituted) before use. The powder itself takes up space once dissolved. So if you add 10 mL of water to a vial, the final volume is more than 10 mL, and the concentration is lower than 'drug ÷ 10 mL'. The extra volume is the displacement value, which the manufacturer states in the product information.",
        },
        {
          kind: "formula",
          expr: "Final volume = diluent volume + displacement volume;   Concentration = amount in vial ÷ final volume",
          note: "To reach a chosen concentration, diluent = (amount ÷ target concentration) − displacement volume.",
        },
        {
          kind: "example",
          title: "Example 6: why displacement matters",
          problem:
            "A vial contains 1 g (1000 mg) of Drug D powder with an illustrative displacement value of 0.4 mL. You add 9.6 mL of diluent. What is the concentration, and what volume gives an illustrative 750 mg dose? What happens if displacement is ignored?",
          steps: [
            "Final volume = 9.6 mL + 0.4 mL = 10.0 mL.",
            "Concentration = 1000 mg ÷ 10.0 mL = 100 mg/mL.",
            "Volume for 750 mg = 750 mg ÷ 100 mg/mL = 7.5 mL.",
            "If displacement is ignored, the concentration is wrongly taken as 1000 mg ÷ 9.6 mL = 104.17 mg/mL, and the volume as 750 ÷ 104.17 = 7.2 mL.",
            "But 7.2 mL of the real 100 mg/mL solution contains only 720 mg — a 4% underdose.",
          ],
          answer: "100 mg/mL; 7.5 mL for 750 mg.",
          note: "Displacement values differ between products and even between brands of the same drug. Always take them from the product's own information.",
        },
      ],
    },
    {
      id: "plausibility",
      heading: "Checking an answer before it is used",
      blocks: [
        {
          kind: "p",
          text: "A correct method can still produce a wrong answer if a digit is mistyped or a unit slips. Professional practice relies on habits that catch these errors before they reach a patient.",
        },
        {
          kind: "list",
          items: [
            "Estimate first. Round the numbers (68 kg ≈ 70 kg, 1.752 m² ≈ 1.75 m²) and work out the answer roughly in your head. If your calculated answer is far from the estimate, find out why.",
            "Follow the units. Write a unit beside every number. If they do not cancel to the unit the question asks for, the set-up is wrong.",
            "Ask whether the result is physically sensible. Could this volume be measured with an oral syringe or drawn from this vial? Would a patient swallow this many tablets? A dose of 34 tablets or 68 mL from a single 10 mL vial signals an error.",
            "Compare with the usual range in the product's approved information. An answer outside it needs checking, not giving.",
            "Double-check independently. Work it again from the start, preferably by a different route, or have a colleague calculate it without seeing your answer.",
          ],
        },
        {
          kind: "callout",
          tone: "caution",
          title: "This guide teaches arithmetic, not dosing",
          text: "Every dose in this guide is illustrative. Real doses come from the product's approved labelling or the relevant formulary, prescribed by a prescriber and checked by a pharmacist. Paediatric, neonatal, renal, hepatic, obese-patient and oncology dosing all have extra rules — dose caps, choice of weight, adjustments for organ function, capped BSA and protocol checks — that this guide does not cover.",
        },
      ],
    },
  ],
  mistakes: [
    "Using trailing zeros or missing leading zeros: '5.0 mg' can be misread as 50 mg, and '.5 mg' as 5 mg. Write 5 mg and 0.5 mg — never a trailing zero after the decimal point, always a zero before it.",
    "Confusing mg and µg (mcg), which produces a 1000-fold error. Write the unit next to every number and spell out 'mcg' on handwritten work.",
    "Using a weight in pounds as if it were kilograms. 154 lb is about 69.9 kg; treating it as 154 kg more than doubles every weight-based dose.",
    "Treating mg/kg/day as mg/kg per dose. A 15 mg/kg/day order given every 8 hours means 5 mg/kg per dose; giving 15 mg/kg three times a day triples the intended daily amount.",
    "Measuring the total daily dose as a single dose, or forgetting to divide by the number of doses — always state both the daily total and the per-dose amount.",
    "Mixing up drop factors: using 20 drops/mL when the set is a 60 drops/mL micro-drip set gives a drip rate three times too slow. Read the drop factor from the giving set actually in use, and convert hours to minutes.",
    "Putting the wrong units into the BSA formula, such as height in metres or weight in pounds. Mosteller needs centimetres and kilograms; 1.70 m instead of 170 cm gives a BSA ten times too small.",
    "Ignoring displacement value when reconstituting, which makes the concentration — and every volume drawn from the vial — wrong.",
  ],
  practice: [
    {
      q: "Convert 0.075 mg to micrograms, and 3.5 g to milligrams.",
      answer: "75 µg; 3500 mg.",
      working: [
        "mg to µg: multiply by 1000. 0.075 × 1000 = 75 µg.",
        "g to mg: multiply by 1000. 3.5 × 1000 = 3500 mg.",
      ],
    },
    {
      q: "An adult weighs 80 kg. Drug E is prescribed at an illustrative 10 mg/kg/day, divided every 12 hours. What is each dose?",
      answer: "400 mg per dose (800 mg/day).",
      working: [
        "Daily dose = 80 kg × 10 mg/kg/day = 800 mg/day.",
        "Every 12 hours = 24 ÷ 12 = 2 doses a day.",
        "Each dose = 800 mg ÷ 2 = 400 mg.",
      ],
    },
    {
      q: "An illustrative dose of 375 mg of Drug F is needed from a suspension labelled 125 mg/5 mL. What volume should be measured?",
      answer: "15 mL.",
      working: [
        "Concentration = 125 mg ÷ 5 mL = 25 mg/mL.",
        "Volume = 375 mg ÷ 25 mg/mL = 15 mL.",
        "Check: 375 is three times 125, so the volume is three times 5 mL = 15 mL.",
      ],
    },
    {
      q: "A patient is 160 cm tall and weighs 55 kg. Calculate the BSA by Mosteller and the dose of Drug G at an illustrative 50 mg/m².",
      answer: "BSA ≈ 1.56 m²; dose ≈ 78.2 mg.",
      working: [
        "160 × 55 = 8800.",
        "8800 ÷ 3600 = 2.4444.",
        "BSA = √2.4444 = 1.5635 m², or 1.56 m² to two decimals.",
        "Dose = 1.5635 m² × 50 mg/m² = 78.2 mg (using the rounded 1.56 m² gives 78.0 mg).",
      ],
    },
    {
      q: "100 mL is to be infused over 30 minutes through a set with a drop factor of 15 drops/mL. Find the drip rate and the equivalent pump rate.",
      answer: "50 drops/min; 200 mL/h.",
      working: [
        "Drip rate = 100 mL × 15 drops/mL ÷ 30 min = 1500 ÷ 30 = 50 drops/min.",
        "Pump rate = 100 mL ÷ 0.5 h = 200 mL/h.",
      ],
    },
    {
      q: "Drug H is to run at an illustrative 3 µg/kg/min for a 70 kg patient. The bag contains 400 mg in 250 mL. What pump rate in mL/h is needed?",
      answer: "About 7.9 mL/h (7.875 mL/h).",
      working: [
        "Drug rate = 3 µg/kg/min × 70 kg = 210 µg/min.",
        "Per hour = 210 µg/min × 60 min/h = 12,600 µg/h.",
        "Concentration = 400 mg ÷ 250 mL = 1.6 mg/mL = 1600 µg/mL (convert mg to µg so the units match).",
        "Pump rate = 12,600 µg/h ÷ 1600 µg/mL = 7.875 mL/h.",
      ],
    },
    {
      q: "A classmate calculates a dose of Drug J at an illustrative 20 mg/kg for a 60 kg patient as 12 g. Is this plausible? What is the correct dose?",
      answer: "No — the correct dose is 1200 mg (1.2 g).",
      working: [
        "Estimate: 20 × 60 = 1200, and the unit is mg because the dose rate is in mg/kg.",
        "1200 mg = 1.2 g, not 12 g: the classmate slipped a factor of 10 when converting mg to g.",
        "Divide by 1000 to go from mg to g: 1200 ÷ 1000 = 1.2 g.",
      ],
    },
  ],
  limitations: [
    "Every dose and displacement value here is illustrative. Real doses, maximum doses and displacement values come from the product's approved labelling or formulary, and are decided by a prescriber and checked by a pharmacist.",
    "Paediatric and neonatal dosing has extra rules (dose caps, age bands, which weight to use) that are not covered here, and simple scaling from an adult dose is not a substitute.",
    "Renal and hepatic impairment, obesity (actual, ideal or adjusted body weight) and oncology protocols (BSA caps, dose banding) change doses in ways this guide does not teach.",
    "Mosteller is one of several BSA formulas; different formulas give slightly different values, and the choice of formula is set by local protocol.",
    "Drip rates by gravity are approximate: drop size varies with the fluid and the set, which is why pumps are used where accuracy matters.",
  ],
  refs: ["ansel16", "bipmSI", "mosteller1987", "aulton6"],
  relatedTools: [
    {
      slug: "bsa-calculator",
      name: "BSA Calculator",
      why: "Calculates BSA by Mosteller (√(cm × kg ÷ 3600)), as in this guide, and multiplies by a mg/m² dose; also shows other BSA formulas for comparison.",
    },
    {
      slug: "iv-drip-rate-calculator",
      name: "IV Drip Rate Calculator",
      why: "Uses the same drip-rate formula (volume × drop factor ÷ minutes) and also gives the equivalent pump rate in mL/h.",
    },
    {
      slug: "reconstitution-calculator",
      name: "Reconstitution & IV Compounding Calculator",
      why: "Adds displacement volume to diluent to find the concentration, then the volume to withdraw for a dose and the pump rate — the steps in the reconstitution section.",
    },
  ],
  relatedGuides: ["dilution-and-concentration", "pharmacokinetic-parameters", "accuracy-precision-recovery"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "team-checked", checkedOn: "2026-10-12" },
    updated: "2026-10-12",
  },
};
