/**
 * The battle's four calls. The browser holds no participant id and no score of
 * its own — only the httpOnly cookie the start call set, which it cannot read.
 */
import type { AnswerPayload, AnswerResult, BattleState } from "@/lib/battle-royale/types";

export type ApiResult<T> =
  | { ok: true; data: T; clockOffset: number }
  | { ok: false; error: string; code?: string; status: number };

const BASE = "/api/battle-royale/battle";

async function call<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      cache: "no-store",
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
    const t1 = Date.now();
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: body.error ?? "Something went wrong. Please try again.", code: body.code, status: res.status };
    }
    // Server clock minus the midpoint of the round trip: the offset the
    // countdown uses, so a station with a wrong clock still shows true time.
    const serverNow = Date.parse(body?.state?.now ?? "");
    const clockOffset = Number.isNaN(serverNow) ? 0 : serverNow - (t0 + t1) / 2;
    return { ok: true, data: body as T, clockOffset };
  } catch {
    return { ok: false, error: "Connection lost. Check the network — your battle is saved on the server.", status: 0 };
  }
}

export const battleApi = {
  state: () => call<{ state: BattleState | null; notice?: string }>("/state"),
  start: (identifier: string, gameCode: string) =>
    call<{ state: BattleState }>("/start", { method: "POST", body: JSON.stringify({ identifier, gameCode }) }),
  serve: () => call<{ state: BattleState }>("/serve", { method: "POST" }),
  answer: (questionId: string, answer: AnswerPayload) =>
    call<{ result: AnswerResult; state: BattleState }>("/answer", {
      method: "POST",
      body: JSON.stringify({ questionId, answer }),
    }),
  leave: () => call<{ ok: true }>("/state", { method: "DELETE" }),
};
