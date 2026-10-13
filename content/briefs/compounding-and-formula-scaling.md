# Brief: Compounding Calculations: Scaling a Master Formula and Percentage Strength

- **Slug:** compounding-and-formula-scaling
- **Draft:** `src/lib/guides/content/compounding-and-formula-scaling.ts` (review status: draft)
- **Target keyword:** how to reduce or enlarge a master formula pharmacy

## Purpose
Teach the scaling factor and its correct use on every kind of formula entry (fixed amounts, percentages, q.s., parts, dose units), percentage and ratio strength converted to amounts, the aliquot method for amounts below a balance's minimum weighable quantity, and the checks that catch a wrongly scaled formula.

## Outline
- Intro (master formula; batch size rarely matches)
- H2 The scaling factor — formula; Example 1 (oral solution 1000 → 150 mL)
- H2 Ingredients you must not multiply: q.s. and percentages — table; note on the calculator
- H2 Formulas written in parts — formula; Example 2
- H2 Percentage and ratio strength — formulas; Example 3 (w/v, w/w, v/v); Example 4 (1:5000)
- H2 Scaling formulas for tablets, capsules and suppositories — Example 5
- H2 The aliquot method — steps; Example 6
- Mistakes, practice (8), limitations, references, related tools

## Practice questions (with answers)
1. 500 mL → 75 mL: factor **0.15**.
2. 2 kg master with 150 g Ingredient P, make 30 g → **2.25 g**.
3. 1 : 4 : 15 parts, make 100 g → **5 g, 20 g, 75 g**.
4. 30 mL of 0.1% w/v → **0.03 g (30 mg)**.
5. 1:2000 w/v → **0.05%**; in 500 mL **0.25 g**.
6. 12 g per 1000 mL; volume containing 60 mg → **5 mL**.
7. 1.5 L master, 45 g Ingredient S, make 250 mL → **7.5 g**.
8. Drug G 2%, preservative 0.1%, vehicle q.s. 100 mL → for 40 mL: **0.8 g, 0.04 g, q.s. to 40 mL**.

## Linked calculators
- `master-formula-calculator` — factor = desired ÷ master (after L/mL, kg/g conversion), fixed amounts multiplied, % and q.s. carried unchanged; matches. It does not convert % to grams, which the guide states.

## Rejected
- `percentage-solution-calculator` — excluded by instruction (recorded unit-conversion faults).

## Required textbook sources (from `src/lib/content/references.ts`)
- `ansel16` — Stockton SJ. Stoklosa and Ansel's Pharmaceutical Calculations. 16th ed. Philadelphia: Wolters Kluwer; 2021. (reducing/enlarging formulas, percentage and ratio strength, aliquot method)
- `aulton6` — Aulton ME, Taylor KMG, editors. Aulton's Pharmaceutics: The Design and Manufacture of Medicines. 6th ed. Edinburgh: Elsevier; 2022. (pharmaceutical calculations in context)
- `bipmSI` — Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019. (unit conversion)

## Sources a reviewer must supply
- A pharmacopoeial or practice-standard source for minimum weighable quantity / balance accuracy, if the reviewer wants the aliquot section to cite a standard rather than the calculations text.
- A compounding standard (e.g. the pharmacopoeial non-sterile compounding chapter) if the guide is to say anything about overage or batch records beyond "follow the pharmacy's procedure".
