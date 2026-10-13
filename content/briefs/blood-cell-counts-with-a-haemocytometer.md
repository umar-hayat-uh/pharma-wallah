# Brief: Blood Cell Counts with a Haemocytometer — RBC and WBC Calculations

- **Slug:** blood-cell-counts-with-a-haemocytometer
- **Draft:** `src/lib/guides/content/blood-cell-counts-with-a-haemocytometer.ts` (status: draft)
- **Target keyword:** wbc count calculation neubauer chamber
- **Category:** Physiology

## Purpose

Show a physiology-practical student that every haemocytometer "factor" is just dilution ÷ (squares × area × depth), so they can calculate WBC and RBC counts for any counting area, dilution or chamber depth, convert to SI units, and judge the counting error. No population reference interval is stated as fact; results are compared with the laboratory's own interval.

## Outline

- The principle: cells in a known volume
  - Count = N × D ÷ V; ruling table (large, medium, smallest squares)
- The total WBC count
  - Factor 50 derived; standard example; non-standard example (1:10, nine squares)
- The total RBC count
  - Factor 10 000 derived; example; 80 smallest = 5 medium
- Units: mm³, µL and SI
  - Conversion; table; comparing with the laboratory's reference interval
- Counting error and good technique
  - 1 ÷ √N; boundary rule; filling and settling

## Practice questions (with answers)

1. 96 cells, 4 large squares, 1:20 → **4800 /mm³**
2. 415 cells, 5 medium squares, 1:200 → **4 150 000 /mm³ = 4.15 × 10¹²/L**
3. 300 cells, 5 medium squares, 1:100 → **1 500 000 /mm³** (factor 5000)
4. Derive the WBC factor → **20 ÷ 0.4 mm³ = 50**
5. 64 cells, 4 large squares, 1:10 → **1600 /mm³ = 1.6 × 10⁹/L**
6. Error for 400 cells; cells needed for 5% → **5%; 400**
7. 180 cells, 4 large, 1:20, chamber 0.2 mm but calculated at 0.1 mm → **reported 9000; correct 4500 /mm³**
8. 5600 /µL WBC and 4 250 000 /µL RBC in SI → **5.6 × 10⁹/L; 4.25 × 10¹²/L**

## Linked calculators

- `wbc-count-calculator` and `rbc-count-calculator` — both use `src/components/calculators/hemocytometer.ts`: count = N × dilution ÷ (squares × area × depth), area per square 1 / 0.04 / 0.0025 mm², depth 0.1 mm default, Poisson ±1/√N, SI conversion (×10⁹/L WBC, ×10¹²/L RBC). Maths checked; every guide example reproduces with it. They assert no normal range — the student may enter their laboratory's interval — which matches the guide's rule.

## Required sources (from `src/lib/content/references.ts`)

- `bipmSI` — Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019. (Unit conversion only.)

## Sources a reviewer must supply

- A practical haematology or physiology-practical textbook for the improved Neubauer ruling, the standard WBC (Türk's fluid, 1:20, four corner squares) and RBC (Hayem's fluid, 1:200, five medium squares) methods, and the counting rules. **No such text is in the registry**, so the draft cites only the SI Brochure; this is the main gap before publication.
- A statistics or haematology source for the Poisson counting error (±1/√N).
- If the course wants reference intervals shown at all, the specific laboratory or textbook interval the course uses, clearly attributed.
