# API Route Conventions

## Purpose
Write a route handler under `src/app/api/` that matches how this repo actually does auth,
validation, rate limiting, caching, and error responses.

## Trigger Examples
- "add an API endpoint for X"
- "this route returns the wrong error shape"
- "add pagination / filtering to an endpoint"

## Read First
- `src/app/api/qa/questions/route.ts` — the best validation + pagination reference.
- `src/app/api/progress/route.ts` — auth + rate limit + cache + partial-failure tolerance.
- `.claude/MEMORY.md` §3 (authorization) before any data access.

## Architecture Context
Next.js 14 App Router route handlers. Default runtime is Node; only
`src/app/api/prescription-reader-v2/route.ts` sets `runtime = 'edge'`.

**`src/app/api/` also contains plain data modules, not just handlers** —
`calculators.tsx`, `data.tsx`, `semester-data.tsx`, `team-members.tsx`, `physiology-data.ts`,
`biochemistry-data.ts`, `contex/ToasetContex.tsx`, `mcq-data/*.ts`. Only files named `route.ts`
are routes. Several of those data modules are dead (`MEMORY.md` §8 gotcha 6).

## Procedure

### 1. Module-scope constants first
```ts
const MAX_LIMIT = 50;
const MAX_TITLE_LEN = 300;
const MAX_CONTENT_LEN = 20000;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
```

### 2. Auth (fail closed)
```ts
const supabase = await createServerSupabaseClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) return errorResponse("Unauthorized", 401);
```
Admin routes additionally check the `ADMIN_EMAILS` allowlist — see
`requireAdmin()` in `src/app/api/admin/codes/route.ts`.

### 3. Rate limit (fail open)
User-keyed (`src/lib/rateLimit.ts`):
```ts
const { success } = await checkLimit(progressWriteLimiter, user.id);
if (!success) return errorResponse("Too many requests", 429);
```
IP-keyed (`src/lib/tournament-redis.ts`):
```ts
const ip = getClientIp(request);
const rl = await checkRateLimit(submitScoreLimiter, ip);
if (rl.blocked) return NextResponse.json({ error: "Too many requests" },
  { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
```
Use the existing limiters. Do **not** write a new one, and do **not** copy the in-memory `Map` in
`src/app/api/comments/route.ts` — it is a known defect.

### 4. Parse and validate
```ts
let body;
try { body = await req.json(); } catch { return errorResponse("Invalid JSON", 400); }

const pageRaw  = parseInt(searchParams.get("page")  || "1",  10);
const limitRaw = parseInt(searchParams.get("limit") || "10", 10);
const page  = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), MAX_LIMIT) : 10;

if (!["question", "answer"].includes(target_type ?? "")) return errorResponse("Invalid payload", 400);
```

### 5. Cache read (optional, fail open)
```ts
if (redis) {
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  } catch (err) { console.error("[route] cache read failed", err); }
}
```

### 6. Data access — choose deliberately
- `createServerSupabaseClient()` → anon key + user cookies, **RLS applies**.
- `createServiceSupabaseClient()` / `supabaseAdmin` → **RLS bypassed**; your ownership filter is
  the only protection.
- `connectDB()` + a mongoose model → the `pharmawallah` database.
- `clientPromise` from the **root** `lib/mongodb.tsx` → the `pharmacopedia` database.

### 7. Tolerate partial failure on multi-query reads
```ts
const results = await Promise.allSettled([ /* queries */ ]);
const unwrap = <T,>(r: PromiseSettledResult<{data: T[]|null; error: any}>, label: string): T[] => {
  if (r.status === "rejected") { console.error(`[route] ${label} rejected`, r.reason); return []; }
  if (r.value.error)          { console.error(`[route] ${label} error`, r.value.error); return []; }
  return r.value.data || [];
};
```

### 8. Respond
Success: the payload directly, or `{ success: true, ... }` for mutations.
Error: `{ error: "message" }` with an explicit status.

| Status | When |
| --- | --- |
| 400 | Missing/invalid input, unparseable JSON |
| 401 | Not authenticated, or not on the admin allowlist |
| 403 | Authenticated but not permitted (tournament `NO_ATTEMPTS_LEFT`) |
| 404 | Target record does not exist |
| 409 | Conflict (e.g. question already answered this attempt) |
| 429 | Rate limited — add `Retry-After` where the limiter provides it |
| 500 | Unexpected server/database error |
| 502 | An upstream external API failed (RxNorm, PubMed, …) |

Log server-side with a bracketed prefix: `console.error("[progress GET] …", err)`. Never return an
internal error message or stack to the client.

## Files Usually Involved
- `src/app/api/<feature>/route.ts`
- `src/lib/supabase-server.ts`, `src/lib/rateLimit.ts`, `src/lib/tournament-redis.ts`, `src/lib/redis.ts`

## Security Checks
- [ ] Auth before any mutation; 401 on failure.
- [ ] Ownership filter on every service-role query.
- [ ] Client-supplied ids never used as authorization.
- [ ] Admin allowlist on admin routes.
- [ ] Rate limit on anonymous / expensive / paid endpoints.
- [ ] Every input validated and clamped.
- [ ] Mongo regex escaped.
- [ ] No internal error detail leaked to the client.

## Validation
Confirm each branch returns the right status: missing param → 400, anonymous → 401, spam → 429.

## Tests & Verification
```bash
npx tsc --noEmit
npm run dev
curl -s -i "localhost:3000/api/<route>?<params>"
```
No tests exist; lint does not run. Exercise every error branch you added and say what you saw.

## Common Failure Modes
- Creating a data module under `src/app/api/` and expecting it to be a route. Only `route.ts` is.
- Using the wrong Supabase client and losing (or unexpectedly hitting) RLS.
- Importing the wrong Mongo client — empty results, no error.
- Rate limiter failing **closed** — it must fail open; see `checkLimit`'s comment.
- Module-scope env validation in a new lib file, which breaks `npm run build`.
- Returning `{ message }` instead of `{ error }` — clients expect `error`.

## Do Not
- Do not write a new rate limiter.
- Do not return raw database errors to the client.
- Do not add `export const runtime = 'edge'` to anything importing `@supabase/supabase-js` — it
  uses `process.version`, unsupported on Edge.

## Update Project Knowledge
Add the new route to `.claude/PROJECT_MAP.md`. If it introduces a new Redis key or Supabase table,
add it to `.claude/MEMORY.md` §4.
