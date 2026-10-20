/**
 * Shared physically based materials. One instance per look, reused by every mesh that
 * needs it (cheap on draw state and memory). Interactive equipment gets per-object clones
 * at registration so hover highlighting does not light up every bottle in the room.
 *
 * Glass: on "high" quality a MeshPhysicalMaterial with transmission (real refraction of
 * what is behind it — one extra render pass); on low/medium a cheaper transparent
 * physical material with clearcoat that still reads as glass under the environment map.
 */
import * as THREE from "three";
import type { Quality } from "./types";
import { floorTexture, wallTexture } from "./textures";

export type MaterialLib = ReturnType<typeof createMaterials>;

export function createMaterials(quality: Quality, floorMap?: THREE.Texture | null, wallMap?: THREE.Texture | null) {
  const hi = quality === "high";
  const floorTex = floorMap ?? floorTexture("#cdd6dc");
  floorTex.repeat.set(6, 5);
  const wallTex = wallMap ?? wallTexture();
  wallTex.repeat.set(4, 2);

  const glass = hi
    ? new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transmission: 1, thickness: 0.004, ior: 1.47, transparent: true, envMapIntensity: 1.1, side: THREE.DoubleSide })
    : new THREE.MeshPhysicalMaterial({ color: 0xe9f4fb, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.4, side: THREE.DoubleSide, depthWrite: false });

  const m = {
    glass,
    amberGlass: new THREE.MeshPhysicalMaterial({ color: 0x8a4a12, roughness: 0.08, transparent: true, opacity: 0.78, clearcoat: 1, envMapIntensity: 1.2 }),
    water: new THREE.MeshPhysicalMaterial({ color: 0xdff1ff, roughness: 0.02, transparent: true, opacity: 0.38, envMapIntensity: 1, depthWrite: false }),
    floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55, metalness: 0 }),
    wall: new THREE.MeshStandardMaterial({ map: wallTex, color: 0xffffff, roughness: 0.92 }),
    wallAccent: new THREE.MeshStandardMaterial({ color: 0xdbe9f6, roughness: 0.9 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xf7f8f9, roughness: 0.95 }),
    skirting: new THREE.MeshStandardMaterial({ color: 0x5f6b78, roughness: 0.6 }),
    epoxyTop: new THREE.MeshPhysicalMaterial({ color: 0x2c3036, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    resinWhiteTop: new THREE.MeshPhysicalMaterial({ color: 0xeceff1, roughness: 0.35, clearcoat: 0.4 }),
    cabinet: new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.55 }),
    cabinetDoor: new THREE.MeshStandardMaterial({ color: 0xf6f8f9, roughness: 0.45 }),
    accentBlue: new THREE.MeshStandardMaterial({ color: 0x1c7bd9, roughness: 0.45 }),
    accentGreen: new THREE.MeshStandardMaterial({ color: 0x21b67a, roughness: 0.45 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc9ced3, roughness: 0.28, metalness: 0.9 }),
    brushed: new THREE.MeshStandardMaterial({ color: 0xb4bac0, roughness: 0.42, metalness: 0.85 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.08, metalness: 1 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.5, metalness: 0.6 }),
    plasticWhite: new THREE.MeshStandardMaterial({ color: 0xf4f5f6, roughness: 0.4 }),
    plasticGrey: new THREE.MeshStandardMaterial({ color: 0x8d949c, roughness: 0.5 }),
    plasticDark: new THREE.MeshStandardMaterial({ color: 0x2b2f35, roughness: 0.45 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x1f2226, roughness: 0.9 }),
    red: new THREE.MeshStandardMaterial({ color: 0xc8202a, roughness: 0.45 }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.5 }),
    greenSafety: new THREE.MeshStandardMaterial({ color: 0x14864a, roughness: 0.5 }),
    wood: new THREE.MeshStandardMaterial({ color: 0xb08a62, roughness: 0.6 }),
    // lacquered hardwood bench top, the traditional pharmacognosy bench
    woodTop: new THREE.MeshPhysicalMaterial({ color: 0x9a6a42, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    tileWhite: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.18, clearcoat: 0.5 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xfdfdfb, roughness: 0.85 }),
    lightPanel: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: 1 }),
    window: new THREE.MeshStandardMaterial({ color: 0xdff0ff, emissive: 0xcfe8ff, emissiveIntensity: 0.85, roughness: 0.2 }),
    powderWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 }),
    powderBrown: new THREE.MeshStandardMaterial({ color: 0x5b3520, roughness: 0.95 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x0f1a24, roughness: 0.3, metalness: 0.2 }),
  };
  return m;
}

/** Clone every material under `root` so the object can be highlighted on its own. */
export function isolateMaterials(root: THREE.Object3D) {
  const seen = new Map<THREE.Material, THREE.Material>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const swap = (mat: THREE.Material) => {
      if (!seen.has(mat)) seen.set(mat, mat.clone());
      return seen.get(mat)!;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
  });
}

/** Tint the emissive channel of an isolated object (hover / selection / step focus). */
export function setGlow(root: THREE.Object3D, color: number | null, strength = 0.35) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const std = mat as THREE.MeshStandardMaterial;
      // glass and liquids stay untinted: a glow on a transparent surface reads as coloured glass
      if (!std.emissive || mat.userData.fixedEmissive || mat.transparent) continue;
      if (mat.userData.baseEmissive === undefined) mat.userData.baseEmissive = std.emissive.getHex();
      if (mat.userData.baseIntensity === undefined) mat.userData.baseIntensity = std.emissiveIntensity;
      if (color === null) {
        std.emissive.setHex(mat.userData.baseEmissive);
        std.emissiveIntensity = mat.userData.baseIntensity;
      } else {
        std.emissive.setHex(color);
        std.emissiveIntensity = strength;
      }
    }
  });
}
