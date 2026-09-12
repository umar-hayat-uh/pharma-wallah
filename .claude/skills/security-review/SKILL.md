# Security Review

## Purpose
Review PharmaWallah changes — or the app as it stands — for authorization, data-isolation, secret,
and abuse-surface problems specific to this codebase.

## Trigger Examples
- "security review this"
- "is this endpoint safe?"
- "can a user see someone else's data?"
- any change touching auth, service-role access, admin routes, or the tournament

## Read First
1. **`.claude/MEMORY.md` §3 Authorization rules — CRITICAL. Mandatory.**
2. `.claude/MEMORY.md` §5 Security decisions and §6 env variable names.
3. `CLAUDE.md` §7 Known Issues — several are security-relevant and already known.

## Architecture Context

**The central risk.** Most data routes authenticate with the *user* client and then read/write with
the **service-role** client, which **bypasses RLS entirely**. In those routes the ownership filter
written by hand in the handler is the *only* thing separating users' data. There is no second line
of defence.

A minority of routes (all `/api/qa/*`, `/api/clinical/amr`) rely on RLS instead — and those
policies are **not in this repository**, so they cannot be reviewed from the code.

## Procedure
1. **Classify every touched route**: service-role (Model A) or anon/RLS (Model B)?
   ```bash
   grep -rn "createServiceSupabaseClient\|supabaseAdmin" src/app/api   # Model A
   grep -rln "createServerSupabaseClient" src/app/api                  # auth or Model B
   ```
2. **For every Model-A query, find the ownership filter.** Walk each `.from(...)` chain and
   confirm a `.eq("user_id", user.id)` or a `progress_id` resolved from the authenticated user.
   A query with neither is a full-table read or write. Treat a missing filter as **critical**.
3. **Check that ids from the client are never trusted as authorization.** The pattern must be
   *resolve ownership server-side*, not *accept the id the browser sent*.
4. **Check admin routes.** All three `src/app/api/admin/**` must check `ADMIN_EMAILS`.
   `/admin` being in `PROTECTED_PATHS` only proves the user is logged in.
5. **Check the abuse surface** on anything anonymous:
   - Is it rate limited? Which limiter, what window, keyed by IP or user?
   - Does it spend money? The four Gemini routes (`/api/chat`, `/api/prescription-reader-v2`,
     `/api/evaluate-histology`, `/api/scan-colonies`) are currently **unauthenticated and
     unthrottled** — a known open issue.
6. **Check anti-cheat integrity** for anything scored:
   - Answer keys stripped before the payload leaves the server.
   - Grading server-side.
   - Score read from the Redis session, never from the request body.
   - Attempt count claimed atomically (the `claim_tournament_attempt` RPC), not counted in JS.
7. **Check secrets.**
   ```bash
   grep -rn "NEXT_PUBLIC_" src --include="*.ts" --include="*.tsx" | grep -iE "key|secret|token"
   git diff | grep -iE "sk-|eyJ|BEGIN .*PRIVATE KEY|service_role"
   ```
   Any `NEXT_PUBLIC_*` value ships to the browser. Known: `evaluate-histology/route.ts:17` reads
   `NEXT_PUBLIC_GEMINI_API_KEY` as a fallback — unset today, but the fallback should be deleted.
   Confirm `SUPABASE_SERVICE_ROLE_KEY` is never imported from a client component.
8. **Check injection surfaces.** Mongo regex input must be escaped
   (`q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")`). Supabase queries use PostgREST builders — flag any
   raw SQL string interpolation.
9. **Check middleware assumptions.** `PROTECTED_PATHS` has exactly four entries and one of them
   (`/api/reviews`) does not exist. Everything else is unauthenticated at the middleware layer.
10. **Report by severity**, with the concrete exploit path — not a checklist dump.

## Files Usually Involved
- `src/middleware.ts`
- `src/lib/supabase-server.ts`, `src/lib/supabase-admin.ts`
- `src/app/api/admin/**/route.ts`
- `src/app/api/progress/**`, `src/app/api/tournament/**`, `src/app/api/qa/**`
- `src/lib/rateLimit.ts`, `src/lib/tournament-redis.ts`

## Security Checks
- [ ] Every service-role query has an ownership filter tied to the authenticated user.
- [ ] No client-supplied record id is treated as authorization.
- [ ] Auth checked before any mutation; 401 on failure.
- [ ] Admin routes check the email allowlist.
- [ ] Anonymous/expensive/paid endpoints are rate limited.
- [ ] Scored flows: answer keys stripped, grading server-side, score read from Redis.
- [ ] No secret in `NEXT_PUBLIC_*`, in code, in logs, or in the diff.
- [ ] Service-role key never reachable from the browser bundle.
- [ ] Mongo regex input escaped.
- [ ] Cookies set with `secure` in production and `sameSite: "lax"` (the existing pattern).

## Validation
For each finding, state the **exploit path concretely**: who the attacker is, what they send, what
they get. "Missing filter" is a claim; "any authenticated user can POST X and read every user's
`unit_progress`" is a finding.

## Tests & Verification
There is no security test tooling and no tests at all. Verification is reading the code and, where
safe, exercising the endpoint locally with `npm run dev`. **Never claim a scan or test was run.**

## Common Failure Modes
- **Assuming RLS protects a service-role route.** It does not. This is the single most likely
  mistake in this repo.
- **Assuming RLS policies exist** for Model-B routes. They are not in the repo and cannot be
  confirmed from code — say "unverifiable from the repository", not "protected".
- **Confusing authentication with authorization.** Middleware proves logged-in, nothing more.
- **Missing the money surface.** Unauthenticated Gemini routes are a real, current exposure.
- **Reporting theoretical issues without an exploit path.**

## Do Not
- Do not "fix" a permissions error by switching a route to the service-role client.
- Do not weaken rate limits or auth checks to make something work.
- Do not print, copy, or commit any env value. Names only.
- Do not fix issues found during a review task unless asked — **record** them.

## Update Project Knowledge
- Record findings in `CLAUDE.md` §7 Known Issues with severity.
- Add any new invariant to `.claude/MEMORY.md` §3 or §5.
- If a security-relevant item is deferred, put it in `.claude/ROADMAP.md` Phase 5.
