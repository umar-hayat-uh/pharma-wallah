import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in this guide was recomputed in Python
 * before it was written here, with kₑ = 0.693/t½ throughout (the convention
 * the linked calculators use). The drugs ("Drug X", "Drug Y", "Drug Z") are
 * invented; nothing here describes a real medicine or a real dose.
 */
export const guide: Guide = {
  slug: "multiple-dosing-and-steady-state",
  title: "Multiple Dosing, Accumulation and Steady State",
  description:
    "Why repeated doses accumulate, how to calculate the accumulation ratio, steady-state peaks, troughs and averages, and why steady state takes 4–5 half-lives.",
  category: "Biopharmaceutics & Pharmacokinetics",
  objectives: [
    "Explain why a drug given at a fixed interval accumulates and why accumulation stops at steady state.",
    "Calculate the accumulation ratio R = 1/(1 − e^(−kₑτ)) from the half-life and the dosing interval.",
    "Calculate peak and trough concentrations after the nth dose and at steady state for repeated IV bolus doses.",
    "Calculate the average steady-state concentration from F, dose, clearance and the dosing interval.",
    "Work out how long it takes to reach a given fraction of steady state, and explain why it depends only on half-life.",
    "Calculate the steady-state concentration of a constant-rate infusion.",
  ],
  intro: [
    "Most medicines are not given once. They are given every 8, 12 or 24 hours for days or months. Each new dose arrives while some of the previous dose is still in the body, so the concentrations after the second, third and fourth doses are higher than after the first. This build-up is called accumulation.",
    "Accumulation does not go on for ever. The more drug there is in the body, the more is eliminated in each interval, because first-order elimination removes a constant fraction, not a constant amount. Eventually the amount eliminated over one interval equals one dose, and every interval then looks the same. That repeating pattern is steady state.",
    "This guide uses the one-compartment model with first-order elimination, the model behind most Pharm-D biopharmaceutics questions. All drugs and numbers are illustrative. Real dosing regimens are chosen from validated, drug-specific references and clinical judgement, not from these equations alone.",
  ],
  terms: [
    { term: "Dosing interval (τ)", definition: "The fixed time between doses, in hours. τ = 12 h means a dose every 12 hours." },
    {
      term: "Accumulation",
      definition: "The rise in concentrations from one dose to the next because the previous doses have not been fully eliminated.",
    },
    {
      term: "Accumulation ratio (R)",
      definition: "Steady-state concentration divided by the concentration at the same time after the first dose. For first-order elimination, R = 1/(1 − e^(−kₑτ)). Also called the accumulation index or factor.",
    },
    {
      term: "Steady state",
      definition: "The state in which the rate of drug input averaged over an interval equals the rate of elimination, so the concentration–time profile repeats identically from one interval to the next.",
    },
    { term: "Cmax,ss and Cmin,ss", definition: "The peak and trough concentrations within a dosing interval at steady state (mg/L)." },
    {
      term: "Average steady-state concentration (Cav,ss)",
      definition: "The AUC over one dosing interval at steady state divided by τ. It is not the arithmetic mean of the peak and trough.",
    },
    {
      term: "Fluctuation",
      definition: "How much the concentration swings within an interval. For an IV bolus at steady state, Cmax,ss/Cmin,ss = e^(kₑτ).",
    },
    {
      term: "Fraction of steady state (fss)",
      definition: "How far the concentrations have risen towards their final steady-state values: fss = 1 − e^(−kₑt) after time t of regular dosing.",
    },
  ],
  sections: [
    {
      id: "why-accumulate",
      heading: "Why repeated doses accumulate",
      blocks: [
        {
          kind: "p",
          text: "Think of the fraction of drug left in the body at the end of one interval. With first-order elimination it is e^(−kₑτ), whatever the amount present. If the interval equals one half-life, half of each dose is left when the next one arrives. The second dose lands on top of that half, the third lands on top of what is left of the first two, and so on.",
        },
        {
          kind: "p",
          text: "Adding these leftovers gives a geometric series: 1 + r + r² + r³ + … where r = e^(−kₑτ). Because r is less than 1, the series converges to 1/(1 − r). That limit is the accumulation ratio, and it is the reason concentrations level off instead of rising for ever.",
        },
        {
          kind: "formula",
          expr: "R = 1 / (1 − e^(−kₑτ))          kₑ = 0.693 / t½",
          where: [
            { sym: "R", meaning: "accumulation ratio (no units)" },
            { sym: "kₑ", meaning: "first-order elimination rate constant (h⁻¹)" },
            { sym: "τ", meaning: "dosing interval (h)" },
            { sym: "t½", meaning: "elimination half-life (h)" },
          ],
          note: "R depends only on τ relative to t½. The size of the dose does not change R; it scales every concentration by the same factor.",
        },
        {
          kind: "table",
          caption: "Accumulation ratio for different intervals, expressed as τ divided by t½",
          head: ["τ / t½", "Fraction left at the next dose (e^(−kₑτ))", "R"],
          rows: [
            ["0.25", "0.841", "6.29"],
            ["0.5", "0.707", "3.41"],
            ["1", "0.500", "2.00"],
            ["2", "0.250", "1.33"],
            ["3", "0.125", "1.14"],
            ["4", "0.0625", "1.07"],
          ],
        },
        {
          kind: "p",
          text: "The table shows the pattern students should remember: dosing once every half-life doubles the levels; dosing more often than once per half-life accumulates strongly; dosing at intervals several half-lives long gives almost no accumulation, but large swings between peak and trough.",
        },
      ],
    },
    {
      id: "peaks-troughs",
      heading: "Peaks and troughs after repeated IV bolus doses",
      blocks: [
        {
          kind: "p",
          text: "For repeated IV bolus doses in a one-compartment body, each dose raises the concentration instantly by C₀ = Dose/Vd. The peak after the nth dose is the sum of what is left of all n doses at that moment.",
        },
        {
          kind: "formula",
          expr: "Cmax,n = C₀ × (1 − e^(−n·kₑτ)) / (1 − e^(−kₑτ))          Cmin,n = Cmax,n × e^(−kₑτ)",
          where: [
            { sym: "Cmax,n", meaning: "peak just after the nth dose (mg/L)" },
            { sym: "Cmin,n", meaning: "trough just before the (n + 1)th dose (mg/L)" },
            { sym: "C₀", meaning: "concentration produced by one dose, Dose/Vd (mg/L)" },
            { sym: "n", meaning: "number of doses given" },
          ],
        },
        {
          kind: "formula",
          expr: "Cmax,ss = C₀ / (1 − e^(−kₑτ)) = C₀ × R          Cmin,ss = Cmax,ss × e^(−kₑτ)",
          note: "As n grows, e^(−n·kₑτ) shrinks towards zero and the nth-dose equation becomes the steady-state equation.",
        },
        {
          kind: "example",
          title: "Peaks and troughs of Drug X given every 8 hours",
          problem:
            "Drug X (illustrative) is given as 100 mg IV bolus every 8 h. Vd = 20 L and t½ = 6 h. Find kₑ, R, the peak and trough after doses 1, 2 and 3, and the peak and trough at steady state.",
          steps: [
            "kₑ = 0.693 ÷ 6 = 0.1155 h⁻¹; kₑτ = 0.1155 × 8 = 0.924.",
            "Fraction left at the next dose: e^(−0.924) = 0.3969.",
            "R = 1 ÷ (1 − 0.3969) = 1.658.",
            "C₀ = Dose/Vd = 100 mg ÷ 20 L = 5.0 mg/L.",
            "Dose 1: Cmax = 5.00 mg/L; Cmin = 5.00 × 0.3969 = 1.98 mg/L.",
            "Dose 2: Cmax = 5.0 × (1 − e^(−1.848)) ÷ (1 − 0.3969) = 6.98 mg/L; Cmin = 2.77 mg/L.",
            "Dose 3: Cmax = 5.0 × (1 − e^(−2.772)) ÷ (1 − 0.3969) = 7.77 mg/L; Cmin = 3.09 mg/L.",
            "Steady state: Cmax,ss = 5.0 × 1.658 = 8.29 mg/L; Cmin,ss = 8.29 × 0.3969 = 3.29 mg/L.",
          ],
          answer: "R ≈ 1.66; steady-state peak ≈ 8.29 mg/L and trough ≈ 3.29 mg/L.",
          note: "Each dose adds a smaller rise than the one before: the peaks go 5.00 → 6.98 → 7.77 → … → 8.29 mg/L.",
        },
        {
          kind: "p",
          text: "Notice that the steady-state peak (8.29 mg/L) is exactly R times the first peak (5.00 mg/L), and the steady-state trough is R times the first trough (1.98 × 1.658 = 3.29 mg/L). That is what the accumulation ratio means.",
        },
      ],
    },
    {
      id: "average-css",
      heading: "The average steady-state concentration",
      blocks: [
        {
          kind: "p",
          text: "At steady state, everything that goes in during one interval must come out during that interval. The amount absorbed per interval is F × Dose; the amount eliminated is CL × AUC over the interval. Setting them equal gives the average steady-state concentration, which holds for any route and any absorption pattern as long as kinetics are linear.",
        },
        {
          kind: "formula",
          expr: "Cav,ss = F × Dose / (CL × τ)",
          where: [
            { sym: "Cav,ss", meaning: "average steady-state concentration (mg/L)" },
            { sym: "F", meaning: "bioavailability, a fraction (1 for IV)" },
            { sym: "Dose", meaning: "dose given each interval (mg)" },
            { sym: "CL", meaning: "clearance (L/h)" },
            { sym: "τ", meaning: "dosing interval (h)" },
          ],
          note: "Equivalent to AUC₀–τ at steady state ÷ τ, which equals the single-dose AUC₀–∞ ÷ τ.",
        },
        {
          kind: "example",
          title: "Average level of Drug X",
          problem: "Use the Drug X regimen above (100 mg IV every 8 h, kₑ = 0.1155 h⁻¹, Vd = 20 L). Find CL and Cav,ss.",
          steps: [
            "CL = kₑ × Vd = 0.1155 × 20 = 2.31 L/h.",
            "Cav,ss = F × Dose / (CL × τ) = 1 × 100 ÷ (2.31 × 8) = 5.41 mg/L.",
            "Check: single-dose AUC₀–∞ = C₀/kₑ = 5.0 ÷ 0.1155 = 43.29 mg·h/L; ÷ 8 h = 5.41 mg/L.",
          ],
          answer: "Cav,ss ≈ 5.41 mg/L.",
          note: "The arithmetic mean of the peak and trough, (8.29 + 3.29)/2 = 5.79 mg/L, is not the average concentration, because the curve is exponential, not straight.",
        },
        {
          kind: "example",
          title: "Average level of an oral regimen",
          problem: "Drug Z (illustrative) is given orally as 500 mg every 12 h. F = 0.75 and CL = 4 L/h. Find Cav,ss.",
          steps: ["Cav,ss = F × Dose / (CL × τ).", "Cav,ss = 0.75 × 500 ÷ (4 × 12) = 375 ÷ 48 = 7.81 mg/L."],
          answer: "Cav,ss ≈ 7.81 mg/L.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Same daily dose, different swings",
          text: "Cav,ss depends on the dosing rate (Dose/τ), not on how the daily amount is split. 200 mg every 12 h and 100 mg every 6 h give the same average, but the 6-hourly regimen gives a flatter profile with a lower peak and a higher trough.",
        },
      ],
    },
    {
      id: "time-to-ss",
      heading: "How long until steady state?",
      blocks: [
        {
          kind: "p",
          text: "With constant dosing the concentrations approach steady state along the curve 1 − e^(−kₑt). Because kₑ = 0.693/t½, after n half-lives the fraction reached is 1 − (½)ⁿ. The dose and the interval do not appear: the approach to steady state is governed by half-life alone.",
        },
        {
          kind: "formula",
          expr: "fss = 1 − e^(−kₑt) = 1 − (½)^(t/t½)          t(for fss) = ln(1/(1 − fss)) / kₑ",
          where: [
            { sym: "fss", meaning: "fraction of steady state reached (0 to 1)" },
            { sym: "t", meaning: "time since regular dosing began (h)" },
          ],
          note: "For repeated doses, set t = n × τ to get the fraction reached after n doses (comparing like with like, e.g. peak to steady-state peak).",
        },
        {
          kind: "table",
          caption: "Fraction of steady state reached, by number of half-lives of regular dosing",
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
          kind: "example",
          title: "Time to 90% of steady state for Drug X",
          problem: "For Drug X (t½ = 6 h, dosed every 8 h), when are concentrations at 90% of steady state, and what fraction is reached after 3 doses?",
          steps: [
            "Time to 90% = ln(10) ÷ kₑ = 2.3026 ÷ 0.1155 = 19.9 h (that is 3.32 half-lives × 6 h).",
            "After 3 doses, t = 3 × 8 = 24 h: fss = 1 − e^(−0.1155 × 24) = 1 − 0.0625 = 0.937.",
            "Check with the peaks from the earlier example: 7.77 ÷ 8.29 = 0.937.",
          ],
          answer: "About 20 h to reach 90%; 93.7% of steady state after the third dose.",
        },
        {
          kind: "p",
          text: "This is the reason clinicians speak of 4–5 half-lives to steady state. For a drug with a 6-hour half-life that is about a day; for a drug with a 3-day half-life it is two to three weeks. When waiting that long is not acceptable, a loading dose is used to reach the target straight away. How to choose a loading dose for a real drug is a clinical decision made from validated references.",
        },
      ],
    },
    {
      id: "infusion",
      heading: "Constant-rate infusion: the limit of very frequent dosing",
      blocks: [
        {
          kind: "p",
          text: "A constant IV infusion is repeated dosing with an infinitely short interval. There are no peaks or troughs; the concentration rises smoothly to a plateau where the infusion rate equals the elimination rate CL × Css.",
        },
        {
          kind: "formula",
          expr: "Css = k₀ / CL          C(t) = Css × (1 − e^(−kₑt))",
          where: [
            { sym: "k₀", meaning: "infusion rate (mg/h)" },
            { sym: "Css", meaning: "steady-state concentration (mg/L)" },
            { sym: "CL", meaning: "clearance (L/h)" },
          ],
        },
        {
          kind: "example",
          title: "Infusion of Drug Y",
          problem: "Drug Y (illustrative) is infused at 30 mg/h. CL = 2.5 L/h and t½ = 10 h. Find Css and the time to reach 95% of it.",
          steps: [
            "Css = k₀ / CL = 30 ÷ 2.5 = 12 mg/L.",
            "kₑ = 0.693 ÷ 10 = 0.0693 h⁻¹.",
            "Time to 95% = ln(1/0.05) ÷ kₑ = ln 20 ÷ 0.0693 = 2.9957 ÷ 0.0693 = 43.2 h (4.32 half-lives).",
          ],
          answer: "Css = 12 mg/L, reached to within 5% after about 43 h.",
          note: "Doubling the infusion rate would double Css to 24 mg/L but would not shorten the 43 h.",
        },
      ],
    },
  ],
  mistakes: [
    "Thinking a bigger dose reaches steady state faster. The time to steady state depends only on half-life; the dose changes the level reached.",
    "Thinking a bigger dose increases the accumulation ratio. R = 1/(1 − e^(−kₑτ)) contains no dose term.",
    "Using the arithmetic mean of peak and trough as Cav,ss. Cav,ss = F × Dose/(CL × τ), which is lower than (Cmax + Cmin)/2 for an exponential decline.",
    "Forgetting F for oral doses. Only the bioavailable fraction F × Dose enters the circulation.",
    "Mixing time units: kₑ in h⁻¹ must be multiplied by τ in hours. A τ of 1 day must be entered as 24 h.",
    "Confusing 'after 4 half-lives' with 'after 4 doses'. They are the same only when τ equals t½; in general fss after n doses is 1 − e^(−n·kₑτ).",
    "Applying these equations to a drug with saturable (Michaelis–Menten) elimination. There, steady state rises disproportionately with dose and takes longer to reach at higher doses.",
    "Assuming clearance stays constant. If renal or hepatic function falls during treatment, kₑ falls, and both R and the steady-state level rise.",
  ],
  practice: [
    {
      q: "A drug with t½ = 12 h is given every 12 h. What is the accumulation ratio?",
      answer: "R = 2.0",
      working: ["kₑτ = (0.693 ÷ 12) × 12 = 0.693, so e^(−kₑτ) = 0.5.", "R = 1 ÷ (1 − 0.5) = 2.0."],
    },
    {
      q: "A drug with t½ = 4 h is given every 8 h. Calculate R.",
      answer: "R ≈ 1.33",
      working: ["τ is two half-lives, so e^(−kₑτ) = 0.25.", "R = 1 ÷ (1 − 0.25) = 1.333."],
    },
    {
      q: "A drug has t½ = 24 h. Compare R for dosing every 24 h and every 12 h.",
      answer: "R = 2.0 every 24 h; R ≈ 3.41 every 12 h",
      working: [
        "Every 24 h: τ = t½, so e^(−kₑτ) = 0.5 and R = 2.0.",
        "Every 12 h: τ = 0.5 t½, so e^(−kₑτ) = 0.5^0.5 = 0.7071 and R = 1 ÷ (1 − 0.7071) = 3.41.",
      ],
    },
    {
      q: "An oral drug (F = 0.8) is given as 250 mg every 12 h. CL = 5 L/h. Calculate Cav,ss.",
      answer: "Cav,ss ≈ 3.33 mg/L",
      working: ["Cav,ss = F × Dose / (CL × τ).", "Cav,ss = 0.8 × 250 ÷ (5 × 12) = 200 ÷ 60 = 3.33 mg/L."],
    },
    {
      q: "A drug is infused at 20 mg/h. CL = 4 L/h and t½ = 7 h. Find Css and the time to reach 90% of it.",
      answer: "Css = 5 mg/L; about 23 h",
      working: [
        "Css = k₀ / CL = 20 ÷ 4 = 5 mg/L.",
        "90% of steady state takes 3.32 half-lives.",
        "3.32 × 7 h = 23.2 h (ln 10 ÷ (0.693/7) = 23.3 h without rounding 3.32).",
      ],
    },
    {
      q: "A drug is given as 200 mg IV bolus every 6 h. Vd = 40 L and kₑ = 0.1 h⁻¹. Calculate Cmax,ss and Cmin,ss.",
      answer: "Cmax,ss ≈ 11.08 mg/L; Cmin,ss ≈ 6.08 mg/L",
      working: [
        "C₀ = 200 ÷ 40 = 5.0 mg/L.",
        "kₑτ = 0.1 × 6 = 0.6; e^(−0.6) = 0.5488.",
        "Cmax,ss = 5.0 ÷ (1 − 0.5488) = 11.08 mg/L.",
        "Cmin,ss = 11.08 × 0.5488 = 6.08 mg/L.",
      ],
    },
    {
      q: "A drug with t½ = 8 h is given every 8 h. What fraction of steady state has been reached after 3 doses?",
      answer: "87.5%",
      working: ["After 3 doses, t = 3 × 8 = 24 h = 3 half-lives.", "fss = 1 − (½)³ = 1 − 0.125 = 0.875."],
    },
    {
      q: "A drug with t½ = 6 h is given as an IV bolus every 12 h. What is the ratio of the steady-state peak to the steady-state trough?",
      answer: "Cmax,ss / Cmin,ss = 4.0",
      working: [
        "Cmax,ss / Cmin,ss = e^(kₑτ).",
        "kₑτ = (0.693 ÷ 6) × 12 = 1.386.",
        "e^1.386 = 4.0 (τ is two half-lives, so the level halves twice: 2 × 2 = 4).",
      ],
    },
  ],
  limitations: [
    "All equations assume first-order (linear) elimination and constant clearance. They fail for drugs with saturable elimination and for patients whose organ function is changing.",
    "The peak and trough equations are for IV bolus doses in a one-compartment model. Oral doses have an absorption phase, so real peaks are lower and later; Cav,ss = F × Dose/(CL × τ) still holds.",
    "Real patients miss doses and take them at uneven times; the equations describe an idealised regimen.",
    "Two-compartment drugs have a distribution phase, so the 'fraction left at the next dose' is not a single exponential.",
    "These are teaching calculations. Real regimens and loading doses are chosen from validated drug-specific references, patient factors and clinical judgement, with drug-level monitoring where appropriate.",
  ],
  refs: ["shargel8", "rowland5", "gibaldi"],
  relatedTools: [
    {
      slug: "accumulation-index-calculator",
      name: "Accumulation Index Calculator",
      why: "Calculates the accumulation ratio R = 1/(1 − e^(−kτ)) from half-life and dosing interval with k = 0.693/t½, the same formula as this guide. Use it for R; for the fraction of steady state use the table in this guide.",
    },
    {
      slug: "ke-calculator",
      name: "Ke Calculator",
      why: "Converts a half-life into kₑ = 0.693/t½ (or kₑ = CL/Vd), the first step of every calculation in this guide.",
    },
  ],
  relatedGuides: [
    "pharmacokinetic-parameters",
    "nonlinear-michaelis-menten-kinetics",
    "non-compartmental-analysis",
    "dose-calculations",
  ],
  meta: { author: TEAM_AUTHOR, review: { status: "draft" }, updated: "2026-10-13" },
};
