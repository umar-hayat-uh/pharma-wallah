import { HUB_SUBJECTS } from "@/app/(site)/calculation-tools/tool-index";
import { CATEGORIES, TOOL_NAMES, toolShortName } from "./tool-registry";
import { TOOL_SLUGS } from "../_generated/tool-slugs";

/**
 * The app's catalogue, assembled once: the categories from tool-registry.ts
 * (with the "More Tools" drift guard), plus a one-line description for each
 * tool borrowed from the web hub's registry. Tools the web hub does not list
 * fall back to their category's description.
 */

export type AppTool = {
  slug: string;
  name: string;
  short: string;
  desc: string;
  category: string;
};

export type AppGroup = { id: string; label: string; desc: string; tools: AppTool[] };

const HUB_DESC = new Map(HUB_SUBJECTS.flatMap((s) => s.tools.map((t) => [t.slug, t.desc] as const)));

/** The two camera tools, featured on the home screen. */
export const FEATURED = ["rf-value-calculator", "cfu-calculator"] as const;

function build(): AppGroup[] {
  const shipped = new Set<string>(TOOL_SLUGS as readonly string[]);
  const claimed = new Set(CATEGORIES.flatMap((c) => c.slugs));
  const tool = (slug: string, category: string, fallback: string): AppTool => ({
    slug,
    name: TOOL_NAMES[slug] ?? slug,
    short: toolShortName(slug),
    desc: HUB_DESC.get(slug) ?? fallback,
    category,
  });
  const groups: AppGroup[] = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    desc: c.desc,
    tools: c.slugs.filter((s) => shipped.has(s)).map((s) => tool(s, c.id, c.desc)),
  })).filter((g) => g.tools.length > 0);

  // Anything the build shipped that no category claims — never lost, only uncategorised.
  const unclaimed = (TOOL_SLUGS as readonly string[]).filter((s) => !claimed.has(s));
  if (unclaimed.length > 0) {
    groups.push({
      id: "more",
      label: "More Tools",
      desc: "Recently added calculators",
      tools: unclaimed.map((s) => tool(s, "more", "Recently added calculator")),
    });
  }
  return groups;
}

export const GROUPS: AppGroup[] = build();
export const ALL_TOOLS: AppTool[] = GROUPS.flatMap((g) => g.tools);
export const TOOL_BY_SLUG = new Map(ALL_TOOLS.map((t) => [t.slug, t]));
export const SLUG_SET: ReadonlySet<string> = new Set(ALL_TOOLS.map((t) => t.slug));
export const TOTAL = ALL_TOOLS.length;

/** Folds subscripts, dashes and case so "c1v1" finds "C₁V₁". */
function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080))
    .replace(/[‐-―−]/g, "-");
}

export function searchTools(query: string): AppTool[] {
  const needle = fold(query.trim());
  if (!needle) return [];
  const words = needle.split(/\s+/);
  const scored = ALL_TOOLS.map((t) => {
    const name = fold(t.name);
    const hay = `${name} ${fold(t.desc)} ${t.slug.toLowerCase()}`;
    if (!words.every((w) => hay.includes(w))) return null;
    // Names that start with the query first, then name matches, then description matches.
    const score = name.startsWith(needle) ? 0 : name.includes(needle) ? 1 : 2;
    return { t, score };
  }).filter((x): x is { t: AppTool; score: number } => x !== null);
  scored.sort((a, b) => a.score - b.score || a.t.name.localeCompare(b.t.name));
  return scored.map((x) => x.t);
}
