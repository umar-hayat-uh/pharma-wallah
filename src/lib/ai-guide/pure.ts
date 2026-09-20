// src/lib/ai-guide/pure.ts
//
// Everything about the AI Guide that can be decided without a network, a DOM or
// a model: request validation, Gemini history shaping, the NDJSON wire format
// and thread bookkeeping. Kept pure so `scripts/ai-guide.test.mts` can cover it
// — the model's own output is non-deterministic and cannot be tested, so the
// deterministic half is where the tests have to earn their keep.

import type { ChatMessage, ChatRole, StreamEvent, Thread } from "./types";

/* ── Limits ────────────────────────────────────────────────────────────────
 * Every one of these exists to bound what a single request can make us spend
 * at Gemini. They are enforced server-side in `normaliseMessages()`; the
 * composer also uses MAX_CONTENT_CHARS so a student sees the ceiling rather
 * than hitting a 400. */

/** Turns of history sent to the model. Older turns are dropped, oldest first. */
export const MAX_MESSAGES = 30;
/** Characters in one message. ~2,000 words — far past any real question. */
export const MAX_CONTENT_CHARS = 8_000;
/** Characters across the whole conversation, after per-message clamping. */
export const MAX_TOTAL_CHARS = 24_000;

export interface WireMessage {
  role: ChatRole;
  content: string;
}

export type NormaliseResult =
  | { ok: true; messages: WireMessage[] }
  | { ok: false; error: string };

/**
 * Validate and bound a client-supplied `messages` array.
 *
 * The old route checked only `Array.isArray(messages) && length > 0`, which let
 * an unbounded conversation — or a single 10 MB string — through to a paid API.
 * Everything here is a rejection or a clamp; nothing is trusted.
 */
export function normaliseMessages(input: unknown): NormaliseResult {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: "A non-empty messages array is required." };
  }

  // Keep the most recent turns: the tail is the conversation being had, and
  // dropping from the front is what a reader would expect to lose.
  const tail = input.slice(-MAX_MESSAGES);
  const messages: WireMessage[] = [];

  for (const raw of tail) {
    if (!raw || typeof raw !== "object") continue;
    const { role, content } = raw as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim();
    if (!trimmed) continue;
    messages.push({ role, content: trimmed.slice(0, MAX_CONTENT_CHARS) });
  }

  if (messages.length === 0) {
    return { ok: false, error: "A non-empty messages array is required." };
  }

  // The last turn has to be the question we are answering. An assistant turn
  // here means the client is confused, and Gemini would be asked to reply to
  // its own output.
  if (messages[messages.length - 1].role !== "user") {
    return { ok: false, error: "The last message must be from the user." };
  }

  // Total-size clamp, applied from the back so the current question always
  // survives even when the history before it is enormous. `cut` is the index of
  // the first turn we keep; the final turn is kept unconditionally, even if it
  // alone is over budget, because dropping it would leave nothing to answer.
  let total = 0;
  let cut = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    total += messages[i].content.length;
    if (total > MAX_TOTAL_CHARS && i < messages.length - 1) {
      cut = i + 1;
      break;
    }
  }

  return { ok: true, messages: messages.slice(cut) };
}

export interface GeminiTurn {
  role: "user" | "model";
  parts: { text: string }[];
}

/**
 * Reshape a conversation into Gemini chat history.
 *
 * Gemini's rules, which the API enforces with an opaque error: history must
 * start with a `user` turn and roles must strictly alternate. This is the
 * original route's logic, moved here unchanged so it is testable — the
 * ai-gemini-integration skill says to copy it rather than re-derive it.
 *
 * Takes the whole conversation and returns everything EXCEPT the final turn,
 * which is sent separately as the live message.
 */
