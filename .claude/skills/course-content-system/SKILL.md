# Course Content System

## Purpose
Add or fix course subjects, units, and lesson markdown — including converting the nine unregistered
subject files into the shape the registry can consume.

## Trigger Examples
- "add the hospital pharmacy subject"
- "register the remaining subjects"
- "this unit page 404s"
- "add a unit to biochemistry"
- "the lesson content isn't rendering"

## Read First
- `src/lib/courses/types.ts` — `SubjectMeta` and `CourseUnit`, the only shapes that matter.
- `src/lib/courses/registry.ts` — `SUBJECTS`, `getSubject()`, `getUnit()`, `getSemesters()`.
- `src/lib/courses/subjects/biochemistry.ts` — the reference implementation.

## Architecture Context

```
src/lib/courses/
  types.ts          SubjectMeta, CourseUnit               ← the contract
  registry.ts       SUBJECTS[] + lookups                  ← THE registry
  content.ts        markdown loading
  subjects/         14 files — only 4 are registered
src/actions/lesson.ts        "use server" — reads a .md file from disk, converts to HTML
public/content/<subject>/<unit>.md     69 lesson files, already deployed
src/content/<semester>/<subject>/*.md  a second, smaller tree used by src/actions/lesson.ts
```

Routes: `/courses` → `/courses/[subjectSlug]` → `/courses/[subjectSlug]/[unit]`.
`getUnit()` returns `{ subject, unit, prevUnit, nextUnit, index }`, which drives navigation.

### The central problem — read before starting
**`SUBJECTS` registers only 4 of 14 subject files**, and the unregistered ones come in two flavours:

| File | Shape | Status |
| --- | --- | --- |
| `biochemistry.ts`, `physiology.ts`, `physical-pharmacy.ts`, `pharmaceutical-organic-chemistry.ts` | `SubjectMeta` | ✅ registered |
| `natural-toxins.ts` | `SubjectMeta` | correct shape, **just not in the array** |
| 9 × `*-data.ts` | `*_META` + `*Units` + `*_DIFF_BADGE` triplet | **incompatible; dead code** |

The nine are: `advanced-pharmacognosy-data`, `hospital-pharmacy-data`, `industrial-pharmacy-data`,
`industrial-pharmacy-2-data`, `natural-toxins-data`, `organic-chemistry-data`,
`pharmaceutical-analysis-data`, `pharmaceutical-technology-data`, `systemic-pharmacology-3-data`.

**Their markdown already ships in `public/content/`** — the content is written and deployed; only
the wiring is missing. This is `ROADMAP.md`'s Recommended Next Feature.

## Procedure

### Registering a subject that is already in `SubjectMeta` shape (do this first)
```ts
// src/lib/courses/registry.ts
import { naturalToxinsSubject } from "./subjects/natural-toxins";

export const SUBJECTS: SubjectMeta[] = [
  biochemistrySubject,
  physiologySubject,
  physicalPharmacySubject,
  pharmaceuticalOrganicChemistrySubject,
  naturalToxinsSubject,          // ← added
];
```
Then verify every `contentFile` resolves — see Validation. **Ship this one first** to prove the
whole path end to end before converting the nine.

### Converting a `*-data.ts` file
1. Read the file's `*_META` and `*Units` exports.
2. Write a new export in `SubjectMeta` shape, mapping:
   - `*_META` → `slug`, `semesterSlug`, `semester`, `title`, `subjectCode`, `icon`, `description`, `gradient`
   - each `*Units` entry → a `CourseUnit`: `id` (the URL slug), `title`, `shortTitle`,
     `description`, `emoji`, `gradient`, `readTime`, `difficulty`, optional `previewImage`, and
     **`contentFile`**
3. `contentFile` is the path **relative to `public/content`**, e.g.
   `"natural-toxins/unit2-higher-plant-toxins.md"`. Confirm the file exists.
4. `semesterSlug` must equal `semesterToSlug(semester)` from `src/lib/mcq-utils.ts`
   (`"Semester 6"` → `"semester-6"`). `getSemesters()` groups by it, so a mismatch splits a
   semester in two.
5. Add it to `SUBJECTS`.
6. Delete the old `*-data.ts` file **only after** confirming the pages render — and after
   confirming nothing else imports it (`grep -rl "<name>" src`).

