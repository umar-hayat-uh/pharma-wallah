import type { Guide, GuideBlock } from "./types";
import { guide as dilution } from "./content/dilution-and-concentration";
import { guide as kinetics } from "./content/reaction-kinetics-drug-stability";
import { guide as analysis } from "./content/accuracy-precision-recovery";
import { guide as pk } from "./content/pharmacokinetic-parameters";
import { guide as dosing } from "./content/dose-calculations";

/**
 * The guide registry. Order is the order on /guides. A guide in `draft` is not
 * listed, not in the sitemap and its URL 404s — see `publishedGuides`.
 */
const ALL: Guide[] = [dilution, dosing, kinetics, analysis, pk];

export const GUIDES: Guide[] = ALL.filter((g) => g.meta.review.status !== "draft");

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

function blockText(b: GuideBlock): string {
  switch (b.kind) {
    case "p":
      return b.text;
    case "formula":
      return [b.expr, b.note ?? "", ...(b.where ?? []).map((w) => `${w.sym} ${w.meaning}`)].join(" ");
    case "list":
      return b.items.join(" ");
    case "table":
      return [b.caption, ...b.head, ...b.rows.flat()].join(" ");
    case "callout":
      return `${b.title ?? ""} ${b.text}`;
    case "example":
      return [b.title, b.problem, ...b.steps, b.answer, b.note ?? ""].join(" ");
  }
}

/** Words of teaching text, counted rather than claimed. */
export function guideWordCount(g: Guide): number {
  const text = [
    ...g.objectives,
    ...g.intro,
    ...g.terms.flatMap((t) => [t.term, t.definition]),
    ...g.sections.flatMap((s) => [s.heading, ...s.blocks.map(blockText)]),
    ...g.mistakes,
    ...g.practice.flatMap((p) => [p.q, p.answer, ...p.working]),
    ...g.limitations,
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** ~200 words a minute for technical prose with arithmetic in it. */
export function readingMinutes(g: Guide): number {
  return Math.max(1, Math.round(guideWordCount(g) / 200));
}
