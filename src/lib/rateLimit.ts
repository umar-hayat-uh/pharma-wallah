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

/*
 * Battle Royale (/battle-royale). Several people may share one connection at
 * the stall — a campus network, or the desk's own laptop — so the per-IP
 * limits leave room for a queue while still stopping a script.
 */
const brLimiter = (tokens: number, window: Parameters<typeof Ratelimit.slidingWindow>[1], name: string) =>
  redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(tokens, window), analytics: true, prefix: `ratelimit:br:${name}` })
    : null;

/** Online registration — each accepted request sends an email. Per IP. */
export const brRegisterLimiter = brLimiter(6, "10 m", "register");
/**
 * Anything that checks a Game Code (check-in, results, starting a battle).
 * The code space is 32⁶ ≈ 10⁹, so 20 guesses per 10 minutes per IP makes
 * guessing someone's code hopeless. Per IP.
 */
export const brCredentialLimiter = brLimiter(20, "10 m", "credentials");
/** Serving and answering inside a running battle. Per attempt token. */
export const brPlayLimiter = brLimiter(90, "60 s", "play");
/**
 * The certificate name search and result-by-name lookup: debounced typing, so
 * a person makes a few calls a second at most. Per IP.
 */
export const brLookupLimiter = brLimiter(60, "60 s", "lookup");
/** The public board, polled by the stall TV and by phones. Per IP. */
export const brLeaderboardLimiter = brLimiter(60, "60 s", "leaderboard");
/** Admin writes, including email sends. Per admin user id. */
export const brAdminLimiter = brLimiter(120, "60 s", "admin");