### Adding a unit to an existing subject
Append a `CourseUnit` to that subject's `units` array and add the markdown under
`public/content/<subject>/`. Order in the array **is** the prev/next order.

### Lesson markdown
- `src/actions/lesson.ts` (`"use server"`) reads
  `src/content/<semester>/<subject>/<lesson>.md`, converts via `markdownToHtml`, extracts the title
  from the first `# ` heading, and post-processes: wraps a `References` section in
  `.references-section` and every `<table>` in `.table-responsive`.
- Markdown supports GFM (`remark-gfm`) and a TOC (`remark-toc`).
- Missing file → `throw new Error("Lesson not found")`, so a wrong `contentFile` surfaces at
  runtime, **not at build time**.

## Files Usually Involved
- `src/lib/courses/{registry,types,content}.ts`, `src/lib/courses/subjects/*.ts`
- `src/actions/lesson.ts`, `src/utils/markdownToHtml.ts`, `src/lib/mcq-utils.ts`
- `public/content/<subject>/*.md`, `src/content/`
- `src/app/(site)/courses/[subjectSlug]/[unit]/page.tsx`
- `src/components/UnitTracker.tsx`, `src/components/dashboard/dashboard-shared.ts` (subject labels)

## Security Checks
- [ ] Lesson paths are built from **registry values, not raw user input**. `src/actions/lesson.ts`
      joins `semester`/`subject`/`lesson` into a filesystem path — if any caller ever passes an
      unvalidated route param through, that is a path-traversal risk. Resolve slugs through
      `getSubject()`/`getUnit()` first.
- [ ] Markdown is rendered to HTML — if any lesson content ever becomes user-submitted, it must be
      sanitised. Today all content is author-written and in-repo.

## Validation
Before claiming a subject is registered:
```bash
# every contentFile must resolve
grep -oE 'contentFile: "[^"]+"' src/lib/courses/subjects/<file>.ts \
  | sed 's|contentFile: "||;s|"$||' \
  | while read f; do [ -f "public/content/$f" ] && echo "OK  $f" || echo "MISS $f"; done

# slug consistency
grep -n "slug\|semesterSlug\|semester" src/lib/courses/subjects/<file>.ts | head
```
- Unit `id` values unique within the subject and URL-safe.
- `difficulty` is exactly `"Beginner" | "Intermediate" | "Advanced"`.
- `semesterSlug === semesterToSlug(semester)`.

## Tests & Verification
```bash
npx tsc --noEmit
npm run dev
```
Then: `/courses` lists the subject → the subject page lists every unit → **open every unit** and
confirm the markdown renders (a missing file throws at runtime, not at build) → prev/next work →
`/dashboard` records the visit after ~8s. **No tests exist**; opening every unit is the check.

## Common Failure Modes
- **Converting all nine at once** before proving one works end to end.
- **`contentFile` pointing at a file that does not exist** → runtime "Lesson not found", and `tsc`
  and `npm run build` both stay green.
- **`semesterSlug` not matching `semesterToSlug(semester)`** → the subject lands in its own
  phantom semester group.
- **Assuming a `*-data.ts` file is importable by the registry.** It exports no `SubjectMeta`.
- **Two subjects sharing a `slug`** → `SUBJECTS_BY_SLUG` silently keeps the last one.
- **Deleting a `*-data.ts` before checking importers.**
- **Forgetting the subject label** in `src/components/UnitTracker.tsx` and
  `src/components/dashboard/dashboard-shared.ts`, so the dashboard shows a raw slug.
- **Confusing the two content trees** — `public/content/` (registry `contentFile`) vs
  `src/content/` (`src/actions/lesson.ts`).

## Do Not
- Do not restructure `SubjectMeta` to accommodate the old triplet shape — convert the data instead.
- Do not delete `public/content/` markdown; it is the asset the whole task exists to surface.
- Do not rename an existing subject `slug` or unit `id` — both are live URLs.

## Update Project Knowledge
This is the current top roadmap item: update `.claude/ROADMAP.md` (Phase 2 Courses and Phase 4) and
`CLAUDE.md` §7 with the new registered count as you go, and add a Work Log entry.
