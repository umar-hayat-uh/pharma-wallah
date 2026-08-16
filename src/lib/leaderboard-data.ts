import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { redis } from "@/lib/tournament-redis";

export interface LeaderboardEntry {
  id: number;
  code: string;
  name: string;
  gameType: string;
  score: number;
  timeTaken: number | null;
  attempt: number;
  playedAt: string;
}

export type LeaderboardData = Record<"mcq" | "flashcard" | "spotting", LeaderboardEntry[]>;

const CACHE_KEY = "tournament:leaderboard:v1";
const CACHE_TTL_SECONDS = 30; // matches ISR revalidate window

const EMPTY: LeaderboardData = { mcq: [], flashcard: [], spotting: [] };

/**
 * Fetches the leaderboard, using Redis as a cache in front of Supabase.
 *
 * WHY THIS MATTERS AT 600-1000 PEOPLE:
 * Without this, every leaderboard page view (and the old 60s poll) hits
 * Postgres directly. With this cache, only ONE request every 30 seconds
 * actually touches the database — everyone else (viewers refreshing,
 * ISR revalidation, manual refreshes) reads from Redis, which is fast
 * and cheap on Upstash's free tier.
 *
 * We use the `tournament_leaderboard_best` VIEW (see migration.sql) so
 * Postgres does the "best score per code per game" dedup, not JS.
 */
export async function getLeaderboardData(): Promise<LeaderboardData> {
  try {
    const cached = await redis.get<LeaderboardData>(CACHE_KEY);
    if (cached) return cached;
  } catch (err) {
    // Redis being briefly unavailable should never take down the leaderboard.
    console.error("Leaderboard cache read failed, falling back to DB:", err);
  }

  const fresh = await fetchLeaderboardFromDb();

  try {
    await redis.set(CACHE_KEY, fresh, { ex: CACHE_TTL_SECONDS });
  } catch (err) {
    console.error("Leaderboard cache write failed (non-fatal):", err);
  }

  return fresh;
}

async function fetchLeaderboardFromDb(): Promise<LeaderboardData> {
  const supabase = await createServiceSupabaseClient();

  const { data: rows, error } = await supabase
    .from("tournament_leaderboard_best")
    .select("id, entry_code, game_type, score, time_taken, attempt_number, played_at, team_name")
    .order("score", { ascending: false })
    .order("time_taken", { ascending: true, nullsFirst: false })
    .limit(300); // generous cap; UI slices top N per game

  if (error || !rows) {
    console.error("Leaderboard DB fetch failed:", error);
    return EMPTY;
  }

  const entryCodes = Array.from(new Set(rows.map((r: any) => r.entry_code)));

  const { data: registrations } = await supabase
    .from("tournament_registrations")
    .select("entry_code, name")
    .in("entry_code", entryCodes.length > 0 ? entryCodes : ["__none__"]);

  const nameMap: Record<string, string> = {};
  (registrations || []).forEach((reg: any) => {
    if (reg.entry_code && reg.name) nameMap[reg.entry_code] = reg.name;
  });

  const result: LeaderboardData = { mcq: [], flashcard: [], spotting: [] };

  for (const row of rows as any[]) {
    const displayName = nameMap[row.entry_code] || row.team_name || "Anonymous";
    const entry: LeaderboardEntry = {
      id: row.id,
      code: row.entry_code,
      name: displayName,
      gameType: row.game_type,
      score: row.score,
      timeTaken: row.time_taken ?? null,
      attempt: row.attempt_number,
      playedAt: row.played_at,
    };
    if (entry.gameType === "mcq" || entry.gameType === "flashcard" || entry.gameType === "spotting") {
      result[entry.gameType].push(entry);
    }
  }

  // Rows already sorted by score/time from the SQL query; trim to top 25 per game.
  result.mcq = result.mcq.slice(0, 25);
  result.flashcard = result.flashcard.slice(0, 25);
  result.spotting = result.spotting.slice(0, 25);

  return result;
}

/**
 * Call this after a score is submitted to proactively refresh the cache
 * instead of waiting for it to expire. Fire-and-forget — never blocks
 * the score submission response.
 */
export async function invalidateLeaderboardCache(): Promise<void> {
  try {
    await redis.del(CACHE_KEY);
  } catch (err) {
    console.error("Leaderboard cache invalidation failed (non-fatal):", err);
  }
}
