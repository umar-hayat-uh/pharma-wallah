# Virtual Labs: architecture

Describes the code as it is in the tree on 2026-10-20. If this document and the code disagree, the code wins
(CLAUDE.md §3). Correct this file in the same change.

## 1. Layers

```
┌──────────────────────────────────────────────────────────────────────────┐
│ src/lib/virtual-labs/   PURE: no React, no DOM, no three.js               │
│                                                                          │
│  calculations/*.ts  ── the science (units explicit, pure functions)       │
│        ▲                                                                 │
│  experiments/*.ts   ── ExperimentDefinition<S, A>: steps, apply(),        │
│        ▲               observations, report, questions, <lab>Visual(s)    │
│  engine/machine.ts  ── reduceRun(): undo · reset · hints · mistakes ·     │
│                        answers · submit;  finalReport()                   │
└────────▲─────────────────────────────────────────────────────────────────┘
         │ useReducer(reduceRun)
┌────────┴─────────────────────────────────────────────────────────────────┐
│ LabExperience.tsx  ("use client")                                        │
│   briefing → lab → assessment → results                                   │
│   Bench panel (benches/<Lab>Bench.tsx) dispatches actions                 │
│   visual = <lab>Visual(run.s)  ─────────────────┐                         │
└─────────────────────────────────────────────────┼────────────────────────┘
                                                  ▼ props (visual, highlight, commands)
┌──────────────────────────────────────────────────────────────────────────┐
│ Viewport.tsx   loaded with next/dynamic({ ssr: false })                   │
│   imports ONLY the current lab's room: ROOMS[labId]()                     │
└────────▲─────────────────────────────────────────────────────────────────┘
         │ new LabRuntime(host, buildRoom, options)
┌────────┴─────────────────────────────────────────────────────────────────┐
│ three/runtime.ts  LabRuntime: renderer, lights, environment, walking,     │
│   colliders, picking, focus tweens, on-demand render loop, disposal       │
│        ▲ room.apply(visual) / room.tick(t)                                │
│ three/rooms/<room>.ts  built from kit.ts · glass.ts · instruments.ts ·    │
│                        materials.ts · textures.ts (all procedural)        │
└──────────────────────────────────────────────────────────────────────────┘
```

### What each layer may do

| Layer | May | Must not |
| --- | --- | --- |
| `calculations/*` | Pure maths with units in names and comments | Know about steps, UI or rendering |
| `experiments/*` | Define the state `S`, the actions `A` and `apply()`; derive observations, report and visual | Throw on an out-of-order action. It returns the **same** state object plus feedback |
| `engine/machine.ts` | Wrap any definition with shared behaviour | Contain lab-specific science |
| `LabExperience` and benches | Dispatch actions; render state; track progress | Compute a number the report shows. Every figure comes from the definition |
| `Viewport` / `LabRuntime` / rooms | Draw a **derived** visual object; report hover and select by equipment id | Read or write experiment state |

## 2. Data flow

1. The student acts, either by pressing a bench-panel control or by selecting equipment in the 3D room.
2. `dispatch({ type: "act", action })` calls `reduceRun(def, run, msg)`. It in turn:
   - finds the current step;
   - calls `def.apply(run.s, action)` and gets back `{ state, feedback[] }`;
   - records any `feedback.mistake` **once per mistake id**, tagged with the step id;
   - appends feedback to the log (capped at 200);
   - pushes the previous state onto the undo stack, but only if the state object changed. Rejected actions are not
     undo points. The stack is capped at 60.
3. `LabExperience` derives `visual = <lab>Visual(run.s)`. For the titration lab it also adds `flowing`, set while the
   student holds the "run a stream" button.
4. `Viewport` calls `runtime.setVisual(visual)`, and the runtime calls `room.apply(visual, t)`. The room repositions
   meshes: liquid heights, balance displays, recorder traces, objectives and so on.
   - `apply` returns `true` while something animates (bubbles, stirring). The runtime then calls `room.tick()` each
     frame.
5. Selecting equipment in 3D calls `onSelect(id)`. `LabExperience` then:
   - dispatches `{ type: "inspect", id }`, which every experiment handles;
   - flies the camera to that equipment's close-up pose.

**Visual state is always derived from experiment state.** The `<lab>Visual()` functions live next to the
experiment, in `experiments/*.ts`, and are pure. Rooms never mutate experiment state.

## 3. File map

