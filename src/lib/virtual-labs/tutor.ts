/**
 * RoboPharma — the PharmaWallah lab companion's words (2026-10-25).
 *
 * PURE and deterministic: what the robot says is DERIVED from the run (the engine's state,
 * mode, open instrument and latest feedback) and the experiment's own reviewed text —
 * never from a counter of its own, and never generated. So it cannot drift from the
 * simulation, and it can never say anything the definition does not.
 *
 * It reveals no more than Learning mode's `suggest()` already does: an instrument and a
 * control, never a reading, an assessed choice or "stop". In Practical it names the step
 * only; hints come from the engine's hint action (and cost marks there, as before).
 */
import type { ExperimentDefinition } from "./engine/types";
import type { Run } from "./engine/machine";
import { HINT_COST, HINT_CAP, currentStepId, stepsDone } from "./engine/machine";

export type TutorMood = "happy" | "thinking" | "warning" | "celebrate";

export interface TutorMessage {
  mood: TutorMood;
  title: string;
  lines: string[];
  /** Equipment id the robot points at ("Show me") — Learning only. */
  target: string | null;
  /** Step whose next hint the robot can give, and what it costs (0 in Learning). */
  hint: { stepId: string; shown: number; total: number; cost: number; revealed: string[] } | null;
  /** The experiment's safety line for this step, if it has one. */
  safety: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tutorMessage<S, A>(def: ExperimentDefinition<S, A>, run: Run<S>, intro = false): TutorMessage {
  const learning = run.mode === "learning";
  const stepId = currentStepId(def, run.s);
  const step = def.steps.find((x) => x.id === stepId)!;
  const shown = run.hints[stepId] ?? 0;
  const hintCost = learning || !run.assessed ? 0 : HINT_COST;
  const hint = step.hints.length ? { stepId, shown, total: step.hints.length, cost: hintCost, revealed: step.hints.slice(0, shown) } : null;
  const safety = step.safety ?? null;

  if (intro && run.actions === 0) {
    return {
      mood: "happy",
      title: `Hi, I'm RoboPharma. Today: ${def.meta.experimentTitle}`,
      lines: [
        ...def.meta.objectives.slice(0, 3).map((o) => `• ${o}`),
        learning
          ? "I'll point at each instrument and ring the control to use. Tap equipment to operate it."
          : `Practical mode: find and use the equipment yourself. Hints cost ${HINT_COST} technique marks each (max ${HINT_CAP}).`,
      ],
      target: learning ? step.focus[0] ?? null : null,
      hint: null,
      safety: def.safety[0] ?? null,
    };
  }

  if (run.submitted || def.benchComplete(run.s)) {
    return {
      mood: "celebrate",
      title: run.submitted ? "Report submitted — well done." : "Bench work complete.",
      lines: run.submitted
        ? [`Mistakes recorded: ${run.mistakes.length}. Read each one's effect in your report — that is the learning.`]
        : ["Answer the assessment questions next. Your readings and calculations carry into the report."],
      target: null,
      hint: null,
      safety: null,
    };
  }

  // The latest action's feedback comes first: a mistake or a refusal is what the student needs now.
  const mistake = run.last.find((f) => f.mistake);
  if (mistake?.mistake) {
    return {
      mood: "warning",
      title: "That will affect your result",
      lines: [mistake.text, mistake.mistake.consequence],
      target: null,
      hint,
      safety,
    };
  }
  const refusal = run.last.find((f) => f.kind === "error" || f.kind === "warn");
  if (refusal) {
    return { mood: "thinking", title: "Not yet", lines: [refusal.text], target: null, hint, safety };
  }

  const progress = `Step ${stepsDone(def, run.s) + 1} of ${def.steps.length}: ${step.title}`;
  if (!learning) {
    return { mood: "happy", title: progress, lines: ["Work it out from the procedure — ask me for a hint if you are stuck."], target: null, hint, safety };
  }

  const sug = def.suggest(run.s);
  const ctrl = sug ? def.controllers.find((c) => c.id === sug.controller) : null;
  const lines = [step.objective];
  if (ctrl) lines.push(run.active === ctrl.id ? `You have the ${ctrl.name} open — use the ringed control.` : `Open the ${ctrl.name}.`);
  return { mood: "happy", title: progress, lines, target: ctrl?.equipment[0] ?? step.focus[0] ?? null, hint, safety };
}
