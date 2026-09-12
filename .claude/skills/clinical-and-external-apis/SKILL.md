# Clinical Subdomain & External APIs

## Purpose
Work on the `clinical.*` sub-brand and the six external biomedical data sources behind it —
including the caching layers that keep them within rate limits.

## Trigger Examples
- "add a new clinical tool"
- "the drug finder returns nothing"
- "integrate <some medical API>"
- "why is this showing cached data?"
- "the clinical subdomain looks wrong"

## Read First
- `src/lib/api/pubmed.ts` + `src/app/api/clinical/pubmed/route.ts` — the cleanest client+route pair.
- `src/app/api/drugs/finder/route.ts` + `src/lib/models/DrugFinderCache.ts` — the Mongo cache pattern.
- `src/lib/api/cacheKey.ts` — `buildCacheKey()`, shared by the literature sources.

## Architecture Context

### Subdomain routing
`src/middleware.ts` checks `host.startsWith('clinical.')` and sets an `x-subdomain: clinical`
header on both the request and the response. `src/app/layout.tsx` reads it via `headers()` to swap
metadata and pass `isClinicalSubdomain` into `AppShell`.

**The clinical pages live at `src/app/clinical/…` and are also reachable at `/clinical/...` on the
main domain.** The header changes chrome and metadata only — it is not an access control.

### The six external sources
| Source | Client | Route | Cache |
| --- | --- | --- | --- |
| RxNorm (NLM) | `src/lib/api/rxnorm.ts` | `/api/drugs/finder` | Mongo `DrugFinderCache` |
| openFDA | `src/lib/api/openfda.ts` | `/api/drugs/adverse-effects` | Mongo `AdverseEffectCache` |
| DailyMed | `src/lib/api/dailymed.ts` | `/api/clinical/dailymed` | — |
| MedlinePlus | `src/lib/api/medlineplus.ts` | `/api/clinical/medlineplus` | Supabase `medlineplus_cache` |
| PubMed (NCBI) | `src/lib/api/pubmed.ts` | `/api/clinical/pubmed` | Supabase `pubmed_cache` |
| ClinicalTrials.gov | `src/lib/api/clinicaltrials.ts` | `/api/clinical/clinicaltrials` | Supabase `clinicaltrials_cache` |

Plus local datasets: `src/data/drug-drug-interactions.json` and
`src/data/Drug to Food interactions Dataset.json`, loaded by `src/lib/drug-{drug,food}-interactions.ts`
and served from Mongo-backed routes; and `amr_surveillance` in Supabase for the AMR dashboard.

### Two deliberate separations
- **Drug Finder ≠ Adverse Effects.** Finder answers "what is this drug" from **RxNorm only**;
  Adverse Effects answers "is it safe" from **openFDA**. Separate routes, clients, and models —
  stated explicitly in `DrugFinderCache.ts`. Do not merge them or cross-call.
- **Mongo caches** hold drug identity/safety data (30-day TTL index); **Supabase caches** hold
  literature results (keyed by `buildCacheKey()`).

### Rate-limit etiquette
PubMed allows 3 req/s anonymously, 10 req/s with `NCBI_API_KEY`. `pubmed.ts` sends `tool` and
`email` params as NCBI requires. The route adds its own inline Upstash limiter at 10/60s per IP.
These are third-party services — being throttled or blocked affects real users.

## Procedure

### Adding a new external source
1. **Client in `src/lib/api/<source>.ts`** — pure fetch logic, exported typed interfaces, no
   Next.js imports, no caching. Document the base URL, rate limit, and doc link in a header comment
   (see `pubmed.ts`).
2. **Route in `src/app/api/clinical/<source>/route.ts`:**
   ```
   parse + validate params  →  rate limit (IP)  →  cache read  →  client call
     →  cache write  →  respond
   ```
3. **Pick the cache layer to match the data**: long-lived drug identity/safety → a Mongo model with
   a `queryKey` unique index and a `fetchedAt` TTL index; literature/search results → a Supabase
   cache table keyed by `buildCacheKey("<namespace>", params)`.
