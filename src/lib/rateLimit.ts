// src/lib/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const progressReadLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
      prefix: "ratelimit:progress:read",
    })
  : null;

export const progressWriteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "ratelimit:progress:write",
    })
  : null;

/**
 * Fails OPEN, not closed: if Upstash itself is down or errors, we let the
 * request through rather than blocking every user because the rate limiter's
 * backing store is unavailable. The DB write path still has its own
 * validation, so this isn't the only safety net.
 */
export async function checkLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  if (!limiter) return { success: true, remaining: Infinity };
  try {
    const { success, remaining } = await limiter.limit(identifier);
    return { success, remaining };
  } catch (err) {
    console.error("[rateLimit] check failed, failing open", err);
    return { success: true, remaining: Infinity };
  }
}
/**
 * Anonymous drug search (`/api/search`). Generous — the encyclopedia debounces
 * keystrokes and caches pages client-side, so a real reader stays far below it;
 * it exists to stop a scraper walking all 12,673 documents.
 */
export const drugSearchLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(40, "10 s"),
      analytics: true,
      prefix: "ratelimit:drugs:search",
    })
  : null;
