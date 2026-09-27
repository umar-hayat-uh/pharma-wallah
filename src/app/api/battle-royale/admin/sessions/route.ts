import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminGuard } from "@/lib/battle-royale/admin";
import { firstIssue, sessionSchema } from "@/lib/battle-royale/schemas";
import { SESSIONS_TAG, db, engineErrorResponse, errorResponse, readJson } from "@/lib/battle-royale/server";

export async function POST(req: Request) {
  const guard = await adminGuard("admin");
  if (guard.response) return guard.response;

  const parsed = sessionSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const s = parsed.data;

  const svc = await db();
  const { data, error } = await svc
    .from("br_sessions")
    .insert({
      name: s.name,
      event_date: s.eventDate,
      start_time: new Date(s.startTime).toISOString(),
      end_time: new Date(s.endTime).toISOString(),
      capacity: s.capacity,
      status: s.status,
    })
    .select("id")
    .single();
  if (error) return engineErrorResponse(error, "create session");
  revalidateTag(SESSIONS_TAG);
  return NextResponse.json({ id: data.id }, { status: 201 });
}
