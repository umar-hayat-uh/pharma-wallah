# iOS App (Capacitor)

## Purpose
Build, change and ship the offline **iOS** app — the same calculators-only static export the
Android APK wraps, packaged by Capacitor into an Xcode project.

## Trigger Examples
- "add an iOS app" / "why is there an `ios/` directory?"
- "the app icon is still Capacitor's" / "the splash screen is wrong on iPhone"
- "the numeric keypad can't be dismissed"
- "does the calculator work in airplane mode on an iPhone?"
- "get this ready for the App Store"

## Read First
- `.claude/skills/android-app-capacitor/SKILL.md` — **most of the architecture is shared and is
  explained there.** This skill only covers what differs on iOS.
- `mobile/README.md` — the operational guide for both apps.
- `capacitor.config.ts` (the `ios` block), `ios/App/App/Info.plist`.

## Architecture Context

### iOS adds a platform, not a project
There is still exactly one web bundle. `mobile/` is the second Next.js project root,
`npm run mobile:build` exports it to `mobile/out`, and **both** `cap sync android` and
`cap sync ios` copy that same directory into their native project. A calculator fixed once is
fixed on the website, in the APK and in the iOS app.

```
src/app/(site)/calculation-tools/(tools)/<slug>/page.tsx   ← the only copy
        │  scripts/generate-mobile-routes.mjs
        ▼
mobile/  ──  next build (output: "export")  ──▶  mobile/out
                                                    │
                                   ┌────────────────┴────────────────┐
                            cap sync android                   cap sync ios
                                   ▼                                 ▼
                    android/app/src/main/assets/public      ios/App/App/public
```

### Swift Package Manager, not CocoaPods
Capacitor 8 scaffolds iOS with the **SPM** template (`ios-spm-template.tar.gz` in
`@capacitor/cli/assets`), so `ios/App/CapApp-SPM/Package.swift` is the dependency manifest and
**CocoaPods is not used or needed**. Two consequences worth knowing:

- `npx cap add ios` and `npx cap sync ios` run **on Linux**. They are pure Node: they extract a
  template and rewrite `Package.swift` and `capacitor.config.json`. That is how this target was
  created and is maintained on the project's Linux machine.
- `Package.swift` says `DO NOT MODIFY` and means it — `cap sync` regenerates it from the installed
  `@capacitor/*` plugins. Add a plugin with the package manager, never by hand.

**Everything after `cap sync` needs macOS.** Compiling, the Simulator, a device build, an archive
and any upload to App Store Connect all require Xcode. No machine on this project has it — but
`.github/workflows/ios-app.yml` rents one from GitHub and compiles there, with no Apple account and
no secrets (see "Build it without a Mac"). What still needs real hardware or a paid account is
anything a compile cannot show: a running app, a signature, TestFlight, the App Store.

### What is committed
`ios/` is committed the same way `android/` is. `ios/.gitignore` (written by the template) excludes
the parts that are regenerated: `App/App/public` (the copied web bundle), `App/App/capacitor.config.json`,
`config.xml`, `App/build`, `DerivedData` and `xcuserdata`. Twenty files are tracked; the web bundle
is not one of them.

### The three brand surfaces must stay the same blue
Startup crosses three owners, and any mismatch reads as a flash:

| Order | Surface | Where the colour is set |
| --- | --- | --- |
| 1 | Native launch screen | `ios/App/App/Assets.xcassets/Splash.imageset/*.png` (flat `#1C7BD9`) |
| 2 | WKWebView background | `capacitor.config.ts` → `ios.backgroundColor` |
| 3 | Web splash | `.pw-splash` in `mobile/app/globals.css` → `hsl(var(--primary))` |

`scripts/generate-ios-assets.mjs` hard-codes the same `#1C7BD9` and says so. Change one, change all
three.

### Safe areas are the web layer's job, not WKWebView's
`mobile/app/layout.tsx` sets `viewportFit: "cover"`, and `MobileShell`, `ToolHub`, `SpaceHero` and
`BottomNav` all pad with `env(safe-area-inset-*)`. So `capacitor.config.ts` sets
**`ios.contentInset: "never"`** — the default (`"automatic"`) makes WKWebView add its own inset on
top of the CSS one and every gap doubles.

