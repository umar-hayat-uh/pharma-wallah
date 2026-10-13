# Brief: Chromatography Calculations — Rf Value, Resolution and Plate Number

- **Slug:** chromatography-rf-and-resolution
- **Draft:** `src/lib/guides/content/chromatography-rf-and-resolution.ts` (status: draft)
- **Target keyword:** how to calculate rf value and resolution in chromatography
- **Category:** Pharmaceutical Analysis

## Purpose

Give a student the handful of chromatography numbers they meet in TLC practicals and on HPLC/GC system-suitability printouts — Rf, k, α, N, H and Rs — with how to measure each correctly, what each means, and how the Purnell equation shows that selectivity is the most powerful lever. Limits for real methods are left to the monograph.

## Outline

- Rf values in thin-layer and paper chromatography
  - Formula, measuring from the origin to the spot centre, co-spotting a reference, polarity depends on the system
- Retention in column chromatography: tR, k and α
- Column efficiency: plate number N and plate height H
  - Base-width (16) and half-height (5.54) forms; worked
- Resolution between two peaks
  - Both formulas; worked; table of what Rs = 1.0 / 1.5 / 2.0 looks like; unequal peaks
- Improving resolution: the Purnell equation
  - Worked; table of the effect of N, k and α

## Practice questions (with answers)

1. Front 7.5 cm, spot 3.9 cm → **Rf 0.52**
2. Rf 0.35, front 9.0 cm → **3.15 cm**
3. tM 1.10, tR 6.60 min → **k = 5.0**
4. tM 1.10; peaks 3.30 and 3.74 min → **k₁ 2.00, k₂ 2.40, α 1.20**
5. 250 mm column, tR 8.0 min, W 0.40 min → **N 6400; H 39.1 µm**
6. tR 7.10 and 7.60 min, W 0.42 and 0.46 min → **Rs 1.14**
7. Purnell, N 6400, k₂ 4.0, α 1.15 → **Rs 2.09**
8. N 5000 gives Rs 1.0; plates for Rs 1.5? **11 250**

## Linked calculators

- `rf-value-calculator` (TLC Rf Analyzer) — the "Enter distances" tab computes Rf = d(spot) ÷ d(front) and warns above 1; polarity labels assume normal-phase silica (stated in the guide's link text).
- `chromatographic-resolution-calculator` — Rs = 2(tR₂ − tR₁) ÷ (W₁ + W₂), and Purnell Rs = (√N/4)((α − 1)/α)(k/(1 + k)); maths checked; the k it asks for is the later peak's, as in the guide.

## Required sources (from `src/lib/content/references.ts`)

- `harris10` — Harris DC, Lucy CA. Quantitative Chemical Analysis. 10th ed. New York: W. H. Freeman (Macmillan Learning); 2019.

## Sources a reviewer must supply

- The pharmacopoeia general chapter on chromatographic separation techniques (definitions of Rf, N, Rs and system suitability as the course's pharmacopoeia states them; some pharmacopoeias use the half-height forms by default).
- A chromatography text that states the Purnell equation in the exact form used (k of the later peak, (α − 1)/α), since textbooks print slightly different forms. The registry entry for `harris10` lists Beer–Lambert and calibration, not chromatography, so a reviewer should confirm which chapters of Harris support this guide.
