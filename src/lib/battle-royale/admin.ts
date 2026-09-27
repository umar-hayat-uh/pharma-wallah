/**
 * Battle Royale — admin route helpers. Server-only.
 */
import { brAdminLimiter, checkLimit } from "@/lib/rateLimit";
import { errorResponse, requireBattleAdmin, type AdminContext } from "./server";
import type { AdminRole } from "./types";
import type { NextResponse } from "next/server";

/**
 * Every admin route handler starts with this: signed in, has a `br_admins`
 * row with at least `need`, and under the per-admin write limit. Middleware's
 * PROTECTED_PATHS is not relied on — `/battle-royale/admin` is not in it, and
 * even `/admin` there only proves "logged in".
 */
export async function adminGuard(
  need: AdminRole,
): Promise<{ admin: AdminContext; response?: never } | { admin?: never; response: NextResponse }> {
  const guard = await requireBattleAdmin(need);
  if (guard.response) return guard;
  const { success } = await checkLimit(brAdminLimiter, guard.admin.userId);
  if (!success) return { response: errorResponse("Too many admin actions in a minute. Please wait a moment.", 429) };
  return guard;
}

/** Postgres/PostgREST unique-violation code. */
export const UNIQUE_VIOLATION = "23505";
