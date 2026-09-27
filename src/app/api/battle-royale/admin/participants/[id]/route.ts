import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { adminGuard } from "@/lib/battle-royale/admin";
import { firstIssue, participantActionSchema, type ParticipantAction } from "@/lib/battle-royale/schemas";
import { SESSIONS_TAG, db, engineErrorResponse, errorResponse, GENERIC_ERROR, readJson } from "@/lib/battle-royale/server";
import { sendBattleEmail } from "@/lib/battle-royale/email";
import { invalidateLeaderboard } from "@/lib/battle-royale/leaderboard";

type Ctx = { params: { id: string } };
const idSchema = z.string().uuid();

/** Actions the desk role may take; everything else needs a full admin. */
const DESK_ACTIONS: ParticipantAction["action"][] = ["issue_code", "set_payment", "set_check_in", "assign_slot"];
/** Actions that change who is on the public board, or how. */
const BOARD_ACTIONS: ParticipantAction["action"][] = ["disqualify", "restore", "cancel", "void_attempt", "set_final_status", "update_details"];

/** Full record for the admin drawer — the only place the Game Code is shown after registration. */
export async function GET(_req: Request, { params }: Ctx) {
  const guard = await adminGuard("desk");
  if (guard.response) return guard.response;
  if (!idSchema.safeParse(params.id).success) return errorResponse("Participant not found.", 404);

  const svc = await db();
  const [p, attempt, score, emails] = await Promise.all([
    svc.from("br_participants").select("*").eq("id", params.id).maybeSingle(),
    svc
      .from("br_attempts")
      .select("id, status, round, q_index, round1_score, round2_score, round3_score, total_score, correct_count, answered_count, total_questions, total_time_ms, started_at, completed_at, void_reason")
      .eq("participant_id", params.id)
      .order("started_at", { ascending: false })
      .limit(5),
    svc.from("br_leaderboard").select("rank, final_status").eq("participant_id", params.id).maybeSingle(),
    svc
      .from("br_email_logs")
      .select("id, email_type, status, sent_at, error")
      .eq("participant_id", params.id)
      .order("sent_at", { ascending: false })
      .limit(20),
  ]);
  if (p.error) {
    console.error("[battle-royale] participant read failed", p.error);
    return errorResponse(GENERIC_ERROR, 500);
  }
  if (!p.data) return errorResponse("Participant not found.", 404);

  return NextResponse.json({
    participant: p.data,
    attempts: attempt.data ?? [],
    rank: score.data?.rank ?? null,
    finalStatus: score.data?.final_status ?? null,
    emails: emails.data ?? [],
  });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const parsed = participantActionSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const action = parsed.data;

  const guard = await adminGuard(DESK_ACTIONS.includes(action.action) ? "desk" : "admin");
  if (guard.response) return guard.response;
  if (!idSchema.safeParse(params.id).success) return errorResponse("Participant not found.", 404);
  if (BOARD_ACTIONS.includes(action.action)) await invalidateLeaderboard();

  const svc = await db();
  const now = new Date().toISOString();
  const update = (fields: Record<string, unknown>) =>
    svc.from("br_participants").update({ ...fields, updated_at: now }).eq("id", params.id).select("id").maybeSingle();

  let result: { error: unknown; data?: unknown } = { error: null, data: true };
  let notice: string | undefined;

  switch (action.action) {
    case "issue_code": {
      // Approve the payment and issue (or re-issue) the single-use Game Code.
      // The code is returned to the desk only — it is never emailed.
      const { data, error } = await svc.rpc("br_issue_code", { p_participant_id: params.id, p_payment: action.payment });
      if (error || !data) return engineErrorResponse(error, "issue code");
      notice = (await sendBattleEmail("check_in", params.id)).status;
      return NextResponse.json({ ok: true, code: data, email: notice });
    }
    case "set_payment":
      result = await update({ payment_status: action.value });
      break;
    case "set_check_in":
      result = await update({
        check_in_status: action.value,
        checked_in_at: action.value === "not_checked_in" ? null : now,
      });
      if (!result.error && result.data && action.value !== "not_checked_in") {
        notice = (await sendBattleEmail("check_in", params.id)).status;
      }
      break;
    case "disqualify":
      result = await update({ registration_status: "disqualified", notes: action.reason ?? null });
      break;
    case "restore":
      result = await update({ registration_status: "registered" });
      break;
    case "cancel":
      result = await update({ registration_status: "cancelled", slot_id: null });
      revalidateTag(SESSIONS_TAG);
      break;
    case "update_details":
      result = await update({
        name: action.name,
        phone: action.phone || null,
        university: action.university,
        pharm_year: action.pharmYear,
        notes: action.notes ?? null,
      });
      break;
    case "assign_slot": {
      const { error } = await svc.rpc("br_assign_slot", { p_participant_id: params.id, p_slot_id: action.slotId ?? null });
      if (error) return engineErrorResponse(error, "assign slot");
      revalidateTag(SESSIONS_TAG);
      if (action.notify && action.slotId) notice = (await sendBattleEmail("slot_assignment", params.id)).status;
      return NextResponse.json({ ok: true, email: notice });
    }
    case "void_attempt": {
      const { error } = await svc.rpc("br_void_attempt", { p_participant_id: params.id, p_reason: action.reason });
      if (error) return engineErrorResponse(error, "void attempt");
      return NextResponse.json({ ok: true });
    }
    case "set_final_status": {
      const { data, error } = await svc
        .from("br_scores")
        .update({ final_status: action.value, status_overridden: action.value !== "pending", updated_at: now })
        .eq("participant_id", params.id)
        .select("participant_id")
        .maybeSingle();
      if (error) return engineErrorResponse(error, "final status");
      if (!data) return errorResponse("This participant has no completed battle to label.", 409);
      return NextResponse.json({ ok: true });
    }
  }

  if (result.error) return engineErrorResponse(result.error, action.action);
  if (!result.data) return errorResponse("Participant not found.", 404);
  return NextResponse.json({ ok: true, email: notice });
}
