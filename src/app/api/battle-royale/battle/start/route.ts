import { NextResponse } from "next/server";
import { brCredentialLimiter, checkLimit } from "@/lib/rateLimit";
import { credentialsSchema, firstIssue } from "@/lib/battle-royale/schemas";
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
 * Enter the arena: (Player ID or email) + Game Code → a battle token in an
 * httpOnly cookie. From here on the browser never names a participant again;
 * every battle request is resolved from the token's hash inside Postgres.
 *
 * If the participant already has a battle in progress (a crashed station, a
 * different device) the SAME attempt is resumed on this device and the old
 * token stops working. A finished attempt can never be restarted.
 */
export async function POST(req: Request) {
  const { success } = await checkLimit(brCredentialLimiter, clientIpFrom(req.headers));
  if (!success) return errorResponse("Too many attempts from this station. Please wait a few minutes.", 429);

  const parsed = credentialsSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);

  const token = newToken();
  const svc = await db();
  const { data, error } = await svc.rpc("br_start_attempt", {
    p_identifier: parsed.data.identifier,
    p_game_code: parsed.data.gameCode,
    p_token_hash: hashToken(token),
  });
  if (error || !data) return engineErrorResponse(error, "start");

  const res = NextResponse.json({ state: data });
  setAttemptCookie(res, token);
  return res;
}
