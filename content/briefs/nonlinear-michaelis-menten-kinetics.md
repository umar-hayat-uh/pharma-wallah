# Content brief — Non-Linear (Michaelis–Menten) Pharmacokinetics

- **Slug:** `nonlinear-michaelis-menten-kinetics`
- **Draft:** `src/lib/guides/content/nonlinear-michaelis-menten-kinetics.ts` (status: draft, 2026-10-13)
- **Target keyword:** michaelis menten pharmacokinetics phenytoin css calculation

## Purpose

Explain saturable elimination: the Michaelis–Menten rate equation and its first- and zero-order limits, the steady-state equation Css = Km·R/(Vmax − R) and the disproportionate rise of Css with dose, estimating Vmax and Km from two steady states, concentration-dependent apparent clearance and half-life, the integrated equation for elimination time, and the longer time to steady state at higher doses. Classic drugs (phenytoin, ethanol, high-dose salicylate) are named only as textbook examples; all numbers belong to fictional Drug X / Drug Y.

## Outline

- H2 The Michaelis–Menten equation — limits; example (first-order approximation check)
- H2 Steady state: why concentrations rise out of proportion — Css equation; table; example
- H2 Estimating Vmax and Km from two steady states — formulas; example
- H2 Clearance and half-life are no longer constants — formulas; table; integrated equation; example
- H2 Slower to steady state at higher doses — t₉₀% expression; example; not-for-dosing callout
- Common mistakes · Practice (8) · Limitations · References · Related tools

## Practice questions (answers verified in Python)

1. Rate at C = Km → **Vmax/2**
2. Vmax 600, Km 5; R 300 / 450 → **Css 5 / 15 mg/L**
3. (200, 4) and (300, 12) → **Km 4 mg/L, Vmax 400 mg/day**
4. Vmax 400, Km 4, target 12 → **R = 300 mg/day** (fictional arithmetic)
5. Vmax 500, Km 4; C 2 / 20 → **CL 83.3 / 20.8 L/day**
6. Km 4, Vmax′ 2; 20 → 5 mg/L → **10.27 h** (first-order estimate 2.77 h)
7. Vmax 3 mg/L/h, Km 30, C 0.5 → **0.0492 exact vs 0.0500 approx**
8. Vmax 400, Km 4; R 250 → 300 → **Css +80% (6.67 → 12.0 mg/L)**

## Linked calculators

- `order-kinetics-calculator` — only its first-order, zero-order and Compare modes are pointed to (the two limiting cases). **Its "Mixed" (Michaelis–Menten) mode uses a coarse Euler step over 0/1/2/4/6/8/12/24 h and is a recorded fault**; the link text sends students away from it.

## Required sources (registry ids)

- `rowland5` — Rowland and Tozer's Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications. 5th ed. Philadelphia: Wolters Kluwer; 2019.
- `shargel8` — Ducharme MP, Shargel L, editors. Shargel and Yu's Applied Biopharmaceutics & Pharmacokinetics. 8th ed. New York: McGraw Hill; 2022.
- `gibaldi` — Gibaldi M, Perrier D. Pharmacokinetics. 2nd ed. New York: Marcel Dekker; 1982.

## Sources a reviewer must supply

- **Confirm the t₉₀% expression** t₉₀% = [Km·Vd/(Vmax − R)²]·(2.303·Vmax − 0.9·R) against `rowland5` (or another clinical PK text) before publishing; it is written from the standard textbook form, not from a page the team has opened.
- Optional: a clinical PK text for the statement that phenytoin, ethanol and high-dose salicylate are classic examples of saturable elimination (expected in `rowland5`/`shargel8`).
