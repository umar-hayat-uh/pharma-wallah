# Analyze Feature

## Purpose
Explain how an existing feature in PharmaWallah actually works — its routes, data flow,
authorization, caching, and failure modes — without re-reading the whole repository.

## Trigger Examples
- "analyze the tournament scoring"
- "how does progress tracking work?"
- "explain the drug finder"
- "what happens when a user votes on an answer?"

## Read First
1. `.claude/PROJECT_MAP.md` — find the feature's section; it lists the real entry points.
2. `.claude/MEMORY.md` §2 (decisions), §3 (authorization), §4 (data), §8 (gotchas).
3. Only then open source files.

## Architecture Context
Features here span up to five layers. Trace them in this order:

```
page (src/app/(site)/… or src/app/clinical/…)   "use client", usually one large file
  └─ hook (src/hooks/…) or direct fetch()
       └─ route handler (src/app/api/…/route.ts)
            ├─ auth:  createServerSupabaseClient() -> auth.getUser()
            ├─ limit: checkLimit() / checkRateLimit()
            ├─ cache: redis.get(...)  -> hit returns early
            └─ data:  createServiceSupabaseClient() | supabaseAdmin   (RLS BYPASSED)
                    | connectDB() + a mongoose model                  (pharmawallah)
                    | clientPromise from root lib/mongodb.tsx         (pharmacopedia)
                    | a client in src/lib/api/*.ts                    (external HTTP)
```

## Procedure
1. **Locate.** Use `.claude/PROJECT_MAP.md`. If the feature is absent from the map, search by
   route segment (`grep -rn "api/<segment>" src`) and add it to the map when done.
2. **Read the page** to learn what it requests and what shape it expects back.
3. **Read the route handler top to bottom.** Record, in order: auth check, rate limit, validation,
   cache read, data access, cache write, response shape, error branches.
4. **Identify the authorization model.** Service-role → the handler's own filter is the only
   protection. Anon/user client → RLS, whose policies are **not in this repo**. Say which.
5. **Identify every store touched** and, for Mongo, **which of the two clients/databases**.
6. **Map the cache keys and TTLs** against `.claude/MEMORY.md` §4.
7. **Find the failure modes**: what happens if Redis is down, if the external API 502s, if a child
   query fails, if the user is anonymous.
8. **Check status honestly.** A page existing is not a working feature. Look for: an
   under-construction branch, hardcoded/mock data, a registry the page is not listed in, an import
   nothing resolves. Cross-check `.claude/ROADMAP.md`.
9. **Report** the flow as a short trace, not a file dump.

## Files Usually Involved
- `.claude/PROJECT_MAP.md`, `.claude/MEMORY.md`
- `src/app/(site)/<feature>/page.tsx` or `src/app/clinical/<feature>/page.tsx`
- `src/app/api/<feature>/route.ts`
- `src/lib/<feature>*.ts`, `src/hooks/use*.ts`

## Security Checks
Even in read-only analysis, flag these if you see them:
- A service-role query with **no ownership filter**.
- A client-supplied id used as authorization.
- An unauthenticated route that spends money (the four Gemini routes) or writes data.
- Any secret in a `NEXT_PUBLIC_*` variable.

## Validation
Nothing is modified, so nothing to run. If you assert a file or symbol exists, **verify it** —
this repo has real dead code (see `PROJECT_MAP.md` §Dead or orphaned code) and it is easy to
analyze a file nothing calls.

## Tests & Verification
No test infrastructure exists. Do not claim verification you did not do. If you want to confirm
runtime behaviour, say you would need to run `npm run dev` and exercise the page.

## Common Failure Modes
- **Analyzing dead code.** `src/app/api/calculators.tsx` looks like the calculator registry and is
  not. Nine `src/lib/courses/subjects/*-data.ts` files look live and are not.
- **Assuming a Supabase table/policy exists** because code references it. The schema is not here.
- **Missing the second Mongo client.** `/api/search` and `/api/autocomplete` use a different
  database from every other Mongo route.
- **Assuming middleware protects a route.** Only four paths are in `PROTECTED_PATHS`.
- **Reporting the page you found as "the feature"** when the registry that surfaces it is
  elsewhere (calculators, courses).

## Do Not
- Do not modify code during an analysis task.
- Do not summarise from documentation alone — read the source.
- Do not present a file inventory as an explanation.

## Update Project Knowledge
- Add any newly traced entry points to `.claude/PROJECT_MAP.md`.
- Add any non-obvious behaviour or trap you uncovered to `.claude/MEMORY.md` §8.
- Correct `.claude/ROADMAP.md` if the real status differs from what it claims.
