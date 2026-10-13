# Content brief: Electrolyte Units: Converting mg, mmol, mEq and mOsmol

- **Slug:** `electrolyte-units-mmol-meq-mosmol`
- **Draft file:** `src/lib/guides/content/electrolyte-units-mmol-meq-mosmol.ts` (meta.review.status = "draft"; not listed, not in the sitemap)
- **Target keyword:** how to convert mg to mEq and mmol
- **Status:** Draft written 2026-10-13. Needs author and reviewer details, and the sources below, before publication.

## Purpose

Give students one reliable method for moving between mg (of a salt or an ion), mmol, mEq and mOsmol, using the molar mass of the exact salt weighed (including hydrates), the ion's valence and the number of particles per formula unit; and for converting laboratory results between mg/dL, mmol/L and mEq/L. It flags the two traps: ideal versus measured osmolarity, and phosphate, whose pH-dependent charge makes mEq ambiguous (the fault recorded against the electrolyte calculator's phosphate option).

## Outline

- Introduction
- Key terms
- H2: From milligrams to millimoles
  - H3: Example 1: Potassium chloride concentrate
- H2: From millimoles to milliequivalents
  - H3: Example 2: Calcium chloride dihydrate
- H2: Milliosmoles and ideal osmolarity
  - H3: Example 3: Sodium chloride 0.9% w/v
  - H3: Example 4: Particles from a divalent salt
- H2: Laboratory results: mg/dL, mmol/L and mEq/L
  - H3: Example 5: Serum magnesium
- H2: Common mistakes
- H2: Practice questions
- H2: Limitations
- H2: References

## Practice questions (with answers)

1. **Q:** How many millimoles of sodium are in 500 mg of sodium chloride?
   **A:** 8.56 mmol of Na⁺ (8.56 mEq).
   Working: mmol NaCl = 500 ÷ 58.44 = 8.556 mmol. One Na⁺ per NaCl: 8.556 mmol Na⁺, which is also 8.556 mEq because Na⁺ is monovalent.

2. **Q:** Sodium bicarbonate 8.4% w/v: how many mmol of bicarbonate are in 50 mL, and per mL?
   **A:** About 50 mmol (50 mEq) in 50 mL; about 1.0 mmol/mL.
   Working: 8.4% w/v = 84 mg/mL; in 50 mL: 84 × 50 = 4200 mg. mmol = 4200 ÷ 84.01 = 49.995, about 50 mmol HCO₃⁻. Per mL: 84 ÷ 84.01 = 0.9999, about 1.0 mmol/mL (= 1.0 mEq/mL).

3. **Q:** A serum calcium is 2.3 mmol/L. What is it in mg/dL and in mEq/L?
   **A:** 9.22 mg/dL; 4.6 mEq/L.
   Working: mg/L = 2.3 × 40.08 = 92.18 mg/L; ÷ 10 = 9.218 mg/dL. mEq/L = 2.3 × 2 = 4.6 mEq/L.

4. **Q:** Magnesium sulfate heptahydrate 50% w/v: how many mmol and mEq of Mg²⁺ are in 2 mL?
   **A:** 4.06 mmol = 8.11 mEq of Mg²⁺.
   Working: 50% w/v = 500 mg/mL; 2 mL = 1000 mg of MgSO₄·7H₂O. mmol = 1000 ÷ 246.48 = 4.057 mmol of Mg²⁺. mEq = 4.057 × 2 = 8.114 mEq.

5. **Q:** An amount of 40 mEq of potassium is to be supplied as potassium chloride. What mass of K⁺ is that, and what mass of KCl?
   **A:** 1564 mg of K⁺, supplied by about 2.98 g of KCl.
   Working: K⁺ is monovalent, so 40 mEq = 40 mmol. Mass of K⁺ = 40 × 39.10 = 1564 mg. Mass of KCl = 40 × 74.55 = 2982 mg ≈ 2.98 g.

