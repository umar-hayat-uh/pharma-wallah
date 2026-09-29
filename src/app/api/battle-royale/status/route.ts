import { NextResponse } from "next/server";
import { brCredentialLimiter, checkLimit } from "@/lib/rateLimit";
import { firstIssue, statusSchema } from "@/lib/battle-royale/schemas";
import { clientIpFrom, db, errorResponse, GENERIC_ERROR, readJson, readSettings } from "@/lib/battle-royale/server";
import { formatSlot } from "@/lib/battle-royale/format";
import { accuracy, allowedMsFromPlan, earnedTitles, perfectRounds } from "@/lib/battle-royale/titles";
import type { BattlePlan, RoundResult, StatusPayload } from "@/lib/battle-royale/types";

/*
 * "Where am I?" for a participant: registered → payment approved → code
 * issued → played → result. Needs the Player ID AND the registered email: the
 * Player ID alone is printed on the public board. Never returns the Game Code
 * (the desk hands it over) or any contact detail.
 */
export async function POST(req: Request) {
  const { success } = await checkLimit(brCredentialLimiter, clientIpFrom(req.headers));
  if (!success) return errorResponse("Too many lookups from this connection. Please wait a few minutes.", 429);

  const parsed = statusSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);

  const svc = await db();
  const { data: p, error } = await svc
    .from("br_participants")
    .select("id, name, email, university, participant_code, registration_status, payment_status, code_issued_at, slot:br_sessions(name, start_time, end_time)")
    .eq("participant_code", parsed.data.playerId)
    .maybeSingle();
  if (error) {
    console.error("[battle-royale] status lookup failed", error);
    return errorResponse(GENERIC_ERROR, 500);
  }
  // One message for "no such ID" and "wrong email": don't confirm which.
  if (!p || p.email !== parsed.data.email) {
    return errorResponse("We couldn't find that registration. Check your Player ID and the email you registered with.", 404);
  }

  const [{ data: score }, { data: board }, { data: attempt }, settings] = await Promise.all([
    svc.from("br_scores").select("*").eq("participant_id", p.id).maybeSingle(),
    svc.from("br_leaderboard").select("rank").eq("participant_id", p.id).maybeSingle(),
    svc.from("br_attempts").select("status, public_plan, round_results").eq("participant_id", p.id).neq("status", "void").maybeSingle(),
    readSettings(),
  ]);
  const slotRaw = (p as { slot: unknown }).slot;
  const slot = (Array.isArray(slotRaw) ? slotRaw[0] : slotRaw) as { name: string; start_time: string; end_time: string } | null;

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
  const certificate: StatusPayload["certificate"] =
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

  const body: StatusPayload = {
    participant: {
      name: p.name,
      code: p.participant_code,
      registrationStatus: p.registration_status,
      paymentStatus: p.payment_status,
      slot: formatSlot(slot ? { name: slot.name, startTime: slot.start_time, endTime: slot.end_time } : null),
    },
    steps: {
      registered: true,
      paid: p.payment_status !== "unpaid",
      codeIssued: Boolean(p.code_issued_at),
      played: attempt?.status === "completed",
    },
    attemptStatus: (attempt?.status as StatusPayload["attemptStatus"]) ?? null,
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
    titles,
    certificate,
    frozen: Boolean(settings?.leaderboardFrozenAt),
    winnersCount: settings?.winnersCount ?? 10,
  };
  return NextResponse.json(body);
}
