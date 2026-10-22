/**
 * Babylon.js runtime for the Pharmaceutical Chemistry room — the one lab migrated off
 * three.js (2026-10-22, owner's brief; docs/virtual-labs/BABYLON_MIGRATION.md). It has the
 * same public surface as ../three/runtime.ts (LabRuntime), so Viewport, LabExperience, the
 * experiment engine and the automated checks drive either engine identically.
 *
 *  - Engine: WebGL 2 is the baseline (WebGL 1 if that is all there is). WebGPU is tried
 *    only on the High tier, or with `?engine=webgpu`: this room renders on demand with a
 *    few dozen draw calls, so WebGPU's lower CPU cost per draw buys little, while WebGL 2
 *    is the most mature path on phones. Babylon would fetch a GLSL→WGSL converter from its
 *    CDN for any shader without a native WGSL version; that fetch is blocked (the loader
 *    is handed a promise that never resolves), so such a shader never becomes ready, the
 *    readiness timeout fires, and the room is rebuilt on WebGL 2. Nothing is ever loaded
 *    from a third-party CDN.
 *  - Draw calls: every static part of the room is merged per material after the build, and
 *    the static parts of each piece of equipment are merged per material under it — about
 *    one draw call per material instead of one per drawer handle (mergeStatics).
 *  - Rendering is on demand, as before: a frame is drawn only while something moves,
 *    tweens or animates. The shadow map renders once and again only when the bench changes.
 *  - Quality tiers are the shared pixel budgets (../quality.ts) applied through Babylon's
 *    hardware scaling level, re-applied on every resize and rotation.
 *  - First-person walking, picking, close-ups, keyboard picking, insets and the camera-only
 *    `window.__vlab` hooks are ports of the three.js runtime's, behaviour for behaviour.
 *  - dispose() releases the scene, every GPU resource, every listener and the context.
 */
import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { HDRCubeTexture } from "@babylonjs/core/Materials/Textures/hdrCubeTexture";
import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Viewport as BViewport } from "@babylonjs/core/Maths/math.viewport";
import { SceneInstrumentation } from "@babylonjs/core/Instrumentation/sceneInstrumentation";
import "@babylonjs/core/Culling/ray";
// PBR ambient from the HDRI reads texture.sphericalPolynomial, which this side effect installs
import "@babylonjs/core/Materials/Textures/baseTexture.polynomial";
import { pixelRatioFor, QUALITY } from "../quality";
import type { Collider, Insets, Pose, Quality } from "../three/types";
import { Kit, createMats, lin } from "./kit";
import type { BInteractive, BRoomBuild, BRoomBuilder } from "./types";

export type EngineKind = "webgpu" | "webgl2" | "webgl1";
export type EnginePreference = "auto" | "webgl" | "webgpu";

export interface BabylonRuntimeOptions {
  quality: Quality;
  reducedMotion: boolean;
  engine?: EnginePreference;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  onFocusChange?: (id: string | null) => void;
  onError?: (message: string) => void;
  onProgress?: (fraction: number) => void;
  onReady?: () => void;
  onSlow?: () => void;
}

export interface BabylonStats {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  fps: number | null;
  loadMs: number;
  quality: Quality;
  engine: EngineKind;
}

const EYE = 1.62;
const RADIUS = 0.22;
const WALK = 1.6; // m/s
const HDRI = "/models/virtual-labs/environments/hdri/small_empty_room_3_1k.hdr";
/** A WebGPU scene that is not ready by then is rebuilt on WebGL 2 (see the header). */
const WEBGPU_READY_MS = 15000;
/** Generous: a slow phone compiling every shader for the first time. */
const WEBGL_READY_MS = 60000;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

async function createEngine(canvas: HTMLCanvasElement, q: Quality, kind: "webgpu" | "webgl"): Promise<{ engine: AbstractEngine; kind: EngineKind }> {
  const antialias = q !== "low" || (window.devicePixelRatio || 1) < 2;
  const powerPreference = q === "high" ? "high-performance" : "default";
  if (kind === "webgpu") {
    // loaded only when tried, so WebGL users never download the WebGPU engine
    const [{ WebGPUEngine }] = await Promise.all([import("@babylonjs/core/Engines/webgpuEngine"), import("@babylonjs/core/Engines/WebGPU/Extensions/engine.dynamicTexture")]);
    const never = new Promise<never>(() => {});
    const engine = new WebGPUEngine(canvas, { antialias, powerPreference, adaptToDeviceRatio: false, glslangOptions: { glslang: never }, twgslOptions: { twgsl: never as unknown as undefined } });
    await engine.initAsync();
    return { engine, kind: "webgpu" };
  }
  const engine = new Engine(canvas, antialias, { preserveDrawingBuffer: false, stencil: true, powerPreference, premultipliedAlpha: false, audioEngine: false }, false);
  return { engine, kind: engine.webGLVersion >= 2 ? "webgl2" : "webgl1" };
}

