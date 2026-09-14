# Android App (Capacitor)

## Purpose
Build, change, and ship the offline Android app — a calculators-only static export of this repo
wrapped by Capacitor.

## Trigger Examples
- "add the new calculator to the Android app"
- "the app shows a blank screen / a tool is missing in the APK"
- "build an APK"
- "make X work offline on mobile"
- "why is there a second Next.js project in mobile/?"

## Read First
- `mobile/README.md` — the operational guide; this skill is the reasoning behind it.
- `.claude/skills/deployment-and-env/SKILL.md` — especially "do not add `output: export`".
- `capacitor.config.ts`, `mobile/next.config.mjs`, `scripts/generate-mobile-routes.mjs`.

## Architecture Context

### Why there are two Next.js projects
The main app has API routes and middleware and therefore **cannot** be statically exported. The
89 calculators, however, are all `"use client"` and import only `react`, `lucide-react`,
`recharts` and `framer-motion` — zero `@/` imports, no `next/image`, no `next/navigation`, no
server APIs. So `mobile/` is a second **project root** (`next build mobile`) that compiles only
those pages with `output: "export"`, and Capacitor packages `mobile/out` into the APK.

**Never add `output: "export"` to the root `next.config.mjs` to avoid this split.** It breaks every
API route and the middleware.

### Single source of truth
Calculators live only in `src/app/(site)/calculation-tools/(tools)/<slug>/page.tsx`.
`scripts/generate-mobile-routes.mjs` emits a one-line re-export page per tool:

```tsx
export { default } from "@/app/(site)/calculation-tools/(tools)/<slug>/page";
```

Those files, plus `mobile/app/_generated/tool-slugs.ts`, are **generated and gitignored**. They are
re-emitted on every `npm run mobile:build`, and the script deletes slugs whose directory is gone.
`mobile/tsconfig.json` maps `@/*` to `../src/*`, and `experimental.externalDir: true` in
`mobile/next.config.mjs` is what lets Next compile files outside its project root.

### The mobile app ships 89 tools; the web hub lists 78
The web hub's registry (`tool-index.ts`, formerly `allTools`) listed 78 then; 93 of 104 on 2026-09-13. Eleven more directories exist: six linked only from
`src/app/clinical/dose-calculators/page.tsx`, five linked from nowhere. Offline there is no
clinical subdomain, so the app ships all 89 via `mobile/app/_data/tool-registry.ts`.

**That registry cannot silently lose a tool.** `ToolHub` compares the generated `TOOL_SLUGS`
against the categories and renders anything unclaimed under an automatic "More Tools" group. This
is the opposite of the web hub's behaviour (`MEMORY.md` §8 gotcha 9), where forgetting to register
a tool makes it unreachable.

### Offline exception
The **CFU Calculator** is the only tool that calls an API (`/api/scan-colonies`, Gemini). It is
badged "Needs internet" on the home screen, short-circuits with an explanation when
`navigator.onLine === false`, and its manual entry path still works. `SCAN_API_BASE` comes from
`NEXT_PUBLIC_API_BASE_URL`, which is empty on the web (same-origin) and set to the production
origin in `mobile/next.config.mjs`.

## Procedure

### Add a calculator to the app
Nothing is required — add the tool to `(tools)/` as usual and run `npm run mobile:sync`. To place
it in the right category rather than "More Tools", add its slug to a `CATEGORIES` entry **and** its
display name to `TOOL_NAMES` in `mobile/app/_data/tool-registry.ts`.

### Build
```bash
npm run mobile:build    # routes + static export -> mobile/out
npm run mobile:sync     # + cap sync android
cd android && ./gradlew assembleDebug   # needs JDK 21 (see below) and ANDROID_HOME
```

### After changing anything shared
Rebuild **both**: `npx tsc --noEmit` (root), `npm run build` (web), `npm run mobile:build`.
A calculator edit now has two consumers.

## Files Usually Involved
- `capacitor.config.ts`, `android/` (committed; build output and copied assets are gitignored)
- `mobile/next.config.mjs`, `mobile/tsconfig.json`, `mobile/tailwind.config.ts`
- `mobile/app/layout.tsx`, `mobile/app/_components/{MobileShell,ToolHub,useOnlineStatus}`
- `mobile/app/_data/tool-registry.ts`
- `scripts/generate-mobile-routes.mjs`

## Security Checks
- [ ] **No secret in the bundle.** `next build mobile` loads env from `mobile/`, so the root `.env`
      is never read. Verify: `grep -rl "eyJ\|supabase.co\|UPSTASH" mobile/out/ | wc -l` → must be 0.
