import { NextResponse } from "next/server";
import { brPlayLimiter, checkLimit } from "@/lib/rateLimit";
import { attemptHashFrom, db, engineErrorResponse, errorResponse } from "@/lib/battle-royale/server";

/*
 * Reveal the current question and start its timer. The timer starts HERE, on
 * the server, when the player asks for the question — so the round intro and
 * the result screens between questions never eat into anyone's time, and a
 * reload returns the same question with the same deadline.
 */
export async function POST(req: Request) {
  const hash = attemptHashFrom(req);
  if (!hash) return errorResponse("No battle is running on this device.", 404);

  const { success } = await checkLimit(brPlayLimiter, hash);
  if (!success) return errorResponse("Slow down a little — too many requests.", 429);

  const svc = await db();
  const { data, error } = await svc.rpc("br_serve", { p_token_hash: hash });
  if (error || !data) return engineErrorResponse(error, "serve");
  return NextResponse.json({ state: data }, { headers: { "Cache-Control": "no-store" } });
}
