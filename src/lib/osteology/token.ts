/**
 * SERVER-ONLY: signed session tokens for Osteology Lab practice and exams.
 *
 * A paper is fully determined by (filter, seed) — questions.ts is deterministic — so
 * the token carries the seed and the rules, signed, and the server rebuilds the paper to
 * check or grade it. No answer key is ever sent before submission, nothing is stored
 * per session, and the token cannot be edited (a changed seed, time or mark fails the
 * signature).
 *
 * The signing key is derived from SUPABASE_SERVICE_ROLE_KEY with a fixed label, so no
 * new environment variable is needed and the service key itself never signs or leaves
 * the server. Rotating the service key invalidates in-flight papers, which is harmless.
 */
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import type { QType } from "./exam-config";
import type { Region } from "./types";

export type SessionClaims = {
  v: 1;
  /** Random id, for single-recording of exam attempts. */
  id: string;
  mode: "practice" | "exam";
  /** Exam preset id; "practice" for practice sessions. */
  preset: string;
  regions: Region[];
  types: QType[];
  scope: "bones" | "joints" | "both";
  count: number;
  seed: number;
  /** Pool fingerprint at issue time (questions.ts poolHash). */
  pool: string;
  /** Issued at, epoch seconds. */
  iat: number;
  /** Time limit in seconds; 0 = untimed. */
  limit: number;
  marks: number;
};

function key(): Buffer {
  const base = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) throw new Error("Osteology tokens need SUPABASE_SERVICE_ROLE_KEY on the server");
  return createHmac("sha256", base).update("pharmawallah:osteology-lab:session:v1").digest();
}

const b64 = (b: Buffer) => b.toString("base64url");

export function signSession(claims: Omit<SessionClaims, "v" | "id" | "seed" | "iat">): { token: string; claims: SessionClaims } {
  const full: SessionClaims = {
    v: 1,
    id: b64(randomBytes(9)),
    seed: randomInt(1, 2 ** 31 - 1),
    iat: Math.floor(Date.now() / 1000),
    ...claims,
  };
  const body = b64(Buffer.from(JSON.stringify(full)));
  const sig = b64(createHmac("sha256", key()).update(body).digest());
  return { token: `${body}.${sig}`, claims: full };
}

export function verifySession(token: unknown): SessionClaims | null {
  if (typeof token !== "string" || token.length > 2000) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", key()).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionClaims;
    return claims.v === 1 ? claims : null;
  } catch {
    return null;
  }
}
