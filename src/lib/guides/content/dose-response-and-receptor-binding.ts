import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples, the table and the practice
 * answers was recomputed in Python before it was written here. Drugs are named
 * "Drug A", "Drug B"… and every constant (EC₅₀, Kd, Emax) is illustrative: this
 * guide teaches the concepts and the arithmetic, never a value for a real drug.
 *
 * No pharmacology textbook is in the reference registry yet, so the reviewer
 * must supply one before publication (see content/briefs/dose-response-and-receptor-binding.md).
 */
export const guide: Guide = {
  slug: "dose-response-and-receptor-binding",
  title: "Dose–Response Curves, Emax, EC50 and Receptor Binding",
  description:
    "Understand graded dose–response curves: Emax, EC₅₀, pEC₅₀, the Hill coefficient, receptor occupancy from Kd, and IC₅₀ to Ki, with worked examples.",
  category: "Pharmacology",
  objectives: [
    "Explain the difference between potency (EC₅₀) and efficacy (Emax), and read both from a dose–response curve.",
    "Calculate the effect expected at a given concentration with the sigmoid Emax (Hill) equation, including a baseline effect.",
    "Calculate the concentration needed for any chosen fraction of the maximum effect, and explain how the Hill coefficient changes it.",
    "Calculate fractional receptor occupancy from Kd and the free drug concentration, and Kd from kon and koff.",
    "Convert EC₅₀ to pEC₅₀ and compare the potency of two drugs, and convert an IC₅₀ to Ki with the Cheng–Prusoff equation.",
  ],
  intro: [
    "Almost every question in pharmacodynamics comes back to one picture: a curve that shows how the size of a drug's effect changes as its concentration rises. At low concentrations nothing much happens; then the effect climbs steeply; and finally it levels off, because the system cannot respond any more. Two numbers capture most of what matters about that curve — how big the effect can get (Emax) and how much drug is needed to get halfway there (EC₅₀).",
    "Behind the curve sits receptor binding. A drug can only act on a receptor it is bound to, and how much binding happens at a given concentration depends on the drug's affinity, measured by its dissociation constant Kd. This guide connects the two ideas, shows the equations that describe them, and works through the calculations that appear in Pharm-D pharmacology practicals and exams.",
    "All drugs here are called Drug A, Drug B and so on, and every constant is illustrative. The aim is to teach how the curves and equations behave, not to give values for any real medicine.",
  ],
  terms: [
    {
      term: "Graded dose–response curve",
      definition:
        "A plot of the size of a response in one system (one tissue, one patient) against drug concentration or dose. The response can take any value between none and the maximum.",
    },
    {
      term: "Efficacy (Emax)",
      definition:
        "The largest effect a drug can produce, however much is given. A full agonist reaches the system's maximum; a partial agonist has a lower Emax even when every receptor is occupied.",
    },
    {
      term: "Potency (EC₅₀)",
      definition:
        "The concentration that produces half of the drug's own maximum effect. A lower EC₅₀ means a more potent drug: less is needed for the same relative effect.",
    },
    {
      term: "pEC₅₀",
      definition:
        "The negative base-10 logarithm of the EC₅₀ expressed in mol/L. Larger pEC₅₀ means greater potency; one unit is a tenfold difference.",
    },
    {
      term: "Hill coefficient (n)",
      definition:
        "A number that describes how steep the curve is around the EC₅₀. n = 1 is the simple, single-site case; n > 1 is steeper and n < 1 shallower. It is an empirical slope factor, not a direct count of binding sites.",
    },
    {
      term: "Dissociation constant (Kd)",
      definition:
        "The free drug concentration at which half of the receptors are occupied at equilibrium. It equals koff ÷ kon. A lower Kd means higher affinity.",
    },
    {
      term: "Fractional occupancy",
      definition: "The proportion of receptors that have drug bound at a given moment, between 0 and 1 (or 0–100%).",
    },
    {
      term: "IC₅₀ and Ki",
      definition:
        "IC₅₀ is the concentration of an inhibitor that reduces a measured binding or response by half under the conditions of one assay. Ki is the inhibitor's own equilibrium dissociation constant, which does not depend on those conditions.",
    },
  ],
  sections: [
    {
      id: "the-curve",
      heading: "Reading a graded dose–response curve",
      blocks: [
        {
          kind: "p",
          text: "If effect is plotted against concentration on an ordinary (linear) axis, the curve is a hyperbola that rises quickly and then flattens slowly. It is hard to read, because the interesting part is squeezed against the left-hand axis. Plotting the same data against the logarithm of concentration spreads it out into the familiar S-shaped (sigmoid) curve, which is roughly straight between about 20% and 80% of the maximum and symmetrical around the EC₅₀ when n = 1.",
        },
        {
          kind: "p",
          text: "Two features of the curve answer two different questions. Its height (Emax) tells you how much effect the drug can produce at all — its efficacy. Its position along the concentration axis (EC₅₀) tells you how much drug is needed — its potency. A curve that sits further to the left belongs to a more potent drug; a curve that reaches higher belongs to a more efficacious one. These are independent: a highly potent drug can have a low Emax, and a weakly potent drug can reach the full maximum if enough is given.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Potency is not the same as 'better'",
          text: "Clinically, efficacy usually matters more than potency. A drug that needs 500 mg for its effect is no worse than one that needs 5 mg, provided it reaches the effect without unacceptable adverse effects. Potency mainly decides the size of the dose.",
        },
      ],
    },
    {
      id: "emax-model",
      heading: "The sigmoid Emax (Hill) equation",
      blocks: [
        {
          kind: "p",
          text: "The shape described above is captured by the sigmoid Emax model, also called the Hill equation. It predicts the effect at any concentration from three or four parameters.",
        },
        {
          kind: "formula",
          expr: "E = E₀ + (Emax × Cⁿ) ÷ (EC₅₀ⁿ + Cⁿ)",
          where: [
            { sym: "E", meaning: "the effect at concentration C (same unit as Emax, often % of a maximum)" },
            { sym: "E₀", meaning: "the baseline effect with no drug present (often 0)" },
            { sym: "Emax", meaning: "the maximum effect the drug adds above baseline" },
            { sym: "C", meaning: "drug concentration at the site of action (any unit, e.g. nM or µM)" },
            { sym: "EC₅₀", meaning: "the concentration giving half of Emax, in the same unit as C" },
            { sym: "n", meaning: "the Hill coefficient (dimensionless)" },
          ],
          note: "C and EC₅₀ must be in the same unit, because only their ratio matters. When C = EC₅₀ the fraction is exactly ½, whatever the value of n.",
        },
        {
          kind: "example",
          title: "Example 1: effect at a given concentration",
          problem:
            "Drug A has an illustrative Emax of 100%, EC₅₀ of 4 µM, Hill coefficient 1 and no baseline effect. What effect is expected at 12 µM?",
          steps: [
            "Write the equation with E₀ = 0 and n = 1: E = Emax × C ÷ (EC₅₀ + C).",
            "Substitute: E = 100 × 12 ÷ (4 + 12) = 1200 ÷ 16.",
            "E = 75%.",
          ],
          answer: "75% of the maximum effect.",
          note: "Three times the EC₅₀ gives three-quarters of Emax when n = 1. Doubling the concentration again would not double the effect: the curve is already flattening.",
        },
        {
          kind: "p",
          text: "Rearranging the equation gives the concentration needed for any fraction p of Emax (with no baseline). This is useful for asking, for example, how much drug is needed for 90% of the maximum.",
        },
        {
          kind: "formula",
          expr: "C = EC₅₀ × ( p ÷ (1 − p) )^(1/n)",
          where: [
            { sym: "p", meaning: "the wanted fraction of Emax, between 0 and 1 (0.9 for 90%)" },
            { sym: "n", meaning: "the Hill coefficient" },
          ],
          note: "For n = 1 this gives the rule of thumb that 90% of Emax needs 9 × EC₅₀, and 10% needs EC₅₀ ÷ 9 — an 81-fold range from 10% to 90%.",
        },
        {
          kind: "example",
          title: "Example 2: how the Hill coefficient changes the curve",
          problem:
            "Drug B has the same illustrative EC₅₀ (4 µM) and Emax (100%) as Drug A, but a Hill coefficient of 2. (a) What effect does it give at 12 µM? (b) What concentration gives 90% of Emax for each drug?",
          steps: [
            "(a) E = 100 × 12² ÷ (4² + 12²) = 100 × 144 ÷ (16 + 144) = 14,400 ÷ 160 = 90%.",
            "(b) Drug A (n = 1): C = 4 × (0.9 ÷ 0.1)¹ = 4 × 9 = 36 µM.",
            "(b) Drug B (n = 2): C = 4 × (0.9 ÷ 0.1)^(1/2) = 4 × √9 = 4 × 3 = 12 µM.",
          ],
          answer: "(a) 90%; (b) 36 µM for Drug A and 12 µM for Drug B.",
          note: "Both drugs give exactly 50% at 4 µM. The steeper curve (n = 2) reaches 90% at three times the EC₅₀ instead of nine times, so its 10–90% range is only 9-fold instead of 81-fold.",
        },
        {
          kind: "table",
          caption: "Percentage of Emax at multiples of the EC₅₀ (no baseline)",
          head: ["C ÷ EC₅₀", "n = 1", "n = 2"],
          rows: [
            ["0.1", "9.1%", "1.0%"],
            ["0.33", "25.0%", "10.0%"],
            ["1", "50.0%", "50.0%"],
            ["3", "75.0%", "90.0%"],
            ["9", "90.0%", "98.8%"],
            ["10", "90.9%", "99.0%"],
            ["100", "99.0%", "99.99%"],
          ],
        },
      ],
    },
    {
      id: "pec50",
      heading: "Comparing potency with pEC₅₀",
      blocks: [
        {
          kind: "p",
          text: "EC₅₀ values for different drugs can differ by many orders of magnitude, so pharmacologists often work with their negative logarithm. Because a logarithm turns a ratio into a difference, comparing two pEC₅₀ values tells you at once how many times more potent one drug is than another.",
        },
        {
          kind: "formula",
          expr: "pEC₅₀ = −log₁₀(EC₅₀ in mol/L);   potency ratio = 10^(pEC₅₀ of drug X − pEC₅₀ of drug Y)",
          note: "Convert the EC₅₀ to mol/L (M) first: 1 µM = 10⁻⁶ M and 1 nM = 10⁻⁹ M. A pEC₅₀ worked out from a value in nM or µM is wrong.",
        },
        {
          kind: "example",
          title: "Example 3: pEC₅₀ and a potency ratio",
          problem:
            "Drug C has an illustrative EC₅₀ of 32 nM and Drug D an EC₅₀ of 0.5 µM on the same tissue. Calculate each pEC₅₀ and say how many times more potent Drug C is.",
          steps: [
            "Drug C: 32 nM = 3.2 × 10⁻⁸ M; pEC₅₀ = −log₁₀(3.2 × 10⁻⁸) = 7.49.",
            "Drug D: 0.5 µM = 5 × 10⁻⁷ M; pEC₅₀ = −log₁₀(5 × 10⁻⁷) = 6.30.",
            "Potency ratio = EC₅₀(D) ÷ EC₅₀(C) = 5 × 10⁻⁷ ÷ 3.2 × 10⁻⁸ = 15.6 (equivalently 10^(7.49 − 6.30)).",
          ],
          answer: "pEC₅₀ 7.49 for Drug C and 6.30 for Drug D; Drug C is about 16 times more potent.",
          note: "This says nothing about which drug has the larger Emax. Potency ratios are only meaningful between drugs measured in the same system.",
        },
      ],
    },
    {
      id: "occupancy",
      heading: "Receptor binding and occupancy",
      blocks: [
        {
          kind: "p",
          text: "A drug (D) binds to its receptor (R) reversibly, forming a drug–receptor complex (DR). At equilibrium, the rate at which complexes form equals the rate at which they fall apart. The law of mass action then gives a simple relationship between the free drug concentration and the fraction of receptors occupied.",
        },
        {
          kind: "formula",
          expr: "D + R ⇌ DR;   Kd = koff ÷ kon = [D][R] ÷ [DR]",
          where: [
            { sym: "kon", meaning: "association rate constant, in M⁻¹ s⁻¹" },
            { sym: "koff", meaning: "dissociation rate constant, in s⁻¹" },
            { sym: "Kd", meaning: "equilibrium dissociation constant, in M (mol/L)" },
          ],
        },
        {
          kind: "formula",
          expr: "Fractional occupancy f = [D] ÷ (Kd + [D]);   Bound = Bmax × [D] ÷ (Kd + [D])",
          where: [
            { sym: "[D]", meaning: "free drug concentration, in the same unit as Kd" },
            { sym: "Bmax", meaning: "total number (or concentration) of receptors" },
          ],
          note: "This is the Hill equation with n = 1 and EC₅₀ replaced by Kd. When [D] = Kd, half the receptors are occupied; 90% occupancy needs [D] = 9 × Kd.",
        },
        {
          kind: "example",
          title: "Example 4: occupancy from Kd",
          problem:
            "Drug E binds its receptor with an illustrative Kd of 2 nM. (a) What fraction of receptors is occupied at a free concentration of 6 nM? (b) What free concentration gives 90% occupancy?",
          steps: [
            "(a) f = 6 ÷ (2 + 6) = 6 ÷ 8 = 0.75, so 75% of receptors are occupied.",
            "(b) Rearrange: [D] = Kd × f ÷ (1 − f) = 2 × 0.9 ÷ 0.1 = 18 nM.",
          ],
          answer: "(a) 75%; (b) 18 nM.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Occupancy is not effect",
          text: "Kd describes binding; EC₅₀ describes response. They are equal only in the simplest case. Many tissues have spare receptors and amplify the signal, so a full agonist can produce its maximum effect while occupying only a small fraction of the receptors — its EC₅₀ is then lower than its Kd. A partial agonist, by contrast, cannot reach the system maximum even at full occupancy.",
        },
      ],
    },
    {
      id: "ic50-ki",
      heading: "From IC₅₀ to Ki: the Cheng–Prusoff equation",
      blocks: [
        {
          kind: "p",
          text: "Affinity is often measured indirectly, in a competition binding assay. A fixed concentration of a labelled ligand (the radioligand) is added to the receptors together with increasing concentrations of the unlabelled test drug, and the concentration of test drug that displaces half of the specific binding is recorded as the IC₅₀. The IC₅₀ depends on how much radioligand was used — more radioligand needs more test drug to displace it — so it is converted to the assay-independent Ki.",
        },
        {
          kind: "formula",
          expr: "Ki = IC₅₀ ÷ (1 + [L*] ÷ Kd*)",
          where: [
            { sym: "Ki", meaning: "the test drug's equilibrium dissociation constant" },
            { sym: "IC₅₀", meaning: "the test drug concentration that halves specific radioligand binding" },
            { sym: "[L*]", meaning: "the concentration of radioligand used in the assay" },
            { sym: "Kd*", meaning: "the radioligand's own dissociation constant" },
          ],
          note: "Valid for simple competitive binding at a single site, at equilibrium. [L*] is the radioligand's concentration — not the concentration of the drug you are testing.",
        },
        {
          kind: "example",
          title: "Example 5: converting IC₅₀ to Ki",
          problem:
            "In a competition assay, Drug F has an illustrative IC₅₀ of 60 nM. The radioligand was used at 2 nM and its Kd is 1 nM. What is the Ki of Drug F?",
          steps: [
            "[L*] ÷ Kd* = 2 ÷ 1 = 2.",
            "Ki = 60 ÷ (1 + 2) = 60 ÷ 3 = 20 nM.",
          ],
          answer: "Ki = 20 nM.",
          note: "The IC₅₀ overstates Ki by a factor of three here, because the radioligand was used at twice its own Kd. If [L*] is much smaller than Kd*, IC₅₀ and Ki are nearly equal.",
        },
      ],
    },
  ],
  mistakes: [
    "Confusing potency with efficacy. A lower EC₅₀ means less drug is needed, not that the drug can produce a bigger effect; Emax answers that question.",
    "Treating EC₅₀ as the concentration giving 50% of the system's maximum. It is half of the drug's own Emax, so a partial agonist's EC₅₀ gives less than 50% of the system maximum.",
    "Using C and EC₅₀ (or [D] and Kd) in different units, for example C in µM and EC₅₀ in nM. Only the ratio matters, so mismatched units give an answer off by a factor of 1000.",
    "Calculating pEC₅₀ from a value in nM or µM instead of mol/L. −log₁₀(32) is not a pEC₅₀; −log₁₀(3.2 × 10⁻⁸) is.",
    "Assuming that doubling the concentration doubles the effect. That is roughly true only well below the EC₅₀; near the top of the curve a large increase in concentration adds very little effect.",
    "Equating Kd with EC₅₀. Binding and response are linked through the tissue's signalling, receptor reserve and the drug's intrinsic efficacy, so the two are usually different.",
    "Reporting an IC₅₀ as if it were an affinity constant. IC₅₀ depends on the assay conditions; convert it with Cheng–Prusoff, using the radioligand's concentration and Kd.",
    "Reading the Hill coefficient as the number of binding sites. It is a steepness factor that can reflect cooperativity, signal amplification or simply the shape of the data.",
  ],
  practice: [
    {
      q: "Drug G has an illustrative Emax of 100%, EC₅₀ of 10 µM, n = 1 and no baseline. What effect is expected at 5 µM and at 30 µM?",
      answer: "33.3% at 5 µM; 75% at 30 µM.",
      working: [
        "E = Emax × C ÷ (EC₅₀ + C).",
        "At 5 µM: 100 × 5 ÷ (10 + 5) = 500 ÷ 15 = 33.3%.",
        "At 30 µM: 100 × 30 ÷ (10 + 30) = 3000 ÷ 40 = 75%.",
      ],
    },
    {
      q: "Drug H has an illustrative EC₅₀ of 2.5 nM. What is its pEC₅₀?",
      answer: "pEC₅₀ = 8.60.",
      working: [
        "Convert to mol/L: 2.5 nM = 2.5 × 10⁻⁹ M.",
        "pEC₅₀ = −log₁₀(2.5 × 10⁻⁹) = 8.60.",
      ],
    },
    {
      q: "A ligand has an illustrative Kd of 1.5 nM. What percentage of receptors is occupied at free concentrations of 0.5 nM and 4.5 nM?",
      answer: "25% at 0.5 nM; 75% at 4.5 nM.",
      working: [
        "f = [D] ÷ (Kd + [D]).",
        "At 0.5 nM: 0.5 ÷ (1.5 + 0.5) = 0.5 ÷ 2.0 = 0.25 = 25%.",
        "At 4.5 nM: 4.5 ÷ (1.5 + 4.5) = 4.5 ÷ 6.0 = 0.75 = 75%.",
      ],
    },
    {
      q: "Drug J has an illustrative EC₅₀ of 20 nM. What concentration gives 80% of Emax if n = 1? And if n = 2?",
      answer: "80 nM if n = 1; 40 nM if n = 2.",
      working: [
        "C = EC₅₀ × (p ÷ (1 − p))^(1/n), with p = 0.8, so p ÷ (1 − p) = 0.8 ÷ 0.2 = 4.",
        "n = 1: C = 20 × 4 = 80 nM.",
        "n = 2: C = 20 × √4 = 20 × 2 = 40 nM.",
      ],
    },
    {
      q: "A tissue has an illustrative baseline tone of 10 units. Drug K adds at most 60 units (Emax), with EC₅₀ = 2 µM and n = 1. What response is expected at 6 µM?",
      answer: "55 units.",
      working: [
        "E = E₀ + Emax × C ÷ (EC₅₀ + C).",
        "Drug-induced part = 60 × 6 ÷ (2 + 6) = 360 ÷ 8 = 45 units.",
        "Total E = 10 + 45 = 55 units.",
      ],
    },
    {
      q: "In a competition binding assay, Drug L gives an illustrative IC₅₀ of 150 nM. The radioligand was used at 4 nM and has a Kd of 2 nM. Calculate the Ki.",
      answer: "Ki = 50 nM.",
      working: [
        "[L*] ÷ Kd* = 4 ÷ 2 = 2.",
        "Ki = IC₅₀ ÷ (1 + 2) = 150 ÷ 3 = 50 nM.",
      ],
    },
    {
      q: "A ligand has illustrative rate constants kon = 4 × 10⁵ M⁻¹ s⁻¹ and koff = 1.2 × 10⁻³ s⁻¹. Calculate Kd in nM and pKd.",
      answer: "Kd = 3 nM; pKd = 8.52.",
      working: [
        "Kd = koff ÷ kon = 1.2 × 10⁻³ s⁻¹ ÷ 4 × 10⁵ M⁻¹ s⁻¹ = 3.0 × 10⁻⁹ M (s⁻¹ cancels, leaving M).",
        "3.0 × 10⁻⁹ M = 3 nM.",
        "pKd = −log₁₀(3.0 × 10⁻⁹) = 8.52.",
      ],
    },
    {
      q: "On the same tissue, Drug M has an illustrative pEC₅₀ of 8.2 and Drug N a pEC₅₀ of 6.9. Which is more potent, and by roughly how much? Can you tell which has the greater efficacy?",
      answer: "Drug M is about 20 times more potent. No — pEC₅₀ says nothing about efficacy.",
      working: [
        "The higher pEC₅₀ (Drug M) means the lower EC₅₀, so Drug M is more potent.",
        "Potency ratio = 10^(8.2 − 6.9) = 10^1.3 = 19.95, about 20-fold.",
        "Efficacy is the height of the curve (Emax), which pEC₅₀ does not contain; you would need each drug's Emax to compare it.",
      ],
    },
  ],
  limitations: [
    "Every constant in this guide is illustrative. Real EC₅₀, Kd and Emax values depend on the tissue, the species, the assay and the conditions, and must be taken from primary sources.",
    "The Emax model assumes the effect depends only on the concentration at the site of action at that moment. Delays between plasma concentration and effect, tolerance, active metabolites and indirect mechanisms all break that assumption.",
    "The occupancy equation assumes a single binding site, equilibrium, and that free drug is not depleted by binding. Multiple sites, slow binding or receptor concentrations close to Kd need more complex models.",
    "Cheng–Prusoff applies to simple competitive binding at equilibrium. It does not hold for allosteric or irreversible inhibitors, or for functional (response) assays without further corrections.",
    "This guide covers graded curves. Quantal (all-or-none) dose–response curves, which give ED₅₀ and the therapeutic index, are covered in the therapeutic index guide.",
  ],
  refs: ["rowland5", "iupacGoldBook"],
  relatedTools: [
    {
      slug: "dose-response-curve-generator",
      name: "Dose–Response Curve Generator",
      why: "Plots the same sigmoid Emax (Hill) equation used here for several drugs at once, on linear and log axes, so you can see how EC₅₀, Emax and n move the curve; it also reports the concentration for 90% of Emax (EC₅₀ × 9^(1/n)).",
    },
    {
      slug: "drug-receptor-binding-affinity-tool",
      name: "Drug–Receptor Binding Affinity Tool",
      why: "Enter a Kd and a free ligand concentration to get occupancy = [L] ÷ (Kd + [L]) and the bound amount, as in Example 4. Use the Kd field; the tool's affinity labels are its own bands, not a standard classification.",
    },
  ],
  relatedGuides: [
    "drug-antagonism-and-schild-analysis",
    "therapeutic-index-and-margin-of-safety",
    "pharmacokinetic-parameters",
  ],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
