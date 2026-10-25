# Virtual Labs

## Purpose
Change or extend the 3D Virtual Pharmacy Labs at `/virtual-labs` (built 2026-10-20; replaced the legacy
`/simulations` labs and `/compounding-lab`; **immersive upgrade 2026-10-21** — full-screen, equipment-driven,
Learning/Practical modes, sharper rendering, `docs/virtual-labs/UPGRADE_PLAN.md`): four rooms, one complete
experiment each — the experiment's science, its mistakes and scoring, its instrument controllers, the
three.js room, and the honesty labels (curriculum status, asset licences, "simulated" wording).

## Trigger Examples
- "the titration assay comes out wrong when X" / "change the syrup formula"
- "add a mistake for not rinsing the pipette" / "the lab doesn't catch Y"
- "move the balance in the chemistry room" / "the burette looks wrong"
- "make the hot plate clickable" / "add a new piece of equipment" / "add a control to the burette"
- "the lab is blurry / slow on my phone" / "Learning mode should point at X"
- "a teacher reviewed the clove lab — mark it reviewed"
- "add a fifth lab / a second experiment" (read **Do Not** first)

## Read First
0. **`.claude/skills/pharmawallah-virtual-labs/SKILL.md` — the owner's standard (2026-10-25)**: four rooms keyed by
   `DisciplineId`, Babylon.js as the target for all four, three shortlisted experiments per lab, a shared robotic
   tutor, waste routes, procedure status. It says what this skill's invariants must become; this skill says how.
1. `src/lib/virtual-labs/engine/types.ts` then `engine/machine.ts` — the experiment contract (incl. `ControllerDef`,
   `suggest`, `LabMode`) and the run machine (the equipment gate in `case "act"`).
2. The experiment you are touching: `src/lib/virtual-labs/experiments/<lab>.ts` (its `CONTROLLERS` and `suggest`) +
   `calculations/<lab>.ts`, and `benches/<Lab>Controls.tsx`.
3. `src/components/virtual-labs/LabExperience.tsx` (the immersive shell) and `Viewport.tsx`.
4. `.claude/MEMORY.md` §8 gotchas **223–234, 235–241** (this lab) and **219–220** (headless WebGL, `next/dynamic` refs).
5. The legacy lab principles still hold and are summarised under Architecture Context — `lab-simulation` is now
   only a redirect stub.

