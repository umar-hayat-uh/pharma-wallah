# Brief: Powder Flow and Micromeritics: Bulk and Tapped Density, Carr's Index, Hausner Ratio and Porosity

- **Slug:** powder-flow-and-micromeritics
- **Draft:** `src/lib/guides/content/powder-flow-and-micromeritics.ts` (review status: draft)
- **Target keyword:** carr's index and hausner ratio calculation

## Purpose
Teach students to calculate true, bulk and tapped density, Carr's compressibility index, Hausner ratio, porosity (bed and tablet) and angle of repose, to convert between CI and HR, and to read the standard flow-character scale — linking each number to die and capsule filling and to dose uniformity.

## Outline
- Intro (micromeritics, why flow matters)
- H2 Three densities, three volumes — formula ρb, ρt, ρtrue
- H2 Carr's compressibility index and the Hausner ratio
  - formulas; CI ↔ HR; flow-character table
  - Example 1 (cylinder test, fair); Example 2 (densities, poor)
- H2 Porosity of a powder bed and of a tablet — formula; Example 3 (bed); Example 4 (flat-faced tablet)
- H2 Angle of repose — formula; Example 5
- H2 What changes powder flow — list; callout "one test is not enough"
- Mistakes, practice (8), limitations, references, related tools

## Practice questions (with answers)
1. 40 g, V₀ 80 mL, Vt 70 mL → ρb **0.500**, ρt **0.571 g/mL**, CI **12.5%**, HR **1.14**, good.
2. ρb 0.35, ρt 0.50 → CI **30.0%**, HR **1.43**.
3. HR 1.25 → CI **20.0%**.
4. ρtrue 1.40, ρb 0.56 → ε **60.0%**.
5. Bed 25 mL, solid 9.5 mL → ε **62.0%**.
6. 0.50 mL cavity, ρt 0.62 → **0.310 g**.
7. Cone h 3.0 cm, base diameter 12.0 cm → θ **26.6°**.
8. CI 24% → 14%: HR **1.32 → 1.16** (passable → good).

## Linked calculators
- `compressibility-index-calculator` — ρb = m/V₀, ρt = m/Vt, CI = (V₀ − Vt)/V₀ × 100, HR = V₀/Vt: matches. Its CI label thresholds (<10, <15, <20, <25, <31) can disagree with the integer table at exact band edges and its short Hausner list (<1.18 Excellent) is inconsistent (recorded in redesign tracker); the guide tells students to read the numbers against the guide's table, and no example sits on a band edge.
- `porosity-calculator` — ε = (1 − ρbulk/ρtrue) × 100 and (Vtotal − Vsolid)/Vtotal × 100: matches. (Recorded: "<10% Non-porous" label vs "Very Low" on scale — label only; no example uses it.)
- `density-calculator` — mass ÷ volume for true/bulk/tapped: matches when the optional container fields are blank (tapped mode's container-volume subtraction is non-standard, recorded); the "why" says to leave them blank.

## Rejected
- `powder-flowability-calculator` — classification bands contradict its own printed scale and its sample presets are mislabelled (recorded in `.claude/redesign-tracker.md`); its Hausner bands (<1.2 Excellent, <1.4 Fair) also disagree with the standard table.

## Required textbook sources (from `src/lib/content/references.ts`)
- `aulton6` — Aulton ME, Taylor KMG, editors. Aulton's Pharmaceutics: The Design and Manufacture of Medicines. 6th ed. Edinburgh: Elsevier; 2022. (powder flow)
- `martin8` — Sinko PJ, editor. Martin's Physical Pharmacy and Pharmaceutical Sciences. 8th ed. Philadelphia: Wolters Kluwer; 2023. (micromeritics, density, porosity)

## Sources a reviewer must supply
- The pharmacopoeial powder-flow general chapter (USP–NF chapter on powder flow) — needed to confirm the CI/HR and angle-of-repose flow-character bands. Not in the registry.
- The pharmacopoeial bulk and tapped density general chapter — for the standard test method. Not in the registry.
- Carr's original paper on flow properties, if the reviewer wants the scale attributed to its origin. Not in the registry.
