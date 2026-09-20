// src/lib/ai-guide/types.ts
//
// Shared shapes for the AI Guide. Imported by the route handler, the pure
// layer and the UI, so nothing here may touch the DOM, Node, or Gemini.

/** The two roles a stored turn can have. Gemini's own name for "assistant" is
 *  "model" — that translation happens once, in `toGeminiHistory()`. */
export type ChatRole = "user" | "assistant";

/** The study modes. The id is what crosses the wire; the server maps it back
 *  to a prompt directive, so a client can never inject prompt text itself. */
export type StudyModeId = "tutor" | "exam" | "compare" | "calc" | "clinical";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** The mode the answer was produced under — shown on the turn so a reader can
   *  tell why an answer is a quiz rather than an explanation. */
  mode?: StudyModeId;
  createdAt: number;
  /** Set when a stream was cut short (stop button, network drop). The partial
   *  answer is kept — it is usually still useful — but labelled. */
  stopped?: boolean;
}

export interface Thread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/** One frame of the NDJSON response stream. */
export type StreamEvent =
  | { type: "text"; value: string }
  | { type: "error"; value: string }
  | { type: "done" };