export class BabylonLabRuntime {
  /**
   * Build the room. Tries WebGPU first when asked for (High tier or `?engine=webgpu`), and
   * falls back to WebGL if WebGPU is missing, fails to start, or cannot make the room ready.
   */
  static async create(host: HTMLElement, build: BRoomBuilder, opts: BabylonRuntimeOptions): Promise<BabylonLabRuntime> {
    const pref = opts.engine ?? "auto";
    const tryGpu = pref === "webgpu" || (pref === "auto" && opts.quality === "high");
    if (tryGpu && typeof navigator !== "undefined" && "gpu" in navigator) {
      let rt: BabylonLabRuntime | null = null;
      try {
        rt = new BabylonLabRuntime(host, opts);
        await rt.start("webgpu", build, WEBGPU_READY_MS);
        return rt;
      } catch (e) {
        rt?.dispose();
        console.warn("[virtual-labs] WebGPU unavailable for this room, using WebGL.", e instanceof Error ? e.message : e);
      }
    }
    const rt = new BabylonLabRuntime(host, opts);
    try {
      await rt.start("webgl", build, WEBGL_READY_MS);
    } catch (e) {
      rt.dispose();
      throw e;
    }
    return rt;
  }

  private host: HTMLElement;
  private opts: BabylonRuntimeOptions;
  private canvas: HTMLCanvasElement;
  private engine!: AbstractEngine;
  private kind: EngineKind = "webgl2";
  private scene!: Scene;
  private camera!: FreeCamera;
  private room!: BRoomBuild;
  private shadows: ShadowGenerator | null = null;
  private instr: SceneInstrumentation | null = null;
  private disposed = false;
  private started = false;
  private dirty = true;
  private animating = false;
  private byId = new Map<string, BInteractive>();
  private glowMats = new Map<string, PBRMaterial[]>();
  private hovered: string | null = null;
  private highlighted = new Set<string>();
  private keys = new Set<string>();
  private moveInput = { x: 0, z: 0 };
  private yaw = 0;
  private pitch = -0.12;
  private walkPos = new Vector3();
  private focusId: string | null = null;
  private focusTarget = new Vector3();
  private orbit = { yaw: 0, pitch: 0, dist: 0.6 };
  private orbitBase = new Vector3(0, 0, 1);
  private root0 = new Map<string, Vector3>();
  private tween: { from: Vector3; to: Vector3; fromLook: Vector3; toLook: Vector3; t: number; dur: number } | null = null;
  private look = new Vector3();
  private drag: { x: number; y: number; moved: boolean; id: number } | null = null;
  private last = performance.now();
  private elapsed = 0;
  private frameTimes: number[] = [];
  private loadStart = performance.now();
  private loadMs = 0;
  private forceUntil = 0;
  private paused = false;
  private insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
  private cleanups: (() => void)[] = [];
  private markers = new Map<string, Mesh>();
  private markerMat: PBRMaterial | null = null;
  private kit!: Kit;

  private constructor(host: HTMLElement, opts: BabylonRuntimeOptions) {
    this.host = host;
    this.opts = opts;
    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    canvas.style.outline = "none";
    canvas.tabIndex = 0;
    canvas.setAttribute("aria-label", "3D laboratory. Use W A S D or the arrow keys to walk and drag to look around. Press Q to cycle through the equipment in view and E to use the one named.");
    canvas.setAttribute("role", "application");
    host.appendChild(canvas);
    this.canvas = canvas;
  }

