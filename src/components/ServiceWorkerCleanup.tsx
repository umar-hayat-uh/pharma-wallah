"use client";

import { useEffect } from "react";

/**
 * Unregisters the service worker left behind by next-pwa, which was removed on
 * 2026-09-12.
 *
 * public/sw.js is itself self-destructing, which handles most visitors. This
 * covers the rest: a browser whose cached copy of sw.js is not revalidated on
 * the next visit would otherwise keep serving a stale site indefinitely.
 *
 * TEMPORARY. Delete this component, its mount in src/app/layout.tsx, and
 * public/sw.js once traffic has cycled through a release or two.
 */
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) registration.unregister();
      })
      .catch(() => {
        // Nothing to do — the page works fine either way.
      });
  }, []);

  return null;
}
