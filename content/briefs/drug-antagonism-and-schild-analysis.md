# Content brief — Drug Antagonism: Competitive, Non-Competitive and Schild Analysis

- **Slug:** `drug-antagonism-and-schild-analysis`
- **Draft:** `src/lib/guides/content/drug-antagonism-and-schild-analysis.ts` (status: draft, 2026-10-13)
- **Target keyword:** schild plot pA2 competitive antagonism

## Purpose

The Schild plot is a standard Pharm-D pharmacology practical, and students regularly plot log r instead of log(r − 1), use nM in the logarithm, or call pA₂ pK_B when the slope is not 1. This guide classifies antagonism (receptor, physiological, chemical), shows what each receptor antagonist does to EC₅₀ and Emax, derives the dose ratio r = 1 + [B]/K_B, and walks through a full Schild analysis with a least-squares fit. It treats non-competitive and uncompetitive antagonism as **different** (simple models: non-competitive lowers Emax with EC₅₀ unchanged; uncompetitive lowers both). All drugs and constants are illustrative.

## Outline

- H2 Types of antagonism — receptor, physiological, chemical; table (effect of each type on EC₅₀/Emax); callout on receptor reserve
- H2 Competitive antagonism and the dose ratio — Schild equation; Example 1 (r = 10); Gaddum-form effect equation
- H2 The Schild plot: measuring K_B and pA₂ — log form; procedure list; Example 2 (three-point fit, slope 0.97, pA₂ 9.36); Example 3 (single dose ratio); callout "when the slope is not 1"
- H2 Non-competitive and uncompetitive antagonism — simple non-competitive model + Example 4; simple uncompetitive model + Example 5
- Common mistakes (8) · Practice (8) · Limitations (4) · References · Related tools

## Practice questions (answers verified in Python)

1. K_B 5 nM, [B] 40 nM, EC₅₀ 0.2 µM → **r 9; EC₅₀′ 1.8 µM**
2. [B] 100 nM, r 11 → **K_B 10 nM; pK_B 8.0**
3. K_B 4 nM, wanted r 5 → **[B] 16 nM**
4. Non-competitive K_B 2 nM, [B] 6 nM → **Emax 25%; EC₅₀ unchanged 0.5 µM**
5. r 2.6/17/165 at 3/30/300 nM → **slope 1.005; pA₂ 8.72 (K_B ≈ 1.9 nM)**
6. pA₂ 7.5, [B] 1 µM → **r ≈ 32.6**
7. Agonist EC₅₀ 1 µM at 10 µM, [B] = 4 K_B → **90.9% alone; 66.7% with antagonist**
8. [B] 50 nM, K_B 10 nM, EC₅₀ 2 µM → **new EC₅₀ 12 µM; Emax still reachable**

## Linked calculators

- `dose-response-curve-generator` — correct Hill curves; a student can plot the agonist alone and again with EC₅₀ × r (competitive) or a lowered Emax (non-competitive). No antagonist maths of its own, so nothing for it to get wrong.
- **Rejected:** `antagonism-simulator` — non-competitive `1 − [B]/([B]+K_B)` and uncompetitive `K_B/(K_B+[B])` are algebraically identical, so both modes return the same number and the uncompetitive left shift is not modelled (redesign tracker, recorded fault). It would contradict this guide's uncompetitive section.

## Required sources (registry ids)

- `iupacGoldBook` — International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book'). (Definition of equilibrium/dissociation constants only — nothing in the registry covers receptor pharmacology.)

## Sources a reviewer must supply

- A **pharmacology textbook** covering competitive/non-competitive/uncompetitive antagonism, the dose ratio and the Schild plot (for example Rang & Dale's Pharmacology, or Kenakin's pharmacology texts) — edition/year/publisher to be confirmed from the publisher's listing.
- The **original Schild-plot paper** (Arunlakshana O and Schild HO, British Journal of Pharmacology and Chemotherapy) and Schild's earlier description of pA values — full citations to be checked before adding to `references.ts`.
- The uncompetitive model in the draft is presented as a teaching analogy with uncompetitive enzyme inhibition; the reviewer should confirm that framing against their chosen textbook.
