import type { SavedAnalysis, SpotPolarity, TLCPreferences } from "./types";

/**
 * On-device storage for the TLC analyzer. Nothing here talks to a server.
 *
 *   - Preferences (decimals, detection sensitivity/polarity): localStorage.
 *   - Saved analyses: IndexedDB, and only when the student presses Save — the
 *     plate image is otherwise held in memory and gone when the page closes.
 *
 * Every call tolerates storage being unavailable (private windows, blocked site
 * data, an old WebView): reads fall back to defaults, writes report failure.
 */

const PREFS_KEY = "pw_tlc_prefs_v1";
const DB_NAME = "pharmawallah-tlc";
const STORE = "analyses";
const DB_VERSION = 1;

export const DEFAULT_PREFERENCES: TLCPreferences = { decimals: 2, sensitivity: 55, polarity: "dark" };

const POLARITIES: SpotPolarity[] = ["dark", "light", "any"];

export function readPreferences(): TLCPreferences {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<TLCPreferences>;
    return {
      decimals: parsed.decimals === 3 ? 3 : 2,
      sensitivity:
        typeof parsed.sensitivity === "number" && parsed.sensitivity >= 0 && parsed.sensitivity <= 100
          ? parsed.sensitivity
          : DEFAULT_PREFERENCES.sensitivity,
      polarity: parsed.polarity && POLARITIES.includes(parsed.polarity) ? parsed.polarity : DEFAULT_PREFERENCES.polarity,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function writePreferences(prefs: TLCPreferences): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Preferences are a convenience; the tool works without them.
  }
}

export function storageAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      reject(error);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB could not be opened."));
    request.onblocked = () => reject(new Error("IndexedDB is blocked by another tab."));
  });
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = action(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(request.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? request.error ?? new Error("Storage failed."));
        };
        tx.onabort = () => {
          db.close();
          reject(tx.error ?? new Error("Storage was aborted — the device may be out of space."));
        };
      }),
  );
}

export function saveAnalysis(analysis: SavedAnalysis): Promise<void> {
  return run("readwrite", (store) => store.put(analysis)).then(() => undefined);
}

/** Newest first. */
export function listAnalyses(): Promise<SavedAnalysis[]> {
  return run("readonly", (store) => store.getAll() as IDBRequest<SavedAnalysis[]>).then((all) =>
    all.sort((a, b) => b.createdAt - a.createdAt),
  );
}

export function deleteAnalysis(id: string): Promise<void> {
  return run("readwrite", (store) => store.delete(id)).then(() => undefined);
}

/** "Clear local data": every saved analysis and the preferences. */
export async function clearLocalData(): Promise<void> {
  try {
    window.localStorage.removeItem(PREFS_KEY);
  } catch {
    // ignore
  }
  if (!storageAvailable()) return;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Local data could not be cleared."));
    // Blocked means another tab holds it open; the delete completes when that tab closes.
    request.onblocked = () => resolve();
  });
}

export function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // Non-secure contexts have no randomUUID.
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
