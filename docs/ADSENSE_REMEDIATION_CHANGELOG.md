# AdSense remediation changelog — 2026-10-12

Two Claude sessions worked from the same briefs on disjoint files: **95** = `pharma-wallah-95`,
**da** = `pharma-wallah-da`. No formula, database, environment variable, DNS or hosting setting was
changed. Nothing was committed.

## Content and teaching (95 unless marked)

| File(s) | Change | Why |
| --- | --- | --- |
| `src/lib/content/references.ts` (new) | Registry of 23 verified sources; pages cite by id | no invented citations; one place to check editions |
| `src/lib/content/governance.ts` (new) | `ContentReview` (draft / team-checked / expert-reviewed, the last requiring a named reviewer), `reviewLabel`, `reportErrorHref` | truthful review status; error-report links |
| `src/components/calculators/CalcLearn.tsx` (new) + `index.ts` | Worked example, mistakes, limitations, references, related tools, guide link | the teaching standard for calculator pages |
| 21 × `(tools)/<slug>/_learn.ts` (new) + their `page.tsx` (+3 lines each) | Teaching sections. 15 by 95's agents, 6 by da | the gap measured in the inventory: 12 of 106 tools had a worked example |
| `src/lib/guides/{types,index}.ts`, `src/lib/guides/content/*.ts` (5) | Five guides as typed data | original long-form teaching, server-rendered |
| `src/components/guides/GuideArticle.tsx`, `src/app/(site)/guides/{page,[slug]/page}.tsx` | Guide index and article pages | — |
| `src/app/(site)/editorial-policy/page.tsx` (new) | Public editorial and corrections policy | trust, accountability |
| `(tools)/layout.tsx` | Provenance line + "Report an error" on every calculator; BreadcrumbList JSON-LD | trust; structured data |

## Accuracy and claims

| File | Change | By | Why |
| --- | --- | --- | --- |
| `src/components/battle-royale/Podium.tsx`, `src/lib/battle-royale/{ranking.ts (new),leaderboard.ts}` | Podium list now in rank order (CSS places it 2·1·3), explicit "1st place" labels; board re-sorted with a deterministic tie-break (total ↓, time ↑, code ↑) | 95 | the runner-up (175) read first in the page text above the winner (185) |
| `src/app/(site)/courses/page.tsx` | "Complete Curriculum / 4+ Modules / HEC Standardized Syllabus / licensure" → derived "4 subjects / 22 units / Sem 1"; honest lede | 95 | unsupported claims |
| `src/app/(site)/calculation-tools/tool-index.ts` | `CALCULATOR_COUNT` (106) | da | one definition for every public count |
| `src/components/Home/landing/*` | hero "The whole Pharm-D" → "Pharmacy maths,"; h1 text no longer concatenates; tape spacing; ended-tournament pillar removed; course/spotting/MCQ copy made accurate; CTA to guides | da | concatenated hero, overclaims |
| `about-us`, `faqs`, `contact`, `download/*`, `calculation-tools/how-to-use`, `calculator-guide/GuideTour.tsx` | counts derived; Download shows Android only (Windows hidden unless an installer file exists; iPhone "not available yet"); pharmacist-review FAQ; contact `?subject=` prefill + labels | da | contradictory app and count claims |
| `terms`, `privacy` | Terms v1.1 (accounts, community, educational calculators, corrections); Privacy v3.1 (event registration) | da | Terms contradicted Privacy |
| `privacy` (two lines) | AdSense "shows ads" → "uses AdSense … where ads are shown"; pathology-test Gemini marking disclosed; prescription photos not stored | 95 | unverified ad claim; undisclosed data flow |
| `Layout/Footer`, `Layout/Header/*` | support@ email; links to guides, how-to-use, editorial policy, report an error; menu labels; removed "past papers" and "spaced repetition" claims | da | dead/false claims, consistency |
| `src/components/Clinical/{ClinicalFooter,ClinicalNavbar,ClinicalCTA}.tsx` | `academia.` links → `www.` | 95 | duplicate host |
| `src/lib/seo.ts` (one line) | default description | da | — |

## Technical SEO (95)

| File | Change |
| --- | --- |
| `src/lib/structured-data.tsx` (new), `src/app/page.tsx` | Organization + WebSite JSON-LD on the home page |
| `src/app/sitemap.ts` | + `/guides`, 5 guides, `/editorial-policy`; − closed-event `/battle-royale/register`, `/instructions` |

## Tests, scripts, docs (95)

| File | What |
| --- | --- |
| `scripts/content-governance.test.mts` (new) | 7 tests: content complete, registered references, links exist, no fake review |
| `scripts/battle-royale.test.mts` | + 4 ranking/podium tests |
| `scripts/content-inventory.mjs`, `scripts/audit-crawl.py`, `scripts/route-inventory.py` (new) | regenerable inventories |
| `docs/*` | this report set, `content-review-policy.md`, generated inventories, `audit-data/` crawls |

## Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | 0 errors (repo); `-p mobile/tsconfig.json` 0 errors |
| `npm run lint` | **not run — not configured** (no ESLint config; opens a setup prompt). Not a pass |
| `node --test` suites | 256 pass, 0 fail (pharmacy-counter 47, tlc+colony 41, molecular-lab 21, community 19, ai-guide 34, dissolution-rate 28, split-for-ads 6, battle-royale 27, stability-kinetics 26, content-governance 7) |
| `npm run build` (isolated copy of the final tree) | exit 0; shared JS 88.6 kB, middleware 81.9 kB (unchanged); `/guides` 107 kB first load |
| `npm run mobile:build` | exit 0; 0 ad strings in `mobile/out`; worked examples present, guide links absent in the app |
| Local production crawl | 241 routes, 240 × 200 + `/dashboard` 307; 0 soft redirects; 228 sitemap URLs all 200; 113 pages with JSON-LD |
| Headless Chrome 1440 × 900 and 390 × 844 | guides, editorial policy, 6 enriched calculators (95); home, about, contact, FAQ, download, 2 calculators (da): 0 overflow, 0 console errors |
| Not verified | real phone, Safari, dark mode, a real contact-form email, Search Console, the AdSense account, the APK rebuilt with the new content (the published APK v1.5 predates it) |

## Remaining

See `ADSENSE_MANUAL_VERIFICATION.md`. Most important: the clinical-calculator decision.
