import { createHash } from "crypto";

/**
 * Builds a deterministic cache key from a namespace + params object.
 * Used by pubmed.ts, clinicaltrials.ts, medlineplus.ts so identical
 * queries (regardless of key order) hit the same cache row.
 *
 * Mirrors the approach your dailymed.ts likely already uses for
 * cache_key — keep this in one place so all four sources agree.
 */
export function buildCacheKey(namespace: string, params: Record<string, unknown>): string {
    const normalized = Object.keys(params)
        .sort()
        .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
        .map((k) => `${k}=${String(params[k]).toLowerCase().trim()}`)
        .join("&");

    const hash = createHash("sha256").update(normalized).digest("hex").slice(0, 32);
    return `${namespace}:${hash}`;
}