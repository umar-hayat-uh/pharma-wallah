/**
 * Battle Royale — the public board. Server-only (service client).
 *
 * The `br_leaderboard` view already ranks (total, then the shorter battle
 * time — 20260930_battle_royale_ranking.sql), drops disqualified
 * participants and ignores scores completed after a freeze. This module only projects it onto the public shape — the column list
 * below is the whole of what anyone outside the admin can see.
 */
import { redis } from "@/lib/redis";
import { firstName } from "./format";
import { compareBoardRows } from "./ranking";
import { db, readSettings } from "./server";
import type { FinalStatus, LeaderboardPayload, LeaderboardRow } from "./types";

const PUBLIC_COLUMNS =
  "rank, participant_code, name, university, round1_score, round2_score, round3_score, total_score, correct_count, total_questions, total_time_ms, final_status";

type Row = {
  rank: number; participant_code: string; name: string; university: string;
  round1_score: number; round2_score: number; round3_score: number; total_score: number;
  correct_count: number; total_questions: number; total_time_ms: number; final_status: FinalStatus;
};

/*
 * Privacy (2026-10-13, AdSense remediation — supersedes the 2026-09-30
 * full-names decision): the public board shows a FIRST NAME only and no
 * institution, and a player who opted out (br_participants.hide_from_leaderboard,
 * set from the result page) appears as "Anonymous player". Rank and score stay,
 * so the order is still checkable. Full names remain on the player's own
 * certificate only.
 */
function project(r: Row, finalized: boolean, hidden: ReadonlySet<string>): LeaderboardRow {
  return {
    rank: r.rank,
    code: r.participant_code,
    name: hidden.has(r.participant_code) ? "Anonymous player" : firstName(r.name),
    university: "",
    total: r.total_score,
    rounds: [r.round1_score, r.round2_score, r.round3_score],
    correct: r.correct_count,
    questions: r.total_questions,
    timeMs: r.total_time_ms,
    // Before finalising, nobody is labelled a winner by the public board.
    finalStatus: finalized ? r.final_status : "pending",
  };
}

/*
 * Upstash cache. The stall TV and every phone poll the board, and each read is
 * three Postgres queries — so the ranked page is cached for CACHE_SECONDS and
 * dropped the moment a battle finishes or an admin freezes/finalises. Like
 * every cache here it fails open: no Redis, or a Redis error, reads Postgres.
 * Only the shared part is cached; "your row" is looked up per request.
 */
const CACHE_SECONDS = 20;
// v3 (2026-10-13): first names only — a new key drops cached full-name rows at deploy.
const cacheKey = (limit: number) => `br:leaderboard:v3:${limit}`;
const CACHED_LIMITS = [20, 50, 100];

export async function invalidateLeaderboard() {
  if (!redis) return;
  try {
    await redis.del(...CACHED_LIMITS.map(cacheKey));
  } catch (err) {
    console.error("[battle-royale] leaderboard cache delete failed", err);
  }
}

type Shared = Omit<LeaderboardPayload, "you">;

async function readShared(limit: number): Promise<Shared | null> {
  const settings = await readSettings();
  if (!settings) return null;
  const svc = await db();
  const [top, count] = await Promise.all([
    svc
      .from("br_leaderboard")
      .select(PUBLIC_COLUMNS)
      .order("rank", { ascending: true })
      .order("completed_at", { ascending: true })
      .limit(limit),
    svc.from("br_leaderboard").select("participant_id", { count: "exact", head: true }),
  ]);
  if (top.error) {
    console.error("[battle-royale] leaderboard read failed", top.error);
    return null;
  }
  const fin = settings.resultsFinalized;
  const hidden = await readHidden(svc);
  return {
    // Re-sorted with the board's own rule so a tie never depends on row order from PostgREST.
    rows: (top.data as Row[]).map((r) => project(r, fin, hidden)).sort(compareBoardRows),
    totalRanked: count.count ?? top.data.length,
    frozenAt: settings.leaderboardFrozenAt,
    finalized: fin,
    winnersCount: settings.winnersCount,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Player IDs that opted out of the public board. Tolerant of a database where
 * supabase/migrations/20261013_battle_royale_privacy.sql has not been run yet:
 * a missing column reads as "nobody opted out".
 */
async function readHidden(svc: Awaited<ReturnType<typeof db>>): Promise<Set<string>> {
  const { data, error } = await svc
    .from("br_participants")
    .select("participant_code")
    .eq("hide_from_leaderboard", true);
  if (error) {
    if (!/hide_from_leaderboard/.test(error.message ?? "")) console.error("[battle-royale] opt-out read failed", error);
    return new Set();
  }
  return new Set((data ?? []).map((r: { participant_code: string }) => r.participant_code));
}

export async function readLeaderboard(limit: number, code: string | null): Promise<LeaderboardPayload | null> {
  // Round to a cached size so a handful of keys serve every caller.
  const size = CACHED_LIMITS.find((l) => l >= limit) ?? 100;

  let shared: Shared | null = null;
  if (redis) {
    try {
      shared = (await redis.get<Shared>(cacheKey(size))) ?? null;
    } catch (err) {
      console.error("[battle-royale] leaderboard cache read failed", err);
    }
  }
  if (!shared) {
    shared = await readShared(size);
    if (!shared) return null;
    if (redis) {
      try {
        await redis.set(cacheKey(size), shared, { ex: CACHE_SECONDS });
      } catch (err) {
        console.error("[battle-royale] leaderboard cache write failed", err);
      }
    }
  }

  let you: LeaderboardRow | null = null;
  if (code) {
    const svc = await db();
    const { data } = await svc.from("br_leaderboard").select(PUBLIC_COLUMNS).eq("participant_code", code).maybeSingle();
    if (data) you = project(data as Row, shared.finalized, await readHidden(svc));
  }
  return { ...shared, rows: shared.rows.slice(0, limit), you };
}
