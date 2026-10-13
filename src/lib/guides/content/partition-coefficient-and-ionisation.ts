import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples and practice answers was
 * recomputed in Python before drafting. Drugs are "Drug A", "Drug B"… and every
 * pKa, log P and concentration is illustrative, not a property of a real drug.
 *
 * The log D equations assume only the un-ionised form partitions into the
 * organic phase (stated in the guide). Not linked: solubility-calculator
 * (recorded unit-label faults).
 */
export const guide: Guide = {
  slug: "partition-coefficient-and-ionisation",
  title: "Partition Coefficient, log P, log D and the Effect of Ionisation",
  description:
    "Calculate partition and distribution coefficients from shake-flask data, see how pH and pKa change log D, and work through extraction and absorption examples.",
  category: "Pharmaceutics",
  objectives: [
    "Define the partition coefficient (P, log P) and the distribution coefficient (D, log D), and explain how they differ.",
    "Calculate P or D from shake-flask data, including by mass balance when only the aqueous phase is assayed.",
    "Use the Henderson–Hasselbalch equation to find the fraction of a weak acid or weak base that is un-ionised at a given pH.",
    "Calculate log D at any pH from log P and pKa, and work back from a measured log D to log P.",
    "Calculate the fraction extracted by one or several extractions, and explain why several small extractions beat one large one.",
    "Relate log D and ionisation to absorption through the pH-partition hypothesis, and state its limits.",
  ],
  intro: [
    "Before a drug can be absorbed it must cross cell membranes, which are made largely of lipids. How readily a molecule leaves water for a lipid-like environment is measured by shaking it between water and an immiscible organic solvent, usually 1-octanol, and comparing the concentrations in the two layers. That ratio is the partition coefficient, and its logarithm, log P, is one of the most quoted properties of any drug.",
    "Most drugs are weak acids or weak bases, so in water they exist partly as the neutral molecule and partly as an ion. Ions are poorly soluble in octanol and cross membranes poorly. The fraction that is ionised depends on the pH and the drug's pKa, so the effective partitioning — the distribution coefficient, log D — changes with pH. Connecting log P, pKa and pH is what this guide is about.",
    "Every drug, pKa and log P here is illustrative. The same ideas explain extraction in the analytical lab, absorption from the stomach and intestine, and why the pH of a formulation matters.",
  ],
  terms: [
    {
      term: "Partition coefficient (P)",
      definition:
        "The ratio of the concentration of the un-ionised (neutral) species in the organic phase to that in the aqueous phase, at equilibrium. It is a property of the molecule and does not depend on pH.",
    },
    {
      term: "log P",
      definition:
        "log₁₀ of P. log P = 0 means equal concentrations in both phases; each unit up means ten times more in the organic phase. Positive values indicate lipophilic molecules.",
    },
    {
      term: "Distribution coefficient (D)",
      definition:
        "The ratio of the total concentration of the drug (all forms, ionised and un-ionised) in the organic phase to that in the aqueous phase, at a stated pH. log D depends on pH.",
    },
    {
      term: "pKa",
      definition:
        "The pH at which a weak acid (or the conjugate acid of a weak base) is exactly 50% ionised. For a weak base, the pKa quoted is that of its protonated form BH⁺.",
    },
    {
      term: "Un-ionised fraction (fu)",
      definition:
        "The fraction of the drug in solution present as the neutral molecule at a given pH. It determines how much can partition into the organic phase.",
    },
    {
      term: "Shake-flask method",
      definition:
        "Shaking the drug with known volumes of water (or buffer) and octanol until equilibrium, separating the layers, and assaying one or both.",
    },
    {
      term: "pH-partition hypothesis",
      definition:
        "The idea that drugs cross membranes mainly in their un-ionised, lipid-soluble form, so absorption depends on pKa, pH and the lipophilicity of the neutral molecule.",
    },
  ],
  sections: [
    {
      id: "p-and-log-p",
      heading: "Partition coefficient and log P",
      blocks: [
        {
          kind: "formula",
          expr: "P = Corg ÷ Caq   (un-ionised species);   log P = log₁₀ P",
          where: [
            { sym: "Corg", meaning: "equilibrium concentration in the organic phase (usually 1-octanol)" },
            { sym: "Caq", meaning: "equilibrium concentration in the aqueous phase" },
          ],
          note: "Both concentrations must be in the same units, so P is dimensionless. Measure P at a pH where the drug is essentially un-ionised, or use the log D relationship below.",
        },
        {
          kind: "p",
          text: "Often only the aqueous layer is easy to assay. Then the amount in the organic layer is found by mass balance: whatever left the water must be in the octanol, provided nothing was lost to the glass or degraded.",
        },
        {
          kind: "formula",
          expr: "Amount in organic = C₀ × Vaq − Caq × Vaq;   Corg = (amount in organic) ÷ Vorg",
          where: [
            { sym: "C₀", meaning: "concentration in the aqueous phase before shaking" },
            { sym: "Vaq, Vorg", meaning: "volumes of the aqueous and organic phases" },
          ],
        },
        {
          kind: "example",
          title: "Example 1: shake-flask by mass balance",
          problem:
            "50 mL of an aqueous solution of Drug A at 0.200 mg/mL is shaken with 50 mL of octanol at a pH where Drug A is un-ionised. After separation the aqueous layer contains 0.040 mg/mL. Calculate P and log P.",
          steps: [
            "Drug at the start: 0.200 mg/mL × 50 mL = 10.0 mg.",
            "Left in water: 0.040 mg/mL × 50 mL = 2.0 mg.",
            "In octanol: 10.0 − 2.0 = 8.0 mg, so Corg = 8.0 mg ÷ 50 mL = 0.160 mg/mL.",
            "P = 0.160 ÷ 0.040 = 4.0.",
            "log P = log₁₀ 4.0 = 0.602.",
          ],
          answer: "P = 4.0; log P ≈ 0.60.",
          note: "With unequal volumes, always convert to concentrations before dividing — amounts alone give the wrong ratio.",
        },
      ],
    },
    {
      id: "ionisation",
      heading: "Ionisation: Henderson–Hasselbalch in one page",
      blocks: [
        {
          kind: "p",
          text: "A weak acid HA loses a proton to become A⁻; a weak base B gains one to become BH⁺. The Henderson–Hasselbalch equation links the ratio of the two forms to pH and pKa. Written as 'pH = pKa + log(base form ÷ acid form)', it works for both.",
        },
        {
          kind: "formula",
          expr: "pH = pKa + log₁₀([A⁻] ÷ [HA])   (weak acid);   pH = pKa + log₁₀([B] ÷ [BH⁺])   (weak base)",
          where: [
            { sym: "[HA], [A⁻]", meaning: "un-ionised and ionised forms of a weak acid" },
            { sym: "[B], [BH⁺]", meaning: "un-ionised and ionised forms of a weak base" },
          ],
        },
        {
          kind: "formula",
          expr: "Un-ionised fraction: weak acid fu = 1 ÷ (1 + 10^(pH − pKa));   weak base fu = 1 ÷ (1 + 10^(pKa − pH))",
          note: "Rule of thumb: one pH unit away from pKa on the 'ionising' side leaves about 9% un-ionised; two units, about 1%. Acids ionise as pH rises above pKa; bases ionise as pH falls below pKa.",
        },
        {
          kind: "example",
          title: "Example 2: a weak acid at stomach and intestinal pH",
          problem:
            "Drug B is a weak acid with pKa 3.5. What is the ratio [A⁻] : [HA] at pH 1.2 and at pH 6.5?",
          steps: [
            "At pH 1.2: [A⁻] ÷ [HA] = 10^(1.2 − 3.5) = 10^(−2.3) = 0.00501. Almost all un-ionised.",
            "At pH 6.5: [A⁻] ÷ [HA] = 10^(6.5 − 3.5) = 10³ = 1000. Almost all ionised.",
          ],
          answer: "About 0.005 : 1 at pH 1.2 and 1000 : 1 at pH 6.5.",
        },
      ],
    },
    {
      id: "log-d",
      heading: "From log P to log D at any pH",
      blocks: [
        {
          kind: "p",
          text: "If only the un-ionised form enters the octanol, the distribution coefficient is simply P multiplied by the un-ionised fraction. Taking logs gives a convenient form: log D equals log P minus a correction that grows by about one unit for every pH unit beyond the pKa on the ionising side.",
        },
        {
          kind: "formula",
          expr: "Weak acid: log D = log P − log₁₀(1 + 10^(pH − pKa));   Weak base: log D = log P − log₁₀(1 + 10^(pKa − pH))",
          where: [
            { sym: "log P", meaning: "partition coefficient of the un-ionised form" },
            { sym: "pKa", meaning: "of the acid, or of the conjugate acid BH⁺ of a base" },
          ],
          note: "Assumes ions do not partition into octanol and there is no ion pairing. When pH is far on the un-ionised side, log D ≈ log P.",
        },
        {
          kind: "table",
          caption: "Weak acid Drug C (pKa 4.5, log P 2.0): un-ionised fraction and log D at different pH",
          head: ["pH", "pH − pKa", "Un-ionised (%)", "log D"],
          rows: [
            ["1.5", "−3.0", "99.9", "2.00"],
            ["3.5", "−1.0", "90.9", "1.96"],
            ["4.5", "0", "50.0", "1.70"],
            ["5.5", "+1.0", "9.09", "0.96"],
            ["7.4", "+2.9", "0.126", "−0.90"],
          ],
        },
        {
          kind: "example",
          title: "Example 3: a weak base at blood pH",
          problem: "Drug D is a weak base with pKa 9.0 and log P 3.0. Calculate the un-ionised percentage and log D at pH 7.4.",
          steps: [
            "pKa − pH = 9.0 − 7.4 = 1.6; 10^1.6 = 39.81.",
            "1 + 39.81 = 40.81, so un-ionised = 1 ÷ 40.81 = 0.0245, i.e. 2.45%.",
            "log₁₀ 40.81 = 1.611.",
            "log D = 3.0 − 1.611 = 1.389 (D ≈ 24.5).",
          ],
          answer: "About 2.45% un-ionised; log D ≈ 1.39.",
          note: "Even with only 2.5% un-ionised, a high log P can leave log D comfortably positive.",
        },
      ],
    },
    {
      id: "extraction",
      heading: "Using D in extraction",
      blocks: [
        {
          kind: "p",
          text: "In the analytical lab, D tells you how much drug a solvent extraction recovers. After one extraction, the fraction left in the aqueous phase depends on D and on the volume ratio. Repeating the extraction with fresh solvent removes the same fraction of what remains each time.",
        },
        {
          kind: "formula",
          expr: "Fraction left in water after n extractions = [Vaq ÷ (Vaq + D × Vorg)]ⁿ",
          where: [
            { sym: "D", meaning: "distribution coefficient at the pH of the aqueous phase" },
            { sym: "Vaq", meaning: "volume of the aqueous phase" },
            { sym: "Vorg", meaning: "volume of organic solvent used in each extraction" },
            { sym: "n", meaning: "number of extractions" },
          ],
        },
        {
          kind: "example",
          title: "Example 4: one large or two small extractions",
          problem:
            "Drug E has D = 4 at the working pH. It is in 100 mL of water. Compare one extraction with 50 mL of solvent and two extractions with 25 mL each.",
          steps: [
            "One × 50 mL: fraction left = 100 ÷ (100 + 4 × 50) = 100 ÷ 300 = 0.333; extracted 66.7%.",
            "Two × 25 mL: each time fraction left = 100 ÷ (100 + 4 × 25) = 100 ÷ 200 = 0.5.",
            "After two: 0.5² = 0.25 left; extracted 75%.",
          ],
          answer: "One 50 mL extraction recovers 66.7%; two 25 mL extractions recover 75%.",
          note: "Same total solvent, better recovery. Adjusting pH to raise D (un-ionise the drug) helps even more.",
        },
      ],
    },
    {
      id: "absorption",
      heading: "What log D means for absorption",
      blocks: [
        {
          kind: "p",
          text: "The pH-partition hypothesis predicts that weak acids are favoured for absorption where the pH is low and weak bases where it is high, because that is where each is most un-ionised. It explains a great deal: why very polar or permanently charged molecules are poorly absorbed orally, why log D at around pH 6.5–7.4 is a useful screen, and why the pH of an extraction is chosen carefully.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "The hypothesis is a guide, not a rule",
          text: "Most absorption of weak acids still happens in the small intestine, not the stomach, despite their being more ionised there, because the intestine's surface area and blood flow are vastly larger and the pH right at the membrane differs from the bulk pH. Transporters, ion pairs and paracellular routes also contribute. Use log D to compare and explain, not to predict exact absorption.",
        },
      ],
    },
  ],
  mistakes: [
    "Calling a measurement at an arbitrary pH 'log P'. If the drug is partly ionised, what you measured is log D at that pH.",
    "Dividing amounts instead of concentrations when the two phases have different volumes.",
    "Forgetting to subtract what stayed in water when using mass balance, or ignoring drug lost to adsorption or degradation.",
    "Using the acid form of the ionisation equation for a base. For a base, ionisation increases as pH falls below pKa: fu = 1 ÷ (1 + 10^(pKa − pH)).",
    "Using the pKa of a base's own deprotonation instead of the pKa of its conjugate acid BH⁺, which is what tables list.",
    "Treating log D as a fixed property of a drug without stating the pH.",
    "Assuming one large extraction is as good as several small ones with the same total solvent.",
  ],
  practice: [
    {
      q: "At equilibrium, the aqueous phase contains 0.080 mg/mL and the octanol phase 0.96 mg/mL of an un-ionised drug. Calculate P and log P.",
      answer: "P = 12; log P ≈ 1.08.",
      working: ["P = 0.96 ÷ 0.080 = 12.", "log P = log₁₀ 12 = 1.079."],
    },
    {
      q: "A drug has log P = 2.5. What is P?",
      answer: "P ≈ 316.",
      working: ["P = 10^2.5 = 316.2."],
    },
    {
      q: "20 mg of Drug F in 100 mL of buffer is shaken with 25 mL of octanol. Afterwards the buffer contains 0.050 mg/mL. Calculate D.",
      answer: "D = 12.",
      working: [
        "In buffer after: 0.050 × 100 = 5.0 mg.",
        "In octanol: 20 − 5.0 = 15.0 mg; Corg = 15.0 ÷ 25 = 0.60 mg/mL.",
        "D = 0.60 ÷ 0.050 = 12.",
      ],
    },
    {
      q: "Drug G is a weak acid (pKa 4.0, log P 3.0). Calculate the un-ionised percentage and log D at pH 6.0.",
      answer: "About 0.99% un-ionised; log D ≈ 1.00.",
      working: [
        "pH − pKa = 2.0; 10² = 100; 1 + 100 = 101.",
        "Un-ionised = 1 ÷ 101 = 0.0099, i.e. 0.99%.",
        "log D = 3.0 − log₁₀ 101 = 3.0 − 2.0043 = 0.9957.",
      ],
    },
    {
      q: "Drug H is a weak base (pKa 8.0, log P 2.0). Calculate the un-ionised percentage and log D at pH 6.0.",
      answer: "About 0.99% un-ionised; log D ≈ 0.00.",
      working: [
        "pKa − pH = 2.0; 1 + 10² = 101.",
        "Un-ionised = 1 ÷ 101 = 0.99%.",
        "log D = 2.0 − 2.0043 = −0.0043, essentially 0.",
      ],
    },
    {
      q: "At what pH is a weak base with pKa 8.0 90% un-ionised?",
      answer: "pH ≈ 8.95.",
      working: [
        "90% un-ionised means [B] ÷ [BH⁺] = 90 ÷ 10 = 9.",
        "pH = pKa + log₁₀ 9 = 8.0 + 0.954 = 8.954.",
      ],
    },
    {
      q: "Drug J has D = 9. It is in 50 mL of water. Compare one extraction with 30 mL of solvent and three extractions with 10 mL each.",
      answer: "One × 30 mL extracts 84.4%; three × 10 mL extract 95.4%.",
      working: [
        "One: fraction left = 50 ÷ (50 + 9 × 30) = 50 ÷ 320 = 0.15625; extracted 84.375%.",
        "Three: each time 50 ÷ (50 + 9 × 10) = 50 ÷ 140 = 0.35714.",
        "0.35714³ = 0.04555 left; extracted 95.44%.",
      ],
    },
    {
      q: "A weak acid with pKa 5.4 has a measured log D of 0.5 at pH 7.4. Estimate its log P.",
      answer: "log P ≈ 2.50.",
      working: [
        "log P = log D + log₁₀(1 + 10^(pH − pKa)).",
        "pH − pKa = 2.0; 1 + 100 = 101; log₁₀ 101 = 2.0043.",
        "log P = 0.5 + 2.0043 = 2.5043.",
      ],
    },
  ],
  limitations: [
    "Every drug and value here is illustrative. Measured log P and pKa values for real drugs come from the literature or from experiment, and vary with temperature, ionic strength and the method used.",
    "The log D equations assume only the neutral form partitions. Ion pairs, zwitterions and molecules with several ionisable groups need more complex treatment.",
    "Octanol is a model, not a membrane. Real absorption also depends on transporters, metabolism, solubility, dissolution rate and gut physiology.",
    "Shake-flask results depend on reaching equilibrium, mutually saturating the solvents first and assaying both layers accurately; standard test methods describe how.",
  ],
  refs: ["martin8", "aulton6"],
  relatedTools: [
    {
      slug: "partition-coefficient-calculator",
      name: "Partition / Distribution Coefficient Calculator",
      why: "Calculates D = C(organic) ÷ C(aqueous) and log D = log₁₀ D from replicate absorbances at each pH, then plots log D against pH — the practical version of Example 1 and the log D table.",
    },
    {
      slug: "ph-pka-relationship-calculator",
      name: "pH–pKa Calculator (Henderson–Hasselbalch)",
      why: "Solves pH = pKa + log₁₀(base form ÷ acid form) and gives the percentage of each form, as in Example 2. For a weak acid the 'base' form is the ionised A⁻; for a weak base it is the un-ionised B.",
    },
  ],
  relatedGuides: ["dissolution-testing-and-drug-release", "pharmacokinetic-parameters", "dilution-and-concentration"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