  private async start(kind: "webgpu" | "webgl", build: BRoomBuilder, readyTimeout: number) {
    const q = this.opts.quality;
    const made = await createEngine(this.canvas, q, kind);
    if (this.disposed) throw new Error("disposed");
    this.engine = made.engine;
    this.kind = made.kind;
    this.engine.onContextLostObservable.add(() => this.opts.onError?.("The 3D view was interrupted by the device (graphics memory). Switch to Low quality or use the 2D panels."));

    const scene = new Scene(this.engine);
    this.scene = scene;
    scene.useRightHandedSystem = true; // same coordinates as the three.js rooms
    scene.detachControl(); // all input is handled below, as in the three.js runtime
    scene.skipPointerMovePicking = true;
    scene.clearColor = Color4.FromHexString("#eef3f7ff");
    scene.blockMaterialDirtyMechanism = true;
    const ip = scene.imageProcessingConfiguration;
    ip.toneMappingEnabled = true;
    ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    ip.exposure = 1.05;
    ip.contrast = 1.08;

    this.camera = new FreeCamera("eye", new Vector3(0, EYE, 0), scene);
    this.camera.inputs.clear();
    this.camera.minZ = 0.02;
    this.camera.maxZ = 60;
    this.setupLights(q);
    this.opts.onProgress?.(0.15);

    const mats = createMats(scene, q);
    this.kit = new Kit(scene, q, mats);
    try {
      this.room = build({ scene, kit: this.kit, quality: q });
    } catch (e) {
      this.opts.onError?.(`The laboratory could not be built (${e instanceof Error ? e.message : "unknown error"}).`);
      throw e;
    }
    this.mergeStatics();
    for (const it of this.room.interactives) {
      this.byId.set(it.id, it);
      it.node.computeWorldMatrix(true);
      // where it stood when its close-up was framed — focusOn follows it if it has moved.
      // The node's own position, not its bounding box: the box changes when liquids are
      // resized or parts hidden, which is not the equipment moving.
      this.root0.set(it.id, it.node.getAbsolutePosition().clone());
      this.isolate(it);
      for (const m of it.node.getChildMeshes()) {
        m.isPickable = true;
        m.metadata = { ...(m.metadata ?? {}), labId: it.id };
      }
    }
    this.setupShadows(q);
    this.opts.onProgress?.(0.35);
    const envReady = this.setupEnvironment(q);
    scene.blockMaterialDirtyMechanism = false;
    this.resetView(true);

    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.host);
    this.cleanups.push(() => ro.disconnect());
    this.resize();
    this.bindInput(this.canvas);

    await envReady;
    if (this.disposed) throw new Error("disposed");
    // a scene that never becomes ready must fail visibly, not leave a spinner forever
    let timer = 0;
    await Promise.race([scene.whenReadyAsync(), new Promise<never>((_, rej) => (timer = window.setTimeout(() => rej(new Error("scene not ready in time")), readyTimeout)))]).finally(() => window.clearTimeout(timer));
    if (this.disposed) throw new Error("disposed");

