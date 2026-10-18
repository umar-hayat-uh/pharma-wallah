# Osteology Lab

## Purpose
Change or extend the Virtual Osteology & Arthrology Lab (`/osteology-lab`): bone and joint content, the
Z-Anatomy 3D assets, the spotting/exam question engine, the viewer, progress.

## Trigger Examples
- "add the skull / mandible / a cervical vertebra to the osteology lab"
- "a landmark is in the wrong place on the 3D model"
- "change the mock exam to 25 stations"
- "the joint viewer doesn't highlight X"
- "add specimen photographs to spotting"

## Read First
1. `src/lib/osteology/types.ts` — the content shape, and what `zName` means.
2. `scripts/osteology/README.md` — the asset pipeline, step by step.
3. `.claude/MEMORY.md` gotchas 213–220.

## Architecture Context
```
content (bones/*.ts, joints/*.ts) ──┐
                                    ├─ registry.ts ──► pages (server) ──► BoneExplorer / JointExplorer (client)
Z-Anatomy .blend ─export-zanatomy.py─► public/models/osteology/*.glb + generated/models.json (anchors, parts)
                 └render-spotting.py─► renders ─hash-images.mjs─► public/images/osteology/spotting/<hash>.webp
                                                                  + generated/spotting-images.json (server-only)
questions.ts (deterministic from filter+seed) ◄─ token.ts (HMAC) ◄─ /api/osteology/{session,check,submit}
```
- **3D markers are sourced, never estimated.** A landmark gets a marker only if its `zName` equals a Z-Anatomy
  label name in that bone's `models.json` entry (plus `mesh` for group models). No zName → "text only".
- **The answer key never leaves the server before answering.** `questions.ts`/`spotting-images.ts` are imported
  only by route handlers, server pages and tests. Image files are content-hashed because ids name answers.
- **Progress needs no schema change** (MEMORY 217).

## Procedure
### Add a bone (or a joint)
1. Find its Z-Anatomy object names: run `export-zanatomy.py`'s inventory approach or search the names in the
   blend (README "Facts"). Add a spec line to `scripts/osteology/zanatomy-specs.json`.
2. Re-export (README step 1). Check the printed `missing []` and the landmark list for the new model.
3. Write `src/lib/osteology/bones/<slug>.ts` (or `joints/`), using only `REFERENCES` ids; set `zName` only to
   exact names from `models.json`. Add one line to `registry.ts`.
4. Add its views to `BONE_VIEWS`/`JOINT_VIEWS` in `render-spotting.py`; render it alone (`PW_ONLY=<slug>`),
   then `node scripts/osteology/hash-images.mjs`.
5. Have the content fact-checked by a second reader (a separate pass found 33 errors in the first draft).
6. `node --test scripts/osteology.test.mts` (update the 22/17 counts), `npx tsc --noEmit`, load the page.

### Change exam settings
Edit `EXAM_PRESETS` in `src/lib/osteology/exam-config.ts`. The test "every exam preset can fill its stations"
fails if a preset asks for more stations than its pool has.

### A marker looks wrong
It is Z-Anatomy's point. Check `offMm` in `models.json`; open the model in the lab and rotate. If Z-Anatomy is
wrong, remove the `zName` (the landmark becomes text-only) — never hand-place coordinates.

## Files Usually Involved
`src/lib/osteology/*`, `src/components/osteology/*`, `src/app/(site)/osteology-lab/*`, `src/app/api/osteology/*`,
`scripts/osteology/*`, `scripts/osteology.test.mts`, `src/lib/content/references.ts`, `src/lib/indexing.ts`,
`src/app/sitemap.ts`.

## Security Checks
- [ ] No client component imports `questions.ts`, `spotting-images.ts`, `token.ts` or `server.ts`.
- [ ] `toPublic()` output has no `answer`/`explanation`/`topic`.
- [ ] Exam scoring happens only in `/api/osteology/submit`; history is written there, never from the client.
- [ ] `/api/osteology/*` stay behind `osteologyLimiter`.

## Tests & Verification
```bash
node --test scripts/osteology.test.mts      # 17 tests: content, zNames, GLB node names, assets on disk, engine, grading, token
npx tsc --noEmit
```
Then headless Chrome with software WebGL (MEMORY 219): a bone page (model loads, a landmark flies into view),
a joint page (select a ligament, hide the capsule), spotting (check → feedback), an exam (refresh → resume → end
early → results), at 390 px and 1440 px.

## Common Failure Modes
- Every `/api/osteology/*` call 409s after a deploy — the question pool changed; expected for in-flight papers.
- A `zName` typo — the test names the bone and label.
- A dev server 500 "`__webpack_modules__[moduleId] is not a function`" — corrupted `.next` cache (MEMORY 71/126):
  stop the server, `rm -rf .next`.

## Do Not
- Do not use X-ray images for spotting, or any image without a recorded licence.
- Do not present exam presets as a university's official format.
- Do not add `@react-three/fiber` or other 3D libraries — plain `three` is enough and already installed.

## Update Project Knowledge
New bone/joint → counts in CLAUDE.md §7 and the test; new gotcha → MEMORY; pipeline change → README.
