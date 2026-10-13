import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in this guide was recomputed in Python
 * before it was written here. Drug X and Drug Y are invented, with Vmax and Km
 * values chosen for teaching; nothing here is a dose for a real medicine.
 *
 * Reviewer note: the time-to-90%-of-steady-state expression in the
 * "slow-to-steady-state" section is the standard clinical-PK textbook form;
 * please confirm it against rowland5 before publishing.
 */
export const guide: Guide = {
  slug: "nonlinear-michaelis-menten-kinetics",
  title: "Non-Linear (Michaelis–Menten) Pharmacokinetics",
  description:
    "Why saturable elimination makes steady-state levels rise out of proportion to dose: the Michaelis–Menten equation, Css, apparent clearance and half-life.",
  category: "Biopharmaceutics & Pharmacokinetics",
  objectives: [
    "Write the Michaelis–Menten equation for drug elimination and define Vmax and Km with their units.",
    "Explain why elimination is approximately first-order when C ≪ Km and approximately zero-order when C ≫ Km.",
    "Calculate the steady-state concentration for a given dosing rate, and show that it rises disproportionately with dose.",
    "Estimate Vmax and Km from two steady-state dose–concentration pairs.",
    "Calculate apparent clearance and apparent half-life at different concentrations, and the time to fall between two concentrations.",
  ],
  intro: [
    "Most of pharmacokinetics assumes linear (first-order) elimination: double the dose and every concentration doubles; the half-life is the same at every dose. That assumption holds because, at normal concentrations, the enzymes and transporters that remove a drug are far from saturated.",
    "For some drugs the eliminating enzymes can be saturated within the range of concentrations used clinically. Phenytoin, ethanol and high-dose salicylate are the classic textbook examples. Once the enzymes approach their maximum capacity, a small increase in dose can produce a large increase in concentration, and the drug takes much longer to clear. This is non-linear, or Michaelis–Menten, pharmacokinetics.",
    "This guide shows how the Michaelis–Menten equation describes that behaviour, and how to calculate with it. All drugs and parameter values are illustrative. Dosing of real drugs with non-linear kinetics relies on validated references, careful drug-level monitoring and clinical judgement.",
  ],
  terms: [
    {
      term: "Saturable elimination",
      definition: "Elimination by a process (usually an enzyme) with a limited capacity, so the elimination rate cannot rise above a maximum however high the concentration.",
    },
    {
      term: "Vmax",
      definition: "The maximum rate of elimination when the process is fully saturated. As an amount rate (mg/day) or, divided by Vd, as a concentration rate (mg/L per h).",
    },
    {
      term: "Km (Michaelis constant)",
      definition: "The concentration at which the elimination rate is half of Vmax (mg/L). A low Km means the process saturates at low concentrations.",
    },
    {
      term: "First-order region",
      definition: "Concentrations much lower than Km, where the elimination rate is approximately proportional to concentration.",
    },
    {
      term: "Zero-order region",
      definition: "Concentrations much higher than Km, where the elimination rate is approximately constant at Vmax.",
    },
    {
      term: "Apparent clearance",
      definition: "Elimination rate divided by concentration. For Michaelis–Menten kinetics it is Vmax/(Km + C), and falls as C rises.",
    },
    {
      term: "Apparent half-life",
      definition: "The half-life calculated as 0.693 × Vd / CL at a given concentration. Not constant in non-linear kinetics: it lengthens as C rises.",
    },
    {
      term: "Dosing rate (R)",
      definition: "The average amount of drug entering the body per unit time (mg/day), for example dose × F ÷ dosing interval.",
    },
  ],
  sections: [
    {
      id: "equation",
      heading: "The Michaelis–Menten equation",
      blocks: [
        {
          kind: "p",
          text: "Michaelis–Menten kinetics comes from enzyme chemistry: an enzyme binds its substrate, converts it, and releases the product. When there is little substrate, most enzyme molecules are free and the rate rises in proportion to the substrate. When substrate is abundant, every enzyme molecule is busy and the rate levels off at a maximum. Drug elimination by a saturable enzyme follows the same curve.",
        },
        {
          kind: "formula",
          expr: "Rate of elimination = Vmax × C / (Km + C)",
          where: [
            { sym: "Vmax", meaning: "maximum elimination rate (mg/day, or mg/L per h if divided by Vd)" },
            { sym: "C", meaning: "plasma drug concentration (mg/L)" },
            { sym: "Km", meaning: "concentration giving half the maximum rate (mg/L)" },
          ],
          note: "At C = Km the rate is exactly Vmax/2.",
        },
        {
          kind: "list",
          items: [
            "When C ≪ Km: Km + C ≈ Km, so rate ≈ (Vmax/Km) × C. The rate is proportional to C: first-order, with an apparent rate constant Vmax/Km (if Vmax is in concentration units).",
            "When C ≫ Km: Km + C ≈ C, so rate ≈ Vmax. The rate is constant: zero-order.",
            "Between the two, the drug shows mixed behaviour, and that is where most of the clinical difficulty lies.",
          ],
        },
        {
          kind: "example",
          title: "Checking the first-order approximation",
          problem: "Drug Y (illustrative) has Vmax = 3 mg/L per h and Km = 30 mg/L. Calculate the elimination rate at C = 0.5 mg/L exactly and with the first-order approximation.",
          steps: [
            "Exact: 3 × 0.5 ÷ (30 + 0.5) = 1.5 ÷ 30.5 = 0.0492 mg/L per h.",
            "First-order approximation: (Vmax/Km) × C = (3 ÷ 30) × 0.5 = 0.0500 mg/L per h.",
          ],
          answer: "0.0492 versus 0.0500 mg/L per h — less than 2% apart, because C is only 1/60 of Km.",
        },
      ],
    },
    {
      id: "steady-state",
      heading: "Steady state: why concentrations rise out of proportion",
      blocks: [
        {
          kind: "p",
          text: "At steady state the dosing rate equals the elimination rate. Writing the Michaelis–Menten equation with Vmax in mg/day and solving for the concentration gives the key equation of non-linear kinetics.",
        },
        {
          kind: "formula",
          expr: "R = Vmax × Css / (Km + Css)     so     Css = Km × R / (Vmax − R)",
          where: [
            { sym: "R", meaning: "dosing rate (mg/day), already multiplied by F for an oral product" },
            { sym: "Css", meaning: "steady-state concentration (mg/L)" },
            { sym: "Vmax", meaning: "maximum elimination rate (mg/day)" },
            { sym: "Km", meaning: "Michaelis constant (mg/L)" },
          ],
          note: "As R approaches Vmax, the denominator approaches zero and Css rises steeply. If R ≥ Vmax, no steady state exists: the drug keeps accumulating.",
        },
        {
          kind: "table",
          caption: "Steady-state concentration of Drug X (illustrative: Vmax = 500 mg/day, Km = 4 mg/L) at different dosing rates",
          head: ["Dosing rate R (mg/day)", "R as a fraction of Vmax", "Css (mg/L)"],
          rows: [
            ["100", "0.2", "1.0"],
            ["200", "0.4", "2.67"],
            ["300", "0.6", "6.0"],
            ["350", "0.7", "9.33"],
            ["400", "0.8", "16.0"],
            ["450", "0.9", "36.0"],
          ],
        },
        {
          kind: "example",
          title: "A modest dose increase for Drug X",
          problem: "Drug X (Vmax = 500 mg/day, Km = 4 mg/L) is given at 300 mg/day. The dosing rate is raised to 350 mg/day, and separately to 400 mg/day. Compare the percentage changes in dose and in Css.",
          steps: [
            "At 300 mg/day: Css = 4 × 300 ÷ (500 − 300) = 1200 ÷ 200 = 6.0 mg/L.",
            "At 350 mg/day: Css = 4 × 350 ÷ 150 = 9.33 mg/L. Dose +16.7%, Css +55.6%.",
            "At 400 mg/day: Css = 4 × 400 ÷ 100 = 16.0 mg/L. Dose +33.3%, Css +166.7%.",
          ],
          answer: "A one-third increase in dose raises Css by 167% (6.0 → 16.0 mg/L).",
          note: "With linear kinetics a 33% increase in dose would raise Css by exactly 33%. This disproportion is why small dose changes are used for drugs with saturable elimination.",
        },
      ],
    },
    {
      id: "estimate-parameters",
      heading: "Estimating Vmax and Km from two steady states",
      blocks: [
        {
          kind: "p",
          text: "Rearranging R = Vmax × Css/(Km + Css) gives a straight line: R = Vmax − Km × (R/Css). Plotting R against R/Css gives a slope of −Km and an intercept of Vmax. With two steady-state pairs measured in the same patient, the two parameters can be solved directly.",
        },
        {
          kind: "formula",
          expr: "Km = (R₂ − R₁) / (R₁/Css₁ − R₂/Css₂)          Vmax = R₁ + Km × (R₁/Css₁)",
          where: [
            { sym: "R₁, R₂", meaning: "two different dosing rates (mg/day)" },
            { sym: "Css₁, Css₂", meaning: "the steady-state concentrations they produced (mg/L)" },
          ],
          note: "Both concentrations must be true steady-state values, which for a saturable drug can take a long time to reach.",
        },
        {
          kind: "example",
          title: "Recovering Vmax and Km for Drug X",
          problem: "A patient on Drug X has Css = 6 mg/L at 300 mg/day and Css = 16 mg/L at 400 mg/day. Estimate Km and Vmax.",
          steps: [
            "R₁/Css₁ = 300 ÷ 6 = 50 L/day; R₂/Css₂ = 400 ÷ 16 = 25 L/day.",
            "Km = (400 − 300) ÷ (50 − 25) = 100 ÷ 25 = 4 mg/L.",
            "Vmax = 300 + 4 × 50 = 500 mg/day.",
          ],
          answer: "Km = 4 mg/L; Vmax = 500 mg/day.",
          note: "R/Css is the apparent clearance at each steady state. It fell from 50 to 25 L/day as the concentration rose — the signature of saturation.",
        },
      ],
    },
    {
      id: "clearance-half-life",
      heading: "Clearance and half-life are no longer constants",
      blocks: [
        {
          kind: "formula",
          expr: "CL(apparent) = Vmax / (Km + C)          t½(apparent) = 0.693 × Vd × (Km + C) / Vmax",
          where: [
            { sym: "CL(apparent)", meaning: "clearance at concentration C (L/day when Vmax is in mg/day)" },
            { sym: "Vd", meaning: "volume of distribution (L)" },
          ],
          note: "Both depend on C. As concentration rises, clearance falls and half-life lengthens.",
        },
        {
          kind: "table",
          caption: "Drug X (Vmax = 500 mg/day, Km = 4 mg/L, Vd = 50 L): apparent clearance and half-life at three concentrations",
          head: ["C (mg/L)", "CL (L/day)", "Apparent t½ (h)"],
          rows: [
            ["1", "100", "8.3"],
            ["4", "62.5", "13.3"],
            ["20", "20.8", "39.9"],
          ],
        },
        {
          kind: "p",
          text: "Because half-life is not constant, the time to eliminate a drug cannot be found by counting half-lives. It is found from the integrated Michaelis–Menten equation, written here with Vmax in concentration units (Vmax divided by Vd).",
        },
        {
          kind: "formula",
          expr: "t = [Km × ln(C₁/C₂) + (C₁ − C₂)] / Vmax′",
          where: [
            { sym: "t", meaning: "time for the concentration to fall from C₁ to C₂ (h)" },
            { sym: "Vmax′", meaning: "Vmax/Vd, the maximum rate of fall of concentration (mg/L per h)" },
          ],
          note: "The Km × ln term is the first-order part; the (C₁ − C₂) term is the zero-order part.",
        },
        {
          kind: "example",
          title: "How long to fall from 30 to 10 mg/L?",
          problem: "Drug Y (illustrative) has Km = 5 mg/L and Vmax′ = 1.5 mg/L per h. How long does the concentration take to fall from 30 to 10 mg/L? Compare with a pure first-order estimate using k = Vmax′/Km.",
          steps: [
            "Km × ln(30/10) = 5 × 1.0986 = 5.49 mg/L.",
            "C₁ − C₂ = 20 mg/L.",
            "t = (5.49 + 20) ÷ 1.5 = 17.0 h.",
            "First-order estimate: k = 1.5 ÷ 5 = 0.3 h⁻¹; t = ln 3 ÷ 0.3 = 3.66 h.",
          ],
          answer: "About 17 h — more than four times the 3.7 h a first-order assumption would predict.",
        },
      ],
    },
    {
      id: "slow-to-steady-state",
      heading: "Slower to steady state at higher doses",
      blocks: [
        {
          kind: "p",
          text: "With linear kinetics the time to steady state depends only on half-life. With saturable kinetics the apparent half-life lengthens as the dose rises, so steady state takes longer to reach at higher dosing rates. Clinical pharmacokinetics texts give an approximate expression for the time to reach 90% of steady state.",
        },
        {
          kind: "formula",
          expr: "t₉₀% = [Km × Vd / (Vmax − R)²] × (2.303 × Vmax − 0.9 × R)",
          where: [
            { sym: "t₉₀%", meaning: "time to reach 90% of steady state (days when Vmax and R are in mg/day)" },
            { sym: "Vd", meaning: "volume of distribution (L)" },
          ],
        },
        {
          kind: "example",
          title: "Time to 90% of steady state for Drug X",
          problem: "Drug X: Vmax = 500 mg/day, Km = 4 mg/L, Vd = 50 L. Estimate t₉₀% at 300 mg/day and at 400 mg/day.",
          steps: [
            "At 300 mg/day: [4 × 50 ÷ 200²] × (2.303 × 500 − 0.9 × 300) = 0.005 × 881.5 = 4.41 days.",
            "At 400 mg/day: [4 × 50 ÷ 100²] × (2.303 × 500 − 0.9 × 400) = 0.02 × 791.5 = 15.8 days.",
          ],
          answer: "About 4.4 days at 300 mg/day but about 15.8 days at 400 mg/day.",
          note: "A concentration measured a few days after a dose increase may therefore be far from the eventual steady state.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Not for real dosing",
          text: "Real Michaelis–Menten parameters vary several-fold between patients and are affected by interacting drugs, protein binding and illness. Dose adjustment of real drugs with saturable kinetics follows validated references, drug-level monitoring and clinical judgement.",
        },
      ],
    },
  ],
  mistakes: [
    "Assuming that doubling the dose doubles the steady-state concentration. Near saturation, Css can rise many times more than the dose.",
    "Calculating a single half-life and counting 4–5 half-lives to steady state. Half-life changes with concentration, and steady state takes longer at higher doses.",
    "Mixing the two forms of Vmax: mg/day (amount rate) in the steady-state equation and mg/L per h (concentration rate) in the time-course equation. Convert with Vd and check time units.",
    "Forgetting F. The dosing rate R in Css = Km × R/(Vmax − R) is the rate of drug reaching the circulation.",
    "Using Css = Km × R/(Vmax − R) when R ≥ Vmax. There is no steady state then; the concentration keeps rising.",
    "Using concentrations that are not at steady state to estimate Vmax and Km.",
    "Treating Km as a dose. Km is a concentration (mg/L) at which the elimination rate is half of Vmax.",
  ],
  practice: [
    {
      q: "What is the elimination rate, as a fraction of Vmax, when C = Km?",
      answer: "Half of Vmax",
      working: ["Rate = Vmax × Km ÷ (Km + Km).", "= Vmax × Km ÷ 2Km = Vmax/2."],
    },
    {
      q: "A drug has Vmax = 600 mg/day and Km = 5 mg/L. Calculate Css at dosing rates of 300 and 450 mg/day.",
      answer: "5 mg/L at 300 mg/day; 15 mg/L at 450 mg/day",
      working: [
        "Css = Km × R ÷ (Vmax − R).",
        "300 mg/day: 5 × 300 ÷ 300 = 5 mg/L.",
        "450 mg/day: 5 × 450 ÷ 150 = 15 mg/L — a 50% dose increase tripled Css.",
      ],
    },
    {
      q: "A patient has Css = 4 mg/L at 200 mg/day and Css = 12 mg/L at 300 mg/day. Estimate Km and Vmax.",
      answer: "Km = 4 mg/L; Vmax = 400 mg/day",
      working: [
        "R₁/Css₁ = 200 ÷ 4 = 50; R₂/Css₂ = 300 ÷ 12 = 25.",
        "Km = (300 − 200) ÷ (50 − 25) = 4 mg/L.",
        "Vmax = 200 + 4 × 50 = 400 mg/day.",
      ],
    },
    {
      q: "Using Vmax = 400 mg/day and Km = 4 mg/L, what dosing rate would give a steady-state concentration of 12 mg/L? (Arithmetic only, for a fictional drug.)",
      answer: "300 mg/day",
      working: ["R = Vmax × Css ÷ (Km + Css).", "= 400 × 12 ÷ (4 + 12) = 4800 ÷ 16 = 300 mg/day."],
    },
    {
      q: "For Vmax = 500 mg/day and Km = 4 mg/L, calculate the apparent clearance at C = 2 mg/L and at C = 20 mg/L.",
      answer: "83.3 L/day at 2 mg/L; 20.8 L/day at 20 mg/L",
      working: ["CL = Vmax ÷ (Km + C).", "At 2 mg/L: 500 ÷ 6 = 83.3 L/day.", "At 20 mg/L: 500 ÷ 24 = 20.8 L/day."],
    },
    {
      q: "A drug has Km = 4 mg/L and Vmax′ = 2 mg/L per h. How long does the concentration take to fall from 20 to 5 mg/L? What would a first-order estimate with k = Vmax′/Km give?",
      answer: "≈ 10.3 h (first-order estimate ≈ 2.8 h)",
      working: [
        "Km × ln(20/5) = 4 × 1.3863 = 5.545 mg/L.",
        "C₁ − C₂ = 15 mg/L.",
        "t = (5.545 + 15) ÷ 2 = 10.27 h.",
        "First-order: k = 2 ÷ 4 = 0.5 h⁻¹; t = ln 4 ÷ 0.5 = 2.77 h.",
      ],
    },
    {
      q: "Drug Y has Vmax = 3 mg/L per h and Km = 30 mg/L. Calculate the elimination rate at C = 0.5 mg/L exactly, and by the first-order approximation.",
      answer: "Exact 0.0492 mg/L per h; approximation 0.0500 mg/L per h",
      working: ["Exact: 3 × 0.5 ÷ 30.5 = 0.0492.", "Approximation: (3 ÷ 30) × 0.5 = 0.0500."],
    },
    {
      q: "A fictional drug has Vmax = 400 mg/day and Km = 4 mg/L. The dosing rate is increased by 20%, from 250 to 300 mg/day. By what percentage does Css rise?",
      answer: "By 80% (6.67 → 12.0 mg/L)",
      working: [
        "At 250 mg/day: Css = 4 × 250 ÷ 150 = 6.67 mg/L.",
        "At 300 mg/day: Css = 4 × 300 ÷ 100 = 12.0 mg/L.",
        "Increase = (12.0 − 6.67) ÷ 6.67 = 0.80, i.e. 80%.",
      ],
    },
  ],
  limitations: [
    "The single-enzyme Michaelis–Menten model is a simplification. Real drugs may be eliminated by several pathways, only some of which saturate.",
    "The steady-state equations assume a constant dosing rate and ignore fluctuation within the dosing interval.",
    "Parameters estimated from two steady-state points are sensitive to measurement error and to concentrations that had not truly reached steady state.",
    "Protein binding, enzyme induction or inhibition by other drugs, and changes in illness alter Vmax and Km over time.",
    "These are teaching calculations. Real dosing of drugs with saturable kinetics uses validated references, drug-level monitoring and clinical judgement.",
  ],
  refs: ["rowland5", "shargel8", "gibaldi"],
  relatedTools: [
    {
      slug: "order-kinetics-calculator",
      name: "First-Order vs Zero-Order Kinetics Tool",
      why: "Its first-order, zero-order and Compare modes plot the two limiting cases of the Michaelis–Menten equation (C ≪ Km and C ≫ Km) side by side. Use those modes; this guide's integrated equation is the accurate way to handle the mixed region.",
    },
  ],
  relatedGuides: ["multiple-dosing-and-steady-state", "pharmacokinetic-parameters", "reaction-kinetics-drug-stability"],
  meta: { author: TEAM_AUTHOR, review: { status: "draft" }, updated: "2026-10-13" },
};
