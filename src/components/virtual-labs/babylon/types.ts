/**
 * Contracts between the Babylon.js runtime and its room (Pharmaceutical Chemistry only,
 * 2026-10-22). They mirror ../three/types.ts so the shell, the experiment and the
 * automated checks cannot tell the engines apart: same equipment ids, same close-up
 * poses, same colliders, same "visual" object in, same clicks out.
 */
import type { Scene } from "@babylonjs/core/scene";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Collider, Pose, Quality } from "../three/types";
import type { Kit } from "./kit";

export interface BInteractive {
  id: string; // equipment id from the experiment definition
  label: string;
  node: TransformNode;
  /** Close-up inspection pose. */
  focus: Pose;
}

export interface BRoomBuild {
  root: TransformNode;
  interactives: BInteractive[];
  colliders: Collider[];
  bounds: Collider;
  spawn: Pose;
  /** Bench-top apparatus whose opaque parts cast shadows — kept small so the shadow map stays sharp. */
  casters: TransformNode[];
  /** Redraw from the visual state; return true when an animation has started. */
  apply(visual: unknown, time: number): boolean;
  /** Advance animations; return true while any is still running. */
  tick?(time: number, dt: number): boolean;
  dispose?(): void;
}

export interface BBuildContext {
  scene: Scene;
  kit: Kit;
  quality: Quality;
  /** Experiment id the room is set up for: it builds the shared room + that experiment's apparatus. */
  experiment: string;
}

export type BRoomBuilder = (ctx: BBuildContext) => BRoomBuild;
