import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples, the table and the practice
 * answers was recomputed in Python (the weak-acid pH approximations were also
 * checked against the exact quadratic). Drugs are "Drug A", "Drug B"… with
 * illustrative pKa values; the only constants stated as real are textbook
 * acid–base relationships (pKa + pKb = 14 at 25 °C).
 */
export const guide: Guide = {
  slug: "ph-pka-and-henderson-hasselbalch",
  title: "pH, pKa and the Henderson–Hasselbalch Equation",
  description:
    "Use the Henderson–Hasselbalch equation to find pH, buffer ratios and the percentage of a weak acid or base drug that is ionised, with worked examples.",
  category: "Pharmaceutical Chemistry",
  objectives: [
    "Convert between [H⁺] and pH, and between Ka and pKa, without losing track of the logarithms.",
    "Use the Henderson–Hasselbalch equation to calculate the pH of a buffer, or the ratio of conjugate base to acid needed for a chosen pH.",
    "Calculate the percentage of a weak acid or weak base drug that is ionised at a given pH, and say which form predominates.",
    "Estimate the pH of a weak acid solution and check whether the approximation is valid.",
    "Explain pH-partition and ion trapping, and predict the direction in which a weak acid or base will accumulate across a membrane.",
  ],
  intro: [
    "Most drugs are weak acids or weak bases. Whether a molecule carries a charge depends on the pH around it, and that single fact decides a surprising amount: how well the drug dissolves, whether it crosses the gut wall or the blood–brain barrier, how much is reabsorbed in the kidney, and how stable it is in a formulation. The Henderson–Hasselbalch equation is the tool that connects pH, the drug's pKa and the ratio of its ionised and un-ionised forms.",
    "This guide starts with what pH and pKa mean, builds the Henderson–Hasselbalch equation for acids and for bases, and then uses it for three common pharmacy tasks: preparing a buffer, working out the percentage of a drug that is ionised, and predicting where a drug will accumulate between two body compartments. Each idea has a worked example, and the practice questions at the end have full working.",
    "Drugs are called Drug A, Drug B and so on, and their pKa values are illustrative. The arithmetic is the same for any real drug once its pKa is known from a reliable source.",
  ],
  terms: [
    {
      term: "pH",
      definition:
        "−log₁₀[H⁺], with [H⁺] the hydrogen-ion concentration in mol/L (strictly, activity). Each unit of pH is a tenfold change in [H⁺]; lower pH is more acidic.",
    },
    {
      term: "Ka and pKa",
      definition:
        "Ka is the acid dissociation constant for HA ⇌ H⁺ + A⁻, equal to [H⁺][A⁻] ÷ [HA]. pKa = −log₁₀ Ka. A lower pKa means a stronger acid.",
    },
    {
      term: "Conjugate acid–base pair",
      definition:
        "Two species that differ by one proton: HA and A⁻ for an acid, BH⁺ and B for a base. For a base, the pKa quoted is that of its conjugate acid BH⁺.",
    },
    {
      term: "Ionised and un-ionised forms",
      definition:
        "For a weak acid, A⁻ is ionised and HA un-ionised. For a weak base, BH⁺ is ionised and B un-ionised. The un-ionised form is generally the more lipid-soluble.",
    },
    {
      term: "Buffer",
      definition:
        "A solution of a weak acid and its conjugate base (or a weak base and its conjugate acid) that resists changes in pH when small amounts of acid or alkali are added. It works best within about ±1 unit of its pKa.",
    },
    {
      term: "pKb",
      definition:
        "−log₁₀ of the base dissociation constant. In water at 25 °C, pKa + pKb = 14 for a conjugate pair, so a base's strength can be expressed by either number.",
    },
    {
      term: "pH-partition hypothesis",
      definition:
        "The idea that only the un-ionised form of a drug crosses lipid membranes appreciably, so at equilibrium the un-ionised concentration is equal on both sides and the total concentration differs with pH.",
    },
    {
      term: "Ion trapping",
      definition:
        "Accumulation of a drug on the side of a membrane where it is more ionised: weak acids in the more alkaline compartment, weak bases in the more acidic compartment.",
    },
  ],
  sections: [
    {
      id: "ph-and-pka",
      heading: "pH, Ka and pKa",
      blocks: [
        {
          kind: "formula",
          expr: "pH = −log₁₀[H⁺];   [H⁺] = 10^(−pH);   pKa = −log₁₀ Ka;   Ka = 10^(−pKa)",
          where: [
            { sym: "[H⁺]", meaning: "hydrogen-ion concentration, in mol/L" },
            { sym: "Ka", meaning: "acid dissociation constant, in mol/L" },
          ],
          note: "Logarithms take a pure number, so the concentration is used as its value in mol/L. Calculators need the minus sign: 10^(−4.74), not 10^4.74.",
        },
        {
          kind: "example",
          title: "Example 1: Ka to pKa and back",
          problem: "A weak acid has Ka = 1.8 × 10⁻⁵. Find its pKa. A second acid has pKa 9.25; find its Ka.",
          steps: [
            "pKa = −log₁₀(1.8 × 10⁻⁵) = 4.74.",
            "Ka = 10^(−9.25) = 5.6 × 10⁻¹⁰.",
            "The first acid (pKa 4.74) is about 10^(9.25 − 4.74) ≈ 32,000 times stronger than the second.",
          ],
          answer: "pKa = 4.74; Ka = 5.6 × 10⁻¹⁰.",
          note: "A pKa is a property of the molecule, not of the solution. pH describes the solution; comparing the two tells you which form predominates.",
        },
      ],
    },
    {
      id: "hh-equation",
      heading: "The Henderson–Hasselbalch equation",
      blocks: [
        {
          kind: "p",
          text: "Taking the logarithm of the Ka expression and rearranging gives the Henderson–Hasselbalch equation. It is always the same equation — pH equals pKa plus the log of the ratio of the deprotonated form to the protonated form. What changes between acids and bases is only which form carries the charge.",
        },
        {
          kind: "formula",
          expr: "Weak acid:  pH = pKa + log₁₀([A⁻] ÷ [HA]);   Weak base:  pH = pKa + log₁₀([B] ÷ [BH⁺])",
          where: [
            { sym: "[A⁻], [B]", meaning: "the deprotonated form (ionised for an acid, un-ionised for a base)" },
            { sym: "[HA], [BH⁺]", meaning: "the protonated form (un-ionised for an acid, ionised for a base)" },
            { sym: "pKa", meaning: "of the acid HA, or of the conjugate acid BH⁺ for a base" },
          ],
          note: "When pH = pKa, the two forms are equal (ratio 1, log 1 = 0). Each pH unit away from the pKa changes the ratio tenfold.",
        },
        {
          kind: "p",
          text: "Rearranging gives the percentage ionised directly. For an acid, ionisation increases as the pH rises above the pKa; for a base, ionisation increases as the pH falls below the pKa. A useful memory aid: acids are ionised in alkaline surroundings, bases in acidic surroundings.",
        },
        {
          kind: "formula",
          expr: "Weak acid:  % ionised = 100 ÷ (1 + 10^(pKa − pH));   Weak base:  % ionised = 100 ÷ (1 + 10^(pH − pKa))",
        },
        {
          kind: "table",
          caption: "Percentage ionised against (pH − pKa)",
          head: ["pH − pKa", "Weak acid, % ionised", "Weak base, % ionised"],
          rows: [
            ["−2", "0.99%", "99.01%"],
            ["−1", "9.09%", "90.91%"],
            ["0", "50%", "50%"],
            ["+1", "90.91%", "9.09%"],
            ["+2", "99.01%", "0.99%"],
          ],
        },
        {
          kind: "example",
          title: "Example 2: a weak acid drug in the stomach and in plasma",
          problem:
            "Drug A is a weak acid with an illustrative pKa of 3.5. What percentage is ionised in gastric fluid at pH 1.5 and in plasma at pH 7.4?",
          steps: [
            "pH 1.5: % ionised = 100 ÷ (1 + 10^(3.5 − 1.5)) = 100 ÷ (1 + 100) = 0.99%.",
            "pH 7.4: % ionised = 100 ÷ (1 + 10^(3.5 − 7.4)) = 100 ÷ (1 + 10^(−3.9)) = 99.99%.",
            "In plasma the ratio [A⁻] ÷ [HA] = 10^(7.4 − 3.5) = 10^3.9 ≈ 7900.",
          ],
          answer: "About 1% ionised in the stomach; about 99.99% ionised in plasma.",
          note: "Mostly un-ionised in the stomach, so in principle well able to cross membranes there; almost entirely ionised in plasma.",
        },
        {
          kind: "example",
          title: "Example 3: a weak base drug in plasma",
          problem:
            "Drug B is a weak base whose conjugate acid has an illustrative pKa of 9.0. What percentage is ionised at plasma pH 7.4?",
          steps: [
            "For a base, % ionised = 100 ÷ (1 + 10^(pH − pKa)).",
            "= 100 ÷ (1 + 10^(7.4 − 9.0)) = 100 ÷ (1 + 10^(−1.6)) = 100 ÷ 1.0251 = 97.5%.",
            "Equivalently, [BH⁺] ÷ [B] = 10^(9.0 − 7.4) = 10^1.6 = 39.8.",
          ],
          answer: "About 97.5% ionised (BH⁺); 2.5% un-ionised (B).",
        },
      ],
    },
    {
      id: "buffers",
      heading: "Preparing a buffer",
      blocks: [
        {
          kind: "p",
          text: "To make a buffer of a chosen pH, pick an acid–base pair whose pKa is within about one unit of the target pH, then use the Henderson–Hasselbalch equation to find the ratio of base to acid. The total concentration of the pair sets how much acid or alkali the buffer can absorb (its capacity), while the ratio sets the pH.",
        },
        {
          kind: "formula",
          expr: "[A⁻] ÷ [HA] = 10^(pH − pKa);   [A⁻] = C_total × r ÷ (1 + r);   [HA] = C_total ÷ (1 + r)",
          where: [
            { sym: "r", meaning: "the ratio [A⁻] ÷ [HA]" },
            { sym: "C_total", meaning: "[A⁻] + [HA], the total buffer concentration, in mol/L" },
          ],
        },
        {
          kind: "example",
          title: "Example 4: an acetate-type buffer",
          problem:
            "Prepare 0.10 M total of a buffer at pH 5.00 from a weak acid of pKa 4.76 and its sodium salt. What concentrations of salt and acid are needed?",
          steps: [
            "r = 10^(5.00 − 4.76) = 10^0.24 = 1.738.",
            "[A⁻] = 0.10 × 1.738 ÷ 2.738 = 0.0635 M.",
            "[HA] = 0.10 ÷ 2.738 = 0.0365 M.",
            "Check: pH = 4.76 + log₁₀(0.0635 ÷ 0.0365) = 4.76 + 0.24 = 5.00.",
          ],
          answer: "About 0.0635 M salt (A⁻) and 0.0365 M acid (HA).",
          note: "Measure the final pH with a calibrated meter and adjust. Ionic strength and temperature shift the effective pKa slightly, so the equation gives the starting recipe, not the final answer.",
        },
      ],
    },
    {
      id: "weak-acid-ph",
      heading: "The pH of a weak acid solution",
      blocks: [
        {
          kind: "p",
          text: "A solution of a weak acid alone (no salt added) is not a buffer, but its pH can be estimated in the same framework. If only a small fraction of the acid dissociates, [HA] stays close to the concentration C put in, and [H⁺] = √(Ka × C).",
        },
        {
          kind: "formula",
          expr: "pH ≈ ½ (pKa − log₁₀ C)",
          where: [{ sym: "C", meaning: "the concentration of weak acid, in mol/L" }],
          note: "Valid when dissociation is small (roughly under 5%, i.e. [H⁺] ÷ C < 0.05). For very dilute or stronger acids, solve the full quadratic instead, and remember the pH of any acid solution cannot exceed 7.",
        },
        {
          kind: "example",
          title: "Example 5: pH of a weak acid, with a validity check",
          problem: "Estimate the pH of a 0.010 M solution of a weak acid with pKa 4.76.",
          steps: [
            "log₁₀ 0.010 = −2.",
            "pH ≈ ½ × (4.76 − (−2)) = ½ × 6.76 = 3.38.",
            "Check: [H⁺] = 10^(−3.38) = 4.17 × 10⁻⁴ M, which is 4.2% of 0.010 M — small, so the approximation is acceptable.",
            "The exact quadratic gives pH 3.39, confirming it.",
          ],
          answer: "pH ≈ 3.38.",
        },
      ],
    },
    {
      id: "ion-trapping",
      heading: "pH-partition and ion trapping",
      blocks: [
        {
          kind: "p",
          text: "If only the un-ionised form crosses a membrane, at equilibrium the un-ionised concentration is the same on both sides. The total concentration on each side is the un-ionised part plus whatever is ionised at that side's pH. A weak acid therefore accumulates on the more alkaline side, and a weak base on the more acidic side. This underlies the effect of urine pH on the renal excretion of some drugs.",
        },
        {
          kind: "formula",
          expr: "Weak acid:  total ∝ 1 + 10^(pH − pKa);   Weak base:  total ∝ 1 + 10^(pKa − pH)",
          note: "The ratio of totals between two compartments is the ratio of these factors, because the un-ionised concentration is the same in both.",
        },
        {
          kind: "example",
          title: "Example 6: where does a weak acid accumulate?",
          problem:
            "Drug C is a weak acid with an illustrative pKa of 4.4. Predict the equilibrium ratio of total drug in plasma (pH 7.4) to total drug in gastric fluid (pH 1.4).",
          steps: [
            "Plasma factor = 1 + 10^(7.4 − 4.4) = 1 + 1000 = 1001.",
            "Gastric factor = 1 + 10^(1.4 − 4.4) = 1 + 0.001 = 1.001.",
            "Ratio = 1001 ÷ 1.001 = 1000.",
          ],
          answer: "About 1000 : 1 in favour of plasma.",
          note: "This is an equilibrium prediction. Real absorption also depends on surface area, blood flow, dissolution and transporters — most absorption of weak acids still happens in the small intestine because of its huge surface area.",
        },
      ],
    },
  ],
  mistakes: [
    "Using the acid form of the equation for a base without thinking about which form is ionised. For a base, BH⁺ is the ionised form and the ratio [B] ÷ [BH⁺] is un-ionised over ionised.",
    "Using pKb in the Henderson–Hasselbalch equation for a base. Use the pKa of the conjugate acid (pKa = 14 − pKb at 25 °C).",
    "Turning the ratio upside down: pH = pKa + log([HA] ÷ [A⁻]) is wrong and gives a pH on the wrong side of the pKa.",
    "Forgetting the minus sign in 10^(−pH) or 10^(−pKa), which gives concentrations that are wrong by many powers of ten.",
    "Assuming '50% ionised at pH = pKa' means the drug is half absorbed or half active. It only describes the ratio of the two forms.",
    "Applying ½(pKa − log C) to very dilute solutions or relatively strong acids, where dissociation is not small; it can even predict a pH above 7 for an acid.",
    "Choosing a buffer whose pKa is far from the target pH. Outside about ±1 unit of the pKa the buffer has little capacity.",
  ],
  practice: [
    {
      q: "A solution has [H⁺] = 3.2 × 10⁻⁴ M. What is its pH? What is [H⁺] in a solution of pH 8.3?",
      answer: "pH 3.49; [H⁺] = 5.0 × 10⁻⁹ M.",
      working: ["pH = −log₁₀(3.2 × 10⁻⁴) = 3.49.", "[H⁺] = 10^(−8.3) = 5.0 × 10⁻⁹ M."],
    },
    {
      q: "A weak acid has Ka = 4.0 × 10⁻¹⁰. What is its pKa, and is it stronger or weaker than an acid of pKa 4.74?",
      answer: "pKa = 9.40; weaker.",
      working: ["pKa = −log₁₀(4.0 × 10⁻¹⁰) = 9.40.", "Higher pKa means a weaker acid, so it is weaker than the acid of pKa 4.74."],
    },
    {
      q: "Drug D is a weak acid with an illustrative pKa of 4.2. What percentage is ionised at pH 6.2?",
      answer: "99.0%.",
      working: [
        "% ionised = 100 ÷ (1 + 10^(pKa − pH)) = 100 ÷ (1 + 10^(4.2 − 6.2)).",
        "= 100 ÷ (1 + 10^(−2)) = 100 ÷ 1.01 = 99.0%.",
      ],
    },
    {
      q: "Drug E is a weak base whose conjugate acid has an illustrative pKa of 8.5. What percentage is ionised at pH 2.0 and at pH 7.4?",
      answer: "Essentially 100% (99.99997%) at pH 2.0; 92.6% at pH 7.4.",
      working: [
        "For a base, % ionised = 100 ÷ (1 + 10^(pH − pKa)).",
        "pH 2.0: 100 ÷ (1 + 10^(2.0 − 8.5)) = 100 ÷ (1 + 3.2 × 10⁻⁷) ≈ 100%.",
        "pH 7.4: 100 ÷ (1 + 10^(7.4 − 8.5)) = 100 ÷ (1 + 10^(−1.1)) = 100 ÷ 1.0794 = 92.6%.",
      ],
    },
    {
      q: "A buffer contains 0.15 M of the salt (A⁻) and 0.05 M of the weak acid (HA), pKa 4.76. What is its pH?",
      answer: "pH 5.24.",
      working: [
        "pH = pKa + log₁₀([A⁻] ÷ [HA]) = 4.76 + log₁₀(0.15 ÷ 0.05).",
        "= 4.76 + log₁₀ 3 = 4.76 + 0.477 = 5.24.",
      ],
    },
    {
      q: "Make 0.050 M total of a buffer at pH 7.40 from a pair with an illustrative pKa of 7.20. What concentrations of the base form and acid form are needed?",
      answer: "Base form 0.0307 M; acid form 0.0193 M.",
      working: [
        "r = 10^(7.40 − 7.20) = 10^0.20 = 1.585.",
        "Base form = 0.050 × 1.585 ÷ 2.585 = 0.0307 M.",
        "Acid form = 0.050 ÷ 2.585 = 0.0193 M.",
      ],
    },
    {
      q: "Estimate the pH of a 0.10 M solution of a weak acid with pKa 3.0, and check the approximation.",
      answer: "pH ≈ 2.0 (exact 2.02); the approximation is borderline.",
      working: [
        "pH ≈ ½ × (3.0 − log₁₀ 0.10) = ½ × (3.0 + 1) = 2.0.",
        "Check: [H⁺] = 10^(−2.0) = 0.010 M, which is 10% of 0.10 M — above the ~5% limit.",
        "The exact quadratic gives pH 2.02, so the estimate is close but should be stated as approximate.",
      ],
    },
    {
      q: "A weak base drug has an illustrative pKa (of BH⁺) of 9.0. Predict the equilibrium ratio of total drug in urine at pH 5.0 to total drug in plasma at pH 7.4. What is its pKb?",
      answer: "About 245 : 1 in favour of acidic urine; pKb = 5.0.",
      working: [
        "For a base, total ∝ 1 + 10^(pKa − pH).",
        "Urine: 1 + 10^(9.0 − 5.0) = 1 + 10,000 = 10,001. Plasma: 1 + 10^(9.0 − 7.4) = 1 + 39.8 = 40.8.",
        "Ratio = 10,001 ÷ 40.8 = 245.",
        "pKb = 14 − pKa = 14 − 9.0 = 5.0 (at 25 °C).",
      ],
    },
  ],
  limitations: [
    "The equations use concentrations in place of activities. At higher ionic strength the effective pKa shifts, so calculated buffer pH values should always be confirmed with a calibrated pH meter.",
    "pKa values change with temperature and solvent. pKa + pKb = 14 holds only in water at 25 °C.",
    "Drugs with more than one ionisable group, and zwitterions, need each pKa considered; the single-pKa equations here do not describe them fully.",
    "The pH-partition hypothesis is a simplification. Absorption and excretion also depend on surface area, blood flow, dissolution, protein binding and transporters, and ionised drugs can cross membranes to some extent.",
    "Every pKa labelled illustrative is not a value for a real drug. Use a reliable source for real pKa values.",
  ],
  refs: ["martin8", "harris10", "iupacGoldBook"],
  relatedTools: [
    {
      slug: "ph-pka-relationship-calculator",
      name: "pH–pKa Calculator (Henderson–Hasselbalch)",
      why: "Solves pH = pKa + log₁₀([A⁻] ÷ [HA]) for pH, pKa or the ratio, and shows the % HA and % A⁻ — the same equation and percentages as this guide. Its 'relative buffer capacity' is the tool's own comparison scale (peaking at 57.6%), not an absolute capacity.",
    },
    {
      slug: "combined-pka-suite",
      name: "Combined pKa Suite",
      why: "Converts Ka ↔ pKa, gives % ionised for a weak acid at a chosen pH, and estimates pH = ½(pKa − log C) as in Examples 1, 2 and 5. For a base, enter the conjugate acid's pKa and read its A⁻ figure as the un-ionised free base, as the tool explains; check the ½(pKa − log C) result as this guide shows.",
    },
  ],
  relatedGuides: ["dilution-and-concentration", "pharmacokinetic-parameters", "stoichiometry-and-percentage-yield"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
