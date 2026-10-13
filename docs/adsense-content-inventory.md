# AdSense content inventory

> **Generated** by `node scripts/content-inventory.mjs` on 2026-10-12. Do not edit by hand —
> change the source and regenerate. Machine-readable copy: `docs/adsense-content-inventory.json`.
> Static analysis only; see the method notes at the end.

## Summary

| Measure | Count |
| --- | --- |
| Calculator pages | 106 |
| … linked from the hub | 95 |
| … with a worked example, mistakes and references (`_learn.ts`) | 21 |
| … with at least one recorded formula fault | 54 |
| Published course units | 22 |
| Guides | 5 |

Every calculator page already has a formula panel, an "About" section and an FAQ (counted below), so
none is an empty tool page. The gap the remediation addresses is *teaching depth* (worked examples,
mistakes, references) and *correctness* (recorded faults).

## Calculators

Columns: F = formula panel, A = About section, FAQ = number of questions, WE = worked example,
M = common mistakes listed, L = limitations, Refs = references cited, G = links a guide.

| Calculator | Hub | F | A | FAQ | WE | M | L | Refs | G | Recorded faults | Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [Accumulation Index Calculator](/calculation-tools/accumulation-index-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Anion Gap Calculator](/calculation-tools/anion-gap-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | AnionGapCalculator: interpretation low <6 / elevated >12 contradicts page's own normal 8–12; "Elevated AG metabolic acidosis" printed without checking bicarbonate. | repair — recorded formula fault (owner decision) |
| [Antagonism Simulator](/calculation-tools/antagonism-simulator) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | Non-competitive `1 − [B]/([B]+KdB)` and uncompetitive `KdB/(KdB+[B])` are algebraically identical → both modes return the same number. True uncompetitive antagonism also shifts EC₅₀ left; not modelled. | repair — recorded formula fault (owner decision) |
| [Corrected Calcium Calculator](/calculation-tools/corrected-calcium-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [D-Value Calculator](/calculation-tools/d-value-calculator) | Microbiology | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Weight/Volume Conversion Calculator (Density-Based)](/calculation-tools/density-conversion-calculator) | Unit Conversion | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [mmol ↔ mEq ↔ mg Calculator](/calculation-tools/electrolyte-conversion-calculator) | Unit Conversion | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Emax Model Calculator](/calculation-tools/emax-model-calculator) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | EmaxModelCalculator: bands compare absolute effect with fixed 50/80% instead of half the entered Emax (Emax 80 at C = EC₅₀ → "Below EC₅₀"); curves capped at 100%; Hill n ≤ 0 accepted. | repair — recorded formula fault (owner decision) |
| [F-Value Calculator](/calculation-tools/f-value-calculator) | Microbiology | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Geriatric Dosing & Safety Calculator](/calculation-tools/geriatric-dosing-calculator) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | **GeriatricDosingCalculator:** renal rule text says min(1, CrCl/100) but dose floors at 0.2 (<CrCl 20 mismatch), frailty floor 0.15; 33% rule uses 0.333; blank age → 65, age > 140 → negative CrCl silently clamped; digoxi | repair — recorded formula fault (owner decision) |
| [Heat Of Neutralization Calculator](/calculation-tools/heat-of-neutralization-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | — | — | — | — | — | HeatOfNeutralizationCalculator: molar ΔH = +ΔQ/n (positive for warming) vs reference table's −57.9 convention; at ΔQ = 0 "Exothermic" + "heat absorbed". | repair — recorded formula fault (owner decision) |
| [Insulin Sensitivity Calculator](/calculation-tools/insulin-sensitivity-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | InsulinSensitivityCalculator: "Calculates ~X units" TDD preview ignores lb (180 lb → ~126 vs correct 57.2 when applied). | repair — recorded formula fault (owner decision) |
| [Log Reduction Calculator](/calculation-tools/log-reduction-calculator) | Microbiology | ✓ | ✓ | 4 | — | — | — | — | — | LogReductionCalculator: "≥5 log meets sterilization" contradicts page's own 6-log figure. | repair — recorded formula fault (owner decision) |
| [Mass Conversion Calculator](/calculation-tools/mass-conversion-calculator) | Unit Conversion | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Mean Residence Time Calculator](/calculation-tools/mean-residence-time-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Opioid Conversion Calculator](/calculation-tools/opioid-conversion-calculator) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | Transdermal fentanyl read as mg, not mcg/h: a 25 mcg/h patch → **2500 MME** (published equivalent ≈ 60 mg oral morphine/day). No cross-tolerance reduction anywhere. / **OpioidConversionCalculator:** fentanyl factor 100/mg with transdermal multiplier 1 and patch dose entered in "mg" → 25 → 2500 MME (code comment admits placeholder); methadone flat factor 4 (real ratio is dose-dependent | repair — recorded formula fault (owner decision) |
| [Opioid MME & Equianalgesic Converter](/calculation-tools/opioid-mme-calculator) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | Tramadol ×0.1 (CDC 2022: 0.2); oral hydromorphone ×4 (CDC 2022: 5). Rotating **to** a fentanyl patch divides the mcg/h rate by the dosing frequency, halving/quartering a continuous rate. / **OpioidMMECalculator:** tramadol factor 0.1 (CDC 2022: 0.2); oral hydromorphone 4.0 (CDC 2022: 5; the conversion tool uses 5); rotation TO fentanyl patch divides the 24 h mcg/hr target by a greyed-out frequency (default | repair — recorded formula fault (owner decision) |
| [Osmolar Gap Calculator](/calculation-tools/osmolar-gap-calculator) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | OsmolarGapCalculator: none. | repair — recorded formula fault (owner decision) |
| [Sodium Correction Calculator](/calculation-tools/sodium-correction-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Strength Conversion Calculator](/calculation-tools/strength-conversion-calculator) | Unit Conversion | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Temperature Conversion Calculator](/calculation-tools/temperature-conversion-calculator) | Unit Conversion | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Volume Conversion Calculator](/calculation-tools/volume-conversion-calculator) | Unit Conversion | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Accuracy & % Recovery Calculator](/calculation-tools/accuracy-recovery-calculator) | Pharmaceutical Analysis | ✓ | ✓ | 4 | ✓ | 6 | ✓ | harris10, ichQ2R2, uspValidation | ✓ | — | meets standard |
| [Animal Weight-Based Dose Calculator](/calculation-tools/animal-dose) | Pharmacology | ✓ | ✓ | 4 | — | — | — | — | — | Linear body-weight scaling, not allometric (BSA/Km). A mouse needs ≈12× the human mg/kg; this returns the same mg/kg by construction. / animal-dose: scales dose linearly by body weight (normalised mg/kg always = adult mg/kg) — standard human↔animal conversion uses BSA/Km factors (rodents ~6–12× more); formatter ignores requested decimals (≥1 → 3 dp; smal | repair — recorded formula fault (owner decision) |
| [Anticoagulation Risk Calculator](/calculation-tools/anti-coagulation-risk-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Ash Value Calculator](/calculation-tools/ash-value-calculator) | Pharmaceutical Analysis | ✓ | ✓ | 4 | — | — | — | — | — | ash-value-calculator: W₃ < W₁ negative ash counts as "within limits"; pass/fail uses ≤15/5/20% while monograph limits are stricter (cellulose ≤0.5% → 2.00% "passes"). | repair — recorded formula fault (owner decision) |
| [AUC Estimator](/calculation-tools/auc-estimator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 4 | — | — | — | — | — | auc-estimator: unit selector relabels only (dose/CL mode "ng·h/mL" 1000× wrong); exposure bands ignore unit/drug; extrapolation from last two points only. OLD PAGE CRASHED on any edit (in-place sort of state) — fixed by  | repair — recorded formula fault (owner decision) |
| [Bioavailability Calculator](/calculation-tools/bioavailability-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 4 | ✓ | 5 | ✓ | shargel8, rowland5 | ✓ | bioavailability-calculator: dose estimate uses one textbook F per route; illustrative AUCs = dose × F × 0.5. | repair — recorded formula fault (owner decision) |
| [Bioequivalence Calculator](/calculation-tools/bioequivalence-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 5 | — | — | — | — | — | bioequivalence-calculator: alpha select is ignored (z = 1.645 always). Uses arithmetic ratio + CV-derived SE, not log-transformed GMR with t; "power" = 100 − 2×CV. (Stale-state verdict bug that ignored Cmax on first load | repair — recorded formula fault (owner decision) |
| [BMI Calculator](/calculation-tools/bmi-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | bmi-calculator: healthy range + weight-change always WHO 18.5–24.9 even in Asian mode; IBW equations run below 60 in (Hamwi −7.7 kg at 100 cm) and AdjBW builds on it; lbs rounded to 0.1 kg before BMI. | repair — recorded formula fault (owner decision) |
| [BSA Calculator](/calculation-tools/bsa-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | ✓ | 6 | ✓ | mosteller1987, ansel16 | ✓ | bsa-calculator: dose uses unrounded BSA, comparison table 3-dp BSA → 0.1 mg differences. | repair — recorded formula fault (owner decision) |
| [Calibration Curve Calculator](/calculation-tools/calibration-curve-calculator) | Pharmaceutical Analysis | ✓ | ✓ | 4 | ✓ | 6 | ✓ | harris10, ichQ2R2, uspValidation | ✓ | — | meets standard |
| [Colony Counter & CFU Calculator](/calculation-tools/cfu-calculator) | Microbiology | ✓ | ✓ | 6 | — | — | — | — | — | cfu-calculator: "CFU at different dilutions" chart multiplies the same count by each dilution (doesn't match caption; breaks log scale at 0); message "Too few colonies (>30)" should be <30; "Environmental air" limits row | repair — recorded formula fault (owner decision) |
| [Child-Pugh Calculator](/calculation-tools/child-pugh-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Chromatographic Resolution Calculator](/calculation-tools/chromatographic-resolution-calculator) | Pharmaceutical Analysis | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Clearance Calculator](/calculation-tools/clearance-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 4 | ✓ | 6 | ✓ | shargel8, rowland5 | ✓ | clearance-calculator: per-kg always 70 kg; organ pie chart fixed illustrative numbers. | repair — recorded formula fault (owner decision) |
| [Combined pKa Suite](/calculation-tools/combined-pka-suite) | Pharmaceutical Chemistry | ✓ | ✓ | 5 | — | — | — | — | — | combined-pka-suite: ½(pKa − log C) shortcut gives pH 7–15 for very dilute acids; example bands contradict code bands; exactly 50% ionised reads "Protonated"; bases treated as acids. | repair — recorded formula fault (owner decision) |
| [Compressibility Index Calculator](/calculation-tools/compressibility-index-calculator) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | compressibility-index-calculator: Hausner scale (<1.18 Excellent) contradicts table (1.00–1.11) and "Target <1.25"; "USP ≤20% good" vs Passable band at 20%. | repair — recorded formula fault (owner decision) |
| [Content Uniformity Calculator](/calculation-tools/content-uniformity-calculator) | Pharmaceutics | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Creatinine Calculator](/calculation-tools/creatinine-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | **creatinine-calculator:** CKD G-stage taken from Cockcroft-Gault CrCl, not eGFR (eGFR 44.7 labelled G3a because CrCl 57.7); dosing tiers (>50/30–50) misaligned with G bands; age ≥140 → negative CrCl (field warning added | repair — recorded formula fault (owner decision) |
| [Cumulative Drug Release Calculator](/calculation-tools/cumulative-drug-release-calculator) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Density Calculator](/calculation-tools/density-calculator) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | density-calculator: tapped mode subtracts a "container volume" (non-standard); bulk mode can print negative density (now flagged). | repair — recorded formula fault (owner decision) |
| [Dialysis Membrane / Diffusion Calculator](/calculation-tools/dialysis-diffusion-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Dilution Calculator (C₁V₁ = C₂V₂)](/calculation-tools/dilution-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | ✓ | 5 | ✓ | ansel16, martin8 | ✓ | dilution-calculator: C₁/C₂ modes don't check V₂ ≥ V₁. | repair — recorded formula fault (owner decision) |
| [Dissolution Calculator](/calculation-tools/dissolution-calculator) | Pharmaceutics | ✓ | ✓ | 5 | ✓ | 5 | ✓ | uspDissolution, fdaDissolution1997, aulton6 | — | — | meets standard |
| [Dissolution Rate Constant Calculator](/calculation-tools/dissolution-rate-constant-calculator) | Pharmaceutics | ✓ | ✓ | 6 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Dose–Response Curve Generator](/calculation-tools/dose-response-curve-generator) | Pharmacology | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Drug–Excipient Compatibility Predictor](/calculation-tools/drug-excipient-compatibility-predictor) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | drug-excipient-compatibility-predictor: only primary amines linked to lactose (secondary also Maillard); phenol oxidation advice missing; metals never paired with phenol/thiol. | repair — recorded formula fault (owner decision) |
| [Drug Half-Life Calculator (Multiple Dose)](/calculation-tools/drug-half-life-calculator) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | drug-half-life-calculator: kₑ rounded to 4 dp before other figures (t½ 2000 h → accumulation 139.39 vs ~120.8 unrounded); peak/trough are mg amounts not concentrations. (Decorative sawtooth replaced by a real chart from  | repair — recorded formula fault (owner decision) |
| [Drug–Receptor Binding Affinity Tool](/calculation-tools/drug-receptor-binding-affinity-tool) | Pharmacology | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Drying Rate Calculator](/calculation-tools/drying-rate) | Pharmaceutical Engineering | ✓ | ✓ | 4 | — | — | — | — | — | Phase is read from the **final** moisture content alone, not the critical moisture content. Accepts X₁ < X₂ and reports a negative drying rate. | repair — recorded formula fault (owner decision) |
| [ED50 / TD50 / LD50 Calculator](/calculation-tools/ed50-td50-ld50-calculator) | Pharmacology | ✓ | ✓ | 4 | — | — | — | — | — | `probitTransform` returns the upper-tail deviate for every p — p<0.5 lands above probit 5, **inverting the fitted slope** (real data → slope −2.25). χ² (222.71) and the CI inherit the error. `ed50 = ld50` (ED50 is the LD | repair — recorded formula fault (owner decision) |
| [GFR Calculator](/calculation-tools/gfr-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Half-Life Calculator](/calculation-tools/half-life-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 4 | — | — | — | — | — | half-life-calculator: concentration method double-converts time for minutes/days (6 min → 179.96 "min", should be 3.00); interpretation bands assume hours for any unit. | repair — recorded formula fault (owner decision) |
| [Heat of Formation Calculator](/calculation-tools/heat-formation-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | — | — | — | — | — | heat-formation-calculator: actually van't Hoff enthalpy of solution, not heat of formation; temps must be > 0 in entered unit (0 °C rejected); at ΔH = 0 badge "Exothermic" vs band "endothermic". | repair — recorded formula fault (owner decision) |
| [Heat Transfer Area Calculator](/calculation-tools/heat-transfer-area) | Pharmaceutical Engineering | ✓ | ✓ | 4 | — | — | — | — | — | The W / BTU-h selector only relabels the ΔT field; the area is always Q/(U·ΔT) in SI and reported in m². / heat-transfer-area: W/BTU/h selector relabels only (no conversion; area always m²-banded); stale result after alert. | repair — recorded formula fault (owner decision) |
| [Isotonicity Calculator](/calculation-tools/isotonicity-calculator) | Pharmaceutics | ✓ | ✓ | 5 | ✓ | 5 | ✓ | ansel16, martin8, uspOsmolality | ✓ | isotonicity-calculator: mM conversion ×0.001 regardless of MW (150 mM = 0.15%); osmolality scaled from 0.9% not computed; alternatives = NaCl ÷ E. | repair — recorded formula fault (owner decision) |
| [IV Drip Rate Calculator](/calculation-tools/iv-drip-rate-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | ✓ | 5 | ✓ | ansel16 | ✓ | — | meets standard |
| [Ke Calculator](/calculation-tools/ke-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 4 | ✓ | 6 | ✓ | shargel8, rowland5 | ✓ | — | meets standard |
| [Beer-Lambert Law Calculator](/calculation-tools/law-absorbance-calculator) | Pharmaceutical Analysis | ✓ | ✓ | 4 | ✓ | 6 | ✓ | harris10, iupacGoldBook | — | — | meets standard |
| [Loading Dose Calculator](/calculation-tools/loading-dose-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 5 | ✓ | 5 | ✓ | rowland5, shargel8 | ✓ | loading-dose-calculator: example Vd values are L/kg but used as total L (vancomycin 20×0.7 = 14 mg); weight-based dose always equals plain dose; ">5000 very large" band unreachable (">1000" checked first); digoxin exampl | repair — recorded formula fault (owner decision) |
| [Maintenance Dose Calculator](/calculation-tools/maintenance-dose-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 5 | ✓ | 6 | ✓ | shargel8, rowland5 | ✓ | maintenance-dose-calculator: without half-life, time-to-steady-state assumes Vd = 50 L for every drug; q8h classed "Twice daily" (≤12 band); several example Cl/targets implausible or mcg. | repair — recorded formula fault (owner decision) |
| [Mass–Molarity Calculator](/calculation-tools/mass-molarity-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Master Formula Calculator](/calculation-tools/master-formula-calculator) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [mg/mL ↔ Molarity Calculator](/calculation-tools/mg-ml-to-molarity-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Mixing Time Estimator](/calculation-tools/mixing-time-estimator) | Pharmaceutical Engineering | ✓ | ✓ | 4 | — | — | — | — | — | Speed is labelled rps and Re uses rps, but the time correlation multiplies by 60 as though rpm → **time 60× too long**. | repair — recorded formula fault (owner decision) |
| [Molarity Calculator](/calculation-tools/molarity-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | ✓ | 5 | ✓ | iupacGoldBook, bipmSI, martin8 | ✓ | molarity-calculator: blank sg/purity passes validation; 0% purity divides by zero; sg/purity checks block solid mode. | repair — recorded formula fault (owner decision) |
| [Molecular Weight Finder](/calculation-tools/molecular-weight-finder) | Pharmaceutical Chemistry | ✓ | ✓ | 5 | — | — | — | — | — | **molecular-weight-finder:** "10 mg" quick calc is mmol labelled mol (1000×); parser rejects a count after a bracket (Ca(OH)2, (NH4)2SO4) and hydrate dots. | repair — recorded formula fault (owner decision) |
| [Normality Calculator](/calculation-tools/normality-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | — | — | — | — | — | normality-calculator: invalid n/MW silently falls back to the last Eq.W; sg/purity checks block solids. | repair — recorded formula fault (owner decision) |
| [First-Order vs Zero-Order Kinetics Tool](/calculation-tools/order-kinetics-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 4 | ✓ | 5 | ✓ | shargel8, rowland5, martin8 | ✓ | order-kinetics-calculator: mixed-kinetics simulation steps coarsely over gaps up to 12 h → falls too fast. | repair — recorded formula fault (owner decision) |
| [Osmolality Calculator](/calculation-tools/osmolality-calculators) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | Serum osmolar gap is `calculated − calculated` = **always 0** except in the ethanol mode; "Measured Value" mode returns the standard formula; urine "Direct Input" returns sodium × 2; urine:plasma ratio always divides by  | repair — recorded formula fault (owner decision) |
| [Osmolarity Calculator](/calculation-tools/osmolarity-calculators) | Pharmaceutics | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [pH–pKa Calculator (Henderson–Hasselbalch)](/calculation-tools/ph-pka-relationship-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 5 | — | — | — | — | — | pH-pka-relationship-calculator: "relative buffer capacity %" peaks at 57.6%, not 100%. | repair — recorded formula fault (owner decision) |
| [Partition / Distribution Coefficient Calculator](/calculation-tools/partition-coefficient-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Pediatric Dose Calculator](/calculation-tools/pedriatic-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | pedriatic-calculator: mg/kg mode always says "Appropriate" (even 0 mg); amoxicillin/prednisolone presets are mg/kg/DAY but field is single dose; diphenhydramine preset uses Young's rule despite 1.25 mg/kg note; Fried's r | repair — recorded formula fault (owner decision) |
| [Percent Purity Calculator](/calculation-tools/percent-purity-calculator) | Pharmaceutical Analysis | ✓ | ✓ | 4 | ✓ | 6 | ✓ | beckettStenlake1, harris10 | — | percent-purity-calculator: original labelled W in mg but examples only work with W in g, E in g/mEq (label now says g; numbers same). | repair — recorded formula fault (owner decision) |
| [Percentage Recovery Calculator](/calculation-tools/percentage-recovery-calculator) | Pharmaceutical Analysis | ✓ | ✓ | 5 | ✓ | 5 | ✓ | ichQ2R2, uspValidation, ansel16 | ✓ | — | meets standard |
| [Percentage Solution Calculator (w/v, w/w, v/v)](/calculation-tools/percentage-solution-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | ✓ | 5 | ✓ | ansel16, martin8 | ✓ | percentage-solution-calculator: no unit conversion (0.9% of 1 L → "0.009 g"); w/v solvent = solution − solute subtracts g from mL; "sig figs" are decimals. | repair — recorded formula fault (owner decision) |
| [Percentage Yield Calculator](/calculation-tools/percentage-yield-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | ✓ | 6 | ✓ | vogel5, iupacGoldBook | — | — | meets standard |
| [Porosity Calculator](/calculation-tools/porosity-calculator) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | porosity-calculator: <10% classed "Non-porous" but scale says "Very Low". | repair — recorded formula fault (owner decision) |
| [Powder Flowability Calculator](/calculation-tools/powder-flowability-calculator) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | powder-flowability-calculator: bands (<15 Good, <25 Passable, <31 Poor) contradict the page's own scale (16–20 Fair, >25 Poor); samples mislabelled ("Excellent" 0.45/0.55 → 18.18% Fair). | repair — recorded formula fault (owner decision) |
| [ppm / ppb Calculator](/calculation-tools/ppm-ppb-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [QT Interval Calculator](/calculation-tools/qt-interval-calculator) | Clinical & Hospital Pharmacy | ✓ | ✓ | 5 | — | — | — | — | — | qt-interval-calculator: QRS > 120 adjustment applies even with bundle-branch-block unticked (field now always visible so it's not hidden); default QT 430 @ 70 bpm → 453 "borderline". | repair — recorded formula fault (owner decision) |
| [RBC Count Calculator](/calculation-tools/rbc-count-calculator) | Physiology | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Reconstitution & IV Compounding Calculator](/calculation-tools/reconstitution-calculator) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Density & Relative Density Bottle Calculator](/calculation-tools/relative-density-bottle-calculator) | Pharmaceutics | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Renal Dosing Adjuster](/calculation-tools/renal-dosing-adjuster) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Reynolds Number Calculator](/calculation-tools/reynolds-number) | Pharmaceutical Engineering | ✓ | ✓ | 4 | — | — | — | — | — | Blasius (0.316·Re^−0.25) is applied across the **transitional** band 2000–4000 and far above 10⁵, outside its fitted range. / reynolds-number: Blasius friction factor used in transitional 2000–4000 band; tiny inputs → "Re 0", f 973.38; alert fires on every keystroke for invalid values. | repair — recorded formula fault (owner decision) |
| [TLC Rf Analyzer](/calculation-tools/rf-value-calculator) | Pharmaceutical Analysis | ✓ | ✓ | 7 | — | — | — | — | — | rf-value-calculator: Rf > 1 labelled "Very non-polar" instead of invalid (warning added). | repair — recorded formula fault (owner decision) |
| [Serial Dose Calculator](/calculation-tools/serial-diluation) | Pharmacology | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Serial Dilution Calculator](/calculation-tools/serial-dilution-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 5 | ✓ | 5 | ✓ | ansel16, martin8 | ✓ | — | meets standard |
| [Solubility Calculator](/calculation-tools/solubility-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | — | — | — | — | — | solubility-calculator: "mg/mL" = g/L × 1000 (should be ×1); "mol/L" divides by gram-equivalent weight (always N/10); S = N × G.W / 10 gives g/100 mL, labelled g/L; bands applied to the number in the chosen unit; "sig fig | repair — recorded formula fault (owner decision) |
| [Drug Stability Kinetics Calculator](/calculation-tools/stability-kinetics-calculator) | Pharmaceutics | ✓ | ✓ | 6 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Sterile Dose Volume Calculator](/calculation-tools/sterile-dose-volume) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Sterilization Calculator](/calculation-tools/sterilization-calculator) | Microbiology | ✓ | ✓ | 4 | — | — | — | — | — | sterilization-calculator: "lethality curve" is a flat line; F₀-per-minute table uses ~121.1 °C reference (121 °C → 0.975); standards list (F₀ ≥ 8, ≥2.52) disagrees with result bands (≥6, ≥3); old header formula hard-code | repair — recorded formula fault (owner decision) |
| [Surface Area–Particle Size Calculator](/calculation-tools/surface-area-particle-size-calculator) | Pharmaceutics | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Tablet Dissolution Profile Plotter](/calculation-tools/tablet-disintegration-dissolution-profile-plotter) | Pharmaceutics | ✓ | ✓ | 4 | — | — | — | — | — | tablet-disintegration-dissolution-profile-plotter: Q check needs a point at exactly 30 min (no interpolation); "Meets Q=80%" ignores its own S1 = Q+5% rule. | repair — recorded formula fault (owner decision) |
| [Theoretical Yield Calculator](/calculation-tools/theoretical-yield-calculator) | Pharmaceutical Chemistry | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Therapeutic Index Calculator](/calculation-tools/therapeutic-index-calculator) | Pharmacology | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [TPN Admixture Calculator](/calculation-tools/tpn) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [UV-Vis Peak Analyzer](/calculation-tools/uv-analyzer-tool) | Pharmaceutical Analysis | ✓ | ✓ | 4 | — | — | — | — | — | uv-analyzer-tool: "Pure Protein"/"Contaminated" examples read "Protein contamination" (A260/280 < 1.5 band labelling inverted for protein samples). | repair — recorded formula fault (owner decision) |
| [UV-Vis Spectrum Plotter](/calculation-tools/uv-spectrum-plotter) | Pharmaceutical Analysis | ✓ | ✓ | 7 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Vancomycin AUC/MIC Dosing Calculator](/calculation-tools/vancomycin-auc-calculator) | not listed | ✓ | ✓ | 4 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Volume of Distribution Calculator](/calculation-tools/volume-distribution-calculator) | Biopharmaceutics & Pharmacokinetics | ✓ | ✓ | 4 | ✓ | 6 | ✓ | shargel8, rowland5 | ✓ | — | meets standard |
| [WBC Count Calculator](/calculation-tools/wbc-count-calculator) | Physiology | ✓ | ✓ | 5 | — | — | — | — | — | — | improve — add worked example, mistakes, references |
| [Zone of Inhibition Calculator](/calculation-tools/zone-of-inhibition-calculator) | Microbiology | ✓ | ✓ | 4 | — | — | — | — | — | zone-of-inhibition-calculator: one set of cut-offs (≥20 S, 15–19 I, <15 R) for every drug despite the drug-specific CLSI table on the page; example labels contradicted bands. | repair — recorded formula fault (owner decision) |

## Guides

| Guide | ≈ words | Worked examples | Practice questions | Review status |
| --- | --- | --- | --- | --- |
| [Accuracy, Precision and Percentage Recovery in Pharmaceutical Analysis](/guides/accuracy-precision-recovery) | 3640 | 4 | 7 | team-checked |
| [Dilution and Concentration Calculations](/guides/dilution-and-concentration) | 4312 | 8 | 8 | team-checked |
| [Pharmaceutical Dose Calculations: Units, Body Weight and Body Surface Area](/guides/dose-calculations) | 3566 | 6 | 7 | team-checked |
| [Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability](/guides/pharmacokinetic-parameters) | 3307 | 8 | 8 | team-checked |
| [Zero-, First- and Second-Order Kinetics in Drug Stability](/guides/reaction-kinetics-drug-stability) | 4171 | 5 | 8 | team-checked |

## Course units (registered subjects)

| Unit | Words of lesson text | Action |
| --- | --- | --- |
| [Unit 1: Introduction to Pharmaceutical Biochemistry](/courses/pharmaceutical-biochemistry/unit1-intro-pharma-biochemistry) | 1389 | ok |
| [Unit 2: Basic Chemistry of Biomolecules: Carbohydrates, Lipids, Proteins & Amino Acids](/courses/pharmaceutical-biochemistry/unit2-carbohydrates) | 3617 | ok |
| [Unit 3: Bioenergetics](/courses/pharmaceutical-biochemistry/unit3-bioenergetics) | 3670 | ok |
| [Unit 4: Enzymes: Chemistry, Classification, Kinetics, Inhibition, and Mechanism of Action](/courses/pharmaceutical-biochemistry/unit4-lipids) | 4486 | ok |
| [Unit 5: Metabolic Fate of Biomolecules: Carbohydrates, Lipids, Proteins & Amino Acids](/courses/pharmaceutical-biochemistry/unit5-vitamins) | 4166 | ok |
| [Unit 1: Basic Concepts](/courses/pharmaceutical-organic-chemistry/unit1-basic-concepts) | 5619 | ok |
| [Unit 2: Functional Organic Compounds](/courses/pharmaceutical-organic-chemistry/unit2-functional-organic-compounds) | 7524 | ok |
| [Unit 3: Types of Reactions](/courses/pharmaceutical-organic-chemistry/unit3-types-of-reactions) | 5667 | ok |
| [Unit 4: Stereochemistry](/courses/pharmaceutical-organic-chemistry/unit4-stereochemistry) | 3321 | ok |
| [Unit 1: Introduction to Pharmacy and History](/courses/physical-pharmacy/unit1-intro-pharmacy-history) | 2387 | ok |
| [Unit 2: Introduction to Pharmaceutical Literature](/courses/physical-pharmacy/unit2-pharmaceutical-literature) | 2706 | ok |
| [Unit 3: Introductory Concepts in Physical Pharmacy](/courses/physical-pharmacy/unit3-introductory-concepts) | 2958 | ok |
| [Unit 4: Physico‑Chemical Principles](/courses/physical-pharmacy/unit4-physico-chemical-principles) | 5670 | ok |
| [Unit 5: Ionization and Buffers](/courses/physical-pharmacy/unit5-ionization-buffers) | 3288 | ok |
| [Unit 6: Micromeritics](/courses/physical-pharmacy/unit6-micromeritics) | 4252 | ok |
| [Unit 1: Basic Cell Functions](/courses/physiology/unit1-basic-cell-functions) | 2023 | ok |
| [Unit 2: Muscle Physiology](/courses/physiology/unit2-muscle-physiology) | 3067 | ok |
| [Unit 3: Circulation](/courses/physiology/unit3-circulation) | 2888 | ok |
| [Unit 4: The Heart](/courses/physiology/unit4-the-heart) | 2607 | ok |
| [Unit 5: The Blood Cells](/courses/physiology/unit5-blood-cells) | 2599 | ok |
| [Unit 6: Digestion and Absorption of Food](/courses/physiology/unit6-digestion-absorption) | 2529 | ok |
| [Unit 7: Temperature Regulation](/courses/physiology/unit7-temperature-regulation) | 2680 | ok |

## Not inventoried here

- **Spotting lessons** (histology 16, pathology 15, powder microscopy 3) are page files, not data;
  their word counts need a render. Powder microscopy has no images (CLAUDE.md Known Issue 23).
- **Simulations, Molecular Lab, Pharmacy Counter, Compounding Lab** are interactive tools whose value
  is not measured by word count.
- **Clinical subdomain pages** share the main site's content (they canonicalise to www).

## Method notes

- *Formula / About / FAQ* are detected from the shared kit components in the page source.
- *Worked example, mistakes, limitations, references, guide* come from the tool's `_learn.ts` and
  count only when the page actually renders `<CalcLearn>`.
- *Recorded faults* are read from `.claude/redesign-tracker.md` → "Suspected maths issues". A tool
  with none listed is not proven correct; it has simply not been reported faulty.
- *Short lesson* means under 600 words of markdown; it is a prompt to look, not a verdict.