- [ ] `NEXT_PUBLIC_API_BASE_URL` holds a **public origin only**, never a key.
- [ ] Do not import anything from `@/lib/supabase*`, `@/lib/mongodb` or `@/lib/redis` into a
      calculator — it would pull server config into a client bundle that ships inside an APK.

## Validation
```bash
npm run mobile:build
find mobile/out/calculation-tools -name index.html | wc -l     # expect 90 (89 tools + hub)
grep -rohE 'https://[a-zA-Z0-9._/-]+' mobile/out/_next/static/chunks/ | sort -u
#   ^ the only external origin should be the API base; anything else breaks offline use
cd mobile/out && python3 -m http.server 8899   # then load / and a deep link
```

## Deploying the web app with this in the repo
The root `tsconfig.json` **must** exclude `mobile` and `android`, and `.vercelignore` must skip
them. The generated route tree and `_generated/tool-slugs.ts` are gitignored, so on a fresh clone
`ToolHub.tsx` imports a module that isn't there — without the exclude, Vercel's `next build` fails
the type-check and the whole site fails to deploy. Verify with:

```bash
mv mobile/app/_generated /tmp/ && npx tsc --noEmit; mv /tmp/_generated mobile/app/
#   ^ must exit 0 — this is exactly what Vercel sees
```

Vercel never builds the APK. Distribution is separate: Play Store, or an APK hosted for download.

## Styling: shadcn/ui + two Tailwind traps
The app uses **shadcn/ui** — the *same* primitives as the website. There is no `mobile/components/`
(an earlier version of this skill said there was): `@/*` resolves to `../src/*`, so the app imports
`src/components/ui/*`, `src/components/calculators/*` and `cn()` from `src/lib/utils.ts`. Restyle a
primitive once and both surfaces change. Tokens live in `mobile/app/globals.css` mapped to the brand
(`--primary` is brandBlue). New primitives must stay dependency-free (only `@radix-ui/react-slot`
and `react-navigation-menu` are installed) because they ship inside the APK. The mobile
app has its **own** `globals.css` rather than importing the web one — safe because no calculator
uses a custom class defined there (verified: `styled-table`, `slick-dots`, `animate-blob`,
`animate-fadeInUp`, `animation-delay-2000` → 0 uses).

`@/` maps to `../src`, so mobile-local code uses the **`@mobile/`** alias instead.

Two traps, both of which fail *silently* with a successful build and an unstyled app:
1. Tailwind auto-detects the config from **cwd** (the repo root) → it would load the web config.
   `mobile/postcss.config.mjs` names `mobile/tailwind.config.ts` explicitly.
2. `content` globs resolve against **cwd, not the config file** → they are written repo-root-relative
   and guarded by an `existsSync` throw. `__dirname` is `"."` under Tailwind's TS loader.

**Always sanity-check the stylesheet size, never just the exit code:**
```bash
cat mobile/out/_next/static/css/*.css | wc -c      # ~96 KB healthy; ~10 KB means nothing was scanned
```

## Launcher icon
The icon is **not** produced by Capacitor or `cap sync` — it is the committed resources in
`android/app/src/main/res/`: `mipmap-anydpi-v26/ic_launcher{,_round}.xml` (adaptive: white
background colour, `ic_launcher_foreground`, `ic_launcher_monochrome`) plus per-density PNGs in
`mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}` (×1, 1.5, 2, 3, 4).

Regenerating from the brand mark (done 2026-09-14 with a throwaway Python + Pillow script; there is
no numpy on this machine, so plain PIL pixel loops — ~3 s):
1. Source `public/icons/icon-1.png` (1536×1024, mark ~536 px wide on flat off-white). Un-matte the
   white: per pixel `d = max(255 − r, 255 − g, 255 − b)`, `alpha = clamp((d − 10)/60)`, and recover
   the colour as `255 − (255 − c)/alpha`. Crop to the alpha bbox.
2. **Size by radius, not width**: the book's corners are the farthest points, so scale the mark until
   its farthest opaque pixel is **30 dp** from the centre of the 108 dp foreground canvas (safe circle is
   33 dp). Resize in premultiplied mode (`RGBa`) to avoid dark fringes.
3. `ic_launcher_monochrome.png` = the foreground's alpha on white (the system tints it).
4. Legacy (API 24–25, `minSdk 24`): 48 dp canvas, a white rounded square (radius 9 dp) or circle inset
   2 dp, mark at radius 19 dp (square) / 18 dp (round).
5. Preview under circle, rounded-square and squircle masks before copying into `res/`.

Verify without a release: `cd android && JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew
assembleDebug` (uses the already-synced web assets, so it is safe while peers edit tools), then
`aapt dump badging app/build/outputs/apk/debug/app-debug.apk | grep icon` and unzip `res/mipmap-*`
to look at the packaged PNGs. Phones only see the new icon after the next signed APK.

