# AdSense Monetization

## Purpose

Add, move, or debug a Google AdSense placement on the website without breaking the offline Android
app, the PDF export, AdSense's viewability measurement, or AdSense policy.

## Trigger Examples

- "Add an ad to the encyclopedia pages"
- "Ads aren't showing in production"
- "Why is there a grey dashed box on every calculator?"
- "Turn ads off on the tournament pages"
- "We got an AdSense policy warning"

## Read First

- `src/components/calculators/AdSlot.tsx` — the **only** placement component. Read it before
  anything else; its three no-render branches explain most "ads aren't showing" reports.
- `src/app/layout.tsx` — the `adsbygoogle.js` loader and the `google-adsense-account` meta tag.
- `.claude/MEMORY.md` §6 (ad env vars) and §8 gotchas **28–34**.
- `.claude/skills/android-app-capacitor/SKILL.md` if the surface is a calculator.

## Architecture Context

**One component, one loader. The loader always ships; the ad *units* are env-gated.**

- `src/app/layout.tsx` renders the loader `<Script>` **unconditionally**, with
  `strategy="beforeInteractive"` so it lands in the server-rendered `<head>` — where AdSense asks
  for it and where its crawler looks. The publisher ID is a hardcoded constant with a
  `NEXT_PUBLIC_ADSENSE_CLIENT` override. It was env-gated until an AdSense verification failed
  because `.env` is gitignored and Vercel never had the value (`MEMORY.md` gotcha 31).
- The same layout emits `<meta name="google-adsense-account" content="ca-pub-…">` through
  `generateMetadata`, on both the site and clinical branches — AdSense's second verification
  method, independent of script execution.
- `AdSlot` renders an `<ins class="adsbygoogle">` and pushes `adsbygoogle.push({})` from an
  effect. It renders **nothing** when:
  1. `NEXT_PUBLIC_IS_MOBILE_APP === "true"` (the Android app — offline by design, and serving ads
     in a packaged APK breaches AdSense policy);
  2. there is no publisher ID or no `slot` **and** `NODE_ENV === "production"`;
  3. (dev only, same condition) it draws a labelled dashed placeholder instead — that grey box is
     intentional, it shows where an ad will sit.
- `public/ads.txt` authorises the publisher: `google.com, pub-<id>, DIRECT, f08c47fec0942fa0`.
  Without it AdSense reports "Earnings at risk" and may throttle bidding.
- Privacy (`src/app/(site)/privacy/page.tsx`) and terms already disclose AdSense cookies. If a
  placement reaches a new category of visitor data, check those two pages still cover it.

**Publisher ID:** `ca-pub-9553986083846603`. A public identifier — it ships in `ads.txt` and in
every page's source — so it is *not* a secret and is hardcoded as the default. The **slot** IDs
still come from env, so **Vercel needs every `NEXT_PUBLIC_ADSENSE_SLOT_*` set in the project
settings** or production renders no ad units.

### Current placements — 7 across 5 surfaces

| Surface | File | Slot env var |
| --- | --- | --- |
| Home landing ×3 | `src/components/Home/landing/{LandingPage,Chrome}.tsx` (`AdBand`) | `_HOME_1/2/3` |
| Calculator hub | `src/app/(site)/calculation-tools/CalculationToolsClient.tsx` | `_LIST` |
| **All 89 calculators** | `src/app/(site)/calculation-tools/(tools)/layout.tsx` | `_CALCULATOR_FOOTER` |
| Migrated calculators' `aside` | the tool page itself (3 of 89 so far) | `_CALCULATOR` |
| Course subject listing | `src/app/(site)/courses/[subjectSlug]/page.tsx` | `_LIST` |
| Course lesson | `src/components/course/UnitPageClient.tsx` | `_LESSON` |

### Surfaces deliberately left ad-free

