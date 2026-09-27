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

/** A question as the player sees it (from `br_public_question`). */
export type PublicQuestion = {
  id: string;
  type: QuestionType;
  round: RoundNo;
  prompt: string;
  points: number;
  timeLimit: number;
  difficulty: "easy" | "medium" | "hard";
  servedAt: string;
  deadline: string;
  letters: string[] | null;
  length: number | null;
  options: { key: "A" | "B" | "C" | "D"; text: string }[] | null;
  left: string[] | null;
  right: string[] | null;
};

/** The battle as the engine reports it (`br_state_of`). */
export type BattleState = {
  status: "active" | "completed";
  round: RoundNo;
  index: number;
  roundSizes: [number, number, number];
  roundScores: [number, number, number];
  totalScore: number;
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
  totalTimeMs: number;
  startedAt: string;
  completedAt: string | null;
  participant: { code: string; name: string };
  question: PublicQuestion | null;
  /** Server clock at the moment of the read, for the client's skew offset. */
  now: string;
  resumed?: boolean;
};

export type AnswerResult = {
  questionId: string;
  correct: boolean;
  timedOut: boolean;
  correctParts: number;
  totalParts: number;
  basePoints: number;
  bonusPoints: number;
  score: number;
  /** WORD/MCQ: the word or option key. MATCHING: right items in left order. */
  correctAnswer: string | string[];
  explanation: string | null;
};

export type AnswerPayload =
  | { word: string }
  | { choice: "A" | "B" | "C" | "D" }
  | { matches: string[] };

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
  speedBonusEnabled: boolean;
  speedBonusMax: number;
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
  gameCode: string;
  email: string | null;
  slot: string | null;
  eventDate: string | null;
  reportingTime: string;
  venue: string;
  entryFee: number;
  emailStatus: "sent" | "failed";
};
