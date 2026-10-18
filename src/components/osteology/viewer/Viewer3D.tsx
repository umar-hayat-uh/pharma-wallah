"use client";

/**
 * The lab's WebGL viewer — plain three.js (already a dependency; no React Three Fiber,
 * so nothing new is installed). Loaded only through ModelViewer's next/dynamic import,
 * so three.js never lands in a page's first load or on any other route.
 *
 * One component serves bones, joints and the skeleton:
 *  - materials are chosen by the GLB's material names (Bone, Cartilage, Ligament,
 *    Capsule, Fibrocartilage, Membrane — scripts/osteology/export-zanatomy.py);
 *  - landmark markers sit exactly on the Z-Anatomy anchors passed in (never computed);
 *  - a left bone is the right model mirrored on X (three.js flips the winding itself
 *    for a negative-determinant matrix, so faces stay lit correctly);
 *  - it renders on demand (control changes, tweens, prop changes), not every frame,
 *    which matters on a phone's battery.
 *
 * Frame: +Y superior, +Z anterior, −X the body's right (export-zanatomy.py).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type ViewerLandmark = { id: string; label: string; p: [number, number, number]; n: [number, number, number] };
export type ViewDir = { id: string; label: string; dir: [number, number, number] };

/**
 * A camera instruction from the surrounding controls. Passed as a prop (with a counter
 * so the same command twice still fires) rather than through a ref: next/dynamic does
 * not forward refs to the lazily loaded component.
 */
export type ViewerCommand =
  | { n: number; kind: "view"; dir: [number, number, number] }
  | { n: number; kind: "zoom"; factor: number }
  | { n: number; kind: "reset" };

export type Viewer3DProps = {
  src: string;
  mirror?: boolean;
  landmarks?: ViewerLandmark[];
  showLandmarks?: boolean;
  selectedLandmark?: string | null;
  onSelectLandmark?: (id: string | null) => void;
  /** Tap a mesh to select it (joints, skeleton, bone groups). */
  selectableParts?: boolean;
  selectedPart?: string | null;
  onSelectPart?: (name: string | null) => void;
  highlightParts?: string[];
  hiddenParts?: string[];
  /** Fade everything that is not highlighted. */
  dimOthers?: boolean;
  /** Move the camera to frame `selectedPart` when it changes (a ligament is tiny on a phone). */
  focusSelected?: boolean;
  defaultView: [number, number, number];
  reducedMotion?: boolean;
  onReady?: (partNames: string[]) => void;
  onError?: (message: string) => void;
  onProgress?: (fraction: number) => void;
  command?: ViewerCommand | null;
};

const COLOURS: Record<string, { color: number; opacity?: number; roughness: number }> = {
  Bone: { color: 0xe6dcc6, roughness: 0.62 },
  Cartilage: { color: 0xb5d3ef, roughness: 0.35 },
  Ligament: { color: 0x9fb0c6, roughness: 0.5 },
  Membrane: { color: 0xa9b8cc, roughness: 0.5, opacity: 0.8 },
  Fibrocartilage: { color: 0xd2e1f0, roughness: 0.4 },
  Capsule: { color: 0xc3ccd8, roughness: 0.5, opacity: 0.28 },
};
const HIGHLIGHT = 0x1c7bd9; // brandBlue
const SELECTED = 0x21b67a; // brandGreen
const MARKER_R = 0.011;

function roleOf(material: THREE.Material | THREE.Material[]): string {
  const m = Array.isArray(material) ? material[0] : material;
  const name = (m?.name ?? "").split(".")[0];
  return COLOURS[name] ? name : "Bone";
}

/** The glTF node name as exported (set on every mesh at load; three.js sanitises `name` itself). */
const meshName = (o: THREE.Object3D) => (o.userData?.name as string | undefined) ?? o.name;

