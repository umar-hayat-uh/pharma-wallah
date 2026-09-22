"use client";

/**
 * Local, durable storage for calculation history and settings.
 *
 * Two backends, one interface:
 *  - inside the packaged app, a JSON file in the Windows per-user app-data
 *    directory, written by the Rust commands in src-tauri/src/lib.rs. That is
 *    the "offline database" of spec §13 — a file, not SQLite, because the data
 *    is one small append-only list and a database engine would be a dependency
 *    with nothing to do;
 *  - in a browser (development, and the verification pass), localStorage.
 *
 * There is no cloud, no sync and no account. Nothing written here leaves the
 * machine.
 *
 * Reads and writes are debounced into a single in-memory document so a page
 * that saves a calculation does not do file I/O on every keystroke.
 */

import { invoke, isTauri } from "./bridge";

export type HistoryEntry = {
  /** Stable id, also the sort key — milliseconds since the epoch plus a suffix. */
  id: string;
  /** ISO timestamp of when the calculation was saved. */
  savedAt: string;
  /** Display name of the calculator, e.g. "BMI Calculator". */
  calculator: string;
  /** Route slug, so History can reopen the tool that produced the entry. */
  slug: string;
  /** Input fields as they stood on screen. */
  inputs: { label: string; value: string }[];
  /** The result card(s) as they stood on screen. */
  results: { label: string; value: string }[];
  /** The formula the calculator states, when it states one. */
  formula?: string;
  /** Free-text note the student can add in History. */
  note?: string;
};

export type Settings = {
  /** Show the "how this is calculated" panel open by default where supported. */
  confirmBeforeDelete: boolean;
  /** Cap on stored history entries; the oldest are dropped past it. */
  historyLimit: number;
};

export const DEFAULT_SETTINGS: Settings = {
  confirmBeforeDelete: true,
  historyLimit: 500,
};

type StoreDocument = {
  version: 1;
  history: HistoryEntry[];
  settings: Settings;
};

const LOCAL_KEY = "pw_desktop_store_v1";
const EVENT = "pw-desktop-store";

const EMPTY: StoreDocument = { version: 1, history: [], settings: DEFAULT_SETTINGS };

/** In-memory copy, so a render never waits on I/O. */
let cache: StoreDocument | null = null;
let loading: Promise<StoreDocument> | null = null;

function coerce(raw: unknown): StoreDocument {
  if (!raw || typeof raw !== "object") return { ...EMPTY };
  const doc = raw as Partial<StoreDocument>;
  const history = Array.isArray(doc.history)
    ? doc.history.filter(
        (entry): entry is HistoryEntry =>
          Boolean(entry) &&
          typeof entry === "object" &&
          typeof (entry as HistoryEntry).id === "string" &&
          typeof (entry as HistoryEntry).calculator === "string",
      )
    : [];
  const settings = { ...DEFAULT_SETTINGS, ...(doc.settings ?? {}) };
  // A corrupt or hand-edited limit must not be able to disable the cap.
  if (!Number.isFinite(settings.historyLimit) || settings.historyLimit < 10) {
    settings.historyLimit = DEFAULT_SETTINGS.historyLimit;
  }
  settings.historyLimit = Math.min(settings.historyLimit, 5000);
  return { version: 1, history, settings };
}

async function readBackend(): Promise<StoreDocument> {
  if (isTauri()) {
    const raw = await invoke<string>("store_load");
    if (raw) {
      try {
        return coerce(JSON.parse(raw));
      } catch {
        // A truncated file (power loss mid-write) must not brick the app.
        return { ...EMPTY };
      }
    }
    return { ...EMPTY };
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return coerce(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...EMPTY };
  }
}

async function writeBackend(doc: StoreDocument): Promise<void> {
  const json = JSON.stringify(doc);
  if (isTauri()) {
    await invoke<null>("store_save", { contents: json });
    return;
  }
  try {
    window.localStorage.setItem(LOCAL_KEY, json);
  } catch {
    // Storage full or blocked. The in-memory copy still serves this session.
  }
}

/** Loads once per session; every later call returns the cached document. */
export async function load(): Promise<StoreDocument> {
  if (cache) return cache;
  if (!loading) {
    loading = readBackend().then((doc) => {
      cache = doc;
      return doc;
    });
  }
  return loading;
}

function announce() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

async function mutate(fn: (doc: StoreDocument) => StoreDocument): Promise<StoreDocument> {
  const current = await load();
  const next = fn(current);
  cache = next;
  await writeBackend(next);
  announce();
  return next;
}

export function subscribe(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  // Another window of the same app (or another tab in the browser fallback).
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export async function getHistory(): Promise<HistoryEntry[]> {
  return (await load()).history;
}

export async function addHistory(
  entry: Omit<HistoryEntry, "id" | "savedAt">,
): Promise<HistoryEntry> {
  const created: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
  };
  await mutate((doc) => ({
    ...doc,
    history: [created, ...doc.history].slice(0, doc.settings.historyLimit),
  }));
  return created;
}

export async function updateHistory(id: string, patch: Partial<HistoryEntry>): Promise<void> {
  await mutate((doc) => ({
    ...doc,
    history: doc.history.map((entry) => (entry.id === id ? { ...entry, ...patch, id } : entry)),
  }));
}

export async function deleteHistory(id: string): Promise<void> {
  await mutate((doc) => ({ ...doc, history: doc.history.filter((entry) => entry.id !== id) }));
}

export async function clearHistory(): Promise<void> {
  await mutate((doc) => ({ ...doc, history: [] }));
}

export async function getSettings(): Promise<Settings> {
  return (await load()).settings;
}

export async function setSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = await mutate((doc) => ({
    ...doc,
    settings: coerce({ ...doc, settings: { ...doc.settings, ...patch } }).settings,
  }));
  return next.settings;
}

/** Where the data physically lives — shown in Settings so it is never a mystery. */
export async function storageLocation(): Promise<string> {
  if (isTauri()) {
    return (await invoke<string>("store_path")) ?? "the application data folder";
  }
  return "this browser's local storage (development only)";
}
