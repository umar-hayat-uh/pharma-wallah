# Content brief — pH, pKa and the Henderson–Hasselbalch Equation

- **Slug:** `ph-pka-and-henderson-hasselbalch`
- **Draft:** `src/lib/guides/content/ph-pka-and-henderson-hasselbalch.ts` (status: draft, 2026-10-13)
- **Target keyword:** henderson hasselbalch equation percent ionized

## Purpose

Ionisation of weak acids and bases is tested in pharmaceutical chemistry, physical pharmacy and pharmacology, and the classic errors are the inverted ratio, using pKb for a base, and forgetting which form of a base is charged. This guide goes from pH and pKa, through the Henderson–Hasselbalch equation written for acids and bases, to % ionised, buffer preparation, the weak-acid pH approximation with a validity check, and pH-partition/ion trapping. Drug pKa values are illustrative ("Drug A…").

## Outline

- H2 pH, Ka and pKa — formulas; Example 1 (Ka ↔ pKa)
- H2 The Henderson–Hasselbalch equation — acid and base forms; % ionised formulas; table (% ionised vs pH − pKa); Example 2 (acid, pKa 3.5 at pH 1.5 and 7.4); Example 3 (base, pKa 9.0 at pH 7.4)
- H2 Preparing a buffer — ratio and split formulas; Example 4 (0.10 M at pH 5.00, pKa 4.76)
- H2 The pH of a weak acid solution — ½(pKa − log C); Example 5 with exact-quadratic check
- H2 pH-partition and ion trapping — formulas; Example 6 (≈ 1000 : 1)
- Common mistakes (7) · Practice (8) · Limitations (5) · References · Related tools

## Practice questions (answers verified in Python)

1. [H⁺] 3.2 × 10⁻⁴ M; pH 8.3 → **pH 3.49; [H⁺] 5.0 × 10⁻⁹ M**
2. Ka 4.0 × 10⁻¹⁰ → **pKa 9.40; weaker than pKa 4.74**
3. Acid pKa 4.2 at pH 6.2 → **99.0% ionised**
4. Base pKa 8.5 at pH 2.0 and 7.4 → **≈ 100%; 92.6%**
5. 0.15 M A⁻ / 0.05 M HA, pKa 4.76 → **pH 5.24**
6. 0.050 M total, pH 7.40, pKa 7.20 → **base 0.0307 M; acid 0.0193 M**
7. 0.10 M acid, pKa 3.0 → **pH ≈ 2.0 (exact 2.02); approximation borderline (10% dissociated)**
8. Base pKa 9.0, urine pH 5.0 vs plasma 7.4 → **≈ 245 : 1 in urine; pKb 5.0**

## Linked calculators

- `ph-pka-relationship-calculator` — solves pH = pKa + log([A⁻]/[HA]) for pH, pKa or the ratio, and % HA/% A⁻ = 1/(1 + r), r/(1 + r): correct. Its "relative buffer capacity" (2.303·α·(1 − α)·100, peak 57.6%) is a non-standard scale; the page now says so and the link text repeats it.
- `combined-pka-suite` — Ka ↔ pKa and weak-acid % ionised are correct; ½(pKa − log C) is the standard approximation and the page states its dilute-solution failure and how to use it for bases. Known issues off the linked path: its acid-strength reference card puts acetic acid in "moderate acids, pKa 0–4" (acetic acid's pKa is ~4.8), and exactly 50% ionised reads "Protonated". The link text tells students to check the ½(pKa − log C) result as the guide does.

## Required sources (registry ids)

- `martin8` — Sinko PJ, editor. Martin's Physical Pharmacy and Pharmaceutical Sciences. 8th ed. Philadelphia: Wolters Kluwer; 2023. (Ionic equilibria, buffers, HH — registry `supports` line lists "solutions and concentration"; reviewer to confirm chapter.)
- `harris10` — Harris DC, Lucy CA. Quantitative Chemical Analysis. 10th ed. New York: W. H. Freeman (Macmillan Learning); 2019. (Acid–base equilibria, weak-acid pH, buffers.)
- `iupacGoldBook` — International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book'). (Definitions of pH, acid dissociation constant.)

## Sources a reviewer must supply

- A **pharmacology or biopharmaceutics source for the pH-partition hypothesis and ion trapping** in renal excretion — `shargel8` may cover it; reviewer to confirm before adding it to `refs`.
- No other gaps.
