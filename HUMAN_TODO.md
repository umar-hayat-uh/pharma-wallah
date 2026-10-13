# HUMAN_TODO — what a person must do (AdSense remediation, 2026-10-13)

Nothing below can be done by code. Work top to bottom.

## 1. Decide now (blocking)

- [ ] **Clinical dosing errors** — `docs/CALCULATOR_INVENTORY_AND_ACCURACY.md` §3. Vancomycin AUC
  (4.5 g/day at MIC 2 labelled "Therapeutic"), renal apixaban tiers, pip-tazo band, geriatric renal rule,
  MME rotation to tramadol, fentanyl patch read as mg. Fix them, or take them offline
  (`src/lib/indexing.ts` + remove from `/clinical/dose-calculators` + a "known error" notice) before review.
- [ ] **Supabase:** run `supabase/migrations/20261013_battle_royale_privacy.sql` (adds
  `hide_from_leaderboard`). Until then the "Hide my name" button answers "not switched on yet".
- [ ] **Battle Royale winners:** admin → Results → Unfinalise → Finalise (rank 12 is labelled winner,
  rank 11 is not — finalised before the 30 Sep ranking change).

## 2. Content credits (`src/lib/content/bylines.ts`)

- [ ] Fill in, **only with real people who agree to be named**: `authorName`, `authorCredentials`,
  `reviewerName`, `reviewerCredentials`, `lastReviewed` (YYYY-MM-DD of a review that happened), keyed by
  page path. Until a reviewer and date are set, pages show the neutral note.
- [ ] Have a **licensed pharmacist or faculty member** review content — start with the five published
  guides and the 21 calculators that have worked examples (list: `docs/adsense-content-inventory.md`).
- [ ] Confirm the About/footer wording "Department of Pharmacy, University of Karachi" is how the owner
  wants the address described (it is presented as an address only, not an affiliation or endorsement).
- [ ] Confirm which inbox is monitored: `support@pharmawallah.com`.

## 3. Draft guides (25, `src/lib/guides/content/*.ts`, briefs in `content/briefs/`)

For each draft:
- [ ] A subject expert reads it, checks every formula against a textbook, and re-checks the worked
  examples (the drafting notes in each brief list the Python used).
- [ ] Add any source the brief lists under "Sources a reviewer must supply" to
  `src/lib/content/references.ts` (checked edition/year/publisher) and cite it by id.
- [ ] Set the guide's author and reviewer in `bylines.ts` (path `/guides/<slug>`), then change
  `meta.review.status` from `"draft"` to `"team-checked"` (or `"expert-reviewed"` with the reviewer's
  name, qualification and date). The test `scripts/content-governance.test.mts` refuses to publish a new
  guide without a recorded reviewer.
- [ ] Reviewer decisions flagged by the drafting agents: whether `renal-function-estimation` may link
  `gfr-calculator` (it prints drug-specific KDIGO text); the Michaelis–Menten t90 formula in
  `nonlinear-michaelis-menten-kinetics`; the Liso table values in `isotonicity-and-tonicity-adjustment`;
  `dissolution-calculator`'s correction method (under-corrects from the 3rd sample — not yet a recorded fault).

## 4. Sources still missing (30 calculators show no Sources section)

Add each source to `references.ts` after checking it, then add the id to the tool's `_learn.ts`:
anion gap (Kraut & Madias, CJASN 2007 — the page itself names NEJM, likely wrong), antagonism (Schild),
anticoagulation risk (CHA₂DS₂-VASc / HAS-BLED papers), ash value (WHO herbal QC 2011 / Ph. Eur. 2.4.16 —
the page cites vendor sites), BMI/IBW (WHO TRS 894, Devine), CFU (USP <61>), Child–Pugh (Pugh 1973),
corrected calcium (Payne 1973), drug–excipient compatibility, receptor binding (Cheng–Prusoff),
ED50 (Finney, Probit Analysis), GFR (Inker 2021, KDIGO 2024), heat of neutralization, heat-transfer area,
insulin sensitivity, mixing time, opioid conversion and MME (CDC 2022), osmolar gap, QT correction
(Bazett/Fridericia/Framingham), RBC/WBC counts (Dacie & Lewis), renal dosing (labels + Inker 2021),
Reynolds number, sodium correction (Katz 1973, Hillier 1999), sterilization (USP <1229>), therapeutic
index, TPN (ASPEN), vancomycin AUC (Rybak 2020), zone of inhibition (CLSI M100).

## 5. Deploy, then Search Console

- [ ] Push `main` (every push deploys — the phases are committed locally, not pushed).
- [ ] In Vercel, leave `NEXT_PUBLIC_ADS_ENABLED` **unset** until AdSense approves; set it to `true` only after.
- [ ] Vercel → Domains: redirect `academia.pharmawallah.com` → `www` (check Supabase auth redirect URLs
  first — `docs/TECHNICAL_SEO_AUDIT.md` S1).
- [ ] Verify `https://www.pharmawallah.com/ads.txt` returns exactly
  `google.com, pub-9553986083846603, DIRECT, f08c47fec0942fa0` as `text/plain`.
- [ ] Search Console → Sitemaps: submit `https://www.pharmawallah.com/sitemap.xml` (185 URLs).
- [ ] URL Inspection → Test live URL on `/`, `/guides/dose-calculations`,
  `/calculation-tools/dilution-calculator`, `/courses/physiology/unit4-the-heart`, and one old URL
  (`/calculation-tools/CorrectedCalciumCalculator` should 301). Request indexing for the first four.
- [ ] Wait **2–4 weeks** for recrawl after publishing.

## 6. Before requesting AdSense review

- [ ] **25 or more published, reviewed guides** (today: 5 published, 25 drafts).
- [ ] The clinical decision in §1 done.
- [ ] AdSense → Privacy & messaging: set up a **Google-certified CMP** for EEA/UK/CH. The site's own
  banner (`src/components/ConsentBanner.tsx`) only blocks the ad script until consent; it is not a
  certified CMP, so personalised ads in those regions need the certified one.
- [ ] Keep Auto ads off. Then request review.

## 7. Known limits of this pass

- `/contact`, `/faqs` and `/careers` have under 300 unique words but are **kept indexable on purpose**
  (trust pages). Change in `src/lib/indexing.ts` if you disagree.
- 55 routes are noindexed (list in the commit message / `src/lib/indexing.ts`); each entry says what
  "ready" means. Remove an entry to re-index a page once it has the content.
- The community and the encyclopedia are noindexed; the encyclopedia's DrugBank licence is unverified
  (Known Issue 16).
