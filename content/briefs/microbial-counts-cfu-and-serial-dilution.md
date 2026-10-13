# Content brief: Counting Microbes: CFU/mL, Plate Counts and Serial Dilution

- **Slug:** `microbial-counts-cfu-and-serial-dilution`
- **Draft file:** `src/lib/guides/content/microbial-counts-cfu-and-serial-dilution.ts` (meta.review.status = "draft"; not listed, not in the sitemap)
- **Target keyword:** how to calculate CFU/mL from serial dilution
- **Status:** Draft written 2026-10-13. Needs author and reviewer details, and the sources below, before publication.

## Purpose

Teach Pharm-D students the arithmetic of the viable plate count: planning a ten-fold serial dilution, choosing a countable plate, converting colonies to CFU/mL or CFU/g (including solid samples dispersed 1 in 10), averaging replicates, reporting zero counts against a limit of detection, and writing counts in scientific notation and log₁₀. It supports the microbiology practicals and the Colony Counter & CFU Calculator, and leads into the sterilization-kinetics guide.

## Outline

- Introduction
- Key terms
- H2: What a plate count actually measures
- H2: Planning a ten-fold serial dilution
  - H3: Example 1: Planning the series
- H2: From colonies to CFU/mL
  - H3: Example 2: A spread plate
  - H3: Example 3: Replicate pour plates
- H2: Solid samples, low counts and zero counts
  - H3: Example 4: CFU per gram of a powder
  - H3: Example 5: Reporting a zero count
- H2: Reporting: scientific notation, significant figures and logs
- H2: Common mistakes
- H2: Practice questions
- H2: Limitations
- H2: References

## Practice questions (with answers)

1. **Q:** 1 mL of a 10⁻³ dilution is pour-plated and gives 87 colonies. What is the count in the original sample?
   **A:** 8.7 × 10⁴ CFU/mL (87,000 CFU/mL).
   Working: Dilution × volume plated = 10⁻³ × 1 mL = 10⁻³ mL. CFU/mL = 87 ÷ 10⁻³ = 87,000 CFU/mL = 8.7 × 10⁴ CFU/mL.

2. **Q:** 0.1 mL of a 10⁻⁶ dilution is spread on agar and gives 132 colonies. What is the viable count?
   **A:** 1.32 × 10⁹ CFU/mL.
   Working: Dilution × volume plated = 10⁻⁶ × 0.1 mL = 10⁻⁷ mL. CFU/mL = 132 ÷ 10⁻⁷ = 1,320,000,000 CFU/mL = 1.32 × 10⁹ CFU/mL.

3. **Q:** You transfer 0.5 mL into 4.5 mL of diluent, and repeat the same step three more times from each new tube. What is the dilution in the fourth tube?
   **A:** 10⁻⁴ (a dilution factor of 10,000).
   Working: One step = 0.5 ÷ (0.5 + 4.5) = 0.5 ÷ 5 = 0.1 = 10⁻¹. Four steps = (10⁻¹)⁴ = 10⁻⁴.

4. **Q:** 1 mL of sample is added to 99 mL of diluent, then 1 mL of that is added to 9 mL. What is the dilution in the second tube?
   **A:** 10⁻³.
   Working: First step = 1 ÷ (1 + 99) = 1/100 = 10⁻². Second step = 1 ÷ (1 + 9) = 1/10 = 10⁻¹. Total = 10⁻² × 10⁻¹ = 10⁻³ (multiply, never add).

5. **Q:** Spread plates (0.1 mL) give: 10⁻⁴ dilution, 380 and 410 colonies; 10⁻⁵ dilution, 41 and 35 colonies. Which plates do you use, and what is the count?
   **A:** Use the 10⁻⁵ pair; 3.8 × 10⁷ CFU/mL.
   Working: The 10⁻⁴ plates are above the upper end of the countable range (about 300), so they are not used. Mean of the 10⁻⁵ plates = (41 + 35) ÷ 2 = 38 colonies. CFU/mL = 38 ÷ (10⁻⁵ × 0.1) = 38 ÷ 10⁻⁶ = 38,000,000 CFU/mL = 3.8 × 10⁷ CFU/mL.

