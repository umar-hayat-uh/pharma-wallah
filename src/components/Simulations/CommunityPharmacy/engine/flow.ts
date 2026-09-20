// ============================================================
// The workflow: which stage, and what is allowed
// ============================================================
//
// Stages are gated on **prerequisites derived from state**, never on a step
// counter. A student cannot verify a tray they never filled or counsel on a
// product they never chose, whichever route they took to get there — which is
// also what lets the control panel jump between drawers freely without the
// workflow losing its thread.

import type { CheckRecord, Scenario, Stage, TrayItem, VerificationId } from "../types";
import { VERIFICATION_SPECS } from "../data/constants";
import { allChecksRun } from "./clinical";

/** The ordered stages for this case. OTC and prescription differ. */
export function stageFlow(scenario: Scenario | null): Stage[] {
  if (!scenario) return ["arrival"];
  if (scenario.kind === "otc") {
    const flow: Stage[] = ["arrival", "complaint", "wwham", "assessment", "decision"];
    flow.push("product", "counselling", "documentation", "payment", "complete");
    return flow;
  }
  return [
    "arrival",
    "receive",
    "patient-assessment",
    "interpretation",
    "safety-checks",
    "intervention",
    "selection",
    "stock-expiry",
    "quantity",
    "dispensing",
    "labelling",
    "final-verification",
    "counselling",
    "documentation",
    "payment",
    "complete",
  ];
}

export interface FlowState {
  scenario: Scenario | null;
  stage: Stage;
  seen: Stage[];
  records: CheckRecord[];
  transcriptionDone: boolean;
  interventionsDone: boolean;
  selectedMedicineId: Record<string, string>;
  selectedBatchId: Record<string, string>;
  quantityConfirmed: Record<string, boolean>;
  tray: TrayItem[];
  labelsWritten: Record<string, boolean>;
  ticked: VerificationId[];
  counsellingTopicsDone: number;
  dialogueAnswered: number;
  documentationDone: boolean;
  wwhamAsked: number;
  redFlagsRecorded: boolean;
  otcDecided: boolean;
  otcProductChosen: boolean;
  paid: boolean;
}

/**
 * Is this stage's work finished?
 *
 * One function, consulted by the "next" button, the stage rail and the control
 * panel alike, so they can never disagree about where the student is.
 */
export function stageComplete(stage: Stage, s: FlowState): boolean {
  const sc = s.scenario;
  if (!sc) return false;
  const items = sc.prescription ? sc.prescription.items : [];
  const every = (fn: (id: string) => boolean) => items.length > 0 && items.every((i) => fn(i.id));

  switch (stage) {
    case "arrival":
      return s.seen.indexOf("arrival") !== -1;
    case "receive":
    case "complaint":
      return s.seen.indexOf(stage) !== -1;
    case "patient-assessment":
      return s.seen.indexOf("patient-assessment") !== -1;
    case "interpretation":
      return s.transcriptionDone;
    case "safety-checks":
      return allChecksRun(s.records);
    case "intervention":
      return s.interventionsDone;
    case "selection":
      return every((id) => !!s.selectedMedicineId[id]);
    case "stock-expiry":
      return every((id) => !!s.selectedBatchId[id]);
    case "quantity":
      return every((id) => !!s.quantityConfirmed[id]);
    case "dispensing":
      return items.length > 0 && items.every((i) => s.tray.some((t) => t.itemId === i.id));
    case "labelling":
      return every((id) => !!s.labelsWritten[id]);
    case "final-verification":
      return VERIFICATION_SPECS.every((v) => s.ticked.indexOf(v.id) !== -1);
    case "counselling":
      return sc.kind === "otc"
        ? s.dialogueAnswered >= sc.dialogue.length
        : s.counsellingTopicsDone >= 8 && s.dialogueAnswered >= sc.dialogue.length;
    case "documentation":
      return s.documentationDone;
    case "payment":
      return s.paid;
    case "wwham":
      return sc.otc ? s.wwhamAsked >= sc.otc.wwham.length : true;
    case "assessment":
      return s.redFlagsRecorded;
    case "decision":
      return s.otcDecided;
    case "product":
      return s.otcProductChosen;
    case "complete":
      return true;
    default:
      return false;
  }
}

/**
 * Stages that are skipped for this case.
 *
 * A prescription with nothing wrong has no intervention to record; a referral
 * has no product to select. Skipping is explicit rather than implicit, so the
 * stage rail can show it greyed with a reason instead of silently vanishing.
 */
export function stageSkipped(stage: Stage, s: FlowState): boolean {
  const sc = s.scenario;
  if (!sc) return false;
  if (stage === "intervention") return sc.findings.length === 0;
  // The product stage is never skipped, even on a referral: "supply nothing"
  // is one of the choices it offers, and a referred patient may still leave
  // with rehydration solution. Making that an explicit decision is the lesson.
  return false;
}

/** The next stage the student may move to, or null at the end. */
export function nextStage(s: FlowState): Stage | null {
  const flow = stageFlow(s.scenario);
  const index = flow.indexOf(s.stage);
  if (index === -1) return null;
  for (let i = index + 1; i < flow.length; i++) {
    if (!stageSkipped(flow[i], s)) return flow[i];
  }
  return null;
}

/** A stage may be opened once everything before it is done or skipped. */
export function stageUnlocked(stage: Stage, s: FlowState): boolean {
  const flow = stageFlow(s.scenario);
  const target = flow.indexOf(stage);
  if (target <= 0) return true;
  for (let i = 0; i < target; i++) {
    if (!stageSkipped(flow[i], s) && !stageComplete(flow[i], s)) return false;
  }
  return true;
}

/** 0–100, for the header's progress read-out. */
export function progressPercent(s: FlowState): number {
  const flow = stageFlow(s.scenario).filter((st) => !stageSkipped(st, s));
  if (flow.length <= 1) return 0;
  const done = flow.filter((st) => st !== "complete" && stageComplete(st, s)).length;
  return Math.round((done / (flow.length - 1)) * 100);
}