4. **Return 502, not 500, when the upstream fails** — `/api/drugs/finder` is the precedent
   (`"RxNorm service unavailable, try again shortly"`).
5. **Include a `source` field** in the response (`"cache"` | `"rxnorm"` | …) so the UI and you can
   tell where the data came from.
6. Add a `suggest/` sub-route if the UI needs autocomplete — `finder/suggest/` and
   `adverse-effects/suggest/` are the pattern.

### Adding a clinical page
Create `src/app/clinical/<feature>/page.tsx`, link it from `src/app/clinical/page.tsx`, and reuse
`src/components/Clinical/` and `src/components/MedicalDisclaimerBanner.tsx`. Clinical brand tokens
live in `tailwind.config.ts`: `clinicalPrimary`, `clinicalAccent`, `clinicalDark`, `clinicalMuted`,
`clinicalSurface`, plus `shadow-clinical-glow` and the `clinical-float`/`clinical-pulse` animations.

## Files Usually Involved
- `src/lib/api/*.ts`, `src/lib/api/cacheKey.ts`
- `src/app/api/clinical/**/route.ts`, `src/app/api/drugs/**/route.ts`
- `src/lib/models/{DrugFinderCache,AdverseEffectCache,DrugDrugInteraction,DrugFoodInteraction}.ts`
- `src/app/clinical/**/page.tsx`, `src/components/Clinical/`
- `src/middleware.ts`, `src/app/layout.tsx`

## Security Checks
- [ ] API keys (`OPENFDA_API_KEY`, `NCBI_API_KEY`) stay server-side — never `NEXT_PUBLIC_*`.
- [ ] Every anonymous clinical route is rate limited; these are public and unauthenticated.
- [ ] User input is URL-encoded before going into an upstream query string.
- [ ] Mongo regex input escaped.
- [ ] Upstream error messages are not forwarded verbatim to the client.
- [ ] Clinical/dosing output carries a medical disclaimer.

## Validation
- Required query param missing → 400 with a clear message.
- Numeric params (`retmax`, `retstart`, `limit`) parsed and clamped.
- Empty upstream result returns a structured "not found" with suggestions where available — see
  `/api/drugs/finder`'s `found: false` + `suggestions` shape — rather than an error.

## Tests & Verification
```bash
npm run dev
curl -s "localhost:3000/api/drugs/finder?q=amoxicillin"     | head -c 400   # first: live
curl -s "localhost:3000/api/drugs/finder?q=amoxicillin"     | head -c 400   # second: source:"cache"
curl -s "localhost:3000/api/clinical/pubmed?q=metformin&retmax=3" | head -c 400
```
Check the `source` field flips to `cache` on the second call. Test a nonsense query and an empty
query. **No tests exist.** Requires `MONGODB_*` and Supabase env vars.

## Common Failure Modes
- **Calling an upstream on every request** because the cache read was skipped or the key differs
  per call (unsorted params — use `buildCacheKey`, which sorts and lowercases).
- **Returning 500 for an upstream outage** instead of 502.
- **Merging Finder and Adverse Effects** — an explicit design boundary.
- **Using the wrong Mongo client.** These routes use `connectDB()`/`@/lib/mongodb` (mongoose,
  `pharmawallah`), **not** the root `lib/mongodb.tsx` (`pharmacopedia`, used only by
  `/api/search` and `/api/autocomplete`).
- **Forgetting the `fetchedAt` TTL index** on a new cache model — the collection grows forever.
- **Copying `/api/clinical/amr`'s client choice.** It uses the browser client server-side — a
  known quirk, not a pattern.
- **Expecting `x-subdomain` to gate access.** It only changes chrome.

## Do Not
- Do not hammer NCBI, openFDA, or DailyMed in a loop while testing — cache first.
- Do not put a third-party API key in a `NEXT_PUBLIC_*` variable.
- Do not present clinical data without a disclaimer.
- Do not add a new source without a cache layer.

## Update Project Knowledge
New source → add a row to `.claude/PROJECT_MAP.md` §External API clients, and record the cache
table/model and any new env var **name** in `.claude/MEMORY.md` §4/§6.
