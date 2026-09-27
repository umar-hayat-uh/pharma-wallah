import { NextResponse } from "next/server";
import { brLeaderboardLimiter, checkLimit } from "@/lib/rateLimit";
import { clientIpFrom, errorResponse } from "@/lib/battle-royale/server";
import { readLeaderboard } from "@/lib/battle-royale/leaderboard";

const MAX_LIMIT = 100;

/*
 * Public board. Only rank, Player ID, display name, university and scores —
 * never an email, phone or Game Code. Short CDN cache: the stall TV and a room
 * full of phones poll this, and a few seconds of staleness is invisible.
 */
export async function GET(req: Request) {
  const { success } = await checkLimit(brLeaderboardLimiter, clientIpFrom(req.headers));
  if (!success) return errorResponse("Too many requests. The board refreshes on its own.", 429);

  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get("limit") ?? 50);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT) : 50;
  const code = url.searchParams.get("code")?.trim().toUpperCase().slice(0, 20) || null;

  const board = await readLeaderboard(limit, code);
  if (!board) return errorResponse("The leaderboard is unavailable right now.", 503);
  return NextResponse.json(board, {
    headers: { "Cache-Control": code ? "private, no-store" : "public, s-maxage=5, stale-while-revalidate=10" },
  });
}
