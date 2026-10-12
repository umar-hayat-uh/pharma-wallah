# Content review policy

**Applies to:** every calculator page, guide and course lesson on www.pharmawallah.com and in the
offline apps. **Public version:** `/editorial-policy` (`src/app/(site)/editorial-policy/page.tsx`).
Keep the two in step — the public page may say only what this document says the team does.

Last revised 2026-10-12.

---

## 1. Principles

1. **Nothing is published that we cannot stand behind.** A formula without a source, a number we have
   not recomputed, or a credential nobody holds does not go on the site.
2. **Say what we are.** PharmaWallah is built by pharmacy students. It is not accredited by, affiliated
   with, or reviewed by a university, a regulator or a professional body, and no page may imply it is.
3. **Education, not treatment.** Every example dose or concentration is illustrative. Pages say so.
4. **Errors are expected and fixed in the open.** Known calculator faults are stated on the calculator
   page until fixed (see `.claude/redesign-tracker.md` → "Suspected maths issues").

## 2. Who is responsible

| Role | Who | Responsibility |
| --- | --- | --- |
| Author | A PharmaWallah team member (drafts may be AI-assisted) | Writes the content to the structures below |
| Checker | A second team member, or the author with independent computation | Runs the checks in §4; records the result in the content's metadata |
| Owner | The site owner | Decides on formula fixes, removals, and anything clinical; approves expert reviewers |
| Expert reviewer | *None yet.* A named, qualified person who agrees to be named | Reviews a specific page; their name, qualification and date are shown on it |

AI-assisted drafting is allowed. It does not change any requirement below. Every figure an AI draft
contains is recomputed independently before it is published.

## 3. How content is structured

- **Calculators** use the shared kit (`src/components/calculators`). Teaching content beyond the formula
  and FAQ lives in the tool's own `_learn.ts` (`CalcEducation` type) and renders through `<CalcLearn>`:
  worked example, common mistakes, assumptions and limitations, references, related tools, guide link.
  Depth follows complexity — a unit converter does not need the structure a stability-kinetics tool does.
- **Guides** are typed data in `src/lib/guides/content/<slug>.ts` (`Guide` type), rendered by
  `src/components/guides/GuideArticle.tsx`. Required parts: objectives, key terms, sections, worked
  examples, common mistakes, practice questions with working, limitations, references, related tools.
- **Course lessons** are markdown in `content/<subject>/<unit>.md`, registered in `src/lib/courses/`.

## 4. Checks before publishing

| Check | How | Who signs off |
| --- | --- | --- |
| Formula | Compared with the cited source; variables and units defined | Checker |
| Worked examples, practice answers | Recomputed independently (Python, a spreadsheet or by hand). On a calculator page, also checked against what the calculator prints for the same inputs, including its rounding | Checker |
| Calculator path | The example does not pass through a recorded fault | Checker |
| Units | Every input, step and result carries its unit | Checker |
| Clinical content | No dose presented as a recommendation; patient-specific use disclaimed | Checker; owner if in doubt |
| Regulatory content | No acceptance limit stated as a requirement unless quoted from the current official text and cited | Checker |
| References | Only ids from `src/lib/content/references.ts` (see §5) | Checker |
| Rendering | Page loads at desktop and phone width with no console error and no horizontal scroll | Checker |

## 5. References

- All citations come from one registry, `src/lib/content/references.ts`. Pages cite by id, so a
  citation cannot be typed inline and a mistyped id fails the type-check.
- A source is added to the registry only after its edition, year and publisher are confirmed against
  the publisher's or issuing body's own listing; the `checked` field records how and when.
- URLs only for the issuing body's own stable pages (ICH, BIPM, IUPAC). No retailer links, no page
  numbers we have not opened.
- A reference supports the formula or principle. It is never presented as a review of our page.

## 6. Review status (what a page may claim)

Modelled by `ContentReview` in `src/lib/content/governance.ts`:

| Status | Shown as | Requirement |
| --- | --- | --- |
| `draft` | Not shown; not linked; not in the sitemap | — |
| `team-checked` | "Checked by the PharmaWallah team. Not yet independently reviewed by a pharmacist." | §4 checks done |
| `expert-reviewed` | "Reviewed by *name*, *qualification*, on *date*." | A real, named, qualified person reviewed this page and agreed to be named. The type requires all three fields |

Calculator pages show a fixed line in `(tools)/layout.tsx`: "Built by the PharmaWallah team … not
been independently reviewed by a pharmacist." Change it only when that stops being true for every tool.

## 7. Corrections

1. Visitors report errors through `/contact` — every calculator and guide has a "Report an error" link
   (`reportErrorHref()`), which pre-fills the subject with the page name.
2. The owner or a checker compares the report with the cited source.
3. If the page is wrong: fix it, re-run the §4 checks, update the guide's `meta.updated` date.
   A calculator formula fix is logic work and needs the owner's decision (CLAUDE.md Known Issue 15).
4. If a fix cannot be made straight away, state the fault on the calculator page and record it in
   `.claude/redesign-tracker.md`.

## 8. Updates

Revisit a page when a cited guideline or pharmacopoeial chapter is revised, when an error is reported,
or when the calculator it explains changes. `meta.updated` changes only for substantive content changes.

## 9. Clinical limitations — standard wording

Every calculator shows `CalcDisclaimer` ("educational purposes only"). Guides close with a "Limitations
and safe use" section. Clinical-dose content additionally states that real doses come from the
product's approved labelling or formulary, set by a prescriber and checked by a pharmacist.
