import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the kₑ calculator. The worked example uses the
 * "From dose and C₀" method; every figure matches what the page prints
 * (kₑ to 4 dp, t½ to 2 dp) and was recomputed independently in Python.
 */
export const LEARN: CalcEducation = {
    workedExample: {
        title: "kₑ from an IV bolus dose, C₀ and clearance",
        scenario:
            "In a pharmacokinetics practical, Drug X is given as a single 500 mg IV bolus. The plasma concentration back-extrapolated to time zero is 12.5 mg/L, and total clearance was found to be 5 L/h. Find the elimination rate constant and the half-life.",
        given: [
            { label: "Dose (IV bolus)", value: "500 mg" },
            { label: "C₀ (back-extrapolated)", value: "12.5 mg/L" },
            { label: "Clearance CL", value: "5 L/h" },
            { label: "Method", value: "From dose and C₀" },
        ],
        steps: [
            { label: "Volume of distribution", working: "Vd = Dose ÷ C₀ = 500 mg ÷ 12.5 mg/L = 40 L" },
            { label: "Elimination rate constant", working: "kₑ = CL ÷ Vd = 5 L/h ÷ 40 L = 0.1250 h⁻¹" },
            { label: "Half-life", working: "t½ = 0.693 ÷ kₑ = 0.693 ÷ 0.125 h⁻¹ = 5.544 h ≈ 5.54 h" },
            {
                label: "Fraction lost in the first hour",
                working: "kₑ × 100 = 12.5 % (approximation)\nexact: 1 − e^(−0.125 × 1) = 0.1175 → 11.8 %",
            },
        ],
        answer: "kₑ = 0.1250 h⁻¹, so t½ ≈ 5.54 h (Vd = 40 L).",
        interpretation:
            "About 12 % of the drug in the body is removed each hour, and the level halves roughly every 5.5 hours, so it takes about 4–5 half-lives (22–28 h) for a single dose to be almost completely eliminated. This is an educational calculation on illustrative values for a one-compartment drug, not a patient-specific dosing decision.",
    },
    mistakes: [
        "Using log₁₀ 2 (0.301) instead of ln 2 (0.693). First-order elimination is exponential in base e, so kₑ = 0.693 ÷ t½; 0.301 gives a value 2.3 times too small.",
        "Mixing time units. A half-life in minutes gives kₑ in min⁻¹; it must be multiplied by 60 before comparing it with a kₑ in h⁻¹.",
        "Mixing volume units. CL in mL/min with Vd in L gives a number that is neither h⁻¹ nor min⁻¹ — convert CL to L/h (× 60 ÷ 1000) first.",
        "Using a Vd in L/kg as if it were total litres. Multiply by body weight before dividing CL by it.",
        "Reading kₑ × 100 as the exact percentage lost per hour. It is a small-kₑ approximation; the exact fraction is 1 − e^(−kₑ), which is noticeably smaller once kₑ is above about 0.1 h⁻¹.",
        "Using the first measured concentration as C₀. C₀ is the value back-extrapolated to time zero on a log-concentration plot, not the first sample.",
    ],
    limitations: [
        "Assumes first-order (linear) elimination. Drugs with saturable metabolism, such as high-dose phenytoin or ethanol, have no single kₑ.",
        "Assumes a one-compartment body. For drugs with a distinct distribution phase, Dose ÷ C₀ underestimates the true volume, and the kₑ here describes only the terminal phase.",
        "The dose and C₀ method is valid only for an IV bolus. After an oral dose, absorption and bioavailability distort both C₀ and Vd.",
        "kₑ is a population or study value; disease (renal or hepatic impairment), age and interacting drugs change it in individual patients.",
    ],
    refs: ["shargel8", "rowland5"],
    related: [
        {
            slug: "volume-distribution-calculator",
            name: "Volume of Distribution Calculator",
            why: "Work out Vd on its own, in L and L/kg, before you divide clearance by it.",
        },
        {
            slug: "clearance-calculator",
            name: "Clearance Calculator",
            why: "Get CL from a dose and AUC, or from an infusion at steady state.",
        },
        {
            slug: "AccumulationIndexCalculator",
            name: "Accumulation Index Calculator",
            why: "See how kₑ and the dosing interval decide how much a repeated dose builds up.",
        },
    ],
    guide: {
        slug: "pharmacokinetic-parameters",
        title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability",
    },
};
