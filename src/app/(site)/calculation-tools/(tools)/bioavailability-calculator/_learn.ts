import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the bioavailability calculator. The worked example uses
 * the "From AUC data" method (the dose-estimate method uses a textbook F per
 * route, not data). The figure matches what the page prints (F to 1 dp) and
 * was recomputed in Python.
 */
export const LEARN: CalcEducation = {
    workedExample: {
        title: "Absolute bioavailability with unequal doses",
        scenario:
            "In a crossover study, volunteers receive Drug X as a 200 mg oral tablet and, on another occasion, as a 100 mg IV dose. The AUC₀–∞ is 36 mg·h/L after the tablet and 30 mg·h/L after the IV dose. Find the absolute oral bioavailability.",
        given: [
            { label: "Route", value: "Oral" },
            { label: "Test dose Dₜ (oral)", value: "200 mg" },
            { label: "Test AUCₜ", value: "36 mg·h/L" },
            { label: "Reference dose Dᵣ (IV)", value: "100 mg" },
            { label: "Reference AUCᵣ", value: "30 mg·h/L" },
            { label: "Method", value: "From AUC data" },
        ],
        steps: [
            { label: "Formula", working: "F = (AUCₜ ÷ Dₜ) ÷ (AUCᵣ ÷ Dᵣ) × 100" },
            { label: "Exposure per mg, oral", working: "36 mg·h/L ÷ 200 mg = 0.18 h/L per mg" },
            { label: "Exposure per mg, IV", working: "30 mg·h/L ÷ 100 mg = 0.30 h/L per mg" },
            { label: "Ratio", working: "F = 0.18 ÷ 0.30 × 100 = 60.0 %" },
        ],
        answer: "F = 60.0 % (0.60 as a fraction) — absolute oral bioavailability.",
        interpretation:
            "Only 60 % of each oral milligram reaches the systemic circulation, through incomplete absorption, first-pass metabolism or both. Notice that the oral AUC is larger than the IV AUC here, yet F is below 100 % — because twice the dose was given. Always compare exposure per milligram. This is an educational calculation on illustrative study data, not a dose conversion for a patient.",
    },
    mistakes: [
        "Comparing the AUCs without dividing each by its own dose. 36 ÷ 30 would suggest F = 120 %, when the dose-normalised answer is 60 %.",
        "Mixing F as a percentage and as a fraction. This page prints a percentage; formulas such as LD = Cₚ × Vd ÷ F need the fraction (60 % → 0.60).",
        "Using AUC to the last sample for one formulation and to infinity for the other. Both AUCs must be AUC₀–∞ (or both to the same time) and in the same units.",
        "Calling the result absolute bioavailability when the reference was another oral product. Against an oral reference it is relative bioavailability.",
        "Converting between routes the wrong way round. The oral dose is the IV dose ÷ F, not × F: with F = 0.6 the oral dose is larger.",
    ],
    limitations: [
        "Assumes clearance was the same in both study periods. If clearance changed between them, the AUC ratio no longer measures absorption alone.",
        "Assumes linear pharmacokinetics, so AUC rises in proportion to dose. Saturable first-pass metabolism or absorption breaks dose normalisation.",
        "The 'Estimate from dose' method applies one textbook F per route (oral 80 %, IM 95 %, SC 90 %, transdermal 85 %); a real drug's F can be anywhere from near 0 to 100 %.",
        "A single F from mean AUCs hides the variability between individuals, which is large for drugs with extensive first-pass metabolism.",
    ],
    refs: ["shargel8", "rowland5"],
    related: [
        {
            slug: "clearance-calculator",
            name: "Clearance Calculator",
            why: "Dose ÷ AUC after an oral dose gives CL/F; F turns it into true clearance.",
        },
        {
            slug: "volume-distribution-calculator",
            name: "Volume of Distribution Calculator",
            why: "Vd from an IV reference dose, the other half of the loading-dose formula.",
        },
        {
            slug: "ke-calculator",
            name: "Ke Calculator",
            why: "Turn CL and Vd into kₑ and the half-life.",
        },
    ],
    guide: {
        slug: "pharmacokinetic-parameters",
        title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability",
    },
};
