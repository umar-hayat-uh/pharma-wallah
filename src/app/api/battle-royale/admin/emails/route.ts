import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/battle-royale/admin";
import { emailActionSchema, firstIssue } from "@/lib/battle-royale/schemas";
import { db, engineErrorResponse, errorResponse, readJson } from "@/lib/battle-royale/server";
import { sendBattleEmail, sendBattleEmails } from "@/lib/battle-royale/email";
import type { EmailType } from "@/lib/battle-royale/types";

const MAX_REMINDERS = 150;

export async function POST(req: Request) {
  const parsed = emailActionSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const action = parsed.data;

  // The desk may resend a registration confirmation; bulk sends need an admin.
  const deskAllowed =
    (action.action === "send" && action.type === "registration") || action.action === "resend_log";
  const guard = await adminGuard(deskAllowed ? "desk" : "admin");
  if (guard.response) return guard.response;

  const svc = await db();

  if (action.action === "resend_log") {
    const { data: log, error } = await svc
      .from("br_email_logs")
      .select("participant_id, email_type")
      .eq("id", action.logId)
      .maybeSingle();
    if (error) return engineErrorResponse(error, "email log read");
    if (!log?.participant_id) return errorResponse("That email can't be resent: its participant no longer exists.", 404);
    const outcome = await sendBattleEmail(log.email_type as EmailType, log.participant_id);
    return NextResponse.json(outcome);
  }

  if (action.action === "send") {
    return NextResponse.json(await sendBattleEmail(action.type, action.participantId));
  }

  // Reminder to everyone registered in one session.
  const { data, error } = await svc
    .from("br_participants")
    .select("id")
    .eq("slot_id", action.sessionId)
    .eq("registration_status", "registered")
    .not("email", "is", null)
    .limit(MAX_REMINDERS);
  if (error) return engineErrorResponse(error, "reminder list");
  const tally = await sendBattleEmails("reminder", (data ?? []).map((r) => r.id));
  return NextResponse.json({ ok: true, ...tally, capped: (data?.length ?? 0) >= MAX_REMINDERS });
}
