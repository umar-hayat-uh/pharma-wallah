/**
 * Mock practical presets — the lab's "admin-controlled" exam configuration.
 *
 * There is no admin screen and no database table for this (none exists, and the
 * Supabase schema is not in the repo); whoever maintains the lab edits this file and
 * deploys. Every number below is a sensible default for practice. NONE of it is a
 * university's official examination format, and the page says so.
 *
 * The server reads a preset by id when it starts an exam, so a client can choose a
 * preset but cannot change its station count, time or marks.
 */
import type { Region } from "./types";

export type QType =
  | "identify-bone" // a render of a bone: which bone is it?
  | "bone-side" // a render of a paired bone: right or left?
  | "landmark" // a render with a marker on a Z-Anatomy anchor: name the structure
  | "articulating-bone" // which bone articulates with this surface?
  | "identify-joint" // a render of a joint model: which joint?
  | "classify-joint" // structural / synovial-subtype classification
  | "joint-bones" // which bones form this joint?
  | "ligament" // a render with one ligament highlighted: name it
  | "written"; // a hand-written MCQ from the content (functions, movements, viva points)

export const SPOTTING_TYPES: QType[] = ["identify-bone", "bone-side", "landmark", "identify-joint", "ligament"];
export const BONE_TYPES: QType[] = ["identify-bone", "bone-side", "landmark", "articulating-bone"];
export const JOINT_TYPES: QType[] = ["identify-joint", "classify-joint", "joint-bones", "ligament"];

export const TYPE_LABEL: Record<QType, string> = {
  "identify-bone": "Identify the bone",
  "bone-side": "Determine the side",
  landmark: "Identify the landmark",
  "articulating-bone": "Name the articulating bone",
  "identify-joint": "Identify the joint",
  "classify-joint": "Classify the joint",
  "joint-bones": "Bones forming the joint",
  ligament: "Identify the ligament",
  written: "Viva / short answer",
};

export type ExamPreset = {
  id: string;
  title: string;
  description: string;
  regions: Region[];
  /** Which content the written questions may come from. */
  scope: "bones" | "joints" | "both";
  types: QType[];
  stations: number;
  /** Whole-exam time limit. */
  minutes: number;
  /** Marks for a correct answer; a wrong or blank answer scores 0 (no negative marking). */
  marksPerStation: number;
};

const ALL: Region[] = ["upper-limb", "lower-limb", "axial"];

export const EXAM_PRESETS: ExamPreset[] = [
  {
    id: "full",
    title: "Full practical simulation",
    description: "Spotting stations, bones, joints and viva questions from the whole lab.",
    regions: ALL, scope: "both",
    types: [...SPOTTING_TYPES, "articulating-bone", "classify-joint", "joint-bones", "written"],
    stations: 30, minutes: 30, marksPerStation: 2,
  },
  {
    id: "upper-limb",
    title: "Upper limb",
    description: "Bones and joints of the upper limb, spotting and viva.",
    regions: ["upper-limb"], scope: "both",
    types: [...SPOTTING_TYPES, "articulating-bone", "classify-joint", "joint-bones", "written"],
    stations: 20, minutes: 20, marksPerStation: 1,
  },
  {
    id: "lower-limb",
    title: "Lower limb",
    description: "Pelvis and lower-limb bones and joints, spotting and viva.",
    regions: ["lower-limb"], scope: "both",
    types: [...SPOTTING_TYPES, "articulating-bone", "classify-joint", "joint-bones", "written"],
    stations: 20, minutes: 20, marksPerStation: 1,
  },
  {
    id: "mixed",
    title: "Mixed osteology & arthrology",
    description: "Everything, shuffled: a shorter all-round check.",
    regions: ALL, scope: "both",
    types: [...SPOTTING_TYPES, "articulating-bone", "classify-joint", "joint-bones", "written"],
    stations: 20, minutes: 20, marksPerStation: 1,
  },
  {
    id: "bones",
    title: "Bones only",
    description: "Identification, side, landmarks and articulations.",
    regions: ALL, scope: "bones", types: [...BONE_TYPES, "written"],
    stations: 20, minutes: 18, marksPerStation: 1,
  },
  {
    id: "joints",
    title: "Joints only",
    description: "Identify, classify, bones and ligaments of each joint.",
    regions: ALL, scope: "joints", types: [...JOINT_TYPES, "written"],
    stations: 20, minutes: 18, marksPerStation: 1,
  },
  {
    id: "spotting",
    title: "Spotting only",
    description: "Image stations only: bone, side, landmark, joint and ligament.",
    regions: ALL, scope: "both", types: SPOTTING_TYPES,
    stations: 20, minutes: 15, marksPerStation: 1,
  },
  {
    id: "viva",
    title: "Viva only",
    description: "Written viva-style questions on functions, movements and classification.",
    regions: ALL, scope: "both", types: ["written", "classify-joint", "joint-bones"],
    stations: 20, minutes: 15, marksPerStation: 1,
  },
];

export const getPreset = (id: string) => EXAM_PRESETS.find((p) => p.id === id);

/** Untimed practice: the student picks regions and types; only the length is fixed. */
export const PRACTICE_LENGTH = 15;
/** Server-side allowance for network delay when an exam is submitted at the bell. */
export const SUBMIT_GRACE_SECONDS = 45;
