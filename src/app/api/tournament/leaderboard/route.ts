import { getLeaderboardData } from "@/lib/leaderboard-data";
import { NextResponse } from "next/server";

/**
 * This route exists mainly for the manual "Refresh" button on the
 * leaderboard page (see LeaderboardClient.tsx) — the primary rendering
 * path is the server component with ISR (revalidate = 30s), which does
 * NOT go through this route at all. This keeps both paths sharing the
 * same Redis-cached data layer, so neither path can bypass the cache.
 */
export async function GET() {
  const data = await getLeaderboardData();
  return NextResponse.json(data);
}
