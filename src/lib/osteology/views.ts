/**
 * Camera presets in anatomical words. Model frame (export-zanatomy.py): +Y superior,
 * +Z anterior, −X the body's right. "Lateral" therefore depends on the side being shown:
 * for a right bone lateral is −X; for a left bone (the right model mirrored) it is +X.
 */
type Dir = [number, number, number];
export type ViewPreset = { id: string; label: string; dir: Dir };

const ANT: Dir = [0, 0, 1];
const POST: Dir = [0, 0, -1];
const SUP: Dir = [0, 1, 0];
const INF: Dir = [0, -1, 0];

/** Bones viewed from above or below first, as they are usually studied. */
const FIRST: Record<string, string> = {
  clavicle: "superior", "typical-vertebra": "superior", atlas: "superior",
  tarsals: "superior", metatarsals: "superior", "foot-phalanges": "superior",
  "hip-bone": "lateral", fibula: "lateral",
};

const HAND = new Set(["carpals", "metacarpals", "hand-phalanges"]);
const FOOT = new Set(["tarsals", "metatarsals", "foot-phalanges"]);

export function boneViews(slug: string, sideType: "paired" | "midline", left: boolean): ViewPreset[] {
  const lat: Dir = left ? [1, 0, 0] : [-1, 0, 0];
  const med: Dir = left ? [-1, 0, 0] : [1, 0, 0];
  const hand = HAND.has(slug);
  const foot = FOOT.has(slug);
  const views: ViewPreset[] = [
    { id: "anterior", label: hand ? "Palmar (front)" : "Front (anterior)", dir: ANT },
    { id: "posterior", label: hand ? "Dorsal (back)" : "Back (posterior)", dir: POST },
    ...(sideType === "paired"
      ? [
          { id: "lateral", label: "Outer side (lateral)", dir: lat },
          { id: "medial", label: "Inner side (medial)", dir: med },
        ]
      : [
          { id: "right", label: "Right side", dir: [-1, 0, 0] as Dir },
          { id: "left", label: "Left side", dir: [1, 0, 0] as Dir },
        ]),
    { id: "superior", label: foot ? "Top (dorsal)" : "Top (superior)", dir: SUP },
    { id: "inferior", label: foot ? "Sole (plantar)" : "Bottom (inferior)", dir: INF },
  ];
  const first = FIRST[slug];
  if (!first) return views;
  const i = views.findIndex((v) => v.id === first);
  return i > 0 ? [views[i], ...views.slice(0, i), ...views.slice(i + 1)] : views;
}

const JOINT_FIRST: Record<string, string> = {
  acromioclavicular: "superior", ankle: "lateral", "hand-interphalangeal": "lateral",
  tarsometatarsal: "superior", metatarsophalangeal: "superior", "foot-interphalangeal": "superior",
};
const MIDLINE_JOINTS = new Set(["pubic-symphysis", "sacroiliac"]);

export function jointViews(slug: string): ViewPreset[] {
  const views: ViewPreset[] = [
    { id: "anterior", label: "Front (anterior)", dir: ANT },
    { id: "posterior", label: "Back (posterior)", dir: POST },
    ...(MIDLINE_JOINTS.has(slug)
      ? [
          { id: "right", label: "Right side", dir: [-1, 0, 0] as Dir },
          { id: "left", label: "Left side", dir: [1, 0, 0] as Dir },
        ]
      : [
          { id: "lateral", label: "Outer side (lateral)", dir: [-1, 0, 0] as Dir },
          { id: "medial", label: "Inner side (medial)", dir: [1, 0, 0] as Dir },
        ]),
    { id: "superior", label: "Top (superior)", dir: SUP },
    { id: "inferior", label: "Bottom (inferior)", dir: INF },
  ];
  const first = JOINT_FIRST[slug];
  if (!first) return views;
  const i = views.findIndex((v) => v.id === first);
  return i > 0 ? [views[i], ...views.slice(0, i), ...views.slice(i + 1)] : views;
}
