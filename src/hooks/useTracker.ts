// src/hooks/useTracker.ts
"use client";
import { useCallback } from "react";
import { useSupabaseUser } from "./useSupabaseUser";

export function useTracker() {
  const { user } = useSupabaseUser();

  const trackEvent = useCallback(
    async (type: string, payload?: Record<string, any>) => {
      if (!user) return;
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, ...payload }),
        });
      } catch (err) {
        console.error("Tracking error:", err);
      }
    },
    [user]
  );

  const trackUnit = useCallback(
    (data: {
      unitId: string;
      unitTitle?: string;
      subject?: string;
      semester?: string;
      timeSpentMin?: number;
      href?: string;
    }) => trackEvent("unit", data),
    [trackEvent]
  );

  // FIX: renamed `type` field to `activityType` to avoid collision with
  // the top-level `type` field that gets destructured in the API route.
  const trackActivity = useCallback(
    (data: { activityType?: string; label: string; href?: string }) =>
      trackEvent("activity", data),
    [trackEvent]
  );

  const trackFlashcard = useCallback(
    (data: { category: string; correct?: boolean }) =>
      trackEvent("flashcard", data),
    [trackEvent]
  );

  const trackQuiz = useCallback(
    (data: {
      quizId: string;
      subject: string;
      score: number;
      total: number;
      timeTakenMin?: number;
      href?: string;
    }) => trackEvent("quiz", data),
    [trackEvent]
  );

  const trackSpotting = useCallback(
    (data: { lessonId: string; category: string }) =>
      trackEvent("spotting", data),
    [trackEvent]
  );

  // Kept as a no-op stub — implement if you need unmount-based time tracking
  const trackTimeOnUnmount = useCallback(
    (_data?: { timeSpentMin?: number }) =>
      () => { },
    []
  );

  return {
    trackUnit,
    trackActivity,
    trackFlashcard,
    trackQuiz,
    trackSpotting,
    trackTimeOnUnmount,
  };
}