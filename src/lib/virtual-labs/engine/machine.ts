/**
 * The generic run machine: wraps one ExperimentDefinition with everything every lab
 * shares — undo, reset/retry, hints, the mistake log, the assessment and the final
 * report. A plain reducer, so React's useReducer, the tests and any replay tool can
 * all drive it identically.
 */
import type { ControllerDef, ExperimentDefinition, ExperimentReport, Feedback, LabMode, MistakeDef, ObservationSection } from "./types";

export interface LogEntry {
  at: number; // action index, not wall time — runs replay identically
  kind: Feedback["kind"];
  text: string;
}

export interface RecordedMistake extends MistakeDef {
  stepId: string;
}

export interface Run<S> {
  seed: number;
  s: S;
  mode: LabMode;
  /**
   * True only for a run done start to finish in Practical mode. Switching to Learning
   * part-way makes the run practice; the report says so.
   */
  assessed: boolean;
  /** The instrument controller the student has open (selected in the room), or null. */
  active: string | null;
  /** Controllers opened at least once — "nearby" switches appear only for these. */
  operated: string[];
  /** Previous states for undo. Capped so a long titration cannot grow without bound. */
  past: S[];
  actions: number;
  log: LogEntry[];
  mistakes: RecordedMistake[];
  hints: Record<string, number>; // stepId → hints revealed
  answers: Record<string, number>; // questionId → option index (locked once given)
  submitted: boolean;
  /** Feedback from the latest action only, for the toast/prompt line. */
  last: Feedback[];
}

export type RunAction<A> =
  | { type: "act"; action: A }
  /** Select a piece of equipment: opens its controller (null closes the controller). */
  | { type: "operate"; equipment: string | null }
  | { type: "mode"; mode: LabMode }
  | { type: "undo" }
  | { type: "reset"; seed?: number; silent?: boolean; mode?: LabMode }
  | { type: "hint"; stepId: string }
  | { type: "answer"; questionId: string; choice: number }
  | { type: "submit" };

const MAX_UNDO = 60;
const MAX_LOG = 200;
/** Practical mode: each hint costs this many technique marks, up to HINT_CAP in total. */
export const HINT_COST = 3;
export const HINT_CAP = 15;

export function createRun<S, A>(def: ExperimentDefinition<S, A>, seed: number, mode: LabMode = "learning"): Run<S> {
  return {
    seed,
    s: def.initial(seed),
    mode,
    assessed: mode === "practical",
    active: null,
    operated: [],
    past: [],
    actions: 0,
    log: [],
    mistakes: [],
    hints: {},
    answers: {},
    submitted: false,
    last: [],
  };
}

const typeOf = (a: unknown) => (a as { type?: string } | null)?.type ?? "";

/** The controller a piece of equipment opens (the first that lists it), if any. */
export function controllerForEquipment<S, A>(def: ExperimentDefinition<S, A>, equipmentId: string): ControllerDef | undefined {
  return def.controllers.find((c) => c.equipment.includes(equipmentId));
}

/** Every controller that can perform this action. Empty for `inspect` (selecting is not operating). */
export function controllersForAction<S, A>(def: ExperimentDefinition<S, A>, action: A): ControllerDef[] {
  const t = typeOf(action);
  return def.controllers.filter((c) => c.actions.includes(t));
}

/** The first step whose completion criteria are not yet met (or the last step). */
export function currentStepId<S, A>(def: ExperimentDefinition<S, A>, s: S): string {
  for (const step of def.steps) if (!def.stepComplete(s, step.id)) return step.id;
  return def.steps[def.steps.length - 1].id;
}

export function stepsDone<S, A>(def: ExperimentDefinition<S, A>, s: S): number {
  return def.steps.filter((st) => def.stepComplete(s, st.id)).length;
}

