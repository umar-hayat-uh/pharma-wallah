# Virtual Labs: implementation plan (as executed)

Written 2026-10-20 from the code in the working tree. It records what was planned and what was built, and it is
meant for the project owner, faculty reviewers and future developers. Related documents in this folder:
[ARCHITECTURE](ARCHITECTURE.md) · [EXPERIMENT_CATALOG](EXPERIMENT_CATALOG.md) ·
[CURRICULUM_MAPPING](CURRICULUM_MAPPING.md) · [ASSET_RESEARCH](ASSET_RESEARCH.md) ·
[ASSET_LICENSES](ASSET_LICENSES.md) · REMOVED_LEGACY_SIMULATIONS.md (written separately).

## 1. The brief, in one paragraph

Build exactly four 3D laboratories, each with **one complete experiment**:

| Discipline | Experiment | Route |
| --- | --- | --- |
| Pharmaceutical Chemistry | Assay of citric acid by acid–base titration | `/virtual-labs/pharmaceutical-chemistry/acid-base-titration` |
| Pharmaceutics | Preparation and evaluation of Simple Syrup | `/virtual-labs/pharmaceutics/simple-syrup` |
| Pharmacology | Graded dose–response curve (simulated isolated tissue) | `/virtual-labs/pharmacology/dose-response` |
| Pharmacognosy | Microscopical identification of powdered clove | `/virtual-labs/pharmacognosy/powdered-clove` |

Constraints from the brief:
- use plain three.js;
- keep a typed finite-state experiment engine that is separate from rendering;
- give each lab a curriculum status from the set `proposed` / `source_verified` / `faculty_reviewed` / `published`;
- document every asset licence;
- remove the legacy `/simulations` labs.

## 2. Audit findings (before building)

| Item | Finding | Consequence |
| --- | --- | --- |
| `next` | 14.2.35 installed (App Router) | Pages are server components that render a client lab; `next/dynamic` with `ssr: false` keeps the 3D code out of the first load |
| `react` / `react-dom` | 18.3.1 | The state of a run is managed with `useReducer` over a pure reducer |
| `three` | 0.185.1 installed, already used by the Molecular Lab and the Osteology Lab | No new 3D dependency was needed |
| React Three Fiber (`@react-three/fiber`, drei) | **Not installed and not added** | The project rule in `.claude/skills/osteology-lab/SKILL.md` ("Do Not") says not to add `@react-three/fiber` or any other 3D library, because plain `three` is enough and is already installed. The Virtual Labs follow the same rule. |
| New npm dependencies | **None.** `package.json` and the lockfile are unchanged | Everything is built from `three`, `three/examples/jsm` (`RGBELoader`, `RoomEnvironment`, `RoundedBoxGeometry`), `lucide-react` and Tailwind |
| Legacy labs | `/simulations` (hub + 8 labs) and `/compounding-lab` existed | The owner decided to remove them (§4) |
| 3D assets | No openly licensed burette, analytical balance with a draught shield, organ bath, fume cupboard or eyewash station could be downloaded under an acceptable licence | The rooms, glassware and instruments are original procedural geometry ([ASSET_RESEARCH](ASSET_RESEARCH.md)) |

## 3. Phases and what each delivered

The phase boundaries below are reconstructed from the delivered code. Each phase lists the artefacts that exist in
the tree.

### Phase 1: Research and audit
- **Curriculum verification** against the four University of Karachi (UoK) Pharm-D practical syllabi and the HEC
  Pharm-D curriculum (2025). Result: all four experiments are `source_verified` at UoK, and none is
  `faculty_reviewed`. See [CURRICULUM_MAPPING](CURRICULUM_MAPPING.md).
- **Science-fact verification**: the Ph. Eur. / USP citric acid assay, the USP and BP Syrup monographs, the NBS
  C457 sucrose densities, the citric acid pKa values, the phenolphthalein transition, and the clove powder
  characters. See [EXPERIMENT_CATALOG](EXPERIMENT_CATALOG.md).
