import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the loading-dose calculator. The worked example uses the
 * oral route with the Fixed dose basis and enters Vd as total litres, which is
 * what the page expects. The figures match what the page prints (dose to 1 dp)
 * and were recomputed in Python.
 */
export const LEARN: CalcEducation = {
    workedExample: {
        title: "Oral loading dose with incomplete bioavailability",
        scenario:
            "A practical sheet asks for the oral loading dose of Drug X needed to reach a target plasma concentration of 8 mg/L straight away. Its volume of distribution in the patient described is 35 L, and its oral bioavailability is 80 %.",
        given: [
            { label: "Route", value: "Oral" },
            { label: "Target concentration Cₚ", value: "8 mg/L" },
            { label: "Volume of distribution Vd", value: "35 L (total)" },
            { label: "Bioavailability F", value: "80 %" },
            { label: "Dose basis", value: "Fixed" },
        ],
        steps: [
            { label: "Formula", working: "LD = (Cₚ × Vd) ÷ F" },
            { label: "Convert F to a fraction", working: "F = 80 % ÷ 100 = 0.8" },
            { label: "Amount needed in the body", working: "Cₚ × Vd = 8 mg/L × 35 L = 280 mg (the IV-equivalent dose)" },
            { label: "Allow for incomplete absorption", working: "LD = 280 mg ÷ 0.8 = 350.0 mg" },
        ],
        answer: "Oral loading dose = 350.0 mg (IV equivalent 280.0 mg).",
        interpretation:
            "280 mg must reach the circulation to fill 35 L to 8 mg/L; because only 80 % of an oral dose gets there, 350 mg has to be swallowed. This is an educational calculation on illustrative values — a real loading dose comes from the drug's monograph and protocol, and is confirmed with drug-level monitoring.",
    },
    mistakes: [
        "Entering a Vd in L/kg as if it were total litres. 0.7 L/kg must first be multiplied by body weight (0.7 × 70 kg = 49 L); entering 0.7 gives a dose 70 times too small.",
        "Entering F as a percentage in a hand calculation. 350 mg comes from dividing by 0.8, not by 80.",
        "Mixing concentration units. A target in mcg/L (µg/L) with Vd in litres gives the dose in micrograms, not milligrams — divide by 1000 for mg.",
        "Multiplying by F instead of dividing. An oral loading dose is larger than the IV dose, never smaller.",
        "Using clearance or half-life to size the loading dose. They set the maintenance dose; the loading dose depends only on Vd, the target and F.",
    ],
    limitations: [
        "Assumes a one-compartment model in which the dose distributes instantly. For drugs with a slow distribution phase, levels taken too early overshoot the target.",
        "Assumes linear kinetics. For saturable drugs the same arithmetic can badly mispredict the level reached.",
        "Vd changes with body composition, fluid status and disease, so a population Vd may not fit an individual.",
        "The time-to-effect line on the page is a general statement, not derived from the drug's absorption rate.",
    ],
    refs: ["rowland5", "shargel8"],
    related: [
        {
            slug: "volume-distribution-calculator",
            name: "Volume of Distribution Calculator",
            why: "Get Vd in total litres from an IV dose and C₀ before using it here.",
        },
        {
            slug: "bioavailability-calculator",
            name: "Bioavailability Calculator",
            why: "Work out F from AUC data instead of assuming it.",
        },
        {
            slug: "AccumulationIndexCalculator",
            name: "Accumulation Index Calculator",
            why: "See how long repeated doses take to build up without a loading dose.",
        },
    ],
    guide: {
        slug: "pharmacokinetic-parameters",
        title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability",
    },
};