| Path | Role |
| --- | --- |
| `src/lib/virtual-labs/engine/types.ts` | Shared types: `ExperimentDefinition`, `StepDef`, `Question`, `MistakeDef`, `CurriculumRef`, `LabMeta` |
| `src/lib/virtual-labs/engine/machine.ts` | `createRun`, `reduceRun`, `currentStepId`, `stepsDone`, `finalReport`; helpers `ok/info/warn/refuse/mistake`, `rand`, `round`, `fmt` |
| `src/lib/virtual-labs/catalog.ts` | `LAB_IDS` (exactly 4), `LABS`, `LAB_LIST`, `labByPath()` |
| `src/lib/virtual-labs/curriculum.ts` | `CURRICULUM` with status, summary and quoted sources per lab |
| `src/lib/virtual-labs/labels.ts` | `CURRICULUM_LABEL` / `CURRICULUM_TONE` (no `"use client"`: used by server and client) |
| `src/lib/virtual-labs/progress.ts` | localStorage progress and the quality preference (`"use client"`) |
| `src/lib/virtual-labs/calculations/{titration,syrup,doseResponse,microscopy}.ts` | The science |
| `src/lib/virtual-labs/experiments/{titration,syrup,doseResponse,clove}.ts` | The four definitions and their `<lab>Visual()` |
| `src/lib/virtual-labs/experiments/index.ts` | `EXPERIMENTS: Record<LabId, ExperimentDefinition>` |
| `src/lib/virtual-labs/assets/manifest.ts` | `ASSET_MANIFEST`: every researched asset, used or not |
| `src/components/virtual-labs/LabExperience.tsx` | One lab start to finish; the 2D room fallback (`Room2D`) |
| `src/components/virtual-labs/Viewport.tsx` | The dynamic 3D host and per-lab room loader |
| `src/components/virtual-labs/webgl.ts` | WebGL probe that does not import three.js |
| `src/components/virtual-labs/LabProgressBadge.tsx` | "Completed · Merit (best 82 %)" / "Started" on the landing cards |
| `src/components/virtual-labs/labs/*Lab.tsx` | Short wrappers: `LabExperience` + bench + visual (+ an optional extra tab: Eyepiece for clove, Graph for dose–response) |
| `src/components/virtual-labs/benches/*.tsx` | Per-lab control panels; `instruments2d.tsx` (scale windows and displays drawn from true state, never printing the value); `MicroscopeView.tsx` (eyepiece canvas) |
| `src/components/virtual-labs/interface/*.tsx` | `Briefing`, `LabHUD`, `ProcedurePanel`, `EquipmentPanel`, `ObservationSheet`, `Assessment`, `LabResults`, `Overlays` (dialogs, feedback line, touch pad, control guide), `ui` |
| `src/components/virtual-labs/three/runtime.ts` | `LabRuntime` |
| `src/components/virtual-labs/three/types.ts` | `RoomBuild`, `Interactive`, `Collider`, `Pose`, `BuildContext`, `Quality` |
| `src/components/virtual-labs/three/{kit,glass,instruments,materials,textures}.ts` | Procedural furniture, glassware, instruments, PBR materials and canvas textures |
| `src/components/virtual-labs/three/rooms/{chemistry,pharmaceutics,pharmacology,pharmacognosy,helpers}.ts` | The four rooms and `RoomBuilder` |
| `src/components/virtual-labs/virtual-labs.css` | Namespaced list and print rules (CLAUDE.md §6 rule 14) |
| `src/app/(site)/virtual-labs/**/page.tsx` | Landing page and four server route pages (metadata and breadcrumb JSON-LD) |
| `public/models/virtual-labs/**` | The shipped third-party files ([ASSET_LICENSES](ASSET_LICENSES.md)) |
| `scripts/virtual-labs.test.mts` | 39 unit tests for the pure layer |

## 4. Routes

| URL | File | Client component |
| --- | --- | --- |
| `/virtual-labs` | `src/app/(site)/virtual-labs/page.tsx` | Server page; `LabProgressBadge` is the only client island |
| `/virtual-labs/pharmaceutical-chemistry/acid-base-titration` | `…/pharmaceutical-chemistry/acid-base-titration/page.tsx` | `TitrationLab` |
| `/virtual-labs/pharmaceutics/simple-syrup` | `…/pharmaceutics/simple-syrup/page.tsx` | `SyrupLab` |
| `/virtual-labs/pharmacology/dose-response` | `…/pharmacology/dose-response/page.tsx` | `DoseResponseLab` |
| `/virtual-labs/pharmacognosy/powdered-clove` | `…/pharmacognosy/powdered-clove/page.tsx` | `CloveLab` |

Each lab's `href` must equal `/virtual-labs/<discipline>/<id>`, and a test asserts it. A run's seed comes from
`?seed=N` when that is a positive integer, otherwise it is random (100000–999999). The seed prints on the results
page, so a run can be replayed exactly.

## 5. The run machine and scoring

