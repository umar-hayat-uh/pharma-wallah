import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * Every number in this guide was recomputed independently in Python before
 * publishing. The concentration data are original and illustrative ("Drug X",
 * "Drug Y", "Drug Z"); none of them describes a real medicine.
 */
export const guide: Guide = {
  slug: "pharmacokinetic-parameters",
  title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability",
  description:
    "Work out kₑ, half-life, volume of distribution, AUC, clearance and bioavailability from concentration–time data, with a full worked IV-bolus example.",
  category: "Biopharmaceutics & Pharmacokinetics",
  objectives: [
    "Calculate the elimination rate constant (kₑ) and half-life from the slope of a ln C versus time plot.",
    "Calculate C₀ and the apparent volume of distribution after an IV bolus dose.",
    "Calculate AUC₀–∞ with the linear trapezoidal rule plus the C_last/kₑ extrapolation, and use it to find clearance.",
    "Calculate absolute and relative bioavailability, normalising correctly for dose.",
    "Explain accumulation, the accumulation factor and why steady state takes about 4–5 half-lives.",
    "Explain how loading and maintenance doses follow from Vd, CL and F, and why real dosing needs drug-specific references.",
  ],
  intro: [
    "Pharmacokinetics describes what the body does to a drug: how quickly it is absorbed, how widely it spreads, and how fast it is removed. A handful of parameters — the elimination rate constant, half-life, volume of distribution, clearance, area under the curve and bioavailability — summarise all of that in numbers you can calculate from a set of plasma concentrations.",
    "This guide works with the simplest useful model: a one-compartment body and linear (first-order) kinetics, where the rate of elimination is proportional to the concentration. It is the model behind most biopharmaceutics practicals and exam questions in the Pharm-D syllabus, and the starting point for every more complex model.",
    "We first define each parameter, then analyse one illustrative IV-bolus data set from start to finish, then cover bioavailability and repeated dosing. The data and drug names are invented for teaching. Nothing here is a dosing recommendation for a real patient or a real medicine.",
  ],
  terms: [
    {
      term: "Plasma concentration–time curve",
      definition: "A graph of drug concentration in plasma (C) against time after a dose. Its shape shows absorption, distribution and elimination.",
    },
    {
      term: "First-order (linear) kinetics",
      definition: "Elimination in which a constant fraction of the drug is removed per unit time, so the amount removed per hour falls as the concentration falls.",
    },
    {
      term: "Elimination rate constant (kₑ)",
      definition: "The fraction of drug in the body eliminated per unit time, in units of reciprocal time (h⁻¹). It is the negative slope of ln C against time.",
    },
    {
      term: "Half-life (t½)",
      definition: "The time for the plasma concentration (or amount in the body) to fall by half. In first-order kinetics it is constant: t½ = 0.693/kₑ.",
    },
    {
      term: "C₀",
      definition: "The concentration at time zero after an IV bolus, found by extrapolating the ln C line back to t = 0. It is not measured directly.",
    },
    {
      term: "Apparent volume of distribution (Vd)",
      definition: "The volume the dose would occupy if it were everywhere at the plasma concentration. It is a proportionality constant, not a real anatomical volume, and can exceed body water.",
    },
    {
      term: "Clearance (CL)",
      definition: "The volume of plasma completely cleared of drug per unit time (L/h or mL/min). The rate of elimination equals CL × C.",
    },
    {
      term: "AUC",
      definition: "Area under the plasma concentration–time curve (mg·h/L). AUC₀–t runs to the last sample; AUC₀–∞ adds the extrapolated tail. It reflects total exposure to the drug.",
    },
    {
      term: "Bioavailability (F)",
      definition: "The fraction of an administered dose that reaches the systemic circulation unchanged. By definition F = 1 for an IV dose.",
    },
    {
      term: "Steady state (Css)",
      definition: "The condition during repeated dosing or a constant infusion when the rate of drug in equals the rate of drug out, so the concentration profile repeats from one dose to the next.",
    },
    {
      term: "Accumulation factor (R)",
      definition: "How much higher the steady-state concentrations are than those after the first dose, for doses given every τ hours: R = 1/(1 − e^(−kₑτ)).",
    },
  ],
  sections: [
    {
      id: "curve-and-ke",
      heading: "The concentration–time curve, kₑ and half-life",
      blocks: [
        {
          kind: "p",
          text: "After an IV bolus into a one-compartment body, the whole dose is in the plasma at once and concentration falls exponentially. Plotted on ordinary axes the curve bends; plotted as the natural logarithm of concentration against time it becomes a straight line. That straight line is why we take logarithms: a straight line has a slope and an intercept we can calculate by linear regression.",
        },
        {
          kind: "formula",
          expr: "C = C₀ · e^(−kₑt)     so     ln C = ln C₀ − kₑ · t",
          where: [
            { sym: "C", meaning: "plasma concentration at time t (mg/L)" },
            { sym: "C₀", meaning: "concentration extrapolated to t = 0 (mg/L)" },
            { sym: "kₑ", meaning: "elimination rate constant (h⁻¹)" },
            { sym: "t", meaning: "time after the dose (h)" },
          ],
          note: "The slope of ln C against t is −kₑ, and the intercept is ln C₀.",
        },
        {
          kind: "formula",
          expr: "t½ = ln 2 / kₑ = 0.693 / kₑ",
          note: "Half-life and kₑ carry the same time unit: kₑ in h⁻¹ gives t½ in hours.",
        },
        {
          kind: "p",
          text: "Many textbooks and older practical manuals plot log₁₀ C on semi-log paper instead of ln C. The line is still straight, but its slope is −kₑ/2.303, because ln x = 2.303 × log₁₀ x. If you read a slope from a log₁₀ plot, multiply it by 2.303 before calling it kₑ.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Use the terminal points",
          text: "After an oral dose, or when a drug distributes slowly, the early points do not lie on the elimination line. Fit only the straight terminal portion of the ln C plot. In a true one-compartment IV bolus, all points should lie close to one line.",
        },
      ],
    },
    {
      id: "vd-auc-cl",
      heading: "Volume of distribution, AUC and clearance",
      blocks: [
        {
          kind: "p",
          text: "Once you know C₀, the volume of distribution for an IV bolus follows directly, because at time zero the whole dose is in the body and none has yet been eliminated.",
        },
        {
          kind: "formula",
          expr: "Vd = Dose(IV) / C₀",
          where: [
            { sym: "Dose(IV)", meaning: "intravenous bolus dose (mg)" },
            { sym: "C₀", meaning: "back-extrapolated concentration at t = 0 (mg/L)" },
          ],
          note: "Express dose and concentration in the same mass unit: mg with mg/L gives L. Note that 1 µg/mL = 1 mg/L.",
        },
        {
          kind: "p",
          text: "AUC is usually calculated from the data with the linear trapezoidal rule: the area between each pair of consecutive samples is treated as a trapezium. For an IV bolus the first trapezium starts at C₀. Because sampling stops before the drug is fully gone, the remaining tail is added by extrapolation from the last measured concentration.",
        },
        {
          kind: "formula",
          expr: "AUC(tᵢ→tᵢ₊₁) = (tᵢ₊₁ − tᵢ) × (Cᵢ + Cᵢ₊₁) / 2          AUC₀–∞ = AUC₀–t + C_last / kₑ",
          where: [
            { sym: "C_last", meaning: "last measured concentration (mg/L)" },
            { sym: "kₑ", meaning: "terminal elimination rate constant (h⁻¹)" },
          ],
        },
        {
          kind: "p",
          text: "Clearance links the dose to the exposure. For a single IV dose, every milligram given is eventually cleared, and the total cleared equals CL × AUC₀–∞. In the one-compartment model clearance is also the product of kₑ and Vd, which shows why a drug with a large volume of distribution is eliminated slowly unless its clearance is also high.",
        },
        {
          kind: "formula",
          expr: "CL = Dose(IV) / AUC₀–∞ = kₑ · Vd",
          note: "L/h × 1000 ÷ 60 gives mL/min. Clearance is a volume per time, never an amount per time.",
        },
      ],
    },
    {
      id: "worked-example",
      heading: "Worked example: analysing an IV-bolus data set end to end",
      blocks: [
        {
          kind: "p",
          text: "Drug X (illustrative) is given as a single 500 mg IV bolus. Plasma samples give the concentrations below. We will find kₑ, t½, C₀, Vd, AUC₀–∞ and CL.",
        },
        {
          kind: "table",
          caption: "Drug X after a 500 mg IV bolus (illustrative data), with ln C for the regression",
          head: ["Time (h)", "C (mg/L)", "ln C"],
          rows: [
            ["0.5", "22.6", "3.1179"],
            ["1", "20.5", "3.0204"],
            ["2", "16.8", "2.8214"],
            ["4", "11.2", "2.4159"],
            ["6", "7.6", "2.0281"],
            ["8", "5.0", "1.6094"],
            ["12", "2.3", "0.8329"],
          ],
        },
        {
          kind: "example",
          title: "Step 1 — kₑ, t½ and C₀ from the regression of ln C on time",
          problem: "Fit a straight line to ln C against t for all seven points, then find kₑ, the half-life and C₀.",
          steps: [
            "Take the natural log of each concentration (third column of the table).",
            "Least-squares regression of ln C on t gives slope = −0.19928 h⁻¹ and intercept = 3.21743, with R² = 0.99993, so the points lie on a straight line.",
            "kₑ = −slope = 0.1993 h⁻¹ (about 19.9% of the drug in the body is eliminated per hour at any moment).",
            "t½ = 0.693 / 0.1993 = 3.48 h.",
            "C₀ = e^(intercept) = e^3.21743 = 24.96 mg/L.",
          ],
          answer: "kₑ = 0.199 h⁻¹, t½ = 3.48 h, C₀ = 25.0 mg/L.",
          note: "Using ln 2 = 0.693147 instead of 0.693 changes t½ only in the fourth decimal place (3.4783 versus 3.4775 h).",
        },
        {
          kind: "example",
          title: "Step 2 — Volume of distribution",
          problem: "Use the dose and C₀ from Step 1.",
          steps: ["Vd = Dose / C₀ = 500 mg ÷ 24.96 mg/L.", "Vd = 20.03 L."],
          answer: "Vd ≈ 20.0 L.",
        },
        {
          kind: "example",
          title: "Step 3 — AUC by the trapezoidal rule plus extrapolation",
          problem: "Calculate AUC₀–12 starting from C₀ at t = 0, then add the tail to infinity.",
          steps: [
            "0–0.5 h: 0.5 × (24.96 + 22.6)/2 = 11.89 mg·h/L.",
            "0.5–1 h: 0.5 × (22.6 + 20.5)/2 = 10.78.",
            "1–2 h: 1 × (20.5 + 16.8)/2 = 18.65.",
            "2–4 h: 2 × (16.8 + 11.2)/2 = 28.00.",
            "4–6 h: 2 × (11.2 + 7.6)/2 = 18.80.",
            "6–8 h: 2 × (7.6 + 5.0)/2 = 12.60.",
            "8–12 h: 4 × (5.0 + 2.3)/2 = 14.60.",
            "AUC₀–12 = sum of the trapezia = 115.32 mg·h/L.",
            "Extrapolated tail = C_last / kₑ = 2.3 ÷ 0.1993 = 11.54 mg·h/L.",
            "AUC₀–∞ = 115.32 + 11.54 = 126.86 mg·h/L. The tail is 9.1% of the total.",
          ],
          answer: "AUC₀–∞ ≈ 126.9 mg·h/L.",
        },
        {
          kind: "example",
          title: "Step 4 — Clearance, two ways",
          problem: "Calculate CL from Dose/AUC₀–∞ and check it against kₑ × Vd.",
          steps: [
            "CL = Dose / AUC₀–∞ = 500 ÷ 126.86 = 3.94 L/h.",
            "Check: CL = kₑ × Vd = 0.1993 × 20.03 = 3.99 L/h.",
            "In mL/min: 3.94 × 1000 ÷ 60 ≈ 66 mL/min.",
          ],
          answer: "CL ≈ 3.94 L/h (model check 3.99 L/h).",
          note: "The two values differ by about 1%. Straight trapezia lie slightly above a curve that bends downwards, so the linear trapezoidal rule slightly overestimates AUC during a decline (here 126.9 against the model's C₀/kₑ = 125.3), and CL from Dose/AUC comes out slightly lower. Wider sampling intervals make the gap larger.",
        },
      ],
    },
    {
      id: "bioavailability",
      heading: "Absolute and relative bioavailability",
      blocks: [
        {
          kind: "p",
          text: "Because clearance does not depend on the route, the AUC produced by a dose is proportional to the amount that actually reaches the circulation. Comparing AUCs therefore compares the fractions absorbed — provided each AUC is first divided by its own dose, and AUC₀–∞ is used for both.",
        },
        {
          kind: "formula",
          expr: "F(absolute) = (AUC_oral × Dose_IV) / (AUC_IV × Dose_oral)",
          note: "Equivalent to (AUC_oral/Dose_oral) ÷ (AUC_IV/Dose_IV). It assumes the same clearance on both occasions, usually ensured by a crossover study in the same subjects.",
        },
        {
          kind: "formula",
          expr: "F(relative) = (AUC_test / Dose_test) ÷ (AUC_reference / Dose_reference)",
          note: "Compares two non-IV products, for example a new tablet against an oral suspension. It can exceed 1 (100%) if the test product is better absorbed than the reference.",
        },
        {
          kind: "example",
          title: "Absolute bioavailability of an oral tablet",
          problem: "Drug X (illustrative): a 50 mg IV dose gives AUC₀–∞ = 12.5 mg·h/L; a 100 mg oral tablet in the same subjects gives AUC₀–∞ = 17.0 mg·h/L. Find F.",
          steps: [
            "F = (AUC_oral × Dose_IV) / (AUC_IV × Dose_oral).",
            "F = (17.0 × 50) / (12.5 × 100) = 850 / 1250.",
            "F = 0.68.",
          ],
          answer: "F = 0.68, i.e. 68% of the oral dose reaches the systemic circulation.",
          note: "Without dose normalisation, 17.0 ÷ 12.5 would wrongly give 1.36.",
        },
        {
          kind: "example",
          title: "Relative bioavailability of a test tablet",
          problem: "A 250 mg test tablet gives AUC₀–∞ = 40.2 mg·h/L; a 200 mg reference suspension gives 36.0 mg·h/L (illustrative). Find the relative bioavailability.",
          steps: [
            "Dose-normalised test AUC = 40.2 ÷ 250 = 0.1608 h/L.",
            "Dose-normalised reference AUC = 36.0 ÷ 200 = 0.1800 h/L.",
            "F(relative) = 0.1608 ÷ 0.1800 = 0.893.",
          ],
          answer: "F(relative) ≈ 0.89 (89.3%).",
        },
      ],
    },
    {
      id: "steady-state",
      heading: "Repeated dosing: accumulation and time to steady state",
      blocks: [
        {
          kind: "p",
          text: "If a dose is given again before the previous one has been eliminated, drug accumulates. It does not accumulate forever: as the amount in the body rises, so does the amount eliminated per interval, until elimination over one interval equals one dose. That balance is steady state.",
        },
        {
          kind: "p",
          text: "How long steady state takes depends only on the half-life, not on the dose or the interval. After n half-lives of constant dosing the fraction of steady state reached is 1 − (½)ⁿ.",
        },
        {
          kind: "table",
          caption: "Fraction of steady state reached after constant dosing, by number of half-lives",
          head: ["Half-lives elapsed", "Fraction of steady state"],
          rows: [
            ["1", "50%"],
            ["2", "75%"],
            ["3", "87.5%"],
            ["3.32", "90%"],
            ["4", "93.8%"],
            ["5", "96.9%"],
            ["7", "99.2%"],
          ],
        },
        {
          kind: "p",
          text: "That is why steady state is said to take about 4–5 half-lives: by then the concentrations are within roughly 3–6% of their final values.",
        },
        {
          kind: "formula",
          expr: "R = 1 / (1 − e^(−kₑτ))",
          where: [
            { sym: "R", meaning: "accumulation factor (steady-state level ÷ first-dose level at the same time after a dose)" },
            { sym: "τ", meaning: "dosing interval (h)" },
          ],
          note: "If τ equals one half-life, e^(−kₑτ) = ½ and R = 2. A shorter interval relative to t½ means more accumulation.",
        },
        {
          kind: "example",
          title: "Accumulation for a 12-hourly regimen",
          problem: "Drug Y (illustrative) has t½ = 8 h and is given every 12 h. Find the accumulation factor and the time to reach 90% of steady state.",
          steps: [
            "kₑ = 0.693 ÷ 8 = 0.0866 h⁻¹.",
            "kₑτ = 0.0866 × 12 = 1.0395.",
            "e^(−1.0395) = 0.3536, so R = 1 / (1 − 0.3536) = 1.547.",
            "90% of steady state takes 3.32 half-lives = 3.32 × 8 = 26.6 h.",
          ],
          answer: "R ≈ 1.55; about 27 h to reach 90% of steady state (about 40 h for 5 half-lives).",
        },
      ],
    },
    {
      id: "dosing-concepts",
      heading: "Loading and maintenance doses — the concepts",
      blocks: [
        {
          kind: "p",
          text: "The same parameters explain the two dose types students meet in therapeutics. A loading dose fills the volume of distribution up to a target concentration straight away, so the patient does not wait 4–5 half-lives. A maintenance dose replaces what clearance removes, so the target is held.",
        },
        {
          kind: "formula",
          expr: "Loading dose = Css(target) × Vd / F          Maintenance dose rate = CL × Css(target) / F",
          note: "The maintenance dose for an interval τ is (CL × Css × τ) / F. For an IV route F = 1.",
        },
        {
          kind: "example",
          title: "Illustrative arithmetic only",
          problem: "Drug Z is entirely fictional: target average Css 10 mg/L, Vd 40 L, CL 4 L/h, oral F = 0.8. Show how the formulas combine.",
          steps: [
            "Loading dose = 10 mg/L × 40 L ÷ 0.8 = 500 mg.",
            "Maintenance dose rate = 4 L/h × 10 mg/L ÷ 0.8 = 50 mg/h.",
            "Over a 12-hour interval: 50 mg/h × 12 h = 600 mg.",
          ],
          answer: "Loading dose 500 mg; maintenance 50 mg/h (600 mg per 12 h) — for this fictional drug only.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Not for real dosing",
          text: "These formulas teach how the parameters interact. Real doses are chosen from validated, drug-specific references and product information, adjusted for the patient's renal and hepatic function, age, weight and interacting drugs, and confirmed by clinical judgement and, where appropriate, drug-level monitoring. Population values of Vd, CL and F vary widely between patients.",
        },
      ],
    },
  ],
  mistakes: [
    "Taking the slope of a log₁₀ C plot as kₑ. The log₁₀ slope is −kₑ/2.303; multiply by 2.303 (or use ln C throughout) before calculating t½.",
    "Forgetting the minus sign: the ln C slope is negative, but kₑ is reported as a positive number in h⁻¹.",
    "Mixing concentration units. 1 µg/mL = 1 mg/L, but 1 µg/L is a thousand times smaller; Vd from 500 mg ÷ 25 µg/L would come out 1000-fold too large.",
    "Reporting AUC₀–t as if it were AUC₀–∞. Without the C_last/kₑ tail, clearance from Dose/AUC is overestimated and bioavailability comparisons can be biased.",
    "Calculating bioavailability from the AUC ratio alone when the two doses differ. Each AUC must be divided by its own dose first.",
    "Giving clearance in mg/h. Clearance is a volume per time (L/h or mL/min); mg/h is the elimination rate, which equals CL × C.",
    "Using the first, curved points of an oral or two-compartment profile to estimate kₑ. Only the straight terminal phase gives the elimination rate constant.",
    "Expecting a larger dose or a shorter interval to reach steady state faster. Time to steady state depends on half-life alone; dose changes only the level reached.",
  ],
  practice: [
    {
      q: "A drug has kₑ = 0.25 h⁻¹. What is its half-life?",
      answer: "t½ ≈ 2.77 h",
      working: ["t½ = 0.693 / kₑ.", "t½ = 0.693 ÷ 0.25 = 2.772 h."],
    },
    {
      q: "A student plots log₁₀ C against time and finds a slope of −0.0652 h⁻¹. Find kₑ and t½.",
      answer: "kₑ ≈ 0.150 h⁻¹; t½ ≈ 4.62 h",
      working: [
        "kₑ = −slope × 2.303 = 0.0652 × 2.303 = 0.15016 h⁻¹.",
        "t½ = 0.693 ÷ 0.15016 = 4.62 h.",
      ],
    },
    {
      q: "A 300 mg IV bolus gives a back-extrapolated C₀ of 7.5 µg/mL. Calculate Vd.",
      answer: "Vd = 40 L",
      working: ["Convert: 7.5 µg/mL = 7.5 mg/L.", "Vd = Dose / C₀ = 300 mg ÷ 7.5 mg/L = 40 L."],
    },
    {
      q: "After a 200 mg IV bolus, concentrations are 10, 8.0, 6.4 and 4.1 mg/L at 0, 1, 2 and 4 h, and kₑ = 0.22 h⁻¹. Calculate AUC₀–∞ and CL.",
      answer: "AUC₀–∞ ≈ 45.3 mg·h/L; CL ≈ 4.41 L/h",
      working: [
        "0–1 h: 1 × (10 + 8.0)/2 = 9.0 mg·h/L.",
        "1–2 h: 1 × (8.0 + 6.4)/2 = 7.2 mg·h/L.",
        "2–4 h: 2 × (6.4 + 4.1)/2 = 10.5 mg·h/L.",
        "AUC₀–4 = 9.0 + 7.2 + 10.5 = 26.7 mg·h/L.",
        "Tail = C_last / kₑ = 4.1 ÷ 0.22 = 18.64 mg·h/L.",
        "AUC₀–∞ = 26.7 + 18.64 = 45.34 mg·h/L.",
        "CL = Dose / AUC₀–∞ = 200 ÷ 45.34 = 4.41 L/h.",
      ],
    },
    {
      q: "A 25 mg IV dose gives AUC₀–∞ = 5.0 mg·h/L and a 50 mg oral dose gives AUC₀–∞ = 7.2 mg·h/L in the same subjects. Calculate the absolute bioavailability.",
      answer: "F = 0.72 (72%)",
      working: [
        "F = (AUC_oral × Dose_IV) / (AUC_IV × Dose_oral).",
        "F = (7.2 × 25) / (5.0 × 50) = 180 / 250 = 0.72.",
      ],
    },
    {
      q: "A drug with t½ = 6 h is given every 6 h. What is the accumulation factor? What would it be if it were given every 12 h instead?",
      answer: "R = 2.0 every 6 h; R ≈ 1.33 every 12 h",
      working: [
        "τ = 6 h is one half-life, so e^(−kₑτ) = 0.5 and R = 1 / (1 − 0.5) = 2.0.",
        "τ = 12 h is two half-lives, so e^(−kₑτ) = 0.25 and R = 1 / (1 − 0.25) = 1.33.",
      ],
    },
    {
      q: "A drug has kₑ = 0.1 h⁻¹ and Vd = 35 L. Calculate its clearance in L/h and mL/min.",
      answer: "CL = 3.5 L/h ≈ 58.3 mL/min",
      working: ["CL = kₑ × Vd = 0.1 × 35 = 3.5 L/h.", "3.5 L/h × 1000 mL/L ÷ 60 min/h = 58.3 mL/min."],
    },
    {
      q: "A drug with t½ = 10 h is started as a constant infusion with no loading dose. How long until it reaches 90% of steady state?",
      answer: "About 33 h",
      working: [
        "Fraction reached = 1 − (½)ⁿ; set it to 0.90, so (½)ⁿ = 0.10.",
        "n = ln 10 / ln 2 = 3.32 half-lives.",
        "Time = 3.32 × 10 h = 33.2 h.",
      ],
    },
  ],
  limitations: [
    "Everything here assumes a one-compartment model. Many drugs show a distinct distribution phase (two-compartment behaviour), where C₀ and Vd from the simple back-extrapolation are not valid.",
    "Linear kinetics is assumed. Drugs with saturable metabolism or binding (non-linear, Michaelis–Menten kinetics) have a half-life and clearance that change with dose, and these formulas no longer hold.",
    "The linear trapezoidal rule slightly overestimates AUC on a declining curve; with sparse sampling the error grows. The log-trapezoidal method is often used for the declining phase in formal studies.",
    "Real bioavailability and bioequivalence studies need crossover designs, adequate sampling, validated assays and statistical analysis of many subjects; one pair of AUCs only illustrates the arithmetic.",
    "The dosing formulas are conceptual. Real dosing uses validated drug-specific references, patient factors and clinical judgement, not these equations with textbook averages.",
  ],
  refs: ["shargel8", "rowland5", "gibaldi"],
  relatedTools: [
    {
      slug: "ke-calculator",
      name: "Ke Calculator",
      why: "Calculates kₑ from t½ (0.693/t½) or from CL and Vd, and gives the half-life — the same relationships used in this guide.",
    },
    {
      slug: "volume-distribution-calculator",
      name: "Volume of Distribution Calculator",
      why: "Calculates Vd = Dose / C₀ for an IV bolus, as in Step 2 of the worked example.",
    },
    {
      slug: "clearance-calculator",
      name: "Clearance Calculator",
      why: "Calculates CL = Dose / AUC for a single dose, as in Step 4, and t½ = 0.693 × Vd / CL.",
    },
    {
      slug: "bioavailability-calculator",
      name: "Bioavailability Calculator",
      why: "Its AUC mode calculates dose-normalised F = (AUCₜ/Dₜ) ÷ (AUCᵣ/Dᵣ), the formula used for absolute and relative bioavailability here.",
    },
  ],
  relatedGuides: ["reaction-kinetics-drug-stability", "dose-calculations", "dilution-and-concentration"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "team-checked", checkedOn: "2026-10-12" },
    updated: "2026-10-12",
  },
};
