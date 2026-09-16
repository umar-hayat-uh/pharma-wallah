"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Recently opened and saved (starred) calculators, kept in localStorage on the
 * phone. A convenience only: every read and write tolerates storage being
 * unavailable, and the app works the same without it.
 *
 * Components stay in step through a window event, so starring a tool in the
 * app bar updates the home screen's Saved row without a reload.
 */

const RECENT_KEY = "pw_app_recent_v1";
const SAVED_KEY = "pw_app_saved_v1";
const EVENT = "pw-library";
const RECENT_LIMIT = 8;

function read(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the lists are a convenience.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function recordRecent(slug: string) {
  write(RECENT_KEY, [slug, ...read(RECENT_KEY).filter((s) => s !== slug)].slice(0, RECENT_LIMIT));
}

export function useLibrary(validSlugs?: ReadonlySet<string>) {
  // Empty on the server and on the first client render, so hydration matches.
  const [recent, setRecent] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      const keep = (list: string[]) => (validSlugs ? list.filter((s) => validSlugs.has(s)) : list);
      setRecent(keep(read(RECENT_KEY)));
      setSaved(keep(read(SAVED_KEY)));
    };
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [validSlugs]);

  const toggleSaved = useCallback((slug: string) => {
    const current = read(SAVED_KEY);
    write(SAVED_KEY, current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current]);
  }, []);

  const clearRecent = useCallback(() => write(RECENT_KEY, []), []);

  return { recent, saved, toggleSaved, clearRecent };
}
