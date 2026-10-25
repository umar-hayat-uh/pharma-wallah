/**
 * The shared 3D runtime for all four rooms — plain three.js (already a dependency; the
 * project deliberately does not add React Three Fiber, see the osteology-lab skill).
 *
 *  - First-person walking: WASD / arrow keys (when the scene has focus), drag to look,
 *    an on-screen pad on touch screens; a circle-vs-box collision world with sliding,
 *    so the camera never passes through benches or walls.
 *  - Picking: hover highlights interactive equipment, click/tap/E selects it, and the
 *    camera flies to a close-up pose where dragging orbits and the wheel dollies.
 *  - Rendering is on demand: a frame is drawn only while something moves, tweens or
 *    animates, which keeps an idle lab from draining a phone battery.
 *  - Quality tiers trade a drawing-buffer PIXEL BUDGET, shadows, antialiasing and the
 *    HDRI. Until 2026-10-21 phones got pixel ratio 1 with no antialiasing, which drew a
 *    3× screen at a ninth of its resolution — the "blurry on mobile" fault. Now each tier
 *    takes the device's own ratio up to a cap and a megapixel budget (QUALITY below).
 *  - Shadow maps are redrawn only when the bench changes, not on every camera move.
 *  - Everything it creates is disposed on unmount, including the WebGL context.
 */
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createMaterials, isolateMaterials, setGlow, type MaterialLib } from "./materials";
import { disposeKitCache } from "./kit";
import type { BuildContext, Collider, Insets, Interactive, Pose, Quality, RoomBuild } from "./types";
import { QUALITY, pixelRatioFor } from "../quality";

// re-exported: the tiers moved to an engine-neutral module so the Babylon.js room can share them
export { QUALITY, pixelRatioFor };

export interface RuntimeOptions {
  quality: Quality;
  /** The experiment the room is set up for. */
  experiment?: string;
  reducedMotion: boolean;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  onFocusChange?: (id: string | null) => void;
  onError?: (message: string) => void;
  onProgress?: (fraction: number) => void;
  onReady?: () => void;
  /** Called once if the first measured frames are very slow (LabExperience may step down). */
  onSlow?: () => void;
}

export interface RuntimeStats {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  fps: number | null;
  loadMs: number;
  quality: Quality;
}

const EYE = 1.62;
const RADIUS = 0.22;
const WALK = 1.6; // m/s
const HOVER = 0x1c7bd9;

export const ASSETS = {
  hdri: "/models/virtual-labs/environments/hdri/small_empty_room_3_1k.hdr",
  floorNormal: "/models/virtual-labs/environments/textures/interior_tiles_nor_gl_1k.webp",
  floorRough: "/models/virtual-labs/environments/textures/interior_tiles_rough_1k.webp",
  wallNormal: "/models/virtual-labs/environments/textures/beige_wall_001_nor_gl_1k.webp",
  wallRough: "/models/virtual-labs/environments/textures/beige_wall_001_rough_1k.webp",
};

export class LabRuntime {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private room!: RoomBuild;
  private mats!: MaterialLib;
  private host: HTMLElement;
  private opts: RuntimeOptions;
  private disposed = false;
  private dirty = true;
  private animating = false;
  private visual: unknown = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private pickables: THREE.Object3D[] = [];
  private byId = new Map<string, Interactive>();
  private hovered: string | null = null;
  private highlighted = new Set<string>();
  private keys = new Set<string>();
  private moveInput = new THREE.Vector2();
  private yaw = 0;
  private pitch = -0.12;
  private walkPos = new THREE.Vector3();
  private focusId: string | null = null;
  private focusTarget = new THREE.Vector3();
  private orbit = { yaw: 0, pitch: 0, dist: 0.6 };
  private tween: { from: THREE.Vector3; to: THREE.Vector3; fromLook: THREE.Vector3; toLook: THREE.Vector3; t: number; dur: number; done?: () => void } | null = null;
  private look = new THREE.Vector3();
  private drag: { x: number; y: number; moved: boolean; id: number } | null = null;
  private clock = new THREE.Clock();
  private frameTimes: number[] = [];
  private loadStart = performance.now();
  private loadMs = 0;
  private cleanups: (() => void)[] = [];

