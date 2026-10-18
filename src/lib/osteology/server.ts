/**
 * SERVER-ONLY helpers shared by the /api/osteology/* routes.
 */
import { NextResponse } from "next/server";
import { checkLimit, osteologyLimiter } from "@/lib/rateLimit";
import { clientIpFrom } from "@/lib/ai-guide/pure";
import { buildPaper, poolFor, poolHash, type FullQuestion } from "./questions";
import type { SessionClaims } from "./token";

export const errorResponse = (error: string, status: number) => NextResponse.json({ error }, { status });

/** null = allowed; otherwise the 429 to return. */
export async function limited(req: Request): Promise<NextResponse | null> {
  const { success } = await checkLimit(osteologyLimiter, clientIpFrom(req.headers));
  return success ? null : errorResponse("Too many requests — wait a moment and try again.", 429);
}

/**
 * Re-create the paper a token was issued for. Returns null if the lab's content changed
 * since (a deploy between starting and submitting): grading against a different paper
 * would mark the wrong answers.
 */
export function paperFor(claims: SessionClaims): FullQuestion[] | null {
  const filter = { regions: claims.regions, types: claims.types, scope: claims.scope };
  if (poolHash(poolFor(filter)) !== claims.pool) return null;
  return buildPaper(filter, claims.count, claims.seed);
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
