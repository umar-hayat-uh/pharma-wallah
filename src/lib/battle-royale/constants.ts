import type {
  CheckInStatus,
  EmailType,
  FinalStatus,
  PaymentStatus,
  RegistrationStatus,
  SessionStatus,
} from "./types";

/**
 * Battle Royale — labels and fixed copy. Client-safe.
 *
 * Event-specific values (date, venue, fee, rules, question counts) are NOT
 * here: they live in `br_settings` so the organisers can change them on the
 * day. Only vocabulary that the code itself depends on belongs in this file.
 */

export const BR_BASE = "/battle-royale";
export const BR_NAME = "Battle Royale";

export const PHARM_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Graduate", "Other"] as const;

export const ROUNDS = [
  {
    no: 1,
    name: "Word Search",
    short: "Find as many hidden pharmacy words in the letter grid as you can.",
    how: "Words run in any straight line — across, down, diagonal, even backwards. Drag across a word (or tap its first letter, then its last). Every word you find scores. One timer for the whole grid.",
  },
  {
    no: 2,
    name: "Column Matching",
    short: "Pair every item in Column A with its partner in Column B.",
    how: "Tap an item in Column A, then its partner in Column B. Tap a pair again to undo it. Every correct pair scores.",
  },
  {
    no: 3,
    name: "Final Pharma Quiz",
    short: "Timed multiple-choice questions across the Pharm-D syllabus.",
    how: "Choose one of four options and lock it in. Answers are final once submitted.",
  },
] as const;

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  registered: "Registered",
  disqualified: "Disqualified",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Fee due",
  paid: "Paid",
  waived: "Fee waived",
};

export const CHECK_IN_STATUS_LABEL: Record<CheckInStatus, string> = {
  not_checked_in: "Not checked in",
  checked_in: "Checked in",
  late: "Late",
};

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  open: "Open",
  live: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const FINAL_STATUS_LABEL: Record<FinalStatus, string> = {
  pending: "Awaiting final results",
  participant: "Participant",
  winner: "Winner",
  qualified: "Qualified",
  not_qualified: "Not qualified",
};

export const EMAIL_TYPE_LABEL: Record<EmailType, string> = {
  registration: "Registration",
  slot_assignment: "Slot assignment",
  reminder: "Reminder",
  check_in: "Payment approved",
  qualification: "Qualification",
  result: "Result",
};

export const FAQ = [
  {
    q: "Who can take part?",
    a: "Any pharmacy student. You register once, pay the entry fee at the PharmaWallah desk, and play one official attempt.",
  },
  {
    q: "Do I have to register online?",
    a: "No. Online registration just saves time at the stall — you can also register in person at the desk. Either way, you pay at the desk and receive your Game Code there.",
  },
  {
    q: "What is the Game Code?",
    a: "A six-character code the desk gives you after approving your payment. You type it at a gaming station to start your battle. It works once — it is not emailed, and nobody else should see it.",
  },
  {
    q: "Can I play more than once?",
    a: "No. There is one official attempt per participant. If a station fails during your attempt, tell a coordinator — they can give you a new code that continues the same battle.",
  },
  {
    q: "How is the score calculated?",
    a: "Every word found and every correct match or answer earns its points. Your final score is Round 1 + Round 2 + Round 3, calculated by the system.",
  },
  {
    q: "What happens if two people tie?",
    a: "The shorter total battle time (measured by our server) wins the tie.",
  },
  {
    q: "When are winners announced?",
    a: "When the competition closes, the leaderboard is frozen and verified, and the Top 10 are announced at the stall.",
  },
] as const;
