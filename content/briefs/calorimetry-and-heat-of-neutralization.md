# Content brief: Calorimetry and the Heat of Neutralization (q = m·c·ΔT)

- **Slug:** `calorimetry-and-heat-of-neutralization`
- **Draft file:** `src/lib/guides/content/calorimetry-and-heat-of-neutralization.ts` (meta.review.status = "draft"; not listed, not in the sitemap)
- **Target keyword:** heat of neutralization calculation q=mcΔT
- **Status:** Draft written 2026-10-13. Needs author and reviewer details, and the sources below, before publication.

## Purpose

Teach coffee-cup calorimetry for the heat-of-neutralization practical: q = m·c·ΔT with the total mass, conversion to a molar enthalpy per mole of water with the correct (negative) sign, limiting reactants and diprotic acids, the calorimeter constant by the method of mixtures, and the error sources that make measured values smaller than literature values. It warns about the linked calculator's sign convention (positive molar value for a warming mixture).

## Outline

- Introduction
- Key terms
- H2: The heat equation q = m·c·ΔT
- H2: From heat to molar enthalpy of neutralization
  - H3: Example 1: Hydrochloric acid and sodium hydroxide
- H2: Limiting reactants and diprotic acids
  - H3: Example 2: Sulfuric acid
- H2: Correcting for the calorimeter
  - H3: Example 3: Finding the calorimeter constant
  - H3: Example 4: Using the constant, with a reactant in excess
- H2: Errors and good practice
- H2: Common mistakes
- H2: Practice questions
- H2: Limitations
- H2: References

## Practice questions (with answers)

1. **Q:** 100 g of a dilute aqueous solution (c = 4.18 J/(g·°C)) warms by 5.5 °C. How much heat did it absorb?
   **A:** 2299 J (2.30 kJ).
   Working: q = m × c × ΔT = 100 × 4.18 × 5.5 = 2299 J = 2.299 kJ.

2. **Q:** 25.0 mL of 2.0 M HCl and 25.0 mL of 2.0 M NaOH are mixed; the temperature rises from 21.0 °C to 34.2 °C. Find ΔH of neutralization (density 1.00 g/mL, c = 4.18 J/(g·°C)).
   **A:** ΔH ≈ −55.2 kJ/mol.
   Working: m = 50 g; ΔT = 34.2 − 21.0 = 13.2 °C. q = 50 × 4.18 × 13.2 = 2758.8 J = 2.7588 kJ. n = 2.0 × 0.0250 = 0.0500 mol of water. ΔH = −2.7588 ÷ 0.0500 = −55.18 kJ/mol.

3. **Q:** 40.0 mL of 1.0 M HCl is mixed with 50.0 mL of 1.0 M NaOH and the temperature rises by 5.9 °C. Find ΔH (density 1.00 g/mL, c = 4.18 J/(g·°C)).
   **A:** ΔH ≈ −55.5 kJ/mol.
   Working: n(H⁺) = 0.0400 mol; n(OH⁻) = 0.0500 mol; HCl is limiting, so 0.0400 mol of water forms. m = 40.0 + 50.0 = 90 g. q = 90 × 4.18 × 5.9 = 2219.6 J = 2.2196 kJ. ΔH = −2.2196 ÷ 0.0400 = −55.49 kJ/mol.

4. **Q:** 100 g of solution in a calorimeter with C_cal = 25 J/°C warms by 6.4 °C when 0.0500 mol of water is formed. Find q (corrected) and ΔH.
   **A:** q ≈ 2835 J; ΔH ≈ −56.7 kJ/mol.
   Working: q = (m × c + C_cal) × ΔT = (100 × 4.18 + 25) × 6.4 = 443 × 6.4 = 2835.2 J. ΔH = −2.8352 ÷ 0.0500 = −56.70 kJ/mol.

