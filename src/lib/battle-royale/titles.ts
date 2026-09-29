/**
 * Battle Royale — titles ("Precision Master", "Speed Demon" …). Pure,
 * client-safe, unit-tested in scripts/battle-royale.test.mts.
 *
 * Every title is earned from the player's OWN battle — accuracy, time against
 * the time they were allowed, perfect rounds — never from where they sit on
 * the board. So a title is fixed the moment the battle ends: a certificate
 * downloaded straight after playing can never become wrong when someone else
 * plays later. (Rank-based honours are the Top-N certificate's job, and that
 * waits for the board to be finalised.)
 */
import type { BattlePlan, RoundResult } from "./types";

export type TitleId =
  | "flawless"
  | "precision-master"
  | "speed-demon"
  | "quiz-master"
  | "match-maker"
  | "word-hunter"
  | "sharp-shooter"
  | "battle-tested";

export type BattleTitle = { id: TitleId; name: string; reason: string };

/** Highest honour first. The first one earned is the player's headline title. */
export const TITLES: readonly BattleTitle[] = [
  { id: "flawless", name: "Flawless", reason: "Every word, pair and answer correct." },
  { id: "precision-master", name: "Precision Master", reason: "90% or more of everything correct." },
  { id: "speed-demon", name: "Speed Demon", reason: "Finished in half the allowed time with 60% or more correct." },
  { id: "quiz-master", name: "Quiz Master", reason: "A perfect Final Pharma Quiz." },
  { id: "match-maker", name: "Match Maker", reason: "Every pair matched in Column Matching." },
  { id: "word-hunter", name: "Word Hunter", reason: "Found every word in the Word Search." },
  { id: "sharp-shooter", name: "Sharp Shooter", reason: "75% or more of everything correct." },
  { id: "battle-tested", name: "Battle Tested", reason: "Completed all three rounds of Battle Royale." },
];

export type TitleInput = {
  correct: number;
  questions: number;
  /** Server-measured battle time. */
  timeMs: number;
  /** The sum of every round's timer, in ms (0 if unknown — Speed Demon is then not awarded). */
  allowedMs: number;
  /** Round 1, 2, 3 — every item in the round correct. */
  perfect: [boolean, boolean, boolean];
};

export function accuracy(correct: number, questions: number): number {
  if (!Number.isFinite(correct) || !Number.isFinite(questions) || questions <= 0) return 0;
  return Math.max(0, Math.min(1, correct / questions));
}

/** Every title the battle earned, highest first. Always at least "Battle Tested". */
export function earnedTitles(t: TitleInput): BattleTitle[] {
  const acc = accuracy(t.correct, t.questions);
  const has: Record<TitleId, boolean> = {
    flawless: t.questions > 0 && t.correct >= t.questions,
    "precision-master": acc >= 0.9,
    "speed-demon": t.allowedMs > 0 && t.timeMs > 0 && t.timeMs <= t.allowedMs / 2 && acc >= 0.6,
    "quiz-master": t.perfect[2],
    "match-maker": t.perfect[1],
    "word-hunter": t.perfect[0],
    "sharp-shooter": acc >= 0.75,
    "battle-tested": true,
  };
  // Flawless already says "precision"; don't print both.
  if (has.flawless) has["precision-master"] = false;
  // Precision Master already says "sharp".
  if (has.flawless || has["precision-master"]) has["sharp-shooter"] = false;
  const earned = TITLES.filter((x) => has[x.id]);
  // "Battle Tested" is the fallback, not a badge next to real honours.
  return earned.length > 1 ? earned.filter((x) => x.id !== "battle-tested") : earned;
}

/** The time the player was allowed: the grid timer plus every board and question timer. */
export function allowedMsFromPlan(plan: BattlePlan | null | undefined): number {
  if (!plan) return 0;
  const seconds =
    (plan.r1?.seconds ?? 0) +
    (plan.r2 ?? []).reduce((a, b) => a + (b.timeLimit ?? 0), 0) +
    (plan.r3 ?? []).reduce((a, q) => a + (q.timeLimit ?? 0), 0);
  return Number.isFinite(seconds) ? seconds * 1000 : 0;
}

/** Which rounds were perfect, from the graded results the engine stored. */
export function perfectRounds(results: Partial<Record<"1" | "2" | "3", RoundResult>> | null | undefined): [boolean, boolean, boolean] {
  const one = (k: "1" | "2" | "3"): boolean => {
    const r = results?.[k];
    if (!r || r.late) return false;
    if ("missed" in r) return r.found.length > 0 && r.missed.length === 0;
    return r.items.length > 0 && r.items.every((i) => i.correct);
  };
  return [one("1"), one("2"), one("3")];
}
