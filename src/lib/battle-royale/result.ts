/**
 * Battle Royale — one participant's result: score, rank, titles and the
 * e-certificate. Server-only (service client). Shared by the two public
 * lookups — Player ID + email (`/api/battle-royale/status`) and the name
 * search (`/api/battle-royale/certificates`) — so a certificate is computed
 * one way however the player finds it.
 */
import { accuracy, allowedMsFromPlan, earnedTitles, perfectRounds } from "./titles";
import type { db } from "./server";
import type { BattlePlan, PublicSettings, ResultPayload, RoundResult } from "./types";

type Svc = Awaited<ReturnType<typeof db>>;

export type ResultParticipant = {
  id: string;
  name: string;
  university: string | null;
  participant_code: string;
  registration_status: string;
};

export async function readResult(
  svc: Svc,
  p: ResultParticipant,
  settings: PublicSettings | null,
): Promise<ResultPayload & { attemptStatus: "active" | "completed" | null }> {
  const [{ data: score }, { data: board }, { data: attempt }] = await Promise.all([
    svc.from("br_scores").select("*").eq("participant_id", p.id).maybeSingle(),
    svc.from("br_leaderboard").select("rank").eq("participant_id", p.id).maybeSingle(),
    svc.from("br_attempts").select("status, public_plan, round_results").eq("participant_id", p.id).neq("status", "void").maybeSingle(),
  ]);

  // Titles come from the player's own battle (titles.ts), so they are final the
  // moment the battle is. The certificate is the gold "Top N" design only once
  // results are finalised — before that nobody is labelled a winner (skill: Do Not).
  const finalStatus = score
    ? settings?.resultsFinalized || score.status_overridden ? score.final_status : "pending"
    : "pending";
  const titles =
    score && attempt?.status === "completed"
      ? earnedTitles({
          correct: score.correct_count,
          questions: score.total_questions,
          timeMs: score.total_time_ms,
          allowedMs: allowedMsFromPlan(attempt.public_plan as BattlePlan | null),
          perfect: perfectRounds(attempt.round_results as Partial<Record<"1" | "2" | "3", RoundResult>> | null),
        })
      : [];
  const finalized = settings?.resultsFinalized ?? false;
  const certificate: ResultPayload["certificate"] =
    score && titles.length > 0 && p.registration_status === "registered"
      ? {
          kind: finalStatus === "winner" ? "winner" : "participant",
          name: p.name,
          code: p.participant_code,
          university: p.university ?? "",
          total: score.total_score,
          accuracy: Math.round(accuracy(score.correct_count, score.total_questions) * 100),
          rank: finalized ? board?.rank ?? null : null,
          title: titles[0].name,
          eventTitle: settings?.eventTitle || "PharmaWallah Battle Royale",
          eventDate: settings?.eventDate ?? null,
          completedAt: score.completed_at,
        }
      : null;

  return {
    participant: { name: p.name, code: p.participant_code },
    attemptStatus: (attempt?.status as "active" | "completed" | undefined) ?? null,
    score: score
      ? {
          rounds: [score.round1_score, score.round2_score, score.round3_score],
          total: score.total_score,
          correct: score.correct_count,
          questions: score.total_questions,
          timeMs: score.total_time_ms,
          finalStatus,
        }
      : null,
    rank: board?.rank ?? null,
    finalized,
    closed: settings?.eventClosed ?? false,
    titles,
    certificate,
    frozen: Boolean(settings?.leaderboardFrozenAt),
    winnersCount: settings?.winnersCount ?? 10,
  };
}
