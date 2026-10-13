# Content brief — Multiple Dosing, Accumulation and Steady State

- **Slug:** `multiple-dosing-and-steady-state`
- **Draft:** `src/lib/guides/content/multiple-dosing-and-steady-state.ts` (status: draft, 2026-10-13)
- **Target keyword:** accumulation ratio and steady state pharmacokinetics

## Purpose

Students meet repeated dosing in every biopharmaceutics paper but usually learn only "steady state takes 4–5 half-lives". This guide explains *why* drugs accumulate (a geometric series of leftovers), how to calculate the accumulation ratio R, peaks and troughs after the nth dose and at steady state for repeated IV boluses, the average steady-state concentration for any route, the time to a given fraction of steady state, and the constant-infusion limit. One-compartment, first-order model; illustrative drugs only; no dosing advice.

## Outline

- H2 Why repeated doses accumulate — geometric series, R = 1/(1 − e^(−kₑτ)), table of R vs τ/t½
- H2 Peaks and troughs after repeated IV bolus doses — Cmax,n / Cmin,n, Cmax,ss / Cmin,ss; worked example (Drug X)
- H2 The average steady-state concentration — Cav,ss = F·Dose/(CL·τ); IV and oral examples; same daily dose, different swings
- H2 How long until steady state? — fss = 1 − e^(−kₑt); table by half-lives; worked example
- H2 Constant-rate infusion — Css = k₀/CL; worked example
- Common mistakes · Practice (8) · Limitations · References · Related tools

## Practice questions (answers verified in Python)

1. t½ 12 h, τ 12 h → **R = 2.0**
2. t½ 4 h, τ 8 h → **R = 1.33**
3. t½ 24 h: τ 24 h → **R = 2.0**; τ 12 h → **R = 3.41**
4. F 0.8, 250 mg q12h, CL 5 L/h → **Cav,ss = 3.33 mg/L**
5. Infusion 20 mg/h, CL 4 L/h, t½ 7 h → **Css 5 mg/L; ~23 h to 90%**
6. 200 mg IV q6h, Vd 40 L, kₑ 0.1 h⁻¹ → **Cmax,ss 11.08, Cmin,ss 6.08 mg/L**
7. t½ 8 h, τ 8 h, after 3 doses → **87.5%**
8. t½ 6 h, IV bolus q12h → **Cmax,ss/Cmin,ss = 4.0**

## Linked calculators

- `accumulation-index-calculator` — R = 1/(1 − e^(−kτ)) with k = 0.693/t½, identical to the guide. **Caveat:** its "fraction of steady state after 4 half-lives" row computes 1 − e^(−kτ·4) (i.e. after 4 doses), so the link text sends students to R only.
- `ke-calculator` — kₑ = 0.693/t½ and kₑ = CL/Vd.
- **Rejected:** `loading-dose-calculator`, `maintenance-dose-calculator` (recorded preset faults), `half-life-calculator` (minutes/days double-converted).

## Required sources (registry ids)

- `shargel8` — Ducharme MP, Shargel L, editors. Shargel and Yu's Applied Biopharmaceutics & Pharmacokinetics. 8th ed. New York: McGraw Hill; 2022.
- `rowland5` — Rowland and Tozer's Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications. 5th ed. Philadelphia: Wolters Kluwer; 2019.
- `gibaldi` — Gibaldi M, Perrier D. Pharmacokinetics. 2nd ed. New York: Marcel Dekker; 1982.

## Sources a reviewer must supply

- None required. A reviewer may wish to add chapter/page references for the multiple-dosing equations from `shargel8` or `rowland5` once opened.
