/**
 * The brand surface: brandBlue #1C7BD9 → brandGreen #21B67A.
 *
 * The user's rule (2026-09-13): PharmaWallah's theme is the blue→green
 * gradient, not black and white — anywhere a design reaches for a dark/ink
 * ground, it uses this instead.
 *
 * Raw brandGreen is too light for white text (2.61:1), so every surface that
 * carries text lays a navy scrim over the gradient. The two strengths are
 * computed, not eyeballed (WCAG contrast of white at the green end):
 *   SURFACE — 40% scrim, white 5.72:1, white/90 ≈ 5:1. Panels, heroes, bands
 *             with body text and small mono labels. Matches the site footer.
 *   BUTTON  — 30% scrim, white 4.60:1. A 15px semibold label on a control; a
 *             touch brighter so the action reads as the brand, not as a panel.
 * Use white (or white/90 minimum) for text on either; never green on it.
 *
 * Plain strings for `style={{ background }}`: Tailwind can't generate a
 * layered gradient from a class without a config change, and the dev server
 * caches tailwind.config.ts (MEMORY.md gotcha 26).
 */
const GRADIENT = "linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)";

export const BRAND_GRADIENT = GRADIENT;
export const BRAND_SURFACE = `linear-gradient(rgba(6,18,36,.40), rgba(6,18,36,.40)), ${GRADIENT}`;
export const BRAND_BUTTON = `linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), ${GRADIENT}`;
/** Pressed/hover state for a BUTTON — darker, so contrast only improves. */
export const BRAND_BUTTON_HOVER = `linear-gradient(rgba(6,18,36,.42), rgba(6,18,36,.42)), ${GRADIENT}`;
