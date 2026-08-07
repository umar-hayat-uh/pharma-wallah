// src/hooks/useTracker.ts
"use client";
import { useCallback, useEffect, useRef } from "react";
import { useSupabaseUser } from "./useSupabaseUser";
import { queueActivity, flush, type ProgressEvent } from "@/lib/activityQueue";

/**
 * Same public API as before — trackUnit / trackFlashcard / trackQuiz /
 * trackSpotting / trackActivity all still exist with the same call
 * signatures. The only change is internal: instead of firing its own
 * fetch("/api/progress", ...) per call, every tracker now queues the event
 * via activityQueue, which batches many calls into one POST to
 * /api/progress/batch every ~8s (or on tab close).
 *
 * No call sites need to change.
 */
export function useTracker() {
  const { user } = useSupabaseUser();
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const track = useCallback((event: ProgressEvent) => {
    if (!userRef.current) return;
    queueActivity(event);
  }, []);

  const trackUnit = useCallback(
    (data: { unitId: string; unitTitle?: string; subject?: string; semester?: string; timeSpentMin?: number; [key: string]: any }) =>
      track({ type: "unit", ...data }),
    [track]
  );

  const trackActivity = useCallback(
    (data: { label: string; href?: string; type?: string; activityType?: string; [key: string]: any }) => {
      // "type" on the incoming data means something different from the
      // top-level ProgressEvent.type discriminator (which must be
      // "activity" here) — preserve the caller's intended sub-type
      // under subType instead of letting it collide.
      const { type: callerType, activityType, ...rest } = data;
      track({ type: "activity", subType: callerType || activityType || "generic", ...rest });
    },
    [track]
  );

  const trackFlashcard = useCallback(
    (data: { category: string; correct?: boolean; [key: string]: any }) =>
      track({ type: "flashcard", ...data }),
    [track]
  );

  const trackQuiz = useCallback(
    (data: { quizId: string; subject: string; score: number; total: number; timeTakenMin?: number; [key: string]: any }) =>
      track({ type: "quiz", ...data }),
    [track]
  );

  const trackSpotting = useCallback(
    (data: { lessonId: string; category: string; lessonTitle?: string; [key: string]: any }) =>
      track({ type: "spotting", ...data }),
    [track]
  );

  /**
   * Returns a cleanup function suitable for a useEffect return value:
   *   useEffect(() => trackTimeOnUnmount({ unitId, ... }), []);
   * Fires an immediate flush (not just a queue push) on unmount so the time
   * spent isn't lost if the tab closes right after — queued events wait up
   * to 8s otherwise, which the unmount won't be around to see through.
   */
  const trackTimeOnUnmount = useCallback(
    (data?: { timeSpentMin?: number; [key: string]: any }) => {
      return () => {
        if (!userRef.current || !data) return;
        queueActivity({ type: "activity", subType: "time_spent", ...data });
        flush();
      };
    },
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