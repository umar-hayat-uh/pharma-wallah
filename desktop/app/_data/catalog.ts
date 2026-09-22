/**
 * The calculator catalogue for the Windows app.
 *
 * Deliberately RE-EXPORTS the Android app's registry rather than copying it.
 * That registry is already the maintained mapping from tool directory → display
 * name → category, it is pure data with no React and no environment access, and
 * a single copy means adding a calculator updates both packaged targets at once.
 * If `mobile/` is ever removed, move that file rather than duplicating it.
 *
 * The category list is the registry's own ten, not an invented taxonomy: those
 * are the categories the 104 calculators actually fall into (spec §19 asks for
 * categories that correspond to the existing calculators, and these do).
 *
 * Drift is handled, not assumed: `desktop/app/_generated/tool-slugs.ts` is
 * regenerated from the directory listing on every desktop build, and anything
 * missing from the registry is shown under "More tools". A new calculator can
 * therefore never become unreachable in the desktop app.
 */

import {
  CATEGORIES,
  TOOL_NAMES,
  toolShortName,
  type ToolCategory,
} from "../../../mobile/app/_data/tool-registry";
import { TOOL_SLUGS } from "../_generated/tool-slugs";

export { CATEGORIES, TOOL_NAMES, toolShortName };
export type { ToolCategory };

/** Every calculator directory that shipped in this build. */
export const ALL_SLUGS: readonly string[] = TOOL_SLUGS;
const SLUG_SET = new Set<string>(TOOL_SLUGS);

/** A one-line "what it computes", keyed by category — used on the index cards. */
export const CATEGORY_BLURB: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.desc]),
);

export type CatalogGroup = { id: string; label: string; desc: string; slugs: string[] };

/**
 * The categories, filtered to what this build actually contains, plus a final
 * "More tools" group for any directory the registry has not been told about.
 */
export function catalogGroups(): CatalogGroup[] {
  const grouped: CatalogGroup[] = [];
  const claimed = new Set<string>();

  for (const category of CATEGORIES) {
    const slugs = category.slugs.filter((slug) => SLUG_SET.has(slug));
    for (const slug of slugs) claimed.add(slug);
    if (slugs.length > 0) {
      grouped.push({ id: category.id, label: category.label, desc: category.desc, slugs });
    }
  }

  const leftover = TOOL_SLUGS.filter((slug) => !claimed.has(slug));
  if (leftover.length > 0) {
    grouped.push({
      id: "more",
      label: "More tools",
      desc: "Calculators not yet filed in a category.",
      slugs: [...leftover],
    });
  }

  return grouped;
}

/** Display name for a slug, falling back to the slug so nothing renders blank. */
export function toolName(slug: string): string {
  return TOOL_NAMES[slug] ?? slug;
}

/** The route for a tool inside the desktop app. The export uses trailing slashes. */
export function toolHref(slug: string): string {
  return `/calculation-tools/${slug}/`;
}

/** Which category a slug belongs to, for the breadcrumb above an open tool. */
export function categoryOf(slug: string): CatalogGroup | undefined {
  return catalogGroups().find((group) => group.slugs.includes(slug));
}

const fold = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Local search over names, short names and slugs. Ranked, never fuzzy-guessy. */
export function searchTools(query: string): string[] {
  const q = fold(query);
  if (!q) return [];
  const scored: { slug: string; score: number }[] = [];

  for (const slug of TOOL_SLUGS) {
    const name = fold(toolName(slug));
    const short = fold(toolShortName(slug));
    const key = fold(slug);
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (short.startsWith(q)) score = 75;
    else if (name.includes(q)) score = 55;
    else if (short.includes(q)) score = 50;
    else if (key.includes(q)) score = 40;
    if (score) scored.push({ slug, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || toolName(a.slug).localeCompare(toolName(b.slug)))
    .map((entry) => entry.slug);
}
