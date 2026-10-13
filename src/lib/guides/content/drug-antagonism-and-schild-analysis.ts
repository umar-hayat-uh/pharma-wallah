import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples and practice answers was
 * recomputed in Python, including the two Schild regressions (least squares on
 * log(r − 1) against log[B]). Drugs are "Drug A", "Drug B"… and every K_B,
 * EC₅₀ and dose ratio is illustrative.
 *
 * Deliberately NOT linked: antagonism-simulator. Its non-competitive and
 * uncompetitive formulas are algebraically identical (recorded fault), so it
 * would contradict the uncompetitive section below.
 */
export const guide: Guide = {
  slug: "drug-antagonism-and-schild-analysis",
  title: "Drug Antagonism: Competitive, Non-Competitive and Schild Analysis",
  description:
    "Tell competitive, non-competitive and uncompetitive antagonism apart, calculate dose ratios, and find pA₂ and K_B from a Schild plot, step by step.",
  category: "Pharmacology",
  objectives: [
    "Classify antagonism as pharmacological (competitive, non-competitive, uncompetitive), physiological or chemical, and give the mechanism of each.",
    "Predict how each type of receptor antagonist changes an agonist's dose–response curve (EC₅₀, Emax, or both).",
    "Calculate the dose ratio produced by a competitive antagonist from its K_B and concentration, and the new EC₅₀ of the agonist.",
    "Construct a Schild plot from dose-ratio data, read its slope, and calculate pA₂ and K_B.",
    "Explain why a Schild slope of 1 supports simple competitive antagonism and what a slope far from 1 suggests.",
  ],
  intro: [
    "An antagonist is a drug that reduces or abolishes the effect of another drug — usually an agonist — without producing that effect itself. Antagonists are among the most widely used medicines, and how they block matters: some can be overcome simply by giving more agonist, while others cannot, whatever the agonist dose.",
    "The difference shows up clearly on a log dose–response curve. A competitive antagonist slides the agonist's curve to the right without changing its maximum. A non-competitive antagonist pulls the maximum down. Measuring how far the curve moves for a given antagonist concentration lets pharmacologists calculate the antagonist's affinity for the receptor, using a method devised by Schild that is still a standard laboratory practical.",
    "This guide assumes you know what EC₅₀ and Emax mean (see the dose–response guide). All drugs are called Drug A, Drug B and so on, and every constant is illustrative.",
  ],
  terms: [
    {
      term: "Antagonist",
      definition:
        "A drug that reduces the action of an agonist. A receptor antagonist binds the receptor but has no intrinsic efficacy (or, for an inverse agonist, negative efficacy).",
    },
    {
      term: "Competitive (surmountable) antagonism",
      definition:
        "The antagonist binds reversibly to the same site as the agonist. Raising the agonist concentration displaces it, so the maximum effect can still be reached; the curve shifts right in parallel.",
    },
    {
      term: "Non-competitive (insurmountable) antagonism",
      definition:
        "The antagonist blocks at a different (allosteric) site, blocks a step after the receptor, or binds irreversibly. More agonist cannot overcome it, so Emax falls.",
    },
    {
      term: "Uncompetitive antagonism",
      definition:
        "The antagonist acts only on receptors already activated by the agonist (for example, a channel blocker that enters an open channel). It becomes more effective as agonist concentration rises and lowers Emax.",
    },
    {
      term: "Dose ratio (r)",
      definition:
        "The factor by which the agonist concentration must be increased, in the presence of an antagonist, to give the same response as before: r = EC₅₀ with antagonist ÷ EC₅₀ without.",
    },
    {
      term: "K_B",
      definition:
        "The equilibrium dissociation constant of the antagonist for the receptor, in mol/L: the antagonist concentration that occupies half the receptors at equilibrium. Lower K_B means higher affinity.",
    },
    {
      term: "pA₂",
      definition:
        "The negative log₁₀ of the molar antagonist concentration that produces a dose ratio of 2. For a simple competitive antagonist (Schild slope 1), pA₂ = pK_B = −log₁₀ K_B.",
    },
    {
      term: "Physiological (functional) and chemical antagonism",
      definition:
        "Physiological antagonism is two drugs producing opposing effects through different receptors or systems. Chemical antagonism is one drug inactivating another directly, for example by binding or neutralising it, without involving a receptor.",
    },
  ],
  sections: [
    {
      id: "types",
      heading: "Types of antagonism",
      blocks: [
        {
          kind: "p",
          text: "Antagonism is classified first by where it happens. Pharmacological (receptor) antagonism happens at the agonist's own receptor. Physiological antagonism involves two drugs acting on different receptors to produce opposite effects — one constricts a smooth muscle through one receptor while the other relaxes it through another. Chemical antagonism needs no receptor at all: one substance binds or neutralises the other, as when a chelating agent binds a metal ion or an antibody binds a drug.",
        },
        {
          kind: "table",
          caption: "How receptor antagonists change the agonist's log dose–response curve (simple models)",
          head: ["Type", "Where it binds", "EC₅₀ of agonist", "Emax of agonist", "Overcome by more agonist?"],
          rows: [
            ["Competitive, reversible", "Same site as agonist", "Increased (shift right)", "Unchanged", "Yes"],
            ["Non-competitive (allosteric or post-receptor)", "Different site or downstream step", "Unchanged in the simple model", "Reduced", "No"],
            ["Irreversible competitive", "Same site, covalent or very slow off-rate", "May shift right first (receptor reserve)", "Reduced once reserve is used up", "No"],
            ["Uncompetitive", "Only the agonist-activated receptor", "Decreased (shift left) in the simple model", "Reduced", "No — block increases with agonist"],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Real tissues are less tidy",
          text: "The table describes simple models. In a tissue with spare receptors, an irreversible or non-competitive antagonist can first shift the curve to the right and only depress the maximum at higher concentrations, because the spare receptors absorb the first part of the block. Allosteric modulators can also change agonist affinity, efficacy or both.",
        },
      ],
    },
    {
      id: "competitive",
      heading: "Competitive antagonism and the dose ratio",
      blocks: [
        {
          kind: "p",
          text: "Agonist and competitive antagonist compete for the same site. At equilibrium the antagonist simply makes the agonist look less potent: to achieve the same receptor occupancy as before, the agonist concentration must be multiplied by a constant factor, the dose ratio. Because every point on the curve is multiplied by the same factor, the log curve moves right by log r without any change in its shape or maximum.",
        },
        {
          kind: "formula",
          expr: "r = EC₅₀′ ÷ EC₅₀ = 1 + [B] ÷ K_B",
          where: [
            { sym: "r", meaning: "the dose ratio (dimensionless)" },
            { sym: "EC₅₀′", meaning: "agonist EC₅₀ in the presence of the antagonist" },
            { sym: "EC₅₀", meaning: "agonist EC₅₀ without antagonist" },
            { sym: "[B]", meaning: "antagonist concentration, in the same unit as K_B" },
            { sym: "K_B", meaning: "antagonist dissociation constant" },
          ],
          note: "This is the Schild equation. It assumes reversible competition at one site, equilibrium, and that the agonist's response depends only on its occupancy.",
        },
        {
          kind: "example",
          title: "Example 1: shift produced by a competitive antagonist",
          problem:
            "Drug B is a competitive antagonist with an illustrative K_B of 2 nM. It is present at 18 nM. Agonist Drug A has an EC₅₀ of 3 µM without the antagonist. What is the dose ratio, and the new EC₅₀ of Drug A?",
          steps: [
            "[B] ÷ K_B = 18 ÷ 2 = 9.",
            "r = 1 + 9 = 10.",
            "EC₅₀′ = 3 µM × 10 = 30 µM.",
          ],
          answer: "Dose ratio 10; Drug A's EC₅₀ rises from 3 µM to 30 µM, with Emax unchanged.",
          note: "On a log axis the curve moves right by log 10 = 1 unit. A tenfold higher agonist concentration restores every response.",
        },
        {
          kind: "p",
          text: "The effect at any agonist concentration [A] in the presence of the antagonist follows from the Gaddum equation for occupancy, which multiplies the agonist's dissociation constant (or, in the simplest case, its EC₅₀) by the dose ratio.",
        },
        {
          kind: "formula",
          expr: "E = Emax × [A] ÷ ( EC₅₀ × (1 + [B] ÷ K_B) + [A] )",
          note: "Simplest case, Hill coefficient 1. With [B] = 0 it reduces to the ordinary Emax equation.",
        },
      ],
    },
    {
      id: "schild",
      heading: "The Schild plot: measuring K_B and pA₂",
      blocks: [
        {
          kind: "p",
          text: "Taking logarithms of the Schild equation gives a straight line. If the agonist curve is measured with several antagonist concentrations, and the dose ratio found for each, a plot of log(r − 1) against log[B] should be a straight line with a slope of 1. Its intercept on the log[B] axis (where log(r − 1) = 0, that is r = 2) is −pA₂.",
        },
        {
          kind: "formula",
          expr: "log(r − 1) = log[B] − log K_B;   pA₂ = −log[B] at r = 2;   if slope = 1, pA₂ = pK_B = −log₁₀ K_B",
          where: [
            { sym: "log[B]", meaning: "log₁₀ of the antagonist concentration in mol/L (x-axis)" },
            { sym: "log(r − 1)", meaning: "log₁₀ of (dose ratio − 1) (y-axis)" },
          ],
          note: "Fit the line by least squares; pA₂ = intercept on the y-axis ÷ slope (that is, minus the x-intercept). Use mol/L for [B], otherwise pA₂ is wrong.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Measure the agonist's log dose–response curve alone, then with at least three antagonist concentrations, each spaced by about tenfold and each left to equilibrate.",
            "Find the EC₅₀ (or any matched response level) for each curve, and calculate r = EC₅₀′ ÷ EC₅₀.",
            "Calculate log[B] (in M) and log(r − 1) for each antagonist concentration.",
            "Plot log(r − 1) against log[B] and fit a straight line.",
            "Check the slope. A slope close to 1 is consistent with simple competitive antagonism; then pA₂ estimates pK_B.",
          ],
        },
        {
          kind: "example",
          title: "Example 2: a Schild plot from laboratory data",
          problem:
            "In an illustrative organ-bath practical, Drug C gives dose ratios of 3.2, 22 and 190 at 1 nM, 10 nM and 100 nM. Find the Schild slope, pA₂ and K_B.",
          steps: [
            "log[B] in M: 1 nM = 10⁻⁹ M → −9; 10 nM → −8; 100 nM → −7.",
            "log(r − 1): log 2.2 = 0.342; log 21 = 1.322; log 189 = 2.276.",
            "Least-squares fit: slope = 0.967 (close to 1); y-intercept = 9.050.",
            "pA₂ = y-intercept ÷ slope = 9.050 ÷ 0.967 = 9.36.",
            "K_B = 10^(−9.36) M = 4.4 × 10⁻¹⁰ M ≈ 0.44 nM.",
          ],
          answer: "Slope 0.97; pA₂ = 9.36; K_B ≈ 0.44 nM.",
          note: "The slope is near 1, so the data fit simple competitive antagonism and pA₂ can be taken as pK_B. If the slope is forced to 1, pA₂ is the mean of (log(r − 1) − log[B]) = 9.31 — very similar.",
        },
        {
          kind: "example",
          title: "Example 3: K_B from a single dose ratio",
          problem:
            "With 10 nM of Drug D (a competitive antagonist), the agonist EC₅₀ increases sixfold. Assuming a Schild slope of 1, estimate K_B and pK_B.",
          steps: [
            "Rearrange the Schild equation: K_B = [B] ÷ (r − 1).",
            "K_B = 10 nM ÷ (6 − 1) = 2 nM = 2 × 10⁻⁹ M.",
            "pK_B = −log₁₀(2 × 10⁻⁹) = 8.70.",
          ],
          answer: "K_B = 2 nM; pK_B = 8.70.",
          note: "A single dose ratio cannot test the slope. Use it only when competitive antagonism has already been established.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "When the slope is not 1",
          text: "A Schild slope clearly different from 1 means the simple competitive model does not apply, and pA₂ should not be reported as pK_B. Possible reasons include lack of equilibrium, removal or uptake of the agonist or antagonist by the tissue, the agonist acting at more than one receptor type, or an antagonist that is not purely competitive.",
        },
      ],
    },
    {
      id: "insurmountable",
      heading: "Non-competitive and uncompetitive antagonism",
      blocks: [
        {
          kind: "p",
          text: "In the simplest non-competitive model, the antagonist removes a fraction of the receptors (or of the downstream response) from action, whatever the agonist does. The fraction left working is K_B ÷ (K_B + [B]), so the maximum falls by that factor while the agonist's EC₅₀ is unchanged (in a tissue without spare receptors).",
        },
        {
          kind: "formula",
          expr: "Non-competitive (simple model): Emax′ = Emax × K_B ÷ (K_B + [B]);   EC₅₀′ = EC₅₀",
        },
        {
          kind: "example",
          title: "Example 4: depression of the maximum",
          problem:
            "Drug E is a non-competitive antagonist with an illustrative K_B of 5 nM, used at 15 nM. The agonist alone has an Emax of 100% and EC₅₀ of 1 µM. Using the simple model, what are the new Emax and EC₅₀?",
          steps: [
            "Fraction of response remaining = K_B ÷ (K_B + [B]) = 5 ÷ (5 + 15) = 5 ÷ 20 = 0.25.",
            "Emax′ = 100% × 0.25 = 25%.",
            "EC₅₀′ = 1 µM (unchanged in this model).",
          ],
          answer: "Emax falls to 25%; EC₅₀ stays at 1 µM.",
          note: "No amount of extra agonist restores the lost 75% while the antagonist is present.",
        },
        {
          kind: "p",
          text: "Uncompetitive antagonism behaves differently because the antagonist can only bind once the agonist has activated the receptor. In the simplest model, by analogy with uncompetitive enzyme inhibition, both Emax and EC₅₀ are divided by the same factor (1 + [B] ÷ K_B): the maximum falls and the curve shifts to the left. This is why uncompetitive and non-competitive antagonism must not be treated as the same thing.",
        },
        {
          kind: "formula",
          expr: "Uncompetitive (simple model): Emax′ = Emax ÷ (1 + [B] ÷ K_B);   EC₅₀′ = EC₅₀ ÷ (1 + [B] ÷ K_B)",
          note: "A teaching model. Real use-dependent blockers (for example, open-channel blockers) are often described with more detailed kinetic models.",
        },
        {
          kind: "example",
          title: "Example 5: an uncompetitive antagonist",
          problem:
            "Drug F, an uncompetitive antagonist with an illustrative K_B of 10 nM, is present at 10 nM. The agonist alone has Emax 100% and EC₅₀ 4 µM. Using the simple model, find the new Emax and EC₅₀.",
          steps: [
            "Factor = 1 + [B] ÷ K_B = 1 + 10 ÷ 10 = 2.",
            "Emax′ = 100% ÷ 2 = 50%.",
            "EC₅₀′ = 4 µM ÷ 2 = 2 µM.",
          ],
          answer: "Emax 50%; EC₅₀ 2 µM — the maximum falls and the curve moves left.",
        },
      ],
    },
  ],
  mistakes: [
    "Plotting log(r) instead of log(r − 1) on a Schild plot. The '− 1' comes straight from the Schild equation, and leaving it out bends the line and gives the wrong pA₂.",
    "Using the antagonist concentration in nM or µM when calculating log[B] or pA₂. Convert to mol/L first.",
    "Reporting pA₂ as pK_B when the Schild slope is far from 1. The equality holds only for simple competitive antagonism.",
    "Calling every antagonist that lowers Emax 'competitive' or every antagonist that shifts the curve 'non-competitive'. Look at what happens to both EC₅₀ and Emax.",
    "Treating non-competitive and uncompetitive antagonism as identical. In the simple models, non-competitive leaves EC₅₀ unchanged; uncompetitive lowers it.",
    "Calculating the dose ratio from responses at a single agonist concentration rather than from matched points (EC₅₀ to EC₅₀) on the two curves.",
    "Forgetting that a competitive antagonist can be overcome. The block is not 'weaker' — it simply needs a higher agonist concentration to be outcompeted.",
    "Mixing up physiological antagonism (opposing effects through different receptors) with receptor antagonism at the same receptor.",
  ],
  practice: [
    {
      q: "A competitive antagonist has an illustrative K_B of 5 nM and is present at 40 nM. The agonist EC₅₀ alone is 0.2 µM. What are the dose ratio and the new EC₅₀?",
      answer: "r = 9; EC₅₀′ = 1.8 µM.",
      working: [
        "r = 1 + [B] ÷ K_B = 1 + 40 ÷ 5 = 1 + 8 = 9.",
        "EC₅₀′ = 0.2 µM × 9 = 1.8 µM.",
      ],
    },
    {
      q: "With 100 nM of competitive antagonist Drug G, the dose ratio is 11. Estimate K_B and pK_B, assuming a Schild slope of 1.",
      answer: "K_B = 10 nM; pK_B = 8.0.",
      working: [
        "K_B = [B] ÷ (r − 1) = 100 nM ÷ 10 = 10 nM.",
        "10 nM = 1 × 10⁻⁸ M; pK_B = −log₁₀(10⁻⁸) = 8.0.",
      ],
    },
    {
      q: "A competitive antagonist has an illustrative K_B of 4 nM. What concentration gives a dose ratio of 5?",
      answer: "16 nM.",
      working: [
        "r − 1 = [B] ÷ K_B, so [B] = K_B × (r − 1).",
        "[B] = 4 nM × (5 − 1) = 16 nM.",
      ],
    },
    {
      q: "A non-competitive antagonist (simple model) has an illustrative K_B of 2 nM and is used at 6 nM. The agonist alone has Emax 100% and EC₅₀ 0.5 µM. Predict the new Emax and EC₅₀.",
      answer: "Emax′ = 25%; EC₅₀ unchanged at 0.5 µM.",
      working: [
        "Fraction remaining = K_B ÷ (K_B + [B]) = 2 ÷ (2 + 6) = 0.25.",
        "Emax′ = 100% × 0.25 = 25%.",
        "In the simple non-competitive model, EC₅₀ is unchanged: 0.5 µM.",
      ],
    },
    {
      q: "Illustrative Schild data for Drug H: dose ratios 2.6, 17 and 165 at 3 nM, 30 nM and 300 nM. Calculate the slope and pA₂.",
      answer: "Slope ≈ 1.01; pA₂ ≈ 8.72.",
      working: [
        "log[B] (M): log(3 × 10⁻⁹) = −8.523; log(3 × 10⁻⁸) = −7.523; log(3 × 10⁻⁷) = −6.523.",
        "log(r − 1): log 1.6 = 0.204; log 16 = 1.204; log 164 = 2.215.",
        "Least-squares slope = 1.005; y-intercept = 8.771.",
        "pA₂ = 8.771 ÷ 1.0054 = 8.72 (keep the unrounded slope). The slope is close to 1, so pA₂ ≈ pK_B (K_B ≈ 1.9 nM).",
      ],
    },
    {
      q: "A competitive antagonist has an illustrative pA₂ of 7.5 (slope 1). What dose ratio does 1 µM of it produce?",
      answer: "r ≈ 32.6.",
      working: [
        "K_B = 10^(−7.5) M = 3.16 × 10⁻⁸ M (31.6 nM).",
        "[B] = 1 µM = 1 × 10⁻⁶ M.",
        "r = 1 + [B] ÷ K_B = 1 + (1 × 10⁻⁶ ÷ 3.16 × 10⁻⁸) = 1 + 31.6 = 32.6.",
      ],
    },
    {
      q: "An agonist (Emax 100%, EC₅₀ 1 µM, n = 1) is applied at 10 µM. What effect does it give alone, and with a competitive antagonist present at four times its K_B?",
      answer: "90.9% alone; 66.7% with the antagonist.",
      working: [
        "Alone: E = 100 × 10 ÷ (1 + 10) = 1000 ÷ 11 = 90.9%.",
        "With antagonist: r = 1 + 4 = 5, so the effective EC₅₀ is 5 µM.",
        "E = 100 × 10 ÷ (5 + 10) = 1000 ÷ 15 = 66.7%.",
      ],
    },
    {
      q: "A competitive antagonist is present at 50 nM with an illustrative K_B of 10 nM. The agonist EC₅₀ alone is 2 µM. What agonist concentration is now needed to give 50% of Emax, and can the full Emax still be reached?",
      answer: "12 µM; yes, Emax can still be reached with enough agonist.",
      working: [
        "r = 1 + 50 ÷ 10 = 6.",
        "New EC₅₀ = 2 µM × 6 = 12 µM.",
        "Competitive antagonism is surmountable: at high enough agonist concentrations the agonist outcompetes the antagonist and the full Emax returns.",
      ],
    },
  ],
  limitations: [
    "Every K_B, EC₅₀ and dose ratio here is illustrative. Real values depend on the receptor, tissue, species and experimental conditions.",
    "The Schild equation assumes reversible competition at a single site, equilibrium for both drugs, and a response that depends only on agonist occupancy. Many real systems break at least one of these.",
    "The non-competitive and uncompetitive equations here are simple teaching models. Allosteric modulators, irreversible antagonists in tissues with receptor reserve, and use-dependent channel blockers need more detailed models.",
    "Pharmacological constants from isolated tissues are not clinical doses. Nothing here describes how an antagonist should be used in a patient.",
  ],
  refs: ["iupacGoldBook"],
  relatedTools: [
    {
      slug: "dose-response-curve-generator",
      name: "Dose–Response Curve Generator",
      why: "Plot the agonist alone and again with its EC₅₀ multiplied by the dose ratio (competitive) or its Emax reduced (non-competitive) to see the parallel shift and the depressed maximum side by side. It uses the same Emax (Hill) equation as this guide.",
    },
  ],
  relatedGuides: ["dose-response-and-receptor-binding", "therapeutic-index-and-margin-of-safety"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
