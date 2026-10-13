# Content brief — Non-Compartmental Analysis: AUC, AUMC and Mean Residence Time

- **Slug:** `non-compartmental-analysis`
- **Draft:** `src/lib/guides/content/non-compartmental-analysis.ts` (status: draft, 2026-10-13)
- **Target keyword:** how to calculate AUMC and mean residence time

## Purpose

A complete, step-by-step non-compartmental analysis of one illustrative IV-bolus data set (with a visible distribution phase): λz from the terminal points, AUC and AUMC by the linear trapezoidal rule, both tails (including the C_last/λz² AUMC term students forget), percentage extrapolated, MRT, CL, Vss and Vz. Also the log-trapezoidal rule, MAT for oral doses, and the infusion correction. The data set deliberately shows why MRT = 1.44 × t½ fails for a two-exponential drug (8.07 h vs 9.99 h).

## Outline

- H2 The idea: areas and moments — AUC, AUMC, MRT; NCA assumptions
- H2 Step 1: the terminal phase and λz — data table with t × C; example (λz, t½, C₀ back-extrapolation)
- H2 Step 2: AUC and AUMC by the trapezoidal rule — segment and tail formulas; example; log-trapezoid rule
- H2 Step 3: MRT, clearance and volumes — example; summary table
- H2 Oral doses and infusions: MAT and the infusion correction — example
- Common mistakes · Practice (8) · Limitations · References · Related tools

## Practice questions (answers verified in Python)

1. AUMC 1500, AUC 120 → **MRT 12.5 h**
2. 500 mg IV, AUC 100, MRT 8 h → **CL 5 L/h, Vss 40 L**
3. 8 → 4 mg/L over 2 h → **linear 12.0, log 11.54 mg·h/L**
4. C_last 2 mg/L at 12 h, λz 0.2 → **AUC tail 10, AUMC tail 170**
5. AUC₀–t 90, tail 10 → **10% extrapolated**
6. MRT oral 9.5, IV 6.0 → **MAT 3.5 h, ka ≈ 0.29 h⁻¹**
7. 2-h infusion, MRT 7 h → **MRT(IV) 6 h**
8. One-compartment t½ 5 h → **MRT ≈ 7.2 h**

## Linked calculators

- `mean-residence-time-calculator` — "From AUC and AUMC" computes MRT = AUMC/AUC exactly; its 1.44 × t½ method is labelled one-compartment-IV-only on the tool and in the guide's link text.
- **Rejected:** `auc-estimator` — its "clearance" method is empty (Known Issue 15).

## Required sources (registry ids)

- `gibaldi` — Gibaldi M, Perrier D. Pharmacokinetics. 2nd ed. New York: Marcel Dekker; 1982. (Registry note: "moment analysis".)
- `shargel8` — Ducharme MP, Shargel L, editors. Shargel and Yu's Applied Biopharmaceutics & Pharmacokinetics. 8th ed. New York: McGraw Hill; 2022.
- `rowland5` — Rowland and Tozer's Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications. 5th ed. Philadelphia: Wolters Kluwer; 2019.

## Sources a reviewer must supply

- Optional: the original statistical-moments paper (Yamaoka et al.) if a primary citation for AUMC/MRT is wanted; not in the registry.
- Optional: a source for the "linear-up / log-down" convention and the log-back-extrapolation of C₀ from the first two points (common NCA software practice); reviewer to confirm wording.
