# MEMORY — PharmaWallah

Durable facts about **this** project: decisions and why, invariants, authorization rules,
conventions, and traps. **Not** a work diary — that lives in `CLAUDE.md` §8.

**No secrets in this file, ever.** Environment variable *names* only.

---

## 1. What this product is

An AI-assisted pharmacy education platform for Doctor-of-Pharmacy students, plus a clinical
decision-support sub-brand (`clinical.pharmawallah…`) aimed at practising pharmacists.

Six pillars share one Next.js 14 App Router application: calculation tools (97), courses + MCQ
banks, spotting labs (histology/pathology/powder microscopy), wet-lab simulations, an entry-code
tournament, and the clinical subdomain.

The contact form and the admin allowlist both point at the same product-owner email address, so
the project is effectively single-operator today.

---

## 2. Architecture decisions, and why

### Subdomain routing is done in middleware, not in the route tree
`src/middleware.ts` inspects the `host` header. If it starts with `clinical.`, it sets an
`x-subdomain: clinical` request **and** response header. `src/app/layout.tsx` reads that header
via `headers()` to pick metadata and pass `isClinicalSubdomain` down to `AppShell`.

*Why:* one deployment, one layout, two brands — without duplicating the app under a `[domain]`
segment. The cost is that the clinical pages are **also** reachable on the main domain at
`/clinical/...`; the header only changes chrome and metadata, not access.

### Middleware only calls Supabase for protected paths
The matcher runs on nearly every request, but `supabase.auth.getUser()` is called **only** when
the path matches `PROTECTED_PATHS`. *Why:* the tournament/leaderboard pages are public and
high-traffic during an event; an auth round trip on every view was wasted latency.

### `/leaderboard` is deliberately NOT protected
It was removed from `PROTECTED_PATHS` because a public science-fair leaderboard that redirects
anonymous spectators to `/signin` is broken by definition. The reason is written in the middleware
comment. **Do not re-add it.** Tournament play/games pages are public for the same reason —
participants authenticate with an entry code, not an account.

### Tournament scoring is server-authoritative
Three cooperating pieces:
1. `GET /api/tournament/game-questions` returns questions with the answer key **stripped**
   (`toPublicMCQ` / `toPublicFlashcard`).
2. `POST /api/tournament/check-answer` grades one answer against the server-side bank and
   accumulates `correctCount` in a Redis session keyed
   `tournament:attempt:{code}:{game}:{attemptNumber}` (20 min TTL).
3. `POST /api/tournament/submit-score` reads the score **from that Redis session** and ignores any
   score in the request body. No session → 400, not a zero score.

*Why:* otherwise anyone could `POST` an arbitrary score. This design is load-bearing; do not
"simplify" it into a client-reported score.

### Attempt numbers are claimed by a Postgres RPC, not counted in JS
`game-questions` calls `supabase.rpc("claim_tournament_attempt", { p_code, p_game_type })`. It
replaced an older "count existing scores, compare to `max_retries`" pattern that had a race
condition under concurrent requests. The RPC signals failure through error messages containing
`INVALID_CODE`, `CODE_USED`, or `NO_ATTEMPTS_LEFT`, which the route maps to 401/403.

### The leaderboard reads a Postgres view, not raw scores
`tournament_leaderboard_best` does the "best score per code per game" dedup in SQL.
`src/lib/leaderboard-data.ts` caches the result in Redis for 30s under `tournament:leaderboard:v1`,
and `submit-score` proactively invalidates it. *Why:* at 600–1000 concurrent event viewers,
one Postgres read per 30s instead of one per page view.

### Drug Finder and Adverse Effects are decoupled end to end
Separate routes, separate lib clients, separate Mongo models, by design — stated explicitly in
`src/lib/models/DrugFinderCache.ts`. Finder answers *"what is this drug"* from **RxNorm only**;
Adverse Effects answers *"is it safe"* from **openFDA**. Do not merge them or let one call the
other's source.

### Progress writes are batched from the client
`src/lib/activityQueue.ts` queues events and flushes to `POST /api/progress/batch` every 8s, at 8
events, or on `beforeunload`/`visibilitychange` via `navigator.sendBeacon`. Hard ceiling of 50
queued events, dropping oldest. *Why:* one request per tracked action was too chatty.

Both `/api/progress` (single) and `/api/progress/batch` funnel through the same
`applyProgressEvent()` in `src/lib/progress-server.ts` so the two paths cannot drift.

### Caches fail open, never closed
`checkLimit()` in `src/lib/rateLimit.ts` returns `{ success: true }` if Upstash throws — a rate
limiter whose backing store is down must not block every user. Every Redis read/write in
`leaderboard-data.ts`, `validate-code`, and `/api/progress` is wrapped so a Redis failure logs and
falls through to Postgres. `src/lib/redis.ts` exports `null` (rather than throwing) when the
Upstash env vars are missing, and the app runs uncached.

**Exception:** `src/lib/tournament-redis.ts` uses `Redis.fromEnv()`, which **throws** if the env
vars are missing. The tournament genuinely cannot function without Redis, so it is a hard
dependency there.

### Partial query failures degrade a section, not the page
`GET /api/progress` runs its five child-table queries with `Promise.allSettled` and an `unwrap()`
helper that logs and returns `[]` for any that fail. One broken table empties one dashboard tab
instead of 500-ing the whole dashboard.

### One typeface: Outfit, wired in two places

`src/app/layout.tsx` loads **Outfit** through `next/font/google` as a **variable** font (no
`weight` list — the whole 100–900 range ships in one self-hosted file, so `font-extrabold` and
`font-black` are real weights, not synthesised). It is applied twice, deliberately:

- `font.className` on `<body>` — the default font for the document.
- `font.variable` on `<html>` — exposes `--font-outfit`, which `tailwind.config.ts` uses for
  `theme.extend.fontFamily.sans`, so the `font-sans` utility and any page that sets its own
  `font-family: var(--font-outfit), …` land on the same face.

`mobile/app/layout.tsx` does the same for the APK (and inherits the web Tailwind config), so a
calculator looks identical in both. **Monospace is the only surviving second face** — JetBrains
Mono on the lab guide and the histology spotting test, plus `font-mono` — because instrument
readouts, SMILES strings and codes are meant to be monospaced.

### Course prose is markdown on disk, metadata is TypeScript
Lesson bodies live in `public/content/<subject>/<unit>.md` (69 files) and a smaller `src/content/`
tree. Subject/unit metadata is typed TS in `src/lib/courses/subjects/`, surfaced through
`src/lib/courses/registry.ts`. *Why:* prose is editable without a rebuild-breaking type error, and
navigation/ordering stays type-checked.

---

## 3. Authorization rules — CRITICAL

### There are TWO authorization models in this codebase. Know which one you are in.

**Model A — route-enforced (RLS bypassed).**
Used by: `/api/progress`, `/api/progress/batch`, all `/api/tournament/*`, all `/api/admin/*`.

```
authenticate with createServerSupabaseClient()  ->  auth.getUser()
then read/write with createServiceSupabaseClient()  (SERVICE ROLE — RLS BYPASSED)
```

> **CRITICAL INVARIANT:** once you hold the service-role client, RLS is gone. The ownership filter
> you write in the handler — `.eq("user_id", user.id)`, `.eq("progress_id", progressId)` — **is the
> only thing protecting other users' data.** Omit it and you leak the entire table. A record ID
> arriving from the client is **never** authorization; resolve ownership server-side first.

**Model B — RLS-enforced.**
Used by: all `/api/qa/*` (questions, answers, votes) and `/api/clinical/amr`.

