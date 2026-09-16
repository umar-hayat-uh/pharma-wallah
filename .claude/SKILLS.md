# SKILLS — PharmaWallah

Reusable, repo-specific procedures. Each lives at `.claude/skills/<name>/SKILL.md`.

**Read the matching skill before improvising.** Every one encodes traps that were discovered the
hard way in this codebase.

---

## Workflow skills — the general loop

| Skill | Purpose | Use When | Location |
| --- | --- | --- | --- |
| `analyze-feature` | Explain how an existing feature actually works, end to end | "how does X work?", "explain the tournament scoring" | `.claude/skills/analyze-feature/` |
| `implement-feature` | Add or change functionality following this repo's patterns | Any build task | `.claude/skills/implement-feature/` |
| `next-feature` | Decide what to build next from the reconciled roadmap | "what's next?", "continue where we stopped" | `.claude/skills/next-feature/` |
| `debug-issue` | Diagnose a bug — starting from the catalogued gotchas | Anything broken, 401/429/500, empty data, stale data | `.claude/skills/debug-issue/` |
| `code-review` | Review a diff for correctness and this repo's recurring mistakes | Before reporting done; "review this" | `.claude/skills/code-review/` |
| `security-review` | Authorization, data isolation, secrets, abuse surface | Any change to auth, service-role access, admin, tournament | `.claude/skills/security-review/` |
| `testing-verification` | Verify honestly, and know what this repo can prove | The verification step of every task | `.claude/skills/testing-verification/` |
| `roadmap-status` | Reconcile roadmap status against the actual code | "what's the status?", knowledge sync | `.claude/skills/roadmap-status/` |

## Infrastructure skills

| Skill | Purpose | Use When | Location |
| --- | --- | --- | --- |
| `api-route-conventions` | Route-handler shape: auth, validation, limits, error codes | Writing or fixing anything under `src/app/api/` | `.claude/skills/api-route-conventions/` |
| `supabase-data-access` | Client choice, the two authorization models, query idioms | Any Supabase read or write | `.claude/skills/supabase-data-access/` |
| `caching-and-ratelimiting` | Redis keys/TTLs, Mongo cache models, limiters, fail-open | Stale data, 429s, adding a cache or limit | `.claude/skills/caching-and-ratelimiting/` |
| `deployment-and-env` | Build behaviour, env vars, PWA, hosting reality | Build failures, new env vars, deploying, fresh setup | `.claude/skills/deployment-and-env/` |
| `frontend-ui-conventions` | Tokens, motion, icons, page structure, dark mode | Building or changing any page or component | `.claude/skills/frontend-ui-conventions/` |
| `android-app-capacitor` | The offline calculators-only Android app: second Next project, generated routes, Capacitor | Anything touching `mobile/`, `android/`, or "does this work in the app?" | `.claude/skills/android-app-capacitor/` |
| `landing-page-motion` | The GSAP landing page at `/`: "The Index" as a scroll-played whiteboard video — marker marks, pen, timeline bar, motion hook, scoped stylesheet | Any change to `/`, its copy, its sections, annotations or animation | `.claude/skills/landing-page-motion/` |
| `top-design` | Awwwards-level design standard: typography as architecture, composition, custom easing, colour, micro-details, 0–10 scoring rubric | Designing or reviewing any page's visual quality; "make it premium" | `.claude/skills/top-design/` |
| `adsense-monetization` | Ad placements: the one `AdSlot` component, the env-gated loader, the excluded surfaces | Adding/moving an ad, "ads aren't showing", an AdSense policy warning | `.claude/skills/adsense-monetization/` |

## Domain skills

