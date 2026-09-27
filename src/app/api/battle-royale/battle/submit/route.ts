import { NextResponse } from "next/server";
import { brPlayLimiter, checkLimit } from "@/lib/rateLimit";
import { firstIssue, submitRoundSchema } from "@/lib/battle-royale/schemas";
import { attemptHashFrom, db, engineErrorResponse, errorResponse, readJson } from "@/lib/battle-royale/server";
import { invalidateLeaderboard } from "@/lib/battle-royale/leaderboard";

/*
 * Submit one whole round — three calls per battle, not one per question. The
 * body carries only answers: no participant, no score, no time. The engine
 * checks the round is next, applies the server-side round window, grades,
 * records, and returns the graded result with the answers revealed.
 *
 * Safe to retry blindly: a round already graded returns its stored result.
 * The station's offline queue relies on that.
 */
export async function POST(req: Request) {
  const hash = attemptHashFrom(req);
  if (!hash) return errorResponse("No battle is running on this device.", 404);

  const { success } = await checkLimit(brPlayLimiter, hash);
  if (!success) return errorResponse("Slow down a little — too many requests.", 429);

  const parsed = submitRoundSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);

  const svc = await db();
  const { data, error } = await svc.rpc("br_submit_round", {
    p_token_hash: hash,
    p_round: parsed.data.round,
    p_answers: parsed.data.answers,
  });
  if (error || !data) return engineErrorResponse(error, "submit round");

  // A finished battle changes the board: drop the cached copy.
  if (parsed.data.round === 3 && !data.repeat) await invalidateLeaderboard();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
