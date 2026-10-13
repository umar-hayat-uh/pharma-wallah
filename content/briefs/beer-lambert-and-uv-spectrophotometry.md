# Brief: The Beer–Lambert Law and UV–Visible Spectrophotometry

- **Slug:** beer-lambert-and-uv-spectrophotometry
- **Draft:** `src/lib/guides/content/beer-lambert-and-uv-spectrophotometry.ts` (status: draft)
- **Target keyword:** beer lambert law calculation
- **Category:** Pharmaceutical Analysis

## Purpose

Teach a Pharm-D student to do every calculation in a UV–visible spectrophotometry practical: absorbance ↔ %T, A = εbc, specific absorbance A(1%, 1 cm) and its link to ε, why λmax and a blank, and a tablet assay worked back through every dilution to % label claim. All data invented; wavelengths, absorptivities and limits for real assays are left to the monograph.

## Outline

- Absorbance and transmittance
  - T, %T, A = −log₁₀ T; A ↔ %T table; worked example
- The Beer–Lambert law and its two forms
  - A = εbc (units cancel); A(1%, 1 cm); ε = A(1%, 1 cm) × MW ÷ 10; worked example; unit caution
- Choosing the wavelength and zeroing on a blank
  - Scan table, λmax, sensitivity to wavelength error; blank; quartz cells
- A UV assay: from absorbance to % label claim
  - Five-step back-calculation; worked tablet example; comparison with a reference standard
- When the law stops working
  - Instrumental, chemical, physical, concentration deviations; working range

## Practice questions (with answers)

1. A = 0.750 → %T? **17.8%** (10⁻⁰·⁷⁵⁰ × 100)
2. %T = 40.0 → A? **0.398** (−log₁₀ 0.400)
3. ε = 8000 L mol⁻¹ cm⁻¹, b = 1 cm, A = 0.640 → c? **8.0 × 10⁻⁵ mol/L**
4. Same solution in a 0.5 cm cell → A? **0.320**
5. MW 300.0, A(1%, 1 cm) = 350 → ε? **10 500 L mol⁻¹ cm⁻¹**
6. Diluted 5.0 → 50.0 mL, A = 0.420, ε = 12 000, MW 200.0 → original? **70 µg/mL** (7.0 µg/mL in the cuvette)
7. Injection labelled 20 mg/mL, diluted 1.0 → 100 then 2.0 → 100 mL, A = 0.209, line A = 0.0520C + 0.0040 → **19.71 mg/mL, 98.6% LC**
8. Standard 10.0 µg/mL reads 0.500; sample reads 0.465 → **9.30 µg/mL**

## Linked calculators

- `law-absorbance-calculator` — solves A = εbc for A, c or ε with unit conversion and %T = 10⁻ᴬ × 100; maths checked against the guide.
- `uv-spectrum-plotter` — finds λmax from a pasted scan and fits a least-squares calibration (standard sums, R², optional zero intercept); maths checked.
- **Rejected:** `uv-analyzer-tool` — it is about nucleic-acid A260/A280 purity, not drug assay, and its bands are questionable (a ratio of 2.1 and above is labelled "phenol contamination"; the tracker records its protein examples reading as "protein contamination").

## Required sources (from `src/lib/content/references.ts`)

- `harris10` — Harris DC, Lucy CA. Quantitative Chemical Analysis. 10th ed. New York: W. H. Freeman (Macmillan Learning); 2019.
- `iupacGoldBook` — International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book').

## Sources a reviewer must supply

- A pharmaceutical-analysis text covering specific absorbance A(1%, 1 cm) and pharmacopoeial UV assays by comparison with a reference standard (for example Beckett & Stenlake Part 2 — not in the registry; Part 1 is).
- The pharmacopoeia general chapter on UV–visible spectrophotometry, for cuvette, wavelength-accuracy and stray-light requirements.
