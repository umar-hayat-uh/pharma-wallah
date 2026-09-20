# Pharmacy Counter

## Purpose
Change the Community Pharmacy Simulation Lab at `/pharmacy-counter` — add a case, a medicine, a
clinical check or a workflow stage — without breaking the one thing that makes it teach: the student
performs the checks, and the simulation never tells them the answer first.

## Trigger Examples
- "add a case to the pharmacy counter"
- "add a medicine to the shelf"
- "the counter lets you dispense past the allergy"
- "the debrief scores X wrongly"
- anything under `src/components/Simulations/CommunityPharmacy/`

## Read First
1. `src/components/Simulations/CommunityPharmacy/index.ts` — the file map, in one screen.
2. `engine/flow.ts` and `useCounterMachine.ts` — stage gating and the reducer, before any component.
3. `.claude/MEMORY.md` §8 gotchas **137–141** — all five were found building this page.
4. `.claude/skills/lab-simulation/SKILL.md` — the sibling pattern (disk diffusion). Same split, same
   non-negotiables.

## Architecture Context

```
CommunityPharmacy/
  types.ts                 every domain type
  data/constants.ts        risk bands, frequencies, the TEN checks and their concern lists,
                           the NINE verification lines, counselling topics, the 18 red flags
  data/medicines.ts        31 products: strengths, packs, batches' source data, allergy classes,
                           therapeutic classes, interaction tags, aux labels, 8 counselling topics
                           (points + distractors), a monograph
  data/patients.ts         10 fictional patients
  data/scenarios.ts        10 cases — AND THE ANSWER KEY (`findings`)
  engine/*.ts              PURE. no React, no DOM. 47 unit tests run against these
  useCounterMachine.ts     the reducer: the whole encounter
  <screens, modules, css>  presentation only
```

### Non-negotiables

- **The answer key is gated in exactly one place.** `case "record-check"` in `useCounterMachine.ts`
  pushes a finding's id onto `state.revealed`. Nothing else may read `scenario.findings` to display
  it — `visibleFindings`, `ChecksModule` and `InterventionPanel` all filter on `revealed`. If you add
  a surface that shows findings, filter it too, or the case becomes an acknowledgement exercise.
- **`engine/evidence.ts` draws the line between evidence and the answer.** Class lists, doses, dates
  and the patient's own record are shown, because that is what a real DUR screen shows. A product's
  *contraindications* are deliberately NOT inlined into the age and contraindication checks — the
  student is pointed at the reference desk instead, because going to look it up is the habit.
- **Stages gate on state, never on a counter.** `stageComplete()` in `engine/flow.ts` derives from
  the state itself. Add a stage by adding it to `stageFlow()`, `stageComplete()` and `STAGE_COPY` —
  three places, all data.
- **A stage whose work is "read this" needs `dispatch({ type: "see" })`** from the shell's effect, or
  its primary action does nothing (gotcha 140).
- **Never set `panel` when the stage changes.** A non-null panel renders a modal; doing it on
  `advance` popped a dialog over the workstation at every step (gotcha 139).
- **Mistakes raise a review, not a failure.** `ReviewNotice` names what to re-check and leaves the
  student able to fix it. Scoring runs on the state at submission, so a corrected error costs
  nothing — that is intended.
- **Blocking findings must stay blocking.** `unresolvedBlockers()` gates `fill-tray` and the
  advance out of `selection`. Only `contact-prescriber` and `refuse-supply` resolve one.
- **No `Math.random()`.** Shelf order, dialogue order and WWHAM order come from `engine/rng.ts`
  seeded by `seedFor(templateId, caseNumber)`; the seed is printed in the debrief.
- **No drags.** Everything is a button or an input, so the encounter is keyboard-completable and
  works on a phone. Do not add one.
- **Score technique, not outcome.** Refusing to supply is a correct outcome; so is finding nothing
  wrong. A competency the case did not exercise gets `max: 0` and is left out of the mean.

## Procedure

### Adding a case
1. Add the patient to `data/patients.ts` (or reuse one). Allergy `classes` and current medicines'
   `therapeuticClasses` / `interactionTags` are what the checks match on — never the printed name.
2. Add a `ScenarioTemplate` to `data/scenarios.ts`: `kind`, `tier`, `brief` (no spoilers),
   the prescription or the `otc` block, `decoyMedicineIds` (include the look-alike), and `dialogue`.
