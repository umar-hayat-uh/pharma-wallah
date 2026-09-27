import { NextResponse } from "next/server";
import { brCredentialLimiter, checkLimit } from "@/lib/rateLimit";
import { credentialsSchema, firstIssue } from "@/lib/battle-royale/schemas";
import { clientIpFrom, db, errorResponse, GENERIC_ERROR, readJson } from "@/lib/battle-royale/server";
import { sendBattleEmail } from "@/lib/battle-royale/email";
import { formatSlot } from "@/lib/battle-royale/format";

/*
 * Self check-in. The participant proves who they are with (Player ID or email)
 * + Game Code — a Player ID alone is printed on the public leaderboard, so it
 * can never be enough. Payment is the desk's job: an unpaid participant is
 * told where to pay and is NOT checked in, so this page can't be used to skip
 * the fee. An admin can set any check-in state from the participants page.
 */
export async function POST(req: Request) {
  const { success } = await checkLimit(brCredentialLimiter, clientIpFrom(req.headers));
  if (!success) return errorResponse("Too many attempts from this connection. Please wait a few minutes.", 429);

  const parsed = credentialsSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const identifier = parsed.data.identifier.trim();

  const svc = await db();
  const column = identifier.includes("@") ? "email" : "participant_code";
  const value = column === "email" ? identifier.toLowerCase() : identifier.toUpperCase();
  const { data: p, error } = await svc
    .from("br_participants")
    .select("id, name, participant_code, game_code, registration_status, payment_status, check_in_status, slot:br_sessions(name, start_time, end_time, status)")
    .eq(column, value)
    .maybeSingle();
  if (error) {
    console.error("[battle-royale] check-in lookup failed", error);
    return errorResponse(GENERIC_ERROR, 500);
  }
  // Same message for "no such participant" and "wrong code": don't confirm which.
  if (!p || p.game_code !== parsed.data.gameCode) {
    return errorResponse("Participant not found. Check your Player ID (or email) and Game Code.", 404);
  }

  const slotRaw = (p as { slot: unknown }).slot;
  const slot = (Array.isArray(slotRaw) ? slotRaw[0] : slotRaw) as
    | { name: string; start_time: string; end_time: string; status: string }
    | null
    | undefined;

  let checkIn = p.check_in_status as string;
  let outcome: "checked_in" | "already" | "unpaid" | "blocked" = "already";

  if (p.registration_status !== "registered") {
    outcome = "blocked";
  } else if (p.payment_status === "unpaid") {
    outcome = "unpaid";
  } else if (checkIn === "not_checked_in") {
    // Past the slot's end, the check-in is recorded as late.
    const late = slot?.end_time ? Date.now() > Date.parse(slot.end_time) : false;
    const next = late ? "late" : "checked_in";
    const { error: updError } = await svc
      .from("br_participants")
      .update({ check_in_status: next, checked_in_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", p.id)
      .eq("check_in_status", "not_checked_in");
    if (updError) {
      console.error("[battle-royale] check-in update failed", updError);
      return errorResponse(GENERIC_ERROR, 500);
    }
    checkIn = next;
    outcome = "checked_in";
    await sendBattleEmail("check_in", p.id);
  }

  return NextResponse.json({
    outcome,
    participant: {
      name: p.name,
      code: p.participant_code,
      slot: formatSlot(slot ? { name: slot.name, startTime: slot.start_time, endTime: slot.end_time } : null),
      registrationStatus: p.registration_status,
      paymentStatus: p.payment_status,
      checkInStatus: checkIn,
    },
  });
}
