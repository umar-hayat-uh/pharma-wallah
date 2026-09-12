# PharmaWallah Calculators — Android app

An offline-first Android app containing **all 89 calculators** and nothing else. No courses, no
tournament, no clinical subdomain, no account, no network required.

## Why this is a separate Next.js project

The main app has API routes and middleware, so `output: "export"` can never be added to
`next.config.mjs` (see `.claude/skills/deployment-and-env/SKILL.md`). This directory is a second
Next.js **project root** that contains only static pages, so it *can* be exported. Capacitor
packages the export into the APK and serves it from a local WebView server.

The calculators are **not duplicated**. `src/app/(site)/calculation-tools/(tools)/<slug>/page.tsx`
remains the single source of truth; `scripts/generate-mobile-routes.mjs` emits a one-line re-export
page per tool into `mobile/app/calculation-tools/<slug>/`. Editing a calculator updates the web
site and the app together.

This works because every one of the 89 tools is `"use client"` and imports nothing but `react`,
`lucide-react`, `recharts` and `framer-motion` — no `@/` imports, no server APIs, no `next/image`.
**Keep it that way**: a tool that imports from `@/lib` or calls an API will break the mobile build
or silently stop working offline.

## Commands (run from the repo root)

```bash
npm run mobile:routes   # regenerate the 89 route files only
npm run mobile:build    # regenerate routes + next build mobile -> mobile/out
npm run mobile:sync     # mobile:build + cap sync android
npm run mobile:open     # open the project in Android Studio
```

```bash
npm run mobile:apk      # full release build -> a signed .apk (needs JDK 21, see below)
```

## Releasing an APK

### One-time setup

1. **Install JDK 21** (the Android SDK is already at `~/Android/Sdk`):
   ```bash
   sudo apt install openjdk-21-jdk
   ```
   **21, not 17.** Capacitor 8 compiles with `sourceCompatibility JavaVersion.VERSION_21`; an
   older JDK fails ~15 minutes into the build at
   `:capacitor-android:compileReleaseJavaWithJavac` with `invalid source release: 21`.
   `npm run mobile:apk` checks the version up front and finds an installed JDK 21 even when it
   is not the system default, so JDK 17 can stay as your default.
2. **Create a signing key.** Back it up somewhere safe — if you lose it you can never publish an
   update that upgrades an existing install:
   ```bash
   keytool -genkey -v -keystore ~/pharmawallah-release.jks \
     -keyalg RSA -keysize 2048 -validity 10000 -alias pharmawallah
   ```
3. **Point the build at it:**
   ```bash
   cp android/keystore.properties.example android/keystore.properties
   # edit it: absolute storeFile path + the two passwords you just chose
   ```
   `android/keystore.properties`, `*.jks` and `*.keystore` are all gitignored. **Never commit
   them.** CI can use `PW_KEYSTORE_FILE` / `PW_KEYSTORE_PASSWORD` / `PW_KEY_ALIAS` /
   `PW_KEY_PASSWORD` instead.

### Every release

1. Bump the version in **two** places:
   - `android/app/build.gradle` -> `versionCode` (must increase) and `versionName`
   - `src/app/(site)/download/DownloadClient.tsx` -> `APP_VERSION`, and `APK_SIZE` if it changed
2. Build:
   ```bash
   npm run mobile:apk
   ```
   This signs the APK **and copies it to `public/downloads/pharmawallah-calculators.apk`**.
3. Commit and deploy:
   ```bash
   git add public/downloads/pharmawallah-calculators.apk
   git commit -m "Release APK v<version>"
   git push
   ```
   Vercel deploys it with the site; `/download` serves it from the same domain.

### How the APK is distributed

It ships **inside the repo**, in `public/downloads/`, and is served straight from the site. The
`/download` page links to `/downloads/pharmawallah-calculators.apk` with a `download` attribute,
and `next.config.mjs` sets the Android package content type plus `must-revalidate` so a new release
is never served from cache.

**The cost of this choice:** every released APK stays in git history permanently, about 5 MB each.
Ten releases is ~50 MB in every clone, and it cannot be reclaimed without rewriting history. The
alternative is GitHub Releases, which keeps binaries out of git entirely — worth reconsidering if
the repo becomes unwieldy. To switch, set `APK_URL` in `DownloadClient.tsx` back to
`https://github.com/<owner>/<repo>/releases/latest/download/pharmawallah-calculators.apk`, drop the
`download` attribute, and stop committing the file.

## What is generated vs. hand-written

| Path | |
| --- | --- |
| `mobile/app/calculation-tools/<slug>/page.tsx` | **Generated**, gitignored. Re-emitted every build. |
| `mobile/app/_generated/tool-slugs.ts` | **Generated**, gitignored. The list of shipped tools. |
| `mobile/app/_data/tool-registry.ts` | Hand-written. Display names + categories for the home screen. |
| `mobile/app/_components/` | Hand-written. App bar and catalogue UI. |
| `mobile/out/` | Build output, gitignored. Capacitor's `webDir`. |
| `android/` | Committed, except build output and the copied web assets. |

## UI

The app's own chrome uses **shadcn/ui** — `mobile/components/ui/` (Card, Button, Input, Badge),
`mobile/components.json`, `mobile/lib/utils.ts`. Tokens live in `mobile/app/globals.css` with
`--primary` set to brandBlue, so shadcn components and the calculators share one accent colour.

Because `@/` already points at `../src`, mobile-local imports use **`@mobile/`**
(e.g. `@mobile/components/ui/card`).

The home screen is a three-column card grid (four on `sm`, six on `lg`). Card labels are shortened
by `toolShortName()` in `_data/tool-registry.ts` — a full name like "Percentage Solution Calculator
(w/v, w/w, v/v)" cannot fit a phone card. Search still matches the full name, and the full name
appears in the app bar once a tool is open.

⚠️ **Two Tailwind traps here fail silently** — a green build and an unstyled app. See
`.claude/skills/android-app-capacitor/SKILL.md` § Styling. Quick check after any build:

```bash
cat mobile/out/_next/static/css/*.css | wc -c   # ~96 KB healthy; ~10 KB means nothing was scanned
```

## Adding a calculator

Add it to `src/app/(site)/calculation-tools/(tools)/` exactly as before — nothing here needs
touching for it to ship. Run `npm run mobile:sync` and it appears in the app.

It will land in a **"More Tools"** group on the home screen until you add its slug to a category in
`mobile/app/_data/tool-registry.ts` (and its display name to `TOOL_NAMES`). That fallback is
deliberate: unlike the web hub, where forgetting to register a tool makes it unreachable, a tool
can never go missing from the app.

## Offline behaviour

Everything is packaged in the APK, so all calculators work in airplane mode. The single exception
is the **CFU Calculator**, whose optional photo-scanning step posts to the Gemini-backed
`/api/scan-colonies` route. It is badged "Needs internet" on the home screen, refuses to scan when
`navigator.onLine` is false with an explanation, and its manual colony-count entry works offline
like every other tool. `NEXT_PUBLIC_API_BASE_URL` (set in `mobile/next.config.mjs`, default
`https://pharmawallah.com`) tells it where that API lives.

No secret ever reaches this bundle: `next build mobile` loads env from `mobile/`, not the repo
root, so the root `.env` is not read. Verify after a build with:

```bash
grep -rl "eyJ\|supabase.co\|UPSTASH" mobile/out/ | wc -l   # must be 0
```
