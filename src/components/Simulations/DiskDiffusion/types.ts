// ============================================================
// PharmaWallah — Disk Diffusion Lab: shared types
// Kirby-Bauer antibiotic susceptibility test
// ============================================================
//
// The lab is split deliberately: this file and `data.ts` / `engine.ts` hold
// the model and are pure (no React, no DOM), so the simulation's behaviour can
// be reasoned about — and one day tested — without rendering anything.

/** Which half of the page the student is on. */
export type LabView = "theory" | "simulation";

/** Theory sub-sections, in the order the nav shows them. */
export type TheoryTab =
  | "principle"
  | "materials"
  | "guide"
  | "interpretation"
  | "safety";

/**
 * The experiment's explicit stages. Guided mode walks them in this order and
 * will not let a required practical step be skipped; free-practice mode still
 * uses the same order but hints less.
 */
export type LabStage =
  | "intro"
  | "inoculum"
  | "plate-preparation"
  | "inoculation"
  | "disk-placement"
  | "incubation"
  | "growth"
  | "measurement"
  | "results"
  | "completed";

export type LabMode = "guided" | "practice";

/** Gram grouping used to pick interpretive criteria. */
export type OrganismGroup =
  | "enterobacterales"
  | "pseudomonas"
  | "staphylococcus"
  | "streptococcus"
  | "enterococcus";

export interface Organism {
  id: string;
  name: string;
  short: string;
  /** Reference strain designation, where the teaching set uses one. */
  strain: string;
  gram: "positive" | "negative";
  morphology: string;
  group: OrganismGroup;
  /** Colour of the confluent lawn on Mueller-Hinton agar. */
  lawnColor: string;
  /** Accent used for the organism's chips and markers. */
  color: string;
  clinicalNote: string;
  caseStudy: string;
  /**
   * Base inhibition-zone diameter in mm for each antibiotic under ideal
   * conditions (0.5 McFarland inoculum, 4 mm agar, confluent lawn).
   * A value of 0 means no measurable zone — the disk edge (6 mm) is reported.
   * These are teaching values, not measurements from a validated panel.
   */
  baseZones: Record<string, number>;
}

export interface Antibiotic {
  id: string;
  name: string;
  /** What is actually on the paper disk, e.g. "10 µg". */
  diskContent: string;
  className: string;
  color: string;
  mechanism: string;
  /**
   * Run-to-run spread in mm (± this much) applied deterministically from the
   * experiment seed, so a repeat of the same experiment is reproducible but
   * two experiments are not identical.
   */
  variability: number;
}

/** S ≥ susceptible, R ≤ resistant, anything between is intermediate. */
export interface ZoneCriteria {
  susceptible: number;
  resistant: number;
}

export type InterpretationCategory = "S" | "I" | "R" | "NI";

/**
 * A named, swappable set of interpretive criteria.
 *
 * Interpretation in disk diffusion is not a universal constant: it depends on
 * the standard in force, the organism, the antimicrobial and the testing
 * conditions. The lab therefore treats criteria as *configuration* and always
 * shows which set produced a result — see `sourceNote`.
 */
export interface InterpretationSystem {
  id: string;
  label: string;
  shortLabel: string;
  /** Shown wherever an interpretation is displayed. Keep it honest. */
  sourceNote: string;
  categoryLabels: Record<Exclude<InterpretationCategory, "NI">, string>;
  /** criteria[antibioticId][organismGroup] — absent means "no criteria". */
  criteria: Record<string, Partial<Record<OrganismGroup, ZoneCriteria>>>;
}

/** How turbid the student made the suspension before swabbing. */
export type TurbidityBand = "light" | "standard" | "heavy";

/** How deep the poured Mueller-Hinton agar is. */
export type AgarDepth = "thin" | "standard" | "thick";

export interface DiskPlacement {
  antibioticId: string;
  /** Millimetres from the plate centre. */
  x: number;
  y: number;
}

export interface ZoneResult {
  antibioticId: string;
  /** What the model produced, in mm. Never shown before the student measures. */
  trueDiameter: number;
}

export interface Measurement {
  antibioticId: string;
  /** The diameter the student actually recorded, in mm. */
  recorded: number;
  /** |recorded − true| at the moment it was recorded. */
  errorMm: number;
  /** True when the caliper line passed close enough to the disk centre. */
  throughCentre: boolean;
}

export type FeedbackTone = "success" | "info" | "warn" | "error";

export interface FeedbackEntry {
  id: string;
  tone: FeedbackTone;
  title: string;
  /** Why it matters — this is the teaching, not a scolding. */
  detail: string;
  stage: LabStage;
}

/** One illustrated step of the Lab Guide. */
export interface GuideStep {
  id: string;
  title: string;
  summary: string;
  /** Two or three short paragraphs of explanation. */
  body: string[];
  /** The one thing a student gets wrong if nobody says it. */
  practicalNote: string;
  /** Alt text for the illustration — it carries real information. */
  illustrationAlt: string;
  /** The simulation stage this step rehearses, for "Try it in simulation". */
  stage?: LabStage;
}
