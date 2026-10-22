# Virtual Labs: Pharmaceutical Chemistry on Babylon.js (2026-10-22)

The code in the tree on 2026-10-22 is described here. If this file and the code disagree, the code wins
(CLAUDE.md §3), and this file is corrected in the same change.

## 1. Scope

**One lab moved:** `/virtual-labs/pharmaceutical-chemistry/acid-base-titration` (labId
`acid-base-titration`, the citric-acid assay by NaOH titration). Its room now renders with
`@babylonjs/core` **9.30.0** (exact pin in `package.json`). Simple Syrup, dose–response and clove
microscopy stay on three.js.

**Unchanged:** the experiment engine and science (`src/lib/virtual-labs/**`), instrument controllers,
Learning/Practical modes, the full-screen shell (`LabExperience.tsx`, `interface/*`), progress storage
(`pw-vlabs:v1` and `useTracker` events), equipment ids, colliders, spawn, and every URL.

## 2. Audit findings

**Files before the move:** `Viewport.tsx` → `three/runtime.ts` (`LabRuntime`) →
`three/rooms/chemistry.ts`, built from `three/{kit,glass,instruments,materials,textures}.ts`.

**Experiment:** sample weighed on a 0.1 mg balance, made up in a 100 mL volumetric flask, 20 mL
aliquot pipetted, phenolphthalein added, titrated from a 50 mL burette with 0.1 M NaOH. The room only
draws `titrationVisual(run.s)`. The three.js room's `apply()` returned `false`, so it never animated a
drop or a colour change.

**Shell (from `LabExperience.tsx`):** Learning versus Practical is `run.mode` in the engine. The lab is a
fixed full-viewport layer that locks page scroll. On coarse-pointer devices it requests the Fullscreen API
inside the starting tap, and a refusal is handled. Touch users get `TouchPad`, which feeds
`setMoveInput`, plus drag-to-look and tap-to-select. When the page is hidden, the shell pauses the
viewport and opens the menu.

**Likely causes of mobile lag in the three.js room.** These are hypotheses from reading the code; none was
profiled on a phone.
1. Four `PointLight`s on Medium and High. Every `MeshPhysicalMaterial` fragment evaluates them.
2. `MeshPhysicalMaterial` is used widely: clearcoat on the bench tops, tile and glass. On High the glass
   uses `transmission`, which adds an extra render pass on every drawn frame.
3. Shadows. `mesh()` sets `castShadow = true` by default and the shadow camera covers 14 × 14 m, so
   nearly the whole room is drawn into the map. The map is re-rendered on every frame while
   `animating` is set (`PCFSoftShadowMap` on High).
4. Roughly one draw call per part. Geometry is cached but meshes are not merged. Only the ceiling panels
   and the shelf bottles are instanced, and the clear instanced bottles use the transmission glass on High.

## 3. Architecture

| Module | Role |
|---|---|
| `Viewport.tsx` | `BABYLON_LABS = {"acid-base-titration"}`. For that lab it dynamically imports `babylon/runtime` and `babylon/chemistry`. `?engine=three` uses the original `ROOMS` entry. `?engine=webgl` or `?engine=webgpu` forces Babylon's engine. Both runtimes satisfy `RuntimeLike`. |
| `babylon/runtime.ts` | `BabylonLabRuntime.create()`. Same public API as `LabRuntime`: `setVisual`, `setHighlight`, `setInsets`, `setPaused`, `setMoveInput`, `focusOn`, `exitFocus`, `resetView`, `where`, `moving`, `stats`, `measure`, `dispose`. |
| `babylon/kit.ts` | PBR materials, canvas textures, primitive helpers, room shell and furniture. |
| `babylon/apparatus.ts` | The titration apparatus (§4). |
| `babylon/chemistry.ts` | Room layout, interactives, and the drop, ripple, stream and colour animations. |
| `babylon/types.ts` | `BRoomBuild` and `BInteractive`, mirroring `three/types.ts`, plus `casters`. |
| `quality.ts`, `vessel.ts`, `art/canvas.ts` | Engine-neutral modules extracted today: tiers and pixel budget, lathe profiles with `heightForVolume`, and the 2D canvas artwork. `three/runtime.ts`, `three/glass.ts` and `three/textures.ts` now import or re-export them, so the three.js rooms behave as before. |