- **Asset licence research** across Poly Haven, ambientCG, Sketchfab, Smithsonian, NIH 3D, BlendKit, Wikimedia
  Commons and the Khronos samples. See [ASSET_RESEARCH](ASSET_RESEARCH.md).

### Phase 2: Pure engine and calculations (no React, no DOM, no three.js)
- `src/lib/virtual-labs/engine/types.ts` defines the `ExperimentDefinition<S, A>` contract.
- `src/lib/virtual-labs/engine/machine.ts` holds the generic run reducer: undo, reset, hints, the mistake log,
  assessment locking, submit gating and scoring. It also holds a deterministic `rand(seed, …keys)`.
- `src/lib/virtual-labs/calculations/` holds the science for each lab:
  - `titration.ts`: citric acid charge-balance pH, indicator fractions, assay;
  - `syrup.ts`: the sucrose density table, volume and concentration;
  - `doseResponse.ts`: the Hill equation, its inverse, and a least-squares fit;
  - `microscopy.ts`: optics and the slide generator.

### Phase 3: The four experiment definitions
- `src/lib/virtual-labs/experiments/{titration,syrup,doseResponse,clove}.ts` each hold one complete experiment:
  - equipment, materials and safety;
  - 8–10 steps with hints;
  - the `apply()` state machine with its preconditions and the mistakes it detects;
  - observations, the report, and 7–8 assessment questions;
  - a pure `<lab>Visual(state)` function for the renderer.
- `catalog.ts` (exactly four labs) and `curriculum.ts` (status and quoted sources).
- `assets/manifest.ts` records every asset that was researched, used or rejected.
- `scripts/virtual-labs.test.mts` has **39 tests**:
  - the catalogue;
  - the engine semantics;
  - every formula, with normal, boundary, invalid and unit cases;
  - each experiment driven end to end by a scripted student, once with perfect technique and once with specific
    mistakes whose effect on the result must point the right way.

### Phase 4: 3D runtime, rooms and the lab interface
- `three/runtime.ts` (`LabRuntime`) provides:
  - first-person walking with colliders;
  - picking, hover and close-up focus;
  - guided-camera support;
  - on-demand rendering;
  - three quality tiers;
  - context-loss handling;
  - full disposal on unmount.
- `three/{kit,glass,instruments,materials,textures}.ts` hold the original procedural parts:
  - furniture;
  - lathe-turned glassware built to real dimensions, with volume-true liquid levels;
  - instruments with working parts;
  - canvas-drawn labels and signs in GHS / ISO 7010 style.
- `three/rooms/{chemistry,pharmaceutics,pharmacology,pharmacognosy}.ts` build one room per lab.
- `LabExperience.tsx` runs a lab through four phases: briefing → bench (3D or 2D) → assessment → results.
  - `Viewport.tsx` is the `next/dynamic` target.
  - `benches/*.tsx` are the per-lab control panels. Every 3D action is also a panel control.
  - `interface/*.tsx` holds the HUD, procedure, equipment, notebook, assessment, results and overlays.

### Phase 5: Integration
- The landing page `/virtual-labs` and four route pages, each with page metadata (`pageMeta`) and breadcrumb
  JSON-LD.
- The five `/virtual-labs` URLs in `src/app/sitemap.ts`.
- The header menu entry "Virtual Labs" (`src/components/Layout/Header/Navigation/menuData.tsx`) replaces
  "Lab Simulation" and "Compounding Lab".
- Permanent redirects in `next.config.mjs`:
  - `/simulations` → `/virtual-labs`;
  - `/simulations/titration` → the titration lab;
  - `/simulations/:path*` → `/virtual-labs`;
  - `/compounding-lab` → the syrup lab.
