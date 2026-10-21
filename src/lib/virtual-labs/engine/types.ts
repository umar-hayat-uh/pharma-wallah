/**
 * Virtual Labs — the experiment engine's shared vocabulary (added 2026-10-20).
 *
 * This layer is PURE: no React, no DOM, no three.js. A 3D room, the 2D fallback and
 * the unit tests all drive an experiment through the same `apply()` function, so a
 * number a student sees can always be traced to a typed function here — never to a
 * renderer, and never to a formula loaded as a string.
 */

export type DisciplineId = "pharmaceutical-chemistry" | "pharmaceutics" | "pharmacology" | "pharmacognosy";

/**
 * How far a curriculum claim has been checked. A status is only ever raised by a
 * person doing the check it names — `faculty_reviewed` needs a named reviewer, which
 * no experiment has yet (docs/virtual-labs/CURRICULUM_MAPPING.md).
 */
export type CurriculumStatus = "proposed" | "source_verified" | "faculty_reviewed" | "published";

export type Difficulty = "Introductory" | "Intermediate" | "Advanced";

export interface CurriculumRef {
  status: CurriculumStatus;
  /** One sentence the landing card and the briefing print verbatim. */
  summary: string;
  /** Where the claim comes from; empty when nothing was verified. */
  sources: { label: string; url: string; basis: string }[];
}

export interface LabMeta {
  id: string; // e.g. "acid-base-titration"
  discipline: DisciplineId;
  disciplineLabel: string;
  labName: string; // "Pharmaceutical Chemistry Laboratory"
  experimentTitle: string;
  href: string;
  summary: string;
  objectives: string[];
  minutes: number;
  difficulty: Difficulty;
  curriculum: CurriculumRef;
}

export interface EquipmentDef {
  id: string;
  name: string;
  /** What it is, in one or two sentences. */
  description: string;
  /** How it is used in THIS experiment. */
  use: string;
  /** Specification a student would read on the real item (capacity, class, resolution). */
  spec?: string;
  safety?: string;
}

export interface MaterialDef {
  id: string;
  name: string;
  detail: string;
  hazard?: string;
}

export interface StepDef {
  id: string;
  title: string;
  /** The current objective, as the HUD shows it. */
  objective: string;
  /** Hints in order of how much they give away. The last may name the answer. */
  hints: string[];
  /** Equipment the room highlights and the guided camera visits for this step. */
  focus: string[];
  safety?: string;
}

/**
 * Learning = guided (objective text, hints, "try this" on the right control, the camera
 * walks you to the next instrument). Practical = independent (a compact checklist, no
 * guidance, hints cost technique marks). Same room, same engine — only guidance and
 * scoring differ (2026-10-21 upgrade).
 */
export type LabMode = "learning" | "practical";

/**
 * An instrument controller: the control set a student gets by SELECTING a piece of
 * equipment in the room. Every physical action belongs to at least one controller, and
 * the run machine refuses an action unless one of its controllers is the instrument the
 * student currently has open — so no procedure card, list or shortcut can operate the
 * bench (docs/virtual-labs/UPGRADE_PLAN.md).
 */
export interface ControllerDef {
  id: string;
  name: string;
  /** Equipment ids that open this controller. The first is the one the camera frames. */
  equipment: string[];
  /** Action `type`s this controller performs. Overlap between controllers is allowed. */
  actions: string[];
  /** One line: what this instrument does in this experiment. */
  brief: string;
  /** Learning mode only: how to operate it, in two or three short lines. */
  howTo: string[];
  /** Controllers at the same station, offered as one-tap switches once operated. */
  nearby?: string[];
}

/** Learning mode's "next" pointer: which instrument, and which control on it. */
export interface Suggestion {
  controller: string;
  /** The action `type` the next correct move uses; the matching control is highlighted. */
  action: string;
}

export interface Question {
  id: string;
  /** design = experimental design, interpretation = reading the data, viva = oral-exam style. */
  kind: "design" | "interpretation" | "viva" | "calculation";
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export type FeedbackKind = "ok" | "info" | "warn" | "error";

export interface Feedback {
  kind: FeedbackKind;
  text: string;
  /** Set when this feedback records a technique mistake (scored once per id). */
  mistake?: MistakeDef;
}

export interface MistakeDef {
  id: string;
  /** Penalty out of the 100-point technique score. */
  weight: number;
  /** What went wrong and what it does to the result — shown in the report. */
  consequence: string;
}

export interface ObservationRow {
  label: string;
  value: string;
  /** Where the value came from: what the student recorded vs what the lab computed. */
  source: "recorded" | "calculated" | "observed";
}

export interface ObservationSection {
  title: string;
  rows: ObservationRow[];
}

export interface CalculationLine {
  label: string;
  expression: string;
  result: string;
}

/** Everything a lab adds to the final report beyond the shared sections. */
export interface ExperimentReport {
  headline: string;
  calculations: CalculationLine[];
  outcome: { label: string; value: string; verdict?: "pass" | "fail" | "info" }[];
  learning: string[];
}

/**
 * One experiment, fully described. `S` is its own state; `A` its own actions.
 * The engine (machine.ts) wraps it with undo, hints, mistakes and assessment.
 */
export interface ExperimentDefinition<S, A> {
  meta: LabMeta;
  principle: string[];
  safety: string[];
  equipment: EquipmentDef[];
  materials: MaterialDef[];
  steps: StepDef[];
  /** The instruments. Every action type except `inspect` must appear in at least one. */
  controllers: ControllerDef[];
  questions: Question[];
  initial(seed: number): S;
  /**
   * Learning mode: the next correct move for this state, or null when the next move is
   * a judgement the student must make unaided (a reading, a verdict). Never shown in
   * Practical mode.
   */
  suggest(state: S): Suggestion | null;
  /**
   * The ONLY way state changes. Must be pure and must validate preconditions:
   * an action out of order returns the same state plus an explanation, never throws.
   */
  apply(state: S, action: A): { state: S; feedback: Feedback[] };
  stepComplete(state: S, stepId: string): boolean;
  /** True once the bench work is over and the assessment may open. */
  benchComplete(state: S): boolean;
  observations(state: S): ObservationSection[];
  report(state: S): ExperimentReport;
}
