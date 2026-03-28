// hooks/useTracker.ts
// ─────────────────────────────────────────────────────────────────────────────
// Universal one-line tracking hook — drop into ANY page.
// Wraps useProgress() and exposes simple fire-and-forget helpers
// that silently no-op when the user is not signed in.
//
// USAGE:
//   const { trackUnit, trackActivity, trackTimeOnUnmount } = useTracker();
//
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

// ─── Raw fetch helper — doesn't need the full hook ───────────────────────────
async function pushProgress(type: string, data: Record<string, unknown>) {
  try {
    await fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
  } catch {
    // Silent — progress tracking is non-critical
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTracker() {
  const { isSignedIn } = useUser();
  const startTimeRef   = useRef<number>(Date.now());

  // Reset start time on mount
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  // ── Unit read ─────────────────────────────────────────────────────────────
  const trackUnit = useCallback((payload: {
    unitId:    string;
    unitTitle: string;
    subject:   string;
    semester:  string;
    completed?: boolean;
  }) => {
    if (!isSignedIn) return;
    pushProgress("unit", { ...payload, completed: payload.completed ?? false });
  }, [isSignedIn]);

  // ── Activity event ────────────────────────────────────────────────────────
  const trackActivity = useCallback((payload: {
    type:   "unit_read" | "flashcard" | "quiz" | "spotting" | "drug_search" | "book_view";
    label:  string;
    href?:  string;
  }) => {
    if (!isSignedIn) return;
    pushProgress("activity", payload);
  }, [isSignedIn]);

  // ── Flashcard flip ────────────────────────────────────────────────────────
  const trackFlashcard = useCallback((payload: {
    category:      string;
    cardsReviewed?: number;
    cardsCorrect?:  number;
  }) => {
    if (!isSignedIn) return;
    pushProgress("flashcard", {
      category:      payload.category,
      cardsReviewed: payload.cardsReviewed ?? 1,
      cardsCorrect:  payload.cardsCorrect  ?? 0,
    });
  }, [isSignedIn]);

  // ── Quiz result ───────────────────────────────────────────────────────────
  const trackQuiz = useCallback((payload: {
    quizId:       string;
    subject:      string;
    score:        number;
    total:        number;
    timeTakenMin?: number;
  }) => {
    if (!isSignedIn) return;
    pushProgress("quiz", { ...payload, timeTakenMin: payload.timeTakenMin ?? 0 });
  }, [isSignedIn]);

  // ── Spotting lesson ───────────────────────────────────────────────────────
  const trackSpotting = useCallback((payload: {
    lessonId:  string;
    category:  string;
    completed?: boolean;
  }) => {
    if (!isSignedIn) return;
    pushProgress("spotting", { ...payload, completed: payload.completed ?? false });
  }, [isSignedIn]);

  // ── Time tracking — call once, tracks from mount to unmount ───────────────
  // Returns a cleanup fn — use inside useEffect return
  const trackTimeOnUnmount = useCallback(() => {
    return () => {
      if (!isSignedIn) return;
      const mins = Math.round((Date.now() - startTimeRef.current) / 60000);
      if (mins > 0) pushProgress("time", { minutes: mins });
    };
  }, [isSignedIn]);

  return {
    trackUnit,
    trackActivity,
    trackFlashcard,
    trackQuiz,
    trackSpotting,
    trackTimeOnUnmount,
  };
}