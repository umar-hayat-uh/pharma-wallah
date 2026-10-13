# Brief: Partition Coefficient, log P, log D and the Effect of Ionisation

- **Slug:** partition-coefficient-and-ionisation
- **Draft:** `src/lib/guides/content/partition-coefficient-and-ionisation.ts` (review status: draft)
- **Target keyword:** partition coefficient log p log d calculation

## Purpose
Explain P versus D, calculate both from shake-flask data (including by mass balance), apply Henderson–Hasselbalch to find un-ionised fractions, compute log D from log P and pKa for acids and bases (and back), use D in solvent extraction, and put the pH-partition hypothesis in context with its limits.

## Outline
- Intro (membranes, octanol, ionisation)
- H2 Partition coefficient and log P — formula; mass-balance formula; Example 1
- H2 Ionisation: Henderson–Hasselbalch — formulas (acid, base, fu); Example 2
- H2 From log P to log D at any pH — formulas; table (weak acid at 5 pH values); Example 3 (weak base at 7.4)
- H2 Using D in extraction — formula; Example 4
- H2 What log D means for absorption — caution callout
- Mistakes, practice (8), limitations, references, related tools

## Practice questions (with answers)
1. Caq 0.080, Corg 0.96 mg/mL → P **12**, log P **1.08**.
2. log P 2.5 → P **316**.
3. 20 mg in 100 mL buffer + 25 mL octanol, buffer after 0.050 mg/mL → D **12**.
4. Acid pKa 4.0, log P 3.0, pH 6.0 → **0.99%** un-ionised, log D **1.00**.
5. Base pKa 8.0, log P 2.0, pH 6.0 → **0.99%** un-ionised, log D **≈ 0.00**.
6. Base pKa 8.0, 90% un-ionised → pH **8.95**.
7. D 9, 50 mL water: 1 × 30 mL → **84.4%**; 3 × 10 mL → **95.4%** extracted.
8. Acid pKa 5.4, log D 0.5 at pH 7.4 → log P **2.50**.

## Linked calculators
- `partition-coefficient-calculator` — D = C(org)/C(aq), log D = log₁₀ D, per-pH averages; matches. Safe.
- `ph-pka-relationship-calculator` — pH = pKa + log₁₀(base/acid), fractions 1/(1+r) and r/(1+r); matches. Its "relative buffer capacity %" (recorded oddity: peaks at 57.6%) is not used by the guide.

## Rejected
- `solubility-calculator` — excluded by instruction (recorded unit-label faults).

## Required textbook sources (from `src/lib/content/references.ts`)
- `martin8` — Sinko PJ, editor. Martin's Physical Pharmacy and Pharmaceutical Sciences. 8th ed. Philadelphia: Wolters Kluwer; 2023. (partition, ionisation, Henderson–Hasselbalch)
- `aulton6` — Aulton ME, Taylor KMG, editors. Aulton's Pharmaceutics: The Design and Manufacture of Medicines. 6th ed. Edinburgh: Elsevier; 2022. (pH-partition hypothesis, absorption)

## Sources a reviewer must supply
- A standard shake-flask method for partition coefficients (e.g. the OECD test guideline for n-octanol/water partition coefficient) — not in the registry.
- A physicochemical/ADME text treating log D for multiprotic and zwitterionic drugs, if the reviewer wants that limitation supported.
- An analytical-chemistry source for the repeated-extraction formula, if Martin/Aulton are not judged sufficient (harris10 may cover it — reviewer to confirm before adding).
