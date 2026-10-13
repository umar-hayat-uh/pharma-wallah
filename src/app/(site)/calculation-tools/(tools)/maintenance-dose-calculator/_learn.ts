import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the maintenance dose calculator. The worked example uses
 * q12h and the "Enter half-life" mode on purpose: without a half-life the page
 * estimates one from an assumed Vd of 50 L for every drug, and its frequency
 * label calls q8h "Twice daily" (both recorded in the redesign tracker), so the
 * example avoids both paths. Every figure matches what the page prints (doses
 * to 1 dp, time to steady state to 1 dp, R and peak/trough to 2 dp) and was
 * recomputed in Python. The drug and its parameters are illustrative.
 */
export const LEARN: CalcEducation = {
    workedExample: {
        title: "Oral maintenance dose for a target average level",
        scenario:
            "A teaching exercise: Drug X is to be given by mouth every 12 hours to hold an average steady-state plasma concentration of 12 mg/L. In this (illustrative) patient its clearance is 3 L/h, its oral bioavailability is 80 % and its half-life is 8 h. Find the dose per interval, the daily dose, and how the level will behave at steady state.",
        given: [
            { label: "Target Cₛₛ (average)", value: "12 mg/L" },
            { label: "Clearance (Cl)", value: "3 L/h" },
            { label: "Bioavailability (F)", value: "80 % (enter 80)" },
            { label: "Dosing interval (τ)", value: "q12h = 12 h" },
            { label: "Half-life (Enter half-life mode)", value: "8 h" },
        ],
        steps: [
            { label: "Maintenance dose", working: "MD = (Cₛₛ × Cl × τ) ÷ F = (12 mg/L × 3 L/h × 12 h) ÷ 0.80 = 432 ÷ 0.80 = 540.0 mg" },
            { label: "Check the units", working: "mg/L × L/h × h = mg" },
            { label: "Daily dose", working: "540.0 mg × (24 h ÷ 12 h) = 1080.0 mg/day" },
            { label: "Rate constant", working: "k = 0.693 ÷ t½ = 0.693 ÷ 8 h = 0.0866 h⁻¹;  k × τ = 0.0866 × 12 = 1.04" },
            { label: "Time to steady state (~95 %)", working: "4.32 × t½ = 4.32 × 8 h = 34.6 h (about 2 days)" },
            { label: "Accumulation ratio", working: "R = 1 ÷ (1 − e^(−1.04)) = 1 ÷ (1 − 0.354) = 1.55" },
            { label: "Peak/trough ratio", working: "e^(k × τ) = e^(1.04) = 2.83" },
        ],
        answer: "MD = 540.0 mg every 12 h (1080.0 mg/day); steady state in ≈ 34.6 h; R = 1.55; peak/trough ≈ 2.83.",
        interpretation:
            "540 mg every 12 hours puts in, on average, exactly what 3 L/h of clearance removes when the mean level is 12 mg/L: 540 × 0.80 ÷ (3 × 12) = 12 mg/L. That 12 mg/L is the time-averaged level, not the peak or the trough. With a 12 h interval and an 8 h half-life the peak is about 2.8 times the trough, and steady-state levels are about 1.55 times those after the first dose. This is a teaching calculation on illustrative values: a real regimen is set by the prescriber from the drug's licensed dosing and the institution's protocol, rounded to an available strength, and confirmed by monitoring — not by this calculator.",
    },
    mistakes: [
        "Typing F as a fraction into a percentage field. This page expects 80 for 80 %; entering 0.8 is read as 0.8 % and makes the dose 100 times too large.",
        "Mismatching time units. Cl in L/h needs τ in hours; a clearance in mL/min must be converted first (mL/min × 60 ÷ 1000 = L/h), or the dose is out by a factor of 16.7.",
        "Treating a trough or peak target as Cₛₛ. The formula gives the dose for the average steady-state level; a trough target (as for vancomycin) or a peak target (as for aminoglycosides) needs the intermittent-infusion equations instead.",
        "Forgetting the salt factor. The formula gives mg of active drug; if the product is a salt (for example a hydrochloride or sodium salt), divide by the salt fraction S to get the mg of salt to give.",
        "Expecting a bigger dose to reach steady state sooner. The time to steady state depends only on the half-life (about 4–5 half-lives); only a loading dose gets the level to target sooner.",
        "Using Vd to work out the maintenance dose. Vd sets the loading dose and, with Cl, the half-life; the maintenance dose depends on clearance alone.",
    ],
    limitations: [
        "Assumes linear, first-order elimination: clearance is the same at every concentration. Drugs with saturable metabolism, such as phenytoin, do not follow this formula.",
        "Assumes a one-compartment model and that clearance and F stay constant between doses; renal or hepatic change, interactions or illness alter both.",
        "Cₛₛ is the average concentration over an interval. The accumulation and peak/trough figures treat each dose as an instantaneous (bolus-like) input and ignore absorption time.",
        "Without an entered half-life, the page estimates t½ from Cl and an assumed Vd of 50 L for every drug, so the time to steady state shown in that mode is only a rough placeholder.",
        "Does not round to available tablet or vial strengths and does not include a salt factor.",
    ],
    refs: ["shargel8", "rowland5"],
    related: [
        {
            slug: "accumulation-index-calculator",
            name: "Accumulation Index Calculator",
            why: "Explore how R = 1 ÷ (1 − e^(−kτ)) changes as you shorten or lengthen τ for the same half-life.",
        },
        {
            slug: "ke-calculator",
            name: "Elimination Rate Constant (kₑ) Calculator",
            why: "Turn this patient's Cl and Vd into kₑ and t½, so you can enter a real half-life instead of relying on the 50 L estimate.",
        },
        {
            slug: "volume-distribution-calculator",
            name: "Volume of Distribution Calculator",
            why: "Find Vd, which with Cl gives the half-life and decides any loading dose.",
        },
    ],
    guide: {
        slug: "pharmacokinetic-parameters",
        title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability",
    },
};
