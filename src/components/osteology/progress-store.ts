"use client";

/**
 * Osteology Lab progress — two layers, so the lab works without an account.
 *
 * 1. This device (localStorage, `pw-osteo:v1`): recently viewed, completed lessons,
 *    practice and exam history, viva cards marked for revision. Every read and write is
 *    wrapped: private windows and blocked storage just mean nothing is remembered.
 * 2. The account (signed in only), through the existing progress pipeline — no new
 *    table (the Supabase schema is not in this repo):
 *      - a lesson visit  → spotting_progress (lesson_id "osteology:bone:<slug>", category "osteology")
 *      - a completion    → spotting_progress (lesson_id "osteology-done:bone:<slug>", category "osteology-done")
 *        because spotting_progress has no `completed` column; a second row is the
 *        honest way to say "finished" without a migration;
 *      - an exam         → quiz_attempts, written by the SERVER after grading
 *        (/api/osteology/submit), never from here.
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "pw-osteo:v1";

export type LessonKind = "bone" | "joint";
export type ExamRecord = { at: number; preset: string; title: string; correct: number; total: number; marks: number; maxMarks: number; timeSec: number };
export type PracticeRecord = { at: number; correct: number; total: number; kind: "spotting" | "viva" | "skeleton" };

export type OsteoProgress = {
  viewed: { kind: LessonKind; slug: string; name: string; at: number }[];
  completed: Record<string, number>; // "bone:humerus" → when
  practice: PracticeRecord[];
  exams: ExamRecord[];
  revise: string[]; // viva card keys marked "revise"
};

const EMPTY: OsteoProgress = { viewed: [], completed: {}, practice: [], exams: [], revise: [] };

function read(): OsteoProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const v = JSON.parse(raw) as Partial<OsteoProgress>;
    return {
      viewed: Array.isArray(v.viewed) ? v.viewed.slice(0, 30) : [],
      completed: v.completed && typeof v.completed === "object" ? v.completed : {},
      practice: Array.isArray(v.practice) ? v.practice.slice(0, 50) : [],
      exams: Array.isArray(v.exams) ? v.exams.slice(0, 50) : [],
      revise: Array.isArray(v.revise) ? v.revise.slice(0, 500) : [],
    };
  } catch {
    return EMPTY;
  }
}

const listeners = new Set<() => void>();

function write(next: OsteoProgress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked or full: the lab still works, it just will not remember
  }
  listeners.forEach((l) => l());
}

export function update(fn: (p: OsteoProgress) => OsteoProgress) {
  write(fn(read()));
}

export function recordView(kind: LessonKind, slug: string, name: string) {
  update((p) => ({
    ...p,
    viewed: [{ kind, slug, name, at: Date.now() }, ...p.viewed.filter((v) => !(v.kind === kind && v.slug === slug))].slice(0, 30),
  }));
}

export function setCompleted(kind: LessonKind, slug: string, done: boolean) {
  update((p) => {
    const completed = { ...p.completed };
    if (done) completed[`${kind}:${slug}`] = Date.now();
    else delete completed[`${kind}:${slug}`];
    return { ...p, completed };
  });
}

export function recordPractice(r: Omit<PracticeRecord, "at">) {
  update((p) => ({ ...p, practice: [{ ...r, at: Date.now() }, ...p.practice].slice(0, 50) }));
}

export function recordExam(r: Omit<ExamRecord, "at">) {
  update((p) => ({ ...p, exams: [{ ...r, at: Date.now() }, ...p.exams].slice(0, 50) }));
}

export function toggleRevise(key: string) {
  update((p) => ({ ...p, revise: p.revise.includes(key) ? p.revise.filter((k) => k !== key) : [...p.revise, key] }));
}

/** Live view of the device's progress; EMPTY during SSR and the first client render. */
export function useOsteoProgress(): OsteoProgress {
  const [state, setState] = useState<OsteoProgress>(EMPTY);
  const refresh = useCallback(() => setState(read()), []);
  useEffect(() => {
    refresh();
    listeners.add(refresh);
    const onStorage = (e: StorageEvent) => e.key === KEY && refresh();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);
  return state;
}

export const lessonId = (kind: LessonKind, slug: string) => `osteology:${kind}:${slug}`;
export const doneId = (kind: LessonKind, slug: string) => `osteology-done:${kind}:${slug}`;
