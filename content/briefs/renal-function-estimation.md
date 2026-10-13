# Content brief — Estimating Renal Function: Creatinine Clearance, eGFR and Why They Differ

- **Slug:** `renal-function-estimation`
- **Draft:** `src/lib/guides/content/renal-function-estimation.ts` (status: draft, 2026-10-13)
- **Target keyword:** cockcroft gault vs egfr difference

## Purpose

Pharmacy students are taught both Cockcroft–Gault and eGFR but rarely why the two give different numbers for the same patient. This guide explains why creatinine is used (and its weak points), how to calculate measured CrCl from a timed urine collection, Cockcroft–Gault CrCl, CKD-EPI 2021 and MDRD eGFR, how to de-index eGFR with Mosteller BSA, and why the families diverge — largest in older, lighter patients. Strictly educational: **no drug-dosing recommendations**; the guide repeatedly sends dosing decisions to validated drug-specific references and clinical judgement.

## Outline

- H2 Why creatinine is used — and its weak points (muscle mass, secretion, diet/drugs, unstable function)
- H2 Measured creatinine clearance from a urine collection — CrCl = (Ucr × V)/(Scr × t); example
- H2 Estimated creatinine clearance: Cockcroft–Gault — formula, units, which-weight caution; examples (60-year-old man; µmol/L → mg/dL)
- H2 eGFR: CKD-EPI 2021 and MDRD — formulas with κ/α; example; de-indexing with BSA
- H2 Why Cockcroft–Gault and eGFR give different answers — comparison table; 85-year-old 48 kg woman example; "not a dosing guide" callout
- Common mistakes · Practice (8) · Limitations · References · Related tools

## Practice questions (answers verified in Python)

1. 132.6 µmol/L → **1.5 mg/dL**
2. CG, man 45 y, 80 kg, Scr 1.2 → **87.96 mL/min**
3. CG, woman 70 y, 60 kg, Scr 0.9 → **55.09 mL/min**
4. Urine 1800 mL/24 h, Ucr 120 mg/dL, Scr 1.5 → **100 mL/min**
5. CKD-EPI 2021, woman 50 y, Scr 0.6 → **109.3 mL/min/1.73 m²**
6. CKD-EPI 2021, man 70 y, Scr 2.0 → **35.2 mL/min/1.73 m²**
7. eGFR 60, BSA 1.5 m² → **52.0 mL/min**
8. MDRD, man 60 y, Scr 1.5 → **47.7 mL/min/1.73 m²**

## Linked calculators

- `gfr-calculator` — CKD-EPI 2021 (142, κ 0.7/0.9, α −0.241/−0.302, −1.200, 0.9938^age, ×1.012 female) and MDRD (175, −1.154, −0.203, ×0.742) match the guide exactly. Note for reviewer: the tool also prints KDIGO-stage "clinical management" text including some drug-specific advice; the guide links it for the eGFR figure only.
- **Rejected:** `creatinine-calculator` (stages CKD from Cockcroft–Gault rather than eGFR — Known Issue 15); `renal-dosing-adjuster` (dosing-tier faults recorded in docs/CALCULATOR_INVENTORY_AND_ACCURACY.md).

## Required sources (registry ids)

- `cockcroftGault1976` — Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31–41.
- `mosteller1987` — Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.
- `shargel8` — Ducharme MP, Shargel L, editors. Shargel and Yu's Applied Biopharmaceutics & Pharmacokinetics. 8th ed. New York: McGraw Hill; 2022.
- `rowland5` — Rowland and Tozer's Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications. 5th ed. Philadelphia: Wolters Kluwer; 2019.

## Sources a reviewer must supply

- **CKD-EPI 2021 race-free creatinine equation** — Inker et al., NEJM, 2021. Not in the registry; full citation (volume, pages) must be checked against the journal before adding to `references.ts`.
- **MDRD Study equation** (175 coefficient, IDMS-traceable version) — primary paper(s) by Levey et al.; not in the registry; exact citation to be confirmed.
- **KDIGO CKD guideline** — if the reviewer wants the staging context cited.
- A source for the statement that some creatinine is tubularly secreted, so CrCl overestimates GFR (likely covered in `shargel8`/`rowland5`; reviewer to confirm).
