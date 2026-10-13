# Content brief — Dose–Response Curves, Emax, EC50 and Receptor Binding

- **Slug:** `dose-response-and-receptor-binding`
- **Draft:** `src/lib/guides/content/dose-response-and-receptor-binding.ts` (status: draft, 2026-10-13)
- **Target keyword:** dose response curve EC50 Emax explained

## Purpose

Students meet EC₅₀, Emax, the Hill coefficient and Kd in separate lectures and often merge them (potency vs efficacy, Kd vs EC₅₀, IC₅₀ vs Ki). This guide builds one picture: the graded log dose–response curve, the sigmoid Emax (Hill) equation and its rearrangement for "concentration for p% of Emax", potency comparison with pEC₅₀, receptor occupancy from Kd (and Kd = koff/kon), and IC₅₀ → Ki by Cheng–Prusoff. All drugs are "Drug A…", all constants illustrative; no dose or real-drug value is stated.

## Outline

- H2 Reading a graded dose–response curve — linear vs log axis; potency vs efficacy; callout "potency is not better"
- H2 The sigmoid Emax (Hill) equation — formula; Example 1 (effect at 3 × EC₅₀); rearranged formula; Example 2 (n = 1 vs n = 2, C for 90%); table (% Emax at multiples of EC₅₀)
- H2 Comparing potency with pEC₅₀ — formula; Example 3 (pEC₅₀ and potency ratio)
- H2 Receptor binding and occupancy — Kd = koff/kon; occupancy formula; Example 4; callout "occupancy is not effect"
- H2 From IC₅₀ to Ki: Cheng–Prusoff — formula; Example 5
- Common mistakes (8) · Practice (8) · Limitations (5) · References · Related tools

## Practice questions (answers verified in Python)

1. Emax 100%, EC₅₀ 10 µM, n 1: effect at 5 and 30 µM → **33.3%; 75%**
2. pEC₅₀ of EC₅₀ 2.5 nM → **8.60**
3. Kd 1.5 nM: occupancy at 0.5 and 4.5 nM → **25%; 75%**
4. EC₅₀ 20 nM: C for 80% Emax, n = 1 and n = 2 → **80 nM; 40 nM**
5. E₀ 10, Emax 60, EC₅₀ 2 µM, C 6 µM → **55 units**
6. IC₅₀ 150 nM, [L*] 4 nM, Kd* 2 nM → **Ki 50 nM**
7. kon 4 × 10⁵ M⁻¹s⁻¹, koff 1.2 × 10⁻³ s⁻¹ → **Kd 3 nM; pKd 8.52**
8. pEC₅₀ 8.2 vs 6.9 → **≈ 20-fold (19.95) more potent; efficacy cannot be judged from pEC₅₀**

## Linked calculators

- `dose-response-curve-generator` — `_curves.ts` implements E = E₀ + Emax·Cⁿ/(EC₅₀ⁿ + Cⁿ) exactly; log axis now spans 0.01 × min EC₅₀ to 100 × max EC₅₀ (the earlier display bug is gone); "concentration for 90%" = EC₅₀ × 9^(1/n), correct. Its preset buttons carry real-drug names with values from the original page; the guide does not rely on them.
- `drug-receptor-binding-affinity-tool` — Kd path: occupancy = [L]/(Kd + [L]) and bound = Bmax·[L]/(Kd + [L]), correct. Link text tells students to use the **Kd field**. Known issues off that path: the IC₅₀ mode uses the same [L] field both as the radioligand concentration in Cheng–Prusoff and as the test drug concentration; affinity bands are the tool's own and its reference-drug labels sit one band off its own thresholds.
- **Rejected:** `emax-model-calculator` — Hill maths is correct, but every result carries a band that compares the *absolute* effect with fixed 50%/80% and labels 50–80% "Therapeutic range" (wrong when Emax ≠ 100 or E₀ ≠ 0, and an invented clinical label).

## Required sources (registry ids)

- `rowland5` — Rowland and Tozer's Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications. 5th ed. Philadelphia: Wolters Kluwer; 2019. (Pharmacodynamics / Emax model; the registry's `supports` line mentions PK only — reviewer to confirm the chapter.)
- `iupacGoldBook` — International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book'). (Equilibrium/dissociation-constant definitions.)

## Sources a reviewer must supply

- A **pharmacology textbook** covering receptor theory, potency/efficacy, spare receptors and the Hill equation (for example Rang & Dale's Pharmacology, or Goodman & Gilman's The Pharmacological Basis of Therapeutics) — edition, year and publisher to be confirmed from the publisher's listing before adding to `references.ts`.
- The **original Cheng–Prusoff paper** (Cheng and Prusoff, Biochemical Pharmacology), if the reviewer wants it cited directly — full citation to be checked.
- An IUPHAR (International Union of Basic and Clinical Pharmacology) terminology source for EC₅₀/pEC₅₀/Kd, if wanted.