## Releasing an APK
`npm run mobile:apk` → `scripts/build-apk.sh`: preflights the JDK and `ANDROID_HOME`, warns about a
missing signing key, then runs `mobile:build` → `cap sync` → `gradlew assembleRelease`.

Signing reads `android/keystore.properties` (gitignored; template at
`android/keystore.properties.example`) or `PW_KEYSTORE_*` env vars. Without either, Gradle emits an
**unsigned** APK that phones refuse to install, and the script fails loudly.

**Distribution is in-repo**, chosen deliberately on 2026-09-12: the build script copies the signed
APK to `public/downloads/pharmawallah-calculators.apk`, which is committed and deployed with the
site. `/download` links to it with a `download` attribute, and `next.config.mjs` sets
`application/vnd.android.package-archive` plus `must-revalidate` so a new release is never served
stale from cache.

The trade-off is permanent git growth — ~5 MB per release, unreclaimable without rewriting
history. GitHub Releases is the alternative if the repo gets heavy; the switch is a one-line change
to `APK_URL` in `DownloadClient.tsx`.

Bump `versionCode`/`versionName` in `android/app/build.gradle` and `APP_VERSION` + `APK_SIZE` in
`DownloadClient.tsx` on every release.

**Verify the published file, not just the exit code** (done for v1.1, 2026-09-13):
```bash
BT=$(ls -d ~/Android/Sdk/build-tools/* | sort -V | tail -1)
A=public/downloads/pharmawallah-calculators.apk
$BT/aapt dump badging $A | head -1                  # versionCode / versionName you just set
$BT/apksigner verify --print-certs $A | grep SHA-256 # must equal the previous release's certificate,
git show HEAD:$A > /tmp/old.apk && $BT/apksigner verify --print-certs /tmp/old.apk | grep SHA-256
#   ^ a different certificate means phones refuse to install it as an update
```
**Never build while another session's agents are rewriting tool pages** — `mobile:build` snapshots the
tree, so a half-written page ships (or fails the export). Ask the peers for a safe point first.

## Common Failure Modes
- **A tool imports `@/lib/...`** — the mobile build fails, or worse, succeeds and ships server
  config. Keep calculators self-contained.
- **A tool starts calling `fetch`** — it silently stops working offline. Add it to
  `ONLINE_ONLY_SLUGS` and gate it on `navigator.onLine`, as `cfu-calculator` does.
- **Editing `mobile/app/calculation-tools/<slug>/page.tsx`** — generated; overwritten every build.
  Edit the real tool under `(tools)/`.
- **Forgetting `npm run mobile:sync` after a rebuild** — the APK keeps the previous assets.
- **Building with JDK 17.** Capacitor 8 needs **JDK 21**
  (`sourceCompatibility JavaVersion.VERSION_21` in `@capacitor/android`). With 17 the build runs
  for ~15 minutes and then dies at `:capacitor-android:compileReleaseJavaWithJavac` with
  `invalid source release: 21`. `scripts/build-apk.sh` now checks the major version first and
  auto-selects an installed JDK 21 via `JAVA_HOME`, so 17 can remain the system default.
  `cap add` / `cap sync` need only Node — it is only the Gradle compile that needs Java.
- **Judging the mobile build by its exit code.** Both Tailwind traps above produce a green build
  and a broken-looking app. Check the CSS byte count.
- **Malformed Android resource XML** — Gradle only parses it at
  `:app:mergeReleaseResources`, *after* the whole web build and sync, so it costs minutes to find.
  The classic offender is `--` inside an XML comment, which XML forbids. `scripts/build-apk.sh`
  now validates every `res/**/*.xml` and the manifest up front.
- **A stale APK in `public/downloads/`** next to a fresh `/download` page. The build script copies
  it automatically; do not copy it by hand mid-build or you can capture a partially written file.
- **Shipping an unsigned release APK** — installs fail with no useful message on the phone.
- **Reading `navigator` during render** — pre-rendered HTML has no `navigator`; use the
  `useOnlineStatus` hook, which defaults to `true` and corrects in an effect.

## Do Not
- Do not add `output: "export"` to the root `next.config.mjs`.
- Do not copy calculator source into `mobile/` — re-export it.
- Do not commit `mobile/out`, `mobile/.next`, or the generated route tree.
- Do not add `next-pwa` to the mobile build: the bundle is already local, and a service worker in
  a WebView only adds a stale-cache failure mode.

## Update Project Knowledge
A new mobile-only constraint or trap → `.claude/MEMORY.md` §8. A change to what the app contains →
`CLAUDE.md` §7 and `.claude/ROADMAP.md`.
