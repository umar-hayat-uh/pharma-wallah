# Content brief: Sterilization Kinetics: D-Value, z-Value, F₀ and Log Reduction

- **Slug:** `sterilization-kinetics-d-value-f-value`
- **Draft file:** `src/lib/guides/content/sterilization-kinetics-d-value-f-value.ts` (meta.review.status = "draft"; not listed, not in the sitemap)
- **Target keyword:** D value z value F0 sterilization calculation
- **Status:** Draft written 2026-10-13. Needs author and reviewer details, and the sources below, before publication.

## Purpose

Explain moist-heat sterilization kinetics from first principles: first-order microbial death in base-10 logs, log reduction and percent kill, D-value, z-value, lethal rate, F₀ from a hold and from a recorded temperature profile, and sterility assurance level. The guide is explicit that all values are illustrative and that real cycles are designed and validated by the manufacturer. It distinguishes the pharmaceutical overkill target (F₀ ≥ 12 min) from the food 12D botulinum figure (about 2.52 min), the confusion recorded against `sterilization-calculator`.

## Outline

- Introduction
- Key terms
- H2: First-order death and log reduction
- H2: The D-value
  - H3: Example 1: D-value from survivor counts
  - H3: Example 2: Time to reach an SAL of 10⁻⁶
- H2: The z-value: how temperature changes D
  - H3: Example 3: z-value from two D-values
- H2: Lethal rate and F₀
  - H3: Example 4: A hold at a lower temperature
  - H3: Example 5: F₀ from a recorded temperature profile
- H2: From calculation to a validated cycle
- H2: Common mistakes
- H2: Practice questions
- H2: Limitations
- H2: References

## Practice questions (with answers)

1. **Q:** A suspension of 1 × 10⁶ spores is held at 121 °C for 10 min and 1 × 10² survive. What are the log reduction and D₁₂₁?
   **A:** 4-log reduction; D₁₂₁ = 2.5 min.
   Working: Log reduction = log₁₀(10⁶ ÷ 10²) = log₁₀ 10⁴ = 4. D = 10 min ÷ 4 = 2.5 min.

2. **Q:** Spores with D₁₂₁ = 0.8 min are present at 10⁵ per unit. How long at 121 °C to reach an SAL of 10⁻⁶?
   **A:** 8.8 min.
   Working: Log reduction needed = log₁₀ 10⁵ − log₁₀ 10⁻⁶ = 5 − (−6) = 11. Time = 0.8 × 11 = 8.8 min.

3. **Q:** An organism has D₁₁₁ = 20 min and D₁₂₁ = 2.0 min. What is its z-value?
   **A:** z = 10 °C.
   Working: ΔT = 121 − 111 = 10 °C. log₁₀ 20 − log₁₀ 2 = 1.3010 − 0.3010 = 1. z = 10 ÷ 1 = 10 °C.

4. **Q:** D₁₂₁ = 1.5 min and z = 10 °C. What is the D-value at 116 °C?
   **A:** D₁₁₆ ≈ 4.74 min.
   Working: D at T = D_ref × 10^((T_ref − T) ÷ z) = 1.5 × 10^((121 − 116) ÷ 10). 10^0.5 = 3.162, so D₁₁₆ = 1.5 × 3.162 = 4.743 min.

5. **Q:** A load is held at 115 °C for 30 min. With z = 10 °C, what F₀ does the hold deliver?
   **A:** F₀ ≈ 7.54 min.
   Working: L = 10^((115 − 121) ÷ 10) = 10^(−0.6) = 0.2512. F₀ = 0.2512 × 30 = 7.536 min.

6. **Q:** A disinfectant test starts with 3.2 × 10⁶ CFU and 45 CFU survive. What are the log reduction and the percent kill?
   **A:** Log reduction 4.85; percent kill 99.9986%.
   Working: N₀ ÷ N = 3.2 × 10⁶ ÷ 45 = 71,111. Log reduction = log₁₀ 71,111 = 4.85. Percent kill = (1 − 45 ÷ 3,200,000) × 100 = 99.9986%.

