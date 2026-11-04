import { NextResponse } from "next/server";
import { isConfigured, UNAVAILABLE_MESSAGE, type Service } from "@/lib/services";

/**
 * First line of a route handler that cannot work without a service:
 *
 *   const off = serviceGate("supabase", "supabaseAdmin");
 *   if (off) return off;
 *
 * Returns null when every listed service has its keys, otherwise a 503 with
 * the shared `{ error: UNAVAILABLE_MESSAGE }` body every client already shows.
 * List only HARD dependencies — a service used as a cache or rate limiter must
 * fail open instead (CLAUDE.md §6 rule 7), so the feature keeps working.
 */
export function serviceGate(...services: Service[]): NextResponse | null {
  const missing = services.filter((s) => !isConfigured(s));
  if (missing.length === 0) return null;
  console.warn(`[services] unavailable — not configured: ${missing.join(", ")}`);
  return NextResponse.json(
    { error: UNAVAILABLE_MESSAGE },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
