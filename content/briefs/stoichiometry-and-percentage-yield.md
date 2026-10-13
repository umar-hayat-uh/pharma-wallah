# Content brief — Stoichiometry, Limiting Reactant, Theoretical and Percentage Yield

- **Slug:** `stoichiometry-and-percentage-yield`
- **Draft:** `src/lib/guides/content/stoichiometry-and-percentage-yield.ts` (status: draft, 2026-10-13)
- **Target keyword:** how to calculate theoretical yield and percentage yield

## Purpose

Every preparation in the pharmaceutical chemistry practical ends with a yield calculation, and most wrong answers come from basing the theoretical yield on the excess reagent, comparing raw moles when coefficients differ, or dividing product mass by starting-material mass. This guide follows the chain molar mass → moles → mole ratio → limiting reactant (moles ÷ coefficient) → theoretical yield → percentage yield, then adds reagent purity and multi-step overall yield. Worked reactions are standard teaching preparations (aspirin, paracetamol, Mg(OH)₂ precipitation); masses and yields are illustrative.

## Outline

- H2 Molar mass and moles — formulas; Example 1 (aspirin 180.16 g/mol); callout on hydrates
- H2 Mole ratios and the limiting reactant — procedure list; ξ formula; Example 2 (aspirin 1 : 1, 3.261 g); Example 3 (MgCl₂ + 2 NaOH, NaOH limiting)
- H2 Percentage yield — formula; Example 4 (80.0%); table (causes of low/high yields)
- H2 Reagent purity and multi-step syntheses — formulas; Example 5 (46.8% overall)
- Common mistakes (8) · Practice (8) · Limitations (4) · References · Related tools

Atomic weights used (abridged standard values): H 1.008, C 12.011, N 14.007, O 15.999, Na 22.990, Mg 24.305, Cl 35.45.

## Practice questions (answers verified in Python)

1. 5.00 g NaCl; 0.250 mol H₂O → **0.08556 mol; 4.504 g**
2. Molar mass of C₈H₉NO₂ → **151.165 g/mol**
3. 3.00 g 4-aminophenol → paracetamol (1 : 1) → **4.156 g**
4. 3.35 g obtained → **80.6%**
5. 1.50 g 4-aminophenol + 1.80 g acetic anhydride → **4-aminophenol limiting; 2.078 g**
6. 2.00 g NaOH, MgCl₂ excess → **1.458 g Mg(OH)₂**
7. 2.00 g salicylic acid at 95.0% purity → **2.478 g (2.609 g if purity ignored)**
8. Step yields 72% and 85%; 25.0 g maximum → **61.2%; 15.3 g**

## Linked calculators

- `theoretical-yield-calculator` — Reaction stoichiometry mode: n = m/M, ratio = n/coefficient, ξ = min, product = ξ × coefficient × M, excess = n − ξ × coefficient. Matches the guide exactly; ties reported as "no single limiting reactant".
- `percentage-yield-calculator` — actual/theoretical × 100 after converting mg/g/kg to g; >100% warning lists the same causes. Its `_learn.ts` worked example (aspirin) was already Python-checked.
- **Rejected:** `molecular-weight-finder` — "Moles in 10 mg" prints 10/MW as **mol** (it is mmol: 1000× error) on every result, and the parser rejects `Ca(OH)2`/`(NH4)2SO4`-style formulas and hydrate dots (redesign tracker R-notes). The guide is about moles, so the fault is on the path a student would use.

## Required sources (registry ids)

- `vogel5` — Furniss BS, Hannaford AJ, Smith PWG, Tatchell AR. Vogel's Textbook of Practical Organic Chemistry. 5th ed. Harlow: Longman Scientific & Technical; 1989. (Theoretical and percentage yield, limiting reagent, recrystallisation losses.)
- `bipmSI` — Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019. (The mole and the Avogadro constant.)
- `iupacGoldBook` — International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book'). (Definitions: amount of substance, molar mass.)

## Sources a reviewer must supply

- The **IUPAC table of standard atomic weights** (abridged values) used for the molar masses — not in the registry; the current CIAAW/IUPAC table's year must be taken from the issuing body's site.
- Optionally, the **course's own practical manual** for the aspirin and paracetamol quantities, if the reviewer wants the examples aligned to the local practical.
