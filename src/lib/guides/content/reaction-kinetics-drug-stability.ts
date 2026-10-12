import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * Zero-, first- and second-order kinetics in drug stability.
 *
 * Every figure below was recomputed in Python before it was written here
 * (least-squares fits, ln values, Arrhenius steps). All data sets and rate
 * constants are illustrative and belong to no real drug. Conventions match the
 * site's Drug Stability Kinetics Calculator (`_stability-kinetics.ts`): k from
 * the slope, C₀ = 100 %, t½ = 0.693/k and t90 = 0.105/k for first order.
 */
export const guide: Guide = {
  slug: "reaction-kinetics-drug-stability",
  title: "Zero-, First- and Second-Order Kinetics in Drug Stability",
  description:
    "How drugs degrade by zero-, first- and second-order kinetics, how to find the order from data, and how k, t½, t90 and the Arrhenius equation are used.",
  category: "Pharmaceutics",
  objectives: [
    "Explain what rate, rate constant and order of reaction mean for a degrading drug, and give the correct units of k for each order.",
    "Write the integrated rate equation, half-life and t90 for zero-, first- and second-order degradation, and calculate each from k.",
    "Determine the order of a degradation reaction from stability data using linearised plots, R² and the way half-life depends on starting concentration.",
    "Explain why a very small difference in R² cannot decide the order, and what to do instead.",
    "Use the Arrhenius equation to relate rate constants at two temperatures, and state the limits of extrapolating accelerated data to a shelf life.",
  ],
  intro: [
    "Every medicine starts losing its active ingredient from the moment it is made. Hydrolysis, oxidation and photolysis break drug molecules down, slowly at room temperature and faster when the product is warm, wet or exposed to light. Reaction kinetics is the study of how fast that loss happens and what controls its speed. It is the arithmetic behind expiry dates, storage instructions and the stability practicals in your Pharmaceutics course.",
    "The key idea is that different reactions lose drug in different patterns. Some lose a fixed amount per unit time, some lose a fixed fraction, and some slow down sharply as the drug runs out. These patterns are called zero-, first- and second-order kinetics. Once you know which pattern a product follows, one number, the rate constant k, lets you predict how much drug is left at any time and how long it takes to fall to 90 % of its starting content.",
    "This guide works through each order with formulas, units and worked examples, then shows how to decide the order from a real-looking data set, and finishes with temperature and the Arrhenius equation. All data and rate constants here are illustrative, made up for teaching, and do not describe any real product.",
  ],
  terms: [
    {
      term: "Rate of reaction",
      definition:
        "How fast the drug concentration falls, written −dC/dt. It has units of concentration per time, for example % per day or mol L⁻¹ h⁻¹.",
    },
    {
      term: "Rate constant (k)",
      definition:
        "The proportionality constant linking rate to concentration. It is fixed for one reaction at one temperature and in one formulation, and its units depend on the order.",
    },
    {
      term: "Order of reaction",
      definition:
        "The power to which concentration is raised in the rate law. For rate = kCⁿ, n = 0 is zero order, n = 1 is first order and n = 2 is second order. It is found by experiment, not from the balanced equation.",
    },
    {
      term: "Apparent (pseudo) order",
      definition:
        "The order a reaction seems to follow under particular conditions. A first-order reaction can look zero order in a suspension, and a second-order reaction can look first order when one reactant, such as water, is in large excess.",
    },
    {
      term: "Half-life (t½)",
      definition: "The time for the drug concentration to fall to half its starting value.",
    },
    {
      term: "t90",
      definition:
        "The time for the drug content to fall to 90 % of its starting value, that is, a 10 % loss. It is the usual kinetic estimate of shelf life.",
    },
    {
      term: "Coefficient of determination (R²)",
      definition:
        "A number from 0 to 1 describing how much of the scatter in y a straight line explains. R² = 1 − SSE/SST, where SSE is the sum of squared residuals and SST the total sum of squares.",
    },
    {
      term: "Activation energy (Ea)",
      definition:
        "The energy barrier a reaction must overcome, in J mol⁻¹ or kJ mol⁻¹. A higher Ea means the rate is more sensitive to temperature.",
    },
    {
      term: "Accelerated stability study",
      definition:
        "Storing a product at raised temperature (and often humidity) so that degradation is fast enough to measure in weeks rather than years.",
    },
  ],
  sections: [
    {
      id: "rate-order",
      heading: "Rate, rate constant and order",
      blocks: [
        {
          kind: "p",
          text: "For a drug that degrades, the rate is the fall in concentration per unit time. In most stability work the rate depends on how much drug is present, and that dependence is written as a rate law.",
        },
        {
          kind: "formula",
          expr: "Rate = −dC/dt = k Cⁿ",
          where: [
            { sym: "C", meaning: "drug concentration (or % remaining) at time t" },
            { sym: "k", meaning: "rate constant" },
            { sym: "n", meaning: "order of reaction: 0, 1 or 2 in this guide" },
          ],
          note: "The minus sign is there because C falls with time while the rate is quoted as a positive number.",
        },
        {
          kind: "p",
          text: "Because the rate always has units of concentration per time, the units of k change with n so that both sides balance. Getting these units right is the quickest check that you have used the correct order.",
        },
        {
          kind: "table",
          caption: "Units of the rate constant for each order",
          head: ["Order", "Rate law", "Units of k (general)", "Example units"],
          rows: [
            ["Zero", "Rate = k", "concentration × time⁻¹", "% day⁻¹, mg mL⁻¹ h⁻¹"],
            ["First", "Rate = kC", "time⁻¹", "h⁻¹, day⁻¹, min⁻¹"],
            ["Second", "Rate = kC²", "concentration⁻¹ × time⁻¹", "L mol⁻¹ min⁻¹, %⁻¹ h⁻¹"],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Order is measured, not read off the equation",
          text: "A hydrolysis written as drug + water → products looks like a two-molecule reaction, but water is present in huge excess and its concentration barely changes. The reaction therefore behaves as first order in drug. This is why the order must come from data.",
        },
      ],
    },
    {
      id: "three-orders",
      heading: "The three orders: equations, half-life and t90",
      blocks: [
        {
          kind: "p",
          text: "Integrating the rate law for each order gives an equation for C at any time, and rearranging that equation gives t½ (C = C₀/2) and t90 (C = 0.9 C₀). Each integrated equation is a straight line when the right quantity is plotted against time, which is what makes the order testable.",
        },
        {
          kind: "formula",
          expr: "Zero order:  C = C₀ − kt     t½ = C₀ / 2k     t90 = 0.1 C₀ / k",
          where: [
            { sym: "C₀", meaning: "starting concentration (100 % when working in % remaining)" },
            { sym: "k", meaning: "zero-order rate constant, concentration per time" },
          ],
          note: "Plot C against t: a straight line with slope −k. A constant amount is lost per unit time, so t½ and t90 get longer when C₀ is higher.",
        },
        {
          kind: "p",
          text: "True zero-order loss is uncommon in solution, but it is very common as an apparent order in suspensions. Only drug dissolved in the liquid degrades, and as it is lost, more dissolves from the suspended particles to keep the solution saturated. The dissolved concentration stays roughly constant, so the total drug falls by a constant amount per day, until the solid reservoir runs out and the product switches to first-order loss.",
        },
        {
          kind: "formula",
          expr: "First order:  ln C = ln C₀ − kt     t½ = 0.693 / k     t90 = 0.105 / k",
          where: [
            { sym: "ln", meaning: "natural logarithm (base e)" },
            { sym: "k", meaning: "first-order rate constant, time⁻¹" },
            { sym: "0.693", meaning: "ln 2" },
            { sym: "0.105", meaning: "ln (100/90) = 0.1054, rounded" },
          ],
          note: "Equivalent form: C = C₀ e⁻ᵏᵗ. Plot ln C against t: a straight line with slope −k. A constant fraction is lost per unit time, so t½ and t90 do not depend on C₀.",
        },
        {
          kind: "p",
          text: "Most drugs in solution degrade by first-order or apparent first-order kinetics, which is why first order is the default many students reach for. It is still an assumption to be checked, not a rule.",
        },
        {
          kind: "formula",
          expr: "Second order:  1/C = 1/C₀ + kt     t½ = 1 / (k C₀)     t90 = 1 / (9 k C₀)",
          where: [{ sym: "k", meaning: "second-order rate constant, concentration⁻¹ time⁻¹" }],
          note: "Plot 1/C against t: a straight line with a positive slope equal to k. Here t½ gets longer when C₀ is lower. With C₀ = 100 %, t90 = 1/(900k).",
        },
        {
          kind: "table",
          caption: "Summary of the three orders (C₀ = starting concentration)",
          head: ["Order", "Linear plot", "Slope", "t½", "t90", "t½ when C₀ doubles"],
          rows: [
            ["Zero", "C vs t", "−k", "C₀ / 2k", "0.1 C₀ / k", "doubles"],
            ["First", "ln C vs t", "−k", "0.693 / k", "0.105 / k", "unchanged"],
            ["Second", "1/C vs t", "+k", "1 / (k C₀)", "1 / (9 k C₀)", "halves"],
          ],
        },
        {
          kind: "example",
          title: "Zero order: a reconstituted suspension",
          problem:
            "An illustrative oral suspension loses drug by apparent zero-order kinetics with k = 0.25 % per day, starting from 100 % of label claim. Find t90 and the % remaining after 30 days.",
          steps: [
            "Zero order, so C = C₀ − kt and t90 = 0.1 C₀ / k.",
            "t90 = (0.1 × 100 %) / 0.25 % day⁻¹ = 10 / 0.25 = 40 days.",
            "After 30 days: C = 100 − (0.25 × 30) = 100 − 7.5 = 92.5 %.",
          ],
          answer: "t90 = 40 days; 92.5 % remains after 30 days.",
          note: "The zero-order equation only holds while solid drug is still suspended. Once it has all dissolved, loss becomes first order and the line bends.",
        },
        {
          kind: "example",
          title: "First order: half-life, t90 and amount remaining",
          problem:
            "An illustrative drug in solution degrades by first-order kinetics with k = 2.1 × 10⁻³ day⁻¹. Find t½, t90 and the % remaining after 120 days.",
          steps: [
            "t½ = 0.693 / k = 0.693 / 0.0021 = 330 days.",
            "t90 = 0.105 / k = 0.105 / 0.0021 = 50 days. (Using the unrounded 0.10536 gives 50.2 days.)",
            "C = C₀ e⁻ᵏᵗ = 100 × e^(−0.0021 × 120) = 100 × e^(−0.252) = 77.7 %.",
          ],
          answer: "t½ = 330 days; t90 = 50 days; 77.7 % remains after 120 days.",
          note: "Notice t90 is far shorter than t½. Losing the first 10 % takes about a sixth of a half-life, which is why shelf life is never estimated from t½.",
        },
        {
          kind: "example",
          title: "Second order: dependence on starting concentration",
          problem:
            "An illustrative second-order degradation has k = 0.050 L mol⁻¹ min⁻¹ and C₀ = 0.020 mol L⁻¹. Find t½ and t90, then t½ if C₀ is halved to 0.010 mol L⁻¹.",
          steps: [
            "t½ = 1 / (k C₀) = 1 / (0.050 × 0.020) = 1 / 0.0010 = 1000 min.",
            "t90 = 1 / (9 k C₀) = 1 / (9 × 0.0010) = 111 min.",
            "With C₀ = 0.010 mol L⁻¹: t½ = 1 / (0.050 × 0.010) = 2000 min.",
          ],
          answer: "t½ = 1000 min and t90 = 111 min at 0.020 mol L⁻¹; t½ = 2000 min at 0.010 mol L⁻¹.",
          note: "Halving C₀ doubled t½. That behaviour is the fingerprint of second order.",
        },
      ],
    },
    {
      id: "determine-order",
      heading: "Determining the order from data",
      blocks: [
        {
          kind: "p",
          text: "In a stability practical you measure drug content (often as absorbance, converted to % remaining) at a series of times. The order is found by testing which form of the data falls on a straight line.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Convert each reading to % remaining: % remaining = (Aₜ / A₀) × 100, or (Cₜ / C₀) × 100.",
            "Make three columns: % remaining, ln (% remaining) and 1/(% remaining).",
            "Fit a least-squares straight line of each column against time and note the slope, intercept and R².",
            "The model whose plot is straightest (highest R², residuals scattered randomly about zero) is the candidate order.",
            "Get k from that slope: k = −slope for zero and first order, k = +slope for second order. Attach the units for that order.",
            "Calculate t½ and t90 from k using that order's equations.",
          ],
        },
        {
          kind: "p",
          text: "A second, independent test uses half-lives. If you have runs at two starting concentrations, compare their half-lives: unchanged means first order, longer at higher C₀ means zero order, and longer at lower C₀ means second order. This is a useful check because it does not depend on how well a line fits a single run.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Why a narrow R² margin cannot decide the order",
          text: "Over a small extent of degradation, all three plots are almost straight. In the illustrative run below, the drug fell from 100 % to 90.4 % over 10 hours, and the three fits gave R² = 0.9974 (zero), 0.9978 (first) and 0.9977 (second). The 'winner' leads by 0.0001, which is smaller than the effect of one slightly noisy reading. The honest conclusion is that the data cannot tell the orders apart. To separate them, follow the reaction further (ideally past 50 % loss), add replicate readings, or run a second starting concentration and compare half-lives.",
        },
        {
          kind: "table",
          caption: "Illustrative short run where the order cannot be decided (time in hours)",
          head: ["t (h)", "0", "2", "4", "6", "8", "10"],
          rows: [["% remaining", "100.0", "98.1", "95.8", "94.3", "92.0", "90.4"]],
        },
      ],
    },
    {
      id: "worked-analysis",
      heading: "Worked data analysis: fitting all three orders",
      blocks: [
        {
          kind: "p",
          text: "The table below is an illustrative accelerated study of a drug in aqueous solution held at a single raised temperature. Drug content was assayed seven times over 48 hours and expressed as % of the starting content. The ln and reciprocal columns are what you plot for first and second order.",
        },
        {
          kind: "table",
          caption: "Illustrative stability data with transformed columns",
          head: ["t (h)", "% remaining", "ln (% remaining)", "1 / (% remaining)"],
          rows: [
            ["0", "100.0", "4.6052", "0.01000"],
            ["4", "88.6", "4.4841", "0.01129"],
            ["8", "78.9", "4.3682", "0.01267"],
            ["12", "70.4", "4.2542", "0.01420"],
            ["24", "49.3", "3.8979", "0.02028"],
            ["36", "34.8", "3.5496", "0.02874"],
            ["48", "24.6", "3.2027", "0.04065"],
          ],
        },
        {
          kind: "table",
          caption: "Least-squares fits of the three linearised plots",
          head: ["Model", "Plot", "Slope", "Intercept", "R²"],
          rows: [
            ["Zero order", "% remaining vs t", "−1.557 % h⁻¹", "93.15 %", "0.9676"],
            ["First order", "ln (% remaining) vs t", "−0.02921 h⁻¹", "4.6026", "0.99998"],
            ["Second order", "1/(% remaining) vs t", "+0.000623 %⁻¹ h⁻¹", "0.00794 %⁻¹", "0.9688"],
          ],
        },
        {
          kind: "example",
          title: "Choosing the order and estimating k, t½ and t90",
          problem:
            "Using the fits above, decide the order of degradation and calculate k, t½ and t90 for this illustrative product at the study temperature.",
          steps: [
            "Compare R²: first order 0.99998 against 0.9676 (zero) and 0.9688 (second). The margin is about 0.03, which is large, and the data run past 75 % loss, so the curvature of the other two plots is real. The order is first.",
            "Check the intercept: e^4.6026 = 99.7 %, close to the 100 % measured at t = 0, so the line describes the whole run.",
            "k = −slope = −(−0.02921) = 0.02921 h⁻¹.",
            "t½ = 0.693 / 0.02921 = 23.7 h. Check against the table: at 24 h, 49.3 % remained, very close to half.",
            "t90 = 0.105 / 0.02921 = 3.59 h, about 3.6 h.",
          ],
          answer: "First order; k = 0.0292 h⁻¹; t½ = 23.7 h; t90 ≈ 3.6 h at the study temperature.",
          note: "This t90 describes these illustrative conditions only. It is a laboratory estimate, not the labelled shelf life of any product.",
        },
        {
          kind: "p",
          text: "Plotting the residuals (observed minus fitted values) is a good habit. For the correct model they scatter randomly around zero. For a wrong model they form a curve: here the zero-order residuals are positive at both ends and negative in the middle, because the true decay is curved on a linear axis.",
        },
      ],
    },
    {
      id: "shelf-life",
      heading: "Shelf life: t90 estimate versus labelled shelf life",
      blocks: [
        {
          kind: "p",
          text: "Many products are specified to contain not less than 90 % of the labelled amount, which is why t90 is used as the kinetic estimate of shelf life. But the t90 you calculate in a practical and the expiry date printed on a pack are not the same thing.",
        },
        {
          kind: "list",
          items: [
            "A calculated t90 comes from one fitted rate constant, at one temperature, in one batch, usually from a few readings. It carries the uncertainty of that fit.",
            "A labelled shelf life comes from formal stability studies on several batches in the final container, under defined long-term and accelerated storage conditions, evaluated statistically.",
            "Formal evaluation does not use the mean regression line alone. ICH Q1E describes using the confidence limit of the regression, so that the shelf life is the time at which the lower confidence bound (not the average) reaches the acceptance criterion. That makes it shorter, and safer, than a simple t90.",
            "Shelf life also depends on things kinetics ignores: degradation products that may be toxic before potency falls to 90 %, changes in appearance, pH, dissolution, microbial quality and container interactions.",
          ],
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Do not extrapolate t90 beyond your data",
          text: "If your readings cover only the first 5 % of loss, a t90 at 10 % loss is an extrapolation. If they cover 30 days, a t90 of two years is a long extrapolation. The further you go beyond the data, the more an error in the slope, or a change in mechanism, grows in the answer.",
        },
      ],
    },
    {
      id: "temperature",
      heading: "Temperature and the Arrhenius equation",
      blocks: [
        {
          kind: "p",
          text: "Raising temperature speeds up almost every degradation reaction. The Arrhenius equation describes how the rate constant depends on absolute temperature, and it is the conceptual basis of accelerated stability testing: measure k quickly at high temperatures, then estimate k at storage temperature.",
        },
        {
          kind: "formula",
          expr: "ln k = ln A − Ea / RT",
          where: [
            { sym: "A", meaning: "frequency (pre-exponential) factor, same units as k" },
            { sym: "Ea", meaning: "activation energy, J mol⁻¹" },
            { sym: "R", meaning: "gas constant, 8.314 J mol⁻¹ K⁻¹" },
            { sym: "T", meaning: "absolute temperature in kelvin (°C + 273.15)" },
          ],
          note: "A plot of ln k against 1/T is a straight line with slope −Ea/R. With rate constants at three or more temperatures, fit this line rather than using just two points.",
        },
        {
          kind: "formula",
          expr: "ln (k₂ / k₁) = (Ea / R) × (1/T₁ − 1/T₂)",
          where: [{ sym: "k₁, k₂", meaning: "rate constants at T₁ and T₂ (same order, same units)" }],
          note: "The two-temperature form. Use it to find Ea from two rate constants, or to find k at a new temperature when Ea is known.",
        },
        {
          kind: "example",
          title: "Activation energy and a predicted rate at 25 °C",
          problem:
            "An illustrative first-order degradation has k = 0.0120 day⁻¹ at 50 °C and k = 0.0300 day⁻¹ at 60 °C. Find Ea, then estimate k and t90 at 25 °C, assuming the same mechanism holds.",
          steps: [
            "Convert to kelvin: T₁ = 50 + 273.15 = 323.15 K; T₂ = 60 + 273.15 = 333.15 K.",
            "ln (k₂/k₁) = ln (0.0300/0.0120) = ln 2.5 = 0.9163.",
            "1/T₁ − 1/T₂ = 0.0030945 − 0.0030017 = 9.289 × 10⁻⁵ K⁻¹.",
            "Ea = R × 0.9163 / (9.289 × 10⁻⁵) = 8.314 × 9864 = 82 000 J mol⁻¹ = 82.0 kJ mol⁻¹.",
            "At T₃ = 298.15 K: ln (k₂₅/k₅₀) = (Ea/R)(1/323.15 − 1/298.15) gives k₂₅ = 0.0120 × e^(−2.560) = 9.28 × 10⁻⁴ day⁻¹.",
            "t90 at 25 °C = 0.105 / (9.28 × 10⁻⁴) = 113 days.",
          ],
          answer: "Ea ≈ 82.0 kJ mol⁻¹; predicted k at 25 °C ≈ 9.3 × 10⁻⁴ day⁻¹; predicted t90 ≈ 113 days.",
          note: "This is a prediction from two points, 25 °C below the lowest temperature measured. It is a first estimate to be confirmed by real-time data, not a shelf life.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Where Arrhenius extrapolation breaks down",
          text: "The prediction assumes one mechanism with the same Ea at every temperature. That fails when a different pathway dominates at high temperature, when a solid melts or changes form, when moisture content changes with temperature, when a suspension's solubility shifts, or for proteins that unfold. ICH Q1E allows only limited extrapolation of stability data and expects it to be supported by real-time results at the storage condition, so accelerated data alone do not set a shelf life.",
        },
      ],
    },
  ],
  mistakes: [
    "Using log₁₀ instead of ln for first order. The slope of log₁₀ C against t is −k/2.303, so k = −2.303 × slope. Forgetting the 2.303 makes k too small and t½ 2.303 times too long.",
    "Giving k the wrong units, for example writing h⁻¹ for a zero-order constant. Units follow the order: concentration per time for zero, time⁻¹ for first, concentration⁻¹ time⁻¹ for second.",
    "Assuming first order without testing. Fit all three plots and check residuals; suspensions in particular often show apparent zero-order loss.",
    "Declaring an order from an R² lead in the fourth decimal place. A margin that small is within measurement noise; say the order is not resolved and collect more data.",
    "Taking the sign of k from the wrong slope. For zero and first order k = −slope; for second order k = +slope, because 1/C rises with time.",
    "Using °C in the Arrhenius equation. Temperature must be in kelvin; 1/50 and 1/60 give a meaningless Ea.",
    "Mixing time units, such as readings in minutes but quoting k per hour, or calculating t½ in hours and t90 in days from the same k without converting.",
    "Extrapolating t90 far beyond the data and calling it the shelf life, instead of treating it as an experimental estimate under the study conditions.",
  ],
  practice: [
    {
      q: "An illustrative suspension degrades by apparent zero-order kinetics with k = 0.40 % per month from 100 %. Find t90 and the % remaining after 12 months.",
      answer: "t90 = 25 months; 95.2 % remains after 12 months.",
      working: [
        "Zero order: t90 = 0.1 C₀ / k = 10 / 0.40 = 25 months.",
        "C = C₀ − kt = 100 − (0.40 × 12) = 100 − 4.8 = 95.2 %.",
      ],
    },
    {
      q: "A drug degrades by first-order kinetics with t½ = 46 days. Find k and t90.",
      answer: "k = 0.0151 day⁻¹; t90 = 6.97 days (about 7 days).",
      working: [
        "k = 0.693 / t½ = 0.693 / 46 = 0.01507 day⁻¹.",
        "t90 = 0.105 / k = 0.105 / 0.01507 = 6.97 days.",
        "Shortcut: t90 = t½ × 0.105/0.693 = 46 × 0.1515 = 6.97 days.",
      ],
    },
    {
      q: "In an illustrative first-order study, drug content falls from 100 % to 85 % in 30 days. Find k, t½ and t90.",
      answer: "k = 5.42 × 10⁻³ day⁻¹; t½ = 128 days; t90 = 19.4 days.",
      working: [
        "ln C = ln C₀ − kt, so k = ln (C₀/C) / t = ln (100/85) / 30.",
        "ln (100/85) = ln 1.1765 = 0.1625; k = 0.1625 / 30 = 0.005417 day⁻¹.",
        "t½ = 0.693 / 0.005417 = 128 days.",
        "t90 = 0.105 / 0.005417 = 19.4 days.",
      ],
    },
    {
      q: "A second-order degradation has k = 0.15 L mol⁻¹ h⁻¹ and C₀ = 0.040 mol L⁻¹. Find t½ and the concentration after 100 h.",
      answer: "t½ = 167 h; C = 0.025 mol L⁻¹ (62.5 % remaining) after 100 h.",
      working: [
        "t½ = 1 / (k C₀) = 1 / (0.15 × 0.040) = 1 / 0.0060 = 166.7 h.",
        "1/C = 1/C₀ + kt = 1/0.040 + 0.15 × 100 = 25 + 15 = 40 L mol⁻¹.",
        "C = 1/40 = 0.025 mol L⁻¹, which is 0.025/0.040 × 100 = 62.5 % of C₀.",
      ],
    },
    {
      q: "A plot of ln (% remaining) against time in hours gives a slope of −0.0462. Give k in h⁻¹ and day⁻¹, and t½ in hours.",
      answer: "k = 0.0462 h⁻¹ = 1.11 day⁻¹; t½ = 15.0 h.",
      working: [
        "First order: k = −slope = 0.0462 h⁻¹.",
        "Per day: 0.0462 × 24 = 1.109 day⁻¹.",
        "t½ = 0.693 / 0.0462 = 15.0 h.",
      ],
    },
    {
      q: "In two runs of the same reaction, t½ was 40 min when C₀ = 0.10 mol L⁻¹ and 80 min when C₀ = 0.05 mol L⁻¹. What is the order, and what is k?",
      answer: "Second order; k = 0.25 L mol⁻¹ min⁻¹.",
      working: [
        "Halving C₀ doubled t½, so t½ is inversely proportional to C₀: second order.",
        "t½ = 1/(k C₀), so k = 1/(t½ C₀) = 1/(40 × 0.10) = 0.25 L mol⁻¹ min⁻¹.",
        "Check with the second run: 1/(80 × 0.05) = 0.25 L mol⁻¹ min⁻¹.",
      ],
    },
    {
      q: "An illustrative first-order degradation has k = 0.0050 day⁻¹ at 40 °C and Ea = 75 kJ mol⁻¹. Estimate k and t90 at 50 °C.",
      answer: "k ≈ 0.0122 day⁻¹ (about 2.4 times faster); t90 falls from 21.0 days to about 8.6 days.",
      working: [
        "T₁ = 313.15 K, T₂ = 323.15 K; 1/T₁ − 1/T₂ = 9.882 × 10⁻⁵ K⁻¹.",
        "ln (k₂/k₁) = (75 000 / 8.314) × 9.882 × 10⁻⁵ = 0.8914; k₂/k₁ = e^0.8914 = 2.44.",
        "k₂ = 0.0050 × 2.44 = 0.0122 day⁻¹.",
        "t90 at 40 °C = 0.105 / 0.0050 = 21.0 days; at 50 °C = 0.105 / 0.0122 = 8.6 days.",
      ],
    },
    {
      q: "A student plots log₁₀ (% remaining) against time and gets a slope of −0.0100 h⁻¹. They report t½ = 0.693/0.0100 = 69.3 h. What is the correct t½?",
      answer: "t½ = 30.1 h; the student forgot the factor 2.303.",
      working: [
        "For a log₁₀ plot, slope = −k / 2.303, so k = 2.303 × 0.0100 = 0.02303 h⁻¹.",
        "t½ = 0.693 / 0.02303 = 30.1 h.",
        "The reported 69.3 h is 2.303 times too long.",
      ],
    },
  ],
  limitations: [
    "Real degradation is often more complex than a single order: parallel, consecutive or reversible reactions, and catalysis by pH, buffers or metal ions, can bend the plots in ways none of the three models describes.",
    "R² alone is a weak test. With few points, little degradation or noisy assays, several models fit almost equally well; residual plots, more extensive degradation and half-life comparisons are needed.",
    "Rate constants apply only to the formulation, container, pH and temperature they were measured in. Changing an excipient or the pack can change both k and the order.",
    "Arrhenius predictions assume a single mechanism and a constant activation energy, and are especially unreliable for solids, moisture-sensitive products, suspensions and proteins.",
    "A kinetic t90 is an estimate. Regulatory shelf lives are set from multi-batch, real-time studies evaluated with confidence limits, not from one fitted line.",
  ],
  refs: ["martin8", "connors", "aulton6", "ichQ1AR2", "ichQ1E", "iupacGoldBook"],
  relatedTools: [
    {
      slug: "stability-kinetics-calculator",
      name: "Drug Stability Kinetics Calculator",
      why: "Fits zero-, first- and second-order plots to your Time vs Absorbance data and reports the order, k, t½ and t90 with the same formulas and C₀ = 100 % used in this guide.",
    },
    {
      slug: "ke-calculator",
      name: "Ke Calculator",
      why: "Converts between a first-order rate constant and half-life (k = 0.693 / t½), the same relation used for first-order degradation here.",
    },
    {
      slug: "order-kinetics-calculator",
      name: "First-Order vs Zero-Order Kinetics Tool",
      why: "Plots first-order and zero-order decay side by side so you can see a constant fraction lost versus a constant amount lost.",
    },
  ],
  relatedGuides: ["pharmacokinetic-parameters", "accuracy-precision-recovery", "dilution-and-concentration"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "team-checked", checkedOn: "2026-10-12" },
    updated: "2026-10-12",
  },
};