  constructor(host: HTMLElement, build: (m: MaterialLib, ctx: BuildContext) => RoomBuild, opts: RuntimeOptions) {
    this.host = host;
    this.opts = opts;
    const q = opts.quality;
    const dpr = window.devicePixelRatio || 1;
    this.renderer = new THREE.WebGLRenderer({ antialias: q !== "low" || dpr < 2, powerPreference: q === "high" ? "high-performance" : "default", preserveDrawingBuffer: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = QUALITY[q].shadow > 0;
    this.renderer.shadowMap.type = q === "high" ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    // the room is static between actions: redraw shadows only when the bench changes
    this.renderer.shadowMap.autoUpdate = false;
    const canvas = this.renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    canvas.style.outline = "none";
    canvas.tabIndex = 0;
    canvas.setAttribute("aria-label", "3D laboratory. Use W A S D or the arrow keys to walk and drag to look around. Press Q to cycle through the equipment in view and E to use the one named.");
    canvas.setAttribute("role", "application");
    host.appendChild(canvas);

    this.camera = new THREE.PerspectiveCamera(58, 1, 0.02, 60);
    this.scene.background = new THREE.Color(0xeef3f7);
    this.setupLights(q);

    const anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), QUALITY[q].anisotropy);
    const loader = new THREE.TextureLoader();
    const pending: Promise<void>[] = [];
    const ctx: BuildContext = {
      quality: q,
      experiment: this.opts.experiment ?? "",
      anisotropy,
      texture: (url, o) => {
        const t = loader.load(url, () => this.invalidate(), undefined, () => this.invalidate());
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        if (o?.repeat) t.repeat.set(o.repeat[0], o.repeat[1]);
        if (o?.srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = anisotropy;
        return t;
      },
    };

    this.mats = createMaterials(q);
    // CC0 Poly Haven detail maps (docs/virtual-labs/ASSET_LICENSES.md) — normal + roughness
    // only; the colour stays the lab's own pale vinyl so the room reads as a laboratory.
    if (q !== "low") {
      const fn = ctx.texture(ASSETS.floorNormal, { repeat: [6, 5] })!;
      const fr = ctx.texture(ASSETS.floorRough, { repeat: [6, 5] })!;
      for (const t of [fn, fr]) {
        t.rotation = Math.PI / 4;
        t.center.set(0.5, 0.5);
      }
      this.mats.floor.normalMap = fn;
      this.mats.floor.normalScale.set(0.6, 0.6);
      this.mats.floor.roughnessMap = fr;
      this.mats.wall.normalMap = ctx.texture(ASSETS.wallNormal, { repeat: [4, 2] });
      this.mats.wall.normalScale.set(0.35, 0.35);
      this.mats.wall.roughnessMap = ctx.texture(ASSETS.wallRough, { repeat: [4, 2] });
    }

    try {
      this.room = build(this.mats, ctx);
    } catch (e) {
      opts.onError?.(`The laboratory could not be built (${e instanceof Error ? e.message : "unknown error"}).`);
      throw e;
    }
    this.scene.add(this.room.root);
    this.room.root.updateMatrixWorld(true);
    for (const it of this.room.interactives) {
      // where it stood when its close-up was framed — focusOn re-frames it if it has moved
      this.root0.set(it.id, new THREE.Box3().setFromObject(it.object).getCenter(new THREE.Vector3()));
      isolateMaterials(it.object);
      it.object.traverse((o) => (o.userData.labId = it.id));
      this.pickables.push(it.object);
      this.byId.set(it.id, it);
    }
    this.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !QUALITY[q].shadow) (o as THREE.Mesh).castShadow = false;
    });

    pending.push(this.setupEnvironment(q));
    opts.onProgress?.(0.4);
    this.resetView(true);

    const ro = new ResizeObserver(() => this.resize());
    ro.observe(host);
    this.cleanups.push(() => ro.disconnect());
    this.resize();
    this.bindInput(canvas);

    canvas.addEventListener("webglcontextlost", this.onContextLost);
    this.cleanups.push(() => canvas.removeEventListener("webglcontextlost", this.onContextLost));

    // canvas textures (labels, scales, displays) honour the tier's filtering too
    this.scene.traverse((o) => {
      const mats = (o as THREE.Mesh).material;
      for (const mat of mats ? (Array.isArray(mats) ? mats : [mats]) : []) {
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.anisotropy = Math.max(v.anisotropy, anisotropy);
      }
    });

    Promise.allSettled(pending).then(() => {
      if (this.disposed) return;
      this.loadMs = Math.round(performance.now() - this.loadStart);
      opts.onProgress?.(1);
      this.shadowsDirty = true;
      this.invalidate();
      opts.onReady?.();
      // One short measurement after loading; a very slow device is told once, never again.
      if (opts.onSlow && q !== "low") {
        window.setTimeout(() => {
          if (this.disposed || this.paused) return;
          // frames actually drawn in the window — a device too slow to draw ten of them
          // reports no fps from stats(), and must count as slow, not as unknown
          void this.measure(1500).then(() => {
            if (!this.disposed && !this.paused && this.frameTimes.length / 1.5 < 18) opts.onSlow?.();
          });
        }, 400);
      }
    });
    this.renderer.setAnimationLoop(this.frame);
  }

  // ── setup ────────────────────────────────────────────────────────────────

  private setupLights(q: Quality) {
    this.scene.add(new THREE.HemisphereLight(0xf4f8ff, 0xb9c4cf, 0.38));
    const key = new THREE.DirectionalLight(0xfff6ea, 2.1);
    key.position.set(-4, 7, -3);
    key.castShadow = QUALITY[q].shadow > 0;
    key.shadow.mapSize.set(QUALITY[q].shadow || 512, QUALITY[q].shadow || 512);
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.camera.far = 20;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 3;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xe3eeff, 0.35);
    fill.position.set(4, 5, 4);
    this.scene.add(fill);
    // pools of light under the ceiling panels (no shadows — cheap), medium/high only
    if (q !== "low") {
      for (const [x, z] of [[-2.2, -1.2], [2.2, -1.2], [-2.2, 1.6], [2.2, 1.6]]) {
        const p = new THREE.PointLight(0xfff4e6, 5.5, 7, 2);
        p.position.set(x, 2.75, z);
        this.scene.add(p);
      }
    }
  }

  private async setupEnvironment(q: Quality) {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const useRoom = () => {
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      this.scene.environment = env;
      this.scene.environmentIntensity = 0.75;
    };
    if (q === "low") {
      useRoom();
      pmrem.dispose();
      return;
    }
    try {
      const hdr = await new RGBELoader().loadAsync(ASSETS.hdri, (e) => {
        if (e.total) this.opts.onProgress?.(0.4 + 0.55 * (e.loaded / e.total));
      });
      if (this.disposed) return;
      const env = pmrem.fromEquirectangular(hdr).texture;
      hdr.dispose();
      this.scene.environment = env;
      this.scene.environmentIntensity = 0.65;
    } catch {
      useRoom(); // the HDRI is an enhancement; a procedural environment is the fallback
    } finally {
      pmrem.dispose();
    }
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.opts.onError?.("The 3D view was interrupted by the device (graphics memory). Switch to Low quality or use the 2D panels.");
  };

  private resize() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h) return;
    // the ratio is recomputed on every resize (rotation, browser bars, full screen) so the
    // budget holds for the size the canvas actually is
    this.renderer.setPixelRatio(pixelRatioFor(this.opts.quality, w, h, window.devicePixelRatio || 1));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w < 640 ? 68 : 58;
    this.applyView();
    this.invalidate();
  }

  private insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

  /**
   * Panels cover part of the canvas (the controller sheet on a phone covers about half).
   * Shift the projection so the scene — and a close-up's instrument — is centred in what
   * is still visible, and widen the view a little when the visible part is small.
   * Picking stays correct because the raycaster uses the same projection matrix.
   */
  setInsets(i: Insets) {
    this.insets = i;
    this.applyView();
    this.invalidate();
  }

  private applyView() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h) return;
    const { top, right, bottom, left } = this.insets;
    const ox = (right - left) / 2;
    const oy = (bottom - top) / 2;
    if (ox || oy) this.camera.setViewOffset(w, h, ox, oy, w, h);
    else this.camera.clearViewOffset();
    const visible = Math.min((w - left - right) / w, (h - top - bottom) / h);
    this.camera.zoom = THREE.MathUtils.clamp(Math.sqrt(Math.max(0.01, visible)), 0.72, 1);
    this.camera.updateProjectionMatrix();
  }

  private paused = false;

  /** Stop the render loop entirely (tab hidden, app backgrounded); resume where it was. */
  setPaused(p: boolean) {
    if (p === this.paused || this.disposed) return;
    this.paused = p;
    this.keys.clear();
    this.moveInput.set(0, 0);
    if (p) this.renderer.setAnimationLoop(null);
    else {
      this.clock.getDelta(); // discard the time spent away
      this.renderer.setAnimationLoop(this.frame);
      this.invalidate();
    }
  }

  private shadowsDirty = true;

  /**
   * Keyboard picking: Q cycles through the equipment in view, nearest first, and E/Enter
   * uses it — so the room itself is operable without a pointer.
   */
  private cycleHover() {
    const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse));
    const cam = this.camera.position;
    const items = Array.from(this.byId.values()).map((it) => {
      const c = new THREE.Box3().setFromObject(it.object).getCenter(new THREE.Vector3());
      return { id: it.id, d: c.distanceTo(cam), inView: frustum.containsPoint(c) };
    });
    const pool = items.filter((x) => x.inView && x.d < 7);
    const list = (pool.length ? pool : items).sort((a, b) => a.d - b.d);
    if (!list.length) return;
    const i = list.findIndex((x) => x.id === this.hovered);
    this.setHover(list[(i + 1) % list.length].id);
  }

  // ── input ────────────────────────────────────────────────────────────────

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
    canvas.addEventListener("keydown", down);
    canvas.addEventListener("keyup", up);
    canvas.addEventListener("blur", blur);

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
            this.orbit.yaw -= dx * s;
            this.orbit.pitch = THREE.MathUtils.clamp(this.orbit.pitch + dy * s, -0.5, 0.9);
            this.orbit.yaw = THREE.MathUtils.clamp(this.orbit.yaw, -1.1, 1.1);
            this.placeOrbit();
          } else {
            this.yaw -= dx * s;
            this.pitch = THREE.MathUtils.clamp(this.pitch - dy * s, -1.2, 1.0);
          }
          this.invalidate();
        }
        return;
      }
      if (e.pointerType === "mouse") this.hoverAt(e.clientX, e.clientY);
    };
    const pu = (e: PointerEvent) => {
      if (this.drag && !this.drag.moved) {
        const id = this.pick(e.clientX, e.clientY);
        if (id) this.opts.onSelect?.(id);
      }
      this.drag = null;
    };
    const wheel = (e: WheelEvent) => {
      if (!this.focusId) return;
      e.preventDefault();
      this.orbit.dist = THREE.MathUtils.clamp(this.orbit.dist * (e.deltaY > 0 ? 1.1 : 0.9), 0.18, 2.2);
      this.placeOrbit();
      this.invalidate();
    };
    const leave = () => this.setHover(null);
    canvas.addEventListener("pointerdown", pd);
    canvas.addEventListener("pointermove", pm);
    canvas.addEventListener("pointerup", pu);
    canvas.addEventListener("pointercancel", () => (this.drag = null));
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("wheel", wheel, { passive: false });
    this.cleanups.push(() => {
      canvas.removeEventListener("keydown", down);
      canvas.removeEventListener("keyup", up);
      canvas.removeEventListener("blur", blur);
      canvas.removeEventListener("pointerdown", pd);
      canvas.removeEventListener("pointermove", pm);
      canvas.removeEventListener("pointerup", pu);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("wheel", wheel);
    });
  }

  private pick(cx: number, cy: number): string | null {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.raycaster.far = 8;
    const hit = this.raycaster.intersectObjects(this.pickables, true)[0];
    return (hit?.object.userData.labId as string | undefined) ?? null;
  }

  private hoverAt(cx: number, cy: number) {
    this.setHover(this.pick(cx, cy));
  }

  private setHover(id: string | null) {
    if (id === this.hovered) return;
    const prev = this.hovered;
    this.hovered = id;
    if (prev) this.applyGlow(prev);
    if (id) this.applyGlow(id);
    this.renderer.domElement.style.cursor = id ? "pointer" : "grab";
    this.opts.onHover?.(id);
    this.invalidate();
  }

  private applyGlow(id: string) {
    const it = this.byId.get(id);
    if (!it) return;
    // a close-up needs no glow (you are looking at it); hover is a light tint, the step's
    // equipment a faint one — enough to find it, not enough to recolour the apparatus
    if (id === this.hovered && id !== this.focusId) setGlow(it.object, HOVER, 0.16);
    else setGlow(it.object, null);
    this.marker(id, this.highlighted.has(id) && id !== this.focusId);
  }

  /**
   * A small green chevron floating above equipment the current step uses — it marks what
   * is interactive without recolouring the apparatus itself.
   */
  private markers = new Map<string, THREE.Sprite>();
  private markerMat: THREE.SpriteMaterial | null = null;
  private marker(id: string, on: boolean) {
    let sp = this.markers.get(id);
    if (!on) {
      if (sp) sp.visible = false;
      return;
    }
    if (!sp) {
      if (!this.markerMat) {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const g = c.getContext("2d")!;
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
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        this.markerMat = new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true });
      }
      sp = new THREE.Sprite(this.markerMat);
      sp.renderOrder = 10;
      const it = this.byId.get(id)!;
      const bb = new THREE.Box3().setFromObject(it.object);
      const c = bb.getCenter(new THREE.Vector3());
      sp.position.set(c.x, bb.max.y + 0.07, c.z);
      sp.scale.setScalar(0.06);
      this.scene.add(sp);
      this.markers.set(id, sp);
    }
    sp.visible = true;
  }

  // ── public API ─────────────────────────────────────────────────────────────

  invalidate() {
    this.dirty = true;
  }

  setVisual(v: unknown) {
    this.visual = v;
    this.animating = !!this.room.apply(v, this.clock.elapsedTime);
    this.shadowsDirty = true;
    this.invalidate();
  }

  /** Equipment the current step uses get a soft green glow. */
  setHighlight(ids: string[]) {
    const before = new Set(this.highlighted);
    this.highlighted = new Set(ids.filter((id) => this.byId.has(id)));
    Array.from(new Set(Array.from(before).concat(Array.from(this.highlighted)))).forEach((id) => this.applyGlow(id));
    this.invalidate();
  }

  setMoveInput(x: number, z: number) {
    this.moveInput.set(x, z);
    if (x || z) {
      if (this.focusId) this.exitFocus();
      this.invalidate();
    }
  }

  focusOn(id: string) {
    const it = this.byId.get(id);
    if (!it) return;
    const prev = this.focusId;
    this.focusId = id;
    if (prev) this.applyGlow(prev);
    this.applyGlow(id);
    // Close-up poses are framed once, when the room is built. Equipment the experiment moves
    // (a beaker carried to the hot plate) is followed: the pose shifts by however far the
    // object has moved since then.
    const now = new THREE.Box3().setFromObject(it.object).getCenter(new THREE.Vector3());
    const moved = now.sub(this.root0.get(id) ?? now);
    const pos = new THREE.Vector3(...it.focus.pos).add(moved);
    const target = new THREE.Vector3(...it.focus.target).add(moved);
    this.focusTarget.copy(target);
    const off = pos.clone().sub(target);
    this.orbit = { yaw: 0, pitch: 0, dist: off.length() };
    this.orbitBase = off.normalize();
    this.flyTo(pos, target);
    this.opts.onFocusChange?.(id);
  }

  private orbitBase = new THREE.Vector3(0, 0, 1);
  private root0 = new Map<string, THREE.Vector3>();

  private placeOrbit() {
    const dir = this.orbitBase.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.orbit.yaw);
    const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
    dir.applyAxisAngle(side, -this.orbit.pitch * 0.6);
    this.camera.position.copy(this.focusTarget).addScaledVector(dir, this.orbit.dist);
    this.camera.lookAt(this.focusTarget);
    this.look.copy(this.focusTarget);
  }

  exitFocus() {
    if (!this.focusId) return;
    const prev = this.focusId;
    this.focusId = null;
    this.applyGlow(prev);
    const look = this.walkPos.clone().add(this.dirFromAngles());
    this.flyTo(this.walkPos.clone(), look);
    this.opts.onFocusChange?.(null);
  }

  resetView(instant = false) {
    const sp = this.room.spawn;
    this.walkPos.set(sp.pos[0], EYE, sp.pos[2]);
    const d = new THREE.Vector3(sp.target[0] - sp.pos[0], sp.target[1] - EYE, sp.target[2] - sp.pos[2]);
    this.yaw = Math.atan2(-d.x, -d.z);
    this.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    const wasFocus = this.focusId;
    this.focusId = null;
    if (wasFocus) {
      this.applyGlow(wasFocus);
      this.opts.onFocusChange?.(null);
    }
    if (instant || this.opts.reducedMotion) {
      this.camera.position.copy(this.walkPos);
      this.camera.lookAt(this.walkPos.clone().add(this.dirFromAngles()));
      this.tween = null;
    } else this.flyTo(this.walkPos.clone(), this.walkPos.clone().add(this.dirFromAngles()));
    this.invalidate();
  }

  /**
   * Where a piece of equipment is on screen (CSS px, page coordinates) and whether a tap
   * there would actually hit it. Camera geometry only — used by automated checks to tap
   * the real object the way a student would; it exposes no experiment state.
   */
  where(id: string): { x: number; y: number; hit: boolean } | null {
    const it = this.byId.get(id);
    if (!it) return null;
    const bb = new THREE.Box3().setFromObject(it.object);
    const r = this.renderer.domElement.getBoundingClientRect();
    const toScreen = (p: THREE.Vector3) => {
      const c = p.clone().project(this.camera);
      return { x: r.left + ((c.x + 1) / 2) * r.width, y: r.top + ((1 - c.y) / 2) * r.height, front: c.z < 1 };
    };
    // the centre first, then a grid through the box — a stand's centre can be hidden behind
    // the burette it holds, but its rod and base are still there to tap
    const pts = [bb.getCenter(new THREE.Vector3())];
    for (const fy of [0.5, 0.15, 0.85, 0.3, 0.7]) for (const fx of [0.5, 0.25, 0.75]) for (const fz of [0.5, 0.25, 0.75]) pts.push(new THREE.Vector3(bb.min.x + (bb.max.x - bb.min.x) * fx, bb.min.y + (bb.max.y - bb.min.y) * fy, bb.min.z + (bb.max.z - bb.min.z) * fz));
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

  stats(): RuntimeStats {
    const info = this.renderer.info;
    const ft = this.frameTimes;
    const fps = ft.length >= 10 ? Math.round(1000 / (ft.reduce((a, b) => a + b, 0) / ft.length)) : null;
    return { drawCalls: info.render.calls, triangles: info.render.triangles, geometries: info.memory.geometries, textures: info.memory.textures, fps, loadMs: this.loadMs, quality: this.opts.quality };
  }

  /** Render continuously for `ms` and report the measured frame rate (used by the perf panel). */
  measure(ms = 3000): Promise<RuntimeStats> {
    this.frameTimes = [];
    this.forceUntil = performance.now() + ms;
    return new Promise((res) => setTimeout(() => res(this.stats()), ms + 50));
  }
  private forceUntil = 0;

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.cleanups.forEach((f) => f());
    this.room?.dispose?.();
    const textures = new Set<THREE.Texture>();
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
      for (const mat of mats) {
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) textures.add(v);
        mat.dispose();
      }
    });
    textures.forEach((t) => t.dispose());
    Object.values(this.mats).forEach((m) => (m as THREE.Material).dispose());
    this.scene.environment?.dispose();
    disposeKitCache();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  // ── frame ────────────────────────────────────────────────────────────────

  private dirFromAngles() {
    return new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch));
  }

  private flyTo(pos: THREE.Vector3, look: THREE.Vector3, done?: () => void) {
    if (this.opts.reducedMotion) {
      this.camera.position.copy(pos);
      this.camera.lookAt(look);
      this.look.copy(look);
      this.tween = null;
      done?.();
      this.invalidate();
      return;
    }
    this.tween = { from: this.camera.position.clone(), to: pos, fromLook: this.look.clone(), toLook: look, t: 0, dur: 0.75, done };
    this.invalidate();
  }

  private collides(x: number, z: number, cs: Collider[]) {
    for (const c of cs) if (x > c.minX - RADIUS && x < c.maxX + RADIUS && z > c.minZ - RADIUS && z < c.maxZ + RADIUS) return true;
    return false;
  }

  private frame = () => {
    const rawDt = this.clock.getDelta();
    const dt = Math.min(0.05, rawDt); // motion uses a clamped step; the fps figure uses the real one
    const t = this.clock.elapsedTime;
    let moving = false;

    // walking
    const fwd = (this.keys.has("w") || this.keys.has("arrowup") ? 1 : 0) - (this.keys.has("s") || this.keys.has("arrowdown") ? 1 : 0) + -this.moveInput.y;
    const strafe = (this.keys.has("d") ? 1 : 0) - (this.keys.has("a") ? 1 : 0) + this.moveInput.x;
    const turn = (this.keys.has("arrowleft") ? 1 : 0) - (this.keys.has("arrowright") ? 1 : 0);
    if (!this.focusId && (fwd || strafe || turn)) {
      moving = true;
      this.yaw += turn * dt * 1.6;
      const f = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const r = new THREE.Vector3(-f.z, 0, f.x);
      const step = f.multiplyScalar(fwd).add(r.multiplyScalar(strafe));
      if (step.lengthSq() > 1) step.normalize();
      step.multiplyScalar(WALK * dt);
      const b = this.room.bounds;
      const nx = THREE.MathUtils.clamp(this.walkPos.x + step.x, b.minX, b.maxX);
      if (!this.collides(nx, this.walkPos.z, this.room.colliders)) this.walkPos.x = nx;
      const nz = THREE.MathUtils.clamp(this.walkPos.z + step.z, b.minZ, b.maxZ);
      if (!this.collides(this.walkPos.x, nz, this.room.colliders)) this.walkPos.z = nz;
      this.tween = null;
    }

    if (this.tween) {
      const tw = this.tween;
      // real time, so a slow device finishes the flight on schedule (just in fewer frames)
      tw.t = Math.min(1, tw.t + Math.min(rawDt, 0.25) / tw.dur);
      const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
      this.camera.position.lerpVectors(tw.from, tw.to, e);
      this.look.lerpVectors(tw.fromLook, tw.toLook, e);
      this.camera.lookAt(this.look);
      if (tw.t >= 1) {
        this.tween = null;
        tw.done?.();
      }
      moving = true;
    } else if (!this.focusId) {
      this.camera.position.copy(this.walkPos);
      this.look.copy(this.walkPos).add(this.dirFromAngles());
      this.camera.lookAt(this.look);
    }

    if (this.animating && this.room.tick) {
      this.room.tick(t, dt);
      moving = true;
    }
    const forced = performance.now() < this.forceUntil;
    if (this.dirty || moving || forced) {
      if (this.shadowsDirty || this.animating) {
        this.renderer.shadowMap.needsUpdate = true;
        this.shadowsDirty = false;
      }
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
      if (moving || forced) {
        this.frameTimes.push(rawDt * 1000);
        if (this.frameTimes.length > 120) this.frameTimes.shift();
      }
    }
  };
}

export type { Pose };
