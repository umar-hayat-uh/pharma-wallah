import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in this guide was recomputed in Python
 * before it was written here. The Drug X data set is invented (generated from
 * a two-exponential curve and rounded to 2 decimals); the analysis below uses
 * the rounded values, exactly as a student would.
 */
export const guide: Guide = {
  slug: "non-compartmental-analysis",
  title: "Non-Compartmental Analysis: AUC, AUMC and Mean Residence Time",
  description:
    "Work through a full non-compartmental analysis: λz, AUC and AUMC by the trapezoidal rule with extrapolation, mean residence time, clearance and Vss.",
  category: "Biopharmaceutics & Pharmacokinetics",
  objectives: [
    "Explain what non-compartmental analysis (NCA) is and when it is preferred to compartmental modelling.",
    "Estimate the terminal rate constant λz and terminal half-life from the last points of a concentration–time profile.",
    "Calculate AUC and AUMC to the last sample by the linear trapezoidal rule, and extrapolate both to infinity.",
    "Calculate mean residence time (MRT), clearance, steady-state volume (Vss) and terminal volume (Vz) from an IV-bolus data set.",
    "Explain the log-trapezoidal rule, mean absorption time (MAT) and the infusion correction to MRT.",
  ],
  intro: [
    "Compartmental pharmacokinetics describes the body as one or more boxes and fits exponential equations to the data. That works well when the model is right, but it forces you to choose a model first. Non-compartmental analysis (NCA) takes a different route: it calculates exposure and time-averaged quantities directly from the measured concentrations, using areas under curves, with only a few general assumptions.",
    "NCA is the standard first analysis in bioavailability, bioequivalence and early clinical studies because it is quick, reproducible and does not depend on choosing the number of compartments. Its core quantities are the area under the concentration curve (AUC), the area under the first-moment curve (AUMC) and their ratio, the mean residence time (MRT).",
    "This guide analyses one illustrative IV-bolus data set from start to finish. The drug and data are invented for teaching.",
  ],
  terms: [
    {
      term: "Non-compartmental analysis (NCA)",
      definition: "Calculation of pharmacokinetic parameters directly from concentration–time data using areas and moments, without fitting a compartmental model.",
    },
    {
      term: "Terminal rate constant (λz)",
      definition: "The rate constant of the final log-linear phase of the profile (h⁻¹), estimated by regressing ln C on time for the last few points.",
    },
    { term: "AUC", definition: "Area under the concentration–time curve (mg·h/L), the zero moment. Measures total exposure." },
    {
      term: "AUMC",
      definition: "Area under the first-moment curve, i.e. under t × C plotted against t (mg·h²/L). Weights each concentration by the time at which it occurs.",
    },
    {
      term: "Mean residence time (MRT)",
      definition: "The average time a drug molecule stays in the body: MRT = AUMC₀–∞ / AUC₀–∞ (h).",
    },
    {
      term: "Steady-state volume (Vss)",
      definition: "The volume of distribution at steady state, Vss = CL × MRT after an IV bolus (L). Model-independent.",
    },
    { term: "Terminal volume (Vz)", definition: "Vz = CL / λz (L). Depends on the terminal phase; at least as large as Vss." },
    {
      term: "Percentage extrapolated",
      definition: "The share of AUC₀–∞ (or AUMC₀–∞) that comes from the extrapolated tail rather than measured data. A large share makes the result less reliable.",
    },
    {
      term: "Mean absorption time (MAT)",
      definition: "MRT after an extravascular dose minus MRT after an IV dose: the average time taken for absorption.",
    },
  ],
  sections: [
    {
      id: "moments",
      heading: "The idea: areas and moments",
      blocks: [
        {
          kind: "p",
          text: "Imagine labelling every molecule in a dose and recording how long each stays in the body. The plasma concentration curve tells you, at each moment, how much drug is present. Its area (AUC) is proportional to the total exposure. If each point on the curve is multiplied by its time, the new curve (t × C) emphasises the molecules that stay late. Its area, AUMC, divided by AUC gives a time-weighted average: the mean residence time.",
        },
        {
          kind: "formula",
          expr: "AUC₀–∞ = ∫ C dt          AUMC₀–∞ = ∫ t·C dt          MRT = AUMC₀–∞ / AUC₀–∞",
          where: [
            { sym: "C", meaning: "plasma concentration at time t (mg/L)" },
            { sym: "t", meaning: "time after the dose (h)" },
            { sym: "MRT", meaning: "mean residence time (h)" },
          ],
          note: "Both integrals run from 0 to infinity. In practice they are calculated as trapezoidal sums to the last sample plus an extrapolated tail.",
        },
        {
          kind: "p",
          text: "NCA still has assumptions: elimination is linear (first-order), the parameters do not change during the study, and elimination happens from the sampled compartment (plasma). It does not assume one, two or any particular number of compartments.",
        },
      ],
    },
    {
      id: "lambda-z",
      heading: "Step 1: the terminal phase and λz",
      blocks: [
        {
          kind: "p",
          text: "The tail of every profile eventually becomes a straight line on a ln C against time plot. Its slope is −λz. Choose the last three or more points that lie on a straight line (excluding Cmax for an oral dose), and fit them by least-squares regression.",
        },
        {
          kind: "formula",
          expr: "ln C = a − λz·t          t½,z = 0.693 / λz",
          where: [
            { sym: "λz", meaning: "terminal rate constant (h⁻¹), the negative slope" },
            { sym: "t½,z", meaning: "terminal half-life (h)" },
          ],
        },
        {
          kind: "table",
          caption: "Drug X after a 400 mg IV bolus (illustrative data). C₀ is back-extrapolated from the first two points.",
          head: ["Time (h)", "C (mg/L)", "t × C (mg·h/L)"],
          rows: [
            ["0", "39.08 (C₀)", "0"],
            ["0.5", "27.88", "13.94"],
            ["1", "19.89", "19.89"],
            ["2", "12.55", "25.10"],
            ["4", "8.29", "33.16"],
            ["6", "6.61", "39.66"],
            ["8", "5.39", "43.12"],
            ["12", "3.61", "43.32"],
            ["24", "1.09", "26.16"],
          ],
        },
        {
          kind: "example",
          title: "λz and terminal half-life for Drug X",
          problem: "Fit ln C against t for the last three points (8, 12 and 24 h) and find λz and the terminal half-life.",
          steps: [
            "ln 5.39 = 1.6845, ln 3.61 = 1.2837, ln 1.09 = 0.0862.",
            "Least-squares slope = −0.09987 h⁻¹ (R² = 0.999999).",
            "λz = 0.09987 h⁻¹.",
            "t½,z = 0.693 ÷ 0.09987 = 6.94 h.",
          ],
          answer: "λz ≈ 0.0999 h⁻¹; terminal t½ ≈ 6.94 h.",
          note: "C₀ for an IV bolus is commonly back-extrapolated log-linearly from the first two points: C₀ = C₁ × (C₁/C₂)^(t₁/(t₂ − t₁)) = 27.88 × (27.88/19.89)^1 = 39.08 mg/L. The early points fall faster than the tail, which shows this drug has a distribution phase.",
        },
      ],
    },
    {
      id: "auc-aumc",
      heading: "Step 2: AUC and AUMC by the trapezoidal rule",
      blocks: [
        {
          kind: "formula",
          expr: "AUC segment = Δt × (Cᵢ + Cᵢ₊₁)/2          AUMC segment = Δt × (tᵢCᵢ + tᵢ₊₁Cᵢ₊₁)/2",
          where: [
            { sym: "Δt", meaning: "tᵢ₊₁ − tᵢ (h)" },
            { sym: "Cᵢ, Cᵢ₊₁", meaning: "concentrations at the two ends of the segment (mg/L)" },
          ],
        },
        {
          kind: "formula",
          expr: "AUC tail = C_last / λz          AUMC tail = t_last × C_last / λz + C_last / λz²",
          where: [
            { sym: "C_last", meaning: "last measured concentration (mg/L)" },
            { sym: "t_last", meaning: "time of the last sample (h)" },
          ],
          note: "The AUMC tail has two parts because t keeps growing while C falls. Forgetting the C_last/λz² term is a common error.",
        },
        {
          kind: "example",
          title: "AUC₀–∞ and AUMC₀–∞ for Drug X",
          problem: "Using the table, calculate AUC and AUMC to 24 h, add the tails, and report the percentage extrapolated.",
          steps: [
            "AUC segments: 16.74 + 11.94 + 16.22 + 20.84 + 14.90 + 12.00 + 18.00 + 28.20 = 138.84 mg·h/L.",
            "AUC tail = 1.09 ÷ 0.09987 = 10.91 mg·h/L; AUC₀–∞ = 149.76 mg·h/L (7.3% extrapolated).",
            "AUMC segments: 3.485 + 8.457 + 22.495 + 58.26 + 72.82 + 82.78 + 172.88 + 416.88 = 838.06 mg·h²/L.",
            "AUMC tail = 24 × 1.09 ÷ 0.09987 + 1.09 ÷ 0.09987² = 261.93 + 109.28 = 371.21 mg·h²/L.",
            "AUMC₀–∞ = 838.06 + 371.21 = 1209.26 mg·h²/L (30.7% extrapolated).",
          ],
          answer: "AUC₀–∞ ≈ 149.8 mg·h/L; AUMC₀–∞ ≈ 1209 mg·h²/L.",
          note: "The AUMC tail is 30.7% of the total while the AUC tail is only 7.3%: multiplying by t gives the late, low concentrations far more weight. That is why AUMC and MRT are more sensitive to the sampling schedule and to λz.",
        },
        {
          kind: "p",
          text: "The linear trapezoidal rule joins points with straight lines. On a declining exponential curve, straight lines lie above the curve, so the rule overestimates the area, most of all over long intervals. The log-trapezoidal rule assumes an exponential decline between the two points instead.",
        },
        {
          kind: "formula",
          expr: "Log-trapezoid segment = (Cᵢ − Cᵢ₊₁) × Δt / ln(Cᵢ / Cᵢ₊₁)",
          note: "Use it only for declining segments (Cᵢ > Cᵢ₊₁). Many analyses use 'linear up, log down': linear while concentrations rise, logarithmic while they fall. For the 12–24 h segment of Drug X it gives 25.25 mg·h/L against 28.20 by the linear rule.",
        },
      ],
    },
    {
      id: "derived",
      heading: "Step 3: MRT, clearance and volumes",
      blocks: [
        {
          kind: "formula",
          expr: "MRT = AUMC₀–∞ / AUC₀–∞     CL = Dose(IV) / AUC₀–∞     Vss = CL × MRT     Vz = CL / λz",
          where: [
            { sym: "CL", meaning: "clearance (L/h)" },
            { sym: "Vss", meaning: "volume of distribution at steady state (L)" },
            { sym: "Vz", meaning: "volume associated with the terminal phase (L)" },
          ],
          note: "These forms apply to an IV bolus. For an oral dose, CL and the volumes are apparent values divided by F, and MRT includes absorption time.",
        },
        {
          kind: "example",
          title: "Derived parameters for Drug X",
          problem: "Using AUC₀–∞ = 149.76 mg·h/L, AUMC₀–∞ = 1209.26 mg·h²/L, λz = 0.09987 h⁻¹ and the 400 mg dose, calculate MRT, CL, Vss and Vz.",
          steps: [
            "MRT = 1209.26 ÷ 149.76 = 8.07 h.",
            "CL = 400 ÷ 149.76 = 2.67 L/h.",
            "Vss = 2.67 × 8.07 = 21.6 L.",
            "Vz = 2.67 ÷ 0.09987 = 26.7 L.",
          ],
          answer: "MRT ≈ 8.07 h; CL ≈ 2.67 L/h; Vss ≈ 21.6 L; Vz ≈ 26.7 L.",
          note: "For a one-compartment drug MRT = 1/k = 1.44 × t½, which here would give 1.44 × 6.94 = 9.99 h. The true MRT is lower (8.07 h) because part of the dose leaves during the fast early phase. The 1.44 shortcut is valid only for a single-exponential curve.",
        },
        {
          kind: "table",
          caption: "Summary of the NCA of Drug X (400 mg IV bolus, illustrative)",
          head: ["Parameter", "Value", "Unit"],
          rows: [
            ["λz", "0.0999", "h⁻¹"],
            ["t½,z", "6.94", "h"],
            ["AUC₀–∞", "149.8", "mg·h/L"],
            ["AUMC₀–∞", "1209", "mg·h²/L"],
            ["MRT", "8.07", "h"],
            ["CL", "2.67", "L/h"],
            ["Vss", "21.6", "L"],
            ["Vz", "26.7", "L"],
          ],
        },
      ],
    },
    {
      id: "other-routes",
      heading: "Oral doses and infusions: MAT and the infusion correction",
      blocks: [
        {
          kind: "p",
          text: "After an oral dose, a molecule's time in the body includes the time it spent waiting to be absorbed. Comparing the oral MRT with the IV MRT in the same subjects isolates that absorption time.",
        },
        {
          kind: "formula",
          expr: "MAT = MRT(oral) − MRT(IV)          ka ≈ 1 / MAT (first-order absorption)",
          where: [
            { sym: "MAT", meaning: "mean absorption time (h)" },
            { sym: "ka", meaning: "first-order absorption rate constant (h⁻¹)" },
          ],
        },
        {
          kind: "example",
          title: "Mean absorption time of a tablet",
          problem: "In the same subjects, MRT after an IV dose of Drug X is 7.1 h and after an oral tablet is 10.4 h (illustrative). Estimate MAT and ka.",
          steps: ["MAT = 10.4 − 7.1 = 3.3 h.", "If absorption is first-order, ka ≈ 1 ÷ 3.3 = 0.30 h⁻¹."],
          answer: "MAT ≈ 3.3 h; ka ≈ 0.30 h⁻¹.",
        },
        {
          kind: "formula",
          expr: "MRT(IV) = MRT(infusion) − T/2",
          where: [{ sym: "T", meaning: "duration of a constant-rate infusion (h)" }],
          note: "During an infusion, the drug enters on average halfway through it, so half the infusion time is subtracted.",
        },
      ],
    },
  ],
  mistakes: [
    "Stopping at AUC₀–t and AUMC₀–t. MRT must use both areas extrapolated to infinity.",
    "Leaving out the C_last/λz² term of the AUMC tail.",
    "Estimating λz from points that are not in the terminal phase, such as points around Cmax after an oral dose.",
    "Using too few points or a very short sampling period, so a large share of AUMC is extrapolated. A large extrapolated percentage makes MRT unreliable.",
    "Using MRT = 1.44 × t½ for a drug with a distribution phase or an oral dose. It holds only for a one-compartment IV bolus.",
    "Applying the log-trapezoidal rule to a rising segment, or to a segment where one concentration is zero (ln of zero is undefined).",
    "Mixing units: AUMC is in mg·h²/L, so dividing by AUC in mg·h/L gives hours.",
    "Interpreting oral CL and Vss as true values. Without an IV reference they are apparent values divided by F.",
  ],
  practice: [
    {
      q: "AUMC₀–∞ = 1500 mg·h²/L and AUC₀–∞ = 120 mg·h/L. Calculate MRT.",
      answer: "MRT = 12.5 h",
      working: ["MRT = AUMC ÷ AUC.", "= 1500 ÷ 120 = 12.5 h."],
    },
    {
      q: "A 500 mg IV bolus gives AUC₀–∞ = 100 mg·h/L and MRT = 8 h. Calculate CL and Vss.",
      answer: "CL = 5 L/h; Vss = 40 L",
      working: ["CL = Dose ÷ AUC = 500 ÷ 100 = 5 L/h.", "Vss = CL × MRT = 5 × 8 = 40 L."],
    },
    {
      q: "Concentration falls from 8 mg/L to 4 mg/L over 2 h. Calculate the segment area by the linear and log-trapezoidal rules.",
      answer: "Linear 12.0 mg·h/L; log 11.54 mg·h/L",
      working: [
        "Linear = 2 × (8 + 4) ÷ 2 = 12.0 mg·h/L.",
        "Log = (8 − 4) × 2 ÷ ln(8/4) = 8 ÷ 0.6931 = 11.54 mg·h/L.",
      ],
    },
    {
      q: "The last sample is 2 mg/L at 12 h and λz = 0.2 h⁻¹. Calculate the AUC tail and the AUMC tail.",
      answer: "AUC tail = 10 mg·h/L; AUMC tail = 170 mg·h²/L",
      working: [
        "AUC tail = C_last ÷ λz = 2 ÷ 0.2 = 10 mg·h/L.",
        "AUMC tail = t_last × C_last ÷ λz + C_last ÷ λz² = 12 × 2 ÷ 0.2 + 2 ÷ 0.04 = 120 + 50 = 170 mg·h²/L.",
      ],
    },
    {
      q: "AUC₀–t = 90 mg·h/L and the extrapolated AUC tail is 10 mg·h/L. What percentage of AUC₀–∞ is extrapolated?",
      answer: "10%",
      working: ["AUC₀–∞ = 90 + 10 = 100 mg·h/L.", "% extrapolated = 10 ÷ 100 × 100 = 10%."],
    },
    {
      q: "MRT after an oral dose is 9.5 h and after an IV dose is 6.0 h. Estimate MAT and, assuming first-order absorption, ka.",
      answer: "MAT = 3.5 h; ka ≈ 0.29 h⁻¹",
      working: ["MAT = 9.5 − 6.0 = 3.5 h.", "ka ≈ 1 ÷ 3.5 = 0.286 h⁻¹."],
    },
    {
      q: "A drug is given as a 2-hour constant-rate infusion. MRT calculated from the data is 7 h. What is the MRT corrected to an IV bolus?",
      answer: "6 h",
      working: ["MRT(IV) = MRT(infusion) − T/2.", "= 7 − 2/2 = 6 h."],
    },
    {
      q: "A drug follows one-compartment kinetics with t½ = 5 h after an IV bolus. What is its MRT?",
      answer: "≈ 7.2 h",
      working: ["MRT = 1/k = t½ ÷ ln 2.", "= 5 ÷ 0.6931 = 7.21 h (1.44 × 5 = 7.2 h with the rounded factor)."],
    },
  ],
  limitations: [
    "NCA assumes linear kinetics and time-invariant parameters. With saturable elimination, AUC and MRT change with dose and the results do not generalise.",
    "Results depend heavily on the sampling schedule. Sparse early samples misestimate C₀ and the early AUC; a short sampling period inflates the extrapolated share of AUMC.",
    "λz depends on which points are chosen. Different reasonable choices can give noticeably different MRT and Vz.",
    "NCA does not predict concentrations for new regimens as directly as a fitted model does; for that, compartmental or population models are used.",
  ],
  refs: ["gibaldi", "shargel8", "rowland5"],
  relatedTools: [
    {
      slug: "mean-residence-time-calculator",
      name: "Mean Residence Time Calculator",
      why: "Its 'From AUC and AUMC' method calculates MRT = AUMC₀–∞ / AUC₀–∞, Step 3 of this guide. Its half-life method (1.44 × t½) is valid only for a one-compartment IV bolus, as explained here.",
    },
  ],
  relatedGuides: ["pharmacokinetic-parameters", "bioavailability-and-bioequivalence", "multiple-dosing-and-steady-state"],
  meta: { author: TEAM_AUTHOR, review: { status: "draft" }, updated: "2026-10-13" },
};
