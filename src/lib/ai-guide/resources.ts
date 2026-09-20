// src/lib/ai-guide/resources.ts
//
// What PharmaWallah itself holds, in one list.
//
// This exists because the AI Guide replaced the Books Library (2026-09-20).
// That page linked scanned copies of commercial textbooks — Tortora, Guyton,
// Lippincott, Remington — which we have no licence to distribute, and 38 of its
// 39 entries pointed at "#" anyway. The honest replacement is not another
// reading room: it is a tutor that explains a topic in its own words and then
// sends the student to material we actually own.
//
// The same list feeds two things, so they can never drift apart:
//   1. the "What we actually have" panel in the guide's empty state, and
//   2. the system prompt, so the model recommends real routes instead of
//      inventing plausible-looking ones.

export interface GuideResource {
  /** In-app route. Every one of these is a real page — checked 2026-09-20. */
  href: string;
  label: string;
  /** One line, written for a student deciding whether to click. */
  blurb: string;
}

export const GUIDE_RESOURCES: GuideResource[] = [
  {
    href: "/courses",
    label: "Course material",
    blurb: "Written lessons by semester, subject and unit, with questions at the end of each one.",
  },
  {
    href: "/encyclopedia",
    label: "Drug encyclopedia",
    blurb: "Full monographs — pharmacology, kinetics, interactions, chemistry and a 3D structure.",
  },
  {
    href: "/calculation-tools",
    label: "Calculation tools",
    blurb: "Worked pharmacy calculators that show their steps, not just an answer.",
  },
  {
    href: "/mcqs-bank",
    label: "MCQ bank",
    blurb: "Subject-wise multiple-choice practice.",
  },
  {
    href: "/flash-cards",
    label: "Flashcards",
    blurb: "Spaced repetition for mechanisms and drug classes.",
  },
  {
    href: "/spotting",
    label: "Spotting labs",
    blurb: "Histology, pathology and powder-microscopy slides, plus timed identification tests.",
  },
  {
    href: "/simulations",
    label: "Lab simulations",
    blurb: "Titration, disk diffusion, staining and other wet-lab procedures, run in the browser.",
  },
  {
    href: "/molecular-lab",
    label: "Molecular Lab",
    blurb: "Draw a structure and turn it in 3D; formula, weight and functional groups come with it.",
  },
  {
    href: "/community",
    label: "Community",
    blurb: "Ask a question where other pharmacy students can answer it.",
  },
];

/**
 * The resource list as prompt text.
 *
 * Built from the array rather than typed out a second time — a route that is
 * renamed here stops being recommended everywhere at once. Kept terse: this is
 * prepended to every single chat request, so each line costs tokens on every
 * message a student sends.
 */
export function resourceDirectory(): string {
  return GUIDE_RESOURCES.map((r) => `- ${r.label} (${r.href}): ${r.blurb}`).join("\n");
}