## Architecture Context
```
src/lib/virtual-labs/  (PURE — no React, no DOM, no three.js)
  catalog.ts           ROOM_IDS (the 4 rooms = DisciplineId) + ROOMS; EXPERIMENT_IDS + LABS meta per EXPERIMENT
                       (course label, seo, image, curriculum, optional `procedure` = method status/sources/
                       assumptions); roomOf(), experimentsIn(room), labByPath() (2026-10-25 split, MEMORY 248)
  curriculum.ts        CURRICULUM: status + quoted syllabus sources per lab
  labels.ts            CURRICULUM_LABEL / CURRICULUM_TONE — shared by server AND client (no "use client")
  engine/types.ts      ExperimentDefinition<S, A>: meta, principle, safety, equipment, materials, steps,
                       controllers (ControllerDef[]), questions, initial(seed), apply(s, a), suggest(s),
                       stepComplete, benchComplete, observations, report
  engine/machine.ts    Run<S> (+ mode, assessed, active, operated) + reduceRun(): act (GATED) / operate /
                       mode / undo / reset / hint / answer / submit; finalReport() (mode, hintPenalty);
                       controllersForAction, controllerForEquipment, HINT_COST/HINT_CAP; helpers
                       ok/info/warn/refuse/mistake, rand(seed, …keys), round, fmt
  calculations/*.ts    the science: titration (citric acid, pKa model, assay), syrup (sucrose density table),
                       doseResponse (Hill equation, fit), microscopy (FOV, magnification, slide generator)
  experiments/*.ts     titration, syrup, doseResponse, clove + each one's `<lab>Visual(state)` for the room
  experiments/pharmaceutics/  (2026-10-25, the owner's shortlist)
                       contract.ts   EQUIPMENT_PLAN (fixed vs stored→cabinet ids) + the Visual interfaces the
                                     Babylon room draws — written before both sides; change both together
                       common.ts     commonKit(cfg): cabinets (retrieve/return, per-cabinet `accepts`), sink/tap/
                                     rinse, 6 waste streams (wrong stream refused + mistake; hazardous→sink
                                     refused, weight 8; sink needs the tap running; `alsoOk` for over-cautious)
                       solutionPrep.ts, liquidProperties.ts, solubilityDissolution.ts — each embeds
                                     `bench: BenchCommon`, exports PROCEDURE (attached to LABS in index.ts)
  experiments/index.ts EXPERIMENTS: Record<ExperimentId, ExperimentDefinition>; attaches each PROCEDURE to LABS
  tutor.ts             RoboPharma's words, DERIVED from run + definition (no own step counter, no AI)
  progress.ts          ("use client") localStorage `pw-vlabs:v1` + quality pref `pw-vlabs:quality`
  assets/manifest.ts   ASSET_MANIFEST — every researched asset, used or rejected, with licence + decision

src/components/virtual-labs/
  labs/<Lab>Lab.tsx    3-line wrappers: LabExperience + controls (Record<controllerId, Component>) + visual
  LabExperience.tsx    phases briefing(+mode cards) → lab → assessment → results. The lab phase is a FIXED
                       full-viewport layer (z-70, 100dvh, page scroll locked, Fullscreen API on touch entry +
                       button), Viewport behind, chrome over it; pause on visibilitychange; insets → view offset
  Viewport.tsx         next/dynamic(ssr:false) target; loads the ROOM by discipline (roomOf), passing
                       `experiment` into the build context; BABYLON_ROOMS / ROOMS (three.js rollback)
  labs/LabLoader.tsx   ("use client") experiment id → its lab component, one next/dynamic chunk each
  tutor/               RoboPharma.tsx (original SVG, 4 moods) + TutorPanel.tsx (bottom-right, collapsible);
                       mounted for TUTOR_LABS (pharmaceutics) in LabExperience
  benches/pharmaceutics/  CommonControls (cabinet/sink/waste panels) + one controls file per experiment
  three/runtime.ts     LabRuntime: renderer, QUALITY tiers (pixel budget per tier, pixelRatioFor), walking +
                       colliders, picking, Q/E keyboard picking, focus tweens, setInsets (view offset),
                       setPaused, static shadow maps, on-demand rendering, step markers, one-time onSlow,
                       window.__vlab, full dispose
  three/rooms/*.ts     chemistry, pharmaceutics, pharmacology, pharmacognosy (+ helpers.ts RoomBuilder, TOP)
  three/{kit,glass,instruments,materials,textures}.ts   procedural furniture, glassware, instruments
  benches/<Lab>Controls.tsx  one panel per instrument controller (opened by selecting its equipment) +
                       instruments2d (scales, LCD, swatch), MicroscopeView (eyepiece canvas)
  interface/*.tsx      Briefing (mode cards), LabChrome (TopBar, ControllerDock = desktop dock / phone bottom
                       sheet, NextPrompt, InfoCard), controls (ActBtn, Hl, Group, HoldControl, ControlProvider),
                       ProcedurePanel (objectives; Learning vs Practical), EquipmentPanel (guide, "Show me"),
                       ObservationSheet, Assessment, LabResults, Overlays (dialogs, touch pad, prompts,
                       ControlGuide), ui (Btn, Section, Choice, ReadingField)
src/app/(site)/virtual-labs/   landing page (rooms → experiments by course) + ONE route
                       [discipline]/[experiment]/page.tsx (generateStaticParams from the catalogue; metadata from
                       LABS[id].seo). Adding an experiment never adds a route or a room.
```

