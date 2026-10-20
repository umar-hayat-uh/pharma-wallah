import { CALCULATOR_COUNT } from "@/app/(site)/calculation-tools/tool-index";
import { SUBJECTS } from "@/lib/courses/registry";

/*
 * Content for the landing page.
 *
 * Kept out of the section components so copy can be edited without reading
 * markup. Every number here was counted from the repo on 2026-09-13 — do not
 * round them up for effect; a pharmacy student will check. `calculators` and
 * `lessons` are derived (2026-09-23), not typed: the typed 97 had gone stale at
 * 105, and "69 lessons" counted markdown files on disk, most of which belong to
 * subjects that are not published as pages. The ruler, timecode and copy all
 * derive from these. Every `href` points
 * at a route that exists under src/app/ (see .claude/PROJECT_MAP.md).
 */

/** Published course units — the pages a student can actually open. */
const LESSON_COUNT = SUBJECTS.reduce((n, subject) => n + subject.units.length, 0);

export const STATS = {
  /** Every calculator page — the one figure About uses too (tool-index.ts). */
  calculators: CALCULATOR_COUNT,
  lessons: LESSON_COUNT,
  /** Published course subjects: four so far, the rest still being written. */
  subjects: SUBJECTS.length,
  /** 3D virtual labs — LAB_IDS in src/lib/virtual-labs/catalog.ts. Kept as a literal
      so the home bundle does not pull in the lab catalogue; update both together.
      (Was `simulations: 8` until the legacy /simulations labs were removed, 2026-10-20.) */
  virtualLabs: 4,
} as const;

/* ══════════════════ Hero ══════════════════ */

/** The last line of the headline cycles through what the platform covers. */
/* (2026-10-12) The headline said "The whole Pharm-D," — an overclaim while four
   subjects are published. It now names what the site is strongest at. */
export const HERO_CYCLE = ["Solved.", "Worked.", "Explained.", "Checked."] as const;

/* ══════════════════ The Index — the signature section ══════════════════
   One row per pillar of the product. Each row owns a marker colour: when it is
   the active row, a highlighter swipes behind its title in that colour and the
   numeral beside the list is re-lettered in it. */
export interface Pillar {
  num: string;
  title: string;
  /** The measured fact about this pillar, set in mono. */
  figure: string;
  line: string;
  href: string;
  /** Marker colour: the highlighter swipe behind the active title and the
      hand-lettered numeral beside the list. */
  marker: string;
  cta: string;
}

export const PILLARS: Pillar[] = [
  {
    num: "01",
    title: "Calculations",
    figure: `${STATS.calculators} tools`,
    line: "Clearance, dosing, isotonicity, half-life, practical-sheet analysis — each tool shows its formula and working.",
    href: "/calculation-tools",
    marker: "#1C7BD9",
    cta: "Open the tools",
  },
  {
    num: "02",
    title: "Courses",
    figure: `${STATS.lessons} lessons`,
    line: `${STATS.subjects} subjects, unit by unit, each with an MCQ bank.`,
    href: "/courses",
    marker: "#1F9D63",
    cta: "Start a subject",
  },
  {
    num: "03",
    title: "Spotting",
    figure: "2 slide tests",
    // Powder microscopy has notes but no slide photographs or test yet (Known Issue 23).
    line: "Histology and pathology slides, then a timed identification test. Powder-microscopy notes too.",
    href: "/spotting",
    marker: "#F08C2E",
    cta: "Study the slides",
  },
  {
    num: "04",
    title: "Virtual Labs",
    figure: `${STATS.virtualLabs} 3D labs`,
    line: "Titration assay, Simple Syrup, a dose–response curve, clove powder microscopy — run the practical before the practical.",
    href: "/virtual-labs",
    marker: "#13A89E",
    cta: "Enter the lab",
  },
  // The Tournament row ("Live scoring" → /tournament/play) was removed on
  // 2026-10-12: Science Fair 2026 has ended and its pages are noindexed, so the
  // home page was advertising an event nobody can enter.
  {
    num: "05",
    title: "Clinical",
    figure: "Decision support",
    line: "Drug finder, interaction checkers, AMR surveillance and a literature search for practising pharmacists.",
    href: "/clinical",
    marker: "#7A5AF8",
    cta: "Go clinical",
  },
];

/* ══════════════════ The Instrument — the calculator count ══════════════════ */
export const SAMPLE_TOOLS = [
  { name: "GFR (CKD-EPI 2021)", href: "/calculation-tools/gfr-calculator" },
  { name: "Isotonicity", href: "/calculation-tools/isotonicity-calculator" },
  { name: "IV drip rate", href: "/calculation-tools/iv-drip-rate-calculator" },
  { name: "Loading dose", href: "/calculation-tools/loading-dose-calculator" },
  { name: "Corrected calcium", href: "/calculation-tools/corrected-calcium-calculator" },
  { name: "Therapeutic index", href: "/calculation-tools/therapeutic-index-calculator" },
] as const;
