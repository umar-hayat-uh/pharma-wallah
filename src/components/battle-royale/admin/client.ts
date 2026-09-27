"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/** Call an admin route; resolve to the JSON body or throw its `error` message. */
export async function adminFetch<T = Record<string, unknown>>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? "Something went wrong. Please try again.");
  return json as T;
}

/**
 * Run a mutation, then refresh the server components so every table on the
 * page shows the new truth. Exposes `pending`, the last `error` and a short
 * `message` for a status line.
 */
export function useMutation() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, success?: string | ((r: T) => string)): Promise<T | null> => {
      setPending(true);
      setError(null);
      setMessage(null);
      try {
        const r = await fn();
        if (success) setMessage(typeof success === "function" ? success(r) : success);
        startTransition(() => router.refresh());
        return r;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        return null;
      } finally {
        setPending(false);
      }
    },
    [router],
  );

  return { run, pending: pending || refreshing, error, message, setError, setMessage };
}
