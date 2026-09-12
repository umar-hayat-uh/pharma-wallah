/*
 * Content for the landing page.
 *
 * Kept out of the section components so the copy can be edited without reading
 * the markup, and so the GSAP orchestrator in LandingPage.tsx stays about
 * motion. Every `href` points at a route that actually exists under
 * src/app/(site)/ — see .claude/PROJECT_MAP.md.
 */

export type LeafArt = "curve" | "bars" | "rings" | "blocks";

export interface Leaf {
  /** Semester chip shown on the sheet. */
  term: string;
  title: string;
  /** Truncated title drawn on the miniature page inside the sheet. */
  sheetTitle: string;
  sub: string;
  /** Tint behind the miniature page. */
  tint: string;
  /** Swatch colour of the icon on the miniature page. */
  swatch: string;
  art: LeafArt;
  icon: "notes" | "flask" | "analysis" | "hospital" | "mcq" | "pill";
  href: string;
}

/* ══════════════════ 01 · Absorption — the notes rail ══════════════════ */
export const LEAVES: Leaf[] = [
  {
    term: "SEM 5",
    title: "Pharmacology of the Autonomic Nervous System",
    sheetTitle: "Pharmacology of the Autono",
    sub: "112 pages · 2,100 downloads",
    tint: "#EEF5FF",
    swatch: "#2563EB",
    art: "curve",
    icon: "mcq",
    href: "/courses",
  },
  {
    term: "SEM 3",
    title: "Micromeritics & Powder Technology",
    sheetTitle: "Micromeritics & Powder Tec",
    sub: "96 pages · 1,840 downloads",
    tint: "#EDF7FC",
    swatch: "#2E9BD6",
    art: "bars",
    icon: "flask",
    href: "/courses",
  },
  {
    term: "SEM 4",
    title: "Chemical Analysis of Drugs",
    sheetTitle: "Chemical Analysis of Drugs",
    sub: "64 pages · 980 downloads",
    tint: "#ECF6FD",
    swatch: "#0EA5E9",
    art: "rings",
    icon: "analysis",
    href: "/courses",
  },
  {
    term: "SEM 7",
    title: "Role of Hospital Pharmacy",
    sheetTitle: "Role of Hospital Pharmacy",
    sub: "40 pages · 620 downloads",
    tint: "#EEFBF4",
    swatch: "#22C55E",
    art: "blocks",
    icon: "hospital",
    href: "/courses",
  },
  {
    term: "SEM 6",
    title: "Clinical Pharmacokinetics, worked examples",
    sheetTitle: "Clinical Pharmacokinetics,",
    sub: "72 pages · 1,120 downloads",
    tint: "#EEF5FF",
    swatch: "#1D4ED8",
    art: "curve",
    icon: "mcq",
    href: "/calculation-tools",
  },
  {
    term: "SEM 8",
    title: "Therapeutics: Cardiovascular Disorders",
    sheetTitle: "Therapeutics: Cardiovascul",
    sub: "88 pages · 1,460 downloads",
    tint: "#EEFBF4",
    swatch: "#16A34A",
    art: "bars",
    icon: "pill",
    href: "/courses",
  },
];

/* ══════════════════ 02 · Distribution — the discipline index ══════════════════
   Mirrors the ten fields that src/components/Home/Companies/index.tsx has always
   listed, so the redesign does not quietly change what the site claims to cover. */
export interface Discipline {
  title: string;
  meta: string;
  /** Background of the preview tile that trails the cursor. */
  grad: string;
  href: string;
}

export const DISCIPLINES: Discipline[] = [
  { title: "Pharmaceutics", meta: "Dosage form design", grad: "linear-gradient(135deg,#2563EB,#3B82F6)", href: "/courses" },
  { title: "Pharmacology", meta: "Drug action & mechanisms", grad: "linear-gradient(135deg,#1D4ED8,#2E9BD6)", href: "/courses" },
  { title: "Pharmaceutical Chemistry", meta: "Structure & synthesis", grad: "linear-gradient(135deg,#2E9BD6,#22C55E)", href: "/courses" },
  { title: "Pharmacognosy", meta: "Natural drug sources", grad: "linear-gradient(135deg,#16A34A,#22C55E)", href: "/courses" },
  { title: "Clinical Pharmacy", meta: "Therapeutic optimisation", grad: "linear-gradient(135deg,#2563EB,#22C55E)", href: "/courses" },
  { title: "Hospital Pharmacy", meta: "Institutional medication use", grad: "linear-gradient(135deg,#1E40AF,#2E9BD6)", href: "/courses" },
  { title: "Pharmaceutical Analysis", meta: "Quality control & testing", grad: "linear-gradient(135deg,#0EA5E9,#2563EB)", href: "/courses" },
  { title: "Biopharmaceutics", meta: "ADME & bioavailability", grad: "linear-gradient(135deg,#2E9BD6,#16A34A)", href: "/courses" },
  { title: "Medicinal Chemistry", meta: "Structure–activity relationships", grad: "linear-gradient(135deg,#3B82F6,#22C55E)", href: "/courses" },
  { title: "Pharmacy Practice", meta: "Counselling, law & ethics", grad: "linear-gradient(135deg,#22C55E,#2E9BD6)", href: "/courses" },
];

