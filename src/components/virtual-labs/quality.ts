/**
 * Rendering quality tiers, shared by both 3D engines (three.js for three rooms, Babylon.js
 * for Pharmaceutical Chemistry since 2026-10-22). Moved out of `three/runtime.ts` so the
 * Babylon chunk does not import three.js to read two numbers.
 */
import type { Quality } from "./three/types";

/**
 * Per tier: the largest device-pixel ratio used, and a drawing-buffer budget in
 * megapixels. A 390×844 phone at 3× is 2.96 MP: Balanced draws it at 2× (1.3 MP, sharp),
 * Low at 1.5× (0.74 MP). A 1440×900 laptop at 2× (5.2 MP) is held to the budget instead
 * of drawing every pixel. Antialiasing stays on except at Low on dense (≥ 2×) screens,
 * where the pixel density hides the stair-steps anyway.
 */
export const QUALITY: Record<Quality, { maxDpr: number; budgetMP: number; shadow: number; anisotropy: number }> = {
  low: { maxDpr: 1.5, budgetMP: 1.0, shadow: 0, anisotropy: 2 },
  medium: { maxDpr: 2, budgetMP: 2.4, shadow: 1024, anisotropy: 4 },
  high: { maxDpr: 2.5, budgetMP: 4.2, shadow: 2048, anisotropy: 8 },
};

export function pixelRatioFor(q: Quality, cssW: number, cssH: number, dpr: number) {
  const { maxDpr, budgetMP } = QUALITY[q];
  const want = Math.min(dpr || 1, maxDpr);
  const fit = Math.sqrt((budgetMP * 1e6) / Math.max(1, cssW * cssH));
  return Math.max(1, Math.min(want, fit));
}
