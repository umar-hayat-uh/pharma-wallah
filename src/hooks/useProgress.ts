// src/hooks/useProgress.ts
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSupabaseUser } from "./useSupabaseUser";

type ProgressData = {
  units: any[];
  flashcards: any[];
  quizAttempts: any[];
  spotting: any[];
  recentActivity: any[];
  totalTimeSpentMin: number;
  currentStreak: number;
  longestStreak: number;
};

const EMPTY: ProgressData = {
  units: [],
  flashcards: [],
  quizAttempts: [],
  spotting: [],
  recentActivity: [],
  totalTimeSpentMin: 0,
  currentStreak: 0,
  longestStreak: 0,
};

const STALE_TIME_MS = 20_000;
const MANUAL_REFETCH_THROTTLE_MS = 3_000;

// Module-scope cache shared by every component calling useProgress in this
// tab. De-dupes concurrent fetches into a single in-flight promise and skips
// network calls entirely while data is still fresh.
let cache: { userId: string; data: ProgressData; fetchedAt: number } | null = null;
let inFlight: Promise<ProgressData | null> | null = null;

async function fetchProgress(): Promise<ProgressData | null> {
  if (inFlight) return inFlight;
  inFlight = fetch("/api/progress")
    .then((res) => {
      if (!res.ok) {
        console.error("[useProgress] fetch failed", res.status);
        return null;
      }
      return res.json();
    })
    .catch((err) => {
      console.error("[useProgress] fetch error", err);
      return null;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export function useProgress() {
  const { user, loading: authLoading } = useSupabaseUser();
  const pathname = usePathname();
  const [progress, setProgress] = useState<ProgressData | null>(
    cache && user && cache.userId === user.id ? cache.data : null
  );
  const [isLoading, setIsLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);
  const lastManualRefetch = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (opts: { force?: boolean } = {}) => {
      if (!user) return;
      const isFresh = cache && cache.userId === user.id && Date.now() - cache.fetchedAt < STALE_TIME_MS;
      if (isFresh && !opts.force) {
        setProgress(cache!.data);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const data = await fetchProgress();
      if (!mountedRef.current) return;
      if (data) {
        cache = { userId: user.id, data, fetchedAt: Date.now() };
        setProgress(data);
        setError(null);
      } else {
        setError("Failed to load progress. Showing last known data if available.");
      }
      setIsLoading(false);
    },
    [user]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProgress(null);
      setIsLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  useEffect(() => {
    if (pathname === "/dashboard" && user && !authLoading) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const refetch = useCallback(() => {
    const now = Date.now();
    if (now - lastManualRefetch.current < MANUAL_REFETCH_THROTTLE_MS) return Promise.resolve();
    lastManualRefetch.current = now;
    return load({ force: true });
  }, [load]);

  const data = progress ?? EMPTY;

  return {
    ...data,
    isLoading: authLoading || isLoading,
    error,
    refetch,
  };
}