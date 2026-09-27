import { NextResponse } from "next/server";
import { brCredentialLimiter, checkLimit } from "@/lib/rateLimit";
import { credentialsSchema, firstIssue } from "@/lib/battle-royale/schemas";
import { clientIpFrom, db, errorResponse, GENERIC_ERROR, readJson, readSettings } from "@/lib/battle-royale/server";

/*
 * A participant's own result: needs the Game Code for the same reason
 * check-in does. The final status is only reported once an admin has
 * finalised the results — before that it is "pending", never a guessed
 * "Winner" from a board that may still change.
 */
export async function POST(req: Request) {
  const { success } = await checkLimit(brCredentialLimiter, clientIpFrom(req.headers));
  if (!success) return errorResponse("Too many attempts from this connection. Please wait a few minutes.", 429);

  const parsed = credentialsSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const identifier = parsed.data.identifier.trim();

  const svc = await db();
  const column = identifier.includes("@") ? "email" : "participant_code";
  const value = column === "email" ? identifier.toLowerCase() : identifier.toUpperCase();
  const { data: p, error } = await svc
    .from("br_participants")
    .select("id, name, participant_code, game_code, registration_status")
    .eq(column, value)
    .maybeSingle();
  if (error) {
    console.error("[battle-royale] results lookup failed", error);
    return errorResponse(GENERIC_ERROR, 500);
  }
  if (!p || p.game_code !== parsed.data.gameCode) {
    return errorResponse("Participant not found. Check your Player ID (or email) and Game Code.", 404);
  }

  const [{ data: score }, { data: board }, { data: attempt }, settings] = await Promise.all([
    svc.from("br_scores").select("*").eq("participant_id", p.id).maybeSingle(),
    svc.from("br_leaderboard").select("rank").eq("participant_id", p.id).maybeSingle(),
    svc.from("br_attempts").select("status").eq("participant_id", p.id).neq("status", "void").maybeSingle(),
    readSettings(),
  ]);

  return NextResponse.json({
    participant: { name: p.name, code: p.participant_code, registrationStatus: p.registration_status },
    attemptStatus: attempt?.status ?? null,
    score: score
      ? {
          rounds: [score.round1_score, score.round2_score, score.round3_score],
          total: score.total_score,
          correct: score.correct_count,
          questions: score.total_questions,
          timeMs: score.total_time_ms,
          completedAt: score.completed_at,
          finalStatus: settings?.resultsFinalized || score.status_overridden ? score.final_status : "pending",
        }
      : null,
    rank: board?.rank ?? null,
    finalized: settings?.resultsFinalized ?? false,
    frozen: Boolean(settings?.leaderboardFrozenAt),
    winnersCount: settings?.winnersCount ?? 10,
  });
}
