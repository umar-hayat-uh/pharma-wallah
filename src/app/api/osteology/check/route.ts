// POST /api/osteology/check — mark ONE practice answer and explain it.
//
// Practice only: an exam token is refused, so the exam's answers cannot be probed one
// question at a time before submission.
import { NextResponse } from "next/server";
import { errorResponse, limited, paperFor, readJson } from "@/lib/osteology/server";
import { verifySession } from "@/lib/osteology/token";

/** A practice token stays usable for a long study session, not forever. */
const PRACTICE_TTL_SECONDS = 12 * 60 * 60;

export async function POST(req: Request) {
  const blocked = await limited(req);
  if (blocked) return blocked;

  const body = await readJson(req);
  if (!body) return errorResponse("Invalid JSON", 400);

  const claims = verifySession(body.token);
  if (!claims) return errorResponse("Invalid session — start a new practice.", 401);
  if (claims.mode !== "practice") return errorResponse("Exam answers are marked when the exam is submitted.", 403);
  if (Date.now() / 1000 - claims.iat > PRACTICE_TTL_SECONDS) return errorResponse("This practice session has expired — start a new one.", 410);

  const index = Number(body.index);
  const choice = Number(body.choice);
  if (!Number.isInteger(index) || index < 0 || index >= claims.count) return errorResponse("index out of range", 400);

  const paper = paperFor(claims);
  if (!paper) return errorResponse("The lab's questions were updated — start a new practice.", 409);
  const q = paper[index];
  if (!q) return errorResponse("index out of range", 400);
  if (!Number.isInteger(choice) || choice < 0 || choice >= q.options.length) return errorResponse("choice out of range", 400);

  return NextResponse.json(
    { correct: choice === q.answer, answer: q.answer, explanation: q.explanation, learnHref: q.learnHref, topic: q.topic },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
