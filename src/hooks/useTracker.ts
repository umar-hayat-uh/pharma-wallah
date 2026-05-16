// src/hooks/useTracker.ts
// Temporary no‑op tracker – will be reconnected when Supabase auth is added.
// All tracking functions accept any arguments to avoid type errors in pages.

/* eslint-disable @typescript-eslint/no-unused-vars */

export function useTracker() {
  const trackUnit = (..._args: any[]) => { };
  const trackActivity = (..._args: any[]) => { };
  const trackFlashcard = (..._args: any[]) => { };
  const trackQuiz = (..._args: any[]) => { };
  const trackSpotting = (..._args: any[]) => { };
  const trackTimeOnUnmount = (..._args: any[]) => () => { }; // returns a cleanup function

  return {
    trackUnit,
    trackActivity,
    trackFlashcard,
    trackQuiz,
    trackSpotting,
    trackTimeOnUnmount,
  };
}