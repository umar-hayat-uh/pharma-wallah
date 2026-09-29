import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminGuard } from "@/lib/battle-royale/admin";
import { deskRegistrationSchema, firstIssue } from "@/lib/battle-royale/schemas";
import { SESSIONS_TAG, db, engineErrorResponse, errorResponse, readJson, readSettings } from "@/lib/battle-royale/server";
import { sendBattleEmail } from "@/lib/battle-royale/email";

/*
 * Desk registration: a walk-in at the stall. Usually paid on the spot, so the
 * payment is approved and the Game Code issued in the same step, and the
 * participant goes straight to a station with the printed slip. Email is
 * optional — a walk-in may not give one — and never contains the code.
 */
export async function POST(req: Request) {
  const guard = await adminGuard("desk");
  if (guard.response) return guard.response;

  const parsed = deskRegistrationSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const input = parsed.data;
  if ((await readSettings())?.eventClosed) {
    return errorResponse("The tournament is closed, so no new players can be registered.", 409);
  }

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

  let gameCode: string | null = null;
  if (input.approve) {
    const { data: code, error: codeError } = await svc.rpc("br_issue_code", {
      p_participant_id: p.id,
      p_payment: input.paymentStatus,
    });
    if (codeError || !code) return engineErrorResponse(codeError, "desk approve");
    gameCode = code;
  }
  if (input.slotId) revalidateTag(SESSIONS_TAG);

  const email = input.email && input.sendEmail ? await sendBattleEmail("registration", p.id) : { status: "skipped" as const };
  return NextResponse.json(
    { participant: { id: p.id, name: p.name, code: p.participant_code, gameCode }, email: email.status },
    { status: 201 },
  );
}