| Skill | Purpose | Use When | Location |
| --- | --- | --- | --- |
| `calculator-tool` | Add/fix one of the 97 calculators and register it on the hub | Any calculation-tools work | `.claude/skills/calculator-tool/` |
| `course-content-system` | Subject registry, units, lesson markdown, the 9 unregistered subjects | Courses, units, MCQ subject coverage | `.claude/skills/course-content-system/` |
| `progress-tracking` | Progress events, batching queue, dashboard, streaks | Tracking a new page, dashboard bugs, new event types | `.claude/skills/progress-tracking/` |
| `tournament-system` | Entry codes, server-authoritative scoring, leaderboard, admin | Any tournament or admin work | `.claude/skills/tournament-system/` |
| `spotting-lessons` | Histology/pathology/powder lessons, timed tests, AI grading | Adding slides or fixing a spotting test | `.claude/skills/spotting-lessons/` |
| `molecular-lab` | The 2D/3D molecule editor: graph, valence, OpenChemLib worker, 3Dmol, library generation | Anything on `/molecular-lab` (formerly Molecule Viewer) | `.claude/skills/molecular-lab/` |
| `clinical-and-external-apis` | The clinical sub-brand and its six external data sources | Clinical pages, drug/literature APIs, their caches | `.claude/skills/clinical-and-external-apis/` |
| `ai-gemini-integration` | The four Gemini features, prompts, keys, cost control | Any AI route or prompt work | `.claude/skills/ai-gemini-integration/` |

---

## Choosing a skill

1. **Start with the workflow skill that matches the verb** — analyze, implement, debug, review,
   verify, or decide.
2. **Add the domain skill that matches the noun** — calculator, course, tournament, progress,
   spotting, clinical, AI.
3. **Add an infrastructure skill** if the change crosses a layer — a route, a Supabase query, a
   cache, a build concern, a UI surface.

If nothing matches, follow `.claude/PROTOCOL.md` and **write the skill afterwards**.

## Composing skills

Most real tasks use three. Typical stacks:

| Task | Stack |
| --- | --- |
| "Add a Cockcroft-Gault calculator" | `implement-feature` → `calculator-tool` → `frontend-ui-conventions` → `testing-verification` |
| "Register the remaining subjects" | `next-feature` → `implement-feature` → `course-content-system` → `roadmap-status` |
| "The dashboard is empty" | `debug-issue` → `progress-tracking` → `caching-and-ratelimiting` |
| "Add a tournament game" | `implement-feature` → `tournament-system` → `api-route-conventions` → `security-review` |
| "New endpoint returning user data" | `implement-feature` → `api-route-conventions` → `supabase-data-access` → `security-review` |
| "The build is failing" | `debug-issue` → `deployment-and-env` |
| "Change the homepage hero / add a landing section" | `landing-page-motion` → `frontend-ui-conventions` → `testing-verification` |
| "Put ads on the encyclopedia pages" | `adsense-monetization` → `frontend-ui-conventions` → `android-app-capacitor` (if a calculator is involved) |
| "Add a clinical interaction checker" | `implement-feature` → `clinical-and-external-apis` → `api-route-conventions` → `caching-and-ratelimiting` |
| "Improve the AI tutor" | `ai-gemini-integration` → `security-review` (it is an unthrottled paid endpoint) |

**Always finish with `testing-verification`** — this repo has no tests and a broken lint command,
so honest verification takes deliberate effort.

---

## Maintaining skills

**When a task teaches a reusable procedure, the skill must be created or updated as part of that
task.** That is a project requirement, not a nicety.

- A skill's steps turned out to be wrong or incomplete → **fix the skill**, do not just work around it.
- A trap cost you more than a few minutes → add it to that skill's **Common Failure Modes** and to
  `.claude/MEMORY.md` §8.
- A new subsystem appears that no skill covers → write a new skill and add a row above.
- A skill covers code that no longer exists → correct or delete it. A wrong skill is worse than
  none, because it will be trusted.

Every skill uses the same section order:
`# Name / ## Purpose / ## Trigger Examples / ## Read First / ## Architecture Context / ## Procedure /
## Files Usually Involved / ## Security Checks / ## Validation / ## Tests & Verification /
## Common Failure Modes / ## Do Not / ## Update Project Knowledge`

**No placeholder skills.** Every procedure must name real files, real functions, real commands, and
real failure modes from this repository.
