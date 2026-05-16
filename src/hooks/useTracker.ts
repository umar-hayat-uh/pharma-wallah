// src/hooks/useTracker.ts
// Temporary no‑op tracker – auth will be reconnected later

export function useTracker() {
  // All tracking functions are no‑ops; they won't crash the pages
  const noop = () => {};
  const cleanup = () => {}; // for trackTimeOnUnmount

  const trackUnit = noop;
  const trackActivity = noop;
  const trackFlashcard = noop;
  const trackQuiz = noop;
  const trackSpotting = noop;

  const trackTimeOnUnmount = () => cleanup; // returns a cleanup function

  return {
    trackUnit,
    trackActivity,
    trackFlashcard,
    trackQuiz,
    trackSpotting,
    trackTimeOnUnmount,
  };
}