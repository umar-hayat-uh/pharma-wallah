import { TEAM_AUTHOR } from "@/lib/content/governance";
import type { Guide } from "@/lib/guides/types";

/*
 * Every number below was recomputed independently in Python (statistics.mean,
 * statistics.stdev with n − 1, and least squares from the textbook sums) on
 * 2026-10-12. The data sets are invented for teaching and are not taken from
 * any monograph or published study.
 */

export const guide: Guide = {
  slug: "accuracy-precision-recovery",
  title: "Accuracy, Precision and Percentage Recovery in Pharmaceutical Analysis",
  description:
    "Accuracy vs precision, % recovery, mean, SD and %RSD, calibration curves and % label claim, with worked examples and practice questions.",
  category: "Pharmaceutical Analysis",
  objectives: [
    "Explain the difference between accuracy and precision, and link each to systematic or random error.",
    "Calculate percentage recovery, percentage error, mean, sample standard deviation and %RSD from replicate results.",
    "Fit a least-squares calibration line, read its residuals, and back-calculate an unknown concentration through every dilution.",
    "Express an assay result as a percentage of the label claim.",
    "Describe how ICH Q2(R2) frames accuracy, precision, linearity and range, and where acceptance criteria actually come from.",
  ],
  intro: [
    "Every number that leaves a pharmaceutical analysis laboratory is a claim: this tablet contains 248 mg of drug, this injection is 99.1% of its label strength. Before anyone can act on such a claim, they need to know two things about the method that produced it. Does it give the right answer on average? And does it give the same answer when you repeat it? The first question is about accuracy, the second about precision, and the two are not the same thing.",
    "This guide works through the ideas and the arithmetic a Pharm-D student meets in analysis practicals and validation lectures: percentage recovery, replicate statistics, calibration curves, Beer–Lambert calculations and assay as a percentage of label claim. Every example uses original, invented data, and every figure has been recalculated independently, so you can check your own working line by line.",
    "One rule runs through the whole topic. The numbers you calculate describe the method; whether they are good enough is decided by the method's own validation protocol, the monograph or your practical manual. This guide does not quote acceptance limits as requirements, because those limits differ between methods and purposes.",
  ],
  terms: [
    {
      term: "Accuracy (trueness)",
      definition: "How close a result, or the mean of several results, is to the true or accepted reference value.",
    },
    {
      term: "Precision",
      definition: "How close repeated results are to one another under stated conditions, regardless of whether they are close to the true value.",
    },
    {
      term: "Systematic error (bias)",
      definition: "An error that pushes every result in the same direction by a similar amount, such as an uncorrected blank or a wrongly prepared standard. It harms accuracy.",
    },
    {
      term: "Random error",
      definition: "Unpredictable scatter that makes results fall on both sides of the mean, such as small variations in pipetting or reading. It harms precision.",
    },
    {
      term: "Percentage recovery",
      definition: "The amount found expressed as a percentage of the amount known to be present or added: found ÷ added × 100.",
    },
    {
      term: "Standard deviation (s)",
      definition: "A measure of scatter about the mean. For a small set of replicates the sample formula, dividing by n − 1, is used.",
    },
    {
      term: "%RSD (coefficient of variation)",
      definition: "The standard deviation as a percentage of the mean: s ÷ x̄ × 100. It lets you compare scatter at different levels.",
    },
    {
      term: "Repeatability",
      definition: "Precision under the same conditions over a short time: same analyst, same instrument, same day.",
    },
    {
      term: "Intermediate precision",
      definition: "Precision within one laboratory when realistic conditions change, such as a different day, analyst or instrument.",
    },
    {
      term: "Calibration curve",
      definition: "A line relating instrument response (for example absorbance) to the known concentrations of standards, used to find the concentration of an unknown.",
    },
    {
      term: "Residual",
      definition: "The observed response minus the response predicted by the fitted line, y − ŷ, for each standard.",
    },
    {
      term: "Label claim",
      definition: "The amount of drug stated on the label per dosage unit, for example 250 mg per tablet. Assay results are often reported as a percentage of it.",
    },
  ],
  sections: [
    {
      id: "accuracy-vs-precision",
      heading: "Accuracy and precision are different questions",
      blocks: [
        {
          kind: "p",
          text: "The classic picture is a dartboard. Imagine four players each throwing five darts at the bullseye, which stands for the true value. The first player's darts land in a tight group right on the bullseye: accurate and precise. The second player's darts land in an equally tight group, but up in the top-left corner: precise but not accurate. The third player's darts are scattered all over the board, yet their average position is roughly the bullseye: accurate on average but imprecise. The fourth player's darts are scattered and the whole group sits off to one side: neither accurate nor precise.",
        },
        {
          kind: "table",
          caption: "The four combinations of accuracy and precision",
          head: ["", "High accuracy (mean near the true value)", "Low accuracy (mean away from the true value)"],
          rows: [
            ["High precision (results close together)", "Tight group on the bullseye — the goal", "Tight group off target — a systematic error"],
            ["Low precision (results spread out)", "Wide spread centred on the bullseye — random error dominates", "Wide spread off target — both kinds of error"],
          ],
        },
        {
          kind: "p",
          text: "The second player is the dangerous case in a laboratory. A precise method looks trustworthy because every repeat agrees, but repetition cannot reveal a bias that affects every result equally. Only comparison with a known amount — a reference standard, or a known quantity added to a sample — shows whether the method is accurate.",
        },
        {
          kind: "table",
          caption: "Five replicate results from four analysts (true value 100.0%, invented data)",
          head: ["Analyst", "Results (%)", "Mean (%)", "SD (%)", "Diagnosis"],
          rows: [
            ["A", "99.8, 100.1, 100.0, 99.9, 100.2", "100.0", "0.16", "Accurate and precise"],
            ["B", "103.0, 103.2, 102.9, 103.1, 102.8", "103.0", "0.16", "Precise, biased by +3.0"],
            ["C", "97.0, 102.5, 100.4, 98.1, 102.0", "100.0", "2.40", "Accurate on average, imprecise"],
            ["D", "94.2, 97.9, 92.6, 96.8, 95.0", "95.3", "2.10", "Biased by −4.7 and imprecise"],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Accurate on average is not good enough",
          text: "Analyst C's mean is exactly right, but any single result could be 3% out. A patient receives one tablet, not the average of five, so a method must be both accurate and precise to be useful.",
        },
      ],
    },
    {
      id: "error-and-recovery",
      heading: "Percentage error and percentage recovery",
      blocks: [
        {
          kind: "p",
          text: "Accuracy is measured by comparing what you found with what you know is there. In a practical, the known amount is usually a weighed quantity of reference standard, or a known amount added (spiked) into a sample or placebo.",
        },
        {
          kind: "formula",
          expr: "% recovery = (amount found ÷ amount added) × 100",
          where: [
            { sym: "amount found", meaning: "what the method measured" },
            { sym: "amount added", meaning: "the known, true amount, in the same unit" },
          ],
        },
        {
          kind: "formula",
          expr: "% error = [(found − true) ÷ true] × 100 = % recovery − 100",
          note: "The sign matters: a negative % error means the method reads low, a positive one means it reads high.",
        },
        {
          kind: "p",
          text: "When the sample already contains some analyte (a formulation, or a biological fluid), you cannot simply divide the total found by the amount added. You analyse the sample twice, once as it is and once after adding a known amount, and attribute only the increase to the spike.",
        },
        {
          kind: "formula",
          expr: "% recovery (spiked) = [(C spiked − C unspiked) ÷ C added] × 100",
          where: [
            { sym: "C spiked", meaning: "concentration measured after the spike" },
            { sym: "C unspiked", meaning: "concentration measured in the same sample without the spike" },
            { sym: "C added", meaning: "concentration the spike would contribute, from its known amount and the final volume" },
          ],
        },
        {
          kind: "example",
          title: "Recovery from a spiked sample",
          problem:
            "An oral solution is diluted and assayed: 12.40 µg/mL. A second portion is spiked so that the added drug contributes 10.00 µg/mL in the final dilution, and it reads 22.18 µg/mL. Calculate the recovery of the spike.",
          steps: [
            "Increase due to the spike = 22.18 − 12.40 = 9.78 µg/mL.",
            "% recovery = 9.78 ÷ 10.00 × 100 = 97.8%.",
            "% error = 97.8 − 100 = −2.2%: the method recovered slightly less than was added.",
          ],
          answer: "Recovery = 97.8% (% error −2.2%).",
          note: "Dividing the whole 22.18 by 10.00 would give 221.8%, which is meaningless — the unspiked drug is not part of the spike.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Recovery above 100%",
          text: "A recovery slightly above 100% can be genuine random error. A recovery well above 100% usually points to an interfering substance, a contaminated blank, a dilution mistake or a standard that is weaker than you think. Investigate it; do not round it away.",
        },
      ],
    },
    {
      id: "replicate-statistics",
      heading: "Mean, standard deviation and %RSD",
      blocks: [
        {
          kind: "p",
          text: "Precision is expressed with three numbers calculated from replicate results: the mean, the standard deviation and the relative standard deviation. Replicates of an analysis are a small sample of all the results the method could produce, so the sample standard deviation, with n − 1 in the denominator, is the correct one.",
        },
        {
          kind: "formula",
          expr: "x̄ = Σx ÷ n     s = √[Σ(x − x̄)² ÷ (n − 1)]     %RSD = (s ÷ x̄) × 100",
          where: [
            { sym: "x", meaning: "each individual result" },
            { sym: "n", meaning: "number of results" },
            { sym: "x̄", meaning: "the mean" },
            { sym: "s", meaning: "the sample standard deviation, in the same unit as x" },
          ],
        },
        {
          kind: "example",
          title: "Five replicate recoveries",
          problem:
            "A student adds exactly 50.0 mg of a reference standard to five placebo portions and assays each. Amounts found: 49.6, 49.9, 50.3, 49.4 and 49.8 mg. Calculate the recovery of each, the mean, SD and %RSD, and the % error of the mean.",
          steps: [
            "Individual recoveries (found ÷ 50.0 × 100): 99.2, 99.8, 100.6, 98.8 and 99.6%.",
            "Mean found = (49.6 + 49.9 + 50.3 + 49.4 + 49.8) ÷ 5 = 249.0 ÷ 5 = 49.8 mg.",
            "Deviations from the mean: −0.2, +0.1, +0.5, −0.4, 0.0 mg. Squares: 0.04, 0.01, 0.25, 0.16, 0.00. Sum = 0.46.",
            "s = √(0.46 ÷ 4) = √0.115 = 0.339 mg.",
            "%RSD = 0.339 ÷ 49.8 × 100 = 0.68%.",
            "Mean recovery = 49.8 ÷ 50.0 × 100 = 99.6%; % error of the mean = −0.40%.",
          ],
          answer: "Mean 49.8 mg (99.6% recovery), SD 0.339 mg, %RSD 0.68%, % error −0.40%.",
          note: "The %RSD is the same whether you work in mg or in % recovery (SD 0.678% on a mean of 99.6%), because both are scaled by the same factor.",
        },
        {
          kind: "list",
          items: [
            "Repeatability: the same analyst runs all replicates on the same day with the same equipment. It shows the smallest scatter the method can achieve.",
            "Intermediate precision: the same laboratory, but on different days, by different analysts or on different instruments. It is usually larger, because day-to-day differences add their own variation.",
            "Reproducibility: precision between different laboratories, studied in collaborative trials and method transfer.",
          ],
        },
      ],
    },
    {
      id: "calibration-curves",
      heading: "Calibration curves, R² and residuals",
      blocks: [
        {
          kind: "p",
          text: "Most instrumental assays do not measure concentration directly. A UV-visible spectrophotometer measures absorbance, an HPLC detector measures peak area. You prepare standards of known concentration, measure their responses, fit a straight line by least squares, and use that line to convert an unknown's response into a concentration.",
        },
        {
          kind: "formula",
          expr: "m = [nΣxy − (Σx)(Σy)] ÷ [nΣx² − (Σx)²]     c = (Σy − mΣx) ÷ n",
          where: [
            { sym: "x", meaning: "concentration of each standard" },
            { sym: "y", meaning: "response (absorbance) of each standard" },
            { sym: "m", meaning: "slope of y = mx + c" },
            { sym: "c", meaning: "intercept" },
          ],
        },
        {
          kind: "formula",
          expr: "R² = 1 − Σ(y − ŷ)² ÷ Σ(y − ȳ)²     unknown x = (y − c) ÷ m",
        },
        {
          kind: "example",
          title: "Fitting a five-point calibration line",
          problem:
            "Standards of 2, 4, 6, 8 and 10 µg/mL give absorbances of 0.142, 0.281, 0.425, 0.561 and 0.702. Find the slope, intercept and R², and the residuals.",
          steps: [
            "n = 5; Σx = 30; Σy = 2.111; Σxy = 15.466; Σx² = 220.",
            "m = (5 × 15.466 − 30 × 2.111) ÷ (5 × 220 − 30²) = (77.330 − 63.330) ÷ 200 = 14.000 ÷ 200 = 0.0700 mL/µg.",
            "c = (2.111 − 0.0700 × 30) ÷ 5 = 0.011 ÷ 5 = 0.0022.",
            "Predicted absorbances ŷ = 0.0700x + 0.0022: 0.1422, 0.2822, 0.4222, 0.5622, 0.7022.",
            "Residuals y − ŷ: −0.0002, −0.0012, +0.0028, −0.0012, −0.0002 — small, and with no pattern of sign.",
            "R² = 0.99994.",
          ],
          answer: "A = 0.0700 × C + 0.0022, R² = 0.99994, residuals small and patternless.",
        },
        {
          kind: "p",
          text: "A high R² does not prove that the relationship is linear. R² only says how much of the scatter in y the line accounts for, and a smooth curve can account for almost all of it. The residuals tell you more: if the line is right, they are small and their signs are scattered at random. A run of negative, then positive, then negative residuals means the line is the wrong shape.",
        },
        {
          kind: "table",
          caption: "A curved data set that still gives R² = 0.995 (invented data)",
          head: ["Concentration (µg/mL)", "Absorbance", "Predicted ŷ", "Residual y − ŷ"],
          rows: [
            ["0", "0.000", "0.0226", "−0.0226"],
            ["2", "0.170", "0.1669", "+0.0031"],
            ["4", "0.330", "0.3112", "+0.0188"],
            ["6", "0.475", "0.4555", "+0.0195"],
            ["8", "0.605", "0.5998", "+0.0052"],
            ["10", "0.720", "0.7440", "−0.0240"],
          ],
        },
        {
          kind: "p",
          text: "The fitted line here is A = 0.07214 × C + 0.02262 with R² = 0.9949, which many students would accept. But the residuals go negative, positive, positive, positive, positive, negative: an arch. The absorbance is bending over at high concentration, as happens when a solution moves outside the range where the Beer–Lambert law holds. Plot the residuals every time, and restrict the working range to where they are random.",
        },
      ],
    },
    {
      id: "beer-lambert-and-dilution",
      heading: "Beer–Lambert law and working back through dilutions",
      blocks: [
        {
          kind: "formula",
          expr: "A = εbc",
          where: [
            { sym: "A", meaning: "absorbance (no unit)" },
            { sym: "ε", meaning: "molar absorptivity, L mol⁻¹ cm⁻¹, constant for a substance at a given wavelength and solvent" },
            { sym: "b", meaning: "path length of the cell, cm (usually 1 cm)" },
            { sym: "c", meaning: "concentration, mol/L" },
          ],
          note: "Transmittance is related by A = −log₁₀(T), so %T = 10⁻ᴬ × 100.",
        },
        {
          kind: "p",
          text: "The Beer–Lambert law is the reason a UV calibration line is straight, and also the reason it stops being straight: the law assumes monochromatic light, a clear dilute solution and no chemical change with concentration. When ε is known you can calculate a concentration from one reading; when it is not, a calibration curve does the same job empirically.",
        },
        {
          kind: "p",
          text: "The concentration you read from a calibration line is the concentration in the cuvette. The sample was almost always dissolved and diluted to get there, so you must multiply back through each step. Multiply by every dilution factor (final volume ÷ aliquot volume), then by the volume of the first solution to get an amount.",
        },
        {
          kind: "formula",
          expr: "% label claim = (amount found per unit ÷ label claim per unit) × 100",
        },
        {
          kind: "example",
          title: "From absorbance to % label claim",
          problem:
            "Twenty tablets labelled 250 mg have an average weight of 400.0 mg. Powder equivalent to 35.0 mg of drug (56.0 mg) is dissolved and made up to 50 mL. 1.0 mL of this is diluted to 100 mL and reads A = 0.488. Using the calibration line A = 0.0700 × C + 0.0022 (C in µg/mL), find the drug per tablet and the % label claim.",
          steps: [
            "Concentration in the cuvette: C = (0.488 − 0.0022) ÷ 0.0700 = 0.4858 ÷ 0.0700 = 6.94 µg/mL.",
            "Undo the 1.0 → 100 mL dilution (factor 100): 6.94 × 100 = 694 µg/mL in the first solution.",
            "Amount in the 50 mL first solution: 694 µg/mL × 50 mL = 34 700 µg = 34.70 mg.",
            "This came from 56.0 mg of powder, so per average tablet: 34.70 × 400.0 ÷ 56.0 = 247.86 mg.",
            "% label claim = 247.86 ÷ 250 × 100 = 99.14%.",
          ],
          answer: "About 247.9 mg per tablet, 99.1% of the label claim.",
          note: "A check: the nominal amount weighed was 35.0 mg and 34.70 mg was found, and 34.70 ÷ 35.0 × 100 also gives 99.14%.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Stay inside the standards",
          text: "The unknown's response should fall within the range of the standards. A reading above the top standard is an extrapolation; dilute the sample further and re-read rather than trusting the line beyond the points that define it.",
        },
      ],
    },
    {
      id: "ich-q2",
      heading: "How ICH Q2(R2) frames these ideas",
      blocks: [
        {
          kind: "p",
          text: "ICH Q2(R2), adopted in 2023, is the international guideline on validating analytical procedures, and USP general chapter <1225> covers the same ground for compendial methods. They define the characteristics a method must be shown to have for its intended purpose. A student does not need to memorise the guideline, but should recognise its vocabulary.",
        },
        {
          kind: "list",
          items: [
            "Accuracy: closeness of agreement between the accepted true value and the value found, usually shown by recovery of known amounts across the range the method will be used over. ICH's validation guidance has long recommended a minimum of nine determinations spread over at least three concentration levels; check the current text for the design your method needs.",
            "Precision: studied at the levels of repeatability, intermediate precision and reproducibility, and reported as SD, %RSD and a confidence interval.",
            "Range and the calibration model: Q2(R2) treats linearity as one part of demonstrating the reportable range, and accepts that some responses are better described by a non-linear model. Residuals and the fit are examined, not just a correlation value.",
            "Q2(R2) also allows accuracy and precision to be evaluated together, as one combined estimate of how far a reported result can be from the truth.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Where do acceptance limits come from?",
          text: "ICH Q2(R2) tells you what to study and how to report it; it does not set one universal recovery window or %RSD limit for every method. The acceptance criteria are written into each method's validation protocol, and are set by the purpose of the test (an assay, an impurity test, a bioanalytical method) and by the relevant monograph. In a practical, use the limits your manual gives you and state where they came from.",
        },
      ],
    },
  ],
  mistakes: [
    "Calling a method accurate because its replicates agree closely. Agreement shows precision only; a bias that affects every result equally is invisible until you compare with a known amount.",
    "Dividing the total found by the amount added in a spiked sample, instead of subtracting the unspiked result first.",
    "Using the population standard deviation (dividing by n) for a handful of replicates. Calculators often offer both — choose s, the one with n − 1.",
    "Reporting %RSD without the mean, or calculating it as SD ÷ 100 instead of SD ÷ mean × 100.",
    "Accepting a calibration line because R² looks high without plotting the residuals, and so missing a curved response.",
    "Reading the cuvette concentration off the curve and forgetting to multiply back through every dilution and the volume of the first solution.",
    "Using the line to quantify an unknown whose response lies outside the standards, which is an extrapolation.",
    "Quoting a recovery or %RSD limit as a universal rule instead of the one set by the method's protocol or monograph.",
  ],
  practice: [
    {
      q: "A known 10.00 mg of drug is added to a placebo and 9.62 mg is found. Calculate the percentage recovery and the percentage error.",
      answer: "Recovery 96.2%; % error −3.8%.",
      working: [
        "% recovery = 9.62 ÷ 10.00 × 100 = 96.2%.",
        "% error = (9.62 − 10.00) ÷ 10.00 × 100 = −3.8%, i.e. 96.2 − 100.",
      ],
    },
    {
      q: "Six replicate assays give 101.2, 99.6, 100.8, 100.3, 99.9 and 100.6% of label claim. Calculate the mean, the sample SD and the %RSD.",
      answer: "Mean 100.4%, SD 0.590%, %RSD 0.59%.",
      working: [
        "Sum = 602.4, so mean = 602.4 ÷ 6 = 100.4%.",
        "Deviations: +0.8, −0.8, +0.4, −0.1, −0.5, +0.2. Squares: 0.64, 0.64, 0.16, 0.01, 0.25, 0.04. Sum = 1.74.",
        "s = √(1.74 ÷ 5) = √0.348 = 0.590%.",
        "%RSD = 0.590 ÷ 100.4 × 100 = 0.59%.",
      ],
    },
    {
      q: "A plasma sample reads 4.85 µg/mL. After spiking so that the added drug contributes 5.00 µg/mL, it reads 9.70 µg/mL. What is the recovery of the spike?",
      answer: "97.0%.",
      working: [
        "Increase due to the spike = 9.70 − 4.85 = 4.85 µg/mL.",
        "% recovery = 4.85 ÷ 5.00 × 100 = 97.0%.",
      ],
    },
    {
      q: "A calibration line is A = 0.0452 × C + 0.0031 (C in µg/mL). A sample was prepared by diluting 2.0 mL to 25.0 mL, and the diluted solution reads A = 0.395. What is the concentration of the original sample?",
      answer: "About 108.4 µg/mL (8.67 µg/mL in the cuvette).",
      working: [
        "C in the diluted solution = (0.395 − 0.0031) ÷ 0.0452 = 0.3919 ÷ 0.0452 = 8.670 µg/mL.",
        "Dilution factor = 25.0 ÷ 2.0 = 12.5.",
        "Original concentration = 8.670 × 12.5 = 108.4 µg/mL.",
      ],
    },
    {
      q: "A drug has ε = 1.50 × 10⁴ L mol⁻¹ cm⁻¹ at its λmax. What absorbance and % transmittance will a 3.0 × 10⁻⁵ mol/L solution give in a 1 cm cell?",
      answer: "A = 0.450; %T ≈ 35.5%.",
      working: [
        "A = εbc = 1.50 × 10⁴ × 1 × 3.0 × 10⁻⁵ = 0.450.",
        "%T = 10⁻⁰·⁴⁵⁰ × 100 = 35.5%.",
      ],
    },
    {
      q: "An assay finds 493.5 mg of drug per tablet for tablets labelled 500 mg. Express the result as % label claim.",
      answer: "98.7% of label claim.",
      working: ["% label claim = 493.5 ÷ 500 × 100 = 98.7%."],
    },
    {
      q: "An analyst gets 99.8, 100.2 and 100.0% on Monday and 101.1, 101.5 and 101.3% on Tuesday. Calculate the %RSD for each day and for all six results together. What does the comparison show?",
      answer: "Monday 0.20%, Tuesday 0.20%, all six 0.73%: each day is repeatable, but a day-to-day shift of about 1.3% widens the intermediate precision.",
      working: [
        "Monday: mean 100.0, s = 0.200, %RSD = 0.20%.",
        "Tuesday: mean 101.3, s = 0.200, %RSD = 0.20%.",
        "All six: mean 100.65, s = 0.734, %RSD = 0.734 ÷ 100.65 × 100 = 0.73%.",
        "Repeatability within each day is good, but the means differ by 1.3, so something changed between days (standard, instrument, conditions). Repeatability alone would have hidden this.",
      ],
    },
  ],
  limitations: [
    "All data in this guide are invented for teaching. They illustrate the calculations; they are not results for any real product or method.",
    "Acceptance criteria are deliberately not given. The limits that apply to your work are those in your method's validation protocol, the monograph or your practical manual.",
    "Only ordinary least squares on a straight line is covered. Weighted regression, non-linear calibration models and confidence intervals on the slope, intercept and back-calculated concentration are beyond this guide.",
    "Detection and quantitation limits, specificity and robustness, which ICH Q2(R2) also covers, are not discussed here.",
    "The Beer–Lambert section is a brief summary; deviations from the law and instrument factors such as stray light are treated in analytical chemistry textbooks.",
  ],
  refs: ["harris10", "ichQ2R2", "uspValidation"],
  relatedTools: [
    {
      slug: "accuracy-recovery-calculator",
      name: "Accuracy & % Recovery Calculator",
      why: "Computes % recovery, % error, mean, sample SD (n − 1) and %RSD across replicate trials, exactly as in the worked examples.",
    },
    {
      slug: "percentage-recovery-calculator",
      name: "Percentage Recovery Calculator",
      why: "Recovery from amounts, or from concentration × volume of what was added and what was recovered.",
    },
    {
      slug: "calibration-curve-calculator",
      name: "Calibration Curve Calculator",
      why: "Fits the least-squares line with the same textbook sums, reports R² and back-calculates an unknown, warning when it lies outside the standards.",
    },
    {
      slug: "law-absorbance-calculator",
      name: "Beer-Lambert Law Calculator",
      why: "Solves A = εbc for absorbance, concentration or ε, and gives %T.",
    },
  ],
  relatedGuides: ["dilution-and-concentration", "reaction-kinetics-drug-stability"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "team-checked", checkedOn: "2026-10-12" },
    updated: "2026-10-12",
  },
};
