import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples and practice answers was
 * recomputed in Python before drafting. Products are "Tablet A", "Tablet B"…
 * and every label claim, absorbance, calibration line and release figure is
 * illustrative. No pharmacopoeial acceptance limit is stated as a number; the
 * guide points to the cited chapter instead.
 *
 * Two correction methods are taught: the standard cumulative correction
 * (Method B in the Cumulative Drug Release Calculator) and the practical-sheet
 * method (Method A; the only method in the Dissolution Calculator). They agree
 * at the second sample and Method A under-corrects slightly after that — shown
 * openly in Example 2 and practice 3.
 *
 * Not linked: dissolution-rate-constant-calculator — its headline "k (midpoint
 * method)" is midpoint concentration ÷ (Cs − C), a dimensionless ratio, not the
 * Noyes–Whitney rate constant this guide teaches.
 */
export const guide: Guide = {
  slug: "dissolution-testing-and-drug-release",
  title: "Dissolution Testing and Drug Release: % Release, Volume Correction and Release Kinetics",
  description:
    "Turn dissolution absorbances into % drug released, correct for sample withdrawal, fit zero-order, first-order and Higuchi models, and compare profiles with f2.",
  category: "Pharmaceutics",
  objectives: [
    "Explain what a dissolution test measures and why sink conditions matter.",
    "Convert an absorbance reading to concentration, amount dissolved and % of label claim, including a dilution factor.",
    "Correct cumulative release for the drug removed in earlier samples, and explain how the standard and practical-sheet corrections differ.",
    "Fit zero-order, first-order and Higuchi models to release data and calculate their rate constants.",
    "Calculate the similarity factor f2 for two dissolution profiles and interpret it.",
    "Use the Noyes–Whitney equation to calculate a dissolution rate constant from concentration–time data.",
  ],
  intro: [
    "A tablet or capsule can only be absorbed after its drug has dissolved. A dissolution test measures how much drug leaves the dosage form and enters a liquid medium over time, under standardised conditions: a fixed volume of medium at body temperature, stirred by a basket or paddle at a set speed. Samples are withdrawn at chosen times, assayed (often by UV absorbance), and the results are expressed as a percentage of the label claim.",
    "The arithmetic has three stages. First, each absorbance becomes a concentration, then an amount, then a percentage. Second, because each sample takes some drug out of the vessel, later results must be corrected for what was removed. Third, the profile as a whole is described — by fitting a release model, or by comparing it with a reference profile. This guide works through all three.",
    "Every product, label claim and reading here is illustrative. The pharmacopoeia and regulatory guidance set the apparatus, conditions and acceptance criteria for real products; this guide teaches the calculations, not those requirements.",
  ],
  terms: [
    {
      term: "Dissolution",
      definition: "The process by which a solid drug passes into solution in a solvent or medium.",
    },
    {
      term: "Label claim",
      definition:
        "The amount of drug the product states it contains per unit (for example 250 mg per tablet). % released is calculated against it.",
    },
    {
      term: "Dissolution medium and volume (V)",
      definition:
        "The liquid the dosage form is tested in, such as a buffer at a set pH, and its volume in the vessel (commonly 500 or 900 mL).",
    },
    {
      term: "Sample volume (Vs)",
      definition:
        "The volume withdrawn at each time point for analysis. It is usually replaced with fresh medium so the vessel volume stays constant.",
    },
    {
      term: "Sink conditions",
      definition:
        "Conditions in which the concentration in the medium stays far below the drug's saturation solubility, so the build-up of dissolved drug does not slow further dissolution.",
    },
    {
      term: "Saturation solubility (Cs)",
      definition: "The maximum concentration of drug the medium can hold at equilibrium at that temperature.",
    },
    {
      term: "Release kinetics",
      definition:
        "A mathematical description of how the amount released changes with time, such as zero-order (constant rate) or first-order (rate proportional to drug remaining).",
    },
    {
      term: "Similarity factor (f2)",
      definition:
        "A single number from 0 to 100 summarising how close two dissolution profiles are; 100 means identical.",
    },
  ],
  sections: [
    {
      id: "absorbance-to-release",
      heading: "From absorbance to % released",
      blocks: [
        {
          kind: "p",
          text: "Most student practicals assay the samples by UV absorbance against a calibration line A = a + b × C, prepared from standards of known concentration. Each sample's absorbance is turned back into a concentration by rearranging the line. If the sample was diluted before reading, the result is multiplied by the dilution factor to get the concentration in the vessel. Multiplying that by the vessel volume gives the amount dissolved.",
        },
        {
          kind: "formula",
          expr: "C = [(A − a) ÷ b] × DF;   Amount (mg) = C (mg/mL) × V (mL);   % released = Amount ÷ label claim × 100",
          where: [
            { sym: "A", meaning: "absorbance of the sample (mean of replicates)" },
            { sym: "a, b", meaning: "intercept and slope of the calibration line A = a + b × C" },
            { sym: "DF", meaning: "dilution factor applied before reading (1 if undiluted)" },
            { sym: "C", meaning: "concentration in the vessel, in the calibration's unit (convert µg/mL to mg/mL by ÷ 1000)" },
            { sym: "V", meaning: "volume of medium in the vessel, mL" },
          ],
          note: "Convert units before multiplying by V. A calibration in µg/mL multiplied by 900 mL gives µg, not mg.",
        },
        {
          kind: "example",
          title: "Example 1: one time point",
          problem:
            "Tablet A has a label claim of 250 mg and is tested in 900 mL of medium. A sample, diluted 10 times, reads A = 0.452. The calibration line is A = 0.0021 + 0.0285 × C, with C in µg/mL. What percentage has been released?",
          steps: [
            "Concentration read: (0.452 − 0.0021) ÷ 0.0285 = 15.786 µg/mL.",
            "Undo the dilution: 15.786 × 10 = 157.86 µg/mL = 0.15786 mg/mL.",
            "Amount in the vessel: 0.15786 mg/mL × 900 mL = 142.07 mg.",
            "% released = 142.07 ÷ 250 × 100 = 56.83%.",
          ],
          answer: "About 56.8% of the label claim.",
          note: "This first point needs no withdrawal correction: nothing has been removed yet. All values illustrative.",
        },
      ],
    },
    {
      id: "volume-correction",
      heading: "Correcting for drug removed in earlier samples",
      blocks: [
        {
          kind: "p",
          text: "Every withdrawn sample carries drug out of the vessel. If the sample is replaced with fresh medium, the volume stays at V, but the drug in the earlier samples is gone and is not counted by the next reading. Without a correction, the cumulative release is underestimated, and the error grows with each sample.",
        },
        {
          kind: "formula",
          expr: "Cumulative amountₙ = Cₙ × V + Σ (Cᵢ × Vs),  summed over every earlier sample i = 1 … n − 1",
          where: [
            { sym: "Cₙ", meaning: "concentration measured at time point n, mg/mL" },
            { sym: "V", meaning: "vessel volume, kept constant by replacing each sample, mL" },
            { sym: "Cᵢ", meaning: "concentration measured at each earlier time point, mg/mL" },
            { sym: "Vs", meaning: "volume withdrawn at each earlier time point, mL" },
          ],
          note: "This is the standard cumulative correction: the drug in the vessel now, plus everything taken out before. If Vs changes between samples, use each sample's own Vs.",
        },
        {
          kind: "p",
          text: "Some practical sheets use a shorter recursive form instead: the corrected concentration at each point is the measured concentration plus (Vs ÷ V) times the previous corrected concentration, and the amount is the corrected concentration × V. It gives exactly the same answer at the second sample. From the third sample on it counts the older samples with a factor (Vs ÷ V) that shrinks each time, so it under-corrects slightly. Use the method your practical sheet asks for, and say which one you used.",
        },
        {
          kind: "formula",
          expr: "Practical-sheet form:  Ccorr,ₙ = Cₙ + (Vs ÷ V) × Ccorr,ₙ₋₁;   Amountₙ = Ccorr,ₙ × V",
          where: [{ sym: "Ccorr,ₙ", meaning: "corrected concentration at time point n (Ccorr,₁ = C₁)" }],
        },
        {
          kind: "example",
          title: "Example 2: a four-point profile, corrected two ways",
          problem:
            "Tablet B (label claim 100 mg) is tested in 900 mL. 5 mL is withdrawn at each time and replaced with fresh medium. Measured concentrations are 0.040, 0.065, 0.082 and 0.095 mg/mL at 10, 20, 30 and 45 min. Calculate cumulative % released without correction, with the standard correction, and with the practical-sheet form.",
          steps: [
            "Uncorrected amount = C × 900: 36.0, 58.5, 73.8 and 85.5 mg.",
            "Standard correction at 20 min: 58.5 + 0.040 × 5 = 58.5 + 0.2 = 58.7 mg.",
            "At 30 min: 73.8 + (0.040 + 0.065) × 5 = 73.8 + 0.525 = 74.325 mg.",
            "At 45 min: 85.5 + (0.040 + 0.065 + 0.082) × 5 = 85.5 + 0.935 = 86.435 mg.",
            "Practical-sheet form at 20 min: Ccorr = 0.065 + (5 ÷ 900) × 0.040 = 0.065222 mg/mL → 58.7 mg (the same).",
            "At 30 min: 0.082 + (5 ÷ 900) × 0.065222 = 0.082362 → 74.126 mg. At 45 min: 0.095 + (5 ÷ 900) × 0.082362 = 0.095458 → 85.912 mg.",
            "With a 100 mg label claim, mg and % are the same number.",
          ],
          answer: "At 45 min: 85.5% uncorrected, 86.4% by the standard correction, 85.9% by the practical-sheet form.",
          note: "The differences are small here because each sample is only 5 mL of 900 mL, but they grow with larger or more frequent samples.",
        },
        {
          kind: "table",
          caption: "Example 2 results: cumulative % of label claim (label claim 100 mg)",
          head: ["Time (min)", "Measured C (mg/mL)", "Uncorrected (%)", "Standard correction (%)", "Practical-sheet form (%)"],
          rows: [
            ["10", "0.040", "36.0", "36.0", "36.0"],
            ["20", "0.065", "58.5", "58.7", "58.7"],
            ["30", "0.082", "73.8", "74.3", "74.1"],
            ["45", "0.095", "85.5", "86.4", "85.9"],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "If samples are not replaced",
          text: "Both formulas assume each withdrawn sample is replaced with fresh medium. If it is not, the vessel volume falls at each sampling and the amount at time n must use the volume actually remaining. Record which you did.",
        },
      ],
    },
    {
      id: "kinetics",
      heading: "Release kinetics: describing the whole profile",
      blocks: [
        {
          kind: "p",
          text: "Once the cumulative % released (Q) is known at each time, the profile can be described by a model. Each common model becomes a straight line when the data are plotted the right way, so the model is tested by linear regression, and the slope gives the rate constant.",
        },
        {
          kind: "table",
          caption: "Common release models and how to linearise them",
          head: ["Model", "Equation", "Plot", "Rate constant from slope", "Typical of"],
          rows: [
            ["Zero order", "Q = k₀ t", "Q vs t", "k₀ = slope (% per min)", "Constant-rate systems, e.g. some osmotic or reservoir designs"],
            ["First order", "ln(100 − Q) = ln 100 − k₁ t", "ln(100 − Q) vs t", "k₁ = −slope (per min)", "Many immediate-release products"],
            ["Higuchi", "Q = kH √t", "Q vs √t", "kH = slope (% per min^½)", "Diffusion from an insoluble matrix"],
          ],
        },
        {
          kind: "formula",
          expr: "First order: t for a given Q = ln[100 ÷ (100 − Q)] ÷ k₁;   e.g. t₅₀ = ln 2 ÷ k₁",
          where: [
            { sym: "Q", meaning: "cumulative % released" },
            { sym: "k₁", meaning: "first-order release rate constant, min⁻¹" },
          ],
        },
        {
          kind: "example",
          title: "Example 3: choosing a model by R²",
          problem:
            "Tablet C releases 25.92, 45.12, 59.34, 74.08 and 83.47% at 10, 20, 30, 45 and 60 min. Fit zero-order, first-order and Higuchi models and decide which describes the data best.",
          steps: [
            "Zero order (Q vs t): slope 1.128 %/min, intercept 20.37%, R² = 0.9555.",
            "First order (ln(100 − Q) vs t): ln(100 − Q) = 4.3051, 4.0051, 3.7052, 3.2550, 2.8052. Slope −0.0300, intercept 4.6052 (= ln 100), R² = 0.99999998.",
            "Higuchi (Q vs √t): slope 12.66 %/min^½, intercept −12.20%, R² = 0.9921.",
            "First order fits best, with k₁ = 0.0300 min⁻¹, and its intercept equals ln 100 as the model predicts.",
            "t₅₀ = ln 2 ÷ 0.0300 = 23.1 min.",
          ],
          answer: "First order, k₁ = 0.0300 min⁻¹ (t₅₀ ≈ 23.1 min).",
          note: "The Higuchi R² of 0.992 looks high, but its intercept of −12% makes no physical sense. Check the intercept and the residuals, not just R².",
        },
        {
          kind: "p",
          text: "For polymeric matrices, the Korsmeyer–Peppas model (Q = k tⁿ, fitted to roughly the first 60% of release) is also used; the exponent n hints at the release mechanism. Its interpretation depends on the geometry of the dosage form, so it is best learned from the original papers and your course text.",
        },
      ],
    },
    {
      id: "f2",
      heading: "Comparing two profiles: the similarity factor f2",
      blocks: [
        {
          kind: "p",
          text: "To ask whether a test product (a new batch, or a new manufacturer's version) dissolves like a reference, the two profiles are compared at the same time points. The similarity factor f2 turns the mean squared difference into a number from 0 to 100.",
        },
        {
          kind: "formula",
          expr: "f2 = 50 × log₁₀ { 100 ÷ √[ 1 + (1/n) Σ (Rₜ − Tₜ)² ] }",
          where: [
            { sym: "n", meaning: "number of time points compared" },
            { sym: "Rₜ, Tₜ", meaning: "mean % released by reference and test at time t" },
          ],
          note: "Identical profiles give f2 = 100. An average difference of about 10% at every point gives f2 ≈ 50, which is the threshold the FDA guidance uses for similarity, together with conditions on how the points are chosen.",
        },
        {
          kind: "example",
          title: "Example 4: f2 for two profiles",
          problem:
            "Reference: 35, 58, 76, 90% at four time points. Test: 30, 52, 72, 88%. Calculate f2.",
          steps: [
            "Differences: 5, 6, 4, 2. Squares: 25, 36, 16, 4. Sum = 81.",
            "Mean squared difference = 81 ÷ 4 = 20.25.",
            "1 + 20.25 = 21.25; √21.25 = 4.610.",
            "100 ÷ 4.610 = 21.69; log₁₀(21.69) = 1.336.",
            "f2 = 50 × 1.336 = 66.8.",
          ],
          answer: "f2 ≈ 66.8.",
          note: "Above 50, so by the f2 criterion alone the profiles would be described as similar. Real comparisons follow the guidance's rules on replicates, variability and how many points beyond 85% may be included.",
        },
      ],
    },
    {
      id: "noyes-whitney",
      heading: "Why drugs dissolve at the rate they do: Noyes–Whitney",
      blocks: [
        {
          kind: "p",
          text: "The Noyes–Whitney equation says the rate of dissolution is proportional to the difference between the saturation solubility and the concentration already in solution. When C is far below Cs (sink conditions), the rate is close to its maximum; as C approaches Cs, dissolution slows. The equation also explains why reducing particle size (larger surface area A) speeds dissolution.",
        },
        {
          kind: "formula",
          expr: "dC/dt = k (Cs − C),   where k = D A ÷ (V h)",
          where: [
            { sym: "dC/dt", meaning: "rate of change of concentration in the medium, mg/mL per min" },
            { sym: "k", meaning: "dissolution rate constant, min⁻¹" },
            { sym: "Cs", meaning: "saturation solubility, mg/mL" },
            { sym: "C", meaning: "concentration in the bulk medium at that time, mg/mL" },
            { sym: "D, A, V, h", meaning: "diffusion coefficient, surface area of the solid, volume of medium, diffusion-layer thickness" },
          ],
          note: "To estimate k from data, take dC/dt over an interval and use the concentration at the middle of that interval for C. k = (dC/dt) ÷ (Cs − C) has units of 1/time.",
        },
        {
          kind: "example",
          title: "Example 5: a dissolution rate constant from two readings",
          problem:
            "A drug has Cs = 2.0 mg/mL in the medium. The concentration is 0.30 mg/mL at 10 min and 0.52 mg/mL at 20 min. Estimate k.",
          steps: [
            "dC/dt = (0.52 − 0.30) ÷ (20 − 10) = 0.022 mg/mL per min.",
            "Mid-interval concentration = (0.30 + 0.52) ÷ 2 = 0.41 mg/mL.",
            "Cs − C = 2.0 − 0.41 = 1.59 mg/mL.",
            "k = 0.022 ÷ 1.59 = 0.01384 min⁻¹.",
          ],
          answer: "k ≈ 0.0138 min⁻¹.",
        },
      ],
    },
  ],
  mistakes: [
    "Forgetting the dilution factor, or applying it twice. Multiply the calibration result by DF once, to get the concentration in the vessel.",
    "Multiplying µg/mL by the vessel volume and calling the result mg. Convert to mg/mL first.",
    "Leaving out the withdrawal correction, so cumulative release is underestimated from the second sample onwards.",
    "In the standard correction, adding the current sample's own Cₙ × Vs — only earlier samples have been removed.",
    "Mixing the two correction methods in one table, or not saying which was used.",
    "Choosing a release model by R² alone. Check that the intercept makes physical sense and that the residuals show no pattern.",
    "Fitting a first-order plot with log₁₀ and then reading the slope as k₁. With log₁₀, k₁ = −2.303 × slope.",
    "Using the concentration at the start or end of an interval in Noyes–Whitney when the rate was measured across it; use the mid-interval value.",
  ],
  practice: [
    {
      q: "Tablet D (label claim 200 mg) is tested in 900 mL. A sample diluted 5 times reads A = 0.360. Calibration: A = 0.0040 + 0.0300 × C (C in µg/mL). Find the % released.",
      answer: "26.7%.",
      working: [
        "(0.360 − 0.0040) ÷ 0.0300 = 11.867 µg/mL.",
        "× 5 = 59.333 µg/mL = 0.059333 mg/mL.",
        "× 900 mL = 53.40 mg.",
        "53.40 ÷ 200 × 100 = 26.70%.",
      ],
    },
    {
      q: "In 900 mL with 10 mL withdrawn and replaced at each time, the measured concentrations are 0.050, 0.090 and 0.120 mg/mL at the first three time points. The label claim is 120 mg. Using the standard correction, what is the cumulative % released at the third point?",
      answer: "109.4 mg, 91.2% of label claim.",
      working: [
        "Drug in vessel now: 0.120 × 900 = 108.0 mg.",
        "Removed earlier: (0.050 + 0.090) × 10 = 1.4 mg.",
        "Cumulative = 108.0 + 1.4 = 109.4 mg.",
        "109.4 ÷ 120 × 100 = 91.17%.",
      ],
    },
    {
      q: "Repeat the previous question with the practical-sheet form, Ccorr,ₙ = Cₙ + (Vs ÷ V) × Ccorr,ₙ₋₁. How large is the difference?",
      answer: "108.9 mg (90.75%), about 0.49 mg less than the standard correction.",
      working: [
        "Vs ÷ V = 10 ÷ 900 = 0.011111.",
        "Ccorr,₂ = 0.090 + 0.011111 × 0.050 = 0.090556 mg/mL (× 900 = 81.5 mg, same as standard).",
        "Ccorr,₃ = 0.120 + 0.011111 × 0.090556 = 0.121006 mg/mL.",
        "Amount = 0.121006 × 900 = 108.906 mg; ÷ 120 × 100 = 90.75%.",
        "Difference = 109.4 − 108.906 = 0.494 mg.",
      ],
    },
    {
      q: "A zero-order system releases 12% at 30 min and 36% at 90 min. Find k₀, check that the line passes through the origin, and predict when 80% will have been released.",
      answer: "k₀ = 0.4% per min; intercept 0; 80% at 200 min.",
      working: [
        "k₀ = (36 − 12) ÷ (90 − 30) = 24 ÷ 60 = 0.4% per min.",
        "Intercept = 12 − 0.4 × 30 = 0, so Q = 0.4 t.",
        "t for 80% = 80 ÷ 0.4 = 200 min.",
      ],
    },
    {
      q: "A product follows first-order release and has released 50% at 20 min. Find k₁ and the time to release 90%.",
      answer: "k₁ = 0.0347 min⁻¹; about 66.4 min.",
      working: [
        "k₁ = ln[100 ÷ (100 − 50)] ÷ 20 = ln 2 ÷ 20 = 0.034657 min⁻¹.",
        "t₉₀ = ln[100 ÷ 10] ÷ k₁ = ln 10 ÷ 0.034657 = 66.44 min.",
      ],
    },
    {
      q: "A matrix tablet follows the Higuchi model and has released 20% at 16 min. Find kH and predict the release at 64 min.",
      answer: "kH = 5% per min^½; 40% at 64 min.",
      working: [
        "kH = Q ÷ √t = 20 ÷ √16 = 20 ÷ 4 = 5% per min^½.",
        "Q at 64 min = 5 × √64 = 5 × 8 = 40%.",
        "Note: quadrupling the time only doubles the release.",
      ],
    },
    {
      q: "What is f2 when two profiles are identical? What is f2 when the test differs from the reference by exactly 10% at every time point?",
      answer: "100; about 49.9.",
      working: [
        "Identical: mean squared difference = 0, so f2 = 50 × log₁₀(100 ÷ √1) = 50 × 2 = 100.",
        "Difference 10 at every point: mean squared difference = 100.",
        "f2 = 50 × log₁₀(100 ÷ √101) = 50 × log₁₀(9.950) = 50 × 0.9978 = 49.89.",
      ],
    },
    {
      q: "A drug has Cs = 1.5 mg/mL. The medium contains 0.20 mg/mL at 5 min and 0.38 mg/mL at 10 min. Estimate the Noyes–Whitney rate constant.",
      answer: "k ≈ 0.0298 min⁻¹.",
      working: [
        "dC/dt = (0.38 − 0.20) ÷ (10 − 5) = 0.036 mg/mL per min.",
        "Mid-interval C = (0.20 + 0.38) ÷ 2 = 0.29 mg/mL.",
        "k = 0.036 ÷ (1.5 − 0.29) = 0.036 ÷ 1.21 = 0.02975 min⁻¹.",
      ],
    },
  ],
  limitations: [
    "Every product and reading here is illustrative. Apparatus, medium, speed, sampling times and acceptance criteria for real products come from the pharmacopoeial monograph and the dissolution chapter, not from this guide.",
    "The correction formulas assume each sample is replaced with fresh medium and that every reading is accurate. Filter adsorption, air bubbles and coning in the vessel cause errors no formula corrects.",
    "Model fitting describes a profile; it does not prove a mechanism. Several models can fit the same data well, especially over a short time range.",
    "f2 is a summary statistic with conditions on its use (number of points, variability, points after 85% release). Regulatory comparisons follow the full guidance, not f2 alone.",
    "Noyes–Whitney assumes a constant surface area and diffusion-layer thickness; for real tablets both change as the dose dissolves.",
  ],
  refs: ["martin8", "aulton6", "uspDissolution", "fdaDissolution1997", "mooreFlanner1996", "harris10"],
  relatedTools: [
    {
      slug: "cumulative-drug-release-calculator",
      name: "Cumulative Drug Release Calculator",
      why: "Calculates cumulative amount and % release with both corrections side by side; its Method B is the standard correction Σ(Cᵢ × Vsᵢ) taught here, and Method A is the practical-sheet form.",
    },
    {
      slug: "dissolution-calculator",
      name: "Dissolution Calculator",
      why: "Turns absorbance into concentration (with dilution factor), amount and % release as in Example 1. Its correction is the practical-sheet form only, so its later time points will be slightly lower than the standard correction (see Example 2).",
    },
  ],
  relatedGuides: [
    "accuracy-precision-recovery",
    "reaction-kinetics-drug-stability",
    "powder-flow-and-micromeritics",
    "pharmacokinetic-parameters",
  ],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
