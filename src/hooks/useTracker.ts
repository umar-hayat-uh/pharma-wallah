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
  const { user, loading } = useSupabaseUser();
  const userRef = useRef(user);
  const loadingRef = useRef(loading);
  // Events tracked before the session has resolved. useSupabaseUser starts at
  // user=null and resolves getSession() asynchronously, so anything a page
  // tracks in a mount effect arrives here first. This used to be dropped
  // silently — which is why unit_progress and spotting_progress held zero rows
  // for every account until 2026-09-13. Now they wait for the session and are
  // queued if there is a user, discarded if there isn't.
  const pendingRef = useRef<ProgressEvent[]>([]);

  useEffect(() => {
    userRef.current = user;
    loadingRef.current = loading;
    if (loading) return;
    const pending = pendingRef.current;
    pendingRef.current = [];
    if (user) pending.forEach(queueActivity);
  }, [user, loading]);

  const track = useCallback((event: ProgressEvent) => {
    if (userRef.current) queueActivity(event);
    else if (loadingRef.current) pendingRef.current.push(event);
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

  /**
   * The student's explicit "Mark as read". Sets unit_progress.completed = true
   * (never cleared by later visits) and writes a "Finished: <title>" activity
   * row. Flushed at once rather than waiting up to 8s, so a dashboard opened
   * straight afterwards already shows it. Same session rule as every tracker:
   * held while the session resolves, dropped if signed out.
   */
  const markUnitRead = useCallback(
    (data: { unitId: string; unitTitle?: string; subject?: string; semester?: string; href?: string }) => {
      track({ type: "unit", ...data, completed: true });
      if (userRef.current) flush();
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
    markUnitRead,
    trackActivity,
    trackFlashcard,
    trackQuiz,
    trackSpotting,
    trackTimeOnUnmount,
  };
}