3. Write `findings`. Each one needs a `checkId`, a `concernId` **that exists in that check's
   `concerns` list in `constants.ts`**, an `itemId` when it belongs to one item, a `severity`, an
   `action` and a `learningPoint`. `blocksDispensing: true` only for things that must not be
   supplied at all.
4. Run the tests — the first two assert exactly this integrity, and a bad `concernId` would
   otherwise make the finding permanently unfindable.

### Adding a medicine
Every product needs all eight counselling topics with **at least one correct statement and one
distractor** each (a test asserts it), plus `allergyClasses`, `therapeuticClasses`,
`interactionTags`, `auxLabels` and a `reference` block. Batches are generated from the id, so the
shelf is stable — add the id to `EXPIRED_BATCH_PRODUCTS` or `LOW_STOCK_PRODUCTS` in
`engine/inventory.ts` to give it a date problem.

### Adding a check
`CHECK_SPECS` in `constants.ts` (label, question, howTo, concerns) **and** a branch in
`evidenceFor()`. `VERIFICATION_SPECS` is a separate list — nine attestations, each needing a truth
in `verificationTruths()`.

## Files Usually Involved
- `src/components/Simulations/CommunityPharmacy/**`
- `src/app/(site)/pharmacy-counter/page.tsx`
- `scripts/pharmacy-counter.test.mts`
- `src/components/Layout/Header/Navigation/menuData.tsx` — the nav entry ("Pharmacy Counter")

## Security Checks
- [ ] Client component: no service-role client, no `NEXT_PUBLIC_*` secret.
- [ ] The whole encounter is local state — do not add an API route or an AI call to it. If you ever
      do, it must be authenticated and rate-limited (Known Issue 17 is the cautionary tale).
- [ ] `localStorage` reads and writes stay in try/catch — private browsing throws.

## Validation
- Every calculator returns `null` rather than a figure it cannot justify.
- Paediatric rules print that they are approximations superseded by a licensed weight-based dose.
- Creatinine clearance is labelled as such, not as eGFR.
- Every risk marker prints its **word**, not just a colour (`RiskChip`).

## Tests & Verification
```bash
npx tsc --noEmit                              # baseline 0
node --test scripts/pharmacy-counter.test.mts # baseline 47 pass
```
Then **drive it**. A peer usually holds the dev server, and two `next dev` on one root destroy
`.next` (gotcha 126), so copy the tree to a scratch dir, symlink `node_modules`, copy `.env`, and
run there on a free port. Walk the whole encounter at **1440, 768 and 390** with touch emulation on
the phone, plus the OTC path, the blocked path and reduced motion.

**Then look at the screenshots.** On this page they caught a modal over every stage, a label
rendering white-on-black, a red primary action and the phone leading with the wrong panel — none of
which any assertion saw.

Harness traps that cost time here: `textContent`, not `innerText` (gotcha 123); CDP `Enter` needs
`text: "\r"` (gotcha 125); zsh does not word-split unquoted variables in a `for` loop (gotcha 141).

**No component test framework exists, and `npm run lint` does not run.** Say so.

## Common Failure Modes
- **Showing a finding before a verdict is recorded** — the single worst thing you can do here.
- **Inlining a product's contraindications into the contraindication check** — it removes the lookup.
- **Adding a `concernId` that is not in the check's list** — the finding becomes unfindable. The
  tests catch it; run them.
- **Opening a drawer from the reducer on a stage change** (gotcha 139).
- **A `[]`-deps effect needing a ref on a conditionally rendered screen** (gotcha 138).
- **`<pre>` rendering as a dark code block** — `globals.css` styles it site-wide (gotcha 137).
- **Reinstating XP, levels, stars or a countdown.** They were removed deliberately; a timer on a
  safety check teaches the opposite of the lesson. If the user wants them back, that is their call.

## Do Not
- Do not add a dependency, a second animation library, a drag interaction, or a black ground.
- Do not "correct" a case's clinical content without saying so — it is unreviewed teaching material
  (CLAUDE.md §7 Known Issue 19), and changing a dose silently changes what a finding means.
- Do not commit unless the user asks.

## Update Project Knowledge
New files go in `.claude/PROJECT_MAP.md`. A new trap goes in `MEMORY.md` §8 and in Common Failure
Modes above. If you add cases, update the count in `CLAUDE.md` §7 and §8.
