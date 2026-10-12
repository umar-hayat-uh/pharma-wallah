import type { ContentMeta } from "@/lib/content/governance";
import type { ReferenceId } from "@/lib/content/references";

/**
 * A long-form educational guide under /guides/<slug> (added 2026-10-12).
 *
 * Content is typed data, rendered by one server component
 * (`src/components/guides/GuideArticle.tsx`), so every guide has the same
 * accessible structure, its own metadata and Article/Breadcrumb JSON-LD, and a
 * sitemap entry, without any guide writing markup. Text is plain strings with
 * Unicode sub/superscripts (C₁, 10⁻³) — no HTML, no markdown — so nothing in a
 * guide can break the page or inject markup.
 *
 * Rules for content (docs/content-review-policy.md):
 *  - every number in an example or practice answer is recomputed independently;
 *  - references are ids from src/lib/content/references.ts, never free text;
 *  - `relatedTools` are calculator directory slugs that exist and whose maths
 *    agrees with the guide. A tool with a recorded formula fault is linked only
 *    when the fault is on a path the guide does not send the student to (the
 *    order-kinetics tool's mixed mode, for example).
 */

export type GuideBlock =
  | { kind: "p"; text: string }
  | { kind: "formula"; expr: string; where?: { sym: string; meaning: string }[]; note?: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "table"; caption: string; head: string[]; rows: string[][] }
  | { kind: "callout"; tone: "note" | "caution"; title?: string; text: string }
  | {
      kind: "example";
      title: string;
      problem: string;
      steps: string[];
      answer: string;
      note?: string;
    };

export type GuideSection = {
  /** In-page anchor. */
  id: string;
  heading: string;
  blocks: GuideBlock[];
};

export type PracticeQuestion = {
  q: string;
  /** The final answer, with units. */
  answer: string;
  /** How to get there, step by step. */
  working: string[];
};

export type Guide = {
  slug: string;
  title: string;
  /** Meta description and card text: one or two sentences, under ~160 characters. */
  description: string;
  /** Which part of the syllabus it belongs to, e.g. "Pharmaceutics". */
  category: string;
  /** What a student can do after reading — "Calculate…", "Explain…". */
  objectives: string[];
  /** Opening paragraphs, before the first section. */
  intro: string[];
  terms: { term: string; definition: string }[];
  sections: GuideSection[];
  mistakes: string[];
  practice: PracticeQuestion[];
  limitations: string[];
  refs: ReferenceId[];
  relatedTools: { slug: string; name: string; why: string }[];
  /** Other guides by slug. */
  relatedGuides?: string[];
  meta: ContentMeta;
};
