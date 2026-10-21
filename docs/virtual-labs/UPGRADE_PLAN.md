# Virtual Labs — Immersive Upgrade: audit and plan (2026-10-21)

Brief: *"PharmaWallah Virtual Labs — Complete Immersive Upgrade & Implementation Prompt"* (PDF, 13 pages).
**The PDF ends mid-sentence on page 13** ("Do not blindly set device pixel ratio to maximum on every
mobile device. Equally, do…"), inside §10. Everything up to that point is in scope; anything the brief
would have said after it is not known and was not guessed at.

This file records what the audit actually found in the code, why each fault happened, and what was
changed. Status of each item is at the end (§5).

---

## 1. Audit — what existed on 2026-10-20

### Stack (read from `node_modules/*/package.json`)
Next 14.2.35 (App Router), React 18.3.1, TypeScript 5.9.3 strict, Tailwind 3.4.19, `three` 0.185.1.
**No React Three Fiber, no drei, no post-processing library.** The labs use plain three.js by design
(`virtual-labs` skill; the Osteology Lab made the same choice) and this upgrade keeps it — the brief's
"Three.js and React Three Fiber specialist" role does not require adding R3F, and adding it would be a new
dependency for no capability the labs lack.

### Routes and files
| Thing | Where |
|---|---|
| Landing | `src/app/(site)/virtual-labs/page.tsx` |
| Four lab routes | `src/app/(site)/virtual-labs/<discipline>/<experiment>/page.tsx` (server: metadata + JSON-LD) |
| Pure engine | `src/lib/virtual-labs/engine/{types,machine}.ts` — typed `ExperimentDefinition`, `reduceRun` |
| Experiments | `src/lib/virtual-labs/experiments/{titration,syrup,doseResponse,clove}.ts` + `calculations/*.ts` |
| Lab shell | `src/components/virtual-labs/LabExperience.tsx` |
| 3D | `Viewport.tsx` (next/dynamic, ssr:false) → `three/runtime.ts` (`LabRuntime`) → `three/rooms/*.ts` |
| Step-card benches | `benches/{Titration,Syrup,Dose,Clove}Bench.tsx` |
| Panels | `interface/{LabHUD,ProcedurePanel,EquipmentPanel,ObservationSheet,Assessment,LabResults,Overlays,Briefing}.tsx` |
| Tests | `scripts/virtual-labs.test.mts` (42 tests, pure layer only) |
| Assets | `public/models/virtual-labs/**` (4 CC0 maps, 1 CC0 HDRI, 1 CC BY-SA photo), manifest in `assets/manifest.ts` |
| State / data | `useReducer` over `reduceRun`; progress in `localStorage` (`pw-vlabs:v1`) + `useTracker` events. No API route, no table. |

Git: clean at `8439a40` before the work started. Nothing to preserve beyond the committed tree.

### Fault 1 — the experiment could be done entirely from 2D step cards
**Root cause, in the code:** the right-hand "Bench" tab rendered `benches/<Lab>Bench.tsx`, which is a
list of numbered step sections ("1 · Inspect", "4 · Weigh the sample", "8 · Titrate"…), each holding
*every* operation of that stage as a button. `LabExperience` dispatched those buttons straight into the
engine. The 3D room's only role in the experiment was `inspect` (selecting an item) and camera moves. A
student could complete every lab without ever touching the room, and the skill said so as an invariant
("every 3D action is also a bench-panel control").

What was **not** wrong: the engine. Steps were already completed from validated state
(`stepComplete(s)`), not from a step index or button state, and out-of-order actions were already
refused with an explanation. The fault was purely that nothing tied an action to its instrument.

### Fault 2 — blurry on mobile and lower-powered devices
**Root causes, in the code:**
1. `progress.ts defaultQuality()` gave **every screen narrower than 768 px** the Low tier.
2. Low meant `setPixelRatio(min(dpr, 1))` **and `antialias: false`**. On a 3× phone the canvas was drawn
   at a third of its resolution in each direction (a ninth of the pixels) and scaled up, with no
   antialiasing — soft *and* jagged. Medium was capped at 1.5×, so even Medium was soft on 3× phones.
3. The pixel ratio was set once, at construction, and never re-evaluated on rotation or full screen.
4. On phones the room was a 46 vh strip above the panels, so the blurry image was also small.

Not the cause: texture resolution (canvas textures are 512–1024 px, mipmapped, sRGB), colour space
(`SRGBColorSpace` output, sRGB maps), or camera clipping (near 0.02 m, far 60 m).

### Other findings
- **No full screen.** The lab sat inside the site layout (header, footer, margins). No Fullscreen API.
- **Touch:** the walking pad appeared only in the "Walk" navigation mode, at 96 px; drag-to-look existed.
- **No pause on backgrounding**; the render loop kept its `setAnimationLoop` while the tab was hidden
  (on-demand rendering meant it drew nothing, but the loop and its timers ran).
- **Shadows** were re-rendered on every drawn frame, including pure camera moves, which roughly doubles
  draw calls on Medium/High (TESTING.md §6.2).
- **Modes:** "Guided/Walk" were camera modes, not Learning/Practical; hints were free in every case.
- **Keyboard users** could only reach equipment through the side lists; the room had no keyboard picking.

---

## 2. Design decisions

1. **Instrument controllers are part of the experiment definition** (`ControllerDef` in
   `engine/types.ts`): which equipment opens it and which action types it performs. Every action type
   except `inspect` belongs to at least one controller (tested).
2. **The gate is in the engine, not the UI.** `reduceRun` refuses an `act` unless one of the action's
   controllers is the one the student has open (`run.active`, set by an `operate` message when equipment
   is selected). A refused attempt changes nothing, is not counted as an action, and is logged. So "the
   checklist only shows progress derived from validated state" and "bypass attempts fail" are properties
   of the pure layer, proven by `node --test`, not of button visibility.
3. **No step-card bench.** The objectives list (`ProcedurePanel`) reports progress from `stepComplete`
   and holds hints; it has no operation in it. "Show me" only moves the camera.
4. **Learning and Practical share everything** (room, engine, controllers). Learning adds: objective
   text, chevrons over the next instrument, a "Next: open the …" prompt with Show me, the right control
   ringed "next" (`suggest()` per experiment — it never points at a reading's value or at "stop" during a
   titration), how-to lines on each controller, free hints. Practical removes all of that and charges
   hints (3 marks each, capped at 15).
5. **Mode switching:** Practical → Learning any time (bench kept; the run becomes practice and the report
   says so). Learning → Practical only on a fresh bench (otherwise "Restart in Practical"), because guided
   work must not count towards an assessed run.
6. **Full screen:** the lab is a `position: fixed` full-viewport layer (100 dvh with a 100 vh fallback)
   above the site chrome; the page scroll is locked while it is open. The Fullscreen API is requested on
   entry on touch devices (inside the tap) and offered by a button everywhere it is supported; refusal is
   handled (the layer already fills the window). iPhone Safari has no element full screen — the help says so.
7. **Accessibility without a bypass:** the 2D lab (bench plan of buttons) and keyboard picking in the room
   (Q cycles the equipment in view, E uses it) both *select equipment* and open the same controllers.
8. **Mouse-look is drag-to-look**, not pointer lock: pointer lock would hide the cursor needed to click
   equipment and controls. Keyboard walking (WASD/arrows) and collision were already in place.
9. **The burette's "dispensed volume" is drawn, not printed.** Reading the burette is the skill being
   assessed; the controller shows the magnified graduations and a remaining-volume bar. Learning mode adds
   an approximate figure to 0.1 mL (the reading must still be taken to 0.01 mL).
10. **Not done, deliberately:** KTX2/Basis texture compression (the labs ship four 1k WebP maps and one
    HDRI — a transcoder would cost more than it saves); LOD meshes (procedural geometry is already
    low-poly; Low drops shadows, the HDRI and detail maps instead); server-side replay verification of a
    completed run (scores are self-paced practice and are labelled so; recorded as remaining work).

## 3. Graphics plan (§9–§10 of the brief)

| Lever | Low | Balanced (default) | High |
|---|---|---|---|
| Max device-pixel ratio | 1.5 | 2 | 2.5 |
| Drawing-buffer budget | 1.0 MP | 2.4 MP | 4.2 MP |
| Antialiasing (MSAA) | only if DPR < 2 | on | on |
| Shadows | off | 1024², PCF | 2048², PCF soft |
| Environment | procedural room | CC0 HDRI | CC0 HDRI |
| Floor/wall detail maps | off | on | on |
| Anisotropic filtering | 2× | 4× | 8× |
| Glass | standard | standard | physical transmission |

Plus, for every tier: the ratio is recomputed on every resize (rotation, browser bars, full screen);
shadow maps are redrawn only when the bench changes; rendering stays on demand; the loop stops while the
page is hidden; canvas textures get the tier's anisotropy; one automatic step down to Low if the first
1.5 s after loading runs under 18 fps and the student has not chosen a tier (never repeated); the student
can choose any tier in the menu. The camera's projection is offset by the panels' size so the instrument
being operated stays centred in the visible part of the screen above a phone's controller sheet.

## 4. Work plan
1. Engine: `ControllerDef`, `Suggestion`, `LabMode`; `operate`/`mode` messages; the gate; hint cost.
2. Titration as the reference lab (controllers, `suggest`, cupboard + notebook as real equipment).
3. Shell: immersive layer, top bar, controller dock / bottom sheet, objectives, prompts, dialogs,
   full screen, pause on hide, joystick, keyboard picking, insets → view offset.
4. Runtime quality tiers and default.
5. Syrup, dose–response and clove converted the same way (in parallel).
6. Tests: gate/bypass per lab, modes, suggestion validity at every state of every scripted run.
7. Verify in headless Chrome at 1440 × 900 and 390 × 844 (touch), both modes, 2D; build; docs.

## 5. Status
See `docs/virtual-labs/TESTING.md` §7 (2026-10-21) for what was run and what it showed.
