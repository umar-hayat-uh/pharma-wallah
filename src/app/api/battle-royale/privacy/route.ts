import { NextResponse } from "next/server";
import { brCredentialLimiter, checkLimit } from "@/lib/rateLimit";
import { firstIssue, leaderboardPrivacySchema } from "@/lib/battle-royale/schemas";
import { clientIpFrom, db, errorResponse, GENERIC_ERROR, readJson } from "@/lib/battle-royale/server";
import { invalidateLeaderboard } from "@/lib/battle-royale/leaderboard";

/*
 * A player hides (or shows) their name on the public board (2026-10-13). Same
 * proof as the status lookup — Player ID AND the registered email — because
 * the Player ID alone is public. Hidden players stay ranked and scored but are
 * listed as "Anonymous player". Needs the column added by
 * supabase/migrations/20261013_battle_royale_privacy.sql; until the owner runs
 * it, this answers 503 and says so rather than pretending to have saved.
 */
export async function POST(req: Request) {
  const { success } = await checkLimit(brCredentialLimiter, clientIpFrom(req.headers));
  if (!success) return errorResponse("Too many attempts from this connection. Please wait a few minutes.", 429);

  const parsed = leaderboardPrivacySchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);

  const svc = await db();
  const { data: p, error } = await svc
    .from("br_participants")
    .select("id, email")
    .eq("participant_code", parsed.data.playerId)
    .maybeSingle();
  if (error) {
    console.error("[battle-royale] privacy lookup failed", error);
    return errorResponse(GENERIC_ERROR, 500);
  }
  if (!p || p.email !== parsed.data.email) {
    return errorResponse("We couldn't find that registration. Check your Player ID and the email you registered with.", 404);
  }

  const { error: upd } = await svc
    .from("br_participants")
    .update({ hide_from_leaderboard: parsed.data.hide })
    .eq("id", p.id);
  if (upd) {
    if (/hide_from_leaderboard/.test(upd.message ?? "")) {
      return errorResponse("This option isn't switched on yet. Please ask the organisers to hide your name.", 503);
    }
    console.error("[battle-royale] privacy update failed", upd);
    return errorResponse(GENERIC_ERROR, 500);
  }
  await invalidateLeaderboard();
  return NextResponse.json({ hidden: parsed.data.hide });
}