### Invariants
- **Two engines (2026-10-22):** Pharmaceutical Chemistry (`acid-base-titration`) renders with **Babylon.js**
  (`src/components/virtual-labs/babylon/`, chosen by `BABYLON_LABS` in `Viewport.tsx`, owner's brief); the other three
  rooms stay on three.js. Both runtimes expose the same methods, so the shell, engine, controllers and automation are
  shared. `?engine=three` opens the original three.js chemistry room; `?engine=webgl|webgpu` forces Babylon's engine.
  Shared engine-neutral code lives in `quality.ts`, `vessel.ts`, `art/canvas.ts`. Read
  `docs/virtual-labs/BABYLON_MIGRATION.md` and MEMORY 242–247 before touching the Babylon room. **Babylon.js is now
  the target for all four rooms** (owner's standard, 2026-10-25, `pharmawallah-virtual-labs`): migrate one room per
  change, keep `?engine=three` until the new room is driven end to end, then remove the old one.
- **Plain three.js for the other rooms** — no React Three Fiber, no further 3D library. `Viewport` is loaded via
  `next/dynamic(..., { ssr: false })` and imports only its own room via `ROOMS[labId]()`. three.js must never be
  in a page's first load, and one lab never downloads another's room.
- **The experiment is pure and the room is dumb.** `apply()` is the only way state changes; out-of-order
  actions return the *same* state object plus an explanation (never throw). The room receives only a derived
  visual object (`titrationVisual(s)` etc.) through `RoomBuild.apply(visual)` and reports clicks back. Each room
  declares its own `<Lab>VisualLike` interface and casts `unknown` to it — **rename a visual field and nothing
  type-checks the room**; update both sides.
- **The experiment is done ON THE EQUIPMENT (2026-10-21).** Every action type except `inspect` belongs to at
  least one `ControllerDef`; selecting equipment dispatches `{type:"operate", equipment}` (and `inspect`), which
  opens that controller; `reduceRun` REFUSES an `act` unless one of the action's controllers is `run.active`
  (state unchanged, not counted, logged). There is no step-card bench and no "complete step" anywhere; the
  objectives list only reports `stepComplete`. "Show me" moves the camera, never selects.
- **Accessible routes select equipment too:** keyboard picking in the room (Q cycles what is in view, E uses
  it) and the 2D lab (bench-plan buttons; the no-WebGL fallback). Both open the same controllers. Do not add a
  list that operates instruments directly.
- **Learning vs Practical** share the room, engine and controllers. Learning: objective text, chevrons on the
  next instrument, "Next: open the …" + Show me, the suggested control ringed (from `suggest(s)`), how-to lines,
  free hints. Practical: none of that; hints cost `HINT_COST` (3) technique marks, capped at `HINT_CAP` (15).
  Learning → Practical only before the first action (else restart); Practical → Learning keeps the bench but
  `assessed` becomes false and the report says "practice". `suggest()` must never reveal a reading's value, an
  assessed decision, or "stop" during a titration — the tests check every state of every scripted run.
- **Engine semantics (`reduceRun`)**: undo restores the bench but **keeps mistakes on the record**; a mistake id
  is **scored once** however often repeated; hints are **free** (counted, not penalised); answers **lock** on the
  first choice and only open once `benchComplete`; `submit` is refused until `benchComplete` and every question
  is answered. Rejected actions are not undo points. `finalReport`: technique = 100 − Σ mistake weights;
  overall = mean(technique, assessment %); grade bands 85/70/50.
- **Rendering quality is a pixel budget, not a DPR cap** (`QUALITY` in `runtime.ts`): Balanced is the default
  on every device (Low only for Save-Data or ≤ 2 GB); a phone draws at 2×, not 1× (the old "blurry on mobile"
  fault). One automatic step down if the first 1.5 s draw < 18 fps and the student has not chosen a tier.
- **The catalogue is pinned per room** in `scripts/virtual-labs.test.mts`: Pharmaceutics = the owner's three
  (solution-preparation, liquid-properties, solubility-dissolution) + simple-syrup (kept, owner to decide); one in each
  other room. A new id needs the owner's shortlist (`pharmawallah-virtual-labs` §Shortlist).
- **An action field named `mode` is overwritten with the run's mode** by `reduceRun` — experiments use it to score
  worked solutions (free in Learning; in Practical only after a wrong attempt, costing marks). A panel cannot fake it.
- **No shadow maps** in either engine (MEMORY 249).
- **The student reads the instrument.** 2D instruments draw the true state and never print the value
  (`instruments2d.tsx`); recorded readings are checked against the truth within a tolerance.
- **Deterministic runs.** `rand(seed, …keys)`; `?seed=N` in the URL fixes the seed; the seed prints on the results.
- **Honesty labels are data.** Curriculum status in `curriculum.ts`; asset licences in `assets/manifest.ts`;
  methods are labelled illustrative/teaching values in code comments *and* on screen.

## Procedure

### Change an experiment's science
1. Change the formula in `calculations/<lab>.ts` (units explicit in the name/comment). Keep teaching constants
   in the experiment's `METHOD`/`EFFECT`/`MODEL` object with a comment saying they are teaching values.
2. Re-derive the expected numbers independently (by hand or Python) before touching UI.
3. Update the matching tests in `scripts/virtual-labs.test.mts` (normal, boundary, invalid, unit-sensitive) and
   the "careful student" end-to-end test for that lab.
4. If the change affects the report or observations, check `observations()` / `report()` print the new value
   with its source (`recorded` / `calculated` / `observed`).

### Add a mistake
1. In `apply()`, at the action where it happens, push
   `mistake("<stable-id>", <weight>, "<what you did>", "<what it does to the result>")`. The consequence must say
   the *direction* of the error (high/low/erratic).
2. If it has a physical effect, carry it in state so the result actually moves (e.g. `EFFECT.unrinsedBuretteDilution`).
3. Add a test: drive the run with the mistake, assert it is recorded once and the result moves the right way.
4. Weights are out of 100 for technique — compare with the lab's existing weights (2–10).

### Adjust a room
0. Pharmaceutical Chemistry: edit `babylon/chemistry.ts` (+ `babylon/apparatus.ts`, `babylon/kit.ts`) — same ids,
   `TitrationVisualLike`, `interactive(list, id, …)`, `dyn()` for anything that moves or changes (else the static
   merge bakes it), `casters` for shadows. Verify cheaply without `next dev`: bundle a tiny entry with the repo's
   esbuild binary, serve it, and screenshot over CDP (MEMORY 242–247; never attach to a guessed debugging port).
1. Other rooms: edit `three/rooms/<room>.ts`. Place with `RoomBuilder.place/furniture/bench/island` (furniture adds a
   collider); bench height is `TOP` (0.91 m). Reuse `kit.ts` / `glass.ts` / `instruments.ts` parts.
2. If the room shows new state, add the field to the experiment's `<lab>Visual()` **and** the room's
   `<Lab>VisualLike`, and redraw it in `apply()`. Return `true` from `apply()` only while something animates
   (on-demand rendering).
3. Dispose anything you create in the room's `dispose()`.
4. Verify in headless Chrome (below) with `__vlab.focus(id)` screenshots.

### Make equipment interactive / add a control
1. The id must equal an `equipment[].id` in the experiment definition.
2. `r.interactive(id, label, object, { dir, dist, lift, target })` — **one Object3D per id**. If one model has
   several clickable parts, expose them (as the organ-bath rig's `parts` does) and register each part.
3. Put the id in a `ControllerDef.equipment` (or it is inspect-only and shows an info card), and add the
   action's `type` to that controller's `actions`. Add the button to `benches/<Lab>Controls.tsx` as an
   `ActBtn` (or `HoldControl`); wrap reading fields/forms in `<Hl type="…">` so Learning mode can ring them.
4. Extend `suggest()` if the new action is part of the correct sequence, and add the id to the step's `focus`.
5. Controllers render in a phone bottom sheet (~390 × ≤ 58 % of the screen): put what the hand is on first
   (the burette shows the stopcock first once the initial reading is taken), keep labels short.

### Raise a curriculum status
Only with evidence, by the person who did the check the status names. `source_verified` = the practical is in
the quoted syllabus document (all four are, as printed: UoK PHC-607, PHT-402, PHL-612, PHG-411). `faculty_reviewed`
needs a **named** reviewer and their review recorded (docs/virtual-labs/CURRICULUM_MAPPING.md, `bylines.ts`
pattern). Then: update `curriculum.ts` (status + summary — remove "Not faculty-reviewed"), update the test that
asserts no lab is `faculty_reviewed`, and the landing page's "none has yet been reviewed by faculty" sentence.
Never raise a status to make a card look better.

## Files Usually Involved
`src/lib/virtual-labs/**`, `src/components/virtual-labs/**`, `src/app/(site)/virtual-labs/**`,
`scripts/virtual-labs.test.mts`, `public/models/virtual-labs/**` (textures, HDRI, clove photo),
`docs/virtual-labs/*` (UPGRADE_PLAN, ARCHITECTURE, ASSET_RESEARCH, ASSET_LICENSES, CURRICULUM_MAPPING,
EXPERIMENT_CATALOG, TESTING, IMPLEMENTATION_PLAN, REMOVED_LEGACY_SIMULATIONS), `src/lib/indexing.ts` + `src/app/sitemap.ts` (if routes change), `src/hooks/useTracker.ts`.

## Security Checks
- [ ] Nothing leaves the browser except `useTracker` events (`type: "virtual-lab"` activity on open/submit,
      `trackQuiz` with `quizId: "virtual-lab:<id>"`). Scores are self-paced practice, never presented as exam results.
- [ ] No API route, no service-role client, no `NEXT_PUBLIC_*` secret. Adding a server call → rate-limit it.
- [ ] `window.__vlab` stays camera-only (`stats`, `measure`, `focus`, `reset`, `where`, `moving`) — never expose state or answers.
- [ ] Every shipped asset has a manifest row with licence, creator and decision; share-alike assets stay unmodified
      and credited where shown.

## Tests & Verification
```bash
node --test scripts/virtual-labs.test.mts   # catalogue (exactly 4), engine, equipment gate/bypass, modes, every formula, each lab end to end
npx tsc --noEmit
```
Then drive it — rendering is not covered by the tests:
- Headless Chrome with software WebGL: `google-chrome --headless=new --enable-unsafe-swiftshader
  --use-angle=swiftshader`. `window.__vlab.stats()` / `measure(ms)` (draw calls, triangles, fps, load ms),
  `focus(id)` for close-up screenshots, `reset()`.
- Complete each lab by **tapping its equipment in the canvas** — `__vlab.where(id)` gives a screen point that
  actually hits the object, `__vlab.moving()` says the camera is still flying (wait for false: software WebGL
  draws ~1 frame/s, so "two equal samples" is not "settled"), `__vlab.focus(id)` is "Show me" — then operate its
  controller, reading instruments from the rendered SVG/LCD/swatch (never from state). `?seed=N` for repeats.
  Set `localStorage["pw-vlabs:quality"]` to fix a tier (otherwise SwiftShader triggers the one-time step-down).
- At 1440 and 390 px; 2D mode too (Pause → "Switch to the 2D lab"). Assert no console errors, no overflow
  (compare `scrollWidth` with the emulated width — MEMORY 221), results page reached. Read the screenshots.
- First cold dev compile of a lab route takes ~45 s; a `ChunkLoadError` on `app/layout` then is not a code fault —
  reload once warm.
- Check `npm run build` output: three.js only in lazy chunks, the lab pages' first load unchanged.
Lint is not configured — say so.

## Common Failure Modes
- **Two ids on one Object3D** — the second registration overwrites `userData.labId` on every mesh, so picking
  returns the wrong id (gotcha 225).
- **A glow on glass** — emissive tint on transparent materials reads as coloured glass and on dark metal is
  invisible; `setGlow` skips transparent materials and steps use the chevron sprite (gotcha 226).
- **Camera flights that never finish on a slow device** — tweens must advance on `min(rawDt, 0.25)`, not the
  0.05-clamped motion `dt` (gotcha 227).
- **A bypass sneaks back** — any UI that dispatches `act` without the instrument open is refused by the engine
  (good), but a new action type left out of every `ControllerDef` is unreachable: the test driver throws for it.
- **The drawing disagrees with the engine** — the titration flask blended pink in below the engine's faint-pink
  threshold, so students who stopped at the first lasting pink were marked "stopped early" (gotcha 238). An
  instrument must show a change exactly when the engine counts it.
- **A constant imported from a `"use client"` module into a server page** becomes a client-reference proxy
  (indexing it yields nothing useful) — keep shared constants in `labels.ts` (gotcha 229).
- **Visual field renamed on one side only** — room silently draws defaults (no type link through `unknown`).
- **Landing card images**: `page.tsx` loads `/images/virtual-labs/<id>.webp`; check they exist after any
  catalogue change (404 otherwise).

## Do Not
- Do not add React Three Fiber, drei, or another 3D/animation library; do not import `three` outside
  `src/components/virtual-labs/three/`, or `@babylonjs/*` outside `src/components/virtual-labs/babylon/` (Viewport
  only via dynamic `import()`), or either into anything a non-lab page loads. The tests enforce the Babylon half.
- Do not add a fifth lab. Do not add an experiment that is not on the owner's recorded shortlist
  (`pharmawallah-virtual-labs` §Shortlist; the test enforces four until then).
- Do not compute a number in a bench component or a room — it belongs in `calculations/` or the experiment.
- Do not reveal a true reading before the student records it; do not add a control that operates an
  instrument without it being selected (no step cards, no "complete step"); do not let Learning mode point
  at an answer.
- Do not raise a curriculum status, or call an asset approved, without evidence.
- Do not ship an image without a manifest row; do not modify the CC BY-SA clove photo.

## Update Project Knowledge
New gotcha → MEMORY §8; new file/route → PROJECT_MAP "Virtual Labs"; status change → ROADMAP "Virtual Labs";
test count change → CLAUDE.md §9 Tests row and this skill.
