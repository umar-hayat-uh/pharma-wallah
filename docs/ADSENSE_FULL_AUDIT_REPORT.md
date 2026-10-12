# AdSense full audit report — PharmaWallah

**Date:** 2026-10-12 · **Scope:** www.pharmawallah.com, academia.pharmawallah.com, clinical.pharmawallah.com
and the repository (Next.js 14.2.35 App Router, Supabase, MongoDB, Upstash, Vercel).
**Trigger:** AdSense rejection for "Low value content". **No change can guarantee approval.**

Companion reports: [route inventory](ADSENSE_ROUTE_INVENTORY.md) ·
[calculator inventory and accuracy](CALCULATOR_INVENTORY_AND_ACCURACY.md) ·
[content and features](CONTENT_AND_FEATURE_AUDIT.md) · [privacy and trust](PRIVACY_AND_TRUST_AUDIT.md) ·
[technical SEO](TECHNICAL_SEO_AUDIT.md) · [changelog](ADSENSE_REMEDIATION_CHANGELOG.md) ·
[manual verification](ADSENSE_MANUAL_VERIFICATION.md) · [content review policy](content-review-policy.md) ·
[generated content inventory](adsense-content-inventory.md).
This report supersedes the first brief's `adsense-remediation-audit.md` and
`adsense-educational-content.md` (the latter's content-gap analysis is
[CONTENT_AND_FEATURE_AUDIT §4](CONTENT_AND_FEATURE_AUDIT.md)).

## 1. Executive summary

PharmaWallah's main product, 106 calculators, was technically sound for indexing: unique titles,
www canonicals, a clean sitemap. But it read to a reviewer as a **directory of tools with thin
explanation**, with **inconsistent and overstated claims** around it: four different calculator
counts, a "complete curriculum" for four first-semester subjects, Windows and iPhone apps that do
not exist, and Terms that contradicted the Privacy Policy. It had **no statement of who writes the
content or how it is checked**, and some clinical tools give wrong doses.

This pass:
- made every public claim match the code or data;
- added a verified teaching layer to 21 calculators and five original guides;
- added an editorial policy, review-status labels and error-report links everywhere;
- added structured data, and cleaned the sitemap and duplicate host links.

It also found **dangerous dosing errors in several clinical tools**. They are not fixed: that needs the
owner's decision. **Recommendation: resolve them before requesting review.**

Google's own criteria (AdSense Help, *Eligibility requirements* and *Google AdSense content and user
experience*): "original, high-quality content", "enough unique content", no "pages with little to
no content", no "scraped or copyrighted content", and expand or consolidate similar pages.
Third-party commentary adds that health topics are judged on a stricter trust standard.

## 2. Methodology

Repository reading. Two same-host crawls (production before, a local production build after),
with every route's status, title, canonical, robots, server-rendered text and JSON-LD recorded
(`docs/audit-data/`). Headless Chrome at 1440 × 900 and 390 × 844. Python re-derivation of every
new worked example, plus tracing through each calculator's own code. Import-level validation of
all 660 MCQs. `aapt`/`unzip` on the published APK. A read-only scientific audit of 12 clinical
tools against their primary sources. All existing test suites. Two Claude sessions did the work on
disjoint files.

## 3. Ten highest-priority findings

