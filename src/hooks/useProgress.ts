// hooks/useProgress.ts
// Client-side hook — fetches dashboard data + exposes push helpers

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

// ─── Types (mirrors the Mongoose model) ──────────────────────────────────────
export interface UnitProgress {
  unitId:       string;
  unitTitle:    string;
  subject:      string;
  semester:     string;
  completed:    boolean;
  lastVisited:  string;
  readCount:    number;
  timeSpentMin: number;
}
export interface FlashcardProgress {
  category:      string;
  cardsReviewed: number;
  cardsCorrect:  number;
  lastPracticed: string;
  streakDays:    number;
}
export interface QuizAttempt {
  quizId:       string;
  subject:      string;
  score:        number;
  total:        number;
  timeTakenMin: number;
  attemptedAt:  string;
}
export interface SpottingProgress {
  category:    string;
  lessonId:    string;
  completed:   boolean;
  lastVisited: string;
}
export interface Activity {
  type:      string;
  label:     string;
  href?:     string;
  timestamp: string;
}
export interface ProgressData {
  clerkUserId:       string;
  email:             string;
  displayName:       string;
  avatarUrl?:        string;
  joinedAt:          string;
  lastActiveAt:      string;
  totalTimeSpentMin: number;
  currentStreak:     number;
  longestStreak:     number;
  units:             UnitProgress[];
  flashcards:        FlashcardProgress[];
  quizAttempts:      QuizAttempt[];
  spotting:          SpottingProgress[];
  recentActivity:    Activity[];
  bookmarkedDrugs:   string[];
  booksViewed:       string[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useProgress() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [progress, setProgress]   = useState<ProgressData | null>(null);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState<string | null>(null);

  // ── Fetch / init on sign-in ────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); setProgress(null); return; }

    (async () => {
      setLoading(true);
      try {
        // Sync Clerk profile → MongoDB on every session
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email:       user.emailAddresses[0]?.emailAddress ?? "",
            displayName: user.firstName
                           ? `${user.firstName} ${user.lastName ?? ""}`.trim()
                           : "Student",
            avatarUrl:   user.imageUrl ?? "",
          }),
        });

        const res  = await fetch("/api/progress");
        const json = await res.json();
        if (json.success) setProgress(json.data);
        else setError(json.error ?? "Failed to load progress");
      } catch (e) {
        setError("Network error loading progress");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, isSignedIn, user]);

  // ── Push helpers ───────────────────────────────────────────────────────────
  const push = useCallback(async (type: string, data: Record<string, unknown>) => {
    if (!isSignedIn) return;
    try {
      await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      // Refresh local state after push
      const res  = await fetch("/api/progress");
      const json = await res.json();
      if (json.success) setProgress(json.data);
    } catch { /* silent fail — non-critical */ }
  }, [isSignedIn]);

  const trackUnit      = (data: Partial<UnitProgress>)       => push("unit",      data);
  const trackFlashcard = (data: Partial<FlashcardProgress>)  => push("flashcard", data);
  const trackQuiz      = (data: Partial<QuizAttempt>)        => push("quiz",      data);
  const trackSpotting  = (data: Partial<SpottingProgress>)   => push("spotting",  data);
  const trackActivity  = (data: Partial<Activity>)           => push("activity",  data);
  const trackTime      = (minutes: number)                   => push("time",      { minutes });

  return {
    progress, loading, error,
    trackUnit, trackFlashcard, trackQuiz, trackSpotting, trackActivity, trackTime,
    refetch: async () => {
      const res  = await fetch("/api/progress");
      const json = await res.json();
      if (json.success) setProgress(json.data);
    },
  };
}