# PROTOCOL — PharmaWallah

**When the user says "follow protocol", execute these steps.** Acknowledging that a protocol
exists is not following it.

Every step is mandatory unless the step itself says when to skip. Steps 9 (knowledge sync) and 10
(report) are part of the work — the task is not done without them.

---

## 1. Read context — targeted, not the whole repo

1. `CLAUDE.md` — §7 Current Project State and §9 Verification Baselines at minimum.
2. `.claude/PROJECT_MAP.md` — locate the files for this task. Do not grep the repo blind first.
3. `.claude/MEMORY.md` — **§3 Authorization rules and §8 Known Gotchas are mandatory** before
   touching any route, data access, cache, or course/calculator registry.
4. `.claude/SKILLS.md` — if a skill matches, read it and follow it instead of improvising.
5. `.claude/ROADMAP.md` — only when the task is "what's next" or starting a roadmap item.

Read the actual source files you will change. Do not work from documentation alone — see the
Source-of-Truth Rule in `CLAUDE.md` §3.

## 2. Check git state and protect uncommitted work

```bash
git status --short
git log --oneline -5
```

- If there are **uncommitted changes you did not make**, stop and tell the user before touching
  those files. Their work is not yours to reorganise.
- **Never run `git reset`, `git clean`, `git checkout --`, `git restore`, force push, or branch
  deletion without explicit approval.**
- Work on `main` unless the user asks otherwise — that is this project's actual convention.
- **Do not commit or push unless the user asks.**

## 3. Understand the requirement and its blast radius

State to yourself, in one sentence each:
- What behaviour changes, observably, for a user.
- Which of the six pillars it touches (calculators, courses/MCQ, spotting, simulations,
  tournament, clinical) and whether it crosses into shared infrastructure.
- Whether it touches **auth, authorization, a data store, a cache, or money-spending AI calls**.
  If yes, steps 5 and 6 are mandatory and non-negotiable.

If two readings of the request lead to materially different work, ask now. Otherwise pick the
reading a careful colleague would, state the assumption, and proceed.

## 4. Inspect the existing pattern before inventing one

This repo is highly patterned. Almost anything you need to build already has a nearest neighbour.

- New API route → read `src/app/api/qa/questions/route.ts` (validation) and
  `src/app/api/progress/route.ts` (auth + cache + partial failure).
- New calculator → copy the closest existing tool under `(tools)/`.
- New course subject → `src/lib/courses/subjects/biochemistry.ts`.
- New spotting lesson → `src/components/spotting/HistologyLessonTemplate/index.tsx`.
- New external API client → `src/lib/api/pubmed.ts` + its route.

Match the neighbour's structure, naming, error shape, and comment density. A change that reads
like the surrounding code is the goal; consistency beats your preferred style.

## 5. Data-layer review

Before writing any data access, answer:

- **Which store?** Supabase Postgres, MongoDB (`pharmawallah` via mongoose, or `pharmacopedia` via
  the root native client), or Redis. Importing the wrong Mongo client returns empty results with
  no error — `MEMORY.md` §8 gotcha 5.
- **Does the table/column/view/RPC actually exist?** The Supabase schema is **not in this repo**.
  Code referencing something is not proof it exists. If you need a new column, table, or policy,
  **say so explicitly in the report** — you cannot create it, and the user must.
- **Which Supabase client?** `createServerSupabaseClient()` (anon + RLS) or
  `createServiceSupabaseClient()` / `supabaseAdmin` (service role, **RLS bypassed**).
  Read `MEMORY.md` §3 and pick deliberately. Never switch a route from anon to service-role to
  make a permissions error go away.
- **Cache implications.** If you write data that something caches, invalidate it
  (`invalidateProgressCache`, `invalidateLeaderboardCache`, or the relevant `redis.del`).
- **Never drop, reset, or destructively migrate a database without explicit approval.**
  **Treat production as read-only by default.**

## 6. Security review

For any change touching routes, auth, or data:

- [ ] **Ownership filter present?** On a service-role client, `.eq("user_id", user.id)` (or the
      resolved `progress_id`) is the only thing protecting other users' rows.
- [ ] **A record ID from the client is never authorization.** Resolve ownership server-side.
- [ ] **Auth checked before work?** `auth.getUser()`, 401 on failure, before any mutation.
- [ ] **Admin action?** Check the `ADMIN_EMAILS` allowlist. Middleware only proves *logged in*.
- [ ] **Input validated and clamped?** Type-check every field; clamp pagination against a `MAX_*`.
- [ ] **Answer keys stripped** from anything scored that goes to the browser.
- [ ] **Score/grade computed server-side**, never accepted from the request body.
- [ ] **Rate limited** if the endpoint is anonymous, expensive, or calls a paid API.
- [ ] **Mongo regex input escaped.**
- [ ] **No secret in a `NEXT_PUBLIC_*` variable**, in code, in a log, or in a doc.
- [ ] **Service-role client never imported from a client component.**

