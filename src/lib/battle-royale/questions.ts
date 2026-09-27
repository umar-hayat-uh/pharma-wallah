import type { z } from "zod";
import type { questionSchema } from "./schemas";

/** The `br_questions` columns a question form writes. */
export type QuestionRow = {
  type: "WORD" | "MATCHING" | "MCQ";
  round: 1 | 2 | 3;
  question: string;
  explanation: string | null;
  points: number;
  time_limit: number;
  difficulty: "easy" | "medium" | "hard";
  active: boolean;
  options: Record<string, unknown>;
  correct_answer: string | null;
};

/** A validated question form → its row. Round follows type (a table constraint too). */
export function toQuestionRow(q: z.output<typeof questionSchema>): QuestionRow {
  const base = {
    type: q.type,
    round: q.type === "WORD" ? 1 : q.type === "MATCHING" ? 2 : 3,
    question: q.question,
    explanation: q.explanation,
    points: q.points,
    time_limit: q.timeLimit,
    difficulty: q.difficulty,
    active: q.active,
  } as const;
  if (q.type === "WORD") return { ...base, options: {}, correct_answer: q.answer };
  if (q.type === "MCQ") return { ...base, options: q.options, correct_answer: q.answer };
  return { ...base, options: { pairs: q.pairs }, correct_answer: null };
}
