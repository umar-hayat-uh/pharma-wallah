import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { adminGuard } from "@/lib/battle-royale/admin";
import { firstIssue, sessionSchema } from "@/lib/battle-royale/schemas";
import { SESSIONS_TAG, db, engineErrorResponse, errorResponse, readJson } from "@/lib/battle-royale/server";

type Ctx = { params: { id: string } };
const idSchema = z.string().uuid();

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await adminGuard("admin");
  if (guard.response) return guard.response;
  if (!idSchema.safeParse(params.id).success) return errorResponse("Session not found.", 404);

  const parsed = sessionSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const s = parsed.data;

  const svc = await db();
  const { data, error } = await svc
    .from("br_sessions")
    .update({
      name: s.name,
      event_date: s.eventDate,
      start_time: new Date(s.startTime).toISOString(),
      end_time: new Date(s.endTime).toISOString(),
      capacity: s.capacity,
      status: s.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select("id")
    .maybeSingle();
  if (error) return engineErrorResponse(error, "update session");
  if (!data) return errorResponse("Session not found.", 404);
  revalidateTag(SESSIONS_TAG);
  return NextResponse.json({ ok: true });
}

/**
 * Delete a session. Participants in it become walk-ins (the FK is
 * `on delete set null`) — the caller is told how many, so the admin can
 * cancel instead if people are relying on that slot.
 */
export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await adminGuard("admin");
  if (guard.response) return guard.response;
  if (!idSchema.safeParse(params.id).success) return errorResponse("Session not found.", 404);

  const svc = await db();
  const { count } = await svc.from("br_participants").select("id", { count: "exact", head: true }).eq("slot_id", params.id);
  const { error } = await svc.from("br_sessions").delete().eq("id", params.id);
  if (error) return engineErrorResponse(error, "delete session");
  revalidateTag(SESSIONS_TAG);
  return NextResponse.json({ ok: true, unassigned: count ?? 0 });
}
