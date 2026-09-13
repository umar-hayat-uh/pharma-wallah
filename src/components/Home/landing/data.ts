/*
 * Content for the landing page.
 *
 * Kept out of the section components so copy can be edited without reading
 * markup. Every number here was counted from the repo on 2026-09-13 — do not
 * round them up for effect; a pharmacy student will check. `calculators` is
 * the number of tool directories under (tools)/ (97 after the eight lab tools
 * landed the same day); the ruler, timecode and copy all derive from it. Every `href` points
 * at a route that exists under src/app/ (see .claude/PROJECT_MAP.md).
 */

export const STATS = {
  calculators: 97,
  lessons: 69,
  simulations: 8,
  pillars: 6,
} as const;

/* ══════════════════ Hero ══════════════════ */

/** The last line of the headline cycles through what the platform covers. */
export const HERO_CYCLE = ["Solved.", "Measured.", "Practised.", "Explained."] as const;

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
    line: "Clearance, dosing, isotonicity, half-life — every formula a Pharm-D asks of you, worked and explained.",
    href: "/calculation-tools",
    marker: "#1C7BD9",
    cta: "Open the tools",
  },
  {
    num: "02",
    title: "Courses",
    figure: `${STATS.lessons} lessons`,
    line: "Semester by semester, unit by unit, with an MCQ bank behind each subject.",
    href: "/courses",
    marker: "#1F9D63",
    cta: "Start a subject",
  },
  {
    num: "03",
    title: "Spotting",
    figure: "3 disciplines",
    line: "Histology, pathology and powder microscopy slides — then a timed identification test.",
    href: "/spotting",
    marker: "#F08C2E",
    cta: "Study the slides",
  },
  {
    num: "04",
    title: "Simulations",
    figure: `${STATS.simulations} wet labs`,
    line: "Titration, disk diffusion, UV, staining — run the experiment before the practical.",
    href: "/simulations",
    marker: "#13A89E",
    cta: "Enter the lab",
  },
  {
    num: "05",
    title: "Tournament",
    figure: "Live scoring",
    line: "A science-fair competition with server-graded answers and a public leaderboard.",
    href: "/tournament/play",
    marker: "#E5484D",
    cta: "Compete",
  },
  {
    num: "06",
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
  { name: "Corrected calcium", href: "/calculation-tools/CorrectedCalciumCalculator" },
  { name: "Therapeutic index", href: "/calculation-tools/therapeutic-index-calculator" },
] as const;
