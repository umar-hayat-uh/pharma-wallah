/**
 * For admin server pages: the admin, or null. A page renders nothing when it
 * gets null (the layout is already showing the sign-in / no-access gate) —
 * but it must still ask, because a page's data is fetched even when its
 * layout decides not to show it.
 */
import { getBattleAdmin, type AdminContext } from "./server";
import type { AdminRole } from "./types";

export async function adminForPage(need: AdminRole = "desk"): Promise<AdminContext | "role" | null> {
  const gate = await getBattleAdmin();
  if (!gate.ok) return null;
  if (need === "admin" && gate.admin.role !== "admin") return "role";
  return gate.admin;
}
