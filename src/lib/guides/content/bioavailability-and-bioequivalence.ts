import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in this guide was recomputed in Python
 * before it was written here (statistics module; t-quantile for 11 degrees of
 * freedom = 1.796). The study data are invented ("Drug X", "Drug W"); they
 * describe no real product.
 *
 * Reviewer note: no regulatory bioequivalence guideline is in
 * src/lib/content/references.ts yet, so the acceptance range is described only
 * as "commonly used" — see content/briefs/bioavailability-and-bioequivalence.md.
 */
export const guide: Guide = {
  slug: "bioavailability-and-bioequivalence",
  title: "Bioavailability and Bioequivalence: AUC, Cmax and the Ratio of Geometric Means",
  description:
    "Calculate absolute and relative bioavailability, and learn why bioequivalence uses log-transformed AUC and Cmax and a 90% CI of the geometric mean ratio.",
  category: "Biopharmaceutics & Pharmacokinetics",
  objectives: [
    "Define bioavailability and distinguish its extent (AUC) from its rate (Cmax, tmax).",
    "Calculate absolute and relative bioavailability with correct dose normalisation.",
    "Explain why bioequivalence data are log-transformed and why the geometric mean, not the arithmetic mean, is used for ratios.",
    "Calculate a ratio of geometric means and its 90% confidence interval from paired crossover data (simplified analysis).",
    "Interpret a 90% confidence interval against an acceptance range, and explain why the whole interval, not just the point estimate, matters.",
  ],
  intro: [
    "Two tablets can contain exactly the same amount of the same drug and still put different amounts into the bloodstream, or put it there at different speeds. Particle size, excipients, compression and coating all change how a drug dissolves and is absorbed. Bioavailability is the measure of how much of a dose reaches the systemic circulation and how quickly.",
    "When a generic product is compared with an innovator product, the question becomes: are the two similar enough in rate and extent of absorption that they can be expected to behave the same in patients? That comparison is bioequivalence. It is answered with a crossover study, a log transformation and a confidence interval — ideas that confuse many students because they mix pharmacokinetics with statistics.",
    "This guide builds up from the bioavailability arithmetic to the bioequivalence statistics with one illustrative data set. The data are invented. Formal studies follow detailed regulatory guidance and use statistical models that this guide simplifies.",
  ],
  terms: [
    {
      term: "Bioavailability (F)",
      definition: "The fraction of an administered dose that reaches the systemic circulation unchanged, and the rate at which it does so.",
    },
    {
      term: "AUC₀–∞",
      definition: "Area under the plasma concentration–time curve to infinity (mg·h/L). The main measure of the extent of absorption.",
    },
    { term: "Cmax", definition: "The highest observed plasma concentration after a dose (mg/L). Reflects both rate and extent of absorption." },
    { term: "tmax", definition: "The time at which Cmax is observed (h). A measure of absorption rate." },
    {
      term: "Absolute bioavailability",
      definition: "Bioavailability of a non-IV product compared with an IV dose of the same drug (for which F = 1).",
    },
    {
      term: "Relative bioavailability",
      definition: "Bioavailability of one non-IV product compared with another (a reference product). It can exceed 100%.",
    },
    {
      term: "Bioequivalence",
      definition: "The absence of a meaningful difference in the rate and extent of absorption between two pharmaceutically equivalent products given at the same dose under similar conditions.",
    },
    {
      term: "Crossover design",
      definition: "A study in which each subject receives both the test and the reference product in separate periods, separated by a washout, so each subject acts as their own control.",
    },
    {
      term: "Geometric mean",
      definition: "The nth root of the product of n values, or equivalently exp(mean of the natural logs). The appropriate average for ratios and log-normally distributed data.",
    },
    {
      term: "Geometric mean ratio (GMR)",
      definition: "Geometric mean of the test values divided by the geometric mean of the reference values, usually expressed as a percentage.",
    },
  ],
  sections: [
    {
      id: "absolute-relative",
      heading: "Absolute and relative bioavailability",
      blocks: [
        {
          kind: "p",
          text: "Because clearance does not depend on the route of administration, the AUC produced by a dose is proportional to the amount that actually reaches the circulation. Dividing each AUC by its own dose and comparing gives the fraction absorbed. Both AUCs must be AUC₀–∞ (or both measured to the same complete endpoint), and the subjects' clearance must be the same on both occasions — which is why crossover designs are used.",
        },
        {
          kind: "formula",
          expr: "F(absolute) = (AUC_oral / Dose_oral) ÷ (AUC_IV / Dose_IV)",
          where: [
            { sym: "AUC_oral, AUC_IV", meaning: "AUC₀–∞ after the oral and IV doses (mg·h/L)" },
            { sym: "Dose_oral, Dose_IV", meaning: "the doses given (mg)" },
          ],
        },
        {
          kind: "formula",
          expr: "F(relative) = (AUC_test / Dose_test) ÷ (AUC_reference / Dose_reference)",
          note: "Multiply by 100 for a percentage. If the doses are equal they cancel, and F(relative) is simply the AUC ratio.",
        },
        {
          kind: "example",
          title: "Absolute bioavailability with unequal doses",
          problem: "Drug X (illustrative): a 25 mg IV dose gives AUC₀–∞ = 6.0 mg·h/L; a 100 mg oral tablet in the same subjects gives AUC₀–∞ = 8.4 mg·h/L. Find F.",
          steps: [
            "Exposure per mg, oral: 8.4 ÷ 100 = 0.084 h/L.",
            "Exposure per mg, IV: 6.0 ÷ 25 = 0.240 h/L.",
            "F = 0.084 ÷ 0.240 = 0.35.",
          ],
          answer: "F = 0.35 (35%).",
          note: "The oral AUC is larger than the IV AUC, yet F is only 35%, because four times the dose was given orally. Always compare exposure per milligram.",
        },
      ],
    },
    {
      id: "rate-extent",
      heading: "Rate and extent: AUC, Cmax and tmax",
      blocks: [
        {
          kind: "p",
          text: "Two products can deliver the same total amount (same AUC) at different speeds. A slower product gives a lower, later peak: lower Cmax and longer tmax. For a drug where peak-related effects matter, that difference can be clinically important even though the extent of absorption is identical. This is why bioequivalence compares both AUC (extent) and Cmax (rate and extent together), and reports tmax descriptively.",
        },
        {
          kind: "example",
          title: "Comparing peaks in one subject",
          problem:
            "In one subject, the test tablet of Drug W (illustrative) gives Cmax = 4.6 mg/L at tmax = 2.0 h; the reference gives Cmax = 5.2 mg/L at tmax = 1.5 h. Both AUCs are similar. Calculate the Cmax ratio and describe what it suggests.",
          steps: ["Cmax ratio = 4.6 ÷ 5.2 = 0.885 (88.5%).", "tmax is 0.5 h later for the test product."],
          answer: "Test/reference Cmax ratio ≈ 88.5%, with a later tmax — consistent with slower absorption from the test tablet.",
          note: "A single subject proves nothing about bioequivalence; the decision is made on the whole study, using the statistics below.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Cmax is not a pure rate measure",
          text: "If more drug is absorbed, Cmax rises too, so Cmax reflects extent as well as rate. That is one reason it is more variable than AUC and why bioequivalence studies of highly variable drugs need more subjects.",
        },
      ],
    },
    {
      id: "why-log",
      heading: "Why bioequivalence uses logs and geometric means",
      blocks: [
        {
          kind: "p",
          text: "Pharmacokinetic quantities such as AUC and Cmax are usually skewed: a few subjects have much higher values than the rest. Their logarithms are closer to a normal distribution, which suits the statistical methods. More importantly, the question being asked is about a ratio (test ÷ reference), and logarithms turn ratios into differences: ln(T/R) = ln T − ln R. Differences are what standard statistics such as the t-test handle.",
        },
        {
          kind: "p",
          text: "Ratios also behave multiplicatively. A product that gives 125% of the reference in one subject and 80% in another has, on balance, no difference: 1.25 × 0.80 = 1. The arithmetic mean of the two ratios, 1.025, wrongly suggests a 2.5% excess. The geometric mean, √(1.25 × 0.80) = 1.00, gets it right.",
        },
        {
          kind: "example",
          title: "Arithmetic versus geometric mean of ratios",
          problem: "Three subjects have test/reference AUC ratios of 1.25, 0.80 and 1.00. Compare the arithmetic and geometric means.",
          steps: [
            "Arithmetic mean = (1.25 + 0.80 + 1.00) ÷ 3 = 1.017.",
            "Geometric mean = (1.25 × 0.80 × 1.00)^(1/3) = 1^(1/3) = 1.000.",
          ],
          answer: "Arithmetic mean ≈ 1.017; geometric mean = 1.000.",
          note: "On the log scale, ln 1.25 = +0.223 and ln 0.80 = −0.223 cancel exactly. That symmetry is why limits such as 80% and 125% go together: 125% is 1/0.80.",
        },
      ],
    },
    {
      id: "gmr-ci",
      heading: "The geometric mean ratio and its 90% confidence interval",
      blocks: [
        {
          kind: "p",
          text: "In a two-period crossover, every subject provides a test and a reference value. For each subject, take ln(test) − ln(reference). The mean of these differences, transformed back with the exponential, is the geometric mean ratio. Its uncertainty is expressed as a 90% confidence interval, calculated on the log scale and then back-transformed.",
        },
        {
          kind: "formula",
          expr: "dᵢ = ln(Tᵢ) − ln(Rᵢ)     GMR = e^(d̄)     90% CI = e^(d̄ ± t₀.₉₅,ₙ₋₁ × s/√n)",
          where: [
            { sym: "Tᵢ, Rᵢ", meaning: "test and reference values (AUC or Cmax) for subject i" },
            { sym: "d̄", meaning: "mean of the n log differences" },
            { sym: "s", meaning: "standard deviation of the log differences" },
            { sym: "n", meaning: "number of subjects completing both periods" },
            { sym: "t₀.₉₅,ₙ₋₁", meaning: "one-sided 95% t-value with n − 1 degrees of freedom" },
          ],
          note: "A 90% two-sided interval corresponds to two one-sided tests, each at the 5% level. Formal analyses use an ANOVA model that also accounts for period and sequence effects; the paired calculation here shows the idea.",
        },
        {
          kind: "table",
          caption: "AUC₀–∞ (mg·h/L) for 12 subjects in a crossover study of Drug W (illustrative data)",
          head: ["Subject", "Test", "Reference", "T/R", "ln(T) − ln(R)"],
          rows: [
            ["1", "52.1", "55.0", "0.9473", "−0.0542"],
            ["2", "61.4", "59.8", "1.0268", "0.0264"],
            ["3", "48.9", "53.2", "0.9192", "−0.0843"],
            ["4", "70.2", "74.5", "0.9423", "−0.0595"],
            ["5", "55.6", "54.1", "1.0277", "0.0273"],
            ["6", "66.0", "71.3", "0.9257", "−0.0772"],
            ["7", "45.3", "49.0", "0.9245", "−0.0785"],
            ["8", "58.8", "60.2", "0.9767", "−0.0235"],
            ["9", "62.7", "68.4", "0.9167", "−0.0870"],
            ["10", "50.4", "52.6", "0.9582", "−0.0427"],
            ["11", "69.1", "70.8", "0.9760", "−0.0243"],
            ["12", "57.0", "61.5", "0.9268", "−0.0760"],
          ],
        },
        {
          kind: "example",
          title: "GMR and 90% CI for the AUC of Drug W",
          problem: "Using the table, calculate the geometric mean ratio of AUC and its 90% confidence interval (paired analysis).",
          steps: [
            "Mean log difference d̄ = −0.04612.",
            "Standard deviation of the differences s = 0.04038; n = 12.",
            "Standard error = s/√n = 0.04038 ÷ 3.4641 = 0.011657.",
            "t₀.₉₅ with 11 degrees of freedom = 1.796.",
            "Log-scale limits: −0.04612 ± 1.796 × 0.011657 = −0.06706 to −0.02519.",
            "Back-transform: GMR = e^(−0.04612) = 0.9549; CI = e^(−0.06706) to e^(−0.02519) = 0.9351 to 0.9751.",
          ],
          answer: "GMR ≈ 95.5%; 90% CI ≈ 93.5% to 97.5%.",
          note: "The GMR equals the ratio of the two geometric means: 57.61 ÷ 60.33 = 0.9549. Notice the interval is not symmetric around 95.5% on the ordinary scale; it is symmetric on the log scale.",
        },
      ],
    },
    {
      id: "interpreting",
      heading: "Interpreting the interval",
      blocks: [
        {
          kind: "p",
          text: "Bioequivalence is concluded when the whole 90% confidence interval lies inside a pre-specified acceptance range. Regulatory guidance commonly uses 80.00% to 125.00% for the GMR of AUC and Cmax; some guidance applies narrower limits for narrow-therapeutic-index drugs or allows widened limits for highly variable drugs. Students should check the current guidance of the relevant regulator rather than memorise a single rule.",
        },
        {
          kind: "p",
          text: "Two points are commonly misunderstood. First, a GMR close to 100% is not enough: if the study was small or the data noisy, the interval can be wide and extend outside the range. Second, an interval inside the range does not mean the products are identical; it means any difference is small enough, with 90% confidence, to fall within the agreed limits.",
        },
        {
          kind: "table",
          caption: "Reading example intervals against an acceptance range of 80.00–125.00% (illustrative)",
          head: ["90% CI of GMR", "Point estimate inside?", "Whole interval inside?", "Conclusion"],
          rows: [
            ["93.5–97.5%", "Yes", "Yes", "Meets the range"],
            ["88–118%", "Yes", "Yes", "Meets the range"],
            ["95–130%", "Yes", "No (upper limit above 125%)", "Does not meet the range"],
            ["78–102%", "Yes", "No (lower limit below 80%)", "Does not meet the range"],
          ],
        },
      ],
    },
  ],
  mistakes: [
    "Comparing AUCs without dividing each by its own dose when the doses differ.",
    "Averaging the individual T/R ratios arithmetically. Ratios are averaged on the log scale (geometric mean).",
    "Calculating the confidence interval on the untransformed AUCs and then taking a ratio. The interval is calculated on the log scale and back-transformed.",
    "Judging bioequivalence from the point estimate alone. The whole 90% confidence interval must lie within the acceptance range.",
    "Using a 95% interval. Bioequivalence uses a 90% interval, which corresponds to two one-sided tests at 5% each.",
    "Treating Cmax as a pure rate measure. It depends on the extent of absorption as well.",
    "Using AUC₀–t from one product and AUC₀–∞ from the other, or AUCs measured to different endpoints.",
    "Expecting 80–125% to be symmetric on the ordinary scale. It is symmetric on the log scale: ln 0.80 = −0.223 and ln 1.25 = +0.223.",
  ],
  practice: [
    {
      q: "A 20 mg IV dose gives AUC₀–∞ = 4.0 mg·h/L; a 40 mg oral dose gives AUC₀–∞ = 6.0 mg·h/L. Calculate the absolute bioavailability.",
      answer: "F = 0.75 (75%)",
      working: ["F = (AUC_oral × Dose_IV) ÷ (AUC_IV × Dose_oral).", "F = (6.0 × 20) ÷ (4.0 × 40) = 120 ÷ 160 = 0.75."],
    },
    {
      q: "A 100 mg test capsule gives AUC₀–∞ = 30 mg·h/L; the 100 mg reference capsule gives 32 mg·h/L. Calculate the relative bioavailability.",
      answer: "93.75%",
      working: ["Doses are equal, so F(relative) = 30 ÷ 32.", "= 0.9375 = 93.75%."],
    },
    {
      q: "Two subjects have T/R ratios of 1.25 and 0.80. Calculate the arithmetic and geometric means of the ratios.",
      answer: "Arithmetic 1.025; geometric 1.00",
      working: ["Arithmetic = (1.25 + 0.80) ÷ 2 = 1.025.", "Geometric = √(1.25 × 0.80) = √1.00 = 1.00."],
    },
    {
      q: "The mean of the log differences ln(T) − ln(R) in a study is 0.05. What is the geometric mean ratio?",
      answer: "≈ 105.1%",
      working: ["GMR = e^(d̄) = e^0.05.", "= 1.0513, i.e. 105.1%."],
    },
    {
      q: "In a paired analysis with 11 subjects, d̄ = −0.04 and the standard error of d̄ = 0.03. The t-value for 10 degrees of freedom is 1.812. Calculate the GMR and the 90% CI.",
      answer: "GMR ≈ 96.1%; 90% CI ≈ 91.0% to 101.4%",
      working: [
        "GMR = e^(−0.04) = 0.9608.",
        "Log limits = −0.04 ± 1.812 × 0.03 = −0.09436 to 0.01436.",
        "CI = e^(−0.09436) to e^(0.01436) = 0.9100 to 1.0145.",
      ],
    },
    {
      q: "Show that 80% and 125% are symmetric limits on the log scale.",
      answer: "ln 0.80 = −0.2231 and ln 1.25 = +0.2231",
      working: ["ln 0.80 = −0.22314.", "ln 1.25 = +0.22314.", "Equal and opposite, because 1.25 = 1/0.80."],
    },
    {
      q: "Against an acceptance range of 80.00–125.00%, which of these 90% CIs meets the range: (a) 88–118%, (b) 95–130%?",
      answer: "(a) meets it; (b) does not",
      working: [
        "(a) Lower limit 88% ≥ 80% and upper limit 118% ≤ 125%: the whole interval is inside.",
        "(b) Upper limit 130% > 125%: part of the interval is outside, even though the point estimate may be near 100%.",
      ],
    },
    {
      q: "A 50 mg test tablet gives AUC₀–∞ = 22 mg·h/L; a 50 mg reference oral solution gives 20 mg·h/L. Calculate the relative bioavailability and explain how it can exceed 100%.",
      answer: "110%",
      working: [
        "F(relative) = (22 ÷ 50) ÷ (20 ÷ 50) = 0.44 ÷ 0.40 = 1.10.",
        "The reference is not an IV dose, so it need not be fully absorbed; a test product absorbed better than the reference gives a ratio above 100%.",
      ],
    },
  ],
  limitations: [
    "The confidence-interval calculation here is a simplified paired analysis. Formal bioequivalence studies use an ANOVA (or mixed) model including sequence, period and subject effects, and pre-specified sample-size calculations.",
    "Acceptance limits, study conditions (fasting, fed, replicate designs), required analytes and exceptions differ between regulators and drugs. Always consult the current guidance of the relevant authority.",
    "Bioavailability calculations assume clearance is the same on both occasions and that AUC is measured completely; neither holds automatically in real studies.",
    "Bioequivalence is a statement about two products in a study population, not a guarantee of identical response in every patient.",
  ],
  refs: ["shargel8", "rowland5", "gibaldi"],
  relatedTools: [
    {
      slug: "bioavailability-calculator",
      name: "Bioavailability Calculator",
      why: "Its 'From AUC data' mode calculates F = (AUCₜ/Dₜ) ÷ (AUCᵣ/Dᵣ) × 100, the dose-normalised formula used for absolute and relative bioavailability in this guide. Use the AUC mode, not the dose-estimate mode.",
    },
  ],
  relatedGuides: ["pharmacokinetic-parameters", "non-compartmental-analysis", "accuracy-precision-recovery"],
  meta: { author: TEAM_AUTHOR, review: { status: "draft" }, updated: "2026-10-13" },
};
