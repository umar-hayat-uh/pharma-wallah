/**
 * Osteology & Arthrology Lab — the one list of bones and joints.
 *
 * Order here is the order the library shows. To add a bone or joint: write its data file
 * (types.ts documents the shape), add a model to scripts/osteology/zanatomy-specs.json and
 * re-run the export (scripts/osteology/README.md), then add one line below.
 *
 * Plain data: safe for server pages, client components, API routes and tests.
 */
import type { BoneContent, JointContent, Region } from "./types";

import { bone as clavicle } from "./bones/clavicle";
import { bone as scapula } from "./bones/scapula";
import { bone as humerus } from "./bones/humerus";
import { bone as radius } from "./bones/radius";
import { bone as ulna } from "./bones/ulna";
import { bone as carpals } from "./bones/carpals";
import { bone as metacarpals } from "./bones/metacarpals";
import { bone as handPhalanges } from "./bones/hand-phalanges";
import { bone as hipBone } from "./bones/hip-bone";
import { bone as femur } from "./bones/femur";
import { bone as patella } from "./bones/patella";
import { bone as tibia } from "./bones/tibia";
import { bone as fibula } from "./bones/fibula";
import { bone as tarsals } from "./bones/tarsals";
import { bone as metatarsals } from "./bones/metatarsals";
import { bone as footPhalanges } from "./bones/foot-phalanges";
import { bone as typicalVertebra } from "./bones/typical-vertebra";
import { bone as atlas } from "./bones/atlas";
import { bone as axis } from "./bones/axis";
import { bone as sternum } from "./bones/sternum";
import { bone as rib } from "./bones/rib";
import { bone as sacrum } from "./bones/sacrum";

import { joint as sternoclavicular } from "./joints/sternoclavicular";
import { joint as acromioclavicular } from "./joints/acromioclavicular";
import { joint as glenohumeral } from "./joints/glenohumeral";
import { joint as elbow } from "./joints/elbow";
import { joint as wrist } from "./joints/wrist";
import { joint as radioulnar } from "./joints/radioulnar";
import { joint as carpometacarpal } from "./joints/carpometacarpal";
import { joint as metacarpophalangeal } from "./joints/metacarpophalangeal";
import { joint as handInterphalangeal } from "./joints/hand-interphalangeal";
import { joint as sacroiliac } from "./joints/sacroiliac";
import { joint as pubicSymphysis } from "./joints/pubic-symphysis";
import { joint as hip } from "./joints/hip";
import { joint as knee } from "./joints/knee";
import { joint as ankle } from "./joints/ankle";
import { joint as tarsometatarsal } from "./joints/tarsometatarsal";
import { joint as metatarsophalangeal } from "./joints/metatarsophalangeal";
import { joint as footInterphalangeal } from "./joints/foot-interphalangeal";

export const BONES: BoneContent[] = [
  clavicle, scapula, humerus, radius, ulna, carpals, metacarpals, handPhalanges,
  hipBone, femur, patella, tibia, fibula, tarsals, metatarsals, footPhalanges,
  typicalVertebra, atlas, axis, sternum, rib, sacrum,
];

export const JOINTS: JointContent[] = [
  sternoclavicular, acromioclavicular, glenohumeral, elbow, wrist, radioulnar,
  carpometacarpal, metacarpophalangeal, handInterphalangeal,
  sacroiliac, pubicSymphysis, hip, knee, ankle, tarsometatarsal, metatarsophalangeal, footInterphalangeal,
];

export const REGION_LABEL: Record<Region, string> = {
  "upper-limb": "Upper limb",
  "lower-limb": "Pelvis & lower limb",
  axial: "Axial skeleton",
};

export const REGIONS: Region[] = ["upper-limb", "lower-limb", "axial"];

const boneMap = new Map(BONES.map((b) => [b.slug, b]));
const jointMap = new Map(JOINTS.map((j) => [j.slug, j]));

export const getBone = (slug: string) => boneMap.get(slug);
export const getJoint = (slug: string) => jointMap.get(slug);

/** Joints a bone takes part in: those it names, plus those that name it. */
export function jointsOfBone(slug: string): JointContent[] {
  const bone = boneMap.get(slug);
  const named = new Set(bone?.articulations.map((a) => a.jointSlug).filter(Boolean) as string[]);
  return JOINTS.filter((j) => named.has(j.slug) || j.bones.some((b) => b.slug === slug));
}

export const boneHref = (slug: string) => `/osteology-lab/bones/${slug}`;
export const jointHref = (slug: string) => `/osteology-lab/joints/${slug}`;
