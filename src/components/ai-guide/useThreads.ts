"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, Thread } from "@/lib/ai-guide/types";
import { deriveThreadTitle, sanitiseThread, sortThreads } from "@/lib/ai-guide/pure";

/**
 * Saved conversations, in localStorage.
 *
 * localStorage and not Supabase, deliberately: conversations would need a new
 * table and RLS policies, and this project's Supabase schema is not in the repo
 * — no session can create one (CLAUDE.md §7 Known Issue 4). So history is
 * per-device and per-browser, and the UI says so rather than implying a sync
 * that does not exist. Cloud sync is an owner decision, recorded in the roadmap.
 *
 * Every read and write is wrapped: localStorage throws in private mode and in
 * embedded webviews, and a chat that cannot save must still be a chat.
 */

const STORAGE_KEY = "pw.ai-guide.threads.v1";
const ACTIVE_KEY = "pw.ai-guide.active.v1";
/** Old conversations are pruned so one device cannot fill its quota silently. */
const MAX_THREADS = 40;

function readThreads(): Thread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortThreads(parsed.map(sanitiseThread).filter((t): t is Thread => t !== null));
  } catch {
    return [];
  }
}

function writeThreads(threads: Thread[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads.slice(0, MAX_THREADS)));
  } catch {
    // Quota exceeded or storage blocked — the in-memory conversation continues.
  }
}

export function newThreadId(): string {
  // crypto.randomUUID is unavailable on http:// origins in some browsers, and
  // the dev server is one, so there is a fallback.
  try {
    return crypto.randomUUID();
  } catch {
    return `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  /** Nothing is read from storage during render — the server HTML and the
   *  first client paint must match, or React logs a hydration mismatch. */
  const [hydrated, setHydrated] = useState(false);
  const skipPersist = useRef(true);

  useEffect(() => {
    const loaded = readThreads();
    setThreads(loaded);
    try {
      const saved = localStorage.getItem(ACTIVE_KEY);
      if (saved && loaded.some((t) => t.id === saved)) setActiveId(saved);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    writeThreads(threads);
  }, [threads, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* ignore */
    }
  }, [activeId, hydrated]);

  const activeThread = threads.find((t) => t.id === activeId) ?? null;

  /** Replace a thread's messages, creating the thread on the first turn. */
  const commit = useCallback((threadId: string, messages: ChatMessage[]) => {
    setThreads((prev) => {
      const now = Date.now();
      const existing = prev.find((t) => t.id === threadId);

      if (!existing) {
        const first = messages.find((m) => m.role === "user");
        const created: Thread = {
          id: threadId,
          title: deriveThreadTitle(first?.content ?? ""),
          messages,
          createdAt: now,
          updatedAt: now,
        };
        return sortThreads([created, ...prev]).slice(0, MAX_THREADS);
      }

      return sortThreads(
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages,
                updatedAt: now,
                // A thread created before its first question was sent keeps the
                // placeholder title; fill it in as soon as there is one.
                title:
                  t.title && t.title !== "New chat"
                    ? t.title
                    : deriveThreadTitle(messages.find((m) => m.role === "user")?.content ?? ""),
              }
            : t,
        ),
      );
    });
  }, []);

  const removeThread = useCallback(
    (threadId: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setActiveId((current) => (current === threadId ? null : current));
    },
    [],
  );

  const renameThread = useCallback((threadId: string, title: string) => {
    const clean = title.replace(/\s+/g, " ").trim().slice(0, 80);
    if (!clean) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, title: clean } : t)),
    );
  }, []);

  const clearAll = useCallback(() => {
    setThreads([]);
    setActiveId(null);
  }, []);

  return {
    threads,
    activeThread,
    activeId,
    hydrated,
    setActiveId,
    commit,
    removeThread,
    renameThread,
    clearAll,
  };
}
