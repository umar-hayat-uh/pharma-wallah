// ============================================================
// Counselling, patient dialogue and the minor-ailment consultation
// ============================================================
//
// What the patient is told, and how. Scored on what a pharmacist would be
// judged on at the window: was it right, was it safe, was it understandable,
// was it professional, and was anything important left out.

import type {
  CounsellingSelection,
  CounsellingTopic,
  DialogueOption,
  DialogueTurn,
  Medicine,
  OtcCase,
  OtcOutcome,
  WwhamField,
} from "../types";
import { COUNSELLING_TOPICS } from "../data/constants";
import { shuffle } from "./rng";

// ─── Counselling checkpoints ─────────────────────────────────────────────────

export interface TopicGrade {
  topic: CounsellingTopic;
  /** Correct statements the student chose. */
  correct: string[];
  /** Correct statements they did not choose. */
  missed: string[];
  /** Wrong statements they chose — these matter most. */
  wrong: string[];
  /** 0–1. Wrong statements cost more than omissions, because they misinform. */
  score: number;
}

/**
 * The statements offered for one checkpoint, in a stable shuffled order.
 *
 * Order is seeded from the case, not from `Math.random()`, so re-rendering the
 * panel never reshuffles the options under the student's finger.
 */
export function topicOptions(m: Medicine, topic: CounsellingTopic, rng: () => number): string[] {
  const content = m.counselling[topic];
  return shuffle(content.points.concat(content.distractors), rng);
}

export function gradeTopic(m: Medicine, topic: CounsellingTopic, chosen: string[]): TopicGrade {
  const content = m.counselling[topic];
  const correct = content.points.filter((p) => chosen.indexOf(p) !== -1);
  const missed = content.points.filter((p) => chosen.indexOf(p) === -1);
  const wrong = chosen.filter((c) => content.points.indexOf(c) === -1);

  // Saying something untrue is worse than omitting something true: a wrong
  // statement is carried out of the pharmacy and acted on.
  const coverage = content.points.length === 0 ? 1 : correct.length / content.points.length;
  const penalty = Math.min(1, wrong.length * 0.5);
  const score = Math.max(0, coverage - penalty);

  return { topic, correct, missed, wrong, score };
}

export function gradeCounselling(m: Medicine, selections: CounsellingSelection[]): TopicGrade[] {
  return COUNSELLING_TOPICS.map((t) => {
    const selection = selections.find((s) => s.topic === t.id);
    return gradeTopic(m, t.id, selection ? selection.chosen : []);
  });
}

export function counsellingPercent(grades: TopicGrade[]): number {
  if (grades.length === 0) return 0;
  const total = grades.reduce((sum, g) => sum + g.score, 0);
  return Math.round((total / grades.length) * 100);
}

// ─── Patient dialogue ────────────────────────────────────────────────────────

export const DIALOGUE_DIMENSIONS: { id: keyof DialogueOption["scores"]; label: string }[] = [
  { id: "accuracy", label: "Accuracy" },
  { id: "safety", label: "Safety" },
  { id: "communication", label: "Communication" },
  { id: "professionalism", label: "Professionalism" },
  { id: "completeness", label: "Completeness" },
];

export interface DialogueGrade {
  turnId: string;
  optionId: string;
  option: DialogueOption;
  /** 0–100 across the five dimensions. */
  percent: number;
}

export function gradeDialogue(turns: DialogueTurn[], answers: { turnId: string; optionId: string }[]): DialogueGrade[] {
  const out: DialogueGrade[] = [];
  turns.forEach((turn) => {
    const answer = answers.find((a) => a.turnId === turn.id);
    if (!answer) return;
    const option = turn.options.find((o) => o.id === answer.optionId);
    if (!option) return;
    const total = DIALOGUE_DIMENSIONS.reduce((sum, d) => sum + option.scores[d.id], 0);
    out.push({ turnId: turn.id, optionId: option.id, option, percent: Math.round((total / (DIALOGUE_DIMENSIONS.length * 2)) * 100) });
  });
  return out;
}

