/*
 * The flying molecule: paracetamol, ball-and-stick, flown between the page's
 * sections by scroll. Loaded with a dynamic import() after first paint, so
 * three.js never lands in the home page's first load (verify: grep the built
 * shared chunks for "three", expect 0 hits — as for rule 18's libraries).
 *
 * Frames: scene > flight (position, scale, yaw) > body (roll/pitch) > spin
 * (tumble about the long axis) > atoms. body's +X is the molecule's long axis.
 *
 * Where it flies: each section has a `.dock` box on its stage. The molecule parks
 * on the dock of the section in view (so it scrolls with that section), and
 * flies — dipping mid-flight — to the next dock as the next section comes up.
 * Layout lives in CSS, so phones and desktops need no separate flight paths.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MOLECULE } from "./molecule-data";

type Pose = { s: number; yaw: number; pitch: number; roll: number };

// One pose per dock, in page order (yaw in degrees: 0 faces right, 180 left, 90
// the camera; s scales the dock-derived size).
const POSES: Pose[] = [
  { s: 1.0, yaw: 150, pitch: 6, roll: -4 },
  { s: 1.0, yaw: 125, pitch: 10, roll: 6 },
  { s: 1.0, yaw: 40, pitch: -6, roll: -8 },
  { s: 0.96, yaw: 160, pitch: 8, roll: 4 },
  { s: 0.9, yaw: 60, pitch: 6, roll: -6 },
  { s: 0.75, yaw: 105, pitch: 4, roll: 0 },
];

// CPK convention in brand tints: carbon navy slate (not black), nitrogen brand
// blue, oxygen red, hydrogen near-white. Radii are ball-and-stick, in Å.
const ATOM: Record<string, { color: number; r: number }> = {
  C: { color: 0x2a405a, r: 0.34 },
  N: { color: 0x1c7bd9, r: 0.33 },
  O: { color: 0xe5484d, r: 0.32 },
  H: { color: 0xf2f6fa, r: 0.21 },
};
const BOND_R = 0.085;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerpAngle = (a: number, b: number, t: number) => a + ((((b - a + 540) % 360) + 360) % 360 - 180) * t;
const rad = THREE.MathUtils.degToRad;

function buildMolecule() {
  const group = new THREE.Group();
  const pos = MOLECULE.atoms.map(([, x, y, z]) => new THREE.Vector3(x, y, z));
  const els = MOLECULE.atoms.map(([el]) => (el in ATOM ? el : "C"));

  const mats: Record<string, THREE.MeshPhysicalMaterial> = {};
  for (const [el, a] of Object.entries(ATOM)) {
    mats[el] = new THREE.MeshPhysicalMaterial({ color: a.color, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.9 });
  }
  const sphere = new THREE.SphereGeometry(1, 32, 24);
  const stick = new THREE.CylinderGeometry(BOND_R, BOND_R, 1, 14, 1);

  els.forEach((el, i) => {
    const m = new THREE.Mesh(sphere, mats[el]);
    m.scale.setScalar(ATOM[el].r);
    m.position.copy(pos[i]);
    group.add(m);
  });

  const neighbours = els.map(() => [] as number[]);
  for (const [a, b] of MOLECULE.bonds) {
    neighbours[a].push(b);
    neighbours[b].push(a);
  }
  const up = new THREE.Vector3(0, 1, 0);
  /** One stick from p to q, split at the middle so each half wears its atom's colour. */
  const half = (p: THREE.Vector3, q: THREE.Vector3, mat: THREE.Material) => {
    const d = q.clone().sub(p);
    const m = new THREE.Mesh(stick, mat);
    m.scale.y = d.length();
    m.position.copy(p).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(up, d.normalize());
    group.add(m);
  };
  for (const [a, b, order] of MOLECULE.bonds) {
    const pa = pos[a];
    const pb = pos[b];
    const mid = pa.clone().lerp(pb, 0.5);
    if (order < 2) {
      half(pa, mid, mats[els[a]]);
      half(mid, pb, mats[els[b]]);
      continue;
    }
    // A double bond: two sticks offset within the plane of a neighbouring atom,
    // so the ring's Kekulé double bonds lie flat in the ring.
    const d = pb.clone().sub(pa).normalize();
    const other = neighbours[a].find((n) => n !== b) ?? neighbours[b].find((n) => n !== a);
    const ref = other !== undefined ? pos[other].clone().sub(pa) : new THREE.Vector3(0, 0, 1);
    const normal = d.clone().cross(ref).normalize();
    const off = normal.cross(d).normalize().multiplyScalar(BOND_R * 1.25);
    for (const s of [1, -1]) {
      const o = off.clone().multiplyScalar(s);
      half(pa.clone().add(o), mid.clone().add(o), mats[els[a]]);
      half(mid.clone().add(o), pb.clone().add(o), mats[els[b]]);
    }
  }

  // Long axis -> +X: the two heavy atoms farthest apart define it.
  let best = [0, 1];
  let far = 0;
  els.forEach((ea, i) => {
    if (ea === "H") return;
    els.forEach((eb, j) => {
      if (eb === "H" || j <= i) return;
      const dd = pos[i].distanceToSquared(pos[j]);
      if (dd > far) {
        far = dd;
        best = [i, j];
      }
    });
  });
  const axis = pos[best[1]].clone().sub(pos[best[0]]).normalize();
  group.quaternion.setFromUnitVectors(axis, new THREE.Vector3(1, 0, 0));

  // Normalise to a unit longest dimension, centred.
  const holder = new THREE.Group();
  holder.add(group);
  const box = new THREE.Box3().setFromObject(holder);
  const size = box.getSize(new THREE.Vector3());
  holder.scale.setScalar(1 / Math.max(size.x, size.y, size.z));
  const box2 = new THREE.Box3().setFromObject(holder);
  holder.position.sub(box2.getCenter(new THREE.Vector3()));

  const dispose = () => {
    sphere.dispose();
    stick.dispose();
    Object.values(mats).forEach((m) => m.dispose());
  };
  return { holder, dispose };
}