export function reduceRun<S, A>(def: ExperimentDefinition<S, A>, run: Run<S>, msg: RunAction<A>): Run<S> {
  switch (msg.type) {
    case "act": {
      if (run.submitted) {
        return { ...run, last: [{ kind: "info", text: "This run is submitted. Use Retry to perform the experiment again." }] };
      }
      const stepId = currentStepId(def, run.s);
      // The equipment gate. A physical action is accepted only from an instrument the
      // student has opened by selecting it in the room (or the 2D bench plan). This is
      // what stops a list of buttons from performing the experiment.
      if (typeOf(msg.action) !== "inspect") {
        const via = controllersForAction(def, msg.action);
        if (!run.active || !via.some((c) => c.id === run.active)) {
          const names = via.map((c) => c.name);
          const text = names.length
            ? `Use the ${names.join(" or the ")} for that — select it in the lab to operate it.`
            : "That action is not available in this lab.";
          return { ...run, log: [...run.log, { at: run.actions, kind: "error" as const, text }].slice(-MAX_LOG), last: [{ kind: "error", text }] };
        }
      }
      const { state, feedback } = def.apply(run.s, msg.action);
      const actions = run.actions + 1;
      const mistakes = [...run.mistakes];
      for (const f of feedback) {
        // A mistake is scored once, however many times it is repeated.
        if (f.mistake && !mistakes.some((m) => m.id === f.mistake!.id)) mistakes.push({ ...f.mistake, stepId });
      }
      const log = [...run.log, ...feedback.map((f) => ({ at: actions, kind: f.kind, text: f.text }))].slice(-MAX_LOG);
      // Rejected actions (state unchanged) are not undo points.
      const past = state === run.s ? run.past : [...run.past, run.s].slice(-MAX_UNDO);
      return { ...run, s: state, past, actions, log, mistakes, last: feedback };
    }
    case "operate": {
      if (msg.equipment === null) return { ...run, active: null, last: [] };
      const c = controllerForEquipment(def, msg.equipment);
      if (!c) return { ...run, active: null, last: [] }; // equipment you can only inspect
      return { ...run, active: c.id, operated: run.operated.includes(c.id) ? run.operated : [...run.operated, c.id], last: [] };
    }
    case "mode": {
      if (msg.mode === run.mode || run.submitted) return run;
      if (msg.mode === "practical" && run.actions > 0) {
        // Guided work cannot be carried into an assessed run.
        return { ...run, last: [{ kind: "info", text: "Practical mode starts from a fresh bench. Restart in Practical mode to be assessed." }] };
      }
      if (msg.mode === "practical") return { ...run, mode: "practical", assessed: true, last: [] };
      return {
        ...run,
        mode: "learning",
        assessed: false,
        last: [{ kind: "info", text: run.actions > 0 ? "Switched to Learning mode. Your bench is kept; this run now counts as practice, not as an assessed practical." : "Learning mode: guidance is on." }],
      };
    }
    case "undo": {
      if (run.submitted || run.past.length === 0) return { ...run, last: [{ kind: "info", text: "Nothing to undo." }] };
      const past = run.past.slice(0, -1);
      // Undo restores the bench, not the record: a mistake made stays in the log, as it
      // would in a real lab notebook. That keeps undo from being a way to erase errors.
      return { ...run, s: run.past[run.past.length - 1], past, last: [{ kind: "info", text: "Last action undone. Mistakes already made stay on the record." }] };
    }
    case "reset":
      return { ...createRun(def, msg.seed ?? run.seed, msg.mode ?? run.mode), last: msg.silent ? [] : [{ kind: "info", text: "The bench has been reset. Start again from the first step." }] };
    case "hint": {
      const step = def.steps.find((st) => st.id === msg.stepId);
      if (!step) return run;
      const shown = run.hints[msg.stepId] ?? 0;
      if (shown >= step.hints.length) return { ...run, last: [{ kind: "info", text: "No more hints for this step." }] };
      return { ...run, hints: { ...run.hints, [msg.stepId]: shown + 1 }, last: [] };
    }
    case "answer": {
      if (run.submitted || !def.benchComplete(run.s)) return run;
      if (msg.questionId in run.answers) return run; // first answer counts, as in a viva
      const q = def.questions.find((x) => x.id === msg.questionId);
      if (!q || !Number.isInteger(msg.choice) || msg.choice < 0 || msg.choice >= q.options.length) return run;
      return { ...run, answers: { ...run.answers, [msg.questionId]: msg.choice }, last: [] };
    }
    case "submit": {
      if (run.submitted) return run;
      if (!def.benchComplete(run.s)) {
        return { ...run, last: [{ kind: "warn", text: "Finish the bench work before submitting — the report is generated from what you actually did." }] };
      }
      const unanswered = def.questions.filter((q) => !(q.id in run.answers)).length;
      if (unanswered > 0) {
        return { ...run, last: [{ kind: "warn", text: `Answer all assessment questions first (${unanswered} left).` }] };
      }
      return { ...run, submitted: true, last: [{ kind: "ok", text: "Submitted. Your results summary is ready." }] };
    }
  }
}

