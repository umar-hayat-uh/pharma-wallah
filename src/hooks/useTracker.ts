// src/hooks/useTracker.ts
"use client";
import { useCallback } from "react";
import { useSupabaseUser } from "./useSupabaseUser";

export function useTracker() {
  const { user } = useSupabaseUser();

  const trackEvent = useCallback(
    async (eventType: string, payload?: Record<string, any>) => {
      if (!user) return;
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: eventType, ...payload }),
        });
      } catch (err) {
        console.error("Tracking error:", err);
      }
    },
    [user]
  );

  // All functions accept extra properties via [key: string]: any
  const trackUnit = useCallback(
    (data: { unitId: string; unitTitle?: string; subject?: string; semester?: string; timeSpentMin?: number;[key: string]: any }) =>
      trackEvent("unit", data),
    [trackEvent]
  );

  const trackActivity = useCallback(
    (data: { label: string; href?: string; type?: string; activityType?: string;[key: string]: any }) =>
      trackEvent("activity", { ...data, type: data.type || data.activityType || "generic" }),
    [trackEvent]
  );

  const trackFlashcard = useCallback(
    (data: { category: string; correct?: boolean;[key: string]: any }) =>
      trackEvent("flashcard", data),
    [trackEvent]
  );

  const trackQuiz = useCallback(
    (data: { quizId: string; subject: string; score: number; total: number; timeTakenMin?: number;[key: string]: any }) =>
      trackEvent("quiz", data),
    [trackEvent]
  );

  const trackSpotting = useCallback(
    (data: { lessonId: string; category: string;[key: string]: any }) =>
      trackEvent("spotting", data),
    [trackEvent]
  );

  const trackTimeOnUnmount = useCallback(
    (data?: { timeSpentMin?: number;[key: string]: any }) => () => { },
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