| Behaviour | Rule (`engine/machine.ts`) |
| --- | --- |
| Undo | Restores the previous bench state. **Mistakes already made stay on the record.** Not available after submission |
| Reset / Retry | A fresh run, with a new seed unless one is given |
| Hints | Revealed one at a time per step, up to that step's hint count. **They cost nothing**; the report counts them |
| Mistakes | Each `MistakeDef` has an id, a weight (points off a 100-point technique score) and a consequence. Each id is scored once however often it is repeated. A refused action can still carry a mistake |
| Assessment | Opens only when `benchComplete(s)` is true. The first answer to each question locks |
| Submit | Refused until the bench is complete and every question is answered. After submission every action is refused |
| Technique | `max(0, 100 − Σ weights)` |
| Overall | `round((technique + assessment %) / 2)` |
| Grade | ≥ 85 Distinction · ≥ 70 Merit · ≥ 50 Pass · otherwise Needs practice |

The results page says "simulated practice, not an assessed university practical".

## 6. Progress tracking (no new tables)

| Where | What | Code |
| --- | --- | --- |
| This device | localStorage key **`pw-vlabs:v1`**, per lab: `startedAt`, `completedAt`, `attempts`, `best { overall, grade, technique, assessment }`. Every access is wrapped in `try/catch`, so blocked storage just means nothing is remembered | `progress.ts` (`markStarted`, `markCompleted`, `useLabProgress`) |
| This device | localStorage key **`pw-vlabs:quality`**: the chosen graphics tier | `progress.ts` (`defaultQuality`, `saveQuality`) |
| Signed-in account | `trackActivity({ type: "virtual-lab", label: "Opened: …", href })` when a lab starts | `LabExperience.start()` via `useTracker` |
| Signed-in account | On submit: `trackQuiz({ quizId: "virtual-lab:<id>", subject, score, total })` (assessment questions only) and `trackActivity({ type: "virtual-lab", label: "Completed: … — <grade> (technique N%)" })` | `LabExperience` submission effect, which runs once per run |

These rows go through the existing `useTracker` → activity-queue → progress pipeline. No Supabase table, column or
migration was added.

## 7. Accessibility

- **Every 3D action is also a panel control.** The Bench tab holds every step's controls. Equipment can be selected
  from the 3D room, the Steps list or the Equipment tab. The whole experiment can be done with a keyboard, a screen
  reader, or without WebGL.
- **2D lab.** `Room2D` lays out the equipment as a grid of buttons ("select to inspect" / "✓ inspected"). It is
  offered:
  - from the briefing ("Use the 2D lab instead");
  - from the pause dialog ("Switch to the 2D lab");
  - automatically when 3D fails.
- **WebGL probe.** `webglAvailable()` tries `webgl2` then `webgl` on a throwaway canvas without importing three.js.
  If both fail:
  - the briefing says so;
  - the 3D button is hidden;
  - the 2D lab becomes the primary action.
