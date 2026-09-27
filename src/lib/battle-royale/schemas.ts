import { z } from "zod";
import { PHARM_YEARS } from "./constants";

/**
 * Battle Royale — Zod schemas. Client-safe, and used on BOTH sides: the forms
 * validate with them for instant feedback, and every route handler validates
 * the request body with the same schema again, because the browser's copy can
 * be bypassed.
 */

const trimmed = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

export const playerIdentifierSchema = trimmed(120).min(3, "Enter your Player ID or email.");
export const gameCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{6}$/, "The Game Code is 6 letters and numbers.");

const phoneSchema = trimmed(20).regex(/^[+\d][\d\s-]{6,19}$/, "Enter a valid phone number.");

/*
 * Optional fields accept "", null or undefined and all become null. Both
 * spellings matter: the form validates with these schemas and then POSTs the
 * *transformed* values, so the server sees null where the person left a field
 * blank. A schema that only accepted "" rejected every such registration.
 */
const optionalText = (max: number) =>
  trimmed(max)
    .nullish()
    .transform((v) => (v ? v : null));
const optionalUuid = z
  .string()
  .uuid()
  .nullish()
  .or(z.literal("").transform(() => null));

export const registrationSchema = z.object({
  name: trimmed(100).min(2, "Enter your full name."),
  email: trimmed(200).toLowerCase().email("Enter a valid email address."),
  phone: phoneSchema,
  university: trimmed(120).min(2, "Enter your university or institution."),
  pharmYear: z.enum(PHARM_YEARS, { message: "Choose your year." }),
  studentId: optionalText(40),
  slotId: optionalUuid,
  // Honeypot: a real visitor never sees or fills this field.
  website: z.string().max(0).optional(),
});
export type RegistrationInput = z.input<typeof registrationSchema>;

/** Desk registration: email and phone optional (a walk-in may give neither). */
export const deskRegistrationSchema = z.object({
  name: trimmed(100).min(2, "Enter the participant's full name."),
  email: z
    .union([trimmed(200).toLowerCase().email("Enter a valid email address."), z.literal("")])
    .nullish()
    .transform((v) => (v ? v : null)),
  phone: z.union([phoneSchema, z.literal("")]).nullish().transform((v) => (v ? v : null)),
  university: trimmed(120).min(2, "Enter the university or institution."),
  pharmYear: z.enum(PHARM_YEARS, { message: "Choose a year." }),
  studentId: optionalText(40),
  slotId: optionalUuid,
  paymentStatus: z.enum(["unpaid", "paid", "waived"]).default("paid"),
  checkIn: z.boolean().default(true),
  sendEmail: z.boolean().default(true),
});
export type DeskRegistrationInput = z.input<typeof deskRegistrationSchema>;

export const credentialsSchema = z.object({
  identifier: playerIdentifierSchema,
  gameCode: gameCodeSchema,
});
export type CredentialsInput = z.input<typeof credentialsSchema>;

// Strict at every level: a body that also carries a score, a participant or a
// time is refused outright rather than silently stripped, so a tampered client
// fails loudly. (The engine would ignore those fields anyway — it computes all three.)
export const answerSchema = z
  .object({
    questionId: z.string().uuid(),
    answer: z.union([
      z.object({ word: z.string().max(40) }).strict(),
      z.object({ choice: z.enum(["A", "B", "C", "D"]) }).strict(),
      z.object({ matches: z.array(z.string().max(200)).max(8) }).strict(),
    ]),
  })
  .strict();

/* ── Admin ──────────────────────────────────────────────────────────────── */

export const participantActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set_payment"), value: z.enum(["unpaid", "paid", "waived"]) }),
  z.object({ action: z.literal("set_check_in"), value: z.enum(["not_checked_in", "checked_in", "late"]) }),
  z.object({ action: z.literal("disqualify"), reason: trimmed(300).optional() }),
  z.object({ action: z.literal("restore") }),
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("assign_slot"), slotId: optionalUuid, notify: z.boolean().default(false) }),
  z.object({ action: z.literal("void_attempt"), reason: trimmed(300).min(3, "Say why the attempt is being reset.") }),
  z.object({ action: z.literal("set_final_status"),
    value: z.enum(["pending", "participant", "winner", "qualified", "not_qualified"]) }),
  z.object({ action: z.literal("update_details"),
    name: trimmed(100).min(2), phone: z.union([phoneSchema, z.literal("")]).optional(),
    university: trimmed(120).min(2), pharmYear: z.enum(PHARM_YEARS), notes: trimmed(500).optional() }),
]);
export type ParticipantAction = z.infer<typeof participantActionSchema>;