/* ══════════════════ 03 · Metabolism — the deck ══════════════════ */
export const DECK_STEPS = ["Sit the question", "See the reasoning", "Move to the next"] as const;

export const DECK_COPY = [
  "Ten thousand questions built to match UOK and HEC paper patterns, filtered by subject, semester and difficulty, timed the way the real paper is timed.",
  "A wrong answer is where the learning is. Every question carries a worked explanation and the exact page it came from, so the mark you lost buys you something.",
  "Questions are dealt from a deck weighted towards your weak topics, so the bank keeps getting harder exactly where you need it to.",
];

export const DECK_OPTIONS = [
  { key: "A", label: "Beta-1 adrenergic receptor" },
  { key: "B", label: "Beta-2 adrenergic receptor" },
  { key: "C", label: "Muscarinic M3 receptor" },
  { key: "D", label: "Alpha-1 adrenergic receptor" },
] as const;

/*
 * The card underneath. The prototype left it blank, which reads as a broken
 * card once the answered one is dealt away — so the next question in the deck
 * is real, and the third card stays a bare stub because it is never more than
 * a sliver behind the other two.
 */
export const DECK_NEXT = {
  subject: "Pharmaceutics",
  progress: "Q8 / 20",
  timer: "00:60",
  question: "Which excipient is added to a tablet formulation specifically to aid disintegration?",
  options: [
    { key: "A", label: "Magnesium stearate" },
    { key: "B", label: "Sodium starch glycolate" },
    { key: "C", label: "Lactose monohydrate" },
    { key: "D", label: "Povidone K30" },
  ],
} as const;

/* ══════════════════ 04 · Elimination — the scoreboard ══════════════════ */
export const ODOMETER = [
  { num: 10000, suffix: "+", label: "Questions" },
  { num: 80, suffix: "+", label: "Calculators" },
  { num: 300, suffix: "+", label: "Specimens" },
  { num: 1200, suffix: "+", label: "Flashcards" },
];

export const WEAK_TOPICS = [
  "Autonomic drugs · 61%",
  "Pharmacokinetics · 68%",
  "Antibiotic classes · 72%",
];

/* ══════════════════ AI guide ══════════════════
   Exported because ScrambleTextPlugin needs the final string to resolve to, and
   the same string is rendered server-side so the copy is in the HTML for
   crawlers even though the effect clears it before typing it back in. */
export const AI_ANSWER =
  "First-pass metabolism is the drug lost before it ever reaches the systemic circulation. " +
  "An oral dose is absorbed from the gut into the portal vein and passes through the liver first, " +
  "where enzymes break part of it down. That is why some drugs need a far larger oral dose than " +
  "IV dose, and why GTN is given under the tongue.";

export const AI_QUESTION = "Explain first-pass metabolism in simple terms";

export const AI_CITATIONS = ["Pharmacology · Sem 5 · p.112", "Biopharmaceutics · Ch.4"];

export const AI_POINTS = [
  {
    icon: "book" as const,
    title: "Grounded in your syllabus",
    body: "Answers come from the notes and references on this platform.",
  },
  {
    icon: "calc" as const,
    title: "Calculations, worked",
    body: "Dosage and dilution problems solved step by step.",
  },
  {
    icon: "shield" as const,
    title: "A study aid, not a prescriber",
    body: "Built for learning. Never patient-specific medical advice.",
  },
];

/* ══════════════════ hero ══════════════════ */
export const HERO_WORDS = ["understood.", "calculated.", "remembered.", "passed."];

export const HERO_STATS = [
  { num: 12400, suffix: "+", label: "students" },
  { num: 10000, suffix: "+", label: "MCQs" },
  { num: 2000, suffix: "+", label: "drug entries" },
];

export const HERO_RINGS = [
  { text: "500+ resources", style: { left: "6%", top: "-2%" } },
  { text: "10,000+ MCQs", style: { right: "-6%", top: "16%" } },
  { text: "80+ calculators", style: { right: "4%", bottom: "4%" } },
];

/* ══════════════════ the four ADME stations ══════════════════ */
export const STATIONS = [
  { num: "01", label: "Absorption", id: "learn" },
  { num: "02", label: "Distribution", id: "explore" },
  { num: "03", label: "Metabolism", id: "practice" },
  { num: "04", label: "Elimination", id: "master" },
] as const;