Auth pages, `/dashboard`, `/admin`, tournament play and `/leaderboard`, the timed spotting and MCQ
tests, the simulations, and the AI tools (chat, prescription reader). They are thin, private, or
timed — an ad is disruptive there and, on a no-content page, a policy risk. **Do not add one
without asking.** This is also the argument for keeping **Auto ads off**: Auto ads inject into
exactly these pages and ignore the list.

## Procedure

1. **Decide whether the surface should carry an ad at all.** Check the exclusion list above. A
   page with little content, behind a login, or under a timer is a no.
2. **Pick or add a slot env var.** Reuse `_LIST` for a listing page, `_LESSON` for long-form
   content. A genuinely new format gets a new `NEXT_PUBLIC_ADSENSE_SLOT_<NAME>` — add it to `.env`
   (blank is fine), to `.claude/MEMORY.md` §6, and to the table above.
3. **Place it, following the four hard constraints:**
   - a plain `<div>` wrapper — **never** inside a `framer-motion` / animated / transformed parent
     (gotcha 29);
   - **outside** any `printRef` used by `PdfDownloadButton` (gotcha 30a);
   - gated on content actually existing — `{content && …}`, `length > 0` (gotcha 30b);
   - below or beside the thing the visitor came for, never where it reads as part of the UI.
4. **Reserve the space.** Pass a `min-h-*` class (the home bands use `min-h-[280px]`) so nothing
   shifts when the ad loads.
5. **To cover every calculator at once, edit the `(tools)/layout.tsx` — not 89 pages.** It is
   web-only by construction (gotcha 28).
6. **Verify** (below), then knowledge-sync: this skill's table, `MEMORY.md`, `ROADMAP.md`
   Phase 4.6, and a `CLAUDE.md` work-log entry.

## Files Usually Involved

- `src/components/calculators/AdSlot.tsx` — the component
- `src/app/layout.tsx` — the loader script
- `src/app/(site)/calculation-tools/(tools)/layout.tsx` — the all-89 band
- `src/components/Home/landing/Chrome.tsx` — `AdBand`
- `public/ads.txt`, `.env`
- `src/app/(site)/{privacy,terms}/page.tsx` — the disclosures

## Security Checks

- [ ] The publisher ID and slot IDs are the **only** ad values in `NEXT_PUBLIC_*`. No key, token,
      or secret ever goes near an ad variable.
- [ ] No placement on `/admin`, `/dashboard`, or any authenticated-only data view.
- [ ] The APK still has **zero** ad strings — verify, don't assume (command below).
- [ ] No third-party ad script added beyond Google's loader; the loader stays in the root layout so
      there is exactly one.

## Validation

```bash
npx tsc --noEmit          # baseline: 0 errors
```

**Verification-tag checks must run against the production build, not dev** — `beforeInteractive`
placement and `generateMetadata` output are what ship, and the live host is what AdSense reads:

```bash
# local production output
npm run build && npx next start -p 3100     # only with `npm run dev` stopped (gotcha 21)
curl -s http://localhost:3100/ > /tmp/p.html
python3 - <<'EOF'
h=open('/tmp/p.html').read(); he=h.find('</head>')
for n in ['pagead2.googlesyndication.com','google-adsense-account','ca-pub-']:
    i=h.find(n); print(n, 'NOT FOUND' if i<0 else ('INSIDE <head>' if i<he else 'in <body>'))
EOF

# the live site — the only thing AdSense actually sees
curl -s https://www.pharmawallah.com/ | grep -c "ca-pub"      # must be > 0
curl -s -o /dev/null -w "%{http_code}\n" https://www.pharmawallah.com/ads.txt   # 200
```

Exercise the surface on the dev server and count what rendered. With a publisher ID set and slots
blank, dev draws the placeholder, so the placeholder is the proof a placement is wired:

```bash
curl -s http://localhost:3000/calculation-tools/animal-dose \
  | grep -o "Set NEXT_PUBLIC_ADSENSE_CLIENT" | wc -l      # 1 = the (tools) layout band
curl -s http://localhost:3000/ | grep -o "ca-pub-" | wc -l  # loader present
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/ads.txt   # 200
```