const dateTime = z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date and time.");

export const sessionSchema = z
  .object({
    name: trimmed(80).min(1, "Name the session."),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
    startTime: dateTime,
    endTime: dateTime,
    capacity: z.coerce.number().int().min(1).max(10000),
    status: z.enum(["scheduled", "open", "live", "completed", "cancelled"]),
  })
  .refine((s) => Date.parse(s.endTime) > Date.parse(s.startTime), {
    message: "The session must end after it starts.",
    path: ["endTime"],
  });
export type SessionInput = z.input<typeof sessionSchema>;

const questionBase = {
  question: trimmed(500).min(3, "Write the question or clue."),
  explanation: optionalText(500),
  points: z.coerce.number().int().min(1).max(100),
  timeLimit: z.coerce.number().int().min(5).max(600),
  difficulty: z.enum(["easy", "medium", "hard"]),
  active: z.boolean(),
};

export const questionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("WORD"),
    ...questionBase,
    answer: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3,16}$/, "The word must be 3–16 letters, A–Z only (no spaces)."),
  }),
  z.object({
    type: z.literal("MCQ"),
    ...questionBase,
    options: z.object({
      A: trimmed(200).min(1, "Option A is empty."),
      B: trimmed(200).min(1, "Option B is empty."),
      C: trimmed(200).min(1, "Option C is empty."),
      D: trimmed(200).min(1, "Option D is empty."),
    }),
    answer: z.enum(["A", "B", "C", "D"]),
  }),
  z.object({
    type: z.literal("MATCHING"),
    ...questionBase,
    pairs: z
      .array(z.object({ left: trimmed(120).min(1), right: trimmed(200).min(1) }))
      .min(3, "A board needs at least 3 pairs.")
      .max(8, "A board can have at most 8 pairs.")
      .refine((pairs) => new Set(pairs.map((p) => p.right.toLowerCase())).size === pairs.length, {
        message: "Every Column B item must be different, or two answers would be indistinguishable.",
      })
      .refine((pairs) => new Set(pairs.map((p) => p.left.toLowerCase())).size === pairs.length, {
        message: "Every Column A item must be different.",
      }),
  }),
]);
export type QuestionInput = z.input<typeof questionSchema>;

export const settingsSchema = z.object({
  eventTitle: trimmed(80).min(3),
  tagline: trimmed(120),
  eventDate: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]).transform((v) => (v ? v : null)),
  reportingTime: trimmed(80),
  venue: trimmed(160),
  entryFee: z.coerce.number().int().min(0).max(100000),
  contactText: trimmed(300),
  round1Count: z.coerce.number().int().min(1).max(20),
  round2Count: z.coerce.number().int().min(1).max(5),
  round3Count: z.coerce.number().int().min(1).max(40),
  speedBonusEnabled: z.boolean(),
  speedBonusMax: z.coerce.number().int().min(0).max(50),
  winnersCount: z.coerce.number().int().min(1).max(100),
  registrationOpen: z.boolean(),
  competitionOpen: z.boolean(),
  showFullNames: z.boolean(),
  rules: z.array(trimmed(400).min(1)).max(30),
});
export type SettingsInput = z.input<typeof settingsSchema>;

export const resultsActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("freeze") }),
  z.object({ action: z.literal("unfreeze") }),
  z.object({ action: z.literal("finalize") }),
  z.object({ action: z.literal("unfinalize") }),
  z.object({ action: z.literal("notify"), type: z.enum(["result", "qualification"]) }),
]);

export const emailActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("resend_log"), logId: z.string().uuid() }),
  z.object({
    action: z.literal("send"),
    participantId: z.string().uuid(),
    type: z.enum(["registration", "slot_assignment", "reminder", "check_in", "qualification", "result"]),
  }),
  z.object({ action: z.literal("remind_session"), sessionId: z.string().uuid() }),
]);

/** The first message of a failed parse, for a single-line error response. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
