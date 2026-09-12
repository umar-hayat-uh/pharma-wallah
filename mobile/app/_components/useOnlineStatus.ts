"use client";

import { useEffect, useState } from "react";

/**
 * Tracks connectivity for the handful of UI affordances that need it.
 *
 * Starts as `true` so the first server-rendered paint and the first client
 * paint agree — inside the APK the HTML is pre-rendered at build time, where
 * `navigator` does not exist, so reading it during render would hydrate
 * mismatched. The real value lands in the effect on the first tick.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return isOnline;
}
