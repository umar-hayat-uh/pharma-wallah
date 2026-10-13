# Brief: Dissolution Testing and Drug Release: % Release, Volume Correction and Release Kinetics

- **Slug:** dissolution-testing-and-drug-release
- **Draft:** `src/lib/guides/content/dissolution-testing-and-drug-release.ts` (review status: draft)
- **Target keyword:** dissolution test percentage drug release calculation

## Purpose
Take a student from a UV absorbance to % of label claim released, correct cumulative release for withdrawn samples (standard method and the practical-sheet form, with their difference shown), fit zero-order/first-order/Higuchi models, compare two profiles with f2, and estimate a Noyes–Whitney rate constant correctly.

## Outline
- Intro (what dissolution measures; three stages of arithmetic; illustrative only)
- H2 From absorbance to % released — formula; Example 1
- H2 Correcting for drug removed in earlier samples
  - standard formula; practical-sheet form; Example 2; results table; callout (no replacement)
- H2 Release kinetics — model table; first-order time formula; Example 3 (R², intercepts); Korsmeyer–Peppas note
- H2 Comparing two profiles: f2 — formula; Example 4
- H2 Noyes–Whitney — formula; Example 5
- Mistakes, practice (8), limitations, references, related tools

## Practice questions (with answers)
1. A 0.360, a 0.0040, b 0.0300 (µg/mL), DF 5, 900 mL, label 200 mg → **26.7%**.
2. Standard correction, C 0.050/0.090/0.120 mg/mL, Vs 10, V 900, label 120 mg → **109.4 mg, 91.2%**.
3. Same, practical-sheet form → **108.9 mg (90.75%)**, 0.49 mg lower.
4. Zero order 12% at 30 min, 36% at 90 → k₀ **0.4%/min**, intercept 0, 80% at **200 min**.
5. First order, 50% at 20 min → k₁ **0.0347 min⁻¹**, t₉₀ **66.4 min**.
6. Higuchi 20% at 16 min → kH **5%/min^½**, **40%** at 64 min.
7. f2 identical → **100**; 10% difference at every point → **49.9**.
8. Cs 1.5, C 0.20 (5 min) → 0.38 (10 min) → k **0.0298 min⁻¹**.

## Linked calculators
- `cumulative-drug-release-calculator` — Method B = Cₙ·V + Σ(Cᵢ·Vsᵢ), exactly the standard correction; Method A = practical-sheet form. Safe.
- `dissolution-calculator` — C = (Ā − a)/b × DF, amount = C·V, % = amount/label × 100: matches. Its only correction is the practical-sheet form Ccorr,ₙ = Cₙ + (Vs/V)·Ccorr,ₙ₋₁, which equals the standard correction at sample 2 and **under-corrects from sample 3 on** (it weights older samples by (Vs/V)^k). Linked with that stated; parent may prefer to unlink. Not previously recorded as a fault.

## Rejected
- `dissolution-rate-constant-calculator` — its headline result "Average k (midpoint method)" is midpoint concentration ÷ (Cs − C), a dimensionless ratio, not a Noyes–Whitney rate constant (k = (dC/dt)/(Cs − C)). Its dC/dt column uses the row's own C, not the mid-interval C. Teaching Noyes–Whitney and linking it would contradict the guide.

## Required textbook sources (from `src/lib/content/references.ts`)
- `martin8` — Sinko PJ, editor. Martin's Physical Pharmacy and Pharmaceutical Sciences. 8th ed. Philadelphia: Wolters Kluwer; 2023. (dissolution, Noyes–Whitney, release kinetics)
- `aulton6` — Aulton ME, Taylor KMG, editors. Aulton's Pharmaceutics: The Design and Manufacture of Medicines. 6th ed. Edinburgh: Elsevier; 2022. (dissolution testing)
- `uspDissolution` — United States Pharmacopeia–National Formulary. General Chapter <711> Dissolution. Rockville (MD): USP.
- `fdaDissolution1997` — U.S. Food and Drug Administration. Guidance for Industry: Dissolution Testing of Immediate Release Solid Oral Dosage Forms. Rockville (MD): FDA; August 1997. (f2 ≥ 50 similarity)
- `mooreFlanner1996` — Moore JW, Flanner HH. Mathematical comparison of dissolution profiles. Pharm Technol. 1996;20(6):64–74.
- `harris10` — Harris DC, Lucy CA. Quantitative Chemical Analysis. 10th ed. New York: W. H. Freeman (Macmillan Learning); 2019. (calibration line, least squares)

## Sources a reviewer must supply
- Higuchi's original matrix-release paper (Higuchi model).
- Korsmeyer, Peppas et al. original papers (power-law model and the meaning of n).
- Noyes and Whitney's original paper, if attribution to origin is wanted (Martin covers the equation).