6. **Q:** A suspension is thought to contain about 5 × 10⁶ CFU/mL. You will spread 0.1 mL. Which dilution should give about 50 colonies?
   **A:** The 10⁻⁴ dilution.
   Working: Colonies = CFU/mL × dilution × volume plated. d = 50 ÷ (5 × 10⁶ × 0.1) = 50 ÷ 500,000 = 10⁻⁴.

7. **Q:** 10 g of a cream is dispersed in 90 mL of diluent, and 1 mL of this suspension is pour-plated in duplicate. Neither plate grows. How is the result reported?
   **A:** Less than 10 CFU/g.
   Working: 10 g in 90 mL is a 1 in 10 suspension, i.e. 10⁻¹ of the solid. One colony would represent 1 ÷ (10⁻¹ × 1 mL) = 10 CFU/g. No colonies grew, so the count is below that limit: less than 10 CFU/g.

8. **Q:** A culture contains 2.4 × 10⁶ CFU/mL. What is that as a log₁₀ value? And if a different liquid contains 340 CFU/mL, how many CFU are in a 250 mL bottle?
   **A:** log₁₀ 6.38; 8.5 × 10⁴ CFU in the bottle.
   Working: log₁₀(2.4 × 10⁶) = log₁₀ 2.4 + 6 = 0.38 + 6 = 6.38. CFU in the bottle = 340 CFU/mL × 250 mL = 85,000 CFU = 8.5 × 10⁴ CFU.

## Linked calculators

- `cfu-calculator` (Colony Counter & CFU Calculator) — Applies CFU/mL = colonies ÷ (dilution × volume plated) to a count you have checked, exactly as in Examples 2 and 3; its photo counter is an estimate you must review marker by marker.
- `serial-dilution-calculator` (Serial Dilution Calculator) — Plans the ten-fold series and multiplies the step factors to give the dilution in every tube, as in the planning section.

## Required sources (from src/lib/content/references.ts)

- `ansel16` — Stockton SJ. Stoklosa and Ansel's Pharmaceutical Calculations. 16th ed. Philadelphia: Wolters Kluwer; 2021.
- `aulton6` — Aulton ME, Taylor KMG, editors. Aulton's Pharmaceutics: The Design and Manufacture of Medicines. 6th ed. Edinburgh: Elsevier; 2022.
- `bipmSI` — Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019.

Each textbook above is cited for a topic the reviewer should confirm against the edition named (chapter not checked by us; no page numbers given).

## Sources a reviewer must supply

- A pharmacopoeial text on microbial enumeration of non-sterile products (for example the USP–NF general chapter on microbiological examination of non-sterile products: microbial enumeration tests, or the Ph. Eur. equivalent). Needed to support the counting range, averaging rules and how results are reported. Not in the registry; edition, year and chapter text must be checked before adding.
- A pharmaceutical microbiology textbook (for example Hugo and Russell's Pharmaceutical Microbiology) for viable counts and CFU. Not in the registry; edition and year must be checked.
- The draft cites `aulton6` for viable counting on the understanding that Aulton's Pharmaceutics has a pharmaceutical microbiology section; a reviewer must confirm this, or replace it with one of the sources above.

## Calculators deliberately not linked

- None rejected. Both linked tools were read: `cfu-calculator` (src/components/calculators/colony/cfu.ts, CFU/mL = colonies ÷ (dilution × volume)) and `serial-dilution-calculator` (inventory: 1000 µg/mL, 5 × 1:2 → 1:32, no recorded fault).

## Verification note

Every number in the draft's examples, tables and practice answers was computed with python3 on 2026-10-13. Values are illustrative and are not product limits, validated processes or dosing advice.