export function toGeminiHistory(messages: WireMessage[]): GeminiTurn[] {
  const history: GeminiTurn[] = [];

  for (let i = 0; i < messages.length - 1; i++) {
    const role: "user" | "model" = messages[i].role === "user" ? "user" : "model";

    // Gemini history must open on a user turn — drop any leading model turns.
    if (history.length === 0 && role !== "user") continue;
    // Strict alternation: a repeat of the previous role is dropped, not merged,
    // because merging would silently change what the student appears to have
    // asked.
    if (history.length > 0 && history[history.length - 1].role === role) continue;

    history.push({ role, parts: [{ text: messages[i].content }] });
  }

  return history;
}

/* ── Wire format ───────────────────────────────────────────────────────────
 * Newline-delimited JSON. Plain text would be simpler, but there is no way to
 * report a failure that happens *after* the 200 header has gone out — and with
 * a streamed answer, that is exactly when a quota or safety stop occurs. One
 * JSON object per line gives us a channel for that. */

export function encodeEvent(event: StreamEvent): string {
  return `${JSON.stringify(event)}\n`;
}

/**
 * Feed decoded chunks in, get whole events out.
 *
 * A network chunk boundary falls wherever it likes — routinely mid-object — so
 * the trailing partial line is held back until its newline arrives.
 */
export function createStreamParser(): (chunk: string) => StreamEvent[] {
  let buffer = "";

  return (chunk: string): StreamEvent[] => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // incomplete tail, keep for the next chunk

    const events: StreamEvent[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed) as StreamEvent;
        if (parsed && typeof parsed === "object" && "type" in parsed) events.push(parsed);
      } catch {
        // A malformed line means the response was truncated or is not ours.
        // Dropping it keeps whatever text already arrived on screen, which is
        // more useful to a reader than discarding the answer.
      }
    }
    return events;
  };
}

/**
 * Best-effort client IP from the standard proxy headers Vercel sets.
 *
 * Deliberately NOT imported from `@/lib/tournament-redis`, which has the same
 * four lines: that module calls `Redis.fromEnv()` at module scope and throws
 * when Upstash is not configured. This route is required to keep working with
 * nothing but GEMINI_API_KEY (rate limiting then degrades to off, like every
 * other cache in the app), so it must not pull in a module that can throw on
 * import.
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // May be a chain: "client, proxy1, proxy2". The first entry is the client.
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/* ── Threads ───────────────────────────────────────────────────────────── */

/**
 * Name a conversation after its first question.
 *
 * Cut on a word boundary where there is one — "Explain the mechanism of…" reads
 * as a title, "Explain the mechanis…" reads as a bug.
 */
export function deriveThreadTitle(text: string, max = 48): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (!flat) return "New chat";
  if (flat.length <= max) return flat;

  const clipped = flat.slice(0, max);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

/** Newest activity first — the order the thread rail renders. */
export function sortThreads(threads: Thread[]): Thread[] {
  return [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Drop stored turns that cannot be rendered.
 *
 * localStorage is writable by anything running on the origin and survives
 * across deploys, so a thread read back may predate the current shape.
 */
export function sanitiseThread(value: unknown): Thread | null {
  if (!value || typeof value !== "object") return null;
  const t = value as Partial<Thread>;
  if (typeof t.id !== "string" || !t.id) return null;
  if (!Array.isArray(t.messages)) return null;

  const messages: ChatMessage[] = [];
  for (const m of t.messages) {
    if (!m || typeof m !== "object") continue;
    const msg = m as Partial<ChatMessage>;
    if (msg.role !== "user" && msg.role !== "assistant") continue;
    if (typeof msg.content !== "string" || !msg.content) continue;
    messages.push({
      id: typeof msg.id === "string" && msg.id ? msg.id : `${Date.now()}-${messages.length}`,
      role: msg.role,
      content: msg.content,
      mode: msg.mode,
      createdAt: typeof msg.createdAt === "number" ? msg.createdAt : Date.now(),
      stopped: msg.stopped === true ? true : undefined,
    });
  }

  const createdAt = typeof t.createdAt === "number" ? t.createdAt : Date.now();
  return {
    id: t.id,
    title: typeof t.title === "string" && t.title ? t.title : "New chat",
    messages,
    createdAt,
    updatedAt: typeof t.updatedAt === "number" ? t.updatedAt : createdAt,
  };
}
