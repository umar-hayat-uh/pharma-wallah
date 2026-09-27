/**
 * The battle's three calls: start (downloads everything), state, and submit a
 * round. The browser holds no participant id and no score of its own — only
 * the httpOnly cookie the start call set, which it cannot read.
 */
import type { BattleState, RoundAnswers, RoundNo, RoundResult } from "@/lib/battle-royale/types";

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
    const serverNow = Date.parse(body?.state?.now ?? "");
    const clockOffset = Number.isNaN(serverNow) ? 0 : serverNow - (t0 + t1) / 2;
    return { ok: true, data: body as T, clockOffset };
  } catch {
    // status 0 = no response at all: the connection, not the server, failed.
    return { ok: false, error: "No connection. Your answers are saved on this station.", status: 0 };
  }
}

export type SubmitResponse = { round: RoundNo; result: RoundResult; state: BattleState; repeat: boolean };

export const battleApi = {
  state: () => call<{ state: BattleState | null; notice?: string }>("/state"),
  start: (code: string) => call<{ state: BattleState }>("/start", { method: "POST", body: JSON.stringify({ code }) }),
  submit: (round: RoundNo, answers: RoundAnswers) =>
    call<SubmitResponse>("/submit", { method: "POST", body: JSON.stringify({ round, answers }) }),
  leave: () => call<{ ok: true }>("/state", { method: "DELETE" }),
};