6. **Q:** What is the ideal osmolarity of a 5% w/v solution of anhydrous glucose (180.16 g/mol)?
   **A:** About 278 mOsmol/L.
   Working: 5% w/v = 50 g/L = 50,000 mg/L. mmol/L = 50,000 ÷ 180.16 = 277.5 mmol/L. Glucose does not ionise (1 particle), so ideal osmolarity ≈ 277.5 mOsmol/L.

7. **Q:** Calcium gluconate 10% w/v is made from calcium gluconate monohydrate (448.39 g/mol). How many mmol and mEq of Ca²⁺ are in 10 mL?
   **A:** 2.23 mmol = 4.46 mEq of Ca²⁺ (0.446 mEq/mL).
   Working: 10% w/v = 100 mg/mL; 10 mL = 1000 mg. mmol = 1000 ÷ 448.39 = 2.230 mmol of Ca²⁺ (one Ca²⁺ per formula unit). mEq = 2.230 × 2 = 4.460 mEq; per mL, 4.460 ÷ 10 = 0.446 mEq/mL.

8. **Q:** A serum sodium is 140 mEq/L. What mass of sodium is that per litre?
   **A:** 3219 mg/L (about 3.22 g/L) of sodium.
   Working: Na⁺ is monovalent: 140 mEq/L = 140 mmol/L. Mass = 140 × 22.99 = 3218.6 mg/L ≈ 3.22 g/L.

## Linked calculators

- `electrolyte-conversion-calculator` (mmol ↔ mEq ↔ mg Calculator) — Converts between mg, mmol and mEq of the ion itself (not the salt) for Na⁺, K⁺, Ca²⁺, Mg²⁺, Cl⁻ and HCO₃⁻, as in the mEq section. Do not use its phosphate option, which assumes a valence of 3.
- `mg-ml-to-molarity-calculator` (mg/mL ↔ Molarity Calculator) — Divides mg/mL by the molar mass to give mol/L and mmol/L — the salt-to-millimole step in Examples 1 and 3, when you enter the molar mass of the salt weighed.

## Required sources (from src/lib/content/references.ts)

- `ansel16` — Stockton SJ. Stoklosa and Ansel's Pharmaceutical Calculations. 16th ed. Philadelphia: Wolters Kluwer; 2021.
- `uspOsmolality` — United States Pharmacopeia–National Formulary. General Chapter <785> Osmolality and Osmolarity. Rockville (MD): USP.
- `iupacGoldBook` — International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book').
- `bipmSI` — Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019.

Each textbook above is cited for a topic the reviewer should confirm against the edition named (chapter not checked by us; no page numbers given).

## Sources a reviewer must supply

- None strictly required: `ansel16` covers milliequivalents, millimoles and milliosmoles, and `uspOsmolality` covers osmolarity and osmolality. A reviewer may wish to confirm the calcium gluconate monohydrate formula (C₁₂H₂₂CaO₁₄·H₂O, 448.39 g/mol computed) against the product monograph used in teaching.
- The atomic masses used (Na 22.99, K 39.10, Cl 35.45, Ca 40.08, Mg 24.31, S 32.06, O 16.00, H 1.008, C 12.01) are standard rounded values; the source note in the draft lists them. An IUPAC atomic-weights table is not in the registry if the reviewer wants one cited.

## Calculators deliberately not linked

- `osmolarity-calculators` — recorded fault: TPN factors per-% on g/L inputs (10× high).
- `ppm-ppb-calculator` — recorded fault: mg/L → M ignores molecular weight.
- `mass-conversion-calculator` — recorded fault: its "conversion factor" line is inverted ("1 mg = 1000 g"). Not linked rather than linked with a caveat, because the guide does not need it.
- `electrolyte-conversion-calculator` is linked with a caveat (its phosphate option uses PO₄³⁻, MW 94.97, valence 3). The other six ions were checked: mg = mmol × MW; mEq = mmol × valence.
- `mg-ml-to-molarity-calculator` is linked: M = (mg/mL) ÷ molar mass, mM = M × 1000 (checked in code).

## Verification note

Every number in the draft's examples, tables and practice answers was computed with python3 on 2026-10-13. Values are illustrative and are not product limits, validated processes or dosing advice.