### The keyboard needs help on iOS and only on iOS
Every calculator input is `type="number" inputMode="decimal"` (`NumberField`), which on iOS is the
12-key pad — **and that pad has no return key**. Without Capacitor's accessory bar a student cannot
put the keyboard away except by finding a gap in a dense form.
`mobile/app/_components/NativeShell.tsx` turns the bar on, and re-centres a focused field that ends
up under the keyboard. It checks `Capacitor.getPlatform() === "ios"` first, so **Android behaviour
is unchanged** (`setAccessoryBarVisible` is an iOS-only API anyway).

### Sharing replaces Download/Print
On the website `LabActions` offers Copy / Download card / Print. Inside a packaged app a blob
download does nothing (`MEMORY.md` gotcha 40) and there is no print dialog, so those two are hidden
behind `IS_MOBILE_APP`. Since 2026-09-22 the apps get a **Share** button instead: the lab-record
card is drawn to a canvas, written to `Directory.Cache` with `@capacitor/filesystem` and handed to
the platform share sheet with `@capacitor/share` (`src/components/calculators/native-share.ts`).
Nothing is uploaded; the file exists only on the device until the student picks a target.

## Procedure

### Regenerate the icon and launch screen
```bash
node scripts/generate-ios-assets.mjs --fonts <dir with Outfit-Regular.ttf and Outfit-Bold.ttf>
```
Writes `AppIcon-512@2x.png` (1024², opaque white ground — **an alpha channel is rejected at App
Store upload**) and the three `splash-2732x2732*.png`. The outputs are committed; you only re-run
this when the brand changes. Without the fonts it silently falls back to a system sans and says so
in its output — read the first line.

Two constants in that script carry the reasoning and should not be nudged without redoing the
maths:
- the icon's mark is fitted to **700 of 1024 px** so the system squircle cannot clip it;
- the splash's artwork must fit a **centred 1257 px box**, because `LaunchScreen.storyboard` uses
  `scaleAspectFill` on a square image and a 19.5:9 iPhone shows only the middle ~46% of its width
  (and the same fraction of its height in landscape).

### Build and open
```bash
npm run ios:build   # routes + static export -> mobile/out   (identical to mobile:build)
npm run ios:sync    # ios:build + cap sync ios
npm run ios:open    # cap open ios   — macOS only
```
Then in Xcode: select the **App** scheme, pick a simulator or a connected iPhone, set your team
under *Signing & Capabilities* (signing is `Automatic` and no team is committed), and Run.

### Build it without a Mac (CI)
`.github/workflows/ios-app.yml`, `macos-latest`, **no Apple account and no secrets**: `pnpm ios:sync`,
then `xcodebuild` for the Simulator (Debug) and for the arm64 device slice (Release, unsigned), with
the `.app` uploaded as an artifact you can drag onto a Simulator. Two product guards run *before*
the compile — `Info.plist` must request no permissions, and at least 100 calculator pages must be in
the synced bundle. Triggered by `workflow_dispatch` or an `ios-v*` tag only: macOS runners are free
on a public repository and bill at **10x** on a private one, so it must never run on an ordinary push.

This is the cheapest answer to "does it compile?" and should be run before anyone books time on a
Mac. It cannot answer anything that needs a signature or a running app.

**Validate a change to that workflow locally** rather than on a billed runner: load it with PyYAML,
write each `run` block to a file, `bash -n` it, and execute the pure-check steps directly.

### Release settings
Version and build number live in `ios/App/App.xcodeproj/project.pbxproj` as `MARKETING_VERSION`
and `CURRENT_PROJECT_VERSION` (Info.plist only references them). Bump `CURRENT_PROJECT_VERSION` for
every upload; bump `MARKETING_VERSION` for every release. The bundle identifier is
`com.pharmawallah.calculators`, the same as Android's application id — that is fine and normal,
they are separate namespaces.

## Files Usually Involved
- `capacitor.config.ts` (`ios` block, `server.iosScheme`, `plugins.Keyboard`)
- `ios/App/App/Info.plist`, `ios/App/App.xcodeproj/project.pbxproj`
- `ios/App/App/Assets.xcassets/{AppIcon.appiconset,Splash.imageset}/`
- `scripts/generate-ios-assets.mjs`
- `mobile/app/_components/NativeShell.tsx`, `mobile/app/layout.tsx`
- `src/components/calculators/{native-share.ts,LabReport.tsx,SourceLink.tsx}`