7. **Q:** A biological indicator carries 10⁶ spores with D₁₂₁ = 1.8 min. How many minutes at 121 °C reduce it to a probability of 10⁻⁶ survivors (a 12-log reduction)?
   **A:** 21.6 min.
   Working: Log reduction = log₁₀ 10⁶ − log₁₀ 10⁻⁶ = 12. Time = 1.8 × 12 = 21.6 min.

8. **Q:** Product temperatures are recorded every minute: 118, 121, 121 and 119 °C. Estimate F₀ (z = 10 °C) by summing L × Δt.
   **A:** F₀ ≈ 3.13 min.
   Working: L(118) = 10^(−0.3) = 0.5012; L(121) = 1; L(119) = 10^(−0.2) = 0.6310. Σ L = 0.5012 + 1 + 1 + 0.6310 = 3.1321. F₀ = 3.1321 × 1 min = 3.13 min.

## Linked calculators

- `d-value-calculator` (D-Value Calculator) — Computes D = t ÷ log₁₀(N₀ ÷ N) from a starting count, a surviving count and the exposure time, as in Example 1.
- `f-value-calculator` (F-Value Calculator) — Multiplies D (at the process temperature) by the log reduction and converts it to F₀ with 10^((T − 121) ÷ z), as in the lethal-rate section. Its lethal-rate table uses the 121.1 °C reference, so it shows 0.975 at 121 °C.
- `log-reduction-calculator` (Log Reduction Calculator) — Gives log₁₀(N₀ ÷ N) and percent kill, as in the first section. Use it for the arithmetic only: its "meets sterilization criteria" band is not a sterility standard.

## Required sources (from src/lib/content/references.ts)

- `aulton6` — Aulton ME, Taylor KMG, editors. Aulton's Pharmaceutics: The Design and Manufacture of Medicines. 6th ed. Edinburgh: Elsevier; 2022.
- `martin8` — Sinko PJ, editor. Martin's Physical Pharmacy and Pharmaceutical Sciences. 8th ed. Philadelphia: Wolters Kluwer; 2023.
- `iupacGoldBook` — International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book').

Each textbook above is cited for a topic the reviewer should confirm against the edition named (chapter not checked by us; no page numbers given).

## Sources a reviewer must supply

- A pharmacopoeial source on sterilization and sterility assurance (for example the USP–NF general chapters on sterilization of compendial articles and moist-heat sterilization, or Ph. Eur. 5.1.1 Methods of preparation of sterile products / 5.1.5 Application of the F₀ concept). Needed for the F₀ definition, the 121 °C / z = 10 °C reference, SAL 10⁻⁶, and the overkill approach. None is in the registry; edition, year and chapter text must be checked.
- A source for the 12D botulinum figure (D₁₂₁ ≈ 0.21 min) and for the 121.1 °C (250 °F) reference convention.
- A pharmaceutical microbiology textbook (for example Hugo and Russell's Pharmaceutical Microbiology) for survivor curves, shoulders and tails.
- The draft cites `aulton6` on the understanding that it covers sterilization and the action of heat on microorganisms, and `martin8` / `iupacGoldBook` for first-order kinetics; the reviewer must confirm `aulton6` covers D and z values.

## Calculators deliberately not linked

- `sterilization-calculator` — recorded fault: labels F₀ ≥ 12 as the 12-log botulinum cycle (Known Issue 15).
- `log-reduction-calculator` is linked, with a caveat. Its maths (log₁₀(N₀/N), percent kill) is correct; no stray "[citation:N]" text was found on the page on 2026-10-13. Its interpretation band "≥5 log: meets sterilization criteria" is wrong (recorded in the redesign tracker), so the link text tells students to use it for the arithmetic only. Drop the link if the reviewer prefers.
- `f-value-calculator` is linked. F = D × log reduction (D at the process temperature) and F₀ = F × 10^((T − 121)/z) are correct. Its lethal-rate table is computed with a 121.11 °C (250 °F) reference while labelled 121 °C (it shows 0.975 at 121 °C); the guide's formula note explains that convention, and the link text says so.

## Verification note

Every number in the draft's examples, tables and practice answers was computed with python3 on 2026-10-13. Values are illustrative and are not product limits, validated processes or dosing advice.
