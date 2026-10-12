# Technical SEO audit

> AdSense remediation, 2026-10-12. Evidence: live requests to production (GET only), a crawl of
> production and a crawl of a local production build of the working tree
> (`docs/audit-data/`, regenerated with `scripts/audit-crawl.py`). Statuses: CONFIRMED · POTENTIAL ·
> NOT VERIFIED · FIXED · BLOCKED.

## 1. Domain strategy

| Host | What it serves (measured) | Canonical | Decision |
| --- | --- | --- | --- |
| `www.pharmawallah.com` | the site | self | **Primary, the only host meant to be indexed** |
| `pharmawallah.com`, `http://…` | 308 → `https://pharmawallah.com/` → 308 → `https://www.…` | — | two hops; see S5 |
| `academia.pharmawallah.com` | **the same Vercel deployment** (DNS → `vercel-dns-017`), full copy of every page | every page → www | duplicate host; consolidate (S1) |
| `clinical.pharmawallah.com` | same deployment; middleware tags it and serves the clinical landing at `/` | every page → www (`/` → `/clinical`) | intended sub-brand; canonicals already consolidate |

No code or comment in the repo describes `academia` as a separate product; its only references
were four "student site" links in the clinical navbar, footer and CTA.

## 2. Findings

| # | Finding | Status | Evidence | Action |
| --- | --- | --- | --- | --- |
| S1 | `academia.` duplicates the whole site | CONFIRMED · partly FIXED | `curl https://academia.pharmawallah.com/` → 200, title and canonical identical to www; `/robots.txt` and `/sitemap.xml` also served there | Clinical links now point to www (FIXED). Domain-level 308 → www: **BLOCKED on owner** (Vercel → Domains → set `academia.` to redirect to `www.`). Not done in middleware because Google sign-in returns to `window.location.origin + /api/auth/callback`: a redirect could break an in-flight sign-in on that host, and the Supabase allowed redirect URLs (not in the repo) must be checked first |
| S2 | No structured data anywhere | CONFIRMED · FIXED | live crawl: 0 pages with JSON-LD | Organization + WebSite on `/`; BreadcrumbList on all 106 calculators, `/guides` and each guide; Article on each guide (`src/lib/structured-data.tsx`). Local crawl: 113 pages with JSON-LD. No ratings, reviews or medical schema |
| S3 | Closed event pages in the sitemap answer 200 + client redirect | CONFIRMED · FIXED | live: `/battle-royale/register`, `/instructions` contain `NEXT_REDIRECT;replace;/battle-royale` with HTTP 200 (153 words) | removed from `sitemap.ts`, with a note to re-add if the event reopens |
| S4 | Unknown slugs under dynamic routes are soft 404s | CONFIRMED · accepted | `/guides/x`, `/courses/x`, `/courses/<subject>/x` → 200 + not-found UI + `noindex`; a static miss (`/x`) → 404. Cause: root `loading.tsx` streams before `notFound()` (gotcha 183); `dynamicParams = false` does not change it (measured) | noindex keeps them out of the index; a real fix means moving the root loading boundary — not worth the risk now |
| S5 | `http://pharmawallah.com` takes two redirects to reach www | CONFIRMED · BLOCKED | `http://pharmawallah.com` → 308 `https://pharmawallah.com/` → 308 `https://www.…` | owner: Vercel domain settings (apex → www directly) |
| S6 | Trailing slash | CONFIRMED · OK | `/calculation-tools/` → 308 → `/calculation-tools` | none |
| S7 | Canonicals | CONFIRMED · OK | both crawls: every indexable page has an absolute www canonical; the only non-self canonical is `/mcqs-bank/semester-4/physical-pharmacy` → semester-1 copy (deliberate) | none |
| S8 | Sitemap | CONFIRMED · FIXED | live 223 URLs, all 200, none noindexed; local 228 (+ `/guides`, 5 guides, `/editorial-policy`; − 2 closed-event pages) | derived from registries; no fabricated `lastmod` (none is emitted) |
| S9 | robots.txt | CONFIRMED · OK | allows `/`, disallows `/api/`, `/admin`, `/dashboard`; does not block `/_next` | none |
| S10 | Titles and descriptions | CONFIRMED · OK | live and local: one duplicate title among indexable pages, the semester-4/semester-1 MCQ pair that canonicalises | none |
| S11 | Little server-rendered text on interactive pages | POTENTIAL | 16 indexable routes have < 230 words of server HTML including navigation (simulations, clinical search shells, community, ADR Detective) | not changed: they are working tools whose content appears after hydration; Google renders JS. Adding filler text would be the "words for their own sake" the brief forbids |
| S12 | Calculator teaching content is client-rendered | POTENTIAL · mitigated | the calculators are `"use client"` pages, but their text (formula, About, FAQ, and now worked examples) is in the server HTML — e.g. dilution calculator 690 words live | long-form material that must be readable without JS now lives in **server-rendered guides** |
| S13 | Core Web Vitals / image optimisation | NOT VERIFIED | needs field data (Search Console / Vercel Speed Insights dashboard) | manual step |
| S14 | Mobile rendering | CONFIRMED · OK (sample) | headless Chrome at 390×844 (touch): guides, editorial policy, 6 enriched calculators — 0 horizontal overflow, 0 console errors | full-site mobile pass NOT VERIFIED |

## 3. Search Console (NOT VERIFIED — no access from this environment)

See `ADSENSE_MANUAL_VERIFICATION.md` §1 for the exact steps: submit the sitemap, inspect a sample
of URLs (a guide, a calculator, the home page) with the URL Inspection tool and compare the
rendered HTML, check Coverage for "Duplicate, Google chose different canonical" on `academia.`
and `clinical.`, and check Page Experience.