export function Viewer3D(props: Viewer3DProps) {
  const {
    src, mirror = false, landmarks = [], showLandmarks = true, selectedLandmark = null, onSelectLandmark,
    selectableParts = false, selectedPart = null, onSelectPart, highlightParts, hiddenParts, dimOthers = false, focusSelected = false,
    defaultView, reducedMotion = false, onReady, onError, onProgress, command,
  } = props;

  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const state = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    root?: THREE.Group;
    meshes: THREE.Mesh[];
    markers: THREE.Group;
    raf: number;
    tween: number;
    render: () => void;
  }>({ meshes: [], markers: new THREE.Group(), raf: 0, tween: 0, render: () => {} });
  const [loaded, setLoaded] = useState(false);

  // Latest callbacks without re-running the setup effect.
  const cb = useRef({ onSelectLandmark, onSelectPart, onReady, onError, onProgress });
  cb.current = { onSelectLandmark, onSelectPart, onReady, onError, onProgress };

  // ── Scene setup, once per model ───────────────────────────────────────────
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const s = state.current;
    let disposed = false;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      cb.current.onError?.("This device's browser could not start 3D graphics (WebGL).");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = "none"; // one finger rotates the bone, not the page
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c2cf, 1.15));
    const headlight = new THREE.DirectionalLight(0xffffff, 1.6);
    headlight.position.set(-0.6, 0.8, 1);
    camera.add(headlight);
    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.35;
    controls.maxDistance = 6;
    controls.rotateSpeed = 0.9;
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

    const render = () => {
      if (disposed) return;
      renderer.render(scene, camera);
      positionLabel();
    };
    controls.addEventListener("change", render);

    s.renderer = renderer;
    s.scene = scene;
    s.camera = camera;
    s.controls = controls;
    s.render = render;
    s.markers = new THREE.Group();

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = `${w}px`;
      renderer.domElement.style.height = `${h}px`;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    renderer.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      cb.current.onError?.("The 3D view was interrupted by the device (graphics memory). Reload to try again.");
    });

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        const root = new THREE.Group();
        const meshes: THREE.Mesh[] = [];
        gltf.scene.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            const mesh = o as THREE.Mesh;
            // Multi-material meshes come in as a parent with one child per primitive;
            // name every primitive after the node so picking and highlighting work.
            const node = mesh.parent && !(mesh.parent as THREE.Mesh).isMesh && mesh.parent !== gltf.scene ? mesh.parent : mesh;
            // three sanitises node.name ("Femur.r" → "Femurr"); the glTF name survives in userData.
            mesh.userData.name = (node.userData?.name as string | undefined) ?? node.name.replace(/_/g, " ");
            const role = roleOf(mesh.material);
            const c = COLOURS[role];
            const mat = new THREE.MeshStandardMaterial({
              color: c.color,
              roughness: c.roughness,
              metalness: 0,
              transparent: c.opacity !== undefined,
              opacity: c.opacity ?? 1,
              depthWrite: c.opacity === undefined,
              side: role === "Capsule" ? THREE.DoubleSide : THREE.FrontSide,
            });
            mat.userData.role = role;
            mesh.material = mat;
            meshes.push(mesh);
          }
        });
        root.add(gltf.scene);
        root.add(s.markers);
        scene.add(root);
        s.root = root;
        s.meshes = meshes;
        setLoaded(true);
        cb.current.onReady?.(Array.from(new Set(meshes.map((m) => meshName(m)))));
      },
      (ev) => {
        if (ev.lengthComputable) cb.current.onProgress?.(ev.loaded / ev.total);
      },
      () => {
        if (!disposed) cb.current.onError?.("The 3D model could not be downloaded. Check your connection and retry.");
      },
    );

    // Tap (not drag) selects a marker or, if enabled, a mesh.
    let down: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const quick = performance.now() - down.t < 450;
      down = null;
      if (moved > 8 || !quick) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      const markerHits = ray.intersectObjects(s.markers.children.filter((m) => m.visible), false);
      if (markerHits.length) {
        cb.current.onSelectLandmark?.(markerHits[0].object.userData.id as string);
        return;
      }
      const hits = ray.intersectObjects(s.meshes.filter((m) => m.visible), false);
      if (hits.length && cb.current.onSelectPart) cb.current.onSelectPart(meshName(hits[0].object));
      else if (!hits.length) cb.current.onSelectPart?.(null);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    function positionLabel() {
      const el = labelRef.current;
      const sel = s.markers.children.find((m) => m.userData.selected);
      if (!el) return;
      if (!sel || !sel.visible) {
        el.style.opacity = "0";
        return;
      }
      const v = new THREE.Vector3();
      sel.getWorldPosition(v);
      v.project(camera);
      const w = host!.clientWidth;
      const h = host!.clientHeight;
      el.style.opacity = v.z < 1 ? "1" : "0";
      el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(s.tween);
      ro.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      s.meshes = [];
      setLoaded(false);
    };
  }, [src]);

  // ── Camera moves ──────────────────────────────────────────────────────────
  const moveCamera = useCallback(
    (target: THREE.Vector3, position: THREE.Vector3, up: THREE.Vector3) => {
      const s = state.current;
      const { camera, controls } = s;
      if (!camera || !controls) return;
      cancelAnimationFrame(s.tween);
      if (reducedMotion) {
        camera.up.copy(up);
        camera.position.copy(position);
        controls.target.copy(target);
        controls.update();
        s.render();
        return;
      }
      const p0 = camera.position.clone();
      const t0 = controls.target.clone();
      const u0 = camera.up.clone();
      const start = performance.now();
      const step = () => {
        const k = Math.min(1, (performance.now() - start) / 420);
        const e = 1 - Math.pow(1 - k, 3);
        camera.position.lerpVectors(p0, position, e);
        controls.target.lerpVectors(t0, target, e);
        camera.up.lerpVectors(u0, up, e).normalize();
        controls.update();
        s.render();
        if (k < 1) s.tween = requestAnimationFrame(step);
      };
      s.tween = requestAnimationFrame(step);
    },
    [reducedMotion],
  );

  const viewFrom = useCallback(
    (dir: [number, number, number], distance = 2.4) => {
      const d = new THREE.Vector3(...dir).normalize();
      // Looking down or up the body: keep anterior at the bottom (superior view) or top
      // (inferior view), as atlases draw them.
      const up = Math.abs(d.y) > 0.9 ? new THREE.Vector3(0, 0, d.y > 0 ? -1 : 1) : new THREE.Vector3(0, 1, 0);
      moveCamera(new THREE.Vector3(0, 0, 0), d.multiplyScalar(distance), up);
    },
    [moveCamera],
  );

  useEffect(() => {
    if (!command || !loaded) return;
    const s = state.current;
    if (command.kind === "view") viewFrom(command.dir);
    else if (command.kind === "reset") viewFrom(defaultView);
    else if (s.camera && s.controls) {
      const offset = s.camera.position.clone().sub(s.controls.target);
      const len = THREE.MathUtils.clamp(offset.length() * command.factor, s.controls.minDistance, s.controls.maxDistance);
      moveCamera(s.controls.target.clone(), s.controls.target.clone().add(offset.setLength(len)), s.camera.up.clone());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command?.n]);

  // First view once the model is in.
  useEffect(() => {
    if (!loaded) return;
    const s = state.current;
    if (!s.camera || !s.controls) return;
    const d = new THREE.Vector3(...defaultView).normalize();
    s.camera.up.set(0, 1, 0);
    if (Math.abs(d.y) > 0.9) s.camera.up.set(0, 0, d.y > 0 ? -1 : 1);
    s.camera.position.copy(d.multiplyScalar(2.4));
    s.controls.target.set(0, 0, 0);
    s.controls.update();
    s.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // ── Mirror, markers, highlighting (cheap: re-applied on prop change) ──────
  useEffect(() => {
    const s = state.current;
    if (!loaded || !s.root) return;
    s.root.scale.x = mirror ? -1 : 1;

    // Markers
    s.markers.clear();
    const geo = new THREE.SphereGeometry(MARKER_R, 16, 12);
    for (const lm of landmarks) {
      const selected = lm.id === selectedLandmark;
      const mat = new THREE.MeshBasicMaterial({ color: selected ? SELECTED : HIGHLIGHT });
      const m = new THREE.Mesh(geo, mat);
      // Lift the dot a hair off the surface along the normal so it is not half-buried.
      m.position.set(lm.p[0] + lm.n[0] * MARKER_R * 0.6, lm.p[1] + lm.n[1] * MARKER_R * 0.6, lm.p[2] + lm.n[2] * MARKER_R * 0.6);
      m.scale.setScalar(selected ? 1.7 : 1);
      m.userData = { id: lm.id, selected };
      m.visible = showLandmarks || selected;
      m.renderOrder = 2;
      s.markers.add(m);
    }

    // Parts
    const hl = new Set(highlightParts ?? []);
    const hidden = new Set(hiddenParts ?? []);
    for (const mesh of s.meshes) {
      const name = meshName(mesh);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const role = mat.userData.role as string;
      const base = COLOURS[role];
      const isSel = selectedPart === name;
      const isHl = hl.has(name);
      mesh.visible = !hidden.has(name);
      mat.color.setHex(isSel ? SELECTED : isHl ? HIGHLIGHT : base.color);
      const faded = dimOthers && (hl.size > 0 || selectedPart) && !isHl && !isSel;
      const opacity = faded ? Math.min(base.opacity ?? 1, role === "Bone" ? 0.35 : 0.2) : base.opacity ?? 1;
      mat.transparent = opacity < 1;
      mat.opacity = opacity;
      mat.depthWrite = opacity >= 1;
      mat.needsUpdate = true;
    }
    s.render();
  }, [loaded, mirror, landmarks, showLandmarks, selectedLandmark, highlightParts, hiddenParts, selectedPart, dimOthers]);

  // Fly to a selected landmark: look at it along its surface normal.
  useEffect(() => {
    const s = state.current;
    if (!loaded || !selectedLandmark || !s.camera) return;
    const lm = landmarks.find((l) => l.id === selectedLandmark);
    if (!lm) return;
    const sx = mirror ? -1 : 1;
    const target = new THREE.Vector3(lm.p[0] * sx, lm.p[1], lm.p[2]);
    const n = new THREE.Vector3(lm.n[0] * sx, lm.n[1], lm.n[2]).normalize();
    const current = s.camera.position.clone().sub(s.controls!.target).normalize();
    const dir = n.multiplyScalar(0.75).add(current.multiplyScalar(0.25)).normalize();
    const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(0, 0, dir.y > 0 ? -1 : 1) : new THREE.Vector3(0, 1, 0);
    moveCamera(target, target.clone().add(dir.multiplyScalar(1.15)), up);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLandmark, loaded]);

  // Frame a selected part: centre on its bounding box, keep the current viewing direction.
  useEffect(() => {
    const s = state.current;
    if (!loaded || !focusSelected || !selectedPart || !s.camera || !s.controls || !s.root) return;
    const box = new THREE.Box3();
    s.root.updateMatrixWorld(true);
    for (const mesh of s.meshes) if (meshName(mesh) === selectedPart) box.expandByObject(mesh);
    if (box.isEmpty()) return;
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    const dir = s.camera.position.clone().sub(s.controls.target).normalize();
    const distance = THREE.MathUtils.clamp(size * 2.2, 0.45, 2.6);
    moveCamera(centre, centre.clone().add(dir.multiplyScalar(distance)), s.camera.up.clone());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPart, loaded, focusSelected]);

  const selectedLabel = landmarks.find((l) => l.id === selectedLandmark)?.label;

  return (
    <div ref={hostRef} className="absolute inset-0">
      <div
        ref={labelRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 opacity-0 transition-opacity"
        style={{ willChange: "transform" }}
      >
        {selectedLabel && (
          <span className="ml-3 -mt-3 block max-w-[12rem] rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-[#16181d] shadow-md ring-1 ring-black/10">
            {selectedLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default Viewer3D;