- Progress uses the existing pipeline: localStorage, plus `useTracker` when signed in. No new tables.
- Documentation:
  - this folder;
  - `.claude/skills/virtual-labs/SKILL.md`;
  - REMOVED_LEGACY_SIMULATIONS.md, written by another agent.

## 4. Scope decision (the owner's choice)

| Kept | Removed |
| --- | --- |
| `/pharmacy-counter` (Community Pharmacy Simulation Lab) | The `/simulations` hub |
| `/antibiogram-simulator` | Its eight labs: titration, buffer-lab, dilution-lab, disk-diffusion, uv-lab, staining-lab, organic-id-lab, lab-guide |
| `/molecular-lab` | `/compounding-lab` (`ExtemporaneousCompoundingLab.tsx`) |
| `/osteology-lab` | |

The removal and its redirects are described in REMOVED_LEGACY_SIMULATIONS.md. As of 2026-10-20 the state was:
- the redirects are in `next.config.mjs`;
- `src/app/sitemap.ts` lists the five `/virtual-labs` URLs in place of the legacy paths;
- `src/lib/indexing.ts` no longer lists the legacy paths.

## 5. Explicit non-goals of this release
- **No fifth lab or second experiment.** The test suite fails if `LAB_IDS` grows past four (see
  [ARCHITECTURE §9](ARCHITECTURE.md#9-adding-a-fifth-experiment)).
- **No new database tables.** No server-side marking: these are self-paced practice runs.
- **No claim of faculty review.** No experiment is `faculty_reviewed`, and a test asserts it.
- **No downloaded 3D models.** Only the CC0 textures and HDRI and one CC BY-SA photograph ship
  ([ASSET_LICENSES](ASSET_LICENSES.md)).

## 6. Verification status

| Check | Status |
| --- | --- |
| `node --test scripts/virtual-labs.test.mts` | **39 pass, 0 fail**, run while writing this document (2026-10-20, ~9 s) |
| `npx tsc --noEmit`, `npm run build` | Not run by the documentation author. See the project work log for the implementing session's result |
| Rendering, WebGL, real devices | Not covered by the unit tests, which cover the pure layer only |
| Faculty review of content | **Not done** for any experiment |

## 7. Open items found while documenting
1. The landing page loads its card images from `/images/virtual-labs/<lab-id>.webp`.
   `public/images/virtual-labs/` did not exist in the working tree when this was written.
2. The briefing shows only the first three `principle` paragraphs (`def.principle.slice(0, 3)`). Two things are
   therefore not printed in the briefing:
   - the titration's official-method comparison (Ph. Eur. / USP), which is paragraph 4;
   - the syrup's USP-vs-BP note.

   Code comments refer to a "Theory panel", but no such component exists. On-screen labels ("illustrative limit",
   "simulated observations", "schematic illustration") are shown in the bench panels. See
   [EXPERIMENT_CATALOG §6](EXPERIMENT_CATALOG.md#6-labelling-and-known-presentation-gaps).
3. The landing page's "Credits and sources" list shows only manifest rows with `status: "approved"`. The CC BY-SA
   clove photograph is `needs_review`, so its credit appears only in its caption
   ([ASSET_LICENSES](ASSET_LICENSES.md)).
4. The titration's `bubble` mistake, worth 6 points, and its 0.18 mL titre error cannot be reached in the current
   code. The initial reading is refused while the meniscus is above zero, and the only action that brings it onto
   the scale also expels the bubble. See [EXPERIMENT_CATALOG §1](EXPERIMENT_CATALOG.md#1-assay-of-citric-acid-by-acidbase-titration).
5. Some mistakes are recorded only, with no numerical effect in the model:
   - in the titration: `funnel-left`, `no-tile` and `not-swirled`;
   - in the syrup: `beaker-marks` and `not-mixed-after-qs`;
   - in the clove lab: `dirty-slide` and `not-blotted`.

   Their on-screen consequence text describes a real-world effect that the simulation does not apply to the numbers.
