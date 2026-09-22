# PharmaWallah for Windows — Tauri 2 desktop target

The third build target in this repo, alongside the website (`src/`) and the
Android app (`mobile/` + `android/`). It packages the pharmacy calculators and
an offline reference library into a single Windows program.

```
                    PharmaWallah
                         │
              ┌──────────┼──────────┐
             Web      Android     Windows
           Next.js   Capacitor    Tauri 2
                                     │
                              OFFLINE ONLY
```

## What it contains

| Section | Route | What it is |
| --- | --- | --- |
| Dashboard | `/` | Counted figures, search, recent calculations |
| Calculators | `/calculation-tools/` | Every tool directory, grouped by the shared registry's categories |
| Values | `/values/` | Searchable molecular weights, atomic weights, densities, E values, constants, conversion factors |
| Formulas | `/formulas/` | Standard formulas with every symbol defined, each linked to its calculator |
| Conversions | `/convert/` | Mass, volume, amount, concentration, length, time, temperature, % ↔ molarity |
| History | `/history/` | Saved calculations, exportable as PDF / CSV / text |
| Settings | `/settings/` | History limit, storage location, privacy statement |

## Commands

```bash
pnpm install          # once — installs @tauri-apps/cli
pnpm desktop:routes   # regenerate the calculator route tree
pnpm desktop:build    # static export → desktop/out
pnpm desktop:audit    # prove the built bundle cannot reach the network
pnpm desktop:icons    # regenerate src-tauri/icons from the PharmaWallah mark
pnpm tauri:dev        # run the app against a live Next dev server (port 3010)
pnpm tauri:build      # routes → export → audit → Windows installer
```

**`tauri:build` must be run on Windows** (or cross-compiled with `cargo-xwin`).
Tauri builds a native binary for the host platform; running it on Linux
produces a Linux AppImage/.deb, not a `.exe`. It also needs a Rust toolchain —
install from <https://rustup.rs> — and, on Windows, the WebView2 runtime, which
Windows 11 and up-to-date Windows 10 already have.

### Where the installer is written

```
src-tauri/target/release/bundle/nsis/PharmaWallah_1.0.0_x64-setup.exe
src-tauri/target/release/bundle/msi/PharmaWallah_1.0.0_x64_en-US.msi
```

and the bare executable at `src-tauri/target/release/PharmaWallah.exe`.

## How it stays offline

* **No API routes, no server.** `output: "export"` emits plain files that Tauri
  serves from inside the executable.
* **No network code.** All 104+ calculators and the shared calculator kit
  contain zero `fetch`, `axios`, `XMLHttpRequest`, `sendBeacon`, `WebSocket` and
  zero remote `<img>` — verified by grep, and re-verified against the built
  bundle by `scripts/audit-desktop-offline.mjs`.
* **Fonts are self-hosted.** `next/font` bakes Outfit into the export.
* **No ads.** `NEXT_PUBLIC_IS_MOBILE_APP=true` makes `AdSlot` render nothing,
  and `NEXT_PUBLIC_ADSENSE_CLIENT` is blanked as a second line of defence.
* **Reference links do not navigate.** Several calculators cite FDA labels and
  journal articles; `DesktopShell` intercepts those clicks, copies the address
  and says so.
* **Minimum Tauri permissions.** `capabilities/default.json` grants
  `core:default` and nothing else — no shell, no filesystem plugin, no network
  plugin, no updater, no dialog plugin. The four Rust commands are application
  commands; each constrains what it may touch.

## How the calculators get here

`scripts/generate-desktop-routes.mjs` emits a one-line re-export page per tool
directory, exactly as the Android build does. **The calculators themselves are
never copied** — all three targets compile the same file in
`src/app/(site)/calculation-tools/(tools)/<slug>/page.tsx`.

Because only the page component is re-exported, nothing in `src/app/(site)/**`
layouts reaches this app. The desktop chrome lives in
`desktop/app/calculation-tools/layout.tsx`.

## How history and export work without touching `src/`

`ToolFrame` reads the calculation out of the rendered DOM (`_lib/snapshot.ts`)
using four anchors the shared kit guarantees: the `h1`, labelled inputs, the
`aria-live` result card and the FormulaNote panel. That is what gives all 104
calculators Save / Print / Export without editing a single one of them.

Storage goes through `_lib/store.ts`, which uses the Rust commands when running
under Tauri and falls back to `localStorage` in a browser — so the whole UI can
be built and verified without a Rust toolchain.

## Traps specific to this project root

* **Tailwind config must be named explicitly** in `postcss.config.mjs`, and
  `content` globs are resolved against the *process cwd* (the repo root), not
  this directory. Both are the Android build's traps (MEMORY gotcha 23), and
  both fail silently as an unstyled app. **Check the CSS size, not the exit
  code** — a healthy stylesheet is ~79 kB, not ~10 kB.
* **The root `tsconfig.json` must keep `"desktop"` and `"src-tauri"` in
  `exclude`**, and `.vercelignore` must list them, or the generated (and
  gitignored) route tree breaks the *website's* Vercel build (MEMORY gotcha 22).
* **Generated routes are gitignored.** Editing
  `desktop/app/calculation-tools/<slug>/page.tsx` does nothing; edit the real
  tool.
