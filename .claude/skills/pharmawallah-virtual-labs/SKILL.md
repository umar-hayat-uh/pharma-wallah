---
name: pharmawallah-virtual-labs
description: The owner's standard for PharmaWallah's virtual pharmacy labs — four existing rooms (pharmaceutics, pharmaceutical-chemistry, pharmacognosy, pharmacology), Babylon.js as the target engine, experiments registered into a room (never a new room), one shared robotic tutor that reads the engine's state, real equipment, honest science and licences, and exactly three shortlisted experiments per lab. Use whenever working on virtual labs, experiment procedures, 3D apparatus, the robotic tutor, course-to-lab mapping, or laboratory simulations — together with the `virtual-labs` skill, which holds the code-level how-to.
---

# PharmaWallah Virtual Labs — the standard

## Purpose
The owner's standard for every virtual-lab task (2026-10-25), adapted to what the repo actually contains.
`BRIEF.md` is the owner's text, verbatim. This file is that text reconciled with the code: what it means here,
what already meets it, what does not yet, and what to do first.

**Two skills, one feature. Use both.**
- **This skill**: *what* a finished lab must be, and the order of work toward it.
- **`virtual-labs`**: *how* the code works (pure engine, run machine, controllers, rooms, verification in
  headless Chrome, gotchas). Read it before you change a file.

If the two disagree, this standard sets the goal and the `virtual-labs` invariants set how to get there safely.
Change the `virtual-labs` skill so they agree again. Don't quietly ignore either one.

## Trigger Examples
- "add the second / third experiment to the pharmaceutics lab" / "implement the shortlist"
- "move the pharmacology lab to Babylon" / "migrate the remaining rooms"
- "build the robot tutor" / "the tutor should point at the burette"
- "which lab does Physical Pharmacy / haematology / organic identification go in?"
- "add waste disposal to the titration" / "mark this procedure as verified"
- any `/virtual-labs` work, together with `virtual-labs`

## Read First
1. `BRIEF.md`, once, in full.
2. `.claude/skills/virtual-labs/SKILL.md`: the architecture, the invariants and the verification procedure.
3. `docs/virtual-labs/BABYLON_MIGRATION.md` (the one migrated room is the template for the other three) and
   `docs/virtual-labs/CURRICULUM_MAPPING.md` (where the HEC 2025 and UoK sources are already quoted, page by page).
4. `.claude/MEMORY.md` §8 gotchas 223–247.
5. `git status --short` and `ListAgents`. Peer sessions have worked in this tree at the same time before.

## The four labs — the identifiers to use
The brief's lab IDs are **exactly** the repo's existing `DisciplineId` type in `src/lib/virtual-labs/engine/types.ts`:
`pharmaceutical-chemistry | pharmaceutics | pharmacology | pharmacognosy`. Use that type as the lab ID. Don't invent
a second one.

**Trap:** in the code today, `LabId` (`catalog.ts`) is the **experiment** id (`acid-base-titration`, …), not the
room. It works only because each lab has exactly one experiment. `ROOMS`/`BABYLON_LABS` in `Viewport.tsx`,
`CURRICULUM`, the `labs/<X>Lab.tsx` wrappers and the per-experiment `page.tsx` files are all keyed by it.