5. **Q:** A mixture's temperature is recorded as 298.15 K before and 304.65 K after. What is ΔT in °C, and the heat absorbed by 100 g of solution (c = 4.18 J/(g·°C))?
   **A:** ΔT = 6.5 °C; q = 2717 J.
   Working: ΔT = 304.65 − 298.15 = 6.5 K, which is also 6.5 °C (a degree Celsius and a kelvin are the same size). q = 100 × 4.18 × 6.5 = 2717 J.

6. **Q:** Taking an illustrative ΔH of −57 kJ/mol, what temperature rise would you expect when 0.025 mol of water is formed in 100 g of solution (c = 4.18 J/(g·°C)), ignoring heat losses?
   **A:** About 3.4 °C.
   Working: Heat released = 0.025 × 57,000 J = 1425 J. ΔT = q ÷ (m × c) = 1425 ÷ (100 × 4.18) = 3.409 °C.

7. **Q:** 40.0 g of water at 20.0 °C is in a calorimeter. 40.0 g of water at 50.0 °C is added and the mixture settles at 34.2 °C. Find the calorimeter constant (c = 4.18 J/(g·°C)).
   **A:** C_cal ≈ 18.8 J/°C.
   Working: Heat lost by hot water = 40.0 × 4.18 × (50.0 − 34.2) = 2641.8 J. Heat gained by cold water = 40.0 × 4.18 × (34.2 − 20.0) = 2374.2 J. Heat gained by calorimeter = 2641.8 − 2374.2 = 267.5 J. C_cal = 267.5 ÷ 14.2 = 18.84 J/°C.

8. **Q:** A neutralization releases 1.85 kJ of heat into the solution while forming 0.0325 mol of water. What is ΔH of neutralization?
   **A:** ΔH ≈ −56.9 kJ/mol.
   Working: The solution gained 1.85 kJ, so the reaction released 1.85 kJ: q(reaction) = −1.85 kJ. ΔH = −1.85 ÷ 0.0325 = −56.92 kJ/mol.

## Linked calculators

- `heat-of-neutralization-calculator` (Heat Of Neutralization Calculator) — Computes q = (m_acid + m_base) × c × ΔT and q ÷ n, as in Example 1. It reports the molar value with the sign of the temperature change (positive when the mixture warms), so write ΔH as negative, and it does not include a calorimeter constant.

## Required sources (from src/lib/content/references.ts)

- `martin8` — Sinko PJ, editor. Martin's Physical Pharmacy and Pharmaceutical Sciences. 8th ed. Philadelphia: Wolters Kluwer; 2023.
- `iupacGoldBook` — International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book').
- `bipmSI` — Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019.

Each textbook above is cited for a topic the reviewer should confirm against the edition named (chapter not checked by us; no page numbers given).

## Sources a reviewer must supply

- A physical-chemistry or practical-chemistry source for the standard enthalpy of neutralization of a strong acid by a strong base. The draft says only "close to −57 kJ/mol" and uses −57 kJ/mol in one practice question labelled illustrative; a reviewer should attach the value and source the course uses (the calculator's own table shows −57.9 / −57.1 / −55.8 / −51.6 kJ/mol with no source).
- A source for the weak-acid explanation (ionisation enthalpy) if the reviewer wants it cited.
- The draft cites `martin8` (Martin's Physical Pharmacy, thermodynamics); the reviewer should confirm the chapter.

## Calculators deliberately not linked

- `heat-formation-calculator` — recorded fault: it actually computes heat of solution (van 't Hoff), not heat of formation.
- `heat-of-neutralization-calculator` is linked with a caveat: q = (m_acid + m_base) × c × ΔT and ΔH = q/1000/n are correct, but the molar value takes the sign of ΔT (positive for warming), it shows "Exothermic" at ΔQ = 0, and it has no calorimeter-constant input.

## Verification note

Every number in the draft's examples, tables and practice answers was computed with python3 on 2026-10-13. Values are illustrative and are not product limits, validated processes or dosing advice.
