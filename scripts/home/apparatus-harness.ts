/*
 * Renders one still of PharmaWallah's own 3D apparatus for the home page, on a
 * transparent ground. Bundled and driven by scripts/home/render-apparatus.mjs;
 * the shot is picked by `?shot=`. The builders are the Virtual Labs' own
 * (src/components/virtual-labs/three/) and the femur is the Osteology Lab's
 * Z-Anatomy export, so the home page shows what the platform actually ships.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createMaterials } from "../../src/components/virtual-labs/three/materials";
import { beaker, conicalFlask, measuringCylinder, volumetricFlask } from "../../src/components/virtual-labs/three/glass";
import { analyticalBalance, compoundMicroscope } from "../../src/components/virtual-labs/three/instruments";

const shot = new URLSearchParams(location.search).get("shot") ?? "glassware";

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xeef6ff, 0x5c7f9e, 1.2));
const key = new THREE.DirectionalLight(0xfff4e2, 2.4);
key.position.set(3, 5, 6);
scene.add(key);
const rim = new THREE.DirectionalLight(0xbfe6d6, 2.0);
rim.position.set(-5, 2, -4);
scene.add(rim);

// "medium": the clear-coated glass, not transmission — transmission refracts
// what is behind it, and behind a transparent still there is nothing.
const m = createMaterials("medium");
// The lab's glass is tuned to sit in a lit room; alone on a pale page it vanishes,
// so the stills give it a little more body.
m.glass.opacity = 0.34;
m.glass.color.set(0xd6eaf7);
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.01, 50);

/** Frames `obj` from direction `dir`, filling `fill` of the frame. */
function frame(obj: THREE.Object3D, dir: THREE.Vector3, fill = 0.92) {
  const box = new THREE.Box3().setFromObject(obj);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fit = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * camera.aspect));
  const dist = sphere.radius / Math.sin(fit / 2) / fill;
  camera.position.copy(sphere.center).addScaledVector(dir.normalize(), dist);
  camera.lookAt(sphere.center);
}

const rgb = (hex: number): [number, number, number] => {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
};

async function build() {
  const root = new THREE.Group();
  scene.add(root);

  if (shot === "glassware") {
    // ACES at 1.1 bleaches thin coloured liquid toward pastel; pull it down here.
    renderer.toneMappingExposure = 0.88;
    // Hero: the bench cluster — volumes and colours are illustrative, in brand tints.
    const flask = conicalFlask(m);
    flask.setVolume(120);
    flask.setColour(rgb(0x0f5fb8), 0.88);
    root.add(flask.group);
    const b = beaker(m, 250);
    b.setVolume(150);
    b.setColour(rgb(0x15995f), 0.86);
    b.group.position.set(0.085, 0, -0.06);
    root.add(b.group);
    const cyl = measuringCylinder(m, 100);
    cyl.setVolume(70);
    cyl.setColour(rgb(0x2f94d6), 0.8);
    cyl.group.position.set(-0.07, 0, -0.07);
    root.add(cyl.group);
    const vol = volumetricFlask(m);
    vol.setVolume(100);
    vol.setColour(rgb(0x22a874), 0.78);
    vol.group.position.set(0.02, 0, -0.13);
    root.add(vol.group);
    frame(root, new THREE.Vector3(0.35, 0.42, 1));
  } else if (shot === "balance") {
    // Section 01 (calculators): weighing is where a calculation starts.
    const bal = analyticalBalance(m);
    bal.set({ boatOn: true, sampleG: 0.5, display: "0.5003 g", stable: true, doorsClosed: true });
    root.add(bal.group);
    frame(root, new THREE.Vector3(0.75, 0.55, 1));
  } else if (shot === "microscope") {
    const mic = compoundMicroscope(m);
    mic.set({ mag: 10, light: true });
    root.add(mic.group);
    frame(root, new THREE.Vector3(-0.85, 0.35, 1));
  } else if (shot === "femur") {
    const gltf = await new GLTFLoader().loadAsync("/models/osteology/bone-femur.glb");
    const bone = gltf.scene;
    // Z-Anatomy's bone material reads as flat white on a pale page: give it bone's
    // ivory and enough roughness for the side light to model the shaft.
    const ivory = new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.62, metalness: 0 });
    bone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = ivory;
    });
    renderer.toneMappingExposure = 0.95;
    key.position.set(6, 3, 3);
    const box = new THREE.Box3().setFromObject(bone);
    bone.position.sub(box.getCenter(new THREE.Vector3()));
    const pivot = new THREE.Group();
    pivot.add(bone);
    pivot.rotation.set(0.15, 0.6, -0.55);
    root.add(pivot);
    frame(root, new THREE.Vector3(0, 0.1, 1));
  }

  renderer.render(scene, camera);
  // Render twice: the first frame compiles shaders and uploads label textures.
  await new Promise((r) => requestAnimationFrame(r));
  renderer.render(scene, camera);
  document.title = "READY";
}

build().catch((e) => {
  document.title = `ERROR ${e}`;
  console.error(e);
});
