import { useCallback, useEffect, useRef, useState } from "react";

const CACHE_PREFIX = "qa-cache:";
const CACHE_TTL_MS = 5 * 60 * 1000; // treat cache as usable for 5 minutes

function readCache<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const { data, savedAt } = JSON.parse(raw);
        if (Date.now() - savedAt > CACHE_TTL_MS) return null;
        return data as T;
    } catch {
        return null;
    }
}

function writeCache<T>(key: string, data: T) {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, savedAt: Date.now() }));
    } catch {
        // sessionStorage full or unavailable (e.g. private browsing) — fail silently,
        // the app still works, it just won't have instant-back-nav caching.
    }
}

/**
 * Fetches `fetcher()` keyed by `key`. On mount / key change, immediately
 * returns any cached value for that key (so the previous list stays on
 * screen instead of flashing to a skeleton), then revalidates in the
 * background and updates once the fresh response lands.
 *
 * `isRevalidating` is true only for background refreshes — it's false on
 * a true first load with no cache, so callers can still show a skeleton
 * the very first time.
 */
export function useCachedFetch<T>(key: string, fetcher: () => Promise<T>, deps: unknown[]) {
    const [data, setData] = useState<T | null>(() => readCache<T>(key));
    const [isRevalidating, setIsRevalidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestId = useRef(0);

    const load = useCallback(async () => {
        const cached = readCache<T>(key);
        if (cached !== null) {
            setData(cached);
            setIsRevalidating(true);
        } else {
            setIsRevalidating(false); // no cache — caller should show a full skeleton
        }
        setError(null);

        const thisRequest = ++requestId.current;
        try {
            const fresh = await fetcher();
            if (thisRequest !== requestId.current) return; // a newer request superseded this one
            setData(fresh);
            writeCache(key, fresh);
        } catch (err: any) {
            if (thisRequest !== requestId.current) return;
            setError(err?.message || "Failed to load");
        } finally {
            if (thisRequest === requestId.current) setIsRevalidating(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, setData, loading: data === null && isRevalidating === false && error === null, isRevalidating, error, refetch: load };
}