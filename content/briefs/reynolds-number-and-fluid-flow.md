# Content brief: Fluid Flow in Pharmaceutical Processing: Reynolds Number and Flow Regimes

- **Slug:** `reynolds-number-and-fluid-flow`
- **Draft file:** `src/lib/guides/content/reynolds-number-and-fluid-flow.ts` (meta.review.status = "draft"; not listed, not in the sitemap)
- **Target keyword:** Reynolds number calculation laminar turbulent flow
- **Status:** Draft written 2026-10-13. Needs author and reviewer details, and the sources below, before publication.

## Purpose

Teach the Reynolds number for pipe flow in consistent SI units (including cP and L/min conversions), the conventional laminar/transitional/turbulent regimes and why the limits are approximate, the stirred-tank form of Re, and Darcy friction factors — 64/Re for laminar flow and the Blasius correlation only within its valid range (smooth pipes, roughly 4000 < Re < 10⁵), with the Moody chart / Colebrook for everything else. This directly corrects the fault recorded against `reynolds-number`, which applies Blasius in the transitional band and above 10⁵.

## Outline

- Introduction
- Key terms
- H2: What the Reynolds number compares
  - H3: Example 1: Water in a process pipe
  - H3: Example 2: Glycerin in the same pipe
- H2: Getting the units right: viscosity and velocity from flow rate
  - H3: Example 3: From a flow rate to Re
- H2: Flow regimes in a pipe
  - H3: Example 4: One impeller, two liquids
- H2: Friction factor and pressure drop
  - H3: Example 5: Laminar flow of a viscous syrup
  - H3: Example 6: Turbulent flow within the Blasius range
- H2: Why the regime matters in processing
- H2: Common mistakes
- H2: Practice questions
- H2: Limitations
- H2: References

## Practice questions (with answers)

1. **Q:** Ethanol (ρ = 789 kg/m³, μ = 1.2 × 10⁻³ Pa·s) flows at 0.8 m/s through a pipe of 20 mm internal diameter. Find Re and the regime.
   **A:** Re ≈ 10,520: turbulent.
   Working: D = 0.020 m. Re = 789 × 0.8 × 0.020 ÷ 0.0012 = 12.624 ÷ 0.0012 = 10,520. Above about 4000, so turbulent.

2. **Q:** An oil (ρ = 920 kg/m³, μ = 0.29 Pa·s) flows at 1.2 m/s in a 50 mm pipe. Find Re and the regime.
   **A:** Re ≈ 190: laminar.
   Working: D = 0.050 m. Re = 920 × 1.2 × 0.05 ÷ 0.29 = 55.2 ÷ 0.29 = 190.3. Below about 2000, so laminar.

3. **Q:** A dilute aqueous solution (ρ = 1000 kg/m³, μ = 1.0 cP) flows at 0.05 m/s through 10 mm tubing. Find Re.
   **A:** Re = 500: laminar.
   Working: μ = 1.0 cP = 0.001 Pa·s; D = 0.010 m. Re = 1000 × 0.05 × 0.010 ÷ 0.001 = 500.

4. **Q:** Water (ρ = 998 kg/m³, μ = 1.002 × 10⁻³ Pa·s) flows in a 15 mm pipe. Below what mean velocity is the flow laminar, taking Re = 2000 as the limit?
   **A:** About 0.134 m/s.
   Working: Rearrange Re = ρvD/μ: v = Re × μ ÷ (ρ × D). v = 2000 × 0.001002 ÷ (998 × 0.015) = 2.004 ÷ 14.97 = 0.1339 m/s.

5. **Q:** Water (ρ = 998 kg/m³, μ = 1.002 × 10⁻³ Pa·s) flows at 10 L/min through a pipe of 20 mm internal diameter. Find v and Re.
   **A:** v ≈ 0.531 m/s; Re ≈ 10,570 (turbulent).
   Working: Q = 10 ÷ 1000 ÷ 60 = 1.667 × 10⁻⁴ m³/s. A = π × 0.020² ÷ 4 = 3.142 × 10⁻⁴ m². v = 1.667 × 10⁻⁴ ÷ 3.142 × 10⁻⁴ = 0.5305 m/s. Re = 998 × 0.5305 × 0.020 ÷ 0.001002 = 10,570.

