// src/lib/activityQueue.ts
"use client";

/**
 * Batches client-tracked events (unit visits, flashcard reps, quiz attempts,
 * spotting visits) into periodic POSTs to /api/progress/batch instead of
 * firing one request per action.
 *
 * Usage: replace direct fetch("/api/progress", {method:"POST", ...}) calls
 * with queueActivity({...}) wherever activity is tracked.
 */

export type ProgressEvent = {
  type: "unit" | "flashcard" | "quiz" | "spotting" | "activity";
  [key: string]: unknown;
};

const FLUSH_INTERVAL_MS = 8000;
const BATCH_SIZE = 8;
const MAX_QUEUE_SIZE = 50; // hard ceiling so a runaway loop can't grow this unbounded

let queue: ProgressEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_INTERVAL_MS);
}

export function queueActivity(event: ProgressEvent) {
  if (!event || typeof event.type !== "string") {
    console.warn("[activityQueue] dropped invalid event", event);
    return;
  }
  if (queue.length >= MAX_QUEUE_SIZE) {
    // Drop oldest rather than growing forever or blocking the caller.
    queue.shift();
  }
  queue.push(event);
  if (queue.length >= BATCH_SIZE) {
    flush();
  } else {
    scheduleFlush();
  }
}

export function flush(useBeacon = false) {
  if (queue.length === 0) return;
  const events = queue;
  queue = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const body = JSON.stringify({ events });

  if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    const ok = navigator.sendBeacon("/api/progress/batch", blob);
    if (!ok) {
      // sendBeacon can reject (e.g. payload too large); fall back to fetch.
      fetch("/api/progress/batch", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
    return;
  }

  fetch("/api/progress/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch((err) => console.error("[activityQueue] flush failed", err));
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => flush(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
}