- **Engine selection.** WebGL 2 is the baseline, and the code falls back to WebGL 1 if that is all the
  device has. WebGPU is tried only on High or with `?engine=webgpu`, and its engine module is imported
  only when tried. Babylon would fetch its GLSL→WGSL converters (glslang, twgsl) from a CDN. Both are
  handed a promise that never resolves, so nothing is downloaded from a third party. A shader that needs
  them never becomes ready, and after 15 s (`WEBGPU_READY_MS`) the runtime is disposed and the room is
  rebuilt on WebGL. Any WebGPU start-up failure takes the same path.
- **Coordinates.** `scene.useRightHandedSystem = true`, so the room uses the three.js rooms' coordinates
  (x east, y up, z towards the student).
- **Static merge.** After the build, `mergeStatics()` merges static meshes per material: the room's
  meshes into frozen world-space meshes, and each piece of equipment's meshes under that equipment, so it
  still moves, glows and picks as one object. Meshes are skipped if they are tagged `dyn`, have thin
  instances, or are disabled.
- **Thin instances.** `Kit.bottleRow` draws shelf bottles, labels and caps as thin instances, at one
  draw call per part.
- **Shadows.** A single `ShadowGenerator` on the key light uses PCF (medium quality on High, low on
  Balanced, off on Low). The map is `REFRESHRATE_RENDER_ONCE` and is reset only on `setVisual`, not
  during animation frames. Only the opaque meshes of the bench-top apparatus (`room.casters`) cast.
- **HDRI.** The CC0 Poly Haven `small_empty_room_3_1k.hdr` is loaded as an `HDRCubeTexture` (128 px on
  Balanced, 256 px on High; none on Low). If the load fails, the hemispheric light carries the ambient.
- **Quality tiers.** `pixelRatioFor()` is applied as `setHardwareScalingLevel(1/ratio)` and re-applied on
  every `ResizeObserver` callback.
- **On-demand rendering.** `scene.render()` runs only when the view is dirty, moving, animating or being
  measured. `setPaused(true)` stops the render loop.
- **Insets.** Babylon has no `setViewOffset`. `applyView()` builds the projection for the zoomed field of
  view, shifts it in clip space by the panels' imbalance, and freezes it with `freezeProjectionMatrix`.
  Picking and culling use the same matrix.
- **Disposal.** `dispose()` removes listeners, stops the loop, disposes the room, the scene and the
  engine, calls `WEBGL_lose_context`, and removes the canvas.

## 4. Equipment models

All models are procedural and use real dimensions in metres.

| Item | How modelled | Notable detail |
|---|---|---|
| Burette, 50 mL Class A | Open cylinder, rim torus, tapered jet, PTFE stopcock (glass barrel, white plug, blue key) | The 0–50 scale spans 0.60 m and is printed from a 4096 px graduation canvas (2048 px on Low), aligned so the 0 and 50 marks land exactly. The concave meniscus's **lowest point is the reading**, and a dark band sits at it. The key turns while the stopcock is open, and the tip shows a bubble or liquid. |
| Retort stand and clamp | Enamel base, chrome rod, boss head, arm | Fisher-type double clamp with rubber jaw faces. The rod stands behind the flask and the arm reaches forward. |
| Conical flask, 250 mL | Lathe profile: outer, plus inner inset 1.6 mm | The liquid is rebuilt from volume via `heightForVolume`, quantised to 0.01 mL, and its colour eases towards the engine's colour. |
| Volumetric flask, 100 mL | Lathe, PP stopper, enamel print | The **calibration ring sits at `heightForVolume(inner, 100)`**, the height that holds 100 mL in this profile. |
| Bulb pipette, 20 mL | Stem, bulb, colour band, rack | Three-valve rubber filler fitted. |
| Analytical balance (0.1 mg) | Housing, sloped fascia, pan, draught shield | The LCD canvas is redrawn only when the reading changes. Sliding side doors, levelling feet, a bubble level, and an anti-static boat with a sample heap scaled by mass. |
| NaOH 0.1 M | **HDPE** bottle with a ribbed red cap | Alkali etches glass, so volumetric NaOH is kept in polyethylene. The three.js room used a glass reagent bottle. |
| Sample CA-01 | Wide-mouth glass jar of crystals | GHS irritant label. |
| Indicators | Three amber dropper bottles | Phenolphthalein, methyl orange, bromothymol blue. |
| Wash bottle | LDPE, translucent | Bent delivery tube. |
| Beaker, funnel, glass rod, spatula, tile | Lathe and primitives | Beaker graduations come from a canvas. |
| Lab notebook | Clipboard, sheet, pen | Includes a scientific calculator. |
| Glassware cupboard | Glass-fronted cabinet | Shelves stocked with beakers, conical and volumetric flasks, measuring cylinders, burettes, funnels and dropper bottles. |

