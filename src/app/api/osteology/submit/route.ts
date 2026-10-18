// POST /api/osteology/submit — grade a mock practical exam.
//
// The score is computed here from the rebuilt paper; the browser sends only its chosen
// option per station. Time is checked against the token's signed issue time, not the
// browser's clock. A signed-in student's attempt is written to quiz_attempts once
// (Route-enforced model: service-role client, row owned by the authenticated user).
import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase-server";
import { applyProgressEvent, invalidateProgressCache } from "@/lib/progress-server";
import { redis } from "@/lib/redis";
import { getPreset, SUBMIT_GRACE_SECONDS } from "@/lib/osteology/exam-config";
import { grade } from "@/lib/osteology/questions";
import { errorResponse, limited, paperFor, readJson } from "@/lib/osteology/server";
import { verifySession } from "@/lib/osteology/token";

/** After this, a paper can no longer be graded at all (a tab left open for days). */
const HARD_EXPIRY_SECONDS = 6 * 60 * 60;

export async function POST(req: Request) {
  const blocked = await limited(req);
  if (blocked) return blocked;

  const body = await readJson(req);
  if (!body) return errorResponse("Invalid JSON", 400);

  const claims = verifySession(body.token);
  if (!claims) return errorResponse("Invalid exam session.", 401);
  if (claims.mode !== "exam") return errorResponse("Only exams are submitted; practice is checked per question.", 400);

  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - claims.iat;
  if (elapsed > claims.limit + HARD_EXPIRY_SECONDS) return errorResponse("This exam expired — start a new one.", 410);
  const late = elapsed > claims.limit + SUBMIT_GRACE_SECONDS;

  if (!Array.isArray(body.answers) || body.answers.length > claims.count) {
    return errorResponse("answers must be an array with one entry per station", 400);
  }
  const answers = (body.answers as unknown[]).map((a) => (typeof a === "number" ? a : null));

  const paper = paperFor(claims);
  if (!paper) return errorResponse("The lab's questions were updated during your exam — please start a new one.", 409);

  const result = grade(paper, answers, claims.marks);
  const timeTakenSec = Math.min(elapsed, claims.limit);

  // Record for a signed-in student, once per paper, and only if it was in time.
  let recorded = false;
  let signedIn = false;
  if (!late) {
    try {
      const userSupabase = await createServerSupabaseClient();
      const { data: { user } } = await userSupabase.auth.getUser();
      if (user) {
        signedIn = true;
        // SET NX makes a resubmitted paper a no-op. Without Redis this fails open:
        // a double submit can then write a duplicate history row, which is harmless.
        let first = true;
        if (redis) {
          try {
            first = (await redis.set(`osteology:recorded:${claims.id}`, user.id, { nx: true, ex: 86400 })) === "OK";
          } catch (err) {
            console.error("[osteology submit] redis set failed, recording anyway", err);
          }
        }
        if (first) {
          const service = await createServiceSupabaseClient();
          await applyProgressEvent(service, user, {
            type: "quiz",
            quizId: `osteology:${claims.preset}`,
            subject: `Osteology Lab · ${getPreset(claims.preset)?.title ?? claims.preset}`,
            score: result.correct,
            total: result.total,
            timeTakenMin: Math.round((timeTakenSec / 60) * 10) / 10,
            href: "/osteology-lab/progress",
          });
          await invalidateProgressCache(user.id);
          recorded = true;
        }
      }
    } catch (err) {
      // Grading never fails because history could not be saved.
      console.error("[osteology submit] could not record attempt", err);
    }
  }

  return NextResponse.json(
    { ...result, late, recorded, signedIn, timeTakenSec, preset: claims.preset, marksPer: claims.marks },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
