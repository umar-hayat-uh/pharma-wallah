/**
 * Osteology & Arthrology Lab — the shape of the anatomy content.
 *
 * Content is plain typed data (src/lib/osteology/bones/*.ts, joints/*.ts), kept apart
 * from the 3D rendering (src/components/osteology/) and from the question engine
 * (questions.ts), so a bone or joint is added by writing one data file and
 * registering it in registry.ts.
 *
 * Two names tie the prose to the 3D models and must match the export exactly
 * (scripts/osteology.test.mts checks both):
 *  - `Landmark.zName`   a landmark name in generated/models.json for this bone's model —
 *                       its 3D marker is the point the Z-Anatomy anatomist placed;
 *  - `JointStructure.zName` / `JointBone.zName`  a mesh name in that joint's model.
 * Where no `zName` is given the item is taught from the text list only, and the
 * viewer says so: we never place a marker we cannot source.
 *
 * Plain data, no "use client": imported by server pages, client components and tests.
 */
import type { ReferenceId } from "@/lib/content/references";

export type Region = "upper-limb" | "lower-limb" | "axial";

export type QA = { q: string; a: string };

/** A four-option MCQ written by hand (not generated). `answer` indexes `options`. */
export type WrittenMcq = {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
};

export type LandmarkKind =
  | "head" | "neck" | "shaft" | "end" | "surface" | "border" | "angle" | "process" | "spine"
  | "tubercle" | "tuberosity" | "trochanter" | "condyle" | "epicondyle" | "facet" | "fossa"
  | "notch" | "groove" | "foramen" | "line" | "crest" | "other";

export type Landmark = {
  /** kebab-case, unique within the bone. */
  id: string;
  /** English anatomical term as taught (TA2 where it has one). */
  name: string;
  /** Z-Anatomy label name in models.json, when the model has a marker for it. */
  zName?: string;
  /** For a group model (carpals, metatarsals …): the mesh the landmark is on. */
  mesh?: string;
  kind: LandmarkKind;
  /** One or two plain sentences: what it is. */
  definition: string;
  /** Where it is, in anatomical directions, as a student would find it on a specimen. */
  location: string;
  /** Why it matters: function, attachment, articulation, or how it is used in identification. */
  significance: string;
  /** Articulation or attachment, if any. */
  related?: string;
  viva?: QA;
  /** Shown only after "Show advanced landmarks" (progressive disclosure). */
  advanced?: boolean;
};

export type Attachment = {
  structure: string;
  kind: "origin" | "insertion" | "ligament" | "other";
  site: string;
};

export type Articulation = {
  /** The other bone. */
  with: string;
  withSlug?: string;
  /** Joint name, and its page if the lab has one. */
  joint: string;
  jointSlug?: string;
  /** The surface on THIS bone. */
  surface: string;
};

export type BoneContent = {
  slug: string;
  name: string;
  /** Latin term (TA). */
  latin: string;
  /** Other names a student might type ("collar bone"); used for typed answers. */
  aka: string[];
  region: Region;
  /** Sub-region heading in the library: "Shoulder girdle", "Forearm", "Hand", "Pelvis" … */
  group: string;
  /** Long / short / flat / irregular / sesamoid, with a word of why. */
  classification: string;
  /** "paired" bones have a side; "midline" bones do not. */
  sideType: "paired" | "midline";
  /** A group of bones taught together (carpals, metacarpals …). */
  isGroup?: boolean;
  /** Members of a group, or parts of one bone (ends, shaft), in reading order. */
  parts: { name: string; description: string }[];
  /** One or two sentences: what this bone is and where it sits. */
  summary: string;
  /** How to hold it in the anatomical position before reading anything else. */
  orientation: string[];
  /**
   * Steps to tell right from left. For a midline bone, `steps` explains how to orient it
   * instead, and `note` says why side does not apply.
   */
  sideDetermination: { steps: string[]; note?: string };
  landmarks: Landmark[];
  attachments: Attachment[];
  articulations: Articulation[];
  functions: string[];
  clinical: string[];
  examQuestions: QA[];
  tips: string[];
  mistakes: string[];
  revision: string[];
  mcqs: WrittenMcq[];
  refs: ReferenceId[];
};

export type JointBone = {
  name: string;
  slug?: string;
  /** Mesh name in the joint's model. */
  zName?: string;
};

export type JointStructure = {
  name: string;
  /** Mesh name in the joint's model, if it is modelled. */
  zName?: string;
  /** Attachments, for a ligament; position, for a disc / labrum / meniscus. */
  attachments: string;
  role: string;
};

export type Movement = {
  /** "Flexion", "Pronation", "Opposition" … only the movements this joint really has. */
  name: string;
  description: string;
  /** Main muscles producing it (prime movers first). Empty where none act directly. */
  muscles: string[];
};

export type JointContent = {
  slug: string;
  name: string;
  aka: string[];
  region: Region;
  /** Where it is, in one sentence. */
  location: string;
  summary: string;
  bones: JointBone[];
  /** The specific surfaces that meet ("head of humerus with the glenoid cavity of the scapula"). */
  surfaces: string[];
  /** Fibrous / cartilaginous / synovial, with the subtype in words. */
  structural: string;
  /** Synarthrosis / amphiarthrosis / diarthrosis. */
  functional: string;
  /** Plane, hinge, pivot, condylar, ellipsoid, saddle, ball-and-socket; null if not synovial. */
  synovialSubtype: string | null;
  /** Uniaxial / biaxial / multiaxial / non-axial, or null where it does not apply. */
  axes: string | null;
  capsule: string | null;
  /** Discs, labra, menisci, fat pads, bursae … */
  special: JointStructure[];
  ligaments: JointStructure[];
  /**
   * For a joint that is really several (proximal + distal radioulnar, the knee's
   * articulations, first vs other CMC joints): each component, separately.
   */
  components: { name: string; type: string; bones: string; notes: string }[];
  movements: Movement[];
  /** Only for movements that are not at this joint but are often wrongly placed here. */
  notHere?: string[];
  functions: string[];
  stability: string;
  clinical: string[];
  /** What examiners look for; how this joint is told apart from its neighbours. */
  examPoints: string[];
  viva: QA[];
  mistakes: string[];
  revision: string[];
  mcqs: WrittenMcq[];
  related: string[];
  refs: ReferenceId[];
};
