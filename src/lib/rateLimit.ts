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

/**
 * Community writes (posts, comments, reports). Keyed by user id — every write
 * route authenticates first, so there is always one. Tuned to allow a real
 * conversation (a burst of replies) while stopping a script from flooding a
 * thread.
 */
export const communityWriteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(12, "60 s"),
      analytics: true,
      prefix: "ratelimit:community:write",
    })
  : null;

/**
 * Voting is far chattier than posting — a member scrolling a feed and voting as
 * they go is normal behaviour, so this is deliberately generous. It exists to
 * stop automated vote manipulation, not to pace a reader.
 */
export const communityVoteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: true,
      prefix: "ratelimit:community:vote",
    })
  : null;

/**
 * Anonymous feed reads. The community is public, so an unauthenticated scraper
 * could otherwise walk every post; keyed by IP for signed-out readers.
 */
export const communityReadLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "10 s"),
      analytics: true,
      prefix: "ratelimit:community:read",
    })
  : null;

/**
 * The contact and careers forms (`POST /api/contact`). Anonymous, and every
 * accepted request sends a real email through Resend, so it is tight: a person
 * writing to us sends one or two messages, not a stream.
 */
export const contactLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "ratelimit:contact",
    })
  : null;
