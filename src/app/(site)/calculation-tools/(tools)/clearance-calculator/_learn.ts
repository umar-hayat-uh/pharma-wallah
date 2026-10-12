import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the clearance calculator. The worked example uses the
 * single-dose method with the optional Vd; every figure matches what the page
 * prints (CL to 3 dp, per-kg to 4 dp, t½ to 2 dp) and was recomputed in Python.
 */
export const LEARN: CalcEducation = {
    workedExample: {
        title: "Clearance and half-life from a single IV dose",
        scenario:
            "A volunteer in a teaching study receives 400 mg of Drug X as an IV bolus. The area under the plasma concentration–time curve, extrapolated to infinity, is 64 mg·h/L, and the volume of distribution is 45 L. Find the total clearance and the half-life.",
        given: [
            { label: "Dose (IV)", value: "400 mg" },
            { label: "AUC₀–∞", value: "64 mg·h/L" },
            { label: "Vd (optional field)", value: "45 L" },
            { label: "Method", value: "Single dose" },
        ],
        steps: [
            { label: "Clearance", working: "CL = Dose ÷ AUC = 400 mg ÷ 64 mg·h/L = 6.250 L/h" },
            { label: "Check the units", working: "mg ÷ (mg·h/L) = L/h" },
            { label: "Per kilogram (70 kg reference)", working: "6.25 L/h ÷ 70 kg = 0.0893 L/h/kg" },
            { label: "Half-life", working: "t½ = 0.693 × Vd ÷ CL = 0.693 × 45 L ÷ 6.25 L/h = 4.99 h" },
        ],
        answer: "CL = 6.250 L/h (≈ 104 mL/min); t½ ≈ 4.99 h.",
        interpretation:
            "Every hour the body clears the drug from about 6.25 L of plasma. Because Vd is 45 L, that is roughly 14 % of the volume per hour (kₑ = CL ÷ Vd ≈ 0.139 h⁻¹), which is why the half-life is about 5 hours. This is an educational calculation on illustrative values; whether a clearance is 'normal' depends on the drug, so it does not by itself describe a patient's organ function.",
    },
    mistakes: [
        "Using an oral dose and AUC and calling the answer total clearance. Dose ÷ AUC after an oral dose is CL/F; divide by F (or multiply the dose by F first) to get true clearance.",
        "Using a truncated AUC (0 to the last sample) instead of AUC₀–∞. A smaller AUC overestimates clearance.",
        "Mixing units: AUC in µg·h/mL is numerically the same as mg·h/L, but AUC in µg·h/L with a dose in mg gives a clearance 1000 times too small.",
        "Converting L/h to mL/min wrongly. Multiply by 1000 and divide by 60 (6.25 L/h = 104 mL/min), not the other way round.",
        "Drawing the 'steady-state' level before about 4–5 half-lives of constant infusion. The level is still rising, so R₀ ÷ Css overestimates clearance.",
        "Dividing by 70 kg for every patient. The per-kg figure here is for a 70 kg reference adult; use the patient's actual weight in practice.",
    ],
    limitations: [
        "Assumes linear (first-order) pharmacokinetics: clearance is the same at every concentration. Saturable elimination breaks this.",
        "Dose ÷ AUC gives total systemic clearance only for an intravenous dose that is completely available.",
        "R₀ ÷ Css assumes a true steady state and a constant infusion rate; a loading dose or a changing rate invalidates it.",
        "The interpretation bands and the organ chart are general teaching aids, not drug-specific ranges.",
    ],
    refs: ["shargel8", "rowland5"],
    related: [
        {
            slug: "ke-calculator",
            name: "Ke Calculator",
            why: "Turn CL and Vd into the elimination rate constant, kₑ = CL ÷ Vd.",
        },
        {
            slug: "volume-distribution-calculator",
            name: "Volume of Distribution Calculator",
            why: "Find the Vd you need for the half-life from an IV dose and C₀.",
        },
        {
            slug: "bioavailability-calculator",
            name: "Bioavailability Calculator",
            why: "Find F, so an oral CL/F can be converted to true clearance.",
        },
    ],
    guide: {
        slug: "pharmacokinetic-parameters",
        title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability",
    },
};
