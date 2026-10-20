# Removed legacy simulations (2026-10-20)

The `/simulations` hub, its eight labs and `/compounding-lab` were removed and replaced by the
3D **Virtual Labs** at `/virtual-labs`. The scope (remove all of `/simulations/**` and
`/compounding-lab`, keep everything else) was the owner's decision. Nothing was committed; the
changes are in the working tree.

Audience: the project owner and future developers. Everything under "Verification" was actually
run; nothing else is claimed.

## 1. What was removed

### Routes (all under `src/app/(site)/`)

| Path | What it was | Lines | Why removed |
| --- | --- | ---: | --- |
| `simulations/page.tsx` | The "Interactive Simulations" hub listing the eight labs | 193 | Replaced by `/virtual-labs` |
| `simulations/titration/page.tsx` | Acid–base titration theory + 2D titration simulation | 1,569 | Replaced by the 3D acid–base titration assay |
| `simulations/buffer-lab/page.tsx` | Buffer preparation (Henderson–Hasselbalch) lab and quiz | 1,377 | Legacy lab; no direct successor |
| `simulations/dilution-lab/page.tsx` | Route wrapper for the solution dilution lab | 14 | Legacy lab; no direct successor |
| `simulations/disk-diffusion/page.tsx` | Route wrapper for the Kirby–Bauer disk diffusion lab | 15 | Legacy lab; no direct successor |
| `simulations/lab-guide/page.tsx` | "Determination of Bleeding Time" (Duke's method) practical guide | 1,352 | Legacy lab; no direct successor |
| `simulations/organic-id-lab/page.tsx` | Organic compound identification lab | 1,143 | Legacy lab; no direct successor |
| `simulations/staining-lab/page.tsx` | Bacterial staining (simple, Gram, special) lab | 636 | Legacy lab; no direct successor |
| `simulations/uv-lab/page.tsx` | UV-Vis spectrophotometry / Beer–Lambert lab | 1,455 | Legacy lab; no direct successor |
| `compounding-lab/page.tsx` | Route wrapper for the Extemporaneous Compounding Lab | 11 | Replaced by the 3D Simple Syrup lab |

### Components

| Path | What it was | Why removed |
| --- | --- | --- |
| `src/components/ExtemporaneousCompoundingLab.tsx` (2,672 lines) | The compounding formulation library, study cards, quiz and simulation | Only importer was `compounding-lab/page.tsx` |
| `src/components/Simulations/DilutionLab/DilutionLabSim.tsx` (848 lines) | The dilution lab simulation | Only importer was `simulations/dilution-lab/page.tsx` |
| `src/components/Simulations/DiskDiffusion/**` (18 files, 6,374 lines: `DiskDiffusionLab`, `SimulationWorkspace`, `PetriDish`, `MeasurementTool`, `TheorySection`, `LabGuide`, `PreLabCheck`, `ResultsDashboard`, `CompletionScreen`, `stages`, `equipment`, `illustrations`, `engine`, `data`, `report`, `types`, `useLabMachine`, `index`) | The rebuilt (2026-09-20) disk diffusion lab | Only importer was `simulations/disk-diffusion/page.tsx` |

Before deleting, every import in the deleted set was listed. All imports resolved either inside
the deleted set or to shared modules that stay in use elsewhere (`react`, `framer-motion`,
`lucide-react`, `recharts`, `next/*`, `@/lib/seo`, `@/hooks/useTracker`, `jspdf` — still used by
`course/PdfDownloadButton.tsx` and the Battle Royale certificate — and `canvas-confetti` — still
used by `dashboard/DashboardView.tsx`). No package was removed from `package.json`.

No file outside the deleted set imported any of them, except `CommunityPharmacy` (see §5), which
is a sibling directory and does not import them either.

### Assets and data modules

**None removed.** The deleted files reference no file under `public/` (searched for `/images/`,
`/assets/`, `/models/` and any `"/…\.(png|jpg|webp|svg|gif|mp3|wav|mp4|glb|gltf|json|pdf)"`
string — zero hits). Their data (`DiskDiffusion/data.ts`, the compounding formulas) lived inside
the deleted component files. The only API route any of them touched was `/api/progress`, via the
shared `useTracker` hook, which other features still use — so no route was orphaned.

## 2. What replaced them

| Old route | New route |
| --- | --- |
| `/simulations` | `/virtual-labs` (index of the four 3D labs) |
| `/simulations/titration` | `/virtual-labs/pharmaceutical-chemistry/acid-base-titration` |
| every other `/simulations/*` | `/virtual-labs` |
| `/compounding-lab` | `/virtual-labs/pharmaceutics/simple-syrup` |

The Virtual Labs also contain `/virtual-labs/pharmacology/dose-response` and
`/virtual-labs/pharmacognosy/powdered-clove`, which have no legacy predecessor. Buffer
preparation, dilution, disk diffusion, bleeding time, organic identification, staining and UV-Vis
currently have **no equivalent** on the site; their old URLs land on the Virtual Labs index.

## 3. Redirects

Added to `redirects()` in `next.config.mjs`, all `permanent: true` (HTTP 308), specific rules
before the wildcard because Next matches in order. Query strings pass through.

| Source | Destination |
| --- | --- |
| `/simulations` | `/virtual-labs` |
| `/simulations/titration` | `/virtual-labs/pharmaceutical-chemistry/acid-base-titration` |
| `/simulations/:path*` | `/virtual-labs` |
| `/compounding-lab` | `/virtual-labs/pharmaceutics/simple-syrup` |

## 4. References updated

| File | Change |
| --- | --- |
| `src/components/Layout/Header/Navigation/menuData.tsx` | Resources menu: "Lab Simulation" `/simulations` → "Virtual Labs" `/virtual-labs`; "Compounding Lab" removed |
| `src/components/Layout/Header/Navigation/menuMeta.tsx` | Icon/colour/description keys renamed "Lab Simulation" → "Virtual Labs" (description now "Four 3D lab practicals, one experiment each."); "Compounding Lab" entries removed; the now-unused `FlaskConical` import removed |
| `src/components/dashboard/dashboard-data.ts` | Study link "Simulations" `/simulations` "Wet-lab practice" → "Virtual Labs" `/virtual-labs` "3D lab practicals" |
| `src/components/Home/landing/data.ts` | `STATS.simulations: 8` → `STATS.virtualLabs: 4` (a literal, commented to stay in step with `LAB_IDS` in `src/lib/virtual-labs/catalog.ts`, so the home bundle does not import the lab catalogue); pillar "04 Simulations / 8 wet labs" → "Virtual Labs / 4 3D labs", new line naming the four practicals, `href` → `/virtual-labs` |
| `src/components/Home/landing/Hero.tsx` | "{8} wet-lab simulations" → "{4} 3D virtual labs" |
| `src/components/Home/landing/Sections.tsx` | Tape figure "8 Wet labs" → "4 3D virtual labs" |
| `src/components/Home/Features/index.tsx` | Card "LAB SIMULATIONS · 7+ Simulations" → "VIRTUAL LABS · 4 Virtual labs", highlights and link updated. (This component is not currently rendered — CLAUDE.md §7 Technical Debt — but was updated so it is not wrong if it returns.) |
| `src/lib/ai-guide/resources.ts` | AI Guide resource "Lab simulations" `/simulations` → "Virtual Labs" `/virtual-labs`, blurb names the four practicals |
| `src/app/(site)/about-us/page.tsx` | "What we make" card "Simulations" → "Virtual Labs", note and link updated |
| `src/lib/seo.ts` | Removed the per-path metadata for the six `/simulations/*` labs and `/compounding-lab` (the Virtual Labs pages set their own metadata with `pageMeta`) |
| `src/lib/indexing.ts` | Removed the eight noindex rows for `/compounding-lab` and `/simulations/*` (the paths no longer render) |
| `src/app/sitemap.ts` | Removed `/simulations` + 8 labs and `/compounding-lab`; added `/virtual-labs` and the four lab pages |
| `src/generated/lastmod.json` | **Regenerated** with `node scripts/gen-lastmod.mjs` ("294 of 299 paths dated"). The removed paths dropped out. The five `/virtual-labs*` paths have no date yet because their files are uncommitted; re-run the script after the commit. The regeneration also refreshed dates from commits made since the last run (`/about-us`, `/careers`, `/contact`, `/privacy`, `/terms` → 2026-10-17; the four `/osteology-lab*` paths gained dates) — those are true git dates, not edits of mine |
| `scripts/route-inventory.py` | Audit route classifier: prefix `/simulations` "Simulation" → `/virtual-labs` "Virtual lab"; `/compounding-lab` removed from the interactive-tools set |
| `scripts/content-inventory.mjs` | Report text "Simulations, … Compounding Lab" → "Virtual Labs, … Osteology Lab" |
| `next.config.mjs` | The four redirects in §3 |

`src/components/Clinical/ClinicalFooter.tsx` was checked: it links only `/antibiogram-simulator`,
not any removed route, so it was left alone.

### Not changed, on purpose

- Generic wording that stays true — "lab simulations" in `HomeIntro.tsx`, `MegaMenu.tsx`,
  `structured-data.tsx`, `faqs/page.tsx`, `AuthKit.tsx`, and "virtual lab simulations" in the site
  description in `seo.ts`. The Virtual Labs, Pharmacy Counter and Antibiogram Simulator are all
  simulations. `terms/page.tsx` is legal text and was not edited.
- Historical reports in `docs/` (`AUDIT-after-2026-10-13.md`, `ADSENSE_ROUTE_INVENTORY.md`,
  `audit-data/*.json`) and the root `AUDIT.md` — they record what the site was at the time.
- `.claude/` knowledge files and `CLAUDE.md` were **not edited by this change**. At the time of
  writing they referenced the removed routes in `PROJECT_MAP.md`, `ROADMAP.md`, `MEMORY.md`,
  `SKILLS.md`, `redesign-tracker.md`, `skills/lab-simulation/SKILL.md` and `history/2026-09.md`;
  updating them belongs to the knowledge sync of the Virtual Labs work (several were already being
  edited by that session). `skills/lab-simulation/SKILL.md` documents code that no longer exists.

## 5. What was retained, and why

| Kept | Why |
| --- | --- |
| `/pharmacy-counter` and `src/components/Simulations/CommunityPharmacy/**` | A separate product (the Community Pharmacy Simulation Lab), not one of the legacy wet labs. It lives in the same `Simulations/` folder but imports nothing that was deleted; its 47 unit tests still pass |
| `/antibiogram-simulator` (`src/components/AntibiogramSimulator.tsx`) | A case-based stewardship tool, not a wet lab; still linked from the clinical footer |
| `/osteology-lab` | Its own 3D lab, unrelated to the removed pages |
| `/molecular-lab`, `/adr-detective` | Separate tools, out of scope |
| `jspdf`, `canvas-confetti` dependencies | Still imported by other features |

## 6. Verification (actually run, 2026-10-20)

- **Type-check** — `npx tsc --noEmit`: exit 0, no errors printed.
- **Redirects** — against the `next dev` server already running on :3100 (it reloaded the edited
  `next.config.mjs`), `curl -w '%{http_code} %{redirect_url}'`:
  - `/simulations` → `308 /virtual-labs`
  - `/simulations/titration` → `308 /virtual-labs/pharmaceutical-chemistry/acid-base-titration`
  - `/simulations/buffer-lab`, `/dilution-lab`, `/disk-diffusion`, `/lab-guide`,
    `/organic-id-lab`, `/staining-lab`, `/uv-lab` → each `308 /virtual-labs`
  - `/compounding-lab` → `308 /virtual-labs/pharmaceutics/simple-syrup`
  - `/simulations/titration?x=1` → `308 …/acid-base-titration?x=1` (query preserved)
- **Retained pages** — `200` for `/` (first compile ~97 s), `/pharmacy-counter`, `/osteology-lab`,
  `/antibiogram-simulator`, `/molecular-lab`, `/adr-detective`, `/about-us`, `/virtual-labs`,
  `/virtual-labs/pharmaceutical-chemistry/acid-base-titration`,
  `/virtual-labs/pharmaceutics/simple-syrup`, `/sitemap.xml`. `/dashboard` → 307 (sign-in gate,
  expected).
- **Sitemap** — `/sitemap.xml` lists exactly the five `/virtual-labs*` URLs and no
  `/simulations*` or `/compounding-lab` URL.
- **Indexing** — `/virtual-labs` serves `<meta name="robots" content="index, follow">` and a www
  canonical.
- **Links** — the server-rendered home page contains `href="/virtual-labs"` (twice) and no
  `/simulations` or `/compounding-lab` link; `/about-us` links `/virtual-labs`.
- **Unit tests** — `node --test scripts/*.test.mts`: **315 pass, 0 fail** (13 files, including
  the new Virtual Labs suite). The twelve pre-existing suites alone: **276 pass, 0 fail**, equal to
  the CLAUDE.md §9 baseline.

### Not verified

- `npm run build` — not run, because a `next dev` server is running from the repo root and the two
  corrupt each other's `.next` (CLAUDE.md Known Issue 10).
- The header mega menu and mobile drawer were not opened in a browser; the change is a data-table
  edit checked by the type-checker only.
- `npm run mobile:build` / desktop — not run. Neither target referenced any removed file (searched
  `mobile/` and `desktop/`).
- Lint — not configured in this repo.