/** Mean across the dimensions for every answered turn — the communication score. */
export function dialoguePercent(grades: DialogueGrade[]): number {
  if (grades.length === 0) return 0;
  return Math.round(grades.reduce((s, g) => s + g.percent, 0) / grades.length);
}

/** The dimension a student is weakest on, for the debrief. */
export function weakestDimension(grades: DialogueGrade[]): { label: string; percent: number } | null {
  if (grades.length === 0) return null;
  const scored = DIALOGUE_DIMENSIONS.map((d) => {
    const total = grades.reduce((sum, g) => sum + g.option.scores[d.id], 0);
    return { label: d.label, percent: Math.round((total / (grades.length * 2)) * 100) };
  });
  return scored.sort((a, b) => a.percent - b.percent)[0];
}

// ─── WWHAM and the minor-ailment decision ────────────────────────────────────

export const WWHAM_LABELS: Record<WwhamField, string> = {
  who: "Who is it for?",
  what: "What are the symptoms?",
  howLong: "How long have they been there?",
  action: "What action has been taken already?",
  medication: "What medication is being taken?",
};

export interface WwhamGrade {
  field: WwhamField;
  asked: boolean;
  /** True when the student selected the answer this patient actually gives. */
  elicited: boolean;
}

export function gradeWwham(otc: OtcCase, answers: { field: WwhamField; optionId: string }[]): WwhamGrade[] {
  return otc.wwham.map((q) => {
    const answer = answers.find((a) => a.field === q.field);
    if (!answer) return { field: q.field, asked: false, elicited: false };
    const option = q.options.find((o) => o.id === answer.optionId);
    return { field: q.field, asked: true, elicited: !!option && option.correct };
  });
}

export interface RedFlagGrade {
  /** Flags present in this case that the student marked. */
  found: string[];
  /** Flags present that they did not mark. */
  missed: string[];
  /** Flags they marked that are not in this history. */
  spurious: string[];
  percent: number;
}

export function gradeRedFlags(otc: OtcCase, marked: string[]): RedFlagGrade {
  const found = otc.redFlagIds.filter((f) => marked.indexOf(f) !== -1);
  const missed = otc.redFlagIds.filter((f) => marked.indexOf(f) === -1);
  const spurious = marked.filter((f) => otc.redFlagIds.indexOf(f) === -1);

  // With no flags present, marking none is a perfect answer; marking several
  // is over-calling, which sends well patients to an overloaded clinic.
  let percent: number;
  if (otc.redFlagIds.length === 0) {
    percent = Math.max(0, 100 - spurious.length * 25);
  } else {
    const recall = found.length / otc.redFlagIds.length;
    percent = Math.max(0, Math.round((recall - Math.min(0.5, spurious.length * 0.15)) * 100));
  }
  return { found, missed, spurious, percent };
}

export interface OtcDecisionGrade {
  correct: boolean;
  chosen: OtcOutcome;
  expected: OtcOutcome;
  /** For a self-care outcome: was the product an appropriate one? */
  productAppropriate: boolean | null;
  /** True when the student supplied something to a patient who needed referral. */
  unsafeSupply: boolean;
}

export function gradeOtcDecision(otc: OtcCase, chosen: OtcOutcome, medicineId: string | null): OtcDecisionGrade {
  const correct = chosen === otc.correctOutcome;
  let productAppropriate: boolean | null = null;
  if (chosen === "self-care") {
    productAppropriate = medicineId ? otc.appropriateMedicineIds.indexOf(medicineId) !== -1 : false;
  }
  return {
    correct,
    chosen,
    expected: otc.correctOutcome,
    productAppropriate,
    unsafeSupply: otc.correctOutcome === "refer" && chosen === "self-care",
  };
}
