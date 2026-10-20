/**
 * Compound-microscope optics and the virtual powder slide for the Pharmacognosy lab.
 *
 * Optics are standard bright-field relationships:
 *   field of view (mm) = eyepiece field number (mm) ÷ objective magnification
 *   total magnification = objective × eyepiece (10×)
 * Depth of field and the smallest element a student can recognise at each objective are
 * TEACHING VALUES of the right order for a student microscope (stated in the lab's briefing).
 *
 * The slide is a deterministic scatter of powder elements generated from the run's seed,
 * so the same run always shows the same field. What the elements are — and which are
 * absent — comes from the drug's reference monograph data in experiments/clove.ts.
 */
import { rand } from "../engine/machine";

export const EYEPIECE = { magnification: 10, fieldNumberMm: 18 };

export interface ObjectiveDef {
  mag: 4 | 10 | 40;
  na: number;
  /** Depth of field used by the model, µm. */
  dofUm: number;
  /** Smallest element dimension (µm) recognisable at this objective. */
  minUm: number;
}

export const OBJECTIVES: Record<4 | 10 | 40, ObjectiveDef> = {
  4: { mag: 4, na: 0.1, dofUm: 45, minUm: 60 },
  10: { mag: 10, na: 0.25, dofUm: 12, minUm: 20 },
  40: { mag: 40, na: 0.65, dofUm: 3, minUm: 5 },
};

export const fieldOfViewUm = (mag: 4 | 10 | 40) => (EYEPIECE.fieldNumberMm / mag) * 1000;
export const totalMagnification = (mag: 4 | 10 | 40) => mag * EYEPIECE.magnification;

/** The region of the slide covered by the mount, µm (origin at the coverslip centre). */
export const MOUNT = { halfW: 2400, halfH: 1800 };

export interface SlideElement {
  id: number;
  type: string;
  x: number; // µm
  y: number; // µm
  size: number; // characteristic dimension, µm
  rot: number; // radians
  z: number; // offset from the specimen's mean focal plane, µm
  variant: number; // 0–1, drives drawing variety
}

export interface ElementSpec {
  type: string;
  /** Count in a correctly sized ("small") mount. */
  count: number;
  size: [number, number]; // µm range
  /** Needs clearing (chloral hydrate + warming) to be recognisable. */
  needsClearing?: boolean;
}

/** Deterministic slide. `amount` scales the count: a heaped mount overlaps and buries elements. */
export function generateSlide(seed: number, specs: ElementSpec[], amount: "small" | "large"): SlideElement[] {
  const k = amount === "large" ? 3 : 1;
  const out: SlideElement[] = [];
  let id = 0;
  specs.forEach((spec, si) => {
    const n = spec.count * k;
    for (let i = 0; i < n; i++) {
      const r = (j: number) => rand(seed, 500 + si, i, j);
      out.push({
        id: id++,
        type: spec.type,
        x: (r(1) * 2 - 1) * MOUNT.halfW,
        y: (r(2) * 2 - 1) * MOUNT.halfH,
        size: spec.size[0] + r(3) * (spec.size[1] - spec.size[0]),
        rot: r(4) * Math.PI * 2,
        z: (r(5) - 0.5) * 6,
        variant: r(6),
      });
    }
  });
  return out;
}

export interface ScopeView {
  mag: 4 | 10 | 40;
  stageX: number; // µm, the slide point under the optical axis
  stageY: number;
  focusErrUm: number; // focus position minus the specimen's focal plane
  light: boolean;
  slideOn: boolean;
}

/**
 * Elements a student can actually recognise in this view: inside the circular field,
 * in focus (within the depth of field) and large enough for the objective.
 */
export function recognisable(view: ScopeView, els: SlideElement[], cleared: boolean, specs: ElementSpec[]): SlideElement[] {
  if (!view.slideOn || !view.light) return [];
  const obj = OBJECTIVES[view.mag];
  const r = fieldOfViewUm(view.mag) / 2;
  const needClear = new Set(specs.filter((s) => s.needsClearing).map((s) => s.type));
  return els.filter((e) => {
    const dx = e.x - view.stageX;
    const dy = e.y - view.stageY;
    if (dx * dx + dy * dy > r * r) return false;
    if (Math.abs(view.focusErrUm - e.z) > obj.dofUm) return false;
    if (e.size < obj.minUm) return false;
    if (!cleared && needClear.has(e.type)) return false;
    return true;
  });
}

/** Blur radius (in screen pixels for a 400 px field) from defocus — for the renderer. */
export function blurPx(view: ScopeView): number {
  const obj = OBJECTIVES[view.mag];
  return Math.min(14, (Math.abs(view.focusErrUm) / obj.dofUm) * 1.6);
}