Use `grep -o | wc -l`, not `grep -c` — server-rendered HTML is one long line, so `grep -c` only
ever reports 1.

## Tests & Verification

There is no test infrastructure and `npm run lint` does not work (`MEMORY.md` §8 gotchas 4, and
`CLAUDE.md` §9). Type-check, then exercise the page. **Never run `npm run build` while
`npm run dev` is up** — gotcha 21.

**Always prove the Android app is unaffected when a calculator surface changed:**

```bash
npm run mobile:build          # safe alongside dev; writes to mobile/.next
for t in ca-pub adsbygoogle googlesyndication data-ad-client; do
  echo "$t -> $(grep -rl "$t" mobile/out | wc -l) files"   # every one must be 0
done
ls -l mobile/out/_next/static/css/*.css   # ~96 KB, not ~10 KB (gotcha 23)
```

The env-var *name* `NEXT_PUBLIC_ADSENSE_CLIENT` does survive in the mobile bundle as a dead
expression — that is fine and expected. Ad *markup*, the publisher ID, and the loader URL must not.

## Common Failure Modes

| Symptom | Cause |
| --- | --- |
| **"Couldn't verify your site"** | The loader is not in the **live** HTML. Check with `curl -s https://www.pharmawallah.com/ \| grep -c ca-pub` — **never** judge this from the dev server. Causes seen: the value only in gitignored `.env` (gotcha 31), and `afterInteractive` keeping the tag out of the SSR markup (gotcha 32) |
| No ad *units* in production, loader present | The `NEXT_PUBLIC_ADSENSE_SLOT_*` vars are blank, or set in `.env` only — **also set them in Vercel** |
| Home page has no `adband` markup at all | Intentional: `AdBand` returns `null` without a slot ID (gotcha 34) |
| A placement renders nothing while others work | Its slot env var is blank. `AdSlot` needs both a client ID **and** a `slot` |
| Grey dashed box everywhere | The dev-only placeholder. Expected; set the slot IDs or check `NODE_ENV` |
| `adsbygoogle.push() error: All 'ins' elements already have ads` | The same slot pushed twice. `AdSlot`'s `pushed` ref guards StrictMode's double effect — don't remove it |
| Ad appears in a downloaded lesson PDF | It was placed inside `printRef` (gotcha 30a) |
| AdSense reports low viewability or a policy warning | The placement is inside an animated/transformed parent (gotcha 29), or on a no-content page |
| "Earnings at risk — no ads.txt" | `public/ads.txt` missing, or the publisher ID in it is wrong |
| Ads showing on timed tests / the tournament | **Auto ads** were enabled in the dashboard. Turn them off; the code's placements are deliberate |
| Ads appear in the APK | Something bypassed `AdSlot`, or an ad was added to a tool **page** instead of the `(tools)` layout |

## Do Not

- Do **not** paste the raw `<script src="…adsbygoogle.js">` snippet into a page. The loader belongs
  in `src/app/layout.tsx` once, gated on the env var.
- Do **not** write `<ins class="adsbygoogle">` by hand anywhere. Use `AdSlot`.
- Do **not** hard-code the publisher ID or a slot ID in a component.
- Do **not** add an ad to a calculator **page** — use the `(tools)` layout, or the page would ship
  it into the APK.
- Do **not** enable Auto ads without discussing the excluded surfaces.
- Do **not** remove `AdSlot`'s mobile-app guard or its `pushed` ref.

## Update Project Knowledge

After changing placements: update the tables in this skill, `.claude/MEMORY.md` §6 if an env var
was added, `.claude/ROADMAP.md` Phase 4.6, `.claude/PROJECT_MAP.md` if a new entry point appeared,
and add a `CLAUDE.md` §8 work-log entry.
