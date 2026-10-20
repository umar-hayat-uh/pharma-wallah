# Virtual Labs

## Purpose
Change or extend the 3D Virtual Pharmacy Labs at `/virtual-labs` (built 2026-10-20; replaced the legacy
`/simulations` labs and `/compounding-lab`): four rooms, one complete experiment each — the experiment's
science, its mistakes and scoring, the three.js room, the bench panel, and the honesty labels (curriculum
status, asset licences, "simulated" wording).

## Trigger Examples
- "the titration assay comes out wrong when X" / "change the syrup formula"
- "add a mistake for not rinsing the pipette" / "the lab doesn't catch Y"
- "move the balance in the chemistry room" / "the burette looks wrong"
- "make the hot plate clickable" / "add a new piece of equipment"
- "a teacher reviewed the clove lab — mark it reviewed"
- "add a fifth lab / a second experiment" (read **Do Not** first)

## Read First
1. `src/lib/virtual-labs/engine/types.ts` then `engine/machine.ts` — the experiment contract and the run machine.
2. The experiment you are touching: `src/lib/virtual-labs/experiments/<lab>.ts` + `calculations/<lab>.ts`.
3. `src/components/virtual-labs/LabExperience.tsx` (one lab, start to finish) and `Viewport.tsx`.
4. `.claude/MEMORY.md` §8 gotchas **223–234** (this lab) and **219–220** (headless WebGL, `next/dynamic` refs).
5. The legacy lab principles still hold and are summarised under Architecture Context — `lab-simulation` is now
   only a redirect stub.

## Architecture Context
```
src/lib/virtual-labs/  (PURE — no React, no DOM, no three.js)
  catalog.ts           LAB_IDS (exactly 4) + LABS meta + labByPath()
  curriculum.ts        CURRICULUM: status + quoted syllabus sources per lab
  labels.ts            CURRICULUM_LABEL / CURRICULUM_TONE — shared by server AND client (no "use client")
  engine/types.ts      ExperimentDefinition<S, A>: meta, principle, safety, equipment, materials, steps,
                       questions, initial(seed), apply(s, a), stepComplete, benchComplete, observations, report
  engine/machine.ts    Run<S> + reduceRun(): act / undo / reset / hint / answer / submit; finalReport();
                       helpers ok/info/warn/refuse/mistake, rand(seed, …keys), round, fmt
  calculations/*.ts    the science: titration (citric acid, pKa model, assay), syrup (sucrose density table),
                       doseResponse (Hill equation, fit), microscopy (FOV, magnification, slide generator)
  experiments/*.ts     the four definitions + each one's `<lab>Visual(state)` for the room
  experiments/index.ts EXPERIMENTS: Record<LabId, ExperimentDefinition>
  progress.ts          ("use client") localStorage `pw-vlabs:v1` + quality pref `pw-vlabs:quality`
  assets/manifest.ts   ASSET_MANIFEST — every researched asset, used or rejected, with licence + decision

src/components/virtual-labs/
  labs/<Lab>Lab.tsx    3-line wrappers: LabExperience + Bench + visual (+ optional `extra` tab)
  LabExperience.tsx    phases briefing → lab → assessment → results; useReducer over reduceRun; tracking
  Viewport.tsx         next/dynamic(ssr:false) target; imports ONLY the current lab's room module
  three/runtime.ts     LabRuntime: renderer, quality tiers, walking + colliders, picking, focus tweens,
                       on-demand rendering, step markers, window.__vlab, full dispose
  three/rooms/*.ts     chemistry, pharmaceutics, pharmacology, pharmacognosy (+ helpers.ts RoomBuilder, TOP)
  three/{kit,glass,instruments,materials,textures}.ts   procedural furniture, glassware, instruments
  benches/*.tsx        the 2D control panel per lab (every 3D action lives here too) + instruments2d,
                       MicroscopeView (eyepiece canvas)
  interface/*.tsx      Briefing, LabHUD, ProcedurePanel, EquipmentPanel, ObservationSheet, Assessment,
                       LabResults, Overlays (dialogs, touch pad, prompts), ui (Btn, Section, Choice, ReadingField)
src/app/(site)/virtual-labs/   landing page + /<discipline>/<experiment>/page.tsx (server: metadata + JSON-LD)
```

### Invariants
- **Plain three.js only** — no React Three Fiber, no new 3D library. `Viewport` is loaded via
  `next/dynamic(..., { ssr: false })` and imports only its own room via `ROOMS[labId]()`. three.js must never be
  in a page's first load, and one lab never downloads another's room.
- **The experiment is pure and the room is dumb.** `apply()` is the only way state changes; out-of-order
  actions return the *same* state object plus an explanation (never throw). The room receives only a derived
  visual object (`titrationVisual(s)` etc.) through `RoomBuild.apply(visual)` and reports clicks back. Each room
  declares its own `<Lab>VisualLike` interface and casts `unknown` to it — **rename a visual field and nothing
  type-checks the room**; update both sides.
