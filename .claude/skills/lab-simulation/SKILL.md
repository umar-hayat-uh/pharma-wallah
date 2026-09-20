# Lab Simulation

## Purpose
Build or upgrade one of the interactive laboratory simulations under `/simulations` so the student
**performs** the procedure rather than watching it, and so the experiment's behaviour can be reasoned
about separately from how it is drawn.

## Trigger Examples
- "upgrade the <X> lab simulation"
- "make the titration sim interactive"
- "add a lab guide to <X>"
- "the simulation just animates, the student doesn't do anything"

## Read First
1. `src/components/Simulations/DiskDiffusion/` — the reference implementation (2026-09-20). Read
   `engine.ts` and `useLabMachine.ts` before any component.
2. `.claude/MEMORY.md` §8 gotchas **120–126** — every one was found by driving this page in a browser.
3. `.claude/skills/frontend-ui-conventions/SKILL.md` — tokens, motion, icons.
4. The lab you are changing. The other seven are still **single files** of 600–1,600 lines
   (`src/app/(site)/simulations/<lab>/page.tsx`); only disk diffusion has been split.

## Architecture Context

### The shape that works
```
<Lab>/
  types.ts              stage union, domain types
  data.ts               everything a teacher would change: specimens, reagents, criteria, guide prose
  engine.ts             PURE. no React, no DOM. the model and every rule that produces a number
  use<Lab>Machine.ts    useReducer: state + what is allowed + the teaching feedback
  illustrations.tsx     the guide's SVG diagrams
  equipment.tsx         glassware and hardware, reused across stages
  <Apparatus>.tsx       the one surface the experiment happens on
  TheorySection.tsx     Principle · Materials · Lab Guide · Interpretation · Safety
  LabGuide.tsx          illustrated stepper
  stages.tsx            one control panel per stage
  <Lab>Workspace.tsx    layout, pointer interaction, timed processes
  Results/Completion    output, scored on technique
  report.ts             jsPDF, imported LAZILY
  <Lab>Lab.tsx          shell: view + mode + progress tracking
```

### Non-negotiables learned the hard way
- **The model is pure.** `engine.ts` imports no React and touches no DOM. If a number the student sees
  cannot be traced to a function there, it is in the wrong place.
- **Work in real units.** The apparatus SVG's viewBox should make one user unit one millimetre (or one
  mL), so "24 mm apart" in the rule, in the geometry and on screen are the same number. Export **one**
  screen→unit conversion and use it for both the SVG's own pointer events and anything dragged in from
  outside it.
- **The student measures; the lab does not.** Never display the true value before the student records
  a reading. Check the *manner* of the measurement, not only the number — the disk-diffusion calliper
  verifies the line passes through the disk centre, which is how "a chord, not a diameter" is caught.
- **Gate stages on prerequisites, not on a step counter.** `stageComplete()` / `stageUnlocked()` derive
  from the state itself, so a student can never measure a plate they did not inoculate — in guided
  *or* free-practice mode. Modes differ in how much is said, not in what is allowed.
- **Every drag needs a non-drag route.** Buttons that perform the same action (sweep at 0°/60°/120°,
  tap-to-place, calliper nudge and centre). These pages are used on phones, and drag-only excludes
  keyboard and assistive-technology users entirely. Verify the whole procedure is completable with the
  keyboard alone.
- **Mistakes teach and the experiment continues.** Each wrong choice produces a specific explanation of
  what it does to the result. Do not block, do not deduct points theatrically.
- **Score technique, not the outcome.** A resistant isolate, a failed synthesis or a wide endpoint is a
  correct result. Scoring the outcome teaches students to chase the "nice" answer.
- **State any threshold as configuration with a source.** Interpretive criteria, reference ranges and
  acceptance limits are guideline-, specimen- and condition-dependent. Keep them in `data.ts`, name the
  system wherever a result is shown, and let "no criteria for this pair" be a real answer rather than
  inventing a number. See `INTERPRETATION_SYSTEMS` in `DiskDiffusion/data.ts`.
- **Deterministic, not identical.** Vary results with a hash of (seed, specimen, reagent) rather than
  `Math.random()`, and print the seed in the summary and the report so a run is reproducible.
- **No new dependencies.** framer-motion, lucide-react, Tailwind brand tokens, jsPDF. Import jsPDF with
  `await import("jspdf")` so it does not land in the page's first load.

