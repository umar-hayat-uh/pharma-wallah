import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminGuard } from "@/lib/battle-royale/admin";
import { deskRegistrationSchema, firstIssue } from "@/lib/battle-royale/schemas";
import { SESSIONS_TAG, db, engineErrorResponse, errorResponse, GENERIC_ERROR, readJson } from "@/lib/battle-royale/server";
import { sendBattleEmail } from "@/lib/battle-royale/email";

/*
 * Desk registration: a walk-in at the stall. Usually paid and checked in in
 * the same step (the PDF's desk workflow), so the Player ID and Game Code can
 * be handed over and the participant sent straight to a station. Email is
 * optional here — a walk-in may not give one — and is only sent if present.
 */
export async function POST(req: Request) {
  const guard = await adminGuard("desk");
  if (guard.response) return guard.response;

  const parsed = deskRegistrationSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const input = parsed.data;

  const svc = await db();
  const { data: p, error } = await svc.rpc("br_register", {
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_university: input.university,
    p_year: input.pharmYear,
    p_student_id: input.studentId,
    p_slot_id: input.slotId ?? null,
    p_source: "desk",
    p_payment_status: input.paymentStatus,
  });
  if (error || !p) return engineErrorResponse(error, "desk register");

  if (input.checkIn) {
    const { error: ciError } = await svc
      .from("br_participants")
      .update({ check_in_status: "checked_in", checked_in_at: new Date().toISOString() })
      .eq("id", p.id);
    if (ciError) {
      console.error("[battle-royale] desk check-in failed", ciError);
      return errorResponse(GENERIC_ERROR, 500);
    }
  }
  if (input.slotId) revalidateTag(SESSIONS_TAG);

  const email = input.email && input.sendEmail ? await sendBattleEmail("registration", p.id) : { status: "skipped" as const };
  return NextResponse.json(
    { participant: { id: p.id, name: p.name, code: p.participant_code, gameCode: p.game_code }, email: email.status },
    { status: 201 },
  );
}
