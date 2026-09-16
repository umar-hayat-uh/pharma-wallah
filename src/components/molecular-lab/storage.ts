/*
 * Molecular Lab — "My Molecules" and the autosaved session, in localStorage.
 *
 * Structures are small JSON (a drug-sized molecule is a few kilobytes), so
 * localStorage is enough and works in every browser the site supports. Every
 * read and write is guarded: private windows and blocked storage must never
 * break the lab. Nothing here leaves the device.
 */

import { isMolGraph, type MolGraph } from "./graph";

export interface MolSource {
  kind: "library" | "pubchem" | "file" | "drawn";
  /** Library entry id, PubChem CID or file name. */
  ref?: string;
  cid?: number;
}

export interface SavedMolecule {
  id: string;
  name: string;
  graph: MolGraph;
  source: MolSource | null;
  created: string;
  modified: string;
}

export interface SessionSnapshot {
  name: string;
  graph: MolGraph;
  original: MolGraph | null;
  source: MolSource | null;
  savedAt: string;
}

const SAVED_KEY = "pw_mollab_saved_v1";
const SESSION_KEY = "pw_mollab_session_v1";
export const MAX_SAVED = 50;

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function listSaved(): SavedMolecule[] {
  const data = read(SAVED_KEY);
  if (!Array.isArray(data)) return [];
  return data
    .filter((m): m is SavedMolecule => Boolean(m) && typeof m.id === "string" && typeof m.name === "string" && isMolGraph(m.graph))
    .sort((a, b) => b.modified.localeCompare(a.modified));
}

/** Saves (or updates, when `id` exists) a molecule. Returns the stored record, or null if storage failed. */
export function saveMolecule(entry: { id?: string; name: string; graph: MolGraph; source: MolSource | null }): SavedMolecule | null {
  const now = new Date().toISOString();
  const list = listSaved();
  const existing = entry.id ? list.find((m) => m.id === entry.id) : undefined;
  const record: SavedMolecule = {
    id: existing?.id ?? `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: entry.name.trim().slice(0, 80) || "Untitled molecule",
    graph: entry.graph,
    source: entry.source,
    created: existing?.created ?? now,
    modified: now,
  };
  const next = [record, ...list.filter((m) => m.id !== record.id)].slice(0, MAX_SAVED);
  return write(SAVED_KEY, next) ? record : null;
}

export function deleteSaved(id: string): void {
  write(SAVED_KEY, listSaved().filter((m) => m.id !== id));
}

export function readSession(): SessionSnapshot | null {
  const s = read(SESSION_KEY) as SessionSnapshot | null;
  if (!s || typeof s !== "object" || !isMolGraph(s.graph)) return null;
  if (s.original !== null && !isMolGraph(s.original)) return null;
  return s;
}

export function writeSession(s: SessionSnapshot): void {
  write(SESSION_KEY, s);
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // storage blocked — nothing to clear
  }
}
