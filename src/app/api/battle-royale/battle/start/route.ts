import { NextResponse } from "next/server";
import { brCredentialLimiter, checkLimit } from "@/lib/rateLimit";
import { codeSchema, firstIssue } from "@/lib/battle-royale/schemas";
import {
  clientIpFrom,
  db,
  engineErrorResponse,
  errorResponse,
  hashToken,
  newToken,
  readJson,
  setAttemptCookie,
} from "@/lib/battle-royale/server";

/*
 * Enter the arena with the Game Code the desk issued. The code is consumed by
 * `br_start_attempt`; from then on the battle is identified only by the
 * httpOnly cookie set here.
 *
 * The response carries the WHOLE battle (every question, no answers), so the
 * station can play the rest offline and only needs the network to submit a
 * round. A re-issued code (station failure) resumes the same attempt.
 */
export async function POST(req: Request) {
  const { success } = await checkLimit(brCredentialLimiter, clientIpFrom(req.headers));
  if (!success) return errorResponse("Too many attempts from this station. Please wait a few minutes.", 429);

  const parsed = codeSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);

  const token = newToken();
  const svc = await db();
  const { data, error } = await svc.rpc("br_start_attempt", { p_code: parsed.data.code, p_token_hash: hashToken(token) });
  if (error || !data) return engineErrorResponse(error, "start");

  const res = NextResponse.json({ state: data });
  setAttemptCookie(res, token);
  return res;
}