Course → lab assignment (the brief's examples; a course name is a catalogue label, never a room):

| Course / topic | Runs in |
| --- | --- |
| Physical Pharmacy, dispensing, compounding, dosage forms | `pharmaceutics` |
| Pharmaceutical analysis, organic compound identification, inorganic/medicinal chemistry | `pharmaceutical-chemistry` |
| Plant microscopy, powder microscopy, crude-drug identification, phytochemical tests | `pharmacognosy` |
| Pharmacology, **and** haematology and cardiovascular physiology simulations (the owner's decision for this project) | `pharmacology` |

If a course fits two labs, ask. Don't pick one silently, and never add a fifth room.

## Where the standard meets the code (audited 2026-10-25)

| Standard | State in the code | Implication |
| --- | --- | --- |
| Four rooms, experiments registered into them | Four rooms, but 1 experiment each, keyed by experiment id | Split **room (`DisciplineId`)** from **experiment id** before adding a second experiment (Procedure A) |
| No new room/route per experiment | Each experiment has its own static `page.tsx` + `labs/<X>Lab.tsx` + `ROOMS` entry | Move to one registry-driven route `/virtual-labs/[discipline]/[experiment]` with `generateStaticParams`. **Keep every existing URL**, because they are in the sitemap and indexed |
| Babylon.js for all four | Only `pharmaceutical-chemistry` (2026-10-22). The other three are on three.js | Migrate one room at a time (Procedure B). This standard is the owner's go-ahead, so the old "don't migrate without asking" rule no longer applies |
| Exactly three shortlisted experiments per lab (12) | 4 in total. `scripts/virtual-labs.test.mts` "exactly four labs and exactly four experiment definitions" pins it | **The shortlist is not in the repo.** Get it from the owner (see Shortlist). Then change that test to pin the shortlist, not delete it |
| Typed, validated registration | `ExperimentDefinition` + `LabMeta` cover the id, title, objectives, equipment, materials (`hazard?`), steps (`hints`, `focus`, `safety?`), controllers, questions and report. The "every definition is complete" test validates them | **Missing:** prerequisites; course/category label separate from the discipline; consumables vs reagents; **waste disposal** (no experiment has any); references per procedure; assumptions; **procedure verification status**. Add these as typed fields with test validation. Don't put them in prose |
| Verified / referenced simulation / proposed | `CurriculumStatus` (`proposed / source_verified / faculty_reviewed / published`) says whether the practical **appears in a syllabus**, not whether the **method** is verified | These are two separate questions. Add a separate `procedureStatus: "verified" \| "referenced_simulation" \| "proposed"` with its sources. Don't overload `CurriculumStatus` |
| Robotic tutor reading real state | **None.** Learning mode has `suggest(s)`, step `hints`, the "Next:" prompt, chevrons, "Show me" and `Feedback` (mistakes with consequences) | Build the tutor **on these**, not beside them (Procedure C) |
| Real equipment, not "Next" cards | **Met** since 2026-10-21. The engine refuses any `act` unless that instrument's controller is open, and the bypass tests prove it | Every new experiment must meet the same bar, with its own bypass tests |
| Guided Learning / Practical Assessment | `LabMode` = Learning / Practical. Hints cost marks in Practical | Keep the names in code. The tutor's hint ladder follows the mode (Procedure C) |
| Quality tiers, lazy loading, cleanup, error states | Pixel-budget tiers in `quality.ts`, rooms loaded with `next/dynamic` + `import()`, `dispose()`, WebGL fallback (2D lab), on-demand rendering | Babylon rooms must reuse the same `quality.ts` and runtime method set |
| Lint / integration tests | **Lint is not configured** (`npm run lint` opens a setup prompt). There are no integration tests. Unit tests are `node --test`. Behaviour is checked by driving headless Chrome | Report "lint: not configured". Never report lint or integration tests as passing |
| Asset licence manifest | `src/lib/virtual-labs/assets/manifest.ts` + `docs/virtual-labs/ASSET_LICENSES.md`, checked by a test | Add a manifest row for every new external asset, Poly Haven CC0 included |

## Shortlist
**Pharmaceutics (owner, 2026-10-25, verbatim):** 1. Pharmaceutical Solution Preparation & Dilution. 2. Physical
Properties of Liquids — density/specific gravity, viscosity, and surface tension. 3. Solubility & Dissolution Studies.
Physical Pharmacy is a course label inside this lab. Not decided: whether Simple Syrup stays as a fourth module or goes
(it is not on the list — ask). Science core for all three: `calculations/pharmaceutics.ts` (tested). Tutor: RoboPharma
(`tutor/`, `lib/virtual-labs/tutor.ts`), mounted for `pharmaceutics` only via `TUTOR_LABS` in `LabExperience.tsx`.

**Other three labs: not yet recorded.** No list of "three experiments per lab" exists in the repo, the docs or MEMORY. Before
implementing any experiment beyond the current four:
1. Ask the owner for the approved shortlist (12 titles, 3 per lab). Ask whether the four existing experiments
   count toward their lab's three.
2. Record it **verbatim** here and in `docs/virtual-labs/EXPERIMENT_CATALOG.md`, with the date.
3. Never fill a gap with a plausible experiment of your own. "Exactly three" is a cap as well as a target.

## Procedure

### Before any edit (the brief's §2, done concretely)
```bash
git status --short && git log --oneline -5
grep -n '"@babylonjs\|"three"' package.json         # @babylonjs/core 9.30.0 (exact), three ^0.185
sed -n 40,60p src/components/virtual-labs/Viewport.tsx   # BABYLON_LABS + ROOMS: which room uses which engine
node --test scripts/virtual-labs.test.mts          # baseline: 65 pass, 0 fail (2026-10-22) — re-measure
```
List the files the task owns and the shared ones (`LabExperience.tsx`, `engine/*`, `quality.ts`, `catalog.ts`).
Say which shared files you are taking before you edit them.

### A. Add an experiment to an existing lab (needs the shortlist)
1. **One-time refactor (do it first, on its own, and verify it):** add `ExperimentId`. Re-key the room loader by
   `DisciplineId`, so one room module serves every experiment in its lab and loads that experiment's equipment
   and visual. Key `EXPERIMENTS`/`LABS`/`CURRICULUM` by `ExperimentId`, each with exactly one `lab: DisciplineId`.
   Replace the four static pages with one registry-driven dynamic route. **The existing experiment ids, URLs,
   `pw-vlabs:v1` progress keys and `trackQuiz` ids (`virtual-lab:<id>`) must not change.** Students' progress
   is stored under them. Check: all 65 existing tests pass, the four URLs return 200, and each lab still
   completes end to end in headless Chrome.
2. Extend the schema with the missing fields (table above) and make the completeness test reject what the brief
   lists: duplicate ids, unknown lab id, missing steps, a step with no controller path, missing safety or
   waste metadata, a formula with no unit-checked test.
3. Write the experiment the way the `virtual-labs` skill describes: pure `calculations/<x>.ts`
   (numbers re-derived independently first), `experiments/<x>.ts` with controllers, `suggest`, mistakes that move
   the result, and questions. Then the room's equipment and its controller panels.
4. Hazardous steps get a **safety gate** (the engine refuses the action until PPE, the fume hood or the right
   container is in place) and a **simulated waste route** with a typed destination: labelled waste
   container, neutralise then container, sharps, biohazard. **No hazardous waste ever goes to the sink**, in an
   action, a hint or a tutor line. Test both the gate and the route.
5. Tests: careful-student run, every mistake, bypass attempts, `suggest()` safety, the gate, the waste route.
   Then complete it in headless Chrome at 1440 and 390 px touch by tapping the equipment.

### B. Migrate a room to Babylon.js
Follow `docs/virtual-labs/BABYLON_MIGRATION.md`. `babylon/chemistry.ts` + `kit.ts` + `apparatus.ts` are the pattern.
One room per change, in its own verifiable stage. Add the lab to `BABYLON_LABS` and keep `?engine=three` working
until the Babylon room has been driven end to end and the owner has seen it. Only then remove the three.js room.
Remove three.js itself (and its test and gotchas) when the last room has moved. One engine and one render loop
per scene: the runtime owns `runRenderLoop`, and the room never starts its own. Low-end Android budget: merged
static meshes, thin instances, render-once shadows, no point lights, HDRI only on Balanced/High (MEMORY 242–247).

### C. The robotic tutor (one, shared by all four labs)
- **It is a view of the run, not a second state machine.** Its inputs: `run` (state, mode, `active` controller, log),
  `def.suggest(s)`, `def.steps` (`objective`, `hints`, `focus`, `safety`), the latest `Feedback` (mistake + consequence),
  `stepComplete`, `finalReport`. No step counter of its own. If it needs a fact the engine does not expose, add
  that fact to the experiment definition.
- **Points at real things:** it uses the runtime's existing highlight and `focus(id)` ("Show me") for equipment.
  For controls, it uses the `Hl` ring Learning mode already draws. It never selects or operates anything for the student.
- **Content is the reviewed definition text**, rendered deterministically. An AI model (Gemini, the project's only
  provider: `ai-gemini-integration` skill, the 5-requests-per-minute free-tier ceiling of Known Issue 0c, and a
  rate limit) may only **rephrase** the text given to it. It must never produce a procedure, a quantity, an
  observation or a safety instruction. The tutor must work fully with no AI call at all.
- **Mode:** Learning may give worked solutions and point to the next control. Practical gives hints only on request,
  costs `HINT_COST` per hint as now, and never reveals an answer before the student has attempted it.
  Everything `suggest()` must never reveal, the tutor must never reveal either. The existing `suggest()` tests are
  the model for the tutor's tests.
- **Layout:** a compact, collapsible panel that fits the existing `ControllerDock` / phone bottom sheet. It must
  never cover the operated instrument. `setInsets` exists to keep that instrument visible.
- **The robot model:** procedural or a licensed asset with a manifest row, lazy and cheap. It must not cost the
  low-end phone budget.

### D. Scientific integrity and assets
- Sources: HEC Pharm-D 2025 (URL and page numbers already in `curriculum.ts`), UoK syllabus PDFs, pharmacopoeias,
  and named texts. Say "appears in the UoK syllabus as printed", never "prescribed by the University of Karachi".
- Teaching constants are labelled teaching values, in code and on screen. Simulated data says "simulated".
  Physiology readings are never presented as patient data.
- `faculty_reviewed` and `procedureStatus: "verified"` each need a named person and a recorded review.
- Assets: verify every licence individually, even Poly Haven's. Prefer procedural Babylon models. Label
  schematic illustrations as schematic.

## Completion — what "done" means
A practical is done only when its procedure, equipment interactions, state transitions, calculations,
feedback, tutor guidance and results work **end to end**, by tapping the equipment, on desktop and phone. A room
that looks right but cannot be completed is a mockup, not a finished experiment.

```bash
node --test scripts/virtual-labs.test.mts   # plus every other suite you touched (CLAUDE.md §9)
npx tsc --noEmit                            # 0 errors
npm run build                               # stop any dev server first; Babylon/three only in lazy chunks
```
Then complete the experiment in headless Chrome as the `virtual-labs` skill describes. Report the brief's five items
inside the protocol's Report: **files changed · experiments implemented · verification sources and assumptions ·
tests run with their real results (lint: not configured) · remaining limitations**, including "not tested on a
real phone/GPU" while that is true.

## Do Not
- Do not create a room, engine or page per course, semester or experiment. Do not add a fifth lab.
- Do not implement an experiment that is not on the owner's recorded shortlist, or more than three per lab.
- Do not change existing experiment ids or URLs (progress, sitemap and indexed pages depend on them).
- Do not let the tutor keep its own step state, operate equipment, or say anything not in the reviewed definition.
- Do not rip out a three.js room before its Babylon replacement has been driven end to end.
- Do not route hazardous waste to a sink. Do not imply that the simulation authorises real, unsupervised lab work.
- Do not raise a curriculum or procedure status without a named person's evidence.

## Update Project Knowledge
Shortlist received → record it here and in `EXPERIMENT_CATALOG.md`. Schema, room-keying or engine change →
`virtual-labs` skill (Architecture Context and Invariants), PROJECT_MAP "Virtual Labs", ROADMAP "Virtual Labs".
New test count → CLAUDE.md §9 and both skills. New trap → MEMORY §8.
