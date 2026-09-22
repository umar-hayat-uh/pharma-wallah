# PharmaWallah Calculators — the offline apps (Android + iOS)

An offline-first app containing **every calculator and nothing else**. No courses, no tournament,
no clinical subdomain, no account, no network required. The same web bundle is packaged twice:
as an Android APK and as an iOS app.

```
                         src/app/(site)/calculation-tools/(tools)/<slug>/page.tsx
                                        (the only copy of a calculator)
                                                      │
                                   scripts/generate-mobile-routes.mjs
                                                      ▼
                        mobile/  —  next build (output: "export")  —▶  mobile/out
                                                      │
                          ┌───────────────────────────┴───────────────────────────┐
                    cap sync android                                        cap sync ios
                          ▼                                                       ▼
            android/app/src/main/assets/public                          ios/App/App/public
```

## Why this is a separate Next.js project

The main app has API routes and middleware, so `output: "export"` can never be added to the root
`next.config.mjs` (see `.claude/skills/deployment-and-env/SKILL.md`). This directory is a second
Next.js **project root** that contains only static pages, so it *can* be exported. Capacitor
packages the export and serves it from a local WebView.

The calculators are **not duplicated**. `scripts/generate-mobile-routes.mjs` emits a one-line
re-export page per tool into `mobile/app/calculation-tools/<slug>/`. Editing a calculator updates
the website, the APK and the iOS app together.

This works because every tool is `"use client"` and imports nothing that needs a server. **Keep it
that way**: a tool that imports from `@/lib` or calls an API will break the mobile build or
silently stop working offline.

## Commands (run from the repo root)

```bash
npm run mobile:routes   # regenerate the per-tool route files only
npm run mobile:build    # regenerate routes + next build mobile -> mobile/out
```

| Android | iOS |
| --- | --- |
| `npm run mobile:sync` — build + `cap sync android` | `npm run ios:sync` — build + `cap sync ios` |
| `npm run mobile:open` — Android Studio | `npm run ios:open` — Xcode (**macOS only**) |
| `npm run mobile:apk` — signed release APK (JDK 21) | build and archive from Xcode |

`npm run ios:build` is an alias of `mobile:build`; there is one bundle, not two.

**`cap sync ios` runs fine on Linux.** Capacitor 8 uses Swift Package Manager rather than
CocoaPods, so syncing is pure Node — it copies `mobile/out` and rewrites `Package.swift` and
`capacitor.config.json`. Only *compiling* needs a Mac with Xcode.

## Releasing

### Android APK

#### One-time setup

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

#### Every release

1. Bump the version in **two** places:
   - `android/app/build.gradle` -> `versionCode` (must increase) and `versionName`
   - `src/app/(site)/download/DownloadClient.tsx` -> `APP_VERSION`, and `APK_SIZE` if it changed
2. `npm run mobile:apk` — signs the APK **and copies it to
   `public/downloads/pharmawallah-calculators.apk`**.
3. Commit that file and push; Vercel deploys it with the site and `/download` serves it.

**The cost of this choice:** every released APK stays in git history permanently, about 6–9 MB
each, unreclaimable without rewriting history. GitHub Releases is the alternative — set `APK_URL`
in `DownloadClient.tsx` and stop committing the file.

### iOS

Version and build number live in `ios/App/App.xcodeproj/project.pbxproj` as `MARKETING_VERSION`
and `CURRENT_PROJECT_VERSION`. Bump the build number for every upload. Then:

```bash
npm run ios:sync
npm run ios:open        # macOS
```

**No Mac?** `.github/workflows/ios-app.yml` compiles the app on a GitHub macOS runner — Simulator
and unsigned device slice — with no Apple account and no secrets. Actions tab → "iOS app" → Run
workflow, then download the `.app` artifact. A signed `.ipa` still needs a paid Apple Developer
account.

In Xcode: scheme **App** → set your team under *Signing & Capabilities* (signing is `Automatic`;
no team is committed) → Run on a simulator or device, or *Product ▸ Archive* to submit.

The app icon and launch screen are generated, not hand-drawn:

```bash
node scripts/generate-ios-assets.mjs --fonts <dir containing Outfit-Regular.ttf, Outfit-Bold.ttf>
```

