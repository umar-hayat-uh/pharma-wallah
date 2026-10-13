# Content brief — Bioavailability and Bioequivalence: AUC, Cmax and the Ratio of Geometric Means

- **Slug:** `bioavailability-and-bioequivalence`
- **Draft:** `src/lib/guides/content/bioavailability-and-bioequivalence.ts` (status: draft, 2026-10-13)
- **Target keyword:** bioequivalence 90% confidence interval geometric mean ratio

## Purpose

Students can usually compute F but struggle with why bioequivalence uses logs, geometric means and a 90% confidence interval. This guide goes from absolute/relative bioavailability (dose-normalised) to rate vs extent (AUC, Cmax, tmax), then to the log transformation, the GMR and its 90% CI with a 12-subject illustrative crossover data set, and how to read an interval against an acceptance range. Regulatory limits are described only as **commonly used** in regulatory guidance, not as rules, and the analysis is labelled a simplified paired calculation (real studies use ANOVA with sequence/period/subject effects).

## Outline

- H2 Absolute and relative bioavailability — formulas; example (unequal doses)
- H2 Rate and extent: AUC, Cmax and tmax — example (one subject); Cmax-is-not-pure-rate callout
- H2 Why bioequivalence uses logs and geometric means — arithmetic vs geometric example; 80/125 symmetry
- H2 The GMR and its 90% CI — formula; 12-subject table; worked example
- H2 Interpreting the interval — "commonly used" acceptance range; table of example intervals
- Common mistakes · Practice (8) · Limitations · References · Related tools

## Practice questions (answers verified in Python)

1. IV 20 mg AUC 4.0; oral 40 mg AUC 6.0 → **F = 0.75**
2. Test 100 mg AUC 30; ref 100 mg AUC 32 → **93.75%**
3. Ratios 1.25 and 0.80 → **arithmetic 1.025, geometric 1.00**
4. d̄ = 0.05 → **GMR 105.1%**
5. d̄ −0.04, SE 0.03, t 1.812 → **GMR 96.1%, CI 91.0–101.4%**
6. ln 0.80 / ln 1.25 → **−0.2231 / +0.2231**
7. CIs 88–118% vs 95–130% against 80–125% → **(a) meets, (b) does not**
8. Test 50 mg AUC 22; ref 50 mg solution AUC 20 → **110%**

## Linked calculators

- `bioavailability-calculator` — AUC mode computes F = (AUCₜ/Dₜ)/(AUCᵣ/Dᵣ) × 100, matching the guide. The link text tells students to use the AUC mode (the dose-estimate mode uses a fixed "typical F" per route).
- **Rejected:** `bioequivalence-calculator` — ignores alpha and uses arithmetic ratios, the very error this guide teaches against.

## Required sources (registry ids)

- `shargel8` — Ducharme MP, Shargel L, editors. Shargel and Yu's Applied Biopharmaceutics & Pharmacokinetics. 8th ed. New York: McGraw Hill; 2022.
- `rowland5` — Rowland and Tozer's Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications. 5th ed. Philadelphia: Wolters Kluwer; 2019.
- `gibaldi` — Gibaldi M, Perrier D. Pharmacokinetics. 2nd ed. New York: Marcel Dekker; 1982.

## Sources a reviewer must supply

- A **regulatory bioequivalence guideline** for the acceptance range and the 90% CI / two one-sided tests approach — e.g. the current FDA, EMA, WHO or DRAP (Pakistan) bioequivalence guidance. None is in the registry; edition/date must be taken from the issuing body's own site.
- A **statistics source for the two one-sided tests procedure** (Schuirmann), if the reviewer wants the method cited directly.
- t-quantiles used: t₀.₉₅,₁₁ = 1.796 and t₀.₉₅,₁₀ = 1.812 (standard t-table values; scipy was not available, values taken from the standard table and consistent with it).
