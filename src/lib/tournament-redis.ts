import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Single shared Redis client. @upstash/redis is REST-based (HTTP), so it's
 * safe to import in serverless functions without connection-pool concerns —
 * unlike a raw TCP Redis/Postgres client, there's no "too many connections"
 * failure mode here.
 */
export const redis = Redis.fromEnv();

/* ────────────────────────────────────────────────────────────
 * Rate limiters
 * Each uses a sliding window. Keyed by IP (from request headers) so one
 * spammy device can't hammer the API, without blocking the whole event.
 * ──────────────────────────────────────────────────────────── */

// Code validation / games page load — generous, this is read-heavy and cheap
export const validateCodeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  prefix: "rl:validate-code",
  analytics: true,
});

// Question fetching — one game session shouldn't need more than a few calls
export const gameQuestionsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "rl:game-questions",
  analytics: true,
});

// Score submission — should happen once per attempt; a few retries allowed
// for network hiccups, but not a flood.
export const submitScoreLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(8, "60 s"),
  prefix: "rl:submit-score",
  analytics: true,
});

// Registration — prevent form-spam
export const registerLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "rl:register",
  analytics: true,
});

/** Extract a best-effort client IP from standard proxy headers (Vercel sets these). */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Helper: run a rate limit check and return a 429 NextResponse-ready payload
 * if exceeded, or null if the caller can proceed.
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ blocked: true; retryAfterSec: number } | { blocked: false }> {
  const { success, reset } = await limiter.limit(identifier);
  if (!success) {
    const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return { blocked: true, retryAfterSec };
  }
  return { blocked: false };
}
