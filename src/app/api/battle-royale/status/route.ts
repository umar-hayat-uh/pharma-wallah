import { NextResponse } from "next/server";
import { brCredentialLimiter, checkLimit } from "@/lib/rateLimit";
import { firstIssue, statusSchema } from "@/lib/battle-royale/schemas";
import { clientIpFrom, db, errorResponse, GENERIC_ERROR, readJson, readSettings } from "@/lib/battle-royale/server";
import { formatSlot } from "@/lib/battle-royale/format";
import { readResult } from "@/lib/battle-royale/result";
import type { StatusPayload } from "@/lib/battle-royale/types";

/*
 * "Where am I?" for a participant: registered → payment approved → code
 * issued → played → result. Needs the Player ID AND the registered email: the
 * Player ID alone is printed on the public board. Never returns the Game Code
 * (the desk hands it over) or any contact detail.
 */
export async function POST(req: Request) {
  const { success } = await checkLimit(brCredentialLimiter, clientIpFrom(req.headers));
  if (!success) return errorResponse("Too many lookups from this connection. Please wait a few minutes.", 429);

  const parsed = statusSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);

  const svc = await db();
  const { data: p, error } = await svc
    .from("br_participants")
    .select("id, name, email, university, participant_code, registration_status, payment_status, code_issued_at, slot:br_sessions(name, start_time, end_time)")
    .eq("participant_code", parsed.data.playerId)
    .maybeSingle();
  if (error) {
    console.error("[battle-royale] status lookup failed", error);
    return errorResponse(GENERIC_ERROR, 500);
  }
  // One message for "no such ID" and "wrong email": don't confirm which.
  if (!p || p.email !== parsed.data.email) {
    return errorResponse("We couldn't find that registration. Check your Player ID and the email you registered with.", 404);
  }

  const settings = await readSettings();
  const result = await readResult(svc, p, settings);
  const slotRaw = (p as { slot: unknown }).slot;
  const slot = (Array.isArray(slotRaw) ? slotRaw[0] : slotRaw) as { name: string; start_time: string; end_time: string } | null;

  const body: StatusPayload = {
    ...result,
    participant: {
      name: p.name,
      code: p.participant_code,
      registrationStatus: p.registration_status,
      paymentStatus: p.payment_status,
      slot: formatSlot(slot ? { name: slot.name, startTime: slot.start_time, endTime: slot.end_time } : null),
    },
    steps: {
      registered: true,
      paid: p.payment_status !== "unpaid",
      codeIssued: Boolean(p.code_issued_at),
      played: result.attemptStatus === "completed",
    },
  };
  return NextResponse.json(body);
}