## 5. Assets and licences

Everything new is procedural geometry or original canvas artwork (`art/canvas.ts`), so it needs no
licence and no download. The only file asset is the existing CC0 HDRI (see `ASSET_LICENSES.md`). The
Babylon room does **not** load the four CC0 floor and wall detail maps that the three.js runtime uses.

<!-- ASSET RESEARCH: filled in by main session -->

## 6. Mobile performance measures

- No point lights. The room uses one hemispheric light, a key light and a fill light; the emissive
  ceiling panels and the environment map supply the rest.
- Glass is alpha-blended PBR with no refraction pass on any tier. `separateCullingPass` is used except
  on Low.
- Clearcoat on the bench tops is High only.
- The shadow map is rendered once per state change, the casters are limited, and there are no shadows
  on Low.
- Static parts are merged per material, and decorative bottles are opaque thin instances.
- WebGL 2 is the default. MSAA is off only on Low with DPR ≥ 2.
- The pixel budget is enforced by hardware scaling. Rendering is on demand, and the loop stops when paused.
- `skipPointerMovePicking`, `blockMaterialDirtyMechanism` during the build, and no Babylon input
  observers (`detachControl`).
- After loading, one 1.5 s measurement is taken. If it shows under 18 fps, `onSlow` is called once,
  exactly as in three.js.

## 7. Measurements

SwiftShader (software WebGL), headless Chrome, Balanced tier unless stated.

| Viewport | Engine | Draw calls | Triangles | Load (ms) | fps |
|---|---|---|---|---|---|
| 1440 × 900 | three.js | <!-- MEASURE --> | <!-- MEASURE --> | <!-- MEASURE --> | <!-- MEASURE --> |
| 1440 × 900 | Babylon (WebGL 2) | <!-- MEASURE --> | <!-- MEASURE --> | <!-- MEASURE --> | <!-- MEASURE --> |
| 390 × 844 | three.js | <!-- MEASURE --> | <!-- MEASURE --> | <!-- MEASURE --> | <!-- MEASURE --> |
| 390 × 844 | Babylon (WebGL 2) | <!-- MEASURE --> | <!-- MEASURE --> | <!-- MEASURE --> | <!-- MEASURE --> |

Software rendering is **not representative** of a phone GPU. Only the relative draw-call and triangle
counts carry over. **No real phone has been tested yet.**

## 8. How to test

```bash
node --test scripts/virtual-labs.test.mts
npx tsc --noEmit
npm run build
```

1. Open `/virtual-labs/pharmaceutical-chemistry/acid-base-titration` to see Babylon (WebGL 2, or
   WebGPU on High).
2. Add `?engine=three` to load the original three.js room for comparison, `?engine=webgpu` to force
   WebGPU (it falls back to WebGL if unavailable), or `?engine=webgl` to force WebGL.
3. Add `?seed=N` to get a reproducible run.
4. Run `await window.__vlab.measure(3000)`, then `window.__vlab.stats()`. On Babylon the result includes
   `engine` (`"webgpu"`, `"webgl2"` or `"webgl1"`). The three.js stats have no `engine` field.

## 9. Rollback

1. **Per visit, instant:** add `?engine=three`.
2. **Permanent:** remove `"acid-base-titration"` from `BABYLON_LABS` in `Viewport.tsx`. The three.js room
   is untouched and still built. Optionally, also run `pnpm remove @babylonjs/core` and delete
   `src/components/virtual-labs/babylon/`. Keep `quality.ts`, `vessel.ts` and `art/`, because the
   three.js modules now import them.
3. **Git:** the pre-migration tree is commit `1ae48d1`.

## 10. Known limitations

<!-- main session: complete this list -->
- Not tested on a real phone, a real GPU or Safari.
- The WebGPU path is unverified on real hardware. Its fallback relies on a readiness timeout of up to
  15 s.
- There are no GLB assets: every model is procedural.
- On Low there is no environment map (three.js used a procedural `RoomEnvironment` there).
- The floor and wall detail maps are not used.
- The glass does not refract on any tier.
- The burette, pipette and stand positions differ slightly from the three.js room, so close-ups that are
  framed from bounding boxes differ slightly too. Ids, colliders and spawn are unchanged.