If you find a leaked secret anywhere in the repo or its logs, **stop and flag it prominently.**

## 7. Implement

- Smallest change that fully does the job. Finish the whole task, not the easy part.
- Follow `CLAUDE.md` §6 Engineering Rules.
- Keep the existing "why" comments; add your own where a decision is non-obvious.
- **Never edit generated files**: `public/sw.js`, `public/workbox-*.js`, `next-env.d.ts`,
  `.next/`. Change the source of generation and rebuild.
- Do not install packages, change env values, or refactor beyond the task without asking.
- If part of the scope turns out to be blocked, finish everything else and say exactly what you
  left out and why.

## 8. Verify — against the recorded baselines

Baselines live in `CLAUDE.md` §9. Run what is relevant; **report honestly what you actually ran.**

```bash
npx tsc --noEmit      # baseline: 0 errors. Any error is yours.
npm run build         # baseline: passes WITH .env; fails without it
```

- **`npm run lint` does not work** — there is no ESLint config, so it opens an interactive setup
  prompt and exits 0 without linting. **Never report lint as passing.**
- **There are no tests.** No framework, no test files, no CI. **Never claim tests passed.**
- Static checks are not behaviour. For any user-visible change, **exercise the actual page or
  route** (`npm run dev`, load the page, hit the endpoint) and say what you observed.
- If a check fails, determine whether it is **pre-existing** (compare against §9) before claiming
  you broke it — and before claiming you didn't.

## 9. Review the diff

```bash
git diff
git status --short
```

- Read every hunk. Did you leave debug logging, a commented-out block, a stray `console.log`?
- Did `public/sw.js` change? That is expected after a build — don't be alarmed, don't hand-edit.
- Does the diff contain anything outside the task's scope? Remove it or call it out.
- Does any line contain a secret, a key, or a real credential? Remove it.

## 10. Knowledge sync — part of the work, not optional

Before reporting done:

1. **`CLAUDE.md`** — add a §8 Work Log entry (`### YYYY-MM-DD — Task`, then
   `Completed / Files / Architecture & Decisions / Verification / Remaining / Next`). Update §7
   Current Project State. Update §9 Baselines **if any check's result changed**. Archive entries
   older than ~10 into `.claude/history/YYYY-MM.md`.
2. **`.claude/ROADMAP.md`** — move only the status markers you actually earned. A file existing is
   not ✅.
3. **`.claude/PROJECT_MAP.md`** — add genuinely new entry points; remove what you deleted.
4. **`.claude/MEMORY.md`** — add durable facts, invariants, and any trap that cost you time.
   Never secrets, never daily history.
5. **`.claude/skills/`** — if the task taught a reusable procedure, create or update a skill. If a
   skill's steps were wrong, **fix the skill** — that is the whole point of the system.
6. Anything found but not fixed → record under Known Issues / Technical Debt / Roadmap. Don't let
   it evaporate.

## 11. Report

Use the format below.

---

## Report

**Completed**
- What now works that did not before, in observable terms.

**Files Changed**
- `path/to/file.ts` — what changed and why.

**Verification**
- Exactly what was run and what it returned. `npx tsc --noEmit` → 0 errors. `npm run build` →
  passed/failed. What you manually exercised and what you saw.
- **State plainly what was NOT verified.** "No tests exist; lint is not configured; I did not load
  the page in a browser" is the correct thing to write when true.

**Important Notes**
- Decisions made, assumptions taken, anything surprising found.
- Anything requiring the user: a Supabase schema/policy change, an env var, a package install, a
  decision you deliberately did not make for them.

**Remaining Work**
- What is deliberately not done, and why.

**Recommended Next Step**
- The single most sensible next action.

---

## Hard Rules

1. **Source of truth.** Current code beats documentation. When they disagree: verify, follow the
   code, fix the doc as part of the task.
2. **Honesty in verification.** Never claim tests passed if tests did not run — and no tests exist
   here. Lint and type-check are **not** tests. Lint does not even run. Never invent a command;
   only use commands confirmed to exist in this repo.
3. **Baselines.** Compare against `CLAUDE.md` §9 before attributing a failure to yourself or to
   pre-existing state.
4. **Git safety.** No `reset`, `clean`, `checkout --`, `restore`, force push, or branch deletion
   without explicit approval. Never discard the user's uncommitted work. Never commit or push
   unless asked.
5. **Database safety.** Never drop, reset, or destructively migrate without explicit approval.
   Production is read-only by default. **The schema is not in this repo** — you cannot apply
   migrations; ask the user.
6. **Generated code.** Never edit it. Change the generator.
7. **Secrets.** Names only, never values. `.env` is gitignored — never commit it, never print it,
   never quote a value into a file, comment, or commit message. Flag any leak you find.
8. **Data isolation — CRITICAL.** On a service-role client, RLS is bypassed and the ownership
   filter in the handler is the only protection. A record ID from a client is never authorization.
9. **Scope.** Do the task asked. Record what you find; don't silently expand, and don't silently
   narrow.