### Illustrations
Draw them; do not ship images. One `<Figure>` wrapper with a fixed viewBox, a light bench ground, brand
blue/green for anything meaningful and grey for apparatus. `role="img"` plus a `<title>` carrying the
step's `illustrationAlt` — the diagram holds real information, so it must survive a screen reader.

## Procedure
1. Read the existing lab end to end and list what it already does. Preserve the clinical cases, the
   artwork, the questions and the report — those are content, and content is expensive.
2. Write `types.ts` and `data.ts` first. If a fact is a teaching value rather than a measurement, say so
   in a comment *and* in the interface.
3. Write `engine.ts` and check its numbers by hand before any UI exists.
4. Write the machine. Enumerate stages explicitly; derive `stageComplete` from state.
5. Build Theory + Lab Guide, then the stages, then measurement, then results.
6. Wire `useTracker()` in the shell — an activity row on open and on completion, `trackQuiz` for any
   knowledge check. Never a raw fetch (see `progress-tracking`).
7. Delete what you replaced, including data modules nothing imports any more.

## Files Usually Involved
- `src/components/Simulations/<Lab>/`, `src/app/(site)/simulations/<lab>/page.tsx`
- `src/app/(site)/simulations/page.tsx` — the hub card's description is a promise; keep it true.
- `src/hooks/useTracker.ts`

## Security Checks
- [ ] No service-role client, no `NEXT_PUBLIC_*` secret — these are client components.
- [ ] Nothing the student enters is sent anywhere; the whole experiment is local state.
- [ ] Any AI or API call from a simulation must be rate-limited and authenticated (the orphaned
      `/api/scan-colonies` is the cautionary tale — CLAUDE.md Known Issue 17).

## Tests & Verification
```bash
npx tsc --noEmit
# a peer may hold the dev server; two next processes on one root destroy .next (gotcha 126).
# copy the tree to a scratch dir, symlink node_modules, copy .env, run there:
cp -r <repo> $SCRATCH/iso && ln -s <repo>/node_modules $SCRATCH/iso/node_modules
cd $SCRATCH/iso && npx next dev -p <free port>
```
Then **drive it**, do not read it. Headless Chrome over CDP, at 1440, 768 and 390, with synthetic touch
on the narrow widths, completing the entire experiment. Assert: every gate blocks; every rule produces
its explanation; the measuring tool reads the true geometry; no horizontal overflow at any stage; zero
console errors. Then **look at the screenshots** — on this page they caught a lawn rendering as a grid
of squares, a label collision and touch targets too small to hit, none of which any assertion saw.

Harness traps (all cost real time here): `innerText` applies `text-transform`, so an `uppercase`
heading will not match its source string; `globals.css` sets `scroll-behavior: smooth`, so poll the
element rect until two reads agree before dispatching a synthetic tap; and CDP's `dispatchKeyEvent`
only performs a key's default action when the event carries `text` (`"\r"` for Enter).

**No test framework covers the simulations, and `npm run lint` does not run.** Say so.

## Common Failure Modes
- **Shipping an animation and calling it a simulation.** If the student's only verb is "Next", stop.
- **Revealing the answer before the student measures it.**
- **A sticky panel inside a grid item with `items-start`** — no travel, scrolls away silently (gotcha 120).
- **`onPointerDown` selecting and `onClick` toggling the same control** — a real tap does both and they
  cancel out; a mouse-only scripted `.click()` will not catch it (gotcha 121).
- **Hit-testing before checking selection state** — "place this here" becomes "drag that away" (gotcha 122).
- **Side effects inside a `setState` updater** (gotcha 103) and **non-functional updates** when several
  actions can land in one tick.
- Presenting a threshold as universal when it belongs to one guideline, organism and condition.

## Do Not
- Do not add a dependency, a second animation library, or a black ground (§6 rules 13, 15).
- Do not restart or kill a dev server you did not start — check `ListAgents` and ask.
- Do not commit; the protocol forbids it unless the user asks.

## Update Project Knowledge
Add the lab's files to `.claude/PROJECT_MAP.md`, a §8 work-log entry to `CLAUDE.md`, and any trap that
cost you time to `MEMORY.md` §8. If you split another single-file simulation into this shape, say so
here so the next session knows which labs are already converted.
