import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Isotonicity Calculator. Worked example traced through
 * the `result` memo in page.tsx (Σ(C × E) over rows in % w/v, NaCl to add =
 * 0.9 − Σ, printed with fixed(…, 3); Σ with fixed(…, 2)) and recomputed in
 * Python: Σ = 0.3216, NaCl to add 0.578 g per 100 mL. Concentrations are entered
 * in % w/v, not mM — the mM conversion is approximate (see the page's caution).
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "adjusting a phenylephrine eye drop to isotonicity",
    scenario:
      "A compounding exercise gives 15 mL of eye drops containing phenylephrine hydrochloride 1% w/v and benzalkonium chloride 0.01% w/v as preservative. How much sodium chloride makes the drops isotonic? (Illustrative formulation for a calculation exercise — not a prescribing recommendation.)",
    given: [
      { label: "Phenylephrine HCl", value: "1 % w/v, E = 0.32" },
      { label: "Benzalkonium chloride", value: "0.01 % w/v, E = 0.16" },
      { label: "Sodium Chloride row", value: "0 % w/v, E = 1.00" },
      { label: "Batch volume", value: "15 mL" },
    ],
    steps: [
      { label: "NaCl equivalent of each ingredient (C × E)", working: "Phenylephrine HCl: 1 × 0.32 = 0.32\nBenzalkonium chloride: 0.01 × 0.16 = 0.0016" },
      { label: "Total NaCl equivalent", working: "Σ(C × E) = 0.32 + 0.0016 = 0.3216 % (shown as 0.32%) → HYPOTONIC" },
      { label: "NaCl still needed per 100 mL", working: "0.9 − 0.3216 = 0.5784 → 0.578 g per 100 mL" },
      { label: "Scale to the 15 mL batch (by hand)", working: "0.578 g × 15 mL ÷ 100 mL = 0.0867 g ≈ 86.7 mg" },
      { label: "Check in the calculator", working: "Enter 0.578 in the Sodium Chloride row: Σ = 0.3216 + 0.578 = 0.8996 % → 0.90%, ISOTONIC" },
    ],
    answer: "Add 0.578 g of sodium chloride per 100 mL — about 86.7 mg for the 15 mL batch.",
    interpretation:
      "Before the adjustment the calculator shows NaCl equivalent 0.32%, HYPOTONIC, freezing point −0.19 °C and an estimated 104 mOsm/kg; the 'NaCl to add' card reads 0.578 g per 100 mL. The calculator works per 100 mL, so scaling to the batch volume is your step. Whether a real product is acceptable is decided by measured osmolality, not by this estimate.",
  },
  mistakes: [
    "Forgetting to scale: the result is grams of NaCl per 100 mL, so a 15 mL or 30 mL batch needs proportionally less.",
    "Leaving out minor ingredients. Preservatives, buffers and other salts all contribute to tonicity; boric acid at 1.9% alone is roughly isotonic.",
    "Entering mg/mL as if it were % w/v. 10 mg/mL is 1% w/v — the unit selector converts, but typing the mg/mL number into a % row makes it ten times too large.",
    "Using an E-value for the wrong salt or hydrate, or one listed for a very different concentration. E-values change slightly with concentration; pick the tabulated value closest to yours.",
    "Adding sodium chloride when the drug is incompatible with it (some silver and other salts precipitate with chloride). Use another tonicity agent at the equivalent strength — dextrose, for example, at NaCl to add ÷ 0.18.",
  ],
  limitations: [
    "The sodium chloride equivalent method assumes the osmotic contributions of the ingredients simply add, and that 0.9% w/v NaCl is the isotonic reference. It is an approximation; measured freezing point or osmolality is the real test.",
    "The freezing point and osmolality shown are scaled from the NaCl equivalent (0.9% ≈ −0.52 °C ≈ 290 mOsm/kg), not calculated from first principles.",
    "Isotonic is not the same as iso-osmotic: a solute that crosses cell membranes freely (boric acid for red cells, for example) can be iso-osmotic yet not isotonic.",
    "The mM entry option uses a very rough fixed factor; enter concentrations in % w/v or mg/mL wherever you can.",
  ],
  refs: ["ansel16", "martin8", "uspOsmolality"],
  related: [
    { slug: "percentage-solution-calculator", name: "Percentage Solution Calculator (w/v, w/w, v/v)", why: "Work out the weights of each ingredient for the batch from their % w/v." },
    { slug: "dilution-calculator", name: "Dilution Calculator (C₁V₁ = C₂V₂)", why: "Prepare the drug from a concentrated stock before adjusting tonicity." },
  ],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
