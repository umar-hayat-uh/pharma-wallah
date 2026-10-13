# Brief: Titrimetric Analysis — Normality, Equivalence Factors and % Purity

- **Slug:** titrimetric-analysis-and-assay
- **Draft:** `src/lib/guides/content/titrimetric-analysis-and-assay.ts` (status: draft)
- **Target keyword:** percentage purity titration calculation
- **Category:** Pharmaceutical Analysis

## Purpose

Build the % purity calculation of a titrimetric assay one piece at a time — equivalent weight and normality, standardisation factor f, the "each mL is equivalent to" factor from stoichiometry, then direct and back titration (with a blank) — so a student can do any assay in a Pharm-D practical without memorising a formula they do not understand. Acceptance limits are deliberately left to the monograph.

## Outline

- Equivalent weight, normality and molarity
  - Formulas; n-factor depends on the reaction; table of eight common reagents; H₂SO₄ example
- Standardising a titrant: the factor f
  - KHP standardisation of NaOH, worked
- The equivalence factor: "each mL is equivalent to …"
  - E = M × ratio × MW; monobasic acid example; effect of a 1 : 2 ratio
- % purity from a direct titration
  - % = V × f × E × 100 ÷ W; worked; unit-mismatch warning
- Back titration and the blank
  - % = (Vb − Vs) × f × E × 100 ÷ W; CaCO₃ worked; why the excess reagent's strength cancels; where limits come from

## Practice questions (with answers)

1. Equivalent weight of Na₂CO₃ (MW 105.99, n = 2)? **52.995 g/eq**
2. 2.650 g Na₂CO₃ in 500.0 mL → N? **0.1000 N**
3. 0.25 N H₃PO₄ (n = 3) → M? **0.0833 M**
4. 0.4084 g KHP needs 19.62 mL "0.1 M" NaOH → M and f? **0.1019 M; f = 1.0193**
5. Base MW 285.34, 1 : 1 with HCl → mg per mL of 0.1 M HCl? **28.53 mg**
6. 250.2 mg acid, 13.65 mL NaOH f 1.012, E 18.016 mg → **99.47%**
7. 185.0 mg CaCO₃, blank 49.80 mL, sample 12.35 mL NaOH f 0.985, E 5.0045 mg → **99.79%**
8. 3.161 g KMnO₄ in 1.000 L (n = 5) → **0.1000 N; 0.0200 M**

## Linked calculators

- `normality-calculator` — N = mass ÷ (Eq.W × V), Eq.W = MW ÷ n, and the reverse (amount for a target N); maths checked. Known minor UI issue (tracker): an invalid n or MW silently falls back to the last equivalent weight.
- **Not linked:** `percent-purity-calculator`. Its formula (V × N × E × D × 100 ÷ W) is the same shape as the guide's, but its example chips give impossible purities (42% and 776%) and it grades every result against a hard-coded 98–102% band, while the guide teaches that limits come from the monograph. Linking it with a "enter your own data" caveat would still put the fixed pass/fail band in front of students. Link it once the chips are corrected and the band is removed or made editable.

## Required sources (from `src/lib/content/references.ts`)

- `beckettStenlake1` — Beckett AH, Stenlake JB. Practical Pharmaceutical Chemistry, Part 1. 4th ed. London: Athlone Press; 1988.
- `harris10` — Harris DC, Lucy CA. Quantitative Chemical Analysis. 10th ed. New York: W. H. Freeman (Macmillan Learning); 2019.
- `iupacGoldBook` — International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book'). (Cited for amount concentration and IUPAC's preference for it over normality.)

## Sources a reviewer must supply

- The current pharmacopoeia text on volumetric solutions and their standardisation (to confirm how titrant strength is stated, M or N, in the pharmacopoeia the course follows).
- A reviewer should confirm the statement that IUPAC recommends amount concentration rather than normality against the Gold Book / Green Book entry.
