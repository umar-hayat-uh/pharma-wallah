import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the BSA calculator. The worked example uses Mosteller in
 * cm and kg; the BSA (3 dp), the dose (from the unrounded BSA, 1 dp) and the
 * BMI match what the page prints, and were recomputed in Python.
 */
export const LEARN: CalcEducation = {
    workedExample: {
        title: "Mosteller BSA and a dose prescribed in mg/m²",
        scenario:
            "A protocol for Drug X is written as 250 mg/m². The patient in the exercise is 165 cm tall and weighs 60 kg. Calculate the body surface area with the Mosteller equation and the individual dose in mg.",
        given: [
            { label: "Height", value: "165 cm" },
            { label: "Weight", value: "60 kg" },
            { label: "Equation", value: "Mosteller" },
            { label: "Prescribed dose", value: "250 mg/m²" },
        ],
        steps: [
            { label: "Formula", working: "BSA = √[(height cm × weight kg) ÷ 3600]" },
            { label: "Substitute", working: "BSA = √[(165 × 60) ÷ 3600] = √(9900 ÷ 3600) = √2.75" },
            { label: "BSA", working: "BSA = 1.6583… m² → shown as 1.658 m²" },
            { label: "Individual dose", working: "Dose = 250 mg/m² × 1.6583 m² = 414.58 mg → 414.6 mg" },
            { label: "Cross-check with DuBois", working: "0.007184 × 165^0.725 × 60^0.425 = 1.659 m² (agrees within 0.1 %)" },
        ],
        answer: "BSA = 1.658 m²; individual dose = 414.6 mg.",
        interpretation:
            "The page multiplies by the unrounded BSA, so it prints 414.6 mg even though its 'Calculated as' line shows 1.66 m² (250 × 1.66 would be 415 mg), and the comparison table, which uses 1.658 m², shows 414.5 mg. Differences of this size come from rounding, not from the equation. This is an educational calculation on illustrative values: real doses follow the protocol, its rounding and capping rules, and a pharmacist's check.",
    },
    mistakes: [
        "Putting height in metres into Mosteller. The 3600 constant assumes cm and kg; 1.65 m instead of 165 cm gives a BSA ten times too small (0.17 m²).",
        "Using pounds or inches without converting. 132 lb is 60 kg; Mosteller with 132 gives a BSA about 48 % too high.",
        "Forgetting the square root, which turns 1.66 m² into 2.75.",
        "Rounding BSA to one decimal place before multiplying. 1.7 m² instead of 1.658 m² makes a 250 mg/m² dose 10 mg too large.",
        "Switching between equations from one cycle to the next. They differ by a few per cent; using the same equation each time matters more than which one.",
        "Using an old or stated weight. BSA should come from a current, measured height and weight.",
    ],
    limitations: [
        "Every BSA equation is an empirical fit to a small measured group (DuBois was derived from 9 people); none measures a patient's actual surface area.",
        "The equations diverge most at the extremes — infants, very tall or very short adults, and obese or cachectic patients.",
        "BSA-based dosing reduces, but does not remove, the variation between patients in drug clearance; organ function still has to be considered.",
        "Some drugs have a maximum dose regardless of BSA, which this calculator does not apply.",
    ],
    refs: ["mosteller1987", "ansel16"],
    related: [
        {
            slug: "bmi-calculator",
            name: "BMI Calculator",
            why: "BMI from the same height and weight, to see whether the patient is at a body-size extreme.",
        },
        {
            slug: "reconstitution-calculator",
            name: "Reconstitution & IV Compounding Calculator",
            why: "Turn a dose in mg into a volume drawn from a reconstituted vial.",
        },
        {
            slug: "iv-drip-rate-calculator",
            name: "IV Drip Rate Calculator",
            why: "Set the rate once the dose has been made up in an infusion bag.",
        },
    ],
    guide: {
        slug: "dose-calculations",
        title: "Pharmaceutical Dose Calculations: Units, Body Weight and Body Surface Area",
    },
};