export interface FlightOptions {
  /** The sections, in page order — one per pose. */
  sections: HTMLElement[];
  /** Each section's dock (same order). */
  docks: HTMLElement[];
  reducedMotion: boolean;
  onReady: () => void;
}

export function startFlight(canvas: HTMLCanvasElement, opts: FlightOptions) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.HemisphereLight(0xeef6ff, 0x4f7da3, 1.3));
  const key = new THREE.DirectionalLight(0xfff4e2, 2.4);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfeedd, 2.0);
  rim.position.set(-5, 2, -4);
  scene.add(rim);

  const flight = new THREE.Group();
  const body = new THREE.Group();
  const spin = new THREE.Group();
  const mol = buildMolecule();
  spin.add(mol.holder);
  body.add(spin);
  flight.add(body);
  scene.add(flight);

  const n = Math.min(opts.sections.length, opts.docks.length, POSES.length);
  // The scroll position each section snaps to: its top (minus any scroll-padding
  // the page sets on <html>; none today — molecule-landing.css explains why).
  let anchors: number[] = [];
  const measure = () => {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    anchors = opts.sections.slice(0, n).map((s, i) => (i === 0 ? 0 : Math.max(0, s.getBoundingClientRect().top + scrollY - pad)));
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  measure();

  /** i + fraction of the way from section i's anchor to section i+1's. */
  const progress = () => {
    const y = scrollY;
    let i = 0;
    for (let k = 0; k < n; k++) if (anchors[k] <= y + 1) i = k;
    if (i >= n - 1) return n - 1;
    return i + clamp((y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]), 0, 1);
  };

  /** A dock's centre in NDC and its width in world units at the molecule's depth. */
  const dockAt = (i: number) => {
    const r = opts.docks[i].getBoundingClientRect();
    const halfH = Math.tan(rad(camera.fov / 2)) * camera.position.z;
    return {
      x: ((r.left + r.width / 2) / innerWidth) * 2 - 1,
      y: -(((r.top + r.height / 2) / innerHeight) * 2 - 1),
      size: Math.min(r.width, r.height * 2.2) * ((2 * halfH) / innerHeight),
    };
  };

  const targetAt = (p: number) => {
    if (!Number.isFinite(p)) p = 0;
    p = clamp(p, 0, n - 1);
    const i = Math.min(n - 2, Math.floor(p));
    const f = p - i;
    // Parks on dock i, then flies to dock i+1 in the middle of the scroll between them.
    const t = opts.reducedMotion ? Math.round(f) : ease(clamp((f - 0.15) / 0.7, 0, 1));
    const arc = Math.sin(t * Math.PI);
    const a = dockAt(i);
    const b = dockAt(i + 1);
    const pa = POSES[i];
    const pb = POSES[i + 1];
    return {
      // Kept inside the viewport even while a dock is scrolled out of it.
      x: clamp(lerp(a.x, b.x, t), -0.9, 0.9),
      y: clamp(lerp(a.y, b.y, t) + arc * -0.22, -0.82, 0.82),
      size: lerp(a.size * pa.s, b.size * pb.s, t) * (1 + arc * 0.12),
      yaw: lerpAngle(pa.yaw, pb.yaw, t),
      pitch: lerp(pa.pitch, pb.pitch, t),
      roll: lerp(pa.roll, pb.roll, t),
      moving: arc,
    };
  };

  const cur = { ...targetAt(progress()) };
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return; // a finger on a phone is scrolling, not steering
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / innerHeight) * 2 - 1);
  };

  const clock = new THREE.Clock();
  let spinAngle = 0;
  let raf = 0;
  let running = false;

  const pose = (dt: number, t: number) => {
    const still = opts.reducedMotion;
    const tg = targetAt(progress());
    // Fast enough to stay on a scrolling dock, slow enough to read as flight.
    const k = still ? 1 : 1 - Math.exp(-dt * 6);
    const ky = still ? 1 : 1 - Math.exp(-dt * 2.6);
    const px = cur.x;
    const py = cur.y;
    cur.x = lerp(cur.x, tg.x, k);
    cur.y = lerp(cur.y, tg.y, k);
    cur.size = lerp(cur.size, tg.size, k);
    cur.pitch = lerp(cur.pitch, tg.pitch, k);
    cur.roll = lerp(cur.roll, tg.roll, k);
    cur.yaw = lerpAngle(cur.yaw, tg.yaw, ky);
    cur.moving = tg.moving;
    const vx = dt > 0 ? (cur.x - px) / dt : 0;
    const vy = dt > 0 ? (cur.y - py) / dt : 0;

    const km = 1 - Math.exp(-dt * 2);
    mouse.sx = lerp(mouse.sx, mouse.x, km);
    mouse.sy = lerp(mouse.sy, mouse.y, km);

    const halfH = Math.tan(rad(camera.fov / 2)) * camera.position.z;
    const halfW = halfH * camera.aspect;
    const hover = still ? 0 : Math.sin(t * 2.1) * 0.045 + Math.sin(t * 3.7) * 0.015;
    flight.position.set(
      cur.x * halfW + (still ? 0 : Math.sin(t * 1.3) * 0.04 + mouse.sx * 0.12),
      cur.y * halfH + hover * halfH * 0.3 + (still ? 0 : mouse.sy * 0.08),
      still ? 0 : Math.sin(t * 0.9) * 0.15,
    );
    flight.scale.setScalar(Math.max(0.01, cur.size));
    flight.rotation.set(0, -rad(cur.yaw + mouse.sx * 12), 0);

    // Vertical velocity is mostly scroll while parked, so it only tilts a little.
    const pitch = cur.pitch - clamp(vy * 8, -20, 20) + (still ? 0 : Math.sin(t * 2.1 + 1) * 3 + mouse.sy * 6);
    const roll = cur.roll + clamp(vx * 18, -30, 30) + (still ? 0 : Math.sin(t * 1.7) * 4);
    body.rotation.set(rad(roll), 0, rad(pitch), "YZX");

    // In place of wings: the molecule tumbles about its long axis, faster in flight.
    if (!still) spinAngle += dt * (0.35 + cur.moving * 1.6);
    spin.rotation.x = spinAngle;
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    pose(dt, clock.elapsedTime);
    renderer.render(scene, camera);
  };
  const start = () => {
    if (running || opts.reducedMotion) return;
    running = true;
    clock.getDelta();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  // Reduced motion: no loop at all — one still frame per scroll or resize.
  const still = () => {
    pose(0, 0);
    renderer.render(scene, camera);
  };
  const onScroll = () => {
    if (opts.reducedMotion) requestAnimationFrame(still);
  };
  const onResize = () => {
    measure();
    if (opts.reducedMotion) still();
  };
  const onVisibility = () => (document.hidden ? stop() : start());
  // Section heights change as fonts and images arrive.
  const ro = new ResizeObserver(() => measure());
  ro.observe(document.body);

  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);

  renderer.compile(scene, camera);
  if (opts.reducedMotion) still();
  else start();
  opts.onReady();

  return {
    dispose() {
      stop();
      ro.disconnect();
      removeEventListener("pointermove", onPointer);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      mol.dispose();
      env.dispose();
      renderer.dispose();
    },
  };
}
