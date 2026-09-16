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

### Testing — there is none
**No test infrastructure of any kind exists.** No Jest, Vitest, Playwright, or Cypress; no test
script in `package.json`; no test files; no `.github/` and no CI.

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

85. **`/about-us` is the fourth place GSAP is allowed** (user request, 2026-09-16) and the only
    ScrollTrigger use outside the landing page. It is loaded with a dynamic
    `Promise.all([import("gsap"), import("gsap/ScrollTrigger")])` after first paint, inside one
    `gsap.context` + `matchMedia`, reverted on unmount. **Verified route-scoped**: shared JS stayed at
    88 kB, `grep gsap` over both shared chunks returns 0, and `/about-us` first load is 111 kB —
    lighter than `/calculation-tools`. The page also adds `html.pw-about-mounted { scroll-behavior:
    auto }` while mounted, because `globals.css` smooth scrolling desynchronises every scrub
    (gotcha 30a); in-page jumps therefore pass `behavior: "smooth"` explicitly.

86. **The team roster lives in `src/lib/team.ts`**, not `src/app/api/team-members.tsx` (moved
    2026-09-16, old file deleted). One `ROSTER` array of `{name, role, campus?}` is the only thing to
    edit; the group each person is filed under, their monogram, their per-person gradient angle, their
    anchor id, the campus count and the role list are all derived. A role missing from `ROLE_GROUP`
    files the person under "Team" rather than dropping them. The old `imgSrc` field was **three stock
    photographs shared between sixteen people** and was never rendered — if real portraits ever exist,
    add a `photo` field.

## 9. Working preferences (observed)

- Commit messages are short, lowercase, hyphenated subjects (`cology-calcs-added`, `fix-tournament-ui`,
  `completed-clinical`). No body, no conventional-commits prefixes.
- Work lands directly on `main`; there are no feature branches in the history.
- The user builds **feature-complete, visually rich pages in one pass** rather than thin vertical
  slices — large single-file client components with full design-token palettes, animation, and
  in-page educational content.
- Rationale comments in code are valued and maintained. Match that style; don't strip them.

<!-- Add new preferences here as they emerge, with the date observed. -->