- **Every 3D action is also a bench-panel control.** The 2D lab (no WebGL, error fallback, "Switch to the 2D
  lab") and keyboard/screen-reader users complete the whole experiment from `benches/<Lab>Bench.tsx`.
  `LabExperience` dispatches `{ type: "inspect", id }` for any equipment selection, 3D or 2D, so every
  experiment must handle `inspect`.
- **Engine semantics (`reduceRun`)**: undo restores the bench but **keeps mistakes on the record**; a mistake id
  is **scored once** however often repeated; hints are **free** (counted, not penalised); answers **lock** on the
  first choice and only open once `benchComplete`; `submit` is refused until `benchComplete` and every question
  is answered. Rejected actions are not undo points. `finalReport`: technique = 100 − Σ mistake weights;
  overall = mean(technique, assessment %); grade bands 85/70/50.
- **Exactly four experiments.** `scripts/virtual-labs.test.mts` fails on a fifth (the brief forbade padding).
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
1. Edit `three/rooms/<room>.ts`. Place with `RoomBuilder.place/furniture/bench/island` (furniture adds a
   collider); bench height is `TOP` (0.91 m). Reuse `kit.ts` / `glass.ts` / `instruments.ts` parts.
2. If the room shows new state, add the field to the experiment's `<lab>Visual()` **and** the room's
   `<Lab>VisualLike`, and redraw it in `apply()`. Return `true` from `apply()` only while something animates
   (on-demand rendering).
3. Dispose anything you create in the room's `dispose()`.
4. Verify in headless Chrome (below) with `__vlab.focus(id)` screenshots.

### Make equipment interactive
1. The id must equal an `equipment[].id` in the experiment definition.
2. `r.interactive(id, label, object, { dir, dist, lift, target })` — **one Object3D per id**. If one model has
   several clickable parts, expose them (as the organ-bath rig's `parts` does) and register each part.
3. Add the matching control to the bench panel, and add the id to the relevant step's `focus` (the test checks
   `focus` ⊂ equipment ids). Step equipment is marked by the floating green chevron, not a glow.
4. If a later step needs a control from an earlier step, put a copy in the later step's `Section` too.

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
`docs/virtual-labs/*` (only `IMPLEMENTATION_PLAN.md` exists as of 2026-10-20; the curriculum mapping, asset
research/licences and experiment catalogue cited in code comments are not written yet), `src/lib/indexing.ts` + `src/app/sitemap.ts` (if routes change), `src/hooks/useTracker.ts`.

## Security Checks
- [ ] Nothing leaves the browser except `useTracker` events (`type: "virtual-lab"` activity on open/submit,
      `trackQuiz` with `quizId: "virtual-lab:<id>"`). Scores are self-paced practice, never presented as exam results.
- [ ] No API route, no service-role client, no `NEXT_PUBLIC_*` secret. Adding a server call → rate-limit it.
- [ ] `window.__vlab` stays camera-only (`stats`, `measure`, `focus`, `reset`) — never expose state or answers.
- [ ] Every shipped asset has a manifest row with licence, creator and decision; share-alike assets stay unmodified
      and credited where shown.

## Tests & Verification
```bash
node --test scripts/virtual-labs.test.mts   # 39 tests: catalogue (exactly 4), engine, every formula, each lab end to end
npx tsc --noEmit
```
Then drive it — rendering is not covered by the tests:
- Headless Chrome with software WebGL: `google-chrome --headless=new --enable-unsafe-swiftshader
  --use-angle=swiftshader`. `window.__vlab.stats()` / `measure(ms)` (draw calls, triangles, fps, load ms),
  `focus(id)` for close-up screenshots, `reset()`.
- Complete each lab through the **bench panel**, reading instruments from the rendered SVG/LCD the way a student
  would (never from state). Use `?seed=N` so runs are reproducible.
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
- **A control disappears** — a `Section` closes once its step is complete; a later step that needs the
  control must render it too (white tile in Titrate, gotcha 228).
- **A constant imported from a `"use client"` module into a server page** becomes a client-reference proxy
  (indexing it yields nothing useful) — keep shared constants in `labels.ts` (gotcha 229).
- **Visual field renamed on one side only** — room silently draws defaults (no type link through `unknown`).
- **Landing card images**: `page.tsx` loads `/images/virtual-labs/<id>.webp`; check they exist after any
  catalogue change (404 otherwise).

## Do Not
- Do not add React Three Fiber, drei, or another 3D/animation library; do not import `three` outside
  `src/components/virtual-labs/three/` or into anything a non-lab page loads.
- Do not add a fifth lab or a second experiment to a lab without the owner asking (the test enforces four).
- Do not compute a number in a bench component or a room — it belongs in `calculations/` or the experiment.
- Do not reveal a true reading before the student records it; do not make a 3D-only action.
- Do not raise a curriculum status, or call an asset approved, without evidence.
- Do not ship an image without a manifest row; do not modify the CC BY-SA clove photo.

## Update Project Knowledge
New gotcha → MEMORY §8; new file/route → PROJECT_MAP "Virtual Labs"; status change → ROADMAP "Virtual Labs";
test count change → CLAUDE.md §9 Tests row and this skill.
