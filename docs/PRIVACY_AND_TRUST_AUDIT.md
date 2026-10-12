# Privacy and trust audit

> AdSense remediation, 2026-10-12. Legal copy was edited by session `pharma-wallah-da` (Terms,
> Privacy, FAQ, Contact, About, footer) and by `pharma-wallah-95` (two Privacy lines, marked †).
> **Nothing here is legal advice or a compliance claim**; the policies were reconciled with what the
> code does, not reviewed by a lawyer.

## 1. Data flows, as found in the code

| Flow | What leaves the browser, and to whom | Verified 2026-10-12? | In Privacy? |
| --- | --- | --- | --- |
| Accounts | name, email; password handled by Supabase Auth; **Google sign-in** (`signInWithOAuth({ provider: "google" })`, callback `/api/auth/callback`) | yes (code) | yes |
| Study progress, dashboard | progress tables in Supabase, keyed to the account | from the 2026-09-23 audit, not re-verified | yes |
| Community posts, comments, votes | Supabase (`community_*`), public by design | from 2026-09-23, not re-verified | yes |
| Battle Royale registration | name, email, phone, university, Pharm-D year, optional student ID; payment status; results. Name + university + score shown publicly on the leaderboard; Resend emails | yes (code: `registrationSchema`, `leaderboard.ts`) | **added** (Event registration section) |
| Contact and careers forms | name, email, subject, message → Resend → a fixed team inbox; IP rate limited | yes (code) | yes |
| AI Guide | the question and conversation → Google Gemini; conversations saved in the browser (`useThreads`, localStorage) | yes (code) | yes |
| Prescription Reader | the photo → Gemini; **not stored** by PharmaWallah (route has no storage or insert) | yes (code) | yes †(made explicit) |
| Pathology spot test | the student's written answer → Gemini for marking (`/api/evaluate-histology`) | yes (code) | **was missing** † added |
| Analytics | Vercel Web Analytics + Speed Insights (`src/app/layout.tsx`) | yes (code) | yes |
| Rate limiting | client IP → Upstash Redis (29 files use the shared limiters) | yes (code) | yes |
| Browser storage | localStorage: AI Guide threads, community density, TLC/molecular-lab saves (IndexedDB), calibration hand-off, Battle Royale station state, an old install-banner flag | yes (code) | covered in general terms |
| Advertising | AdSense loader on every web page; ad units env-gated; **no ad has been observed filling** (site not approved). Never in the apps | yes (code + live HTML) | **wording fixed** † — said "shows advertisements", now "uses AdSense to show advertisements on some pages … where ads are shown" |
| Orphaned Gemini endpoint | `POST /api/scan-colonies` — unauthenticated, no rate limit, unused by the site | yes (Known Issue 17) | n/a — owner decision |

## 2. Mismatches found

| # | Mismatch | Status |
| --- | --- | --- |
| T1 | Terms: "does not require user registration … accessible without creating an account" — contradicted Privacy and the product | CONFIRMED · FIXED (Terms v1.1, Oct 2026: accounts, community posts, calculators-are-educational, errors and corrections) |
| T2 | Privacy had no Battle Royale section although the event collected phone numbers and published names | CONFIRMED · FIXED (Privacy v3.1, 12 Oct 2026) |
| T3 | Privacy said ads are shown | CONFIRMED · FIXED (†) |
| T4 | Privacy did not mention the pathology test's Gemini marking | CONFIRMED · FIXED (†) |
| T5 | Footer email info@ vs support@ everywhere else | CONFIRMED · FIXED (footer → support@). **Which inbox is monitored: owner check** |
| T6 | "Dept. of Pharmacy, University of Karachi" address (footer, contact) | NOT VERIFIED — owner check; no affiliation may be implied |
| T7 | Contact page promised to "respond promptly" | FIXED (removed) |
| T8 | No statement of who writes and checks content, or how to report errors | FIXED — `/editorial-policy`, "Report an error" links on every calculator and guide, contact form prefills the subject |
| T9 | No page claimed a pharmacist review; none has happened | CONFIRMED — now stated plainly on calculators, guides, FAQ and About |
| T10 | Policy dates | Terms Feb 2025 → v1.1 Oct 2026; Privacy → v3.1 12 Oct 2026 — changed only because the text was revised against the code this session |

## 3. Trust signals now on the site

- `/editorial-policy`: who writes PharmaWallah (pharmacy students; AI-assisted drafts disclosed),
  the checks, how references are chosen, what the review labels mean, corrections, clinical limits.
- Calculator footer line on all 106 tools: built by the student team, not independently reviewed by
  a pharmacist, *Report an error* · *How we build and check our tools*.
- Guides: byline, updated date, review status, references, report-an-error link.
- `docs/content-review-policy.md`: the internal version of the same process.

## 4. For human review

See `ADSENSE_MANUAL_VERIFICATION.md` §3 (inbox, address, DrugBank licence, a lawyer's read if the
owner wants assurance beyond accuracy).
