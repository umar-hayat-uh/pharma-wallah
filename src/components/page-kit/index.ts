/**
 * Shared page kit — the non-calculator half of the 2026-09-13 design language.
 *
 * The calculator kit (`@/components/calculators`) frames a tool; this frames a
 * page: a hero, titled sections, ruled figure rows, and designed empty /
 * loading / error states. Both build on `@/components/ui` and share one visual
 * vocabulary — warm board white #fcfcfa, ink #16181d text, the brand
 * blue→green gradient for any strong surface (./brand.ts — never a black ground),
 * brandBlue #1C7BD9 as a sparse signal, hairline rules, mono eyebrows,
 * tabular figures, the expo easing.
 *
 * Dependency-free (react, next/link, lucide-react, cn). Everything except
 * `Reveal` is server-component safe. Tracked in .claude/redesign-tracker.md.
 */
export { Eyebrow } from "./Eyebrow";
export { PageHero, Trail, type TrailItem } from "./PageHero";
export { PageSection } from "./PageSection";
export { Figure, FigureRow, type FigureProps } from "./Figures";
export { EmptyState, ErrorState, LoadingState } from "./States";
export { Reveal } from "./Reveal";
export { BRAND_GRADIENT, BRAND_SURFACE, BRAND_BUTTON, BRAND_BUTTON_HOVER } from "./brand";
