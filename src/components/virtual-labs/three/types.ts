/**
 * Contracts between the shared 3D runtime and the four rooms. A room is built once
 * from shared parts (kit.ts, glass.ts, instruments.ts), registers its interactive
 * equipment and colliders, and redraws itself from a plain "visual" object derived
 * from the experiment state — the room never reads or writes experiment state itself.
 */
import type * as THREE from "three";

export type Quality = "low" | "medium" | "high";

/** Screen pixels covered by the lab's panels; the camera centres the scene in the rest. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Pose {
  /** Camera position, metres. */
  pos: [number, number, number];
  /** Point the camera looks at. */
  target: [number, number, number];
}

export interface Interactive {
  id: string; // equipment id from the experiment definition
  label: string;
  object: THREE.Object3D;
  /** Close-up inspection pose. */
  focus: Pose;
}

/** Axis-aligned box on the floor plane the walker cannot enter. */
export interface Collider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface RoomBuild {
  root: THREE.Group;
  interactives: Interactive[];
  colliders: Collider[];
  /** Walkable bounds (inside the walls). */
  bounds: Collider;
  spawn: Pose;
  /** Redraw from the visual state; return true while something animates (bubbles, stirring). */
  apply(visual: unknown, time: number): boolean;
  /** Per-frame animation hook while apply() reported activity. */
  tick?(time: number, dt: number): void;
  dispose?(): void;
}

export interface BuildContext {
  quality: Quality;
  /** Experiment id the room is set up for. */
  experiment: string;
  /** Anisotropy the renderer supports (capped by quality). */
  anisotropy: number;
  /** Load a texture from /public, resolving to null on failure (rooms fall back to procedural). */
  texture(url: string, opts?: { repeat?: [number, number]; srgb?: boolean }): THREE.Texture | null;
}
