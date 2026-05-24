"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSupabaseUser } from "./useSupabaseUser";

export function useProgress() {
  const { user, loading: authLoading } = useSupabaseUser();
  const pathname = usePathname();
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchProgress = () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    fetch("/api/progress", { signal: controller.signal })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        setProgress(data);
      })
      .catch(err => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Fetch once on mount / user change
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProgress(null);
      setIsLoading(false);
      return;
    }
    fetchProgress();
  }, [user, authLoading]);

  // Refetch when the page becomes visible again
  useEffect(() => {
    const onFocus = () => fetchProgress();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  // Refetch every time we navigate to /dashboard
  useEffect(() => {
    if (pathname === "/dashboard" && user && !authLoading) {
      fetchProgress();
    }
  }, [pathname, user, authLoading]);

  return {
    units: progress?.units ?? [],
    flashcards: progress?.flashcards ?? [],
    quizAttempts: progress?.quizAttempts ?? [],
    spotting: progress?.spotting ?? [],
    recentActivity: progress?.recentActivity ?? [],
    totalTimeSpentMin: progress?.totalTimeSpentMin ?? 0,
    currentStreak: progress?.currentStreak ?? 0,
    longestStreak: progress?.longestStreak ?? 0,
    isLoading: authLoading || isLoading,
    refetch: fetchProgress,
  };
}