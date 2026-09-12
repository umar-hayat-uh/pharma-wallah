# Caching & Rate Limiting

## Purpose
Use this project's three caching layers (Upstash Redis, MongoDB cache models, Next revalidation)
and its rate limiters correctly — including the deliberate fail-open behaviour.

## Trigger Examples
- "this data is stale"
- "add caching to this endpoint"
- "rate limit this route"
- "why did I get a 429?"
- "the leaderboard isn't updating"

## Read First
- `src/lib/redis.ts`, `src/lib/rateLimit.ts` — the progress-side client and limiters.
- `src/lib/tournament-redis.ts` — the tournament-side client and limiters.
- `.claude/MEMORY.md` §4 — the complete key/TTL/limit table.

## Architecture Context

### Two Redis clients with different failure semantics — this trips people up
| File | Construction | If env vars missing |
| --- | --- | --- |
| `src/lib/redis.ts` | `url && token ? new Redis({url, token}) : null` | Exports **`null`**; callers guard with `if (redis)` and run uncached |
| `src/lib/tournament-redis.ts` | `Redis.fromEnv()` | **Throws at import.** The tournament cannot run without Upstash |

Upstash is REST/HTTP-based, so there is no connection-pool concern in serverless — unlike a raw TCP
client.

### Key namespaces and TTLs
| Key | Written by | TTL |
| --- | --- | --- |
| `progress:v1:{userId}` | `GET /api/progress` | 45s |
| `tournament:code:{CODE}` | `validate-code` | 300s |
| `tournament:attempt:{code}:{game}:{n}` | `check-answer` | 1200s |
| `tournament:leaderboard:v1` | `src/lib/leaderboard-data.ts` | 30s |

### Rate limiters
| Limiter | Window | Keyed by | File |
| --- | --- | --- | --- |
| `progressReadLimiter` | 20 / 10s | user id | `rateLimit.ts` |
| `progressWriteLimiter` | 10 / 10s | user id | `rateLimit.ts` |
| `validateCodeLimiter` | 20 / 60s | IP | `tournament-redis.ts` |
| `gameQuestionsLimiter` | 10 / 60s | IP | `tournament-redis.ts` |
| `submitScoreLimiter` | 8 / 60s | IP | `tournament-redis.ts` |
| `registerLimiter` | 5 / 10min | IP | `tournament-redis.ts` |
| PubMed (inline) | 10 / 60s | IP | `src/app/api/clinical/pubmed/route.ts` |

### MongoDB as a long-lived cache
`DrugFinderCache`, `AdverseEffectCache` (and the interaction models) use a unique `queryKey` plus a
TTL index — `expireAfterSeconds: 60*60*24*30` (30 days) on `fetchedAt`. **Mongo expires these
itself**; there is no eviction code to write.

Supabase tables `pubmed_cache`, `medlineplus_cache`, `clinicaltrials_cache` serve the same role for
literature sources, keyed by `buildCacheKey()` from `src/lib/api/cacheKey.ts`.

## Procedure

### Adding a Redis cache to a read path
```ts
const cacheKey = `namespace:v1:${identifier}`;       // always version the namespace

if (redis) {
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  } catch (err) { console.error("[route] cache read failed", err); }   // FAIL OPEN
}

const fresh = await loadFromDb();

if (redis) {
  redis.set(cacheKey, fresh, { ex: TTL_SECONDS })
       .catch(err => console.error("[route] cache write failed", err));  // fire-and-forget
}
return NextResponse.json(fresh, { headers: { "X-Cache": "MISS" } });
```

### Invalidating
Every write path to cached data must invalidate:
- progress → `await invalidateProgressCache(user.id)` (`src/lib/progress-server.ts`)
- leaderboard → `await invalidateLeaderboardCache()` (`src/lib/leaderboard-data.ts`)
- entry code → `await redis.del(\`tournament:code:${code}\`)`

### Adding a rate limit
Reuse an existing limiter if one fits. If you genuinely need a new one, add it beside its
siblings — `rateLimit.ts` for user-keyed, `tournament-redis.ts` for IP-keyed — with a distinct
`prefix`. Then call `checkLimit` / `checkRateLimit`; never call `limiter.limit()` raw, because the
helpers are what implement fail-open.

### Adding a Mongo cache
Copy `src/lib/models/DrugFinderCache.ts`: unique indexed `queryKey`, a `fetchedAt` TTL index, and
`models.X || model("X", schema)` to survive hot reload.

## Files Usually Involved
- `src/lib/redis.ts`, `src/lib/rateLimit.ts`, `src/lib/tournament-redis.ts`
- `src/lib/leaderboard-data.ts`, `src/lib/progress-server.ts`
- `src/lib/models/*Cache.ts`, `src/lib/api/cacheKey.ts`

## Security Checks
- [ ] Cache keys include the user id for **per-user** data. A shared key for per-user data leaks it
      to whoever requests next — the most dangerous caching mistake available here.
- [ ] Rate-limit keys use the user id where a session exists, IP only for anonymous endpoints.
- [ ] Nothing sensitive (tokens, emails) is written into a cache value that a different-scoped key
      could serve.
- [ ] Limiters **fail open** — a limiter that fails closed takes the whole app down when Upstash
      blips.
- [ ] Auth still **fails closed**. Only caching and limiting fail open.

## Validation
- TTL set on every `redis.set` (`{ ex: N }`). A key without a TTL lives forever.
- Namespace versioned (`:v1:`) so a shape change can be rolled without stale-shape reads.
- Every `redis.get`/`set` wrapped in try/catch or `.catch()`.

## Tests & Verification
```bash
npm run dev
curl -s -D- -o /dev/null "localhost:3000/api/progress"   # look at X-Cache: MISS then HIT
for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code} " localhost:3000/api/<route>; done  # expect 429s
```
Remember the TTLs when testing: progress 45s, leaderboard 30s, entry code 300s. Data "not
updating" is usually the cache doing its job. No tests exist.

## Common Failure Modes
- **Testing a change and seeing stale data** — wait out the TTL or delete the key.
- **Forgetting to invalidate** after a write.
- **`Redis.fromEnv()` throwing at import** in a tournament route with no Upstash env vars.
- **Guarding `redis` in the tournament files** — there it is never null; the guard belongs in the
  `src/lib/redis.ts` consumers.
- **Caching per-user data under a shared key.**
- **Setting a key with no TTL.**
- **Making a limiter fail closed.**
- **Copying the in-memory `Map` limiter from `comments/route.ts`** — it is a known defect, not a
  pattern.

## Do Not
- Do not introduce a second caching mechanism; three layers is already plenty.
- Do not cache authenticated responses at the HTTP/CDN layer.
- Do not raise rate limits to work around a client-side retry loop — fix the loop.

## Update Project Knowledge
Any new key namespace, TTL, or limiter goes into `.claude/MEMORY.md` §4. That table is what future
sessions use to debug staleness and 429s.