- **Failure handling.** Each failure sends the student to `Room2D` with an explanation:
  - a room module that fails to download;
  - a renderer that cannot start;
  - a build error;
  - a lost WebGL context (`webglcontextlost` → `onError`: "interrupted by the device (graphics memory)… Switch to
    Low quality or use the 2D panels").

  If WebGL exists, a "Try 3D again at low quality" button is offered.
- **The canvas** is focusable, with `role="application"` and an `aria-label` that explains the controls and says
  every action is also in the side panels.
  - Keyboard: W A S D or arrows to walk; E or Enter to select the hovered item; Esc to leave a close-up.
- **Instruments in 2D** are SVGs with `role="img"`. The description does not give the reading away, because the
  student must read the scale (`instruments2d.tsx`). The microscope canvas's `aria-label` states the magnification,
  the field of view and the focus state.
- **Live regions.** The feedback line, the HUD objective, the equipment card and assessment explanations use
  `aria-live="polite"`. Dialogs are `role="dialog"` with `aria-modal` and Esc to close.
- **Reduced motion.** With `prefers-reduced-motion: reduce`, camera flights become instant cuts.
- **No timers.** "Nothing in this lab runs on a clock." Simulated waits are buttons.
- **Touch.** On a coarse pointer, free-walk mode shows an on-screen thumb pad.

## 8. Performance design

| Technique | Where |
| --- | --- |
| **three.js is never in a page's first load.** `Viewport` is `next/dynamic(() => import("./Viewport"), { ssr: false })` | `LabExperience.tsx` |
| **Lazy room modules.** `ROOMS[labId]()` dynamically imports only the current room, so one lab never downloads another lab's room | `Viewport.tsx` |
| **On-demand rendering.** The animation loop draws a frame only when one of these is true: the view is marked dirty, the camera is walking or tweening, the room reports an animation, or a measurement is forced. An idle lab draws nothing | `LabRuntime.frame` |
| **Geometry cache.** `cachedGeo(key, make)` shares one geometry per shape key. It is cleared by `disposeKitCache()` | `kit.ts` |
| **Instancing.** These use one `InstancedMesh` per material: the decorative reagent bottles (bodies, caps and labels), the ceiling light panels, and the organ-bath bubbles (animated only while aeration is on) | `kit.ts`, `instruments.ts` |
| **Shared materials.** One material instance per look. Interactive equipment gets per-object clones, so hover glow does not light every bottle | `materials.ts` (`isolateMaterials`) |
| **Disposal.** `dispose()` frees everything: the loop stops, listeners are removed, every geometry, material and texture is disposed, the environment and kit cache are released, `renderer.dispose()` and `forceContextLoss()` run, and the canvas is removed. It runs on unmount and whenever the lab or the quality tier changes | `LabRuntime.dispose` |
| **Clamped motion step.** Walking uses `dt ≤ 0.05 s`. Camera flights use real time (≤ 0.25 s per frame), so a slow device still finishes on schedule | `LabRuntime.frame` |
| **Read-only stats hook.** `window.__vlab.stats()` / `measure(ms)` report draw calls, triangles, geometries, textures, fps and load time, for the performance panel and automated checks | `Viewport.tsx` |

### Quality tiers

| Setting | Low | Medium | High |
| --- | --- | --- | --- |
| Antialiasing | off | on | on |
| Max pixel ratio | 1 | 1.5 | 2 |
| `powerPreference` | default | default | high-performance |
| Shadows | off (no shadow map; `castShadow` cleared on every mesh) | PCF soft, 1024² key-light map | PCF soft, 2048² |
| Ceiling point lights (4) | none | yes | yes |
| Environment lighting | procedural `RoomEnvironment` | Poly Haven HDRI (`small_empty_room_3_1k.hdr`); falls back to `RoomEnvironment` on failure | same as Medium |
| Floor and wall detail maps (CC0 normal and roughness) | not loaded (procedural canvas textures only) | loaded | loaded |
| Texture anisotropy | 1 | up to 4 | up to 8 |
| Glass material | transparent physical with clearcoat (no transmission pass) | same as Low | `MeshPhysicalMaterial` with `transmission` (real refraction, one extra pass) |

**Default tier** (`defaultQuality()`):
- the saved preference, if there is one;
- otherwise **Low** if Save-Data is on, if `navigator.deviceMemory ≤ 4`, or if the window is narrower than 768 px;
- otherwise **Medium**.

Changing the tier in the HUD saves it and rebuilds the runtime.

## 9. Adding a fifth experiment

**This release forbids it.** The test "exactly four labs and exactly four experiment definitions, one per lab" in
`scripts/virtual-labs.test.mts` asserts `LAB_IDS.length === 4`. The brief scoped the release to four complete
experiments and forbade padding the catalogue with unfinished ones. Adding a fifth lab is a scope decision for the
owner. Change the test deliberately, in the same change, and say why.

When that decision is made, these are the touch points:
1. **Science**: add `calculations/<new>.ts` with pure, unit-explicit functions and tests (normal, boundary, invalid,
   units).
2. **Definition**: add `experiments/<new>.ts` implementing `ExperimentDefinition<S, A>`. It must:
   - handle `{ type: "inspect", id }`;
   - return the same state object for a refused action;
   - mark mistakes with `mistake(id, weight, text, consequence)`;
   - export a pure `<new>Visual(s)`.

   The completeness test requires ≥ 5 steps, ≥ 6 questions, ≥ 3 safety points, ≥ 3 principle paragraphs, ≥ 1 hint
   per step, and step `focus` ids that exist in `equipment`.
3. **Register** it:
   - `LAB_IDS`, `LABS` and the curriculum entry (`catalog.ts`, `curriculum.ts`). A `source_verified` status needs at
     least one source;
   - `EXPERIMENTS` (`experiments/index.ts`);
   - the `ROOMS` map in `Viewport.tsx`.
4. **Room**: add `three/rooms/<new>.ts`, built with `RoomBuilder`. Register an `interactive(id, …)` for each piece of
   equipment, using the definition's equipment ids. `apply(visual)` must only read the visual object.
5. **UI**: add `benches/<New>Bench.tsx`. Every action must have a control there. Add `labs/<New>Lab.tsx` and
   `src/app/(site)/virtual-labs/<discipline>/<id>/page.tsx` with `pageMeta` and breadcrumb JSON-LD.
6. **Assets**: record any third-party file in `assets/manifest.ts` and in [ASSET_LICENSES](ASSET_LICENSES.md).
7. **Docs**: update [EXPERIMENT_CATALOG](EXPERIMENT_CATALOG.md), [CURRICULUM_MAPPING](CURRICULUM_MAPPING.md) and the
   `virtual-labs` skill.
