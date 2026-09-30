import { NextResponse } from "next/server";
import { brLookupLimiter, checkLimit } from "@/lib/rateLimit";
import { clientIpFrom, db, errorResponse, GENERIC_ERROR, readSettings } from "@/lib/battle-royale/server";
import { certificateQuery } from "@/lib/battle-royale/format";
import { readResult } from "@/lib/battle-royale/result";
import type { CertificateMatch, ResultPayload } from "@/lib/battle-royale/types";

const MAX_MATCHES = 12;
const CODE_RE = /^BR-\d{4}-\d{4,}$/;

/*
 * "Find your certificate" — no Player ID or email needed (user decision
 * 2026-09-30: players forget their ID). Two reads:
 *
 *   GET ?q=ayesha         → up to 12 players whose name matches
 *   GET ?code=BR-2026-0007 → that player's result and certificate
 *
 * Only registered players who FINISHED a battle are searchable, and the
 * payload is the same thing the public leaderboard already prints (name,
 * university, Player ID, score, rank) plus titles derived from it — never an
 * email, phone, payment state or Game Code. The pre-battle tracker stays
 * behind Player ID + email in the status route.
 */
export async function GET(req: Request) {
  const { success } = await checkLimit(brLookupLimiter, clientIpFrom(req.headers));
  if (!success) return errorResponse("Too many searches from this connection. Please wait a minute.", 429);

  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.trim().toUpperCase().slice(0, 20);
  const svc = await db();

  if (code) {
    if (!CODE_RE.test(code)) return errorResponse("That Player ID isn't valid.", 400);
    const { data: p, error } = await svc
      .from("br_participants")
      .select("id, name, university, participant_code, registration_status")
      .eq("participant_code", code)
      .eq("registration_status", "registered")
      .maybeSingle();
    if (error) {
      console.error("[battle-royale] certificate lookup failed", error);
      return errorResponse(GENERIC_ERROR, 500);
    }
    const result = p ? await readResult(svc, p, await readSettings()) : null;
    if (!result?.certificate) return errorResponse("No certificate yet for this player — it appears once the battle is finished.", 404);
    const { attemptStatus: _omit, ...body } = result;
    return NextResponse.json(body satisfies ResultPayload, { headers: { "Cache-Control": "private, no-store" } });
  }

  const query = certificateQuery(url.searchParams.get("q") ?? "");
  if (!query) return NextResponse.json({ matches: [] });

  // `!inner` keeps only participants with a br_scores row, i.e. a finished battle.
  let request = svc
    .from("br_participants")
    .select("participant_code, name, university, br_scores!inner(participant_id)")
    .eq("registration_status", "registered");
  if ("code" in query) request = request.ilike("participant_code", `${query.code}%`);
  else for (const w of query.words) request = request.ilike("name", `%${w}%`);
  const { data, error } = await request.order("name", { ascending: true }).limit(MAX_MATCHES);
  if (error) {
    console.error("[battle-royale] certificate search failed", error);
    return errorResponse(GENERIC_ERROR, 500);
  }
  const matches: CertificateMatch[] = (data ?? []).map((r) => ({ code: r.participant_code, name: r.name, university: r.university ?? "" }));
  return NextResponse.json({ matches }, { headers: { "Cache-Control": "private, no-store" } });
}
