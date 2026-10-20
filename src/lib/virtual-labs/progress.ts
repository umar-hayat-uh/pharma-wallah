"use client";

/**
 * Virtual Labs progress — this device first, the account second (no new table).
 *
 * 1. localStorage `pw-vlabs:v1`: started / best result per lab, so the landing page can
 *    show "Completed · Merit". Every access is wrapped: private windows and blocked
 *    storage simply mean nothing is remembered.
 * 2. Signed-in students: the existing pipeline via useTracker — an activity row when a
 *    lab is opened and when it is submitted. These are self-paced practice runs, so the
 *    score is reported as practice, never as an exam result.
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "pw-vlabs:v1";

export interface LabRecord {
  startedAt?: number;
  completedAt?: number;
  attempts: number;
  best?: { overall: number; grade: string; technique: number; assessment: number };
}

type Store = Record<string, LabRecord>;

function read(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Store) : {};
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

const listeners = new Set<() => void>();
function write(s: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // storage blocked or full — the lab still works
  }
  listeners.forEach((l) => l());
}

export function markStarted(id: string) {
  const s = read();
  s[id] = { ...s[id], attempts: s[id]?.attempts ?? 0, startedAt: Date.now() };
  write(s);
}

export function markCompleted(id: string, r: { overall: number; grade: string; technique: number; assessment: number }) {
  const s = read();
  const prev = s[id] ?? { attempts: 0 };
  const best = !prev.best || r.overall > prev.best.overall ? r : prev.best;
  s[id] = { ...prev, attempts: prev.attempts + 1, completedAt: Date.now(), best };
  write(s);
}

export function useLabProgress() {
  const [store, setStore] = useState<Store>({});
  const refresh = useCallback(() => setStore(read()), []);
  useEffect(() => {
    refresh();
    listeners.add(refresh);
    return () => {
      listeners.delete(refresh);
    };
  }, [refresh]);
  return store;
}

const QKEY = "pw-vlabs:quality";
export type QualityPref = "low" | "medium" | "high";

/** Default quality: low on small or low-memory devices, medium elsewhere. */
export function defaultQuality(): QualityPref {
  try {
    const saved = window.localStorage.getItem(QKEY) as QualityPref | null;
    if (saved === "low" || saved === "medium" || saved === "high") return saved;
  } catch {
    /* ignore */
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "low";
  if ((nav.deviceMemory ?? 8) <= 4 || window.innerWidth < 768) return "low";
  return "medium";
}

export function saveQuality(q: QualityPref) {
  try {
    window.localStorage.setItem(QKEY, q);
  } catch {
    /* ignore */
  }
}
