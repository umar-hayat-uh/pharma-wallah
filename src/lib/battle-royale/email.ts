/**
 * Battle Royale — transactional email through Resend. Server-only.
 *
 * Every send is logged to `br_email_logs`, success or failure, so the admin
 * Emails page can show what went out and resend what didn't. A failed send
 * never undoes the thing it was announcing: a registration stays registered.
 *
 * RESEND_API_KEY is read here, lazily, and never leaves the server. The client
 * is built on first use rather than at module scope, so a missing key fails
 * one send (logged as failed) instead of crashing every route that imports this.
 */
import { Resend } from "resend";
import { SITE_URL } from "@/lib/seo";
import { db, readSettings } from "./server";
import { FINAL_STATUS_LABEL } from "./constants";
import { formatDuration, formatEventDate, formatSlot } from "./format";
import type { EmailType, FinalStatus } from "./types";
import type { EmailContext, RenderedEmail } from "@/emails/battle-royale/layout";
import { registrationConfirmation } from "@/emails/battle-royale/registration-confirmation";
import { slotAssignment } from "@/emails/battle-royale/slot-assignment";
import { battleReminder } from "@/emails/battle-royale/reminder";
import { checkInConfirmation } from "@/emails/battle-royale/check-in";
import { finalResult, qualificationNotice } from "@/emails/battle-royale/result";

const FROM = "PharmaWallah Battle Royale <noreply@pharmawallah.com>";

let resend: Resend | null = null;
function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  resend ??= new Resend(process.env.RESEND_API_KEY);
  return resend;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, "");
}

const TEMPLATES: Record<EmailType, (ctx: EmailContext) => RenderedEmail> = {
  registration: registrationConfirmation,
  slot_assignment: slotAssignment,
  reminder: battleReminder,
  check_in: checkInConfirmation,
  qualification: qualificationNotice,
  result: finalResult,
};

/** Types that only make sense once the participant has a score. */
const NEEDS_SCORE: EmailType[] = ["qualification", "result"];

export type SendOutcome = { status: "sent" | "failed" | "skipped"; reason?: string };

async function buildContext(participantId: string): Promise<{ ctx: EmailContext; email: string | null } | null> {
  const svc = await db();
  const [{ data: p }, settings] = await Promise.all([
    svc
      .from("br_participants")
      .select("id, name, email, participant_code, game_code, payment_status, slot:br_sessions(name, start_time, end_time)")
      .eq("id", participantId)
      .maybeSingle(),
    readSettings(),
  ]);
  if (!p || !settings) return null;

  const { data: score } = await svc
    .from("br_leaderboard")
    .select("rank, round1_score, round2_score, round3_score, total_score, correct_count, total_questions, total_time_ms, final_status")
    .eq("participant_id", participantId)
    .maybeSingle();

  // PostgREST returns a to-one embed as an object, but older clients type it as an array.
  const slotRaw = (p as { slot: unknown }).slot;
  const slot = (Array.isArray(slotRaw) ? slotRaw[0] : slotRaw) as
    | { name: string; start_time: string; end_time: string }
    | null
    | undefined;

  return {
    email: p.email,
    ctx: {
      eventTitle: settings.eventTitle,
      name: p.name,
      code: p.participant_code,
      gameCode: p.game_code,
      slotLabel: formatSlot(slot ? { name: slot.name, startTime: slot.start_time, endTime: slot.end_time } : null),
      eventDate: formatEventDate(settings.eventDate),
      reportingTime: settings.reportingTime,
      venue: settings.venue,
      entryFee: settings.entryFee,
      paymentStatus: p.payment_status,
      siteUrl: siteUrl(),
      score: score
        ? {
            total: score.total_score,
            rounds: [score.round1_score, score.round2_score, score.round3_score],
            correct: score.correct_count,
            questions: score.total_questions,
            time: formatDuration(score.total_time_ms),
            rank: score.rank,
            finalStatus: FINAL_STATUS_LABEL[score.final_status as FinalStatus],
            winnersCount: settings.winnersCount,
          }
        : null,
    },
  };
}

/**
 * Render, send and log one email. Never throws: the caller is usually in the
 * middle of something more important (a registration, a check-in) that must
 * succeed whether or not the email does.
 */
export async function sendBattleEmail(type: EmailType, participantId: string): Promise<SendOutcome> {
  try {
    const built = await buildContext(participantId);
    if (!built) return { status: "skipped", reason: "Participant not found." };
    if (!built.email) return { status: "skipped", reason: "No email address on file." };
    if (NEEDS_SCORE.includes(type) && !built.ctx.score) {
      return { status: "skipped", reason: "No ranked score yet." };
    }

    const rendered = TEMPLATES[type](built.ctx);
    const mailer = client();
    let resendId: string | null = null;
    let error: string | null = null;

    if (!mailer) {
      error = "RESEND_API_KEY is not configured.";
    } else {
      try {
        const { data, error: sendError } = await mailer.emails.send({
          from: FROM,
          to: [built.email],
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        });
        // Resend reports API failures in the result rather than by throwing.
        if (sendError) error = sendError.message ?? "Resend rejected the message.";
        resendId = data?.id ?? null;
      } catch (err) {
        error = err instanceof Error ? err.message : "Resend request failed.";
      }
    }

    const svc = await db();
    const { error: logError } = await svc.from("br_email_logs").insert({
      participant_id: participantId,
      email_type: type,
      recipient: built.email,
      subject: rendered.subject,
      status: error ? "failed" : "sent",
      resend_id: resendId,
      error: error ? error.slice(0, 500) : null,
    });
    if (logError) console.error("[battle-royale] email log failed", logError);
    if (error) console.error(`[battle-royale] ${type} email failed`, error);

    return error ? { status: "failed", reason: error } : { status: "sent" };
  } catch (err) {
    console.error(`[battle-royale] ${type} email crashed`, err);
    return { status: "failed", reason: "Unexpected error." };
  }
}

/**
 * Send one type to many participants, one at a time. Resend's default limit is
 * a handful of requests per second, so a burst of parallel sends would fail
 * half of them; sequential with a short gap stays under it.
 */
export async function sendBattleEmails(type: EmailType, participantIds: string[]) {
  const tally = { sent: 0, failed: 0, skipped: 0 };
  for (const id of participantIds) {
    const outcome = await sendBattleEmail(type, id);
    tally[outcome.status] += 1;
    await new Promise((r) => setTimeout(r, 260));
  }
  return tally;
}
