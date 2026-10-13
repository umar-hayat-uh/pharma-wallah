# Content brief — Therapeutic Index and Margin of Safety

- **Slug:** `therapeutic-index-and-margin-of-safety`
- **Draft:** `src/lib/guides/content/therapeutic-index-and-margin-of-safety.ts` (status: draft, 2026-10-13)
- **Target keyword:** therapeutic index formula ED50 TD50

## Purpose

Students can divide TD₅₀ by ED₅₀ but rarely know what the number hides. This guide explains quantal dose–response curves, estimates ED₅₀ by log-dose interpolation, calculates TI with its end point stated, and then shows — with a log-normal worked example — why two drugs with the same TI can have very different overlap at the tails, which the certain safety factor (TD₁/ED₉₉) and standard safety margin capture. It stresses throughout that **TI is not the therapeutic window** (a plasma concentration range for one patient). All drugs and doses are illustrative; nothing is a safety statement about a real medicine.

## Outline

- H2 Quantal curves: effect in a population — log-dose interpolation formula; Example 1 (ED₅₀ 5.66 mg/kg)
- H2 Calculating the therapeutic index — formula; Example 2 (LD₅₀-based 80 vs TD₅₀-based 4); callout "TI is not the therapeutic window"
- H2 Why the slope matters: safety factors at the edges — CSF and SSM formulas; log-normal tails; Example 3 (same TI 10, CSF 1.17 vs 0.24); table comparing measures
- H2 What a narrow therapeutic index means in practice — list; Example 4 (window ratio ≠ TI)
- Common mistakes (7) · Practice (8) · Limitations (5) · References · Related tools

## Practice questions (answers verified in Python)

1. ED₅₀ 15, LD₅₀ 300, TD₅₀ 45 mg/kg → **TI 20 (lethality); TI 3 (adverse effect)**
2. ED₉₉ 8, TD₁ 12 mg/kg → **CSF 1.5; SSM +50%**
3. ED₅₀ 50, TD₅₀ 250 → **TI 5 (not 0.2)**
4. 20% at 2, 80% at 8; toxicity 40% at 20, 90% at 40 mg/kg → **ED₅₀ 4.0; TD₅₀ 23.0; TI 5.7**
5. ED₉₉ 9, TD₁ 6 → **CSF 0.67; SSM −33%**
6. Therapeutic range 0.8–2.0 mg/L → **2.5-fold window; TI cannot be calculated from it**
7. ED₅₀ 5, TD₅₀ 50, σ 0.25 both → **ED₉₉ 19.1; TD₁ 13.1; CSF 0.69**
8. 20/600 vs 3/90 mg/kg → **both TI 30; equal TI ≠ equal safety**

## Linked calculators

- `dose-response-curve-generator` — correct Hill curves on a log axis; lets a student draw an efficacy and a toxicity curve with different midpoints and steepness to see tail overlap. The link text says plainly that it draws Hill (log-logistic) curves, not the log-normal (probit) curves used for the safety-factor maths.
- **Rejected:** `therapeutic-index-calculator` — its "known drug" presets are therapeutic plasma ranges, not ED₅₀/TD₅₀ (exactly the confusion this guide warns against), and its "Safe"/"TDM required" bands are invented (docs/CALCULATOR_INVENTORY_AND_ACCURACY.md T1/T2).
- **Rejected:** `ed50-td50-ld50-calculator` — probit slope sign inverted, so slope/χ² are wrong; ED₅₀ copies LD₅₀; no TD₅₀ (Known Issue 15).
- **Rejected:** `emax-model-calculator` — labels 50–80% of effect a "Therapeutic range", which contradicts this guide.

## Required sources (registry ids)

- `rowland5` — Rowland and Tozer's Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications. 5th ed. Philadelphia: Wolters Kluwer; 2019. (Therapeutic window concept; reviewer to confirm coverage of TI.)

## Sources a reviewer must supply

- A **pharmacology textbook** defining TI, ED₅₀/TD₅₀/LD₅₀, quantal curves and the certain safety factor (for example Goodman & Gilman's The Pharmacological Basis of Therapeutics, Rang & Dale's Pharmacology, or Katzung's Basic & Clinical Pharmacology) — edition/year/publisher to be checked against the publisher's listing.
- A **pharmacology/toxicology source for the standard safety margin** definition ((LD₁ − ED₉₉)/ED₉₉ × 100), if the reviewer wants it cited.
- z₀.₉₉ = 2.3263 used for the log-normal tails is the standard normal quantile (computed with Python's `statistics.NormalDist`).
