# Implement Feature

## Purpose
Add or change functionality in PharmaWallah safely, matching the repo's existing patterns, without
breaking the authorization model or the verification baselines.

## Trigger Examples
- "add a new API endpoint for X"
- "let users filter questions by tag"
- "add a field to the progress payload"
- "build the X page"

## Read First
1. `.claude/PROTOCOL.md` — execute it; this skill is the implementation detail inside step 7.
2. `.claude/MEMORY.md` §3 (authorization — **mandatory**) and §8 (gotchas).
3. `.claude/PROJECT_MAP.md` — find the nearest existing neighbour to copy.
4. The domain skill if one matches: `calculator-tool`, `course-content-system`, `tournament-system`,
   `progress-tracking`, `clinical-and-external-apis`, `ai-gemini-integration`, `spotting-lessons`.

## Architecture Context
Next.js 14 App Router. Pages are `"use client"` by default; server work happens in route handlers
under `src/app/api/` and in `src/actions/lesson.ts`. Three data stores (Supabase, two MongoDB
databases, Upstash Redis) and two authorization models coexist — see `MEMORY.md` §3.

## Procedure
1. **Find the nearest neighbour and read it fully.** Do not design from scratch; this repo has a
   near-duplicate of almost everything.
   - API route with validation → `src/app/api/qa/questions/route.ts`
   - API route with auth + cache + partial-failure tolerance → `src/app/api/progress/route.ts`
   - API route with anti-cheat → `src/app/api/tournament/check-answer/route.ts`
   - External API + Mongo cache → `src/app/api/drugs/finder/route.ts`
   - Page → the closest page in the same pillar
2. **Decide the authorization model explicitly** before writing data access:
   - Needs to read/write another user's-scoped data reliably → service role + **your own ownership
     filter**.
   - Community-style content → anon/user client + RLS (policies live in Supabase, not here).
   - Never switch models to silence a permissions error.
3. **Write the route handler in this order** — the established shape:
   ```ts
   const MAX_LIMIT = 50;                       // module-scope limits
   function errorResponse(m: string, s: number) { return NextResponse.json({ error: m }, { status: s }); }

   export async function POST(req: Request) {
     const supabase = await createServerSupabaseClient();
     const { data: { user }, error } = await supabase.auth.getUser();
     if (error || !user) return errorResponse("Unauthorized", 401);

     const { success } = await checkLimit(limiter, user.id);
     if (!success) return errorResponse("Too many requests", 429);

     let body; try { body = await req.json(); } catch { return errorResponse("Invalid JSON", 400); }
     // validate + clamp every field here

     const db = await createServiceSupabaseClient();   // RLS BYPASSED from here
     // ... .eq("user_id", user.id) on every query
   }
   ```
4. **Validate and clamp every input.** `Number.isFinite`, explicit allow-lists for enums, a
   `MAX_*` ceiling on anything paginated, length caps on text.
5. **Rate-limit** anything anonymous, expensive, or paid. Reuse `src/lib/rateLimit.ts` (user-keyed)
   or `src/lib/tournament-redis.ts` (`checkRateLimit`, IP-keyed) — do not write a new limiter, and
   do not copy the in-memory `Map` in `comments/route.ts`.
6. **Handle cache invalidation** if you wrote data something caches.
7. **Fail open on cache/limiter errors; fail closed on auth.** Wrap Redis calls in try/catch, log,
   and continue to Postgres.
8. **Build the UI** matching the neighbouring page: `"use client"`, `lucide-react` icons,
   `framer-motion` for motion, Tailwind brand tokens. See `.claude/skills/frontend-ui-conventions/`.
9. **Register it.** This repo has hand-maintained registries; a new file is often invisible until
   you add it:
   - calculator → its subject in `src/app/(site)/calculation-tools/tool-index.ts`
   - course subject → `SUBJECTS` in `src/lib/courses/registry.ts`
   - nav entry → `src/components/Layout/Header/Navigation/`
   - protected route → `PROTECTED_PATHS` in `src/middleware.ts`
10. **Verify** — see Tests & Verification.
11. **Knowledge sync** — `.claude/PROTOCOL.md` step 10.

## Files Usually Involved
- `src/app/api/<feature>/route.ts`
- `src/app/(site)/<feature>/page.tsx` or `src/app/clinical/<feature>/page.tsx`
- `src/lib/<feature>.ts`, `src/hooks/use<Feature>.ts`, `src/types/<feature>.ts`
- A registry file (see step 9)

## Security Checks
Run `.claude/PROTOCOL.md` step 6 in full. The ones most often missed here:
- [ ] Ownership filter on **every** service-role query.
- [ ] A client-supplied id is never authorization — resolve ownership server-side.
- [ ] Admin actions check `ADMIN_EMAILS`; middleware only proves "logged in".
- [ ] Answer keys stripped before any scored payload reaches the browser.
- [ ] Scores/grades computed server-side.
- [ ] No new `NEXT_PUBLIC_*` secret.

## Validation
- Every query param parsed, range-checked, clamped.
- Every enum checked against an explicit allow-list (`["question","answer"].includes(...)`).
- Text length capped (`MAX_TITLE_LEN`, `MAX_CONTENT_LEN` are the precedent).
- Mongo regex input escaped: `q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")`.
- JSON body parse wrapped in try/catch returning 400.

## Tests & Verification
```bash
npx tsc --noEmit    # baseline 0 errors — any error is yours
npm run build       # baseline passes WITH .env
npm run dev         # then actually load the page / hit the endpoint
```
**No test infrastructure exists** — never claim tests passed. **`npm run lint` does not work**
(no ESLint config; it opens an interactive prompt and exits 0) — never claim lint passed.
Static checks are not behaviour: exercise the change and say what you observed.

## Common Failure Modes
- **Adding a file and expecting it to appear.** Registries are hand-maintained (step 9).
- **Forgetting the ownership filter** on a service-role query — silent full-table exposure.
- **Importing the wrong Mongo client** — empty results, no error.
- **Adding a Supabase column in code** that does not exist in the database. You cannot migrate;
  ask the user.
- **Writing a new rate limiter** instead of using the shared ones.
- **Breaking the build by adding module-scope env validation** — it runs during "Collecting page
  data".
- **Applying Next 15/16 patterns.** This is Next 14.

## Do Not
- Do not install packages, change env values, or refactor unrelated code without asking.
- Do not edit generated files (`public/sw.js`, `public/workbox-*.js`, `next-env.d.ts`, `.next/`).
- Do not commit or push unless asked.
- Do not weaken the tournament's server-authoritative scoring.
- Do not add `/leaderboard` back to `PROTECTED_PATHS`.

## Update Project Knowledge
`.claude/PROTOCOL.md` step 10: Work Log + Current State in `CLAUDE.md`, status in `ROADMAP.md`,
new entry points in `PROJECT_MAP.md`, new invariants/traps in `MEMORY.md`, and this or another
skill if the procedure was wrong or incomplete.
