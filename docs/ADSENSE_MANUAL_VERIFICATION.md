# Manual verification — what needs a human with account access

> Nothing below could be checked from the development environment. Each item is NOT VERIFIED or
> BLOCKED until someone does it. Order is the suggested order.

## 1. Before deploying

1. **Decide on the clinical calculators** (`CALCULATOR_INVENTORY_AND_ACCURACY.md` §3). Vancomycin
   AUC (V1), renal apixaban (R1/R2), pip-tazo (R3), geriatric renal rule (E1), MME rotation (P1) and
   opioid fentanyl patch (O1) can produce wrong doses. Fix them, or take them out of
   `/clinical/dose-calculators`, noindex them and put a "known dosing error" notice on each. A
   reviewer who finds a dangerous dosing tool will not judge the site trustworthy.
2. **Commit as one unit** (both sessions' changes) — every push to `main` deploys (MEMORY 161).

## 2. Google Search Console (NOT VERIFIED)

1. Sitemaps → submit `https://www.pharmawallah.com/sitemap.xml` again; expect ~228 URLs.
2. URL Inspection → *Test live URL* for `/`, `/guides/dilution-and-concentration`,
   `/calculation-tools/dilution-calculator`. Check *View tested page → HTML* contains the worked
   example and the JSON-LD, and *Enhancements* shows Breadcrumbs (and Article for the guide).
3. Rich Results Test on a guide and a calculator → no errors.
4. Pages → look for "Duplicate, Google chose different canonical" on `academia.` / `clinical.` hosts.
5. Core Web Vitals and Page Experience → note any failing URL group (also Vercel → Speed Insights).

## 3. Owner checks

| Item | Why | Where |
| --- | --- | --- |
| Redirect `academia.pharmawallah.com` → `www` (and apex → www in one hop) | duplicate host; two-hop redirect | Vercel → Project → Domains. First confirm Supabase → Auth → URL configuration allows `https://www.pharmawallah.com/api/auth/callback` |
| support@ vs info@ inbox | the footer now says support@ | mail provider |
| "Dept. of Pharmacy, University of Karachi" address | must not imply an affiliation that does not exist | footer, `/contact` |
| DrugBank licence for `/encyclopedia` | verbatim DrugBank text on a monetised site (Known Issue 16) | the import's licence terms |
| `POST /api/scan-colonies` | unauthenticated Gemini spend (Known Issue 17) | delete, or add the shared limiter |
| Battle Royale winners | rank 12 is labelled winner, rank 11 is not (finalised before the 30 Sep ranking migration) | admin → Results → Unfinalise → Finalise |
| A pharmacist or lecturer to review the guides | lets the "review status" honestly change | `src/lib/content/governance.ts` → `expert-reviewed` |

## 4. AdSense account (NOT VERIFIED)

1. Policy center → confirm there is no other open issue besides "Low value content".
2. Sites → `pharmawallah.com` → keep **Auto ads off** (they would place ads on the ad-free pages).
3. Request review only after deploying, resubmitting the sitemap and seeing the new URLs indexed.

## 5. Production checks after deploy

```bash
curl -s https://www.pharmawallah.com/guides | grep -c "Calculation guides"          # > 0
curl -s https://www.pharmawallah.com/ | grep -c 'application/ld+json'                # 2
curl -s https://www.pharmawallah.com/sitemap.xml | grep -c '<loc>'                   # ~228
curl -s https://www.pharmawallah.com/calculation-tools/dilution-calculator | grep -c 'Worked example'
python3 scripts/audit-crawl.py https://www.pharmawallah.com after.json && \
  python3 scripts/route-inventory.py docs/audit-data/crawl-live-2026-10-12.json after.json
```

Also on a real phone: a guide, a calculator's worked example, the contact form prefill, and the APK
download — none of these were checked on hardware.
