# Spotting Lessons & Tests

## Purpose
Add or fix histology, pathology, and powder-microscopy slide lessons and their timed
identification tests, including the AI-graded written-observation step.

## Trigger Examples
- "add a pathology slide for X"
- "add a powder microscopy lesson"
- "the spotting test doesn't include the new lesson"
- "the AI feedback on observations is wrong"

## Read First
- `src/components/spotting/HistologyLessonTemplate/index.tsx` — the shared lesson template (694 lines).
- `src/app/(site)/spotting/histology/lessons/kidney/page.tsx` — the cleanest lesson example.
- `src/app/api/evaluate-histology/route.ts` — the AI grading prompt and rules.

## Architecture Context

```
src/app/(site)/spotting/
  page.tsx, layout.tsx
  histology/
    lessons/page.tsx            index
    lessons/<slide>/page.tsx    17 lessons — thin wrappers over HistologyLessonTemplate
    test/page.tsx               timed test; SLIDE_DATA is INLINE in this file
  pathology/
    <condition>/page.tsx        16 lessons — self-contained, larger (~9 kB each)
    lessons/page.tsx, test/page.tsx
  powder-microscopy/
    lessons/<drug>/page.tsx     only 3 (digitalis, nux-vomica, senna)
    lessons/page.tsx, test/page.tsx
```

### Two different lesson patterns — do not mix them
- **Histology** lessons are thin: the page declares `REFS`, `POINTS`, and a `THEORY` JSX block, then
  renders `<HistologyLessonTemplate … />`. Small (2–4 kB each).
- **Pathology** lessons are self-contained pages with their own layout (~9 kB each).

### The critical decoupling
**Lessons and tests are separate data.** The histology test's `SLIDE_DATA` array is declared
**inline inside `test/page.tsx`**, not derived from the lesson pages. **Adding a lesson does not
add it to the test**, and vice versa. Same for pathology and powder microscopy.

### AI grading
The spotting tests let a student write free-text "points of recognition" and pin slide landmarks,
then POST to `/api/evaluate-histology` with `slideTitle`, `expectedDefinition`, `keyFeatures`,
`studentPoints`, `studentPins`. Gemini returns `semanticScore`, `feedback`, `matchedConcepts`,
`missedConcepts`, `examinerNote`.

The prompt is deliberately lenient: it carries a **synonym table** (`polymorphs/pus/PMNs` =
`neutrophils`, `owl-eye` = `Reed-Sternberg cells`, `cheese-like` = `caseous necrosis`, …) so
students are not penalised for informal or colloquial phrasing. Extend that table when adding
slides with their own vernacular.

If no API key is present the route returns a **useful non-AI response** rather than failing — keep
that graceful branch.

### Design tokens
Spotting test pages use **local hex constants**, not the Tailwind brand tokens — a histology-stain
palette (`INK`, `PAPER`, `VIOLET`, `ROSE`, `TEAL`, `AMBER`, `RED` and their `_SOFT` variants, plus
`GRAD_FLAT`). The pathology test uses the same palette deliberately. Reuse these constants for
visual consistency.

## Procedure

### Adding a histology lesson
1. Create `src/app/(site)/spotting/histology/lessons/<slide>/page.tsx`.
2. Copy `kidney/page.tsx`: declare `REFS` (authors/title/edition/publisher/year),
   `POINTS` (the points of recognition), and `THEORY` (JSX with `<h3>`/`<h4>`/`<p>`, figures with
   `<figcaption>`), then render `<HistologyLessonTemplate … />`.
3. Add slide images to `public/images/spotting/histology/` — the convention is a low-magnification
   `<slide>.jpg` and a high-magnification `<slide>-high.jpg`.
4. Add the lesson to the index page `lessons/page.tsx`.
5. **If it should be examinable, separately add an entry to `SLIDE_DATA` in
   `histology/test/page.tsx`**: `id`, `title`, `category`, `images[]`, `options[]` (the distractors),
   `correctOptionIndex`, `definition[]` (gold-standard features), and the key features used for AI
   grading.

### Adding a pathology lesson
Copy the closest `pathology/<condition>/page.tsx` — these are self-contained, not template-based.
Add it to `pathology/lessons/page.tsx` and, if examinable, to the pathology test's slide array.

### Adding a powder-microscopy lesson
Only 3 exist, so copy `lessons/senna/page.tsx`. This is the thinnest category and the obvious
content gap (`ROADMAP.md` Phase 2).

### Tuning AI grading
Edit the prompt in `src/app/api/evaluate-histology/route.ts`. Add synonyms to the `CRITICAL
EVALUATION RULES` list. Keep it lenient on phrasing and strict on concepts — that is the stated
intent.

## Files Usually Involved
- `src/app/(site)/spotting/**/page.tsx`
- `src/components/spotting/HistologyLessonTemplate/index.tsx`
- `src/app/api/evaluate-histology/route.ts`
- `public/images/spotting/<category>/`
- `src/components/ui/ImageZoom.tsx`

## Security Checks
- [ ] `/api/evaluate-histology` is **unauthenticated and unrate-limited** and spends Gemini quota
      per submission. Do not widen that surface; adding a limiter is a tracked roadmap item.
- [ ] `GEMINI_API_KEY` stays server-side. **Do not set `NEXT_PUBLIC_GEMINI_API_KEY`** to make the
      fallback at line 17 work — that would publish the key.
- [ ] Student free text is interpolated into a prompt — keep it out of logs.
- [ ] Model output rendered as markdown, never as raw HTML.

## Validation
- Every image path in a lesson or `SLIDE_DATA` entry resolves under `public/images/spotting/`.
- `correctOptionIndex` points at the right entry in `options[]` — an off-by-one silently marks
  every correct answer wrong.
- Slide `id` values unique within their array.
- `expectedDefinition` and `keyFeatures` are populated; the grader depends on them.
- Progress writes use `type: "spotting"` with a `lessonId` (see `progress-tracking`).

## Tests & Verification
```bash
npx tsc --noEmit
npm run dev
```
Then: open the lesson, confirm every image loads and zoom works; open the test, confirm the new
slide appears, answer it correctly and incorrectly, submit written observations and read the AI
feedback (deliberately use a synonym to check leniency); confirm `/dashboard` records the visit
after ~8s. **No tests exist**, and AI grading is non-deterministic — describe what you observed.

## Common Failure Modes
- **Adding a lesson and expecting it in the test.** `SLIDE_DATA` is a separate inline array.
- **Broken image paths** — the page renders with empty figures and no error.
- **`correctOptionIndex` off by one.**
- **Using the Tailwind brand palette** in a test page instead of the local stain-palette constants.
- **Making histology lessons self-contained** instead of using the shared template — they diverge
  immediately.
- **Forgetting `keyFeatures`**, so the AI grader has nothing to match against and scores everything 0.
- **Burning Gemini quota** by resubmitting observations repeatedly while styling.

## Do Not
- Do not remove the no-API-key graceful branch in `/api/evaluate-histology`.
- Do not make the grader strict on phrasing — the synonym leniency is the pedagogical point.
- Do not rename an existing lesson directory; it is a live URL and a `lessonId` in `spotting_progress`.

## Update Project Knowledge
Update the per-category lesson counts in `.claude/ROADMAP.md` Phase 2 §Spotting labs when you add
lessons, and `CLAUDE.md` §7 if the balance between categories changes materially.