| # | Finding | Severity | Status |
| --- | --- | --- | --- |
| 1 | Clinical tools give wrong doses: vancomycin AUC/MIC (4.5 g/day at MIC 2 labelled "Therapeutic"), renal apixaban never evaluates the dose-reduction criteria, geriatric renal rule (metformin at CrCl 25), MME rotation to tramadol 450 mg/day, fentanyl patch read as mg | critical | CONFIRMED · **BLOCKED on owner** |
| 2 | Calculators taught little beyond a formula and FAQ (12 of 106 had a worked example) | high | FIXED for 21 tools + 5 guides; 85 remain |
| 3 | No authorship, review or correction process stated anywhere | high | FIXED — `/editorial-policy`, provenance line on 106 tools, review labels |
| 4 | Conflicting calculator counts (106 / 105 / 95 / 94) | high | FIXED — one `CALCULATOR_COUNT`; the hub's "95 in this index" kept and explained |
| 5 | Download page offered Windows and iPhone, neither of which exists | high | FIXED — Android only; others "not available yet" |
| 6 | Courses page: "Complete Curriculum", "HEC Standardized Syllabus", "licensure preparation" for 4 Semester 1 subjects | high | FIXED — derived counts, honest copy |
| 7 | Terms said no registration exists; Privacy lacked the event data flow and the pathology-test Gemini flow; Privacy claimed ads are shown | high | FIXED |
| 8 | Homepage podium read the runner-up first in its text; rank 12 labelled "winner" while rank 11 is not | medium | podium FIXED with tests; winners **BLOCKED** (admin Unfinalise → Finalise) |
| 9 | `/encyclopedia` republishes DrugBank text; licence unverified | medium | NOT VERIFIED — owner |
| 10 | `academia.` serves a full duplicate of the site; closed-event pages in the sitemap as soft redirects; no structured data | medium | sitemap and JSON-LD FIXED; domain redirect **BLOCKED** (Vercel) |

Also: a concatenated hero h1 ("…Solved.The whole Pharm-D,Solved.Measured…") — FIXED; "past papers"
and "spaced repetition" menu claims — FIXED; 54 calculators with recorded formula faults — CONFIRMED,
owner decision.

## 4. Counts (verified)

| Item | Count |
| --- | --- |
| Calculator pages on the website | **106** (95 listed on the hub + 11 registered elsewhere) |
| Calculators in the Android app / offline | **106 / 106** (APK v1.5, minSdk 24, 9.2 MB, INTERNET permission only) |
| Course subjects / units | **4 / 22** (all Semester 1) |
| MCQ questions | **660** (150 + 120 + 180 + 210), 0 invalid answer keys, 7 repeated texts |
| Guides | **5** (new) |
| Routes crawled | 241 local after (240 × 200; `/dashboard` 307 to sign-in) |

## 5. What was tested

| Check | Result |
| --- | --- |
| Type-check (web and mobile) | 0 errors |
| Lint | not available (no config) — **not a pass** |
| Unit tests | 256 pass, 0 fail across 11 suites (11 new tests) |
| Production build | pass; bundle sizes unchanged |
| Android export | pass; 0 ad strings |
| Crawl | 0 broken links found from the home page and sitemap; 0 soft redirects; 228 sitemap URLs all 200 |
| Browser | 13 pages at desktop and phone width, 0 overflow, 0 console errors |
| **Not tested** | MCQ scoring and reports, every simulation's interaction, Safari, dark mode, real phones, a real contact email, the APK rebuilt with today's content, Search Console, the AdSense account |

## 6. Remaining risks

1. Clinical dosing errors (finding 1) — the single largest trust risk.
2. 85 calculators still without a worked example; 54 with recorded faults.
3. DrugBank licensing on `/encyclopedia`.
4. Thin server-rendered text on interactive pages. Google renders JavaScript, but a reviewer skimming
   source would see little; deliberately not padded.
5. Traffic and site age: AdSense's "consistent presence" signals cannot be changed in code.
6. No independent expert has reviewed any content. This is stated honestly; a real reviewer would
   strengthen it.

## 7. Is the project ready for a human AdSense-readiness review?

**Not yet — one decision away.** The content, claims, policies and technical SEO are in a state a
human reviewer can assess fairly. The clinical dosing errors should be fixed or taken offline
first. After that: deploy, resubmit the sitemap, wait for recrawl
(`ADSENSE_MANUAL_VERIFICATION.md`), then have a person read a sample of pages before you press
"Request review".

## 8. Audit limitations

Search Console and the AdSense account were not accessible. Production data was read only through
public endpoints. The 22 course units, the flashcards and the 660 MCQs were checked for structure,
not re-read for scientific accuracy. Two sessions edited in parallel; each verified its own pages in
a browser, and the combined tree was built and crawled once at the end.
