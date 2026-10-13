import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples and practice answers was
 * recomputed in Python (including the log-normal ED₉₉/TD₁ figures, z₀.₉₉ =
 * 2.3263). Drugs are "Drug A", "Drug B"… and every ED₅₀/TD₅₀/LD₅₀ is
 * illustrative, never a value for a real medicine.
 *
 * Deliberately NOT linked: therapeutic-index-calculator (its "known drug"
 * presets are therapeutic plasma ranges, not ED₅₀/TD₅₀, and its safety bands
 * are invented) and ed50-td50-ld50-calculator (inverted probit slope).
 */
export const guide: Guide = {
  slug: "therapeutic-index-and-margin-of-safety",
  title: "Therapeutic Index and Margin of Safety",
  description:
    "Calculate the therapeutic index (TD₅₀/ED₅₀), the certain safety factor and the standard safety margin, and see why TI is not the therapeutic window.",
  category: "Pharmacology",
  objectives: [
    "Explain what a quantal dose–response curve shows and how ED₅₀, TD₅₀ and LD₅₀ are read from it.",
    "Calculate the therapeutic index from ED₅₀ and TD₅₀ (or LD₅₀), and say which toxic end point it was based on.",
    "Calculate the certain safety factor (TD₁/ED₉₉) and the standard safety margin, and explain why they can disagree with the TI.",
    "Estimate an ED₅₀ from quantal data by interpolating on a log-dose scale.",
    "Distinguish the therapeutic index (a ratio of doses in a population) from the therapeutic window (a range of plasma concentrations in a patient).",
  ],
  intro: [
    "Every drug that can help can also harm; the question is how far apart the two are. The therapeutic index (TI) puts a number on that distance by comparing the dose that is toxic in half of a population with the dose that is effective in half. A large TI suggests a comfortable gap; a small TI warns that the effective dose and the toxic dose are close together.",
    "The TI is simple to calculate, but it is easy to over-interpret. It compares two midpoints and ignores how steep the curves are, so two drugs with the same TI can behave very differently in the people at the edges of the population — the most sensitive patients, who are exactly the ones at risk. This guide shows how the TI is calculated, how safety factors that look at the edges of the curves complement it, and why the TI is a different idea from the therapeutic window used in therapeutic drug monitoring.",
    "All drugs here are called Drug A, Drug B and so on, and every dose is illustrative. Nothing in this guide is a statement about the safety of a real medicine.",
  ],
  terms: [
    {
      term: "Quantal dose–response curve",
      definition:
        "A plot of the percentage of a population showing a defined all-or-none response (for example, 'pain relieved', 'sedated', 'died') against dose, usually on a log-dose axis. It describes how sensitivity varies between individuals.",
    },
    {
      term: "ED₅₀",
      definition: "The median effective dose: the dose at which 50% of the population shows the defined therapeutic response.",
    },
    {
      term: "TD₅₀",
      definition:
        "The median toxic dose: the dose at which 50% of the population shows a defined toxic effect. Which toxic effect must always be stated.",
    },
    {
      term: "LD₅₀",
      definition: "The median lethal dose, measured in animal studies: the dose that kills 50% of the animals tested.",
    },
    {
      term: "Therapeutic index (TI)",
      definition:
        "TD₅₀ ÷ ED₅₀ (in humans or as a clinical concept) or LD₅₀ ÷ ED₅₀ (in animal studies). A ratio of two median doses; it has no units.",
    },
    {
      term: "Certain safety factor (CSF)",
      definition:
        "TD₁ ÷ ED₉₉ (or LD₁ ÷ ED₉₉): the dose that harms only 1% divided by the dose that works in 99%. A value above 1 means the two curves do not overlap at those extremes.",
    },
    {
      term: "Standard safety margin (SSM)",
      definition:
        "(TD₁ − ED₉₉) ÷ ED₉₉ × 100%: how far, as a percentage, the ED₉₉ can be exceeded before 1% of the population is harmed. Negative values mean overlap.",
    },
    {
      term: "Therapeutic window (therapeutic range)",
      definition:
        "The range of plasma concentrations, from the minimum effective concentration to the concentration above which toxicity becomes likely, within which a patient is usually treated. It is a concentration range for therapy, not a ratio of population doses.",
    },
  ],
  sections: [
    {
      id: "quantal-curves",
      heading: "Quantal curves: effect in a population",
      blocks: [
        {
          kind: "p",
          text: "A graded dose–response curve (see the dose–response guide) shows how the size of an effect grows in one system. A quantal curve asks a different question: at each dose, what percentage of a population responds at all? Because people (and animals) differ in sensitivity, a few respond at a low dose, most respond somewhere in the middle, and a few need a high dose. Plotted against log dose, the cumulative percentage responding usually forms an S-shaped curve.",
        },
        {
          kind: "p",
          text: "The same population can be studied for several end points, each with its own curve: one for the therapeutic effect, one for a particular adverse effect, and in animals one for death. The median of each curve — the dose at which 50% respond — gives ED₅₀, TD₅₀ and LD₅₀. The steepness of each curve shows how much individuals vary: a steep curve means most of the population responds over a narrow range of doses.",
        },
        {
          kind: "p",
          text: "When only a few doses have been tested, the ED₅₀ can be estimated by interpolating between the two doses that bracket 50%. Because the curve is roughly straight against log dose in its middle part, the interpolation is done on log dose, not on dose.",
        },
        {
          kind: "formula",
          expr: "log ED₅₀ = log D₁ + (50 − P₁) ÷ (P₂ − P₁) × (log D₂ − log D₁)",
          where: [
            { sym: "D₁, D₂", meaning: "the two doses that bracket 50% response (D₁ lower), in mg/kg" },
            { sym: "P₁, P₂", meaning: "the percentage responding at D₁ and D₂" },
          ],
          note: "A quick estimate only. A properly fitted probit or logistic analysis of all the data gives a better ED₅₀ and its confidence interval.",
        },
        {
          kind: "example",
          title: "Example 1: ED₅₀ by log-dose interpolation",
          problem:
            "In an illustrative study of Drug A, 30% of animals respond at 4 mg/kg and 70% at 8 mg/kg. Estimate the ED₅₀.",
          steps: [
            "50% lies (50 − 30) ÷ (70 − 30) = 20 ÷ 40 = 0.5 of the way from the first point to the second.",
            "log ED₅₀ = log 4 + 0.5 × (log 8 − log 4) = 0.6021 + 0.5 × 0.3010 = 0.7526.",
            "ED₅₀ = 10^0.7526 = 5.66 mg/kg.",
          ],
          answer: "ED₅₀ ≈ 5.7 mg/kg.",
          note: "Linear interpolation on dose would give 6 mg/kg. Halfway on a log scale between 4 and 8 is their geometric mean, √(4 × 8) = 5.66.",
        },
      ],
    },
    {
      id: "therapeutic-index",
      heading: "Calculating the therapeutic index",
      blocks: [
        {
          kind: "formula",
          expr: "TI = TD₅₀ ÷ ED₅₀   (or, in animal studies, TI = LD₅₀ ÷ ED₅₀)",
          where: [
            { sym: "TD₅₀", meaning: "median toxic dose for a stated toxic effect, in mg/kg" },
            { sym: "LD₅₀", meaning: "median lethal dose, in mg/kg" },
            { sym: "ED₅₀", meaning: "median effective dose for a stated therapeutic effect, in the same unit" },
          ],
          note: "The units cancel, so the TI is a pure number. Both doses must be in the same units and come from the same species and route.",
        },
        {
          kind: "example",
          title: "Example 2: TI depends on the toxic end point",
          problem:
            "In an illustrative animal study, Drug B has an ED₅₀ of 5 mg/kg and an LD₅₀ of 400 mg/kg. A separate study of Drug C finds an ED₅₀ of 10 mg/kg and a TD₅₀ (for a non-lethal adverse effect) of 40 mg/kg. Calculate each TI.",
          steps: [
            "Drug B: TI = LD₅₀ ÷ ED₅₀ = 400 ÷ 5 = 80.",
            "Drug C: TI = TD₅₀ ÷ ED₅₀ = 40 ÷ 10 = 4.",
          ],
          answer: "TI = 80 for Drug B (lethality-based); TI = 4 for Drug C (adverse-effect-based).",
          note: "The two numbers are not comparable: one uses death in animals, the other a non-lethal adverse effect. A TI must always be quoted with its end point.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "TI is not the therapeutic window",
          text: "The therapeutic index is a ratio of two median doses in a population. The therapeutic window is a range of plasma concentrations used to guide treatment of one patient — for example, an illustrative window of 10 to 20 mg/L. Saying a drug has a 'narrow therapeutic index' and saying it has a 'narrow therapeutic window' express a similar worry, but the numbers are different things: a window of 10–20 mg/L does not mean the TI is 2, and a TI cannot be calculated from a therapeutic range.",
        },
      ],
    },
    {
      id: "safety-factors",
      heading: "Why the slope matters: safety factors at the edges",
      blocks: [
        {
          kind: "p",
          text: "The TI compares the middles of two curves. But the patients at risk are at the ends: the most sensitive people on the toxicity curve and the least sensitive on the efficacy curve. If the toxicity curve is shallow, its lower tail can reach down into the doses needed to treat most patients, even though the medians are far apart. The certain safety factor and the standard safety margin look at those tails directly.",
        },
        {
          kind: "formula",
          expr: "CSF = TD₁ ÷ ED₉₉;   SSM = (TD₁ − ED₉₉) ÷ ED₉₉ × 100%",
          where: [
            { sym: "ED₉₉", meaning: "the dose effective in 99% of the population" },
            { sym: "TD₁", meaning: "the dose toxic in 1% of the population (LD₁ in lethality studies)" },
          ],
          note: "CSF > 1 (SSM > 0) means that the dose which treats 99% harms fewer than 1%. CSF < 1 (SSM < 0) means the curves overlap at their extremes.",
        },
        {
          kind: "p",
          text: "If each quantal curve follows a log-normal distribution with a standard deviation σ (in log₁₀ dose units), the tails can be calculated from the median: ED₉₉ = ED₅₀ × 10^(2.326 σ) and TD₁ = TD₅₀ × 10^(−2.326 σ), where 2.326 is the standard normal value that leaves 1% in one tail. A larger σ means a shallower curve.",
        },
        {
          kind: "example",
          title: "Example 3: the same TI, very different safety",
          problem:
            "Drugs D and E both have an illustrative ED₅₀ of 10 mg/kg and TD₅₀ of 100 mg/kg, so both have TI = 10. Both efficacy curves have σ = 0.2 log units. The toxicity curve of Drug D also has σ = 0.2, but Drug E's is shallower, σ = 0.5. Compare their certain safety factors.",
          steps: [
            "ED₉₉ (both drugs) = 10 × 10^(2.326 × 0.2) = 10 × 10^0.4653 = 29.2 mg/kg.",
            "Drug D: TD₁ = 100 × 10^(−2.326 × 0.2) = 100 × 10^(−0.4653) = 34.3 mg/kg. CSF = 34.3 ÷ 29.2 = 1.17; SSM = (34.3 − 29.2) ÷ 29.2 × 100 = +17%.",
            "Drug E: TD₁ = 100 × 10^(−2.326 × 0.5) = 100 × 10^(−1.163) = 6.87 mg/kg. CSF = 6.87 ÷ 29.2 = 0.24; SSM = −76%.",
            "At the ED₉₉ of 29.2 mg/kg, the toxicity curves predict about 0.4% of patients harmed with Drug D but about 14% with Drug E.",
          ],
          answer: "Drug D: CSF 1.17 (no overlap at the extremes). Drug E: CSF 0.24 (marked overlap), despite the identical TI of 10.",
          note: "This is the central weakness of the TI: it ignores the slopes. Always look at the shape of both curves, not just their medians.",
        },
        {
          kind: "table",
          caption: "Measures of drug safety compared",
          head: ["Measure", "Formula", "What it uses", "Main weakness"],
          rows: [
            ["Therapeutic index", "TD₅₀ ÷ ED₅₀ (or LD₅₀ ÷ ED₅₀)", "The two medians", "Ignores the slopes and the tails"],
            ["Certain safety factor", "TD₁ ÷ ED₉₉", "The tails of both curves", "Needs large studies to estimate 1% and 99% doses"],
            ["Standard safety margin", "(TD₁ − ED₉₉) ÷ ED₉₉ × 100%", "The tails, as a percentage", "Same data demands as the CSF"],
            ["Therapeutic window", "MEC to MTC (plasma concentrations)", "Concentrations in patients", "Not a ratio of doses; varies with the patient and the indication"],
          ],
        },
      ],
    },
    {
      id: "practice-meaning",
      heading: "What a narrow therapeutic index means in practice",
      blocks: [
        {
          kind: "p",
          text: "Drugs described as having a narrow therapeutic index are those where small changes in dose or plasma concentration can move a patient from too little effect to toxicity. For such drugs, pharmacists pay particular attention to dose calculations, interactions that raise or lower plasma levels, changes in kidney or liver function, and switching between brands or formulations. Many are monitored by measuring plasma concentrations against a therapeutic window.",
        },
        {
          kind: "list",
          items: [
            "A TI is a population figure from a particular study. It does not tell you the safe dose for an individual patient.",
            "Animal LD₅₀ values say little about the non-lethal adverse effects that limit treatment in people, so a lethality-based TI usually looks much more reassuring than the clinical reality.",
            "The relevant toxic effect depends on the patient: a dose that is acceptable in one condition may be unacceptable in another.",
            "Clinical safety decisions come from the product's approved information and clinical guidance, not from a TI.",
          ],
        },
        {
          kind: "example",
          title: "Example 4: window versus index",
          problem:
            "A textbook describes Drug F with an illustrative therapeutic window of 10–20 mg/L. A student writes 'the TI of Drug F is 20 ÷ 10 = 2'. What is wrong?",
          steps: [
            "20 ÷ 10 = 2 is the ratio of the window's upper and lower plasma concentrations.",
            "A TI needs TD₅₀ and ED₅₀ — median doses from quantal studies in a population — which the window does not give.",
            "The ratio of 2 tells you the window is narrow; it is not the therapeutic index.",
          ],
          answer: "The student has calculated the width of the therapeutic window (a 2-fold concentration range), not the TI.",
        },
      ],
    },
  ],
  mistakes: [
    "Calling the therapeutic window (a plasma concentration range) the therapeutic index, or calculating a 'TI' by dividing the top of a therapeutic range by the bottom.",
    "Quoting a TI without its end points. A TI based on death in animals (LD₅₀) is not comparable with one based on a non-lethal adverse effect (TD₅₀).",
    "Dividing the wrong way round. TI = TD₅₀ ÷ ED₅₀; ED₅₀ ÷ TD₅₀ gives a number below 1 for almost every useful drug.",
    "Assuming that two drugs with the same TI are equally safe. The slopes of the curves decide how much the tails overlap, as Example 3 shows.",
    "Using ED₅₀ and TD₅₀ from different species, routes or studies, or in different units.",
    "Interpolating ED₅₀ linearly on dose rather than on log dose, which biases the estimate upwards.",
    "Treating a TI as a dosing rule for an individual. It is a population statistic and says nothing about the right dose for one patient.",
  ],
  practice: [
    {
      q: "In an illustrative rat study, Drug G has an ED₅₀ of 15 mg/kg and an LD₅₀ of 300 mg/kg. A non-lethal adverse effect has a TD₅₀ of 45 mg/kg. Calculate the TI based on lethality and on the adverse effect.",
      answer: "TI = 20 (LD₅₀-based); TI = 3 (TD₅₀-based).",
      working: [
        "Lethality: TI = LD₅₀ ÷ ED₅₀ = 300 ÷ 15 = 20.",
        "Adverse effect: TI = TD₅₀ ÷ ED₅₀ = 45 ÷ 15 = 3.",
        "The adverse-effect TI is the one closer to what limits clinical use.",
      ],
    },
    {
      q: "Drug H has an illustrative ED₉₉ of 8 mg/kg and TD₁ of 12 mg/kg. Calculate the certain safety factor and the standard safety margin.",
      answer: "CSF = 1.5; SSM = +50%.",
      working: [
        "CSF = TD₁ ÷ ED₉₉ = 12 ÷ 8 = 1.5.",
        "SSM = (12 − 8) ÷ 8 × 100 = 4 ÷ 8 × 100 = 50%.",
        "Positive: the dose that treats 99% can be increased by 50% before 1% of the population is harmed.",
      ],
    },
    {
      q: "Drug J has an illustrative ED₅₀ of 50 mg/kg and TD₅₀ of 250 mg/kg. What is its TI, and which way round would give a wrong answer?",
      answer: "TI = 5. Dividing ED₅₀ by TD₅₀ (50 ÷ 250 = 0.2) is the wrong way round.",
      working: [
        "TI = TD₅₀ ÷ ED₅₀ = 250 ÷ 50 = 5.",
        "The toxic dose goes on top so that a larger TI means a wider gap.",
      ],
    },
    {
      q: "In an illustrative study, 20% of animals respond to Drug K at 2 mg/kg and 80% at 8 mg/kg; 40% show toxicity at 20 mg/kg and 90% at 40 mg/kg. Estimate ED₅₀ and TD₅₀ by log-dose interpolation, and the TI.",
      answer: "ED₅₀ ≈ 4.0 mg/kg; TD₅₀ ≈ 23.0 mg/kg; TI ≈ 5.7.",
      working: [
        "ED₅₀: fraction = (50 − 20) ÷ (80 − 20) = 0.5; log ED₅₀ = log 2 + 0.5 × (log 8 − log 2) = 0.3010 + 0.5 × 0.6021 = 0.6021; ED₅₀ = 4.0 mg/kg.",
        "TD₅₀: fraction = (50 − 40) ÷ (90 − 40) = 0.2; log TD₅₀ = log 20 + 0.2 × (log 40 − log 20) = 1.3010 + 0.2 × 0.3010 = 1.3612; TD₅₀ = 22.97 mg/kg.",
        "TI = 22.97 ÷ 4.0 = 5.74.",
      ],
    },
    {
      q: "Drug L has an illustrative ED₉₉ of 9 mg/kg and TD₁ of 6 mg/kg. Calculate the CSF and SSM, and interpret them.",
      answer: "CSF = 0.67; SSM = −33%. The curves overlap: some patients are harmed at doses below the ED₉₉.",
      working: [
        "CSF = 6 ÷ 9 = 0.67.",
        "SSM = (6 − 9) ÷ 9 × 100 = −33.3%.",
        "Because TD₁ is below ED₉₉, giving every patient enough to treat 99% would harm more than 1%.",
      ],
    },
    {
      q: "Drug M is monitored with an illustrative therapeutic range of 0.8–2.0 mg/L. What is the width of the window as a ratio, and can you calculate its TI from this information?",
      answer: "The window is 2.5-fold (2.0 ÷ 0.8). No — the TI cannot be calculated from a therapeutic range.",
      working: [
        "Window ratio = 2.0 ÷ 0.8 = 2.5.",
        "The TI needs TD₅₀ and ED₅₀ from quantal studies, which a plasma concentration range does not provide.",
      ],
    },
    {
      q: "Drug N has an illustrative ED₅₀ of 5 mg/kg and TD₅₀ of 50 mg/kg (TI = 10). Both quantal curves are log-normal with σ = 0.25 log units. Calculate ED₉₉, TD₁ and the CSF.",
      answer: "ED₉₉ ≈ 19.1 mg/kg; TD₁ ≈ 13.1 mg/kg; CSF ≈ 0.69.",
      working: [
        "2.326 × 0.25 = 0.5816.",
        "ED₉₉ = 5 × 10^0.5816 = 5 × 3.816 = 19.08 mg/kg.",
        "TD₁ = 50 × 10^(−0.5816) = 50 × 0.2621 = 13.10 mg/kg.",
        "CSF = 13.10 ÷ 19.08 = 0.69 — the tails overlap even though TI = 10.",
      ],
    },
    {
      q: "Drug P has an illustrative ED₅₀ of 20 mg/kg and TD₅₀ of 600 mg/kg; Drug Q has an ED₅₀ of 3 mg/kg and TD₅₀ of 90 mg/kg. Calculate both TIs. Can you conclude that the two drugs are equally safe?",
      answer: "Both TIs are 30. No — equal TIs do not mean equal safety.",
      working: [
        "Drug P: TI = 600 ÷ 20 = 30.",
        "Drug Q: TI = 90 ÷ 3 = 30.",
        "To compare safety you also need the slopes of the curves (or ED₉₉ and TD₁), the toxic end point used, and the clinical context.",
      ],
    },
  ],
  limitations: [
    "Every ED₅₀, TD₅₀, LD₅₀ and therapeutic range here is illustrative. Nothing in this guide describes the safety of a real medicine.",
    "The log-normal tail calculation assumes each quantal curve follows a normal distribution in log dose. Real data may not, and 1% and 99% doses estimated from small studies are very uncertain.",
    "LD₅₀ values come from animal studies; extrapolating them to humans is unreliable, and modern toxicology relies on many other measures.",
    "TI and safety factors describe a population under study conditions. They do not account for interactions, organ impairment, age, genetics or the clinical consequences of the toxic effect.",
    "Clinical decisions about dose and monitoring come from the product's approved information and clinical guidelines, not from these ratios.",
  ],
  refs: ["rowland5"],
  relatedTools: [
    {
      slug: "dose-response-curve-generator",
      name: "Dose–Response Curve Generator",
      why: "Plot two sigmoid curves on the log axis — one for the therapeutic response and one for toxicity — and change their midpoints and steepness (n) to see how a shallow toxicity curve reaches down into the effective doses, as in Example 3. Its curves are Hill (log-logistic) shapes, a close cousin of the log-normal curves used here.",
    },
  ],
  relatedGuides: ["dose-response-and-receptor-binding", "pharmacokinetic-parameters", "dose-calculations"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
