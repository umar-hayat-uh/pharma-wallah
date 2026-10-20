# Lab Simulation

> **Redirect stub (2026-10-20).** The legacy `/simulations` labs (hub, titration, buffer, dilution, disk diffusion,
> UV, staining, organic ID, lab guide) and `/compounding-lab` were **removed on 2026-10-20**, together with
> `src/components/Simulations/DiskDiffusion/`, `DilutionLab/` and `ExtemporaneousCompoundingLab.tsx`. They were
> replaced by the 3D Virtual Pharmacy Labs at `/virtual-labs`. The procedure this skill held no longer applies to
> any code in the repo.

## Purpose
Point a session that asks for "the simulations" at the skill that covers what exists now.

## Trigger Examples
- "upgrade the titration simulation" / "the simulations hub" / "the compounding lab"
- anything mentioning `/simulations/<lab>` or `src/components/Simulations/DiskDiffusion/`

## Read First
- **`.claude/skills/virtual-labs/SKILL.md`** — the four 3D labs (acid–base titration, Simple Syrup, dose–response,
  powdered clove microscopy): pure experiment engine, three.js rooms, bench panels, curriculum statuses.
- **`.claude/skills/pharmacy-counter/SKILL.md`** — the Community Pharmacy Simulation Lab (`/pharmacy-counter`,
  `src/components/Simulations/CommunityPharmacy/`), which was **not** removed.
- The antibiogram simulator (`/antibiogram-simulator`) also remains; no skill covers it.

## Procedure
1. Do not recreate a `/simulations` page or restore the deleted components; check the redirects for the old URLs
   before linking to them.
2. For a lab request, follow the `virtual-labs` skill. The principles from the old disk-diffusion rebuild (pure
   model, the student measures, gate on state not a counter, every drag has a non-drag route, mistakes teach and
   the run continues, score technique not outcome, thresholds as sourced configuration, seeded determinism) are
   carried there.
3. The old components are recoverable from git history (`git log -- src/components/Simulations/DiskDiffusion`)
   if the owner ever asks for one back.

## Update Project Knowledge
If a legacy URL needs a new redirect, record it in `.claude/PROJECT_MAP.md` → "Virtual Labs".