    this.instr = new SceneInstrumentation(scene);
    this.instr.captureFrameTime = false;
    this.started = true;
    this.loadMs = Math.round(performance.now() - this.loadStart);
    this.opts.onProgress?.(1);
    this.refreshShadows();
    this.invalidate();
    this.last = performance.now();
    if (!this.paused) this.engine.runRenderLoop(this.frame);
    this.opts.onReady?.();
    // One short measurement after loading; a very slow device is told once, never again.
    if (this.opts.onSlow && q !== "low") {
      window.setTimeout(() => {
        if (this.disposed || this.paused) return;
        void this.measure(1500).then(() => {
          if (!this.disposed && !this.paused && this.frameTimes.length / 1.5 < 18) this.opts.onSlow?.();
        });
      }, 400);
    }
  }

  // ── setup ────────────────────────────────────────────────────────────────

  private key!: DirectionalLight;

  private setupLights(q: Quality) {
    const s = this.scene;
    const hemi = new HemisphericLight("sky", new Vector3(0, 1, 0), s);
    hemi.diffuse = Color3.FromHexString("#f4f8ff");
    hemi.groundColor = Color3.FromHexString("#b9c4cf");
    hemi.specular = Color3.Black();
    // with no environment map (Low) the sky light carries all the ambient
    hemi.intensity = q === "low" ? 0.95 : 0.4;
    const key = new DirectionalLight("key", new Vector3(4, -7, 3).normalize(), s);
    key.position = new Vector3(-4, 7, -3);
    key.diffuse = Color3.FromHexString("#fff6ea");
    key.intensity = 2.6;
    this.key = key;
    const fill = new DirectionalLight("fill", new Vector3(-4, -5, -4).normalize(), s);
    fill.diffuse = Color3.FromHexString("#e3eeff");
    fill.specular = Color3.Black();
    fill.intensity = 0.45;
    // No point lights: the ceiling panels are emissive and the environment map gives the
    // room's soft fill — four point lights on every PBR material were the costliest part
    // of the three.js room's lighting on phones.
  }

  private setupShadows(q: Quality) {
    const size = QUALITY[q].shadow;
    for (const m of this.scene.meshes) m.receiveShadows = true;
    if (!size) return;
    const sg = new ShadowGenerator(size, this.key);
    sg.usePercentageCloserFiltering = true;
    sg.filteringQuality = q === "high" ? ShadowGenerator.QUALITY_MEDIUM : ShadowGenerator.QUALITY_LOW;
    sg.bias = 0.0006;
    sg.normalBias = 0.008;
    sg.getShadowMap()!.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
    // Only the bench-top apparatus casts: the light's frustum is fitted to the casters, so
    // leaving the furniture out keeps the map sharp on glassware. Glass and liquids cast a
    // faint shadow weighted by their alpha (transparencyShadow) — without it a flask's
    // opaque stopper threw a shadow floating on the bench with no flask under it.
    sg.transparencyShadow = true;
    for (const n of this.room.casters) for (const m of n.getChildMeshes()) if (m.material) sg.addShadowCaster(m, false);
    this.shadows = sg;
  }

  private refreshShadows() {
    this.shadows?.getShadowMap()?.resetRefreshCounter();
  }

  private setupEnvironment(q: Quality): Promise<void> {
    if (q === "low") return Promise.resolve();
    return new Promise((resolve) => {
      // the same CC0 Poly Haven HDRI as the three.js rooms; a failed load leaves the sky
      // light in charge rather than stopping the lab
      const env = new HDRCubeTexture(
        HDRI,
        this.scene,
        q === "high" ? 256 : 128,
        false,
        true,
        false,
        false,
        () => {
          this.opts.onProgress?.(0.8);
          resolve();
        },
        () => {
          this.scene.environmentTexture = null;
          resolve();
        },
      );
      this.scene.environmentTexture = env;
      this.scene.environmentIntensity = 0.75;
    });
  }

  /**
   * Merge every static mesh per material: the room's into world-space meshes, each piece of
   * equipment's into meshes parented to it (so it still moves, glows and picks as one).
   * Meshes tagged `dyn`, thin-instanced meshes and disabled meshes are left as they are.
   */
  private mergeStatics() {
    const roots = new Map<number, TransformNode>();
    for (const it of this.room.interactives) roots.set(it.node.uniqueId, it.node);
    const owner = (m: AbstractMesh) => {
      for (let p = m.parent; p; p = p.parent) if (roots.has(p.uniqueId)) return roots.get(p.uniqueId)!;
      return null;
    };
    this.room.root.computeWorldMatrix(true);
    for (const m of this.scene.meshes) m.computeWorldMatrix(true);
    const groups = new Map<string, { owner: TransformNode | null; list: Mesh[] }>();
    for (const m of this.scene.meshes.slice()) {
      if (!(m instanceof Mesh) || !m.material || m.metadata?.dyn || m.hasThinInstances || !m.isEnabled(false) || m.getTotalVertices() === 0) continue;
      let excluded = false;
      for (let p = m.parent; p; p = p.parent) if ((p as TransformNode).metadata?.dyn) excluded = true;
      if (excluded) continue;
      const o = owner(m);
      const key = `${o?.uniqueId ?? "room"}:${m.material.uniqueId}`;
      const g = groups.get(key) ?? { owner: o, list: [] };
      g.list.push(m);
      groups.set(key, g);
    }
    groups.forEach(({ owner: o, list }) => {
      if (list.length < 2) {
        if (!o) list[0].freezeWorldMatrix();
        return;
      }
      const alphaIndex = Math.min(...list.map((m) => m.alphaIndex));
      const merged = Mesh.MergeMeshes(list, true, true);
      if (!merged) return;
      merged.isPickable = false;
      merged.alphaIndex = alphaIndex;
      if (o) merged.setParent(o);
      else {
        merged.freezeWorldMatrix();
        merged.doNotSyncBoundingInfo = true;
      }
    });
  }

  /** Give each piece of equipment its own copies of its opaque materials, so a glow tints only it. */
  private isolate(it: BInteractive) {
    const clones = new Map<number, PBRMaterial>();
    for (const m of it.node.getChildMeshes()) {
      const mat = m.material as PBRMaterial | null;
      if (!mat || mat.alpha < 1 || mat.needAlphaBlending()) continue; // glow on glass reads as coloured glass (gotcha 226)
      let c = clones.get(mat.uniqueId);
      if (!c) {
        c = mat.clone(`${mat.name}:${it.id}`);
        // clone() also clones textures, and a cloned DynamicTexture is a blank canvas that
        // is never uploaded — never "ready", so the whole scene waited forever, and the
        // balance LCD would stop updating. The copy must share the original's textures.
        if (c.albedoTexture !== mat.albedoTexture) {
          c.albedoTexture?.dispose();
          c.albedoTexture = mat.albedoTexture;
        }
        clones.set(mat.uniqueId, c);
      }
      m.material = c;
    }
    this.glowMats.set(it.id, Array.from(clones.values()));
  }

  private resize() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h || !this.engine) return;
    // recomputed on every resize (rotation, browser bars, full screen) so the pixel budget
    // holds for the size the canvas actually is
    this.engine.setHardwareScalingLevel(1 / pixelRatioFor(this.opts.quality, w, h, window.devicePixelRatio || 1));
    this.engine.resize();
    this.applyView();
    this.invalidate();
  }

  /** Screen pixels covered by the lab's panels; the scene is centred in what is still visible. */
  setInsets(i: Insets) {
    this.insets = i;
    this.applyView();
    this.invalidate();
  }

  /**
   * three.js's setViewOffset, done by hand: Babylon has no view offset, so the projection
   * is built for the (zoomed) field of view and then shifted in clip space by the panels'
   * imbalance. Picking and culling use this same frozen matrix, so they stay correct.
   */
  private applyView() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h || !this.camera) return;
    const { top, right, bottom, left } = this.insets;
    const visible = Math.min((w - left - right) / w, (h - top - bottom) / h);
    const zoom = clamp(Math.sqrt(Math.max(0.01, visible)), 0.72, 1);
    const base = ((w < 640 ? 68 : 58) * Math.PI) / 180;
    const cam = this.camera;
    cam.unfreezeProjectionMatrix();
    cam.fov = 2 * Math.atan(Math.tan(base / 2) / zoom);
    const a = Array.from(cam.getProjectionMatrix(true).asArray());
    const dx = -(right - left) / w;
    const dy = (bottom - top) / h;
    for (let r = 0; r < 4; r++) {
      a[r * 4] += dx * a[r * 4 + 3];
      a[r * 4 + 1] += dy * a[r * 4 + 3];
    }
    cam.freezeProjectionMatrix(Matrix.FromArray(a));
  }

  /** Stop the render loop entirely (tab hidden, app backgrounded); resume where it was. */
  setPaused(p: boolean) {
    if (p === this.paused || this.disposed) return;
    this.paused = p;
    this.keys.clear();
    this.moveInput = { x: 0, z: 0 };
    if (!this.started) return;
    if (p) this.engine.stopRenderLoop(this.frame);
    else {
      this.last = performance.now(); // discard the time spent away
      this.engine.runRenderLoop(this.frame);
      this.invalidate();
    }
  }

  // ── input ────────────────────────────────────────────────────────────────

  /** Keyboard picking: Q cycles through the equipment in view, nearest first; E/Enter uses it. */
  private cycleHover() {
    const cam = this.camera.position;
    const vp = this.viewProj();
    const items = Array.from(this.byId.values()).map((it) => {
      const c = this.centre(it);
      const s = Vector3.TransformCoordinates(c, vp);
      return { id: it.id, d: Vector3.Distance(c, cam), inView: Math.abs(s.x) <= 1 && Math.abs(s.y) <= 1 && s.z > -1 && s.z < 1 };
    });
    const pool = items.filter((x) => x.inView && x.d < 7);
    const list = (pool.length ? pool : items).sort((a, b) => a.d - b.d);
    if (!list.length) return;
    const i = list.findIndex((x) => x.id === this.hovered);
    this.setHover(list[(i + 1) % list.length].id);
  }

  private bindInput(canvas: HTMLCanvasElement) {
    const isMoveKey = (k: string) => ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k);
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (isMoveKey(k)) {
        e.preventDefault();
        if (this.focusId) this.exitFocus();
        this.keys.add(k);
        this.invalidate();
      } else if (k === "q") {
        e.preventDefault();
        this.cycleHover();
      } else if (k === "e" || k === "enter") {
        if (this.hovered) this.opts.onSelect?.(this.hovered);
      } else if (k === "escape" && this.focusId) {
        this.exitFocus();
      }
    };
    const up = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());
    const blur = () => this.keys.clear();
    const pd = (e: PointerEvent) => {
      canvas.focus({ preventScroll: true });
      this.drag = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
      canvas.setPointerCapture(e.pointerId);
    };
    const pm = (e: PointerEvent) => {
      if (this.drag && this.drag.id === e.pointerId) {
        const dx = e.clientX - this.drag.x;
        const dy = e.clientY - this.drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) this.drag.moved = true;
        this.drag.x = e.clientX;
        this.drag.y = e.clientY;
        if (this.drag.moved) {
          const s = e.pointerType === "touch" ? 0.006 : 0.0035;
          if (this.focusId) {
            this.orbit.yaw = clamp(this.orbit.yaw - dx * s, -1.1, 1.1);
            this.orbit.pitch = clamp(this.orbit.pitch + dy * s, -0.5, 0.9);
            this.placeOrbit();
          } else {
            this.yaw -= dx * s;
            this.pitch = clamp(this.pitch - dy * s, -1.2, 1.0);
          }
          this.invalidate();
        }
        return;
      }
      if (e.pointerType === "mouse") this.setHover(this.pick(e.clientX, e.clientY));
    };
    const pu = () => {
      if (this.drag && !this.drag.moved) {
        const id = this.pick(this.drag.x, this.drag.y);
        if (id) this.opts.onSelect?.(id);
      }
      this.drag = null;
    };
    const cancel = () => (this.drag = null);
    const wheel = (e: WheelEvent) => {
      if (!this.focusId) return;
      e.preventDefault();
      this.orbit.dist = clamp(this.orbit.dist * (e.deltaY > 0 ? 1.1 : 0.9), 0.18, 2.2);
      this.placeOrbit();
      this.invalidate();
    };
    const leave = () => this.setHover(null);
    canvas.addEventListener("keydown", down);
    canvas.addEventListener("keyup", up);
    canvas.addEventListener("blur", blur);
    canvas.addEventListener("pointerdown", pd);
    canvas.addEventListener("pointermove", pm);
    canvas.addEventListener("pointerup", pu);
    canvas.addEventListener("pointercancel", cancel);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("wheel", wheel, { passive: false });
    this.cleanups.push(() => {
      canvas.removeEventListener("keydown", down);
      canvas.removeEventListener("keyup", up);
      canvas.removeEventListener("blur", blur);
      canvas.removeEventListener("pointerdown", pd);
      canvas.removeEventListener("pointermove", pm);
      canvas.removeEventListener("pointerup", pu);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("wheel", wheel);
    });
  }

  private pick(cx: number, cy: number): string | null {
    if (!this.started) return null;
    const r = this.canvas.getBoundingClientRect();
    const hit = this.scene.pick(cx - r.left, cy - r.top, (m) => m.isPickable && m.isEnabled() && m.isVisible && !!m.metadata?.labId, false, this.camera);
    if (!hit?.hit || !hit.pickedMesh || hit.distance > 8) return null;
    return (hit.pickedMesh.metadata?.labId as string | undefined) ?? null;
  }

  private setHover(id: string | null) {
    if (id === this.hovered) return;
    const prev = this.hovered;
    this.hovered = id;
    if (prev) this.applyGlow(prev);
    if (id) this.applyGlow(id);
    this.canvas.style.cursor = id ? "pointer" : "grab";
    this.opts.onHover?.(id);
    this.invalidate();
  }

  private applyGlow(id: string) {
    // a close-up needs no glow (you are looking at it); hover is a light tint
    const on = id === this.hovered && id !== this.focusId;
    const tint = on ? lin("#1c7bd9").scale(0.22) : Color3.Black();
    for (const m of this.glowMats.get(id) ?? []) m.emissiveColor = tint;
    this.marker(id, this.highlighted.has(id) && id !== this.focusId);
  }

  /** The green chevron over equipment the current step uses — marks it without recolouring it. */
  private marker(id: string, on: boolean) {
    let sp = this.markers.get(id);
    if (!on) {
      sp?.setEnabled(false);
      return;
    }
    if (!this.markerMat) {
      const t = new DynamicTexture("chevron", { width: 128, height: 128 }, this.scene, true);
      const g = t.getContext() as unknown as CanvasRenderingContext2D;
      g.clearRect(0, 0, 128, 128);
      g.fillStyle = "rgba(255,255,255,0.95)";
      g.beginPath();
      g.arc(64, 54, 40, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#21B67A";
      g.beginPath();
      g.arc(64, 54, 32, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(46, 44);
      g.lineTo(82, 44);
      g.lineTo(64, 68);
      g.closePath();
      g.fill();
      t.hasAlpha = true;
      t.update(true, false);
      const mat = new PBRMaterial("chevronMat", this.scene);
      mat.albedoTexture = t;
      mat.unlit = true;
      mat.useAlphaFromAlbedoTexture = true;
      mat.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
      mat.disableDepthWrite = true;
      this.markerMat = mat;
    }
    if (!sp) {
      sp = CreatePlane(`marker-${id}`, { size: 0.06 }, this.scene);
      sp.material = this.markerMat;
      sp.billboardMode = Mesh.BILLBOARDMODE_ALL;
      sp.renderingGroupId = 1; // drawn over the room, like a sprite with depthTest off
      sp.isPickable = false;
      sp.receiveShadows = false;
      this.markers.set(id, sp);
    }
    const it = this.byId.get(id)!;
    const { min, max } = it.node.getHierarchyBoundingVectors(true, (m) => m.isEnabled());
    sp.position.set((min.x + max.x) / 2, max.y + 0.07, (min.z + max.z) / 2);
    sp.setEnabled(true);
  }

  // ── public API (same as three/runtime.ts) ────────────────────────────────

  invalidate() {
    this.dirty = true;
  }

  setVisual(v: unknown) {
    if (!this.room) return;
    if (this.room.apply(v, this.elapsed)) this.animating = true;
    this.refreshShadows();
    this.invalidate();
  }

  setHighlight(ids: string[]) {
    const before = new Set(this.highlighted);
    this.highlighted = new Set(ids.filter((id) => this.byId.has(id)));
    Array.from(new Set(Array.from(before).concat(Array.from(this.highlighted)))).forEach((id) => this.applyGlow(id));
    this.invalidate();
  }

  setMoveInput(x: number, z: number) {
    this.moveInput = { x, z };
    if (x || z) {
      if (this.focusId) this.exitFocus();
      this.invalidate();
    }
  }

  private centre(it: BInteractive) {
    const { min, max } = it.node.getHierarchyBoundingVectors(true, (m) => m.isEnabled());
    return min.add(max).scale(0.5);
  }

  focusOn(id: string) {
    const it = this.byId.get(id);
    if (!it) return;
    const prev = this.focusId;
    this.focusId = id;
    if (prev) this.applyGlow(prev);
    this.applyGlow(id);
    // Close-ups are framed once, at build time; equipment the experiment moves (the tile
    // slid under the flask) is followed by however far it has moved since.
    it.node.computeWorldMatrix(true);
    const here = it.node.getAbsolutePosition();
    const moved = here.subtract(this.root0.get(id) ?? here);
    const pos = new Vector3(...it.focus.pos).add(moved);
    const target = new Vector3(...it.focus.target).add(moved);
    this.focusTarget.copyFrom(target);
    const off = pos.subtract(target);
    this.orbit = { yaw: 0, pitch: 0, dist: off.length() };
    this.orbitBase = off.normalize();
    this.flyTo(pos, target);
    this.opts.onFocusChange?.(id);
  }

  private placeOrbit() {
    const dir = Vector3.TransformNormal(this.orbitBase, Matrix.RotationAxis(Vector3.Up(), this.orbit.yaw));
    const side = Vector3.Cross(Vector3.Up(), dir).normalize();
    const d2 = Vector3.TransformNormal(dir, Matrix.RotationAxis(side, -this.orbit.pitch * 0.6));
    this.camera.position.copyFrom(this.focusTarget.add(d2.scale(this.orbit.dist)));
    this.camera.setTarget(this.focusTarget);
    this.look.copyFrom(this.focusTarget);
  }

  exitFocus() {
    if (!this.focusId) return;
    const prev = this.focusId;
    this.focusId = null;
    this.applyGlow(prev);
    this.flyTo(this.walkPos.clone(), this.walkPos.add(this.dirFromAngles()));
    this.opts.onFocusChange?.(null);
  }

  resetView(instant = false) {
    const sp = this.room.spawn;
    this.walkPos.set(sp.pos[0], EYE, sp.pos[2]);
    const d = new Vector3(sp.target[0] - sp.pos[0], sp.target[1] - EYE, sp.target[2] - sp.pos[2]);
    this.yaw = Math.atan2(-d.x, -d.z);
    this.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    const wasFocus = this.focusId;
    this.focusId = null;
    if (wasFocus) {
      this.applyGlow(wasFocus);
      this.opts.onFocusChange?.(null);
    }
    const look = this.walkPos.add(this.dirFromAngles());
    if (instant || this.opts.reducedMotion) {
      this.camera.position.copyFrom(this.walkPos);
      this.camera.setTarget(look);
      this.look.copyFrom(look);
      this.tween = null;
    } else this.flyTo(this.walkPos.clone(), look);
    this.invalidate();
  }

  private viewProj() {
    return this.camera.getViewMatrix(true).multiply(this.camera.getProjectionMatrix());
  }

  /**
   * Where a piece of equipment is on screen (CSS px, page coordinates) and whether a tap
   * there would actually hit it. Camera geometry only — used by automated checks to tap the
   * real object the way a student would; it exposes no experiment state.
   */
  where(id: string): { x: number; y: number; hit: boolean } | null {
    const it = this.byId.get(id);
    if (!it) return null;
    const { min, max } = it.node.getHierarchyBoundingVectors(true, (m) => m.isEnabled());
    const r = this.canvas.getBoundingClientRect();
    const vp = this.viewProj();
    const view = new BViewport(0, 0, r.width, r.height);
    const toScreen = (p: Vector3) => {
      const s = Vector3.Project(p, Matrix.IdentityReadOnly, vp, view);
      return { x: r.left + s.x, y: r.top + s.y, front: s.z > 0 && s.z < 1 };
    };
    const pts = [min.add(max).scale(0.5)];
    for (const fy of [0.5, 0.15, 0.85, 0.3, 0.7]) for (const fx of [0.5, 0.25, 0.75]) for (const fz of [0.5, 0.25, 0.75]) pts.push(new Vector3(min.x + (max.x - min.x) * fx, min.y + (max.y - min.y) * fy, min.z + (max.z - min.z) * fz));
    for (const p of pts) {
      const s = toScreen(p);
      if (s.front && s.x >= r.left && s.x <= r.right && s.y >= r.top && s.y <= r.bottom && this.pick(s.x, s.y) === id) return { x: s.x, y: s.y, hit: true };
    }
    const c = toScreen(pts[0]);
    return { x: c.x, y: c.y, hit: false };
  }

  /** True while the camera is flying (a close-up or its return). Camera state only. */
  moving() {
    return this.tween !== null;
  }

  stats(): BabylonStats {
    const ft = this.frameTimes;
    const fps = ft.length >= 10 ? Math.round(1000 / (ft.reduce((a, b) => a + b, 0) / ft.length)) : null;
    return {
      drawCalls: this.instr?.drawCallsCounter.current ?? 0,
      triangles: this.scene ? Math.round(this.scene.getActiveIndices() / 3) : 0,
      geometries: this.scene?.geometries.length ?? 0,
      textures: this.scene?.textures.length ?? 0,
      fps,
      loadMs: this.loadMs,
      quality: this.opts.quality,
      engine: this.kind,
    };
  }

  /** Render continuously for `ms` and report the measured frame rate (used by the perf panel). */
  measure(ms = 3000): Promise<BabylonStats> {
    this.frameTimes = [];
    this.forceUntil = performance.now() + ms;
    return new Promise((res) => setTimeout(() => res(this.stats()), ms + 50));
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.cleanups.forEach((f) => f());
    this.cleanups = [];
    if (this.engine) {
      this.engine.stopRenderLoop();
      this.room?.dispose?.();
      this.scene?.dispose(); // meshes, materials, textures, lights, shadow maps, environment
      // hand the WebGL context back now rather than whenever the browser collects it
      const gl = (this.engine as unknown as { _gl?: WebGLRenderingContext | null })._gl;
      this.engine.dispose();
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    }
    this.canvas.remove();
  }

  // ── frame ────────────────────────────────────────────────────────────────

  private dirFromAngles() {
    return new Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch));
  }

  private flyTo(pos: Vector3, look: Vector3) {
    if (this.opts.reducedMotion) {
      this.camera.position.copyFrom(pos);
      this.camera.setTarget(look);
      this.look.copyFrom(look);
      this.tween = null;
      this.invalidate();
      return;
    }
    this.tween = { from: this.camera.position.clone(), to: pos, fromLook: this.look.clone(), toLook: look, t: 0, dur: 0.75 };
    this.invalidate();
  }

  private collides(x: number, z: number, cs: Collider[]) {
    for (const c of cs) if (x > c.minX - RADIUS && x < c.maxX + RADIUS && z > c.minZ - RADIUS && z < c.maxZ + RADIUS) return true;
    return false;
  }

  private frame = () => {
    const now = performance.now();
    const rawDt = (now - this.last) / 1000;
    this.last = now;
    const dt = Math.min(0.05, rawDt); // motion uses a clamped step; the fps figure uses the real one
    this.elapsed += dt;
    let moving = false;

    const k = this.keys;
    const fwd = (k.has("w") || k.has("arrowup") ? 1 : 0) - (k.has("s") || k.has("arrowdown") ? 1 : 0) - this.moveInput.z;
    const strafe = (k.has("d") ? 1 : 0) - (k.has("a") ? 1 : 0) + this.moveInput.x;
    const turn = (k.has("arrowleft") ? 1 : 0) - (k.has("arrowright") ? 1 : 0);
    if (!this.focusId && (fwd || strafe || turn)) {
      moving = true;
      this.yaw += turn * dt * 1.6;
      const f = new Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const rgt = new Vector3(-f.z, 0, f.x);
      const step = f.scale(fwd).add(rgt.scale(strafe));
      if (step.lengthSquared() > 1) step.normalize();
      step.scaleInPlace(WALK * dt);
      const b = this.room.bounds;
      const nx = clamp(this.walkPos.x + step.x, b.minX, b.maxX);
      if (!this.collides(nx, this.walkPos.z, this.room.colliders)) this.walkPos.x = nx;
      const nz = clamp(this.walkPos.z + step.z, b.minZ, b.maxZ);
      if (!this.collides(this.walkPos.x, nz, this.room.colliders)) this.walkPos.z = nz;
      this.tween = null;
    }

    if (this.tween) {
      const tw = this.tween;
      // real time, so a slow device finishes the flight on schedule (just in fewer frames)
      tw.t = Math.min(1, tw.t + Math.min(rawDt, 0.25) / tw.dur);
      const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
      this.camera.position.copyFrom(Vector3.Lerp(tw.from, tw.to, e));
      this.look.copyFrom(Vector3.Lerp(tw.fromLook, tw.toLook, e));
      this.camera.setTarget(this.look);
      if (tw.t >= 1) this.tween = null;
      moving = true;
    } else if (!this.focusId) {
      this.camera.position.copyFrom(this.walkPos);
      this.look.copyFrom(this.walkPos.add(this.dirFromAngles()));
      this.camera.setTarget(this.look);
    }

    if (this.animating && this.room.tick) {
      this.animating = this.room.tick(this.elapsed, dt);
      moving = true;
    }
    const forced = now < this.forceUntil;
    if (this.dirty || moving || forced) {
      this.scene.render();
      this.dirty = false;
      if (moving || forced) {
        this.frameTimes.push(rawDt * 1000);
        if (this.frameTimes.length > 120) this.frameTimes.shift();
      }
    }
  };
}

export type { Pose };