These handlers use only `createServerSupabaseClient()` (anon key + the user's cookies), so Postgres
RLS policies decide visibility.

> **CRITICAL:** those RLS policies are **not in this repository**. They exist only in the Supabase
> dashboard. Never assume a policy exists, and never switch a Model-B route to the service-role
> client "to fix a permissions error" — that silently removes the only protection it had.

### Admin authorization
A **hardcoded email allowlist**, duplicated verbatim in three files:
- `src/app/api/admin/codes/route.ts`
- `src/app/api/admin/registrations/route.ts`
- `src/app/api/admin/registrations/approve/route.ts`

Each declares its own `const ADMIN_EMAILS = [...]` and compares `user.email`. Adding an admin means
editing three files. There is no role column, no claim, no DB-backed check. `/admin` is also in
`PROTECTED_PATHS`, but that only requires *being logged in* — the allowlist is the real gate.

### Protected paths (the complete list)
`src/middleware.ts` → `PROTECTED_PATHS = ['/dashboard', '/api/progress', '/admin', '/api/reviews']`.

Note `/api/reviews` is listed but **no such route exists** (there is a `Review` mongoose model but
no handler). Everything else — including every `/api/tournament/*`, `/api/qa/*`, `/api/clinical/*`,
`/api/drugs/*`, and all AI routes — is **unauthenticated at the middleware layer** and must do its
own auth and rate limiting.

---

## 4. Data relationships and invariants

### Supabase Postgres

**Progress tree** — one `progress` row per user, everything else hangs off `progress.id`:

```
auth.users
  └─ progress (user_id, email, display_name, avatar_url,
               total_time_spent_min, current_streak, longest_streak, last_active_at)
       ├─ unit_progress      (progress_id, unit_id)      UNIQUE (progress_id, unit_id)
       ├─ flashcard_progress (progress_id, category)     UNIQUE (progress_id, category)
       ├─ quiz_attempts      (progress_id, quiz_id, score, total, time_taken_min, attempted_at)
       └─ spotting_progress  (progress_id, lesson_id)    UNIQUE (progress_id, lesson_id)
activity_log (user_id, type, label, href, timestamp)   -- keyed by user_id, NOT progress_id
```

Invariants:
- `applyProgressEvent()` **creates the `progress` row on demand** if absent. Never assume it exists.
- The three `upsert` calls depend on those composite unique constraints via `onConflict`
  (`"progress_id, unit_id"`, `"progress_id, category"`, `"progress_id, lesson_id"`). If a constraint
  is missing in the database, upserts silently become duplicate inserts.
- `quiz_attempts` is **insert-only** (a history), unlike the other three.
- `current_streak` / `longest_streak` are **read but never written** by any code in this repo.
  `applyProgressEvent()` updates only `last_active_at`, `total_time_spent_min`, `updated_at`.
  Either a Postgres trigger maintains them or they are permanently 0 — unverified, because the
  schema is not in the repo.
- Every non-`activity` event **also writes a human-readable `activity_log` row**. That label is what
  the dashboard feed renders — not the raw event type.
- `activity_log` is keyed by `user_id`, while its siblings are keyed by `progress_id`. Don't mix them.

**Q&A community:** `questions` ← `answers`, plus `votes`.
Invariant, documented in `src/app/api/qa/votes/route.ts`: a `votes` row must populate **both**
`target_id`/`target_type` (NOT NULL) **and** the matching `question_id`/`answer_id` pair (used for
PostgREST embedded joins). Writing only one pair breaks either the constraint or the join.
Question/answer authors are joined via a `profiles` table (`profiles!left`).

**Tournament:**
```
tournament_registrations (name, email, year, semester, status, entry_code)
   status: 'pending' -> 'approved'  (admin approval mints the code)
entry_codes (code PK-ish, entry_type, games_included[], max_retries, is_used,
             team_name, team_members[])
tournament_scores (entry_code, player_name, game_type, score, attempt_number, time_taken)
tournament_leaderboard_best   -- VIEW: best score per (entry_code, game_type)
claim_tournament_attempt(p_code, p_game_type)  -- RPC: atomically claims the next attempt number
```
Invariants:
- `entry_type` is one of `solo_single`, `solo_pass`, `team_single`, `team_pass`. Allowed games and
  `max_retries` are derived from it — and those maps are **duplicated** in `admin/codes/route.ts`
  (`ENTRY_DEFAULTS`) and `admin/registrations/approve/route.ts` (`GAMES_MAP` + `RETRIES_MAP`).
  Change one, change both.
- Allowed attempts = `max_retries + 1`. `submit-score` flips `is_used = true` on the last attempt
  and deletes the cached `tournament:code:{code}` key.
- Approve is a two-step write with **manual compensation**: if the registration update fails after
  the code insert, the route deletes the orphaned code. There is no transaction.

**Other tables:** `amr_surveillance` (AMR dashboard, read anonymously), and the clinical literature
caches `pubmed_cache`, `medlineplus_cache`, `clinicaltrials_cache`.

### MongoDB — two connections, two databases
| Client | File | Driver | Database | Used by |
| --- | --- | --- | --- | --- |
| `connectDB` / `dbConnect` | `src/lib/mongodb.ts` | **mongoose** | `pharmawallah` | drug finder, adverse effects, drug-drug & drug-food interactions, comments |
| `clientPromise` (default) | **`lib/mongodb.tsx`** (repo root) | **native `mongodb`** | `pharmacopedia` | `/api/search`, `/api/autocomplete` |

Models in `src/lib/models/`: `DrugFinderCache`, `AdverseEffectCache`, `DrugDrugInteraction`,
`DrugFoodInteraction`, `Comment`, `Review`, `userProgress`.

Invariants:
- Cache models use a `queryKey` unique index plus a TTL index on `fetchedAt`
  (`expireAfterSeconds: 60*60*24*30` — 30 days) so Mongo expires stale drug data itself.
- Mongoose models **must** use `models.X || model("X", schema)` or dev hot-reload throws
  `OverwriteModelError`.
- `Review` and `userProgress` models exist with **no route using them**. `userProgress` in
  particular is a leftover — progress lives in Supabase now.

### Upstash Redis key namespaces
| Key / prefix | Written by | TTL |
| --- | --- | --- |
| `progress:v1:{userId}` | `/api/progress` GET | 45s (`PROGRESS_CACHE_TTL_SECONDS`) |
| `tournament:code:{CODE}` | `validate-code` | 300s |
| `tournament:attempt:{code}:{game}:{n}` | `check-answer` | 1200s |
| `tournament:leaderboard:v1` | `leaderboard-data.ts` | 30s |
| `ratelimit:progress:read` / `:write` | `src/lib/rateLimit.ts` | sliding window |
| `rl:validate-code` / `rl:game-questions` / `rl:submit-score` / `rl:register` | `src/lib/tournament-redis.ts` | sliding window |

Rate limits, as configured: progress read 20/10s and write 10/10s (keyed by **user id**);
validate-code 20/60s, game-questions 10/60s, submit-score 8/60s, register 5/10min (keyed by **IP**);
PubMed 10/60s (its own inline limiter in the route).

---

## 5. Security decisions and standing rules

- **Never trust a client-reported score, grade, or answer.** Grade server-side; keep the tally in
  Redis; read it back from Redis on submit.
- **Strip answer keys** from any question payload sent to the browser for a *scored* activity.
  (Practice MCQ banks under `src/app/api/mcq-data/` **do** ship answers to the client — that is
  accepted for ungraded self-study, but must never be the source for a tournament game.)
- **`SUPABASE_SERVICE_ROLE_KEY` is server-only.** `src/lib/supabase-admin.ts` says so in a comment.
  Never import it from a client component; never expose it.
- **Any `NEXT_PUBLIC_*` variable is public.** It is inlined into the browser bundle.
  `src/app/api/evaluate-histology/route.ts:17` reads `NEXT_PUBLIC_GEMINI_API_KEY` as a fallback —
  it is not set today, and that fallback should be deleted rather than populated.
- **Rate-limit every anonymous or expensive endpoint** using the shared limiters.
- **Escape user input used in Mongo regex.** `/api/search` and `/api/autocomplete` both do
  `q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")`. Keep that.
- **Validate and clamp pagination.** `MAX_LIMIT = 50` in the Q&A route is the reference.
- **`.env` is gitignored** (both `/.env` and `.env*.local`). Never commit it, never print its
  values, never paste a value into a doc, a comment, or a commit message.

---

## 6. Environment variables (names only)

**Required for the app to build and run:**
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`MONGODB_URI`, `MONGODB_USER`, `MONGODB_USER_PASSWORD`.

**Required for the tournament** (`Redis.fromEnv()` throws without them):
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

**Feature-specific:** `GEMINI_API_KEY` (chat, colony scan, histology eval),
`GOOGLE_GENERATIVE_AI_API_KEY` (the Vercel AI SDK's own convention, prescription reader),
`RESEND_API_KEY` (contact form), `OPENFDA_API_KEY`, `CLOUDINARY_URL`,
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

**Optional, referenced in code with fallbacks, currently unset:**
`GEMINI_MODEL` (defaults to `gemini-2.5-flash`), `NCBI_API_KEY`, `NCBI_CONTACT_EMAIL`
(PubMed works without them at a lower rate limit), `NEXT_PUBLIC_GEMINI_API_KEY` (should be removed).

**Advertising (all `NEXT_PUBLIC_*`, all public by nature — none is a secret):**
`NEXT_PUBLIC_ADSENSE_CLIENT` is the publisher ID and the **master switch**: without it
`src/app/layout.tsx` renders no loader script and `AdSlot` renders nothing, so the site makes zero
ad requests. `_CALCULATOR`, `_CALCULATOR_FOOTER`, `_LESSON`, `_LIST` are the per-placement
ad-unit IDs (`_HOME_1/2/3` are unused since 2026-09-13, when the landing page's ad bands were removed); a blank one renders
nothing in production and a labelled placeholder in dev. `NEXT_PUBLIC_IS_MOBILE_APP` is set only by
`mobile/next.config.mjs` and makes `AdSlot` return `null`.

`NODE_ENV` is read for cookie `secure` flags, the mongo dev-cache, and to disable PWA in dev.

---

## 7. Testing and deployment reality

### Testing — almost none
**No test framework and no CI.** No Jest, Vitest, Playwright, or Cypress; no test script in
`package.json`; no `.github/`. The one exception (since 2026-09-14/16): three **`node --test`** files
for pure modules, run with Node 24's built-in TypeScript stripping —
`node --test scripts/tlc-rf.test.mts scripts/colony-counter.test.mts scripts/molecular-lab.test.mts`
(62 tests; the colony tests run the real OpenCV.js, the Molecular Lab tests the real OpenChemLib). They
cover those three features only; report them by name, never as "tests passed".

**Therefore: never claim tests passed.** The only static checks available are `npx tsc --noEmit`
(works, currently clean) and `npm run lint` (**does not work** — no ESLint config, the command
drops into an interactive setup prompt). Verification for any change here means type-check +
build + **manually exercising the affected route or page**.

### Deployment
- Vercel is the evident target: `@vercel/analytics` and `@vercel/speed-insights` are mounted in the
  root layout, and `getClientIp()` reads the `x-forwarded-for` header Vercel sets. There is **no**
  `vercel.json` in the repo.
- **No PWA.** `next-pwa` was removed on 2026-09-12; see §8 gotcha 16.
  it by hand**; change `next.config.mjs` and rebuild.
- `npm run predeploy` / `npm run deploy` target `gh-pages` from an `out/` directory. **These cannot
  work**: there is no `output: "export"`, and the app has API routes and middleware, so it can never
  be statically exported. Treat those scripts as dead.
- `images.unoptimized: true`, with remote patterns allowed only for `upload.wikimedia.org` and
  `princetonlibrary.org`.

---

## 8. Known Gotchas

Traps that will otherwise be rediscovered painfully.

1. **The service-role client bypasses RLS.** Forgetting the ownership filter in a Model-A route
   leaks every user's rows and nothing will warn you. See §3.

2. **The Supabase schema is not in this repo.** No `.sql` file, no migrations directory. Tables,
   the `tournament_leaderboard_best` view, the `claim_tournament_attempt` RPC, and all RLS policies
   live only in the Supabase dashboard. Code comments reference a `migration.sql` that **does not
   exist here**. Never assume a table, column, constraint, or policy exists because code touches it.

3. **`npm run build` fails without a populated `.env`.** `src/lib/supabase-server.ts` validates env
   vars at *module scope*, so Next's "Collecting page data" phase throws
   `Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` at `/api/admin/registrations`.
   `src/lib/supabase-admin.ts` and root `lib/mongodb.tsx` throw at module scope too.

4. **`npm run lint` does nothing.** There is no ESLint config, so `next lint` opens its interactive
   "How would you like to configure ESLint?" prompt and exits **0** without linting anything.
   An exit code of 0 here means *nothing ran*, not *no problems*.

5. **Two MongoDB clients, two databases.** `@/lib/mongodb` (mongoose → `pharmawallah`) and the
   root `lib/mongodb.tsx` (native driver → `pharmacopedia`, cluster hostname **hardcoded**, imported
   via a relative `../../../../lib/mongodb` path). Importing the wrong one queries the wrong
   database and returns empty results with no error.

6. **`src/app/api/` contains plain data modules, not just route handlers.** `calculators.tsx`,
   `data.tsx`, `semester-data.tsx`, `team-members.tsx`, `physiology-data.ts`, `biochemistry-data.ts`,
   `contex/ToasetContex.tsx`, `mcq-data/*.ts`. Only `semester-data`, `team-members`, and `mcq-data/*`
   are imported. **`calculators.tsx` (419 lines) is dead** — the live tool registry is
   `HUB_SUBJECTS` in `src/app/(site)/calculation-tools/tool-index.ts`. Editing
   `calculators.tsx` changes nothing on screen.

7. **Two incompatible course-subject data shapes.** `src/lib/courses/types.ts` defines `SubjectMeta`
   (used by `registry.ts`), but nine files in `src/lib/courses/subjects/` use an older triplet
   shape — `*_META` + `*Units` + `*_DIFF_BADGE` — and export no `SubjectMeta`. They are not
   importable by the registry without conversion, and they are currently dead code.

8. **Only 4 of 14 subjects are registered.** `SUBJECTS` in `registry.ts` lists biochemistry,
   physiology, physical-pharmacy, and pharmaceutical-organic-chemistry. `natural-toxins.ts` is in
   the correct `SubjectMeta` shape but still absent from the array. The markdown content for the
   unregistered subjects already ships in `public/content/`.

9. **The calculator hub registry is hand-maintained and can drift.** 104 tool directories exist;
   `tool-index.ts` lists **93** (verified 2026-09-13 by cross-checking every slug against a
   `page.tsx`). Six of the difference are
   intentionally linked from `src/app/clinical/dose-calculators/page.tsx` (which links 9 tools; 3 are
   also on the hub); the other five
   (`AntagonismSimulator`, `EmaxModelCalculator`, `drug-half-life-calculator`,
   `OsmolarGapCalculator`, `OpioidConversionCalculator`) are linked from **nowhere** on the web —
   reachable only by typing the URL. Adding a directory does **not** add a row; add
   `{ name, slug, desc }` to its subject in `tool-index.ts`. (Since the 2026-09-13 hub rebuild tools
   are nested in their subject, so the old "in `allTools` but in no category" failure is gone.)
   **The Android app does not share this failure mode**: `mobile/app/_components/ToolHub.tsx`
   renders any generated slug that no category claims under an automatic "More Tools" group, so a
   tool can be mis-categorised there but never unreachable.

10. **`src/app/api/clinical/amr/route.ts` uses the browser client server-side** — `createClient()`
    (i.e. `createBrowserClient`) instead of `createServerSupabaseClient()`. It works only because
    it is an anonymous read against `amr_surveillance`. Don't copy this pattern.

11. **`src/app/api/comments/route.ts` rate-limits with a module-scope `Map`.** Per-instance and
    reset on every cold start — effectively no limit in serverless. Every other route uses Upstash.

12. **Entry-type → games/retries maps are duplicated** across `admin/codes/route.ts` and
    `admin/registrations/approve/route.ts`, and the admin email allowlist across three files.

13. **`Redis.fromEnv()` throws; `src/lib/redis.ts` returns `null`.** The tournament path
    (`tournament-redis.ts`) hard-fails without Upstash env vars; the progress path degrades quietly.
    Same service, two different failure modes.

14. **`/api/reviews` is in `PROTECTED_PATHS` but does not exist.** A `Review` mongoose model exists
    with no handler. Don't take the middleware list as a route inventory.

15. **Dead dependencies**: `next-auth` (auth is Supabase), `next-cloudinary`, `next-mdx-remote` —
    zero importers each. Seeing them in `package.json` does not mean they are in play.

16. **There is no PWA any more.** `next-pwa` was removed on 2026-09-12 — the offline story is the
    Android app. `public/workbox-*.js` is deleted and **`public/sw.js` is now a hand-written
    self-destructing service worker**: it unregisters itself and clears its caches, because every
    past visitor still had the old worker registered and deleting the file would not have released
    them. It is no longer generated, so it *should* be edited by hand, and it no longer appears in
    diffs after a build. `src/components/ServiceWorkerCleanup.tsx` does the same job client-side.
    **Both are temporary** — delete them, and `public/manifest.json`, once traffic has cycled
    through a release or two.

17. **Calculator pages are enormous single files** (1000–1900 lines, all `"use client"`). There is
    no shared calculator layout or shared input component. Adding a tool means copying the closest
    existing one — that is the actual convention, not an accident. **Exception (2026-09-13):** the
    shared kit in `src/components/calculators/` now exists, and new laboratory tools are built on it
    (see gotcha 36) — copy `theoretical-yield-calculator` for a new lab tool, not an old 1,500-line page.

18. **Calculators now have two consumers.** Every tool under `(tools)/` is compiled by both the
    web build and the Android build (`mobile/`), via generated re-export pages. A tool that starts
    importing `@/lib/...` or calling `fetch` breaks the offline app — see
    `.claude/skills/android-app-capacitor/SKILL.md`. Verified on 2026-09-12: all 89 import only
    `react`, `lucide-react`, `recharts`, `framer-motion`. Since then kit-based tools also import
    `@/components/calculators` and `@/components/ui/*` — pure client modules, safe offline. The
    rule is "no I/O, no server modules", not literally "no `@/`".

19. **`mobile/app/calculation-tools/<slug>/page.tsx` is generated and gitignored.** Editing one
    does nothing — it is overwritten by `scripts/generate-mobile-routes.mjs` on every
    `npm run mobile:build`. Edit the real tool under `(tools)/`.

20. **The mobile build never reads the root `.env`.** `next build mobile` loads env from `mobile/`,
    which has no `.env`. That is what keeps Supabase/Mongo/Upstash config out of a bundle that
    ships inside an APK — do not "fix" it by pointing the mobile build at the root env.

21. **`npm run build` and `npm run dev` share `.next` and will destroy each other's output.**
    Building while a dev server runs makes the dev site serve unstyled HTML (200 on `/`, 404 on
    every `/_next/static/chunks/*.js`) and makes the build fail with `PageNotFoundError:
    /_document` or dozens of `Cannot find module '…/.next/server/app/…/page.js'`. **Neither is a
    code defect** — do not go hunting for one. Stop dev first; recover with
    `rm -rf .next && npm run dev`. `npm run mobile:build` is safe alongside dev (separate
    `mobile/.next`).

22. **The root `tsconfig.json` must keep `"mobile"` and `"android"` in `exclude`.** Its `include`
    is `**/*.ts(x)`, which otherwise swallows `mobile/app/**`. Because the mobile route tree and
    `mobile/app/_generated/tool-slugs.ts` are **gitignored**, a fresh clone (Vercel!) has
    `ToolHub.tsx` importing a module that does not exist — `next build` then fails the type-check
    and **the whole web deployment breaks**, with an error pointing at `mobile/`, nothing to do
    with the site. `.vercelignore` keeps both directories out of the upload as well. The mobile
    build is unaffected: it uses `mobile/tsconfig.json`.

23. **Two Tailwind traps in the mobile build — both fail SILENTLY as an unstyled app.**
    (a) `next build mobile` runs with cwd at the **repo root**, so Tailwind's config
    auto-detection finds the *web* `tailwind.config.ts`, not `mobile/`'s.
    `mobile/postcss.config.mjs` therefore names the config file explicitly.
    (b) Tailwind resolves `content` globs against the **process cwd, not the config file**, so
    `mobile/tailwind.config.ts` writes them repo-root-relative (`./mobile/app/**`,
    `./src/app/(site)/calculation-tools/**`) and throws if they do not resolve. `__dirname` is not
    a workaround — Tailwind's TS config loader reports it as `"."`.
    Symptom of either: the build succeeds and the stylesheet is ~10 KB instead of ~96 KB.
    **Check the CSS size, not the exit code.**

24. **`font-sans` used to override the site font.** Tailwind's `sans` family now points at
    `var(--font-outfit)` in `tailwind.config.ts`. Before that, the ~10 pages/components with
    `font-sans` on their root element silently rendered in system-ui instead of the body font.
    If you ever introduce a second font, change it in **both** places (the `next/font` call in
    `src/app/layout.tsx` **and** `theme.extend.fontFamily.sans`) or they will disagree.

25. **A backtick inside a styled-jsx template literal ends the string.** Writing a CSS comment that
    quotes a class name in backticks inside `` <style jsx>{`…`}</style> `` produces a cascade of
    `TS1005: '}' expected` errors pointing at unrelated lines. Use plain words in those comments.

26. **The dev server caches `tailwind.config.ts`.** Editing the Tailwind config while `npm run dev`
    is running does **not** reliably rebuild the stylesheet — the old utilities keep being served.
    Verify a config change with
    `npx tailwindcss -c tailwind.config.ts -i in.css -o out.css --content <some file>` (which is
    independent of `.next`), or restart dev. Do not conclude the config is wrong from dev's output.

27. **This is Next 14, not 15/16.** `cookies()` and `headers()` behave as in 14. Some files already
    `await` them (forward-compatible and harmless); don't "fix" either style, and don't apply
    Next 15/16 migration advice here.

28. **A web `layout.tsx` never reaches the Android app** — and this is the only cheap way to add
    anything to all 89 calculators at once. `scripts/generate-mobile-routes.mjs` emits
    `export { default } from "<tool>/page"`, i.e. it re-exports the **page component only**, so
    layouts, route groups and their wrappers in `src/app/(site)/**` are invisible to `mobile/`.
    `src/app/(site)/calculation-tools/(tools)/layout.tsx` uses this deliberately to give every
    tool a web-only ad placement. The corollary is the trap: **anything a tool genuinely needs on
    both surfaces must live in the page or in a shared component, never in a layout.**

29. **Ad slots must not sit inside an animated or transformed parent.** A `framer-motion` wrapper
    with `whileInView` opacity/transform around an `<ins class="adsbygoogle">` breaks AdSense's
    viewability measurement and risks a policy violation, so every placement in this repo is a
    plain `<div>`. This is why the calculator-hub ad sits *before* the `motion.div` category
    sections rather than inside one.

30. **Two more placement traps, both already paid for:**
    (a) The course lesson ad is **outside** `printRef` in
    `src/components/course/UnitPageClient.tsx` — inside it, `PdfDownloadButton` would rasterise
    the ad into the downloaded PDF.
    (b) Placements are gated on content existing (`{content && …}`, `filteredCategories.length > 0`)
    because AdSense forbids ads on a page with no content — the "content file not found" and
    "no search results" branches are exactly that.

31. **`.env` is gitignored, so anything gated on an env var is OFF in production** until it is
    also set in the Vercel project. This cost a failed AdSense site verification: the publisher ID
    was in `.env` only, the root layout's loader was conditional on it, and the deployed site
    served **zero** AdSense code while everything looked correct locally. The publisher ID is now
    a hardcoded constant with an env override in `src/app/layout.tsx` — it is a **public**
    identifier (it ships in `/ads.txt` and in every page's HTML), so hardcoding it is correct, not
    a leak. **Diagnose "it works locally" reports by curl-ing the live host, not the dev server.**

32. **`next/script` `strategy="afterInteractive"` is invisible to crawlers.** It is injected by the
    Next runtime after hydration, so it is not in the server-rendered HTML. Anything a third party
    must *find* in the markup — an ad loader, a verification tag — needs
    `strategy="beforeInteractive"` in the root layout (which lands it in `<head>`) or a
    `generateMetadata` entry. The AdSense loader and the `google-adsense-account` meta tag both do
    this now; verified against `npm run build` + `next start`, not dev.

33. **The apex domain redirects.** `https://pharmawallah.com/…` answers **307** to
    `https://www.pharmawallah.com/…`. The canonical host is **www**. Both serve `/ads.txt` as 200.
    Any external verifier, webhook or callback should be pointed at the www host.

34. **The home landing page has no ad placements** — removed at the user's request on 2026-09-13
    (it used to have three `AdBand`s). The one `ins.adsbygoogle` in its DOM is the loader's own
    hidden, unfilled probe, injected by `adsbygoogle.js` from the root layout — not a placement.
    Only Auto ads, if switched on in the dashboard, could put an ad on `/` now.

30. **`src/app/globals.css` will fight any bespoke page, in three ways that are easy to misdiagnose.**
    (a) `html { scroll-behavior: smooth }` desynchronises every scrubbed GSAP ScrollTrigger and
    fights ScrollToPlugin — the landing page adds `html.pw-idx-mounted { scroll-behavior: auto }`
    for as long as it is mounted. (b) `ul:not(.prose ul)` and `li:not(.prose li)` put bullets,
    `pl-6` and a fixed grey on *every* list on the site, including a Radix menu's `<ul>`; their
    `:not()` makes them out-specify plain Tailwind utilities, so `!list-none` / `[&>li]:!m-0` is
    the only thing that wins. (c) `input { background-color: #fff !important }` repaints any dark
    form control. Neutralise these inside your own namespace; do not edit the rules.

31. **shadcn's `NavigationMenuContent` must keep `md:w-auto`.** The Viewport takes its width from
    the measured content, and the content's default class is `w-full`. Drop `md:w-auto` and the two
    settle at zero: the trigger reports `data-state="open"`, no error is logged, and the panel is a
    1px sliver. Also note the viewport carries **no** `data-radix-navigation-menu-viewport`
    attribute in 1.2.x — don't query for it.

32. **`tailwindcss-animate` was a devDependency that `tailwind.config.ts` never registered** (fixed
    2026-09-12). Every shadcn `animate-in` / `fade-in` / `data-[state=open]:zoom-in-95` class
    compiled to nothing, silently. If a shadcn component's enter/exit animation does nothing, check
    `plugins` first.

33. **GSAP lives only in `src/components/Home/landing/`.** The library plus ScrollTrigger is ~70 KB
    and the site has ~170 routes; every other surface uses `framer-motion` (`CLAUDE.md` §6 rule 13).
    The footer wordmark is animated with IntersectionObserver + CSS for exactly this reason. All the
    landing page's timelines are created inside one `gsap.matchMedia(root)` in `useIndexMotion.ts`
    so `mm.revert()` on unmount kills them — a pinned ScrollTrigger that survives a client-side
    navigation breaks the *next* page's scrolling, with nothing in the console to say why.

34. **The site header's in-flow spacer must match the header's real height.** `Header/index.tsx`
    renders a `fixed` bar and then a spacer div; the spacer was `h-[64px] lg:h-[68px]` under an
    ~88px bar, so the first ~20px of every page rendered behind the nav (invisible on pages whose
    first section is a tall centred hero, obvious on anything that starts with a band). The header
    now has a deterministic height and the spacer quotes the same numbers — change both together.

35. **shadcn's `NavigationMenuList` ships a bare `group` class, and it will hijack every
    `group-hover:` inside a nav item.** Tailwind's `group-hover:` compiles to `.group:hover &`,
    which matches *any* `.group` ancestor — so a hover underline written on one link lit up on all
    six the moment the pointer entered the list. Fixed by renaming the list's class to
    `group/menu`. Whenever a shadcn component nests `group` inside `group`, name the outer one.

36. **Laboratory tools share a lab-record layer — describe the result once.** `LabReportData`
    (`src/components/calculators/LabReport.tsx`) is rendered by `LabReport` on screen, by
    `reportToText` for Copy, by a canvas painter for the PNG card and by `printReport` in a hidden
    iframe. Build the object in one `useMemo`; never hand-write a second copy for the download, or
    the card drifts from the screen. A chart in the PNG/print must be passed as **self-contained SVG
    markup** (literal colours, `font-family`, `xmlns`) — an SVG inside `<img>` cannot see page CSS,
    so a Recharts `<svg>` using `hsl(var(--border))` renders blank or black.

37. **The root `tsconfig.json` has no `target`**, so TypeScript assumes ES3/ES5 for iteration:
    `for (const [i, x] of arr.entries())` and `for…of` over a `Map`/`Set` fail with TS2802
    ("can only be iterated through when using '--downlevelIteration'"). Use index loops,
    `forEach`, `Array.from(...)` or `Object.entries`. Not worth changing the config for.

38. **Calculator-to-calculator hand-offs go through the query string**, built with
    `calculatorHref(slug, params)` and read with `readQuery()` inside a `useEffect`. Reading the URL
    during render mismatches the server HTML, and `useSearchParams` needs a Suspense boundary in the
    static APK export. `calculatorHref` adds the trailing slash only in the app
    (`trailingSlash: true` + Capacitor's directory → `index.html` resolution).

39. **A tool directory may hold underscore-prefixed sibling modules** (`_math.ts`, `_parts.tsx`) —
    `uv-spectrum-plotter/` and `serial-dilution-calculator/` do. The App Router only routes
    `page.tsx`, and `scripts/generate-mobile-routes.mjs` re-exports the page, whose relative
    imports resolve normally, so the APK picks them up. Don't name a sibling `page`/`layout`.

40. **Blob downloads and `window.print()` do nothing in the Android WebView.** `LabActions` hides
    Download card and Print when `NEXT_PUBLIC_IS_MOBILE_APP` is true rather than showing dead
    buttons; the UV plotter hides its PNG/CSV buttons the same way. Copy is the APK's export path.

41. **tailwind-merge reads an arbitrary `bg-[…]` value as a background COLOUR.** `cn("bg-background
    bg-[length:1.25rem] bg-[right_…]")` silently drops `bg-background`. `SelectField` shipped that
    way: invisible on the web (globals.css forces `select{background:#fff!important}`), UA-grey in
    the APK. Use arbitrary *properties* — `[background-size:1.25rem]` — for size/position. Fixed
    2026-09-13; check any other `cn()` call mixing a `bg-*` colour with `bg-[…]`.

42. **GSAP renders a `from`/`fromTo` start state inside the constructor**, which fires `onUpdate`
    before `const tween = gsap.fromTo(…)` is assigned — a TDZ `ReferenceError`, hundreds per second
    on the landing page. Read the tween as `this` in the callback (`onUpdate(this: gsap.core.Tween)`).
    Reduced-motion testing never runs that code path; it was caught only in full motion.

43. **`-webkit-text-stroke` (and SVG `stroke` on `<text>`) draws Outfit's contour overlaps.** Outfit is
    a variable font built from overlapping contours, so an outlined glyph shows stray lines through
    P, R, A, H, 3. Use a filled ghost (low-alpha fill) for large decorative type.

44. **GSAP leaves an inline `transform` behind after a `from` tween**, which outranks any stylesheet
    transform on the same element — a CSS tilt, a `:hover` lift. Add `clearProps: "transform"`, or
    restate the CSS transform in the tween (the Index numeral carries `rotation: -4`).

45. **Screenshotting a `100svh` page by resizing the viewport to the page height is wrong.** The hero
    grows to thousands of pixels and everything appears blank. Keep a real viewport and use
    `Page.captureScreenshot { captureBeyondViewport: true, clip }`.

46. **More than one Claude session may be editing this repo at once.** On 2026-09-13 two sessions
    worked in `src/components/calculators/` concurrently. Before editing a shared directory, check
    `git status` for files you did not create and `ListAgents` for peers; agree file ownership, keep
    exported props stable, and re-read knowledge files before syncing them.

47. **Hand-typed figures drift, and several already have.** Measured 2026-09-13: the `/spotting` hub
    hard-codes `lessonCount: 8` per category and "24+" total (real: 17 / 15 / 3 = 35); the calculator
    hub printed `allTools.length` as "86+" (97 tools existed — fixed 2026-09-13, the count is now derived); every course unit's `readTime` is typed by
    hand and understated up to 2.3× against its markdown. **Derive a count from the list it counts**
    (the landing page's `STATS` is the one place a number is deliberately a constant, and it is
    documented). New UI should use `Figure` from `@/components/page-kit`, which requires a label and
    carries a `note` for estimates.

48. **The dashboard's course navigation is a hard-coded `SEMESTERS` list** in
    `src/components/dashboard/dashboard-shared.ts`, with `/courses/sem-1/<slug>` hrefs — the route is
    `/courses/<slug>`, and 8 of its 12 subjects are not registered. **All 12 links 404**, as do the
    `/pharmacovigilance` and `/adverse-reaction-sleuth` quick links. Anything that lists courses must
    read `SUBJECTS` from `@/lib/courses/registry`.

49. **Rendering a component outside Next (a quick SSR check with `npx tsx`) fails with
    "React is not defined"** because the root `tsconfig.json` has `"jsx": "preserve"` and tsx then
    uses the classic transform. Pass a throwaway tsconfig that extends the root one with
    `"jsx": "react-jsx"` (`npx tsx --tsconfig <tmp>.json <file>`), and delete both temp files after.

50. **Science Fair 2026 is over (2026-09-13).** `LaunchPopup` (was mounted site-wide in `AppShell`) and
    `OfficialLaunchBanner` (was on the landing page) are **unmounted but still on disk**. The CDP
    recipe's `localStorage.pw_launch_banner_dismissed_at` preset is harmless but no longer needed.
    The landing hero also no longer has its meta strip or PKT clock.

51. **`position: fixed` + `backdrop-filter` is the site's main scroll-lag source.** The browser
    re-blurs whatever scrolls underneath on every frame. Measured 2026-09-13 (headless Chrome,
    80 real mouse-wheel events, frames > 50 ms): `/` 33 with the landing timeline bar → 21 without
    it → 9 with the header's `backdrop-blur-xl` also disabled; `/calculation-tools` 35 → 7 with the
    header blur off. A CPU profile showed the cost as native paint, not JS. Use an opaque or
    near-opaque background on fixed bars instead. Scroll handlers that read `scrollHeight` or
    `getBoundingClientRect` per event add forced layout on top — batch them in one rAF and cache
    measurements. Recipe: CDP `Input.dispatchMouseEvent` `mouseWheel` ×80 with a page-side rAF
    frame-delta recorder and `Performance.getMetrics` before/after; compare pages relatively
    (headless is software-rasterised, so absolute fps is pessimistic).

52. **The theme is the blue→green brand gradient, never black (user rule, 2026-09-13).** Any strong
    surface — a panel, a cover hero, a primary button — uses `BRAND_SURFACE` (40% navy scrim) or
    `BRAND_BUTTON` (30% scrim) from `src/components/page-kit/brand.ts`, or the matching
    `--brand-surface` / `--brand-button` vars on the landing page. Raw brandGreen is only 2.61:1
    under white text; the scrims bring it to 5.72:1 / 4.60:1. White (or white/90) text only; never a
    green icon on it — it disappears at the green end. This supersedes the "warm ink" grounds of
    the 13 Sep design pass; ink #16181d remains a *text* colour.

53. **The "educational purposes only" calculator disclaimer is mounted in exactly two places** —
    `src/app/(site)/calculation-tools/(tools)/layout.tsx` (web, every tool, under the tool) and
    `mobile/app/_components/MobileShell.tsx` (APK, tool pages only; not the app home). The component
    is `src/components/calculators/CalcDisclaimer.tsx`. Never render it inside a tool page too, or it
    appears twice on both surfaces. It is the gotcha-28 split in action: a web layout never reaches
    the APK, so the app needs its own mount.

54. **A master formula has two ingredient "units" that must never be multiplied**
    (`(tools)/master-formula-calculator/_scale.ts`): `%` is a concentration (10% stays 10% at any batch
    size) and `q.s.` has no amount (it becomes "q.s. to <required quantity>"). Scaling either gives a
    wrong formula, not a smaller one. The batch-size units convert within a family (mL↔L, g↔kg) but a
    count unit (tablets, capsules, suppositories) only scales against itself.

55. **A `<style jsx global>` animation in dev starts when styles attach at hydration** (~2.5 s on a
    cold dev page), not at first paint. A delayed animation with `animation-fill-mode: both` or
    `backwards` therefore holds its FIRST keyframe for the whole delay — the header app CTA's arrow sat
    invisible that way. Write keyframes that start and end on the element's resting state and use no
    fill mode, so a late or never-running animation cannot leave anything hidden.

56. **Two headless-testing traps that look like app bugs.** (a) `Page.captureScreenshot` with
    `captureBeyondViewport: true` composites `position: fixed` layers wrongly — the header appears
    mid-page and an opaque mega-menu panel looks translucent with the hero bleeding through. Confirm
    with `document.elementFromPoint` + computed `background-color`, or a plain viewport screenshot,
    before "fixing" it. (b) Successive `Runtime.evaluate` calls share one global scope, so a second
    `const q = …` throws `SyntaxError: Identifier 'q' has already been declared`, the setter never
    runs, and the page appears to ignore input. Wrap each expression in an IIFE.

57. **The site header switches to its desktop layout at `xl` (1280px), not `lg`.** From 1024–1279px
    the six nav items + the app CTA + the auth buttons do not fit, and flexbox crushed the logo
    (113px of 214 before the CTA existed, 6px after). `MegaMenu.tsx`'s `xl:flex`, the header's
    `hidden xl:flex` cluster and the compact bar's `xl:hidden` must change together. The logo is
    `shrink-0` from 380px only; at 360px (the commonest Android width) it gives a little instead of
    pushing the menu button into the gutter. The `lg:` height classes are unrelated and stayed.

58. **The favicon set is generated, not drawn:** `src/app/favicon.ico` (16/32/48), `src/app/icon.png`
    (256, transparent) and `src/app/apple-icon.png` (180, white ground) were produced on 2026-09-13
    from `public/icons/icon-512x512.png` by cropping the mark and un-matting its opaque white ground
    with a colour-to-alpha pass (so the tab icon has no white box or halo in dark browser themes).
    Next's file convention emits all three `<link>`s; there is no `icons` entry in metadata. The
    previous `favicon.ico` was a mis-cropped 16px slice with a sliver of the wordmark's "P".

59. **A tracker that fires in a mount effect used to lose its event.** `useSupabaseUser()` starts at
    `user = null` and resolves `getSession()` asynchronously; `useTracker` dropped anything tracked
    before that. `UnitTracker` and the pathology spotting pages track on mount, so `unit_progress`
    and `spotting_progress` held **zero rows for every account** until 2026-09-13 (quizzes survived:
    they fire later). `useTracker` now holds events until the session resolves. Any new hook that
    acts on `user` from a mount effect has the same trap — wait for `loading === false`.

60. **`globals.css` list rules beat a one-class namespace.** `ul:not(.prose ul)` has specificity
    (0,1,2) because `:not()` takes its argument's; `.pw-dash ul` is (0,1,1) and loses, so lists show
    bullets and "1." markers. Double the class (`.pw-dash.pw-dash ul`) as the landing page does.

61. **A grid with no explicit column lets a `truncate` child widen the page.** `grid lg:grid-cols-12`
    is a single *auto* column below `lg`, sized to min-content — a long truncated label made the
    dashboard 756 px wide on a 390 px phone. Give such grids `grid-cols-[minmax(0,1fr)]`.

62. **Dashboard facts (2026-09-13).** `unit_progress` has `completed`, `read_count`, `time_spent_min`;
    `spotting_progress` has `completed` (read from the PostgREST schema, not from code). `completed` is
    set only by an explicit Mark as read and never cleared. `/api/progress` returns activity for the
    last 91 days (≤600 rows) — keep `ACTIVITY_WINDOW_DAYS` in `dashboard-data.ts` in step. The dashboard
    theme class sits on its own root, never on `<html>`, so it cannot leak to other pages.

63. **`src/app/loading.tsx` is the site-wide route loading UI** (Suspense fallback for every segment
    without a nearer `loading.tsx`; `/dashboard` has its own). It renders inside the root layout, so
    the header and footer stay. `.pw-loader-page` is invisible for 320 ms and then fades in — that
    delayed, fill-mode reveal is deliberate (a fast navigation must flash nothing) and is the one
    exception to gotcha 55. The same `PharmaLoader` is the Android splash's mark; keep it CSS-only
    with plain classes (no hooks, no Tailwind), or it stops animating before hydration and loses its
    styles in the APK. Its steps use modifier classes, not `:nth-of-type` — the separator dots are
    spans too.

64. **A temporary preview route leaves a stale stub in `.next/types` after you delete it**, and
    `npx tsc --noEmit` then fails with `TS2307: Cannot find module '…/src/app/<route>/page.js'` from
    `.next/types/app/<route>/page.ts`. Not a source error. Delete that `.next/types/app/<route>`
    directory (or restart dev). Check the error's path before blaming — or crediting — a code change.

65. **framer-motion reveals make a page look slow, not just animate it.** `initial={{opacity:0}}` /
    `whileInView` render `opacity:0` into the server HTML, so nothing shows until the JS downloads and
    hydrates. The old `/calculation-tools` shipped **97** hidden elements: with JavaScript disabled the
    live page showed **0 of 78** tool links and an invisible h1 (measured 2026-09-13, CDP
    `Emulation.setScriptExecutionDisabled`). On listing and index pages, render the content visible
    and put motion on hover/focus. Check with that no-JS render, which is cheap and conclusive.
    Also: a long list of `<Link>`s to dynamic routes prefetches every visible one; the hub sets
    `prefetch={false}` and relies on the root `loading.tsx` for instant feedback.

66. **The site header retracts while you scroll down** (`Header/index.tsx`: `retracted` once scrollY >
    600, shown again on scroll-up). It is fixed at 60px tall when scrolled on phones and 64px from lg.
    Any `position: sticky` element placed under it (`top: 60px`) shows a strip of scrolling content
    above it while the header is hidden. The hub's rail follows the header: a `MutationObserver` on
    the header element's own `style` attribute (it changes on toggle, not per frame — the progress
    bar writes to a child) sets `data-header-hidden`, and CSS translates the rail up by the header
    height with the header's 380 ms curve. Copy `HubCatalogue.tsx` rather than adding a scroll
    listener. It selects the header by `header.fixed.top-0`, so update that selector if the header's
    classes change.

67. **The analytical-practical tools reproduce the Pharm-D practical sheets on purpose — do not
    "correct" them to textbook formulas.** Dissolution corrects with CF = (Vs/V) × *previous corrected*
    concentration (`dissolution-calculator/_dissolution.ts`); the standard Σ C·Vs correction exists only
    as the labelled Method B in `cumulative-drug-release-calculator`. Dialysis uses
    B = (C2/C1) × (1 + V2/V1) and ln(1 − B), where **B is not the calibration slope b** (both letters
    appear on the page, deliberately labelled apart). Partition reports **1/(average log D), never 1/D**,
    and shows [H+] beside the sheet's "1/[H+]" column. A user asked for exactly these; changing one
    silently gives a student a number that no longer matches their sheet.

68. **Two calibration-line spellings, one line.** The Calibration Curve Calculator writes Y = mX + c;
    the four consumer tools write Y = a + bX. The hand-off maps **a = c (intercept), b = m (slope)** —
    swapping them is the easy bug. It travels as `?a=&b=&unit=` (read once, in `CalibrationFields`' mount
    effect — render only one `CalibrationFields` with `readFromUrl` per page) and as `localStorage`
    `pw_lab_calibration_v1`, applied only when the student presses "Import saved calibration". Values
    go through `precise()` (12 significant figures), never a display-rounded string.

69. **`@/components/calculators/lab-analysis` (index) loads React UI.** A pure maths module that must run
    in Node for a hand-check (`npx tsx`) imports `lab-analysis/math` and `lab-analysis/format`, and
    `@/components/calculators/lab-math`, directly — not either barrel. The same applies to `numericError`,
    which lives in `parts.tsx`.

70. **Recharts 3 `ResponsiveContainer` logs "width(-1) and height(-1) of chart should be greater than 0"**
    on its first render before it measures its box. `ChartPanel` passes `initialDimension` to silence it;
    a raw `ResponsiveContainer` elsewhere needs the same. Harmless, but it pollutes a zero-warnings check.

71. **With several sessions editing, the dev server serves transient broken chunks.** Symptoms seen
    2026-09-13: `SyntaxError: Invalid or unexpected token @ …/chunks/app/layout.js:<line>`,
    `ChunkLoadError: Loading chunk app/layout failed`, a page that renders but never hydrates (buttons
    have no `__react*` keys, clicks do nothing), and a first load of a cold route whose mount effect's
    state was lost to a Fast Refresh remount. **Re-run before debugging**: check hydration first
    (`Object.keys(button).some(k => k.startsWith("__react"))`), and wait ~15 s after navigation. Every one
    of these cleared on retry without a code change.

72. **The `pharmacopedia` drugs live in three collections with no overlap** — `drugsdata` 4,681,
    `drugsdata_0` 5,033, `drugsdata_1` 2,959 = **12,673** unique DrugBank IDs (measured 2026-09-13; the
    old encyclopedia page claimed "17,430+"). Any query must cover all three *as one set*: paginating
    each and concatenating returned un-ranked, skipping pages and a `total` from collection one only
    ("aspirin" said 0 while showing 2). `/api/search` now uses one `$unionWith` aggregate that projects
    to small fields before `$sort`/`$facet` and then hydrates the page by `_id`. No indexes exist beyond
    `_id` (plus an unused text index on `drugsdata`), so every search is a collection scan — keep the
    projection before the sort. Interaction lists hold ≤100 rows and products ≤5 per drug: they are
    samples, so never print their sum as "N interactions/products".

73. **`Number(null)` is `0`, not `NaN`.** A clamp written as `Number(param)` + `Number.isFinite` turns an
    *omitted* query param into 0 and then into the minimum — `/api/search` without `limit` returned one
    row. Test for `null`/empty first. Every earlier test passed `limit=10` explicitly, which hid it.

74. **DrugBank prose carries markup you must clean, not render.** Citation markers seen in a 1,200-record
    sample: `[A19399]`, `[A220318,L16408]`, `[A330, A259686]`, `[FDA Label]`, `[label,T116]`, `[MSDS]`,
    `[PubChem]`, `[PMID: 8959472]`. A lower-case bracket is a drug mention (`[codeine]`, `[insulin
    glargine]`) — linkable. Other brackets are content (`[Rat]` after an LD50, `[18F]`) and must stay.
    Paragraphs may be split by a whitespace-only line (`\n \n`), bold lines are sub-headings.
    `src/components/encyclopedia/prose.tsx` handles all of it without HTML injection. Also: the
    calculated "Traditional IUPAC Name" is wrong in places (Morphine's reads "dexamethasone phosphate")
    — the monograph omits that property.

75. **British names the DrugBank synonyms do not cover:** only `aspirin`, `paracetamol` and `lignocaine`
    of the common ones checked (salbutamol, adrenaline, frusemide, pethidine, rifampicin, glibenclamide,
    thyroxine, hyoscine, ciclosporin all resolve through synonyms). `/api/search` aliases those three,
    and ranks an exact synonym (90) above a name that merely contains the query (60), so "salbutamol"
    opens Albuterol, not Levosalbutamol.

76. **Calculator originals for before/after checks live at commit `5dbe98c`** — the user's `12adf1b` commit
    captured half-verified migrations, so HEAD is not "before". Serve the original on a temporary route
    `src/app/migration-before/<label>-<slug>/page.tsx` (outside `(site)`/`(tools)`: the mobile route
    generator only scans `(tools)`), capture, and delete it at once — it would ship as a public page and
    leaves a stale `.next/types` stub (gotcha 64). Several sessions share that parent: delete only your
    own prefixed dirs.

77. **Headless Chrome for parallel runs must use `--remote-debugging-port=0`** and read the port from
    `<user-data-dir>/DevToolsActivePort`. A random port from a fixed range let one agent attach to
    another agent's browser (a screenshot came back titled with the other agent's calculator). Also
    wait ~300 ms after killing Chrome before removing its profile dir, or `rmSync` throws ENOTEMPTY.

78. **Migrating a calculator must not change its numbers — and the originals are wrong in ~70 places.**
    The migration rule is: identical outputs for identical inputs; a formula that looks wrong is
    *reported* (tracker → "Suspected maths issues"), never silently fixed; a stale-state render bug
    (value left over from earlier inputs) may be fixed if stated. So a migrated page is not a
    corrected page. The worst live faults are in the clinical-only opioid tools and creatinine staging.

79. **Lesson questions join the MCQ bank by an explicit table** (`src/lib/courses/lesson-questions.ts`),
    not by unit number — the Organic Chemistry bank's units 3/4 are swapped relative to the course.
    Registering a new subject needs a row there too, or `LessonCheckpoint` renders without questions
    (degrades cleanly). "Mark as read" is the student's click only and never waits on the questions
    (user decision); lesson sets are stored as `quiz_attempts` with quiz_id prefix `lesson:`.

80. **The Android launcher icon lives only in `android/app/src/main/res/mipmap-*`, and it is generated.**
    `cap sync` never touches `res/`, so the Capacitor "X" placeholder shipped in v1.0 and v1.1 even
    though the in-app splash was branded. Since 2026-09-14 the adaptive icon is the PharmaWallah mark
    on white (`@color/ic_launcher_background` #FFFFFF), with a `monochrome` layer for Android 13 themed
    icons; all PNGs come from `public/icons/icon-1.png` (the highest-resolution copy of the mark) — the
    procedure is in the `android-app-capacitor` skill. The Android 12+ system splash
    (`Theme.SplashScreen`) and `drawable/launch_screen.xml` both draw `@mipmap/ic_launcher`, so they
    follow the icon automatically. **A changed icon reaches phones only with a new APK** — the APK in
    `public/downloads/` is not rebuilt by editing `res/`.

---

81. **A GSAP `fromTo` inside a timeline renders its *from* state when the timeline is built**, not when its
    position is reached. On the Serial Dose rack that dimmed every later tube's concentration for seconds before
    the drop arrived. Anything that must stay readable until its moment needs `immediateRender: false`.

82. **Replacing a whole CSS section by slicing between two comment banners silently deletes anything
    else that lived inside it.** On 2026-09-16 the `/about-us` hero band was swapped for the roster
    stage by replacing the text between `/* ══ Hero ═` and `/* ══ Role band ═`. The figure-strip rules
    sat inside that band, so `.pw-about-figs` and its five children lost every rule and the figures
    rendered as a column of loose text — and a follow-up edit to `margin-top: 3rem` then matched
    nothing and no-op'd, with no error. **`tsc`, the build, 29 behavioural CDP assertions and three
    screenshots all still passed**, because none of them photographed that strip or asserted its
    geometry. The user spotted it. Two habits fix it: after editing a namespaced stylesheet, diff the
    class names used in the TSX against the selectors in the CSS (a ten-line script — missing AND dead
    both matter), and assert layout on **geometry** (`display`, `gridTemplateColumns`, whether items
    share a top edge), not on an element merely existing.

83. **`pkill -f "next dev"` kills the shell running it**, because the pattern matches that shell's own
    command line. It looks like the build crashed (exit 144, no log written). Select the pid instead:
    `ps -eo pid,args | grep -E 'node.*next.*dev|next-server' | grep -v grep`.

84. **A ScrollTrigger `toggleClass` needs an `endTrigger` when the class must outlive its trigger.**
    `trigger: stage, start: "bottom 70%"` with no end defaults to the stage's own `bottom top`, so the
    class was removed again the moment the stage scrolled away and the /about-us chapter rail vanished
    for the rest of the page. Pointing `endTrigger` at the page instead then kept the rail lit over the
    site footer, where its ink ticks sat unreadable on the footer's links. It ends at the closing band.

85. **`/about-us` no longer uses GSAP** (rebuilt 2026-09-16 as a simple card page with the page kit's
    `Reveal`). It was briefly the fourth GSAP exception; that version is in `cfda61a`. Gotchas 82 and
    84 describe that version's stylesheet and ScrollTrigger and apply to it only.

86. **The team roster lives in `src/lib/team.ts`**, not `src/app/api/team-members.tsx` (moved
    2026-09-16, old file deleted). One `ROSTER` array of `{name, role, campus?}` is the only thing to
    edit; the group, monogram, gradient angle, anchor id and the card **description** are derived. The
    description comes from `ROLE_NOTE` (what the role does — never a made-up personal bio), falling back
    to the group blurb. A role missing from `ROLE_GROUP` files the person under "Team" rather than
    dropping them. **A new role needs a `ROLE_GROUP` entry and a `ROLE_NOTE` entry.** `campus` defaults
    to "University of Karachi", which was never in the original team data — the page does not print it.
    Photos: `photo` (path under `public/images/team/`) + `photoStyle` — `"portrait"` is a pre-cropped
    head-and-shoulders square shown `object-cover`; `"sticker"` is a whole captioned sticker shown
    uncropped (`object-contain`). Crop/square the source with PIL **after compositing its alpha onto
    white** — the pasted webp files are transparent and `convert("RGB")` turns that black. Pasted
    images land in `~/Downloads/<uuid>.webp`. Flip cards: headless Chrome reports `hover: none`, so
    test the flip with keyboard focus or touch, not a mouse move.

87. **An OpenCV.js `Mat.data` / `data32S` / `data32F` is a view into the WASM heap, and it silently
    becomes empty when any later allocation grows the heap.** No error — loops over it just see length
    0. The colony detector found 0 colonies only when the plate circle was *supplied*, because the
    plate finder it skipped had pre-grown the heap. Rule in `colony/detect.ts`: take `.slice()` copies
    of anything used after another `new cv.Mat()`/OpenCV call, and re-fetch a view you write through
    after each allocation. Values already written survive growth (the heap is copied).

88. **`cv.watershed` does not flood on pixel values.** It prioritises pixels by the local colour
    difference to their neighbours, so feeding it an inverted distance map (a near-constant gradient)
    or a photo of flat-topped colonies lets one lobe swallow its neighbour. The colony detector keeps
    OpenCV for the distance transform and components and floods the distance map itself (a max-heap
    Meyer flood in `detect.ts`). Measured on the synthetic plates: pairs split 5/6 cleanly, versus
    lopsided or missed splits with `cv.watershed`.

89. **OpenCV.js ships as a static asset, not a bundled module.** `new URL("@techstark/opencv-js/dist/
    opencv.js", import.meta.url)` in `colony/opencv.ts` makes webpack emit it to
    `_next/static/media/opencv.<hash>.js` (10.8 MB, WASM embedded) — in both the web build and the APK
    export. It is loaded only by the colony counter, via `importScripts` in the worker or a `<script>`
    fallback; shared JS stayed 88 kB. Next **minifies** the file in production (10,872,779 → 10,789,404
    B) and it still works — verified on `next start` and in the APK export. The Emscripten module object
    is **thenable**: resolving a Promise with it recurses forever, so `waitForCv` resolves a wrapper and
    deletes `then`. Keep OpenCV out of every other import path.

90. **The APK secret scan's `eyJ` pattern false-positives on `opencv.<hash>.js`** — `eyJ` occurs inside
    its base64 WASM. Use a JWT-shaped pattern (`eyJ[A-Za-z0-9_-]{10,}\.eyJ`) or exclude
    `_next/static/media/opencv.*` and check `supabase\.co|UPSTASH` separately. Checked 2026-09-16: no
    real secret.

91. **Capacitor only opens the camera for `<input type="file" accept="image/*" capture>`** —
    `BridgeWebChromeClient` tests `acceptTypes.contains("image/*")` exactly. A specific list
    (`image/jpeg,image/png`) gets the file picker only. Both camera tools therefore render two inputs:
    `image/*` + `capture="environment"` for "Take photo", the explicit list for the gallery. The
    manifest declares no `CAMERA` permission, which is what lets Capacitor launch the camera intent
    without a runtime prompt (it asks only when the permission is declared but not granted).

92. **`pkill -f`/`pgrep -f` match the whole command line of the shell that runs them** (extends
    gotcha 83): a pattern that appears *anywhere* in the same Bash call — including the `npx next
    start -p 3217` that started the server three commands earlier — kills that shell (exit 144). Use a
    bracketed pattern that cannot match itself (`pkill -f "http[.]server 8899"`) in a call that does not
    also contain the literal, or kill by pid from `ss -ltnp`.

93. **The user may restart `npm run dev` mid-session.** A dev server stopped at the start of a task was
    back on :3000 an hour later, and a production build then 404'd all its chunks (Known Issue 10).
    Check `ss -ltn | grep :3000` **immediately before** every `npm run build`, not once per session.

94. **Unlayered rules in `mobile/app/globals.css` beat Tailwind utilities of equal specificity** (they
    come after `@tailwind utilities`). `.pw-space { position: relative }` silently cancelled `sticky` on
    the tool app bar. Custom classes there must not set properties a utility is expected to control;
    put `relative`/`sticky` in the markup.

95. **pnpm in the VS Code snap resolves a different store** (`~/snap/code/<rev>/.local/share/pnpm`)
    and refuses to install. Pass the real one: `pnpm add <pkg> --store-dir
    /home/umar-hayat/.local/share/pnpm/store/v10` (took 6 min, lockfile +8 lines).

96. **Two image-tool stages share one view model but not one component.** `tlc/TLCStage.tsx` and
    `colony/ColonyStage.tsx` both keep `ViewTransform` state and convert pointers once with
    `screenToImage` (from `tlc/geometry.ts`), measuring the stage's **padding box** (`clientWidth`,
    `clientLeft`) — the 1 px border otherwise offsets every tap. Gesture code (pinch, wheel, tap slop)
    is duplicated between them; extract a shared hook before building a third.

97. **Tailwind v3 opacity modifiers only work on the theme scale** (0, 5, 10 … 95, 100). An off-scale
    value such as `text-[#16181d]/62` or `/58` generates **no class at all** — no warning, and the text
    silently renders in the inherited full-strength colour. Found on `/about-us` 2026-09-16 by
    screenshot; `PageHero`'s lead (`/62`) has the same fault on every kit page. Use a scale value, or
    the arbitrary form `/[.62]`. Check the built CSS in `.next/static/css/` for the exact selector.

98. **OpenChemLib's y axis already points down, like the screen** (its molfile writer negates it).
    Negating y when building an OCL `Molecule` from screen coordinates mirrors every stereocentre —
    L-alanine came back as D with no error. `molecular-lab/chem-core.ts` passes y through unchanged.

99. **OpenChemLib does not kekulise bonds typed `cBondTypeDelocalized`.** A benzene built that way
    reports C6H12. Molecular Lab's aromatic bonds are resolved to single/double by `kekulize()` in
    `molecular-lab/graph.ts` before anything reaches OpenChemLib (`buildMolecule`).

100. **`openchemlib/dist/resources.json` is not in the package's `exports`**, so webpack refuses the bare
    specifier. `molecular-lab/chem-tasks.ts` uses a relative `new URL("../../../node_modules/…")`
    (emitted as a static asset). The file (1.35 MB) is only needed by `ConformerGenerator` and the MMFF94
    force field — fetched the first time 3D is shown, never for parsing, layout or SMILES.

101. **`node --test` type stripping rejects constructor parameter properties** (`constructor(public code…)`)
    and needs explicit `.ts` extensions. App modules import each other extensionlessly, so
    `scripts/molecular-lab.test.mts` registers `scripts/lib/ts-resolve.mjs` (a resolve hook that adds
    `.ts`) and imports the modules dynamically after it.

102. **3Dmol quirks the lab works around (`molecular-lab/Viewer3D.tsx`):** two fingers only *zoom* (three
    pan), so a capture-phase touch layer does pinch + two-finger pan itself; `zoomTo()` fits the view's
    height, so a tall pane (split view, phones) crops the sides — `fitView` zooms out by `(w/h)^0.75`;
    and the model must be refitted after the pane's first resize. Bonds are made clickable with
    near-invisible cylinders (`opacity: 0.01`, `clickable: true`). Imported from npm (lazy chunk), not
    from 3dmol.org as the old viewer did.

103. **Never side-effect inside a React state updater.** StrictMode (dev) runs updaters twice: a
    measurement recorded inside `setPicks(prev => …)` was added twice with the same `Date.now()` key
    ("two children with the same key"). Compute from current state, then set.

104. **A V2000 molfile without the chiral flag is read as relative stereo.** OpenChemLib gave L-alanine a
    different ID code after a MOL round trip until `graphToMolfile` set the counts-line chiral flag when
    wedges are drawn (always, for 3D SDF).

105. **Molecular Lab library categories are data, not opinion.** `scripts/build-molecule-library.mts`
    takes drug classes only from PubChem's MeSH Pharmacological Classification and looks them up only
    for the drug list — MeSH files acetic acid under "Anti-Bacterial Agents". Tetracycline (CID
    54675776) and atropine (CID 174174) have no MeSH class on those records, so they sit in "Other".
    NSAIDs (naproxen, diclofenac) are not in "Analgesics" because MeSH does not list that term for them.

106. **The community's schema IS in the repo — uniquely.** `supabase/migrations/20260920_community.sql`
    is the first and only SQL in this project (Known Issue 4 still stands for everything else).
    It must be pasted into the Supabase SQL editor by the owner: there is no `DATABASE_URL`, and
    PostgREST cannot run DDL, so no session can apply it. Until it is applied every `/community`
    route renders its error boundary.

107. **Postgres has no `round(double precision, int)`.** Only `round(numeric, int)`. Do the
    arithmetic in `numeric` and cast back — this broke `community_hot_rank()` on its first run
    against a real Postgres.

108. **A superuser silently bypasses RLS.** An RLS test run as `postgres` passes no matter what the
    policies say. Create a `nobypassrls` role and `set role` to it, or the test proves nothing.
    (Verified this way for the community: cross-member update/delete return `UPDATE 0`, a forged
    `user_id` insert raises a policy violation, and another member's votes/saves read as 0 rows.)

109. **Postgres 16 server binaries are on this machine** at `/usr/lib/postgresql/16/bin`
    (`initdb`, `pg_ctl`), so a migration can be genuinely run and re-run locally before it is handed
    over — no Docker, no network. One trap: the Unix socket path is capped at ~107 bytes, and the
    scratchpad path alone exceeds it. Keep `PGDATA` in the scratchpad but put `-k` somewhere short
    like `/tmp/cpgsock`.

110. **Karma only moves when the vote trigger fires.** Any path that writes a `score` directly — a
    backfill, a manual correction — must be followed by a karma recompute, or authors show 0 karma
    while holding well-scored posts. The community migration ends with exactly that pass.

111. **Community voting is server-authoritative and must stay that way.** The browser posts a
    *direction*; `community_vote()` decides cast/switch/toggle-off and returns the stored score.
    `useCommunityVote` overwrites its optimistic guess with that number, so two tabs converge.
    The retired `useVote` trusted its own arithmetic and had no way back — do not reintroduce it.

112. **Community authors are `community_members`, not `profiles`.** The FK points at the
    community's own table on purpose, because `profiles` is not version-controlled. Every write
    route must call `ensureMember()` first, or a member's very first post fails on the FK.

113. **`useSearchParams` forces a CSR bailout**, so every community page wraps its client component
    in `<Suspense>`. Without the boundary `next build` fails on that route.

114. **PostgREST's `.or()` is a comma-delimited filter string.** Unescaped commas or parentheses in
    a member's search text are parsed as extra filters; the community feed strips `,()*` first.

115. **The DrugBank import's list fields are capped samples, and `interactions.total_count` does not
     say so.** Measured 2026-09-20 over all three `pharmacopedia` collections: `total_count` equals the
     stored `drug_interactions` length on **all 4,479** records that carry it, and both max out at
     exactly **100** (mean 85). `products` caps at **5**, `synonyms` at **5**. So `total_count` is not a
     true total and must never be printed as one, or summed into a site figure. Say "the import stores
     at most N per drug" instead. The pre-2026-09-13 hero's "50k+ interactions, 100k+ products" was this
     mistake.

116. **`classification.substituents` and `properties.monoisotopic_mass` exist on most records and were
     invisible until 2026-09-20.** 6,994 records carry substituents (up to 91 each) and 9,036 carry a
     monoisotopic mass. Before assuming a DrugBank field is absent, count it — `drug_type: "biotech"`
     (3,269 records) is the field that really is empty: no SMILES, so no 2D depiction and no 3D
     conformer, which is why the monograph explains the absence rather than rendering an empty plate.

117. **An allow-list over external data silently drops data.** `Monograph.tsx` used to pass calculated
     properties through a 17-kind `CALC_KEEP` list; the import actually has 25 kinds, so seven were
     discarded for ~8,700 records each (`Monoisotopic Weight`, `InChI`, `SMILES`, `Ghose Filter`,
     `Polarizability`, `Refractivity`, `MDDR-Like Rule`). Render everything and *exclude by exception*,
     naming the exception on screen — `UNRELIABLE_KINDS` holds the one real exception, DrugBank's
     "Traditional IUPAC Name", whose values are wrong in this import (Morphine's reads "dexamethasone
     phosphate").

118. **A search field that is conditionally re-parented loses focus mid-typing.** `/encyclopedia` shows
     a hero before a search and a sticky bar after one. Rendering a *different* input in each branch
     unmounts it on the second character — the state that flips (`q.length >= 2`) is the same state the
     user is typing. One input, a sibling of the branches, restyled by a `data-` attribute on its
     wrapper. The same rule applies to any "search page turns into results page" layout.

119. **3Dmol cannot hide atoms in a model it has already parsed**, so "hydrogens off" in the
     encyclopedia's 3D card is done by rewriting the V2000 record — keep the non-H atom lines, renumber
     the surviving bonds' 3-wide index fields, and re-emit the counts line. `Structure3D.tsx`
     (`filterMolfileHydrogens`) is the reference. Re-parsing a filtered record is also why the model's
     `key` gains a `:heavy` suffix: without it the viewer re-fits the old model.


115. **RLS is ROW-level, not column-level — an `update` policy scoped to the owner still lets that
    owner write *every column of their own row*.** Through a direct PostgREST call (bypassing the
    route handlers entirely) a community member could otherwise have set their own `score`,
    `post_karma`, `view_count` or `is_pinned`. The community closes this with BEFORE UPDATE guard
    triggers (`community_posts_guard`, `_comments_guard`, `_members_guard`) that restore every
    database-owned column from `OLD` unless the session is privileged
    (`community_is_privileged()`: `current_user` is postgres/supabase_admin — which is the case
    inside a SECURITY DEFINER function — or the JWT role is `service_role`). Verified: tampering is
    silently reverted while a legitimate title/body edit, the view-counter RPC and a real vote all
    still work. **Any new user-writable table needs the same treatment** — the RLS policy alone is
    not enough.

120. **`position: sticky` on a grid item with `items-start` has nowhere to stick.** A sticky
    element's containing block is its grid *area*; `align-items: start` collapses that area to the
    item's own height, so there is zero travel and it scrolls away silently — `position` still
    computes as `sticky`, and nothing warns. The disk-diffusion bench hit this: the plate scrolled
    off while the controls beside it were still in use. Leave the grid item stretched (the default)
    and put `sticky top-*` on a wrapper *inside* it.

121. **A tray button cannot both select on `pointerdown` and toggle on `click`.** A real tap
    fires both: pointerdown selected the disk, then the click toggled it straight back off, so
    tap-to-pick-up then tap-the-plate never worked while a mouse-only `.click()` test passed.
    Rule: start drags on pointerdown but only *commit* them if the pointer actually moved (a ~6 px
    threshold), and let `click` own selection. `src/components/Simulations/DiskDiffusion/SimulationWorkspace.tsx`.

122. **When something is "in the forceps", a tap must not be reinterpreted as grabbing what is
    under it.** The disk placer checked "did this tap land on an existing disk?" before "is a disk
    selected?", so trying to place one too close to a neighbour silently dragged the neighbour away
    instead of explaining the 24 mm spacing rule. Selection state takes precedence over hit-testing.

123. **`element.innerText` applies `text-transform`, so a CSS-uppercased label does not match its
    source string.** `text-[11px] uppercase` headings read as "PRACTICAL NOTE" / "ABOUT THESE
    CRITERIA" in `innerText`, and three separate assertions failed against perfectly good markup.
    Compare case-insensitively, or read `textContent`, which is untransformed.

124. **`globals.css` sets `html { scroll-behavior: smooth }` (gotcha 30a), which breaks
    CDP-driven interaction tests.** A `getBoundingClientRect()` read straight after
    `scrollIntoView()` is taken mid-glide, so the synthetic tap lands tens of pixels off and the app
    looks broken. Poll the rect until two consecutive reads agree before dispatching input.

125. **CDP `Input.dispatchKeyEvent` only performs a key's default action when the event carries
    `text`.** Enter on a focused button fires listeners but does not activate it without
    `{ type: "keyDown", text: "\r" }` — which reads exactly like a broken keyboard path. Same trap
    as gotcha 77's port collision: verify the harness before blaming the page.

126. **Two `next dev` processes against one project root destroy each other's `.next`.** Seen
    2026-09-20 with servers on :3000 and :3011: unrelated routes began answering 404 and 500 while
    the files on disk were fine. This is Known Issue 10's sibling — it is not only `build` vs `dev`,
    it is any two Next processes sharing `.next`. To verify safely while a peer holds the dev
    server, copy the tree to a scratch dir, symlink `node_modules`, copy `.env`, and run there.

127. **`@tailwindcss/typography` is NOT installed, so every `prose*` class in this repo generates
    nothing.** Verified 2026-09-20: it is absent from `package.json`, from `node_modules`, and from
    `tailwind.config.ts`'s `plugins: [require("tailwindcss-animate")]`. The old `/ai-guide` styled
    AI answers with `prose prose-gray prose-p:... prose-headings:... prose-table:...` — none of
    which existed, so headings had no hierarchy, tables had no rules, and lists fell through to
    globals.css's `ul:not(.prose ul)` grey-bulleted `pl-6`. **The `:not(.prose …)` escape hatch in
    globals.css is therefore dead too** — nothing is ever inside a real `.prose`. Style markdown
    with your own namespaced CSS (see `src/components/ai-guide/ai-guide.css` `.pw-ai-md`), or
    install the plugin deliberately. **`src/components/community/` renders member markdown and may
    have the same fault — unchecked, it is another session's file.**

128. **A page under the site shell has TWO `<aside>` elements, and the header's comes first.**
    `document.querySelector('aside')` in a CDP check selects the header's mobile nav drawer
    (styled-jsx, 320px, `position: fixed`, translated off-screen right), not the page's own rail —
    so an assertion about "the sidebar" can pass or fail for entirely the wrong element. Cost real
    time on 2026-09-20: a phone check reported the AI Guide's rail on-screen when it was correctly
    off-canvas at `left: -272`. **Scope every CDP selector to the page's namespace** (`.pw-ai aside`).

129. **The Gemini key is on the free tier: 5 requests per minute for the whole project.** Measured
    2026-09-20 against `/api/chat`. The 6th call in a minute returns `429 … quotaValue: "5"` with a
    ~50 s `retryDelay`, which surfaces as a failed answer for whoever asked. This is a **product
    ceiling shared by every visitor**, not a per-user limit, and it binds long before our own rate
    limits do. Two consequences: budget live test calls (a verification loop will trip it and look
    like a bug you wrote), and treat "the AI feature is unreliable under load" as expected until
    the owner enables billing.

130. **Auto-scroll effects fire on mount.** `useEffect(() => scrollToBottom(), [messages.length])`
    also runs when there are zero messages, which scrolled the AI Guide's empty state past its own
    heading and mode picker. `tsc`, the build and 28 behavioural assertions all passed; only
    reading the screenshot caught it. Guard on "is there actually a conversation".

## 9. Working preferences (observed)

- Commit messages are short, lowercase, hyphenated subjects (`cology-calcs-added`, `fix-tournament-ui`,
  `completed-clinical`). No body, no conventional-commits prefixes.
- Work lands directly on `main`; there are no feature branches in the history.
- The user builds **feature-complete, visually rich pages in one pass** rather than thin vertical
  slices — large single-file client components with full design-token palettes, animation, and
  in-page educational content.
- Rationale comments in code are valued and maintained. Match that style; don't strip them.

<!-- Add new preferences here as they emerge, with the date observed. -->

131. **The calculator kit migration is COMPLETE — 104/104 (2026-09-20).** Verify with
     `grep -rL "@/components/calculators" "src/app/(site)/calculation-tools/(tools)"/*/page.tsx`,
     which must print nothing. Phase 2 of `.claude/redesign-tracker.md` is closed. Don't re-open it
     on the strength of a stale "17 remain" line in an older doc.

132. **For the last 17 tools, HEAD *was* the pre-migration original — gotcha 76 did not apply.**
     Each file was byte-identical between `5dbe98c` and HEAD (`git diff 5dbe98c HEAD -- <path>`
     empty), because no earlier session had touched them. So the "before" capture was taken from the
     live page and the `src/app/migration-before/` temp-route dance was skipped entirely. **Check the
     diff first** before assuming you need it; it costs one command and saves a whole ritual.

133. **`next dev` compiles a route on first request, and 20 s+ is normal on this project.** A CDP
     driver that sleeps a fixed 3–6 s after `Page.navigate` will sample a blank, unhydrated page and
     silently report "no result". Poll for
     `document.readyState === 'complete' && !!window.next && !!document.querySelector('main')`
     instead, with a 30–120 s deadline. `window.next` is the reliable hydration signal — the HTML is
     server-rendered and present long before React attaches, so testing for text proves nothing.

134. **A peer session's broken route 500s *every* route on the shared dev server.** A compile error
     anywhere in the module graph (a `page.tsx` importing a file that does not exist yet) takes the
     whole dev server down, not just that page. When several sessions share the tree, run your own
     verification server from an **isolated rsync copy** with `node_modules` symlinked and the peers'
     in-progress routes deleted from the copy. That also satisfies the no-shared-build rule.

135. **`backdrop-saturate` is the part of "liquid glass" you can actually see; the blur is often a
     no-op.** On `ModeSwitch` the pane sits over a flat tinted track, so `backdrop-blur` changes
     nothing — but a pixel diff of the crop with and without the filter showed a **max channel delta
     of 91 across 7.9% of channels**, all of it from the saturation boost. Do not "optimise away" a
     backdrop-filter by reasoning alone: diff the pixels. The kit keeps the filter on fine pointers
     and drops it under `[@media(hover:none)]` with a pre-saturated fill, so phones and the APK pay
     nothing (gotcha 51 is about `position: fixed`, which this is not).

136. **The kit's motion keyframes live in `tailwind.config.ts`** (`calc-result`, `calc-sheen`,
     `calc-tide`). Editing that file needs a **dev-server restart** — Next caches it (gotcha 26) —
     and the classes are consumed by `src/components/calculators/`, so one edit reaches all 104
     calculators *and* the Android APK, which re-exports the real tool pages.

137. **`globals.css` has a FOURTH way of fighting a bespoke page: `pre`.** On top of gotcha 30's
     three, `pre { @apply bg-gray-900 text-gray-100 p-4 rounded-lg }` (globals.css ~line 102) makes
     every `<pre>` on the site a dark code block. The pharmacy counter's dispensing label and
     intervention record are `<pre>` on cream paper, and rendered as unreadable white-on-near-black
     — which is also against the no-black-grounds rule. Found by *looking at a screenshot*; every
     assertion passed. Neutralise inside the namespace: `.pw-cph pre` is (0,1,1) and beats the bare
     `pre` at (0,0,1). `code:not(pre code)` is styled too, and `.ns code` beats it the same way.

138. **A mount-only effect that needs a ref on a *conditionally rendered* screen never attaches.**
     `CommunityPharmacyLab` returns a different tree for home / counter / debrief. An effect with
     `[]` deps ran while the home screen was mounted, found `rootRef.current === null`, returned
     early and was never re-run, so the header-following CSS variable was silently never set. React
     does not re-run a `[]` effect when a *sibling* branch mounts. Depend on whatever selects the
     branch (`[state.screen]`).

139. **Do not open a panel as a side effect of changing stage.** The counter's reducer set
     `panel: STAGE_COPY[next].panel` on every `advance`, and because a non-null panel renders a
     modal `Dialog`, every single step of the workflow popped a dialog over the workstation the
     student then had to dismiss. Caught by screenshot, not by any assertion — the assertions
     queried the DOM, which contained both the workstation and the dialog. Stage changes move the
     student; drawers open only when the student asks for one.

140. **A stage whose work is "read this" still needs an explicit completion signal.** The counter
     gates every stage on `stageComplete()` derived from state, and `arrival` / `receive` /
     `patient-assessment` complete by being *seen* — which meant nothing until a `see` action was
     actually dispatched from an effect. Until it was, the very first primary action did nothing but
     raise a review, and the whole workflow was unreachable. If a stage has no artefact, dispatch
     the fact that it was looked at.

141. **zsh does not word-split unquoted variables.** `for s in "walk.mjs 1440 900"; do node $s; done`
     passes the whole string as one filename and fails with `Cannot find module 'walk.mjs 1440 900'`
     — under bash the same loop works. Three verification runs silently produced no output this way
     and looked like a hung harness. Use an explicit array, or write the calls out.

142. **Derived, publishable counts live in at least three places and drift apart.** The number of
     calculators is stated by `STATS.calculators` in `src/components/Home/landing/data.ts` (a
     hand-typed constant, was **97**), by `HUB_TOOL_COUNT` in `calculation-tools/tool-index.ts` (a
     `reduce` over the registry, **98**), by `APP_TOOL_COUNT` in `download/DownloadClient.tsx`
     (hand-typed, **104**) and by the actual directory count under `(tools)/` (**104**). Three of
     the four disagreed on 2026-09-20, and `CLAUDE.md` §7 recorded a fourth wrong figure (93).
     Before quoting any count — in product copy, in a doc, or to the user — **count the source of
     truth**, and prefer deriving the constant over typing it. The landing file's own comment warns
     against rounding numbers up "for effect" because a pharmacy student will check; the same
     applies to letting them go stale. See `.claude/BRAND_KIT.md` §8 for the measured set, and
     `CLAUDE.md` Known Issue 20.

143. **`lab-analysis/parts.tsx` imports Recharts at module scope.** `ExampleChips`, `DataTable`,
     `CountStepper`, `StatTiles`, `ResultTable` and `ReportSteps` all live in the same file as
     `ChartPanel`, which does `import { ResponsiveContainer } from "recharts"` at the top. Pulling
     one small helper out of `@/components/calculators/lab-analysis` may therefore drag a chart
     library into a tool that draws nothing. Most tools build their own example chips locally (68
     of 104 have some example affordance; only 6 use `ExampleChips`). Don't reason about
     tree-shaking — if it matters, build and compare the route's first-load size against
     `CLAUDE.md` §9. Sibling of gotcha 69 (the same barrel also loads React UI, which is why a
     pure maths module must import `lab-analysis/math` and `format` directly).

144. **The calculator kit has no unit conversion beyond mass, volume and amount.** `lab-math.ts`
     exports `MASS_TO_G`, `VOLUME_TO_ML` and `AMOUNT_TO_MOL` and nothing else; `CONCENTRATION_UNITS`
     in `lab-analysis/parts.tsx` is a **label list, not a converter**, and there is no time, length,
     pressure or temperature table anywhere. Temperature cannot join those tables at all — °C/°F/K
     need an offset, not a factor. A tool that offers a unit dropdown is doing its own arithmetic,
     which is why two shipped with selectors that change nothing (`DensityConversionCalculator`,
     `heat-transfer-area` — Known Issue 15). New shared tables belong in `lab-math.ts`, the file
     that already ships inside the APK.

145. **A supplied practical sheet can contradict its own stated answer — reproduce it, and put the
     choice on screen.** The Dissolution Rate Constant spec asked for "the mean of all midpoint-based
     k values" and stated the expected result twice as 0.000291833. It is not the mean of all seven:
     all seven give 0.000269425, t = 10–60 give 0.000293440, t = 0–50 give 0.000264084, and **only the
     five interior rows (t = 10–50) give 0.000291833**, which is what a spreadsheet does when the
     average range accidentally omits the first and last cell. Before writing any UI, compute every
     candidate range in Node and find which one the stated answer actually is — that identifies the
     real convention in minutes and would otherwise be a silently wrong headline figure. Then ship it
     as a labelled option with the alternative beside it (skill rule, gotcha 67), never as a silent
     choice. Same family as the "prefer the sheet's method" rule, but the trap here is that the prose
     and the number in one document disagree.

146. **`formatSig` switches to scientific below 1e-4, which is the whole working range of some
     practicals.** A dissolution table's readings, midpoints, rates and rate constants all sit between
     1e-3 and 1e-7, so `formatSig` renders the entire table in exponent form and a "decimal notation"
     toggle built on it does nothing. A decimal formatter that keeps N significant figures without an
     exponent is `Number(v.toPrecision(sig)).toFixed(sig - 1 - Math.floor(Math.log10(Math.abs(rounded))))`
     — see `_dissolution-rate.ts`'s `formatDecimal`. Keep trailing zeros in significant-figure columns
     (0.000311630 *is* six figures) but trim them where the value sits next to a round number, or a
     Cs − C column prints "3.500000000".

147. **`DataTable`'s inputs were a fixed `w-[6.5rem]`, which clips a value the student must check.**
     Sized for an absorbance (0.131); a dissolution corrected reading (0.000877352) renders as
     "0.00087735:" and the student cannot see what they typed. `TableColumn` now takes an optional
     `inputClass` (default unchanged, so no existing tool moved). Nothing in the DOM says a value is
     clipped, so no assertion catches it — this was found by reading the 1440 screenshot. Compare
     `input.scrollWidth` with `input.clientWidth` if you want it asserted.


148. **There are now four build targets compiling the same calculator files**, not two: the website
     (`src/`), Android (`mobile/` + `android/`), iOS (`ios/`) and **Windows** (`desktop/` +
     `src-tauri/`, Tauri 2, added 2026-09-22). Gotcha 18's rule hardens accordingly: a tool that
     starts calling `fetch`, importing a server module, or importing a platform-only package breaks
     *three* packaged apps at once. This bit for real on 2026-09-22 — `LabReport.tsx` gained an
     import of `@capacitor/share` before that package was installed, and every calculator build
     target failed to resolve it, including a desktop build that has nothing to do with iOS.

149. **The desktop target sets `NEXT_PUBLIC_IS_MOBILE_APP=true` as well, on purpose.** That flag is
     the shared kit's "packaged, offline, ad-free build" switch, and setting it in
     `desktop/next.config.mjs` is what keeps `AdSlot` silent and `calculatorHref` trailing-slashed
     **with zero edits to `src/`**. The side effect to know: it also hides `LabActions`' own
     Download-card and Print buttons, which is why `desktop/app/_components/ToolFrame.tsx` supplies
     its own Save / PDF / Text / Print. Do not rename or repurpose the flag without checking all
     three consumers (`AdSlot`, `LabReport`, `lab-math`).

150. **The desktop app records a calculation by reading the DOM, not by instrumenting the tools.**
     `desktop/app/_lib/snapshot.ts` depends on exactly four things the shared calculator kit
     guarantees: a single `h1` (CalculatorShell), labelled `input`/`select` controls (NumberField /
     SelectField), `[aria-live="polite"]` on the result card (ResultCard), and a
     `button[aria-controls]` whose label mentions "calculated" (FormulaNote). **Changing any of
     those four in the kit silently breaks Save, Print and Export on all 105 calculators at once,
     and nothing type-checks it.** Two specifics: the result card's *empty* state also carries
     `aria-live`, and is told apart only by its value line being an em dash; and the FormulaNote
     panel must be read with `textContent`, never `innerText`, because `Collapse` leaves it in the
     DOM at `visibility: hidden` when closed and `innerText` returns "" for that.

151. **A grep is the cheapest offline proof, and this repo passes it.** All 104 tool pages plus
     `src/components/calculators/**` contain **zero** `fetch(`, `axios`, `XMLHttpRequest`,
     `sendBeacon`, `EventSource`, `new WebSocket` and zero remote `<img src>` (measured
     2026-09-22). The remote URLs that *do* appear — ~102 across 25 hosts — are all `<a href>`
     citations (FDA labels, CredibleMeds, journals), which make no request until clicked; the
     desktop shell intercepts those clicks and copies the address instead.
     `scripts/audit-desktop-offline.mjs` re-checks all of this against the **built** bundle and is
     wired into `npm run tauri:build`. Three of its rules hit known-benign matches, each excused by
     file *and* rule so the same pattern elsewhere still fails: an `AIza…` run inside OpenCV's
     base64 WASM (the gotcha-90 false positive again), jsPDF's unreachable `pdfobject` CDN string,
     and Next's own `fonts.googleapis.com` preconnect constant in `main-*.js`. The check that
     actually matters is the one with no exceptions: **zero remote `src=`/`href=` subresources in
     the emitted HTML**.

152. **Capacitor 8 scaffolds iOS with Swift Package Manager, so `cap add ios` and `cap sync ios`
     run on Linux.** The template is `ios-spm-template.tar.gz` in `@capacitor/cli/assets`; there is
     no `pod install` step and no CocoaPods dependency. Both commands are pure Node — they extract
     a template, copy `webDir`, and rewrite `Package.swift` and `capacitor.config.json`. This is
     why an iOS target could be created and is maintained on this project's Linux machine. What
     still needs macOS is everything *after* sync: compiling, the Simulator, a device build, an
     archive, App Store Connect. Do not skip the sync step "because it's iOS" — the bundle it
     copies is the entire app. (`ios/App/CapApp-SPM/Package.swift` says DO NOT MODIFY and means it:
     `cap sync` regenerates it from the installed `@capacitor/*` plugins.)

153. **WKWebView's automatic content inset doubles every safe-area gap this app already pads.**
     `mobile/app/layout.tsx` sets `viewportFit: "cover"` and the app chrome pads with
     `env(safe-area-inset-*)`, so `capacitor.config.ts` sets `ios.contentInset: "never"`. Setting it
     back to the default `"automatic"` makes iOS add its own inset on top of the CSS one. Related
     and equally load-bearing: **`server.iosScheme` must stay `capacitor`** — the origin is what
     `localStorage` is keyed to, so changing it silently empties every student's Recent and Saved
     list.

154. **The iOS decimal keypad has no return key, so a numeric form cannot be dismissed without
     Capacitor's accessory bar.** Every calculator input is `type="number" inputMode="decimal"`
     (`NumberField`), which on iOS is the 12-key pad. Capacitor leaves `setAccessoryBarVisible`
     off by default. `mobile/app/_components/NativeShell.tsx` turns it on and guards on
     `Capacitor.getPlatform() === "ios"`, so Android — where the API is a no-op anyway — is
     untouched.

155. **An iOS app icon with an alpha channel builds fine and is rejected at App Store upload,
     hours later.** `scripts/generate-ios-assets.mjs` flattens onto white deliberately. Two more
     constants in that script are derived, not taste: the mark is fitted to **700 of 1024 px** so
     the system squircle cannot clip it, and the launch-screen artwork must fit a **centred
     1257 px box** because `LaunchScreen.storyboard` uses `scaleAspectFill` on a square image and a
     19.5:9 iPhone shows only the middle ~46% of its width (same fraction of the height in
     landscape).

156. **sharp can typeset in a brand font that is not installed system-wide.** It rasterises SVG
     through librsvg, which resolves fonts via fontconfig, so writing a temp `fonts.conf` pointing
     at a directory of `.ttf` files and exporting `FONTCONFIG_FILE` **before the first render**
     makes `font-family="Outfit"` resolve. Without it librsvg falls back to DejaVu **silently** —
     the render succeeds and looks plausible, so check the letterforms, not the exit code.
     fontconfig is read once per process; setting the variable after a render has no effect.

157. **Two sessions writing `package.json` at once loses one of them, and pnpm is one of the
     writers.** On 2026-09-22 a `pnpm add` of three plugins completed — the packages were in
     `node_modules/.pnpm` — yet the three `dependencies` lines, the lockfile entries and the
     `node_modules/@capacitor/*` symlinks were all absent afterwards, because a peer session wrote
     package.json from a copy it had read before the install finished. The install had to be run
     again. **Announce a `pnpm add` in a shared tree, and re-read package.json from disk
     immediately before writing it** — never write back a version read earlier in the task.

158. **`android/capacitor.settings.gradle` hard-codes pnpm store paths, version numbers and all.**
     `cap sync android` writes lines like
     `new File('../node_modules/.pnpm/@capacitor+share@8.0.2_@capacitor+core@8.5.2/node_modules/@capacitor/share/android')`.
     Two consequences: the file is **generated but must be committed** (Gradle cannot find the
     plugins without it), and **bumping any Capacitor plugin version breaks the Android build until
     `cap sync android` is re-run**, because the old versioned path no longer exists. The file says
     DO NOT EDIT and means it — re-sync, never hand-patch the version in the path. The same applies
     to `android/app/capacitor.build.gradle`, which lists the `implementation project(...)` lines.