Its outputs are committed, so you only run it when the brand changes. See
`.claude/skills/ios-app-capacitor/SKILL.md` for why the icon is inset to 700/1024 px and why the
splash artwork has to fit a centred 1257 px box.

## What is generated vs. hand-written

| Path | |
| --- | --- |
| `mobile/app/calculation-tools/<slug>/page.tsx` | **Generated**, gitignored. Re-emitted every build. |
| `mobile/app/_generated/tool-slugs.ts` | **Generated**, gitignored. The list of shipped tools. |
| `mobile/app/_data/tool-registry.ts` | Hand-written. Display names + categories for the home screen. |
| `mobile/app/_components/` | Hand-written. App bar, catalogue UI, splash, native tuning. |
| `mobile/out/` | Build output, gitignored. Capacitor's `webDir` for both platforms. |
| `android/`, `ios/` | Committed, except build output and the copied web assets. |
| `ios/App/CapApp-SPM/Package.swift` | **Generated by `cap sync`.** Says "DO NOT MODIFY" and means it. |

## UI

The apps use **shadcn/ui — the website's own primitives**. There is no `mobile/components/`:
`@/*` resolves to `../src/*`, so the app imports `src/components/ui/*`,
`src/components/calculators/*` and `cn()` from `src/lib/utils.ts`. Restyle a primitive once and
the website, the APK and the iOS app all change. Design tokens live in `mobile/app/globals.css`
with `--primary` set to brandBlue.

Because `@/` already points at `../src`, mobile-local imports use **`@mobile/`**.

The home screen has no app bar: `SpaceHero` carries the brand and the search, and `BottomNav`
switches between views held in the URL hash (`""`, `#browse`, `#saved`, `#cat/<id>`) so Android's
back button walks back through them. `useLibrary` keeps Recent and Saved in `localStorage`.

⚠️ **Two Tailwind traps here fail silently** — a green build and an unstyled app. See
`.claude/skills/android-app-capacitor/SKILL.md` § Styling. Quick check after any build:

```bash
cat mobile/out/_next/static/css/*.css | wc -c   # ~85–100 KB healthy; ~10 KB means nothing was scanned
```

## Adding a calculator

Add it to `src/app/(site)/calculation-tools/(tools)/` exactly as before — nothing here needs
touching for it to ship. Run `npm run mobile:sync` (and `npm run ios:sync`) and it appears.

It will land in a **"More Tools"** group on the home screen until you add its slug to a category in
`mobile/app/_data/tool-registry.ts` (and its display name to `TOOL_NAMES`). That fallback is
deliberate: unlike the web hub, where forgetting to register a tool makes it unreachable, a tool
can never go missing from the app.

## Offline behaviour

**Everything is packaged, so every calculator works in airplane mode**, including the two camera
tools — the TLC Rf analyser and the colony counter both process the photo on the device (the
colony counter bundles OpenCV.js and runs it in a Web Worker). `ONLINE_ONLY_SLUGS` in
`tool-registry.ts` is empty; the "Needs internet" badge is kept for a future tool that genuinely
needs a connection.

Three calculators cite a source document on the web — `qt-interval-calculator`,
`reconstitution-calculator` and `renal-dosing-adjuster`. Inside the app those render through
`SourceLink`, which says "opens a web page" and, while the device is offline, stops being a link
and says it needs a connection rather than handing the student to a browser error.

Downloading and printing a lab record are hidden in the apps (a WebView cannot do either
usefully); **Share** takes their place and hands the record card to the iOS/Android share sheet
from a file written to the app's own cache. Nothing is uploaded.

`NEXT_PUBLIC_API_BASE_URL` is still set in `mobile/next.config.mjs` but **nothing reads it** since
the colony counter went on-device.

No secret ever reaches the bundle: `next build mobile` loads env from `mobile/`, not the repo root,
so the root `.env` is not read. Verify after a build with the JWT-shaped pattern — a bare `eyJ`
matches inside OpenCV.js's base64 WASM and gives a false positive:

```bash
grep -rlE 'eyJ[A-Za-z0-9_-]{10,}\.eyJ|supabase\.co|UPSTASH' mobile/out/ | wc -l   # must be 0
```
