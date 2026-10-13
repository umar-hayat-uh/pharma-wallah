# Brief: Isotonicity and Tonicity Adjustment: Sodium Chloride Equivalents and Freezing-Point Depression

- **Slug:** isotonicity-and-tonicity-adjustment
- **Draft:** `src/lib/guides/content/isotonicity-and-tonicity-adjustment.ts` (review status: draft)
- **Target keyword:** sodium chloride equivalent isotonicity calculation

## Purpose
Teach Pharm-D students to make eye drops, nasal drops and small-volume injections iso-osmotic with body fluids, using the sodium chloride equivalent (E-value) method, the freezing-point depression method and the White–Vincent method, and to calculate ideal osmolarity. It also teaches the correct mM → % w/v conversion (with molar mass), because the site's Isotonicity Calculator gets that conversion wrong; students are sent only to the calculator's % w/v / mg/mL input.

## Outline
- Intro (why 0.9% NaCl, −0.52 °C; illustrative values only)
- H2 Why tonicity matters, and what 0.9% means
  - callout: iso-osmotic is not always isotonic
  - formula: ΔTf = Kf × i × m (Liso form)
- H2 The sodium chloride equivalent method
  - ordered steps; formula NaCl to add = 0.009V − Σ(w × E)
  - Example 1: drug + preservative eye drop; substitute adjusting agent
- H2 The freezing-point depression method
  - formula (0.52 − a) ÷ b; Example 2; table comparing the three methods
- H2 Getting concentrations into % w/v, and estimating E
  - formula % w/v = mM × M ÷ 10,000; caution about the calculator's mM path
  - formula E ≈ 17 Liso ÷ M; Liso table; Example 3
- H2 The White–Vincent method — formula V = w × E × 111.1; Example 4
- H2 Osmolarity — formula; Example 5 (0.9% NaCl, 5% glucose)
- Mistakes, practice (8), limitations, references, related tools

## Practice questions (with answers)
1. 60 mL, Drug E 1.5% w/v, E 0.22 → NaCl to add **0.342 g** (0.54 − 0.198).
2. Unadjusted solution freezes at −0.12 °C, b = 0.58, 50 mL → **0.345 g** NaCl (0.690% w/v).
3. 15 mM Drug F, M 342.3 g/mol → **0.513% w/v**.
4. E of a 1:1 salt, M 300, Liso 3.4 → **E ≈ 0.193**.
5. Ideal osmolarity of 0.45% NaCl → **154 mOsm/L**, hypotonic.
6. White–Vincent, 0.5 g Drug H, E 0.18 → **≈ 10.0 mL** water.
7. 0.25 g NaCl equivalent still needed, Agent Y E 0.50 → **0.5 g** Agent Y.
8. 2% Drug J, E 0.12, nothing else → 0.24% NaCl eq., **hypotonic; add 0.66 g/100 mL**.

## Linked calculators
- `isotonicity-calculator` — computes % NaCl to add = 0.9 − Σ(% × E), freezing point and osmolality by scaling from 0.9%. Safe only via % w/v or mg/mL input (mg/mL ÷ 10 is correct). **Its mM input multiplies by 0.001 regardless of molar mass (recorded fault)**; the guide says so explicitly.

## Required textbook sources (from `src/lib/content/references.ts`)
- `martin8` — Sinko PJ, editor. Martin's Physical Pharmacy and Pharmaceutical Sciences. 8th ed. Philadelphia: Wolters Kluwer; 2023. (colligative properties, Liso, E-values, freezing-point method)
- `ansel16` — Stockton SJ. Stoklosa and Ansel's Pharmaceutical Calculations. 16th ed. Philadelphia: Wolters Kluwer; 2021. (NaCl equivalent and White–Vincent calculations)
- `uspOsmolality` — United States Pharmacopeia–National Formulary. General Chapter <785> Osmolality and Osmolarity. Rockville (MD): USP. (osmolarity/osmolality)
- `bipmSI` — Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019. (mole, unit conversion)

## Sources a reviewer must supply
- A tabulated source of real E-values and ΔTf (1%) values if the reviewer wants any real substance named (the draft uses only illustrative values plus NaCl).
- Confirmation of the Liso table values against the cited Martin edition (draft values: 1.9, 2.0, 3.4, 4.3, 4.8).

## Reviewer checks
- Constants used: ΔTf blood/tears 0.52 °C; ΔTf of 1% NaCl 0.58 °C; Kf water 1.86 °C·kg/mol; 111.1 = 100/0.9; E = 17 Liso/M.
