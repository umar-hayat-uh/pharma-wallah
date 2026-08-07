// src/lib/redis.ts
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  // Not throwing here on purpose: caching/rate-limiting are optimizations, not
  // hard dependencies. Missing env vars degrade gracefully to "hit Supabase
  // directly, no rate limit" rather than crashing the app on boot.
  console.warn(
    "[redis] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set. " +
      "Progress caching and rate limiting are disabled."
  );
}

export const redis = url && token ? new Redis({ url, token }) : null;

export const PROGRESS_CACHE_TTL_SECONDS = 45;

export function progressCacheKey(userId: string): string {
  return `progress:v1:${userId}`;
}