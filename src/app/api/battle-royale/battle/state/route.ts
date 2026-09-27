import { NextResponse } from "next/server";
import { brPlayLimiter, checkLimit } from "@/lib/rateLimit";
import {
  attemptHashFrom,
  clearAttemptCookie,
  db,
  engineCode,
  engineErrorResponse,
  errorResponse,
} from "@/lib/battle-royale/server";

export const dynamic = "force-dynamic";

/** The battle on this device, with any expired timer applied first. */
export async function GET(req: Request) {
  const hash = attemptHashFrom(req);
  if (!hash) return NextResponse.json({ state: null });

  const { success } = await checkLimit(brPlayLimiter, hash);
  if (!success) return errorResponse("Slow down a little — too many requests.", 429);

  const svc = await db();
  const { data, error } = await svc.rpc("br_state", { p_token_hash: hash });
  if (error) {
    // A token that no longer resolves (resumed elsewhere, reset by an admin)
    // is not an error for the station: forget it and show the arena gate.
    const code = engineCode(error);
    if (code === "BR_NO_ATTEMPT" || code === "BR_ATTEMPT_VOID") {
      const res = NextResponse.json({ state: null, notice: code });
      clearAttemptCookie(res);
      return res;
    }
    return engineErrorResponse(error, "state");
  }
  return NextResponse.json({ state: data }, { headers: { "Cache-Control": "no-store" } });
}

/** "Finish" on the results screen: forget this device's battle for the next player. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  clearAttemptCookie(res);
  return res;
}
