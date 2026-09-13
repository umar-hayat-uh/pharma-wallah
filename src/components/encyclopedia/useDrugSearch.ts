"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EncDrug, SearchPayload } from "./types";

export const PAGE_SIZE = 10;
const MIN_CHARS = 2;
const CACHE_LIMIT = 40;

export type SearchState =
  | { status: "idle"; payload: null }
  | { status: "loading"; payload: SearchPayload | null }
  | { status: "ready"; payload: SearchPayload }
  | { status: "error"; payload: SearchPayload | null; message: string };

/*
 * Why this is not the old DrugSearch loop (a lodash debounce + fetch):
 *  - Responses could land out of order, so a slow "me" could overwrite a fast
 *    "metformin". Every request now has an AbortController; only the latest wins.
 *  - Every page and every back-and-forth refetched. A small in-memory cache keyed
 *    by query + page makes revisits instant (the API is also CDN-cacheable).
 *  - Previous results stay on screen while the next set loads, so the list
 *    dims instead of flashing to a skeleton on every keystroke.
 *  - A 429 or 500 says what happened and can be retried.
 */
export function useDrugSearch(query: string, page: number, delay: number) {
  const [state, setState] = useState<SearchState>({ status: "idle", payload: null });
  const [nonce, setNonce] = useState(0);
  const cache = useRef(new Map<string, SearchPayload>());
  const last = useRef<SearchPayload | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_CHARS) {
      last.current = null;
      setState({ status: "idle", payload: null });
      return;
    }
    const key = `${q.toLowerCase()}|${page}`;
    const hit = cache.current.get(key);
    if (hit) {
      last.current = hit;
      setState({ status: "ready", payload: hit });
      return;
    }

    setState({ status: "loading", payload: last.current });
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&page=${page}&limit=${PAGE_SIZE}`,
          { signal: ctrl.signal },
        );
        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.success) {
          const message =
            res.status === 429
              ? "Too many searches in a row. Wait a few seconds, then try again."
              : body?.message || "The drug database didn't answer.";
          setState({ status: "error", payload: last.current, message });
          return;
        }
        const payload: SearchPayload = {
          data: (body.data ?? []) as EncDrug[],
          total: body.pagination?.total ?? 0,
          page: body.pagination?.page ?? page,
          totalPages: body.pagination?.totalPages ?? 0,
        };
        cache.current.set(key, payload);
        if (cache.current.size > CACHE_LIMIT) {
          cache.current.delete(cache.current.keys().next().value as string);
        }
        last.current = payload;
        setState({ status: "ready", payload });
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setState({
          status: "error",
          payload: last.current,
          message: "Couldn't reach the drug database. Check your connection.",
        });
      }
    }, delay);

    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
    // `delay` is read at the moment the query changes; it is not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { state, retry, minChars: MIN_CHARS };
}
