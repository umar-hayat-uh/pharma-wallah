# Debug Issue

## Purpose
Diagnose and fix a bug in PharmaWallah. A large share of bugs here are already-catalogued traps —
check the gotcha list before investigating from scratch.

## Trigger Examples
- "the dashboard shows no progress"
- "the build is failing"
- "this route returns 401 / 500 / empty"
- "the calculator doesn't show up on the hub"
- "why is the leaderboard stale?"

## Read First
1. **`.claude/MEMORY.md` §8 Known Gotchas — read this first, every time.** 18 catalogued traps;
   the answer is frequently there.
2. `CLAUDE.md` §9 Verification Baselines — to tell new breakage from pre-existing.
3. `.claude/PROJECT_MAP.md` — locate the feature.

## Architecture Context
Failures cluster by layer:
- **Build/startup** → module-scope env validation (`supabase-server.ts`, `supabase-admin.ts`, root
  `lib/mongodb.tsx`) throwing during "Collecting page data".
- **401** → `auth.getUser()` failed, or middleware redirected.
- **403** → tournament RPC (`CODE_USED` / `NO_ATTEMPTS_LEFT`) or the admin allowlist.
- **429** → an Upstash limiter. Check which one in `MEMORY.md` §4.
- **Empty results, no error** → wrong Mongo client/database, or a cache serving stale data.
- **"It doesn't appear"** → a hand-maintained registry, not a bug in the page.
- **Stale data** → a Redis TTL (45s progress, 30s leaderboard, 300s entry code).

## Procedure
1. **Reproduce, and pin down the layer.** Browser console, network tab status code, or the server
   log. A precise status code narrows this enormously.
2. **Check `MEMORY.md` §8 for a matching gotcha.** Symptom → likely gotcha:
   | Symptom | Check |
   | --- | --- |
   | Build fails on a `/api/...` route | Missing `.env` — gotcha 3 |
   | `npm run lint` "passes" instantly | It never ran — gotcha 4 |
   | Mongo query returns `[]` | Wrong client/database — gotcha 5 |
   | Edited a file, nothing changed | Dead code — gotchas 6, 7 |
   | New calculator not on the hub | Registry — gotcha 9 |
   | New subject not under /courses | `SUBJECTS` array — gotcha 8 |
   | Tournament route throws at import | `Redis.fromEnv()` — gotcha 13 |
   | Data is stale | A Redis TTL — `MEMORY.md` §4 |
   | Route unexpectedly public | `PROTECTED_PATHS` has only 4 entries — gotcha 14 |
   | Streak always 0 | Never written by any code — `MEMORY.md` §4 |
3. **Compare against the baseline.** `npx tsc --noEmit` should be 0 errors. If it is not, that is
   new. If `npm run build` fails, check `.env` exists before investigating anything else.
4. **Read the failing route handler end to end.** Its error branches are explicit and usually name
   the cause.
5. **Check the data assumption.** Does the Supabase table/column/view/RPC actually exist? **The
   schema is not in this repo** — a PostgREST error about an unknown column means the database
   differs from the code's expectation, and only the user can fix that.
6. **Bypass the cache to isolate it.** If the bug smells stale, delete the relevant Redis key or
   wait out the TTL and retry before changing code.
7. **Fix the root cause, not the symptom.** Do not switch an anon client to service-role to make a
   permissions error disappear — that removes the only protection the route had.
8. **Verify** the fix actually resolves the reproduction, and that `tsc` is still clean.
9. **Knowledge sync** — if this trap is not in `MEMORY.md` §8, add it.

## Files Usually Involved
- The failing `src/app/api/**/route.ts`
- `src/middleware.ts` (auth redirects, subdomain header)
- `src/lib/{redis,rateLimit,tournament-redis}.ts` (429s, stale data)
- `src/lib/{supabase-server,supabase-admin,mongodb}.ts`, root `lib/mongodb.tsx` (startup throws)
- `CLAUDE.md` §9 (baselines)

## Security Checks
While fixing, do not introduce a regression:
- [ ] The fix does not drop an ownership filter.
- [ ] The fix does not switch a route from anon/RLS to service-role.
- [ ] The fix does not remove a rate limit or an auth check.
- [ ] Debug logging you added does not print tokens, cookies, emails, or env values — **remove it
      before reporting done**.

## Validation
Reproduce → fix → reproduce again. State the before and after explicitly.

## Tests & Verification
```bash
npx tsc --noEmit   # baseline 0
npm run build      # only if the bug was build-related
npm run dev        # reproduce the original symptom, confirm it's gone
```
**No tests exist. Lint does not run.** Verification here means the reproduction no longer
reproduces, and you say exactly how you checked.

## Common Failure Modes
- **"Fixing" dead code** — the change compiles and nothing happens. Confirm the file has importers.
- **Attributing a pre-existing failure to your change** — check `CLAUDE.md` §9 first.
- **Treating a registry omission as a routing bug.**
- **Treating cache staleness as a data bug.**
- **Assuming lint passed** because it exited 0. It never ran.
- **Assuming the database matches the code.** It might not; the schema is untracked.

## Do Not
- Do not disable a rate limiter, auth check, or validation to "unblock" a repro.
- Do not run destructive git or database commands.
- Do not leave `console.log` in the diff.
- Do not paste an env value into a log, a comment, or the report.

## Update Project Knowledge
- **Any trap that cost you more than a few minutes goes into `.claude/MEMORY.md` §8.** That list is
  the highest-value artifact in this system.
- If the bug was a real defect rather than a trap, note it in `CLAUDE.md` §8 Work Log.
- If it exposed debt you did not fix, record it under §7 Technical Debt.
