import { NextResponse } from "next/server";
import { brPlayLimiter, checkLimit } from "@/lib/rateLimit";
import { answerSchema, firstIssue } from "@/lib/battle-royale/schemas";
import { attemptHashFrom, db, engineErrorResponse, errorResponse, readJson } from "@/lib/battle-royale/server";

/*
 * Submit one answer. The body carries only the question id and the answer —
 * no participant, no score, no time. `br_answer` checks the question is the one
 * being served to this attempt, grades it, applies the timer, records it
 * (unique per attempt + question) and returns the result with the correct
 * answer revealed AFTER it has been recorded.
 */
export async function POST(req: Request) {
  const hash = attemptHashFrom(req);
  if (!hash) return errorResponse("No battle is running on this device.", 404);

  const { success } = await checkLimit(brPlayLimiter, hash);
  if (!success) return errorResponse("Slow down a little — too many requests.", 429);

  const parsed = answerSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);

  const svc = await db();
  const { data, error } = await svc.rpc("br_answer", {
    p_token_hash: hash,
    p_question_id: parsed.data.questionId,
    p_answer: parsed.data.answer,
  });
  if (error || !data) return engineErrorResponse(error, "answer");
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
