# Brief: Anion Gap, Osmolar Gap and Corrected Electrolytes

- **Slug:** anion-gap-and-electrolyte-calculations
- **Draft:** `src/lib/guides/content/anion-gap-and-electrolyte-calculations.ts` (status: draft)
- **Target keyword:** anion gap and osmolar gap calculation
- **Category:** Clinical Pharmacy

## Purpose

Teach the arithmetic and meaning of the derived electrolyte figures a clinical-pharmacy student meets in case discussions — anion gap (with albumin correction), albumin-corrected calcium, glucose-corrected sodium (both 0.016 and 0.024), calculated osmolality and the osmolar gap — with the unit conversions that cause most errors. Educational interpretation only: no diagnosis or treatment advice, and every result is read against the reporting laboratory's own interval.

## Outline

- The anion gap
  - Electroneutrality; AG with and without K⁺; albumin correction; two worked examples
- Albumin-corrected calcium
  - mg/dL form, SI form; worked in both units; caution vs ionised calcium
- Glucose-corrected sodium
  - 0.016 (Katz) and 0.024 (Hillier); worked with both
- Calculated osmolality and the osmolar gap
  - Formula (conventional and SI); conversion-factor table; normal-gap and ethanol examples
- Reading the results responsibly
  - Error propagation, analyser-dependent intervals, formula variants, no diagnosis

## Practice questions (with answers)

1. Na 136, Cl 100, HCO₃ 26 → **AG 10 mmol/L**
2. Na 138, Cl 112, HCO₃ 16, albumin 3.0 g/dL → **AG 10; corrected 12.5 mmol/L**
3. Ca 8.0 mg/dL, albumin 3.0 g/dL → **8.8 mg/dL**
4. Ca 2.05 mmol/L, albumin 30 g/L → **2.25 mmol/L (9.02 mg/dL)**
5. Na 132, glucose 400 mg/dL → **136.8 (0.016); 139.2 (0.024) mmol/L**
6. Na 138, glucose 95, BUN 12 mg/dL, measured 340 → **calculated 285.6; gap 54.4 mOsm/kg**
7. SI: Na 142, glucose 5.0, urea 6.0 mmol/L, measured 301 → **calculated 295; gap 6**
8. Ethanol 230 mg/dL → **adds 50 mOsm/kg**

## Linked calculators

- `anion-gap-calculator` — Na − (Cl + HCO₃), optional + 2.5 × (4 − albumin); maths checked. Its fixed 6/12 interpretation bands are flagged in the guide's link text.
- `corrected-calcium-calculator` — Ca + 0.8 × (4 − albumin), converts mmol/L (÷ 0.2495) and g/L (÷ 10) first; maths checked.
- `sodium-correction-calculator` — Na + 0.016 × (glucose − 100), mmol/L × 18; maths checked; it has no 0.024 option (stated in link text).
- `osmolar-gap-calculator` — 2Na + glucose/18 + BUN/2.8 (+ ethanol/4.6), gap = measured − calculated; maths checked; tracker records no faults.
- **Rejected:** `osmolality-calculators` and `osmolarity-calculators` — recorded serious fault: the serum osmolar gap is always 0, the "Advanced" mode ignores ethanol, and TPN factors are 10× high.

## Required sources (from `src/lib/content/references.ts`)

- `uspOsmolality` — United States Pharmacopeia–National Formulary. General Chapter <785> Osmolality and Osmolarity. Rockville (MD): USP. (Definitions of osmolality vs osmolarity.)
- `bipmSI` — Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019. (Unit conversion.)

## Sources a reviewer must supply

- A clinical chemistry textbook covering the anion gap, its albumin correction, calculated osmolality and the osmolar gap. **None is in the registry** — this is the main gap before publication.
- The original paper for the 0.016 sodium-correction factor (Katz) and the paper proposing 0.024 (Hillier and colleagues); the draft names both authors as the calculator page does, without year or journal.
- The original source of the 0.8 mg/dL calcium correction and of the 2.5 per g/dL albumin correction of the anion gap.
- A source for the ethanol divisor (4.6, and the alternative empirical 3.7 some laboratories use).
