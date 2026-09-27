/**
 * Battle Royale — the public board. Server-only (service client).
 *
 * The `br_leaderboard` view already ranks (total, then Round 3, then faster
 * time), drops disqualified participants and ignores scores completed after a
 * freeze. This module only projects it onto the public shape — the column list
 * below is the whole of what anyone outside the admin can see.
 */
import { db, readSettings } from "./server";
import { shortName } from "./format";
import type { FinalStatus, LeaderboardPayload, LeaderboardRow } from "./types";

const PUBLIC_COLUMNS =
  "rank, participant_code, name, university, round1_score, round2_score, round3_score, total_score, correct_count, total_questions, total_time_ms, final_status";

type Row = {
  rank: number; participant_code: string; name: string; university: string;
  round1_score: number; round2_score: number; round3_score: number; total_score: number;
  correct_count: number; total_questions: number; total_time_ms: number; final_status: FinalStatus;
};

function project(r: Row, fullNames: boolean, finalized: boolean): LeaderboardRow {
  return {
    rank: r.rank,
    code: r.participant_code,
    name: fullNames ? r.name : shortName(r.name),
    university: r.university,
    total: r.total_score,
    rounds: [r.round1_score, r.round2_score, r.round3_score],
    correct: r.correct_count,
    questions: r.total_questions,
    timeMs: r.total_time_ms,
    // Before finalising, nobody is labelled a winner by the public board.
    finalStatus: finalized ? r.final_status : "pending",
  };
}

export async function readLeaderboard(limit: number, code: string | null): Promise<LeaderboardPayload | null> {
  const settings = await readSettings();
  if (!settings) return null;
  const svc = await db();

  const [top, count, you] = await Promise.all([
    svc
      .from("br_leaderboard")
      .select(PUBLIC_COLUMNS)
      .order("rank", { ascending: true })
      .order("completed_at", { ascending: true })
      .limit(limit),
    svc.from("br_leaderboard").select("participant_id", { count: "exact", head: true }),
    code
      ? svc.from("br_leaderboard").select(PUBLIC_COLUMNS).eq("participant_code", code).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (top.error) {
    console.error("[battle-royale] leaderboard read failed", top.error);
    return null;
  }

  const full = settings.showFullNames;
  const fin = settings.resultsFinalized;
  return {
    rows: (top.data as Row[]).map((r) => project(r, full, fin)),
    totalRanked: count.count ?? top.data.length,
    frozenAt: settings.leaderboardFrozenAt,
    finalized: fin,
    winnersCount: settings.winnersCount,
    you: you.data ? project(you.data as Row, full, fin) : null,
    updatedAt: new Date().toISOString(),
  };
}