6. **Q:** Flow in a pipe has Re = 800. What is the Darcy friction factor?
   **A:** f = 0.08.
   Working: Re is below about 2000, so the flow is laminar and f = 64 ÷ Re. f = 64 ÷ 800 = 0.08.

7. **Q:** Estimate the friction factor for smooth-pipe flow at Re = 20,000. What would you do instead at Re = 3000?
   **A:** f ≈ 0.0266 at Re = 20,000; at Re = 3000 no single correlation is reliable.
   Working: Re = 20,000 lies within the Blasius range (about 4000 to 10⁵) for a smooth pipe. f = 0.316 × 20,000^(−0.25) = 0.316 ÷ 11.89 = 0.02657. Re = 3000 is in the transitional band. Blasius does not apply there, and the flow may be laminar or turbulent; state that the regime is uncertain rather than quoting one f.

8. **Q:** A liquid with kinematic viscosity 1.0 × 10⁻⁶ m²/s flows at 2 m/s in a 50 mm pipe. Find Re. Is the Blasius equation appropriate?
   **A:** Re = 1.0 × 10⁵; this is at the upper edge of the Blasius range, so use the Moody chart or Colebrook equation for a reliable f.
   Working: Re = v × D ÷ ν = 2 × 0.05 ÷ 1.0 × 10⁻⁶ = 100,000. Blasius is fitted only up to about 10⁵ for smooth pipes, so this value is at its limit; for real roughness or higher Re it should not be used.

## Linked calculators

- `reynolds-number` (Reynolds Number Calculator) — Computes Re = ρvD/μ in SI units and names the regime with the same 2000/4000 conventions as this guide. Use it for Re and the regime only: it also applies the Blasius friction factor in the transitional band and above 10⁵, where the friction section explains Blasius does not hold.

## Required sources (from src/lib/content/references.ts)

- `aulton6` — Aulton ME, Taylor KMG, editors. Aulton's Pharmaceutics: The Design and Manufacture of Medicines. 6th ed. Edinburgh: Elsevier; 2022.
- `bipmSI` — Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019.

Each textbook above is cited for a topic the reviewer should confirm against the edition named (chapter not checked by us; no page numbers given).

## Sources a reviewer must supply

- A chemical- or pharmaceutical-engineering text covering Reynolds number, the Darcy–Weisbach equation, Hagen–Poiseuille, the Blasius correlation and its range, and the Moody chart / Colebrook equation (for example Coulson and Richardson's Chemical Engineering Vol. 1, or McCabe, Smith and Harriott, Unit Operations of Chemical Engineering). Not in the registry; edition and year must be checked.
- A source for stirred-tank Reynolds number regime limits, if the reviewer wants numbers added (the draft deliberately gives none).
- A source for the fluid property values used (water at 20 °C, glycerin, ethanol, SAE 30 oil); the draft uses the same round values as the calculator's presets and calls them illustrative.
- The draft cites `aulton6` on the understanding that Aulton's Pharmaceutics has a fluid-flow chapter; the reviewer must confirm this.

## Calculators deliberately not linked

- `mixing-time-estimator` — recorded fault: mixing time 60× too long.
- `heat-transfer-area` — recorded fault: unit selector does nothing.
- `drying-rate` — recorded fault: page freezes when initial = final moisture.
- `reynolds-number` is linked for Re and the regime only (Re = ρvD/μ in SI, 2000/4000 thresholds checked in code); its friction factor is not to be trusted outside 4000–10⁵, and the link text says so.

## Verification note

Every number in the draft's examples, tables and practice answers was computed with python3 on 2026-10-13. Values are illustrative and are not product limits, validated processes or dosing advice.
