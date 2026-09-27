/**
 * Battle Royale — shapes shared by the route handlers and the browser.
 *
 * Nothing here carries an answer key: the only place a correct answer reaches
 * the browser is `AnswerResult.correctAnswer`, which the engine returns *after*
 * the answer has been recorded.
 */

export type RoundNo = 1 | 2 | 3;
export type QuestionType = "WORD" | "MATCHING" | "MCQ";

export type RegistrationStatus = "registered" | "disqualified" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "waived";
export type CheckInStatus = "not_checked_in" | "checked_in" | "late";
export type SessionStatus = "scheduled" | "open" | "live" | "completed" | "cancelled";
export type FinalStatus = "pending" | "participant" | "winner" | "qualified" | "not_qualified";
export type EmailType = "registration" | "slot_assignment" | "reminder" | "check_in" | "qualification" | "result";
export type AdminRole = "admin" | "desk";

/** Round 1, as downloaded: the grid and the words to find (their positions stay on the server). */
export type WordSearchPlan = { grid: string[]; words: string[]; points: number[]; seconds: number };
export type BoardPlan = { id: string; prompt: string; points: number; timeLimit: number; left: string[]; right: string[] };
export type McqPlan = {
  id: string; prompt: string; points: number; timeLimit: number;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
};
/** The whole battle, downloaded once at start. Contains no answers. */
export type BattlePlan = { r1: WordSearchPlan; r2: BoardPlan[]; r3: McqPlan[]; graceSeconds: number };

export type ItemResult = {
  questionId: string; correct: boolean; correctParts: number; totalParts: number; score: number;
  correctAnswer: string | string[]; given: unknown; explanation: string | null;
};
export type RoundResult =
  | { found: string[]; missed: string[]; score: number; late: boolean }
  | { items: ItemResult[]; score: number; late: boolean };

/** The battle as the engine reports it (`br_attempt_view`). */
export type BattleState = {
  status: "active" | "completed";
  /** The next round to submit (stays 3 once complete). */
  round: RoundNo;
  plan: BattlePlan;
  results: Partial<Record<"1" | "2" | "3", RoundResult>>;
  roundScores: [number, number, number];
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  totalTimeMs: number;
  startedAt: string;
  completedAt: string | null;
  participant: { code: string; name: string };
  now: string;
  resumed?: boolean;
};

/** Round submissions. */
export type FoundWord = { word: string; r1: number; c1: number; r2: number; c2: number };
export type RoundAnswers =
  | { found: FoundWord[] }
  | { boards: { questionId: string; matches: string[] }[] }
  | { choices: { questionId: string; choice: "A" | "B" | "C" | "D" | null }[] };

/** Settings safe to show anyone. */
export type PublicSettings = {
  eventTitle: string;
  tagline: string;
  eventDate: string | null;
  reportingTime: string;
  venue: string;
  entryFee: number;
  contactText: string;
  roundCounts: [number, number, number];
  round1Seconds: number;
  gridSize: number;
  syncGraceSeconds: number;
  winnersCount: number;
  registrationOpen: boolean;
  competitionOpen: boolean;
  leaderboardFrozenAt: string | null;
  resultsFinalized: boolean;
  showFullNames: boolean;
  rules: string[];
};

export type PublicSession = {
  id: string;
  name: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  seatsLeft: number;
};

export type LeaderboardRow = {
  rank: number;
  code: string;
  name: string;
  university: string;
  total: number;
  rounds: [number, number, number];
  correct: number;
  questions: number;
  timeMs: number;
  finalStatus: FinalStatus;
};

export type LeaderboardPayload = {
  rows: LeaderboardRow[];
  totalRanked: number;
  frozenAt: string | null;
  finalized: boolean;
  winnersCount: number;
  /** Present when the request named a Player ID that is on the board. */
  you: LeaderboardRow | null;
  updatedAt: string;
};

/** What the success page shows, held in sessionStorage after registering. */
export type RegistrationReceipt = {
  name: string;
  code: string;
  email: string | null;
  slot: string | null;
  eventDate: string | null;
  reportingTime: string;
  venue: string;
  entryFee: number;
  emailStatus: "sent" | "failed";
};

/** The public status lookup (Player ID + email). */
export type StatusPayload = {
  participant: { name: string; code: string; registrationStatus: RegistrationStatus; paymentStatus: PaymentStatus; slot: string };
  steps: { registered: true; paid: boolean; codeIssued: boolean; played: boolean };
  attemptStatus: "active" | "completed" | null;
  score: null | {
    rounds: [number, number, number]; total: number; correct: number; questions: number; timeMs: number; finalStatus: FinalStatus;
  };
  rank: number | null;
  finalized: boolean;
  frozen: boolean;
  winnersCount: number;
};