## Security / privacy checks
- [ ] **No permission is requested.** `ios/App/App/Info.plist` must contain **zero**
      `*UsageDescription` keys. Verify:
      `python3 -c "import plistlib;print([k for k in plistlib.load(open('ios/App/App/Info.plist','rb')) if 'UsageDescription' in k])"`
      → `[]`. The two camera tools use `<input type="file" accept="image/*" capture>`, which needs
      no declared permission on either platform.
- [ ] **`ITSAppUsesNonExemptEncryption` is `false`** — true for this app, and it stops App Store
      Connect asking on every upload. Do not set it true without a real reason.
- [ ] **No secret in the bundle.** Same check as Android, run against `ios/App/App/public`.
- [ ] **No analytics, no tracking.** The app ships none; `AdSlot` returns `null` under
      `IS_MOBILE_APP`. Keep the App Store privacy answers honest — "Data Not Collected".

## Validation
Everything below runs on Linux. It validates the *bundle and the configuration*, which is all that
can be validated without a Mac.

```bash
npm run ios:sync
find ios/App/App/public/calculation-tools -name index.html | wc -l   # tools + hub
python3 -c "import plistlib;plistlib.load(open('ios/App/App/Info.plist','rb'))"   # plist parses
python3 -c "import json;json.load(open('ios/App/App/capacitor.config.json'))"     # sync output
grep -c 'capacitor-swift-pm' ios/App/CapApp-SPM/Package.swift                     # SPM wired
```

**Airplane-mode proof** is the Android skill's CDP technique run against `mobile/out` — the bundle
is byte-identical, so it proves the same thing for iOS. The one thing it does *not* prove is
WKWebView-specific behaviour (the share sheet, the accessory bar, `capacitor://localhost` as a
secure origin). Those need a device.

## Common Failure Modes
- **Expecting `cap sync ios` to need a Mac.** It does not; only Xcode does. Do not skip the sync
  step on Linux "because it's iOS" — the bundle it copies is the whole app.
- **Hand-editing `ios/App/CapApp-SPM/Package.swift`.** Regenerated by `cap sync`.
- **Committing an icon with an alpha channel.** The build succeeds and the App Store upload fails
  much later. `generate-ios-assets.mjs` flattens deliberately.
- **Putting splash artwork near the edges.** It is a square scaled with `scaleAspectFill`; the
  edges are not on screen. See the 1257 px box above.
- **Changing `server.iosScheme`.** The origin is what `localStorage` is keyed to, so changing it
  silently empties every student's Recent and Saved list.
- **Setting `ios.contentInset` back to `"automatic"`.** Doubles every safe-area gap.
- **`xcodebuild -scheme App` failing with "does not contain a scheme named App".** Capacitor's
  template ships no *shared* scheme; Xcode writes one into gitignored `xcuserdata` the first time a
  human opens the project, so it works on a laptop and fails in CI. The fix is committed
  (`App.xcodeproj/xcshareddata/xcschemes/App.xcscheme`) — if it ever goes missing, regenerate it
  with the App target's `PBXNativeTarget` id as `BlueprintIdentifier`.
- **Assuming the App Store label is `appName`.** `capacitor.config.ts` `appName` set the *Android*
  launcher label at `cap add` time. iOS reads `CFBundleDisplayName`, which is deliberately the
  shorter `PharmaWallah` because the home screen truncates at ~12 characters.

## Do Not
- Do not add a second Capacitor version, and do not downgrade: `@capacitor/{core,cli,ios,android}`
  must stay in lockstep (8.5.2 as of 2026-09-22).
- Do not point `server.url` at pharmawallah.com. The app is offline by design; a remote URL would
  make it a web view of the site and break every airplane-mode claim.
- Do not add `@capacitor/splash-screen`. The launch screen is a storyboard plus the web
  `StartupSplash`; a plugin would add a third thing to keep the same colour.
- Do not let a calculator start calling `fetch`. See the Android skill's Common Failure Modes.

## Update Project Knowledge
A new iOS-only constraint or trap → `.claude/MEMORY.md` §8. A change to what the app contains or to
its release state → `CLAUDE.md` §7 and `.claude/ROADMAP.md`.
