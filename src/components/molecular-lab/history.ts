/*
 * Molecular Lab — undo/redo over graph snapshots.
 *
 * Every structural change commits one snapshot. A drag previews positions on
 * the present snapshot and commits once, from the position it started at, so
 * one move is one undo step however many frames it took.
 */

import type { MolGraph } from "./graph";

export const HISTORY_LIMIT = 200;

export interface History {
  past: MolGraph[];
  present: MolGraph;
  future: MolGraph[];
  /** Short description of the last committed change, for the status line. */
  label: string;
}

export type HistoryAction =
  | { type: "commit"; graph: MolGraph; label: string; from?: MolGraph }
  | { type: "preview"; graph: MolGraph }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "replace"; graph: MolGraph; label: string };

export function initHistory(graph: MolGraph): History {
  return { past: [], present: graph, future: [], label: "" };
}

export function historyReducer(state: History, action: HistoryAction): History {
  switch (action.type) {
    case "commit": {
      const base = action.from ?? state.present;
      if (base === action.graph) return state;
      const past = [...state.past, base];
      if (past.length > HISTORY_LIMIT) past.splice(0, past.length - HISTORY_LIMIT);
      return { past, present: action.graph, future: [], label: action.label };
    }
    case "preview":
      return { ...state, present: action.graph };
    case "undo": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future], label: "Undo" };
    }
    case "redo": {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      return { past: [...state.past, state.present], present: next, future: rest, label: "Redo" };
    }
    case "replace":
      // A new document (load, new molecule): history starts again.
      return { past: [], present: action.graph, future: [], label: action.label };
  }
}
