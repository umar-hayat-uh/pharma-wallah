/**
 * The 3D asset registry: every model and spotting image the lab can show, read from the
 * files the export pipeline writes (scripts/osteology/). Pages and components ask this
 * module for a URL — no path to /models/osteology or /images/osteology is written
 * anywhere else, so moving the assets (a CDN, a new pipeline) is a change here only.
 * Spotting images live in spotting-images.ts instead: that map is server-only, because
 * an image's id names its answer.
 */
import modelsJson from "./generated/models.json";

export type ModelPart = { name: string; kind: string; verts: number };
export type ModelLandmark = {
  name: string;
  mesh: string;
  /** Anchor in the model's frame: +Y superior, +Z anterior, −X the body's right. */
  p: [number, number, number];
  /** Surface normal nearest the anchor (for lifting the marker off the bone). */
  n: [number, number, number];
  /** Distance from the anchor to the bone surface, mm (non-zero for holes and notches). */
  offMm: number;
};
export type ModelEntry = {
  slug: string;
  file: string;
  bytes: number;
  /** Real size: width (x), height (y), depth (z), cm. */
  sizeCm: [number, number, number];
  parts: ModelPart[];
  missing: string[];
  landmarks: ModelLandmark[];
};
export type SkeletonPart = { name: string; base: string; side: "left" | "right" | "midline"; bone: string | null };

const data = modelsJson as unknown as {
  bones: ModelEntry[];
  joints: ModelEntry[];
  skeleton: { file: string; bytes: number; sizeCm: number[]; parts: SkeletonPart[] };
};

export const BONE_MODELS = new Map(data.bones.map((m) => [m.slug, m]));
export const JOINT_MODELS = new Map(data.joints.map((m) => [m.slug, m]));
export const SKELETON = data.skeleton;

const MODEL_BASE = "/models/osteology";

export const modelUrl = (file: string) => `${MODEL_BASE}/${file}`;
export const boneModel = (slug: string) => BONE_MODELS.get(slug);
export const jointModel = (slug: string) => JOINT_MODELS.get(slug);
export const skeletonUrl = () => modelUrl(SKELETON.file);

/** Kilobytes, for the "this model is N KB" note shown before a 3D load. */
export const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;
