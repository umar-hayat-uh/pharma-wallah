"use client";

import { useCallback, useRef, useState } from "react";
import { createStreamParser } from "@/lib/ai-guide/pure";
import type { StudyModeId } from "@/lib/ai-guide/types";

/**
 * Sends a question and streams the answer back.
 *
 * The route answers with newline-delimited JSON (see `src/lib/ai-guide/pure.ts`
 * for the format and why it is not plain text). The parser is pure and unit
 * tested; this hook only owns the network call, the abort handle and the
 * growing text.
 */

export interface StreamHandlers {
  onText: (full: string) => void;
  onDone: (full: string, stopped: boolean) => void;
  onError: (message: string, partial: string) => void;
}

export interface SendPayload {
  messages: { role: "user" | "assistant"; content: string }[];
  mode: StudyModeId;
}

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const send = useCallback(async (payload: SendPayload, handlers: StreamHandlers) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsStreaming(true);

    let full = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        // Errors raised before the stream starts are ordinary JSON — that is
        // where 400s, 429s and a missing API key arrive.
        let message = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          if (data?.error) message = String(data.error);
        } catch {
          /* non-JSON error body, keep the default */
        }
        handlers.onError(message, "");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const parse = createStreamParser();
      let streamError: string | null = null;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const event of parse(decoder.decode(value, { stream: true }))) {
          if (event.type === "text") {
            full += event.value;
            handlers.onText(full);
          } else if (event.type === "error") {
            streamError = event.value;
          }
        }
      }

      if (streamError) handlers.onError(streamError, full);
      else handlers.onDone(full, false);
    } catch (err) {
      // An abort is the student pressing Stop, not a failure: whatever arrived
      // is kept and marked as stopped.
      if (err instanceof DOMException && err.name === "AbortError") {
        handlers.onDone(full, true);
        return;
      }
      handlers.onError(
        err instanceof Error && err.message
          ? "Lost connection while answering. Check your network and try again."
          : "Something went wrong. Please try again.",
        full,
      );
    } finally {
      controllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return { send, stop, isStreaming };
}
