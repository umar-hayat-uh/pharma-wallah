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
 *  - Quality tiers trade pixel ratio, shadows, antialiasing and the HDRI.
 *  - Everything it creates is disposed on unmount, including the WebGL context.
 */
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createMaterials, isolateMaterials, setGlow, type MaterialLib } from "./materials";
import { disposeKitCache } from "./kit";
import type { BuildContext, Collider, Interactive, Pose, Quality, RoomBuild } from "./types";

export interface RuntimeOptions {
  quality: Quality;
  reducedMotion: boolean;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  onFocusChange?: (id: string | null) => void;
  onError?: (message: string) => void;
  onProgress?: (fraction: number) => void;
  onReady?: () => void;
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
    this.renderer = new THREE.WebGLRenderer({ antialias: q !== "low", powerPreference: q === "high" ? "high-performance" : "default", preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q === "high" ? 2 : q === "medium" ? 1.5 : 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = q !== "low";
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = this.renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    canvas.style.outline = "none";
    canvas.tabIndex = 0;
    canvas.setAttribute("aria-label", "3D laboratory. Click to focus, then use W A S D or the arrow keys to walk and drag to look around. Every action is also available in the side panels.");
    canvas.setAttribute("role", "application");
    host.appendChild(canvas);

    this.camera = new THREE.PerspectiveCamera(58, 1, 0.02, 60);
    this.scene.background = new THREE.Color(0xeef3f7);
    this.setupLights(q);

    const anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), q === "high" ? 8 : q === "medium" ? 4 : 1);
    const loader = new THREE.TextureLoader();
    const pending: Promise<void>[] = [];
    const ctx: BuildContext = {
      quality: q,
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
    for (const it of this.room.interactives) {
      isolateMaterials(it.object);
      it.object.traverse((o) => (o.userData.labId = it.id));
      this.pickables.push(it.object);
      this.byId.set(it.id, it);
    }
    this.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && q === "low") (o as THREE.Mesh).castShadow = false;
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

    Promise.allSettled(pending).then(() => {
      if (this.disposed) return;
      this.loadMs = Math.round(performance.now() - this.loadStart);
      opts.onProgress?.(1);
      this.invalidate();
      opts.onReady?.();
    });
    this.renderer.setAnimationLoop(this.frame);
  }

  // ── setup ────────────────────────────────────────────────────────────────

  private setupLights(q: Quality) {
    this.scene.add(new THREE.HemisphereLight(0xf4f8ff, 0xb9c4cf, 0.38));
    const key = new THREE.DirectionalLight(0xfff6ea, 2.1);
    key.position.set(-4, 7, -3);
    key.castShadow = q !== "low";
    key.shadow.mapSize.set(q === "high" ? 2048 : 1024, q === "high" ? 2048 : 1024);
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
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w < 640 ? 68 : 58;
    this.camera.updateProjectionMatrix();
    this.invalidate();
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
    const pos = new THREE.Vector3(...it.focus.pos);
    const target = new THREE.Vector3(...it.focus.target);
    this.focusTarget.copy(target);
    const off = pos.clone().sub(target);
    this.orbit = { yaw: 0, pitch: 0, dist: off.length() };
    this.orbitBase = off.normalize();
    this.flyTo(pos, target);
    this.opts.onFocusChange?.(id);
  }

  private orbitBase = new THREE.Vector3(0, 0, 1);

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