export interface FinalReport {
  mode: LabMode;
  /** Practical start to finish. A Learning run is practice and is labelled as such. */
  assessed: boolean;
  technique: number; // 0–100
  /** Technique marks taken for hints (assessed Practical runs only). */
  hintPenalty: number;
  assessment: { correct: number; total: number; percent: number };
  hintsUsed: number;
  overall: number; // 0–100, technique and assessment weighted equally
  grade: "Distinction" | "Merit" | "Pass" | "Needs practice";
  mistakes: RecordedMistake[];
  observations: ObservationSection[];
  experiment: ExperimentReport;
  questions: { id: string; prompt: string; chosen: string; correct: string; right: boolean; explanation: string }[];
}

/**
 * Scores technique (what the student did at the bench) and assessment (what they
 * understood) separately. In Learning mode hints cost nothing — asking for help is how
 * you learn — and the report shows how many were used. In an assessed Practical run each
 * hint costs HINT_COST technique marks (capped at HINT_CAP), because the run is a test of
 * working independently; the mode screen says so before the student starts.
 */
export function finalReport<S, A>(def: ExperimentDefinition<S, A>, run: Run<S>): FinalReport {
  const hintsUsed = Object.values(run.hints).reduce((a, b) => a + b, 0);
  const hintPenalty = run.assessed ? Math.min(HINT_CAP, hintsUsed * HINT_COST) : 0;
  const technique = Math.max(0, 100 - run.mistakes.reduce((t, m) => t + m.weight, 0) - hintPenalty);
  const questions = def.questions.map((q) => {
    const chosen = run.answers[q.id];
    return {
      id: q.id,
      prompt: q.prompt,
      chosen: chosen === undefined ? "—" : q.options[chosen],
      correct: q.options[q.answer],
      right: chosen === q.answer,
      explanation: q.explanation,
    };
  });
  const correct = questions.filter((q) => q.right).length;
  const total = questions.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  const overall = Math.round((technique + percent) / 2);
  const grade = overall >= 85 ? "Distinction" : overall >= 70 ? "Merit" : overall >= 50 ? "Pass" : "Needs practice";
  return {
    mode: run.mode,
    assessed: run.assessed,
    technique,
    hintPenalty,
    assessment: { correct, total, percent },
    hintsUsed,
    overall,
    grade,
    mistakes: run.mistakes,
    observations: def.observations(run.s),
    experiment: def.report(run.s),
    questions,
  };
}

// ── Small shared helpers for experiment definitions ─────────────────────────

export const ok = (text: string): Feedback => ({ kind: "ok", text });
export const info = (text: string): Feedback => ({ kind: "info", text });
export const warn = (text: string): Feedback => ({ kind: "warn", text });
export const refuse = (text: string): Feedback => ({ kind: "error", text });
export const mistake = (id: string, weight: number, text: string, consequence: string): Feedback => ({
  kind: "warn",
  text,
  mistake: { id, weight, consequence },
});

/** Deterministic pseudo-random in [0, 1) from integers — mulberry32 over a mixed key. */
export function rand(seed: number, ...keys: number[]): number {
  let h = seed >>> 0;
  for (const k of keys) h = Math.imul(h ^ (k >>> 0), 0x9e3779b1) >>> 0;
  let t = (h + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const round = (x: number, dp: number) => {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
};

export const fmt = (x: number, dp: number) => (Number.isFinite(x) ? x.toFixed(dp) : "—");
