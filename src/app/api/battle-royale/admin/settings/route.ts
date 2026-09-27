import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminGuard } from "@/lib/battle-royale/admin";
import { z } from "zod";
import { firstIssue, settingsSchema } from "@/lib/battle-royale/schemas";
import { invalidateLeaderboard } from "@/lib/battle-royale/leaderboard";
import { SETTINGS_TAG, db, engineErrorResponse, errorResponse, readJson } from "@/lib/battle-royale/server";

const settingsToggleSchema = z
  .object({ registrationOpen: z.boolean().optional(), competitionOpen: z.boolean().optional() })
  .strict();

export async function PATCH(req: Request) {
  const guard = await adminGuard("admin");
  if (guard.response) return guard.response;

  const body = await readJson(req);
  const svc = await db();

  // The overview's switches send only the flag they flip.
  const toggle = settingsToggleSchema.safeParse(body);
  if (toggle.success && Object.keys(toggle.data).length > 0) {
    const t = toggle.data;
    const { error } = await svc
      .from("br_settings")
      .update({
        ...(t.registrationOpen !== undefined && { registration_open: t.registrationOpen }),
        ...(t.competitionOpen !== undefined && { competition_open: t.competitionOpen }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) return engineErrorResponse(error, "toggle settings");
    revalidateTag(SETTINGS_TAG);
    return NextResponse.json({ ok: true });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const s = parsed.data;
  const { error } = await svc
    .from("br_settings")
    .update({
      event_title: s.eventTitle,
      tagline: s.tagline,
      event_date: s.eventDate,
      reporting_time: s.reportingTime,
      venue: s.venue,
      entry_fee: s.entryFee,
      contact_text: s.contactText,
      round1_count: s.round1Count,
      round2_count: s.round2Count,
      round3_count: s.round3Count,
      round1_seconds: s.round1Seconds,
      grid_size: s.gridSize,
      sync_grace_seconds: s.syncGraceSeconds,
      winners_count: s.winnersCount,
      registration_open: s.registrationOpen,
      competition_open: s.competitionOpen,
      show_full_names: s.showFullNames,
      rules: s.rules,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return engineErrorResponse(error, "update settings");
  revalidateTag(SETTINGS_TAG);
  await invalidateLeaderboard(); // names shown in full or short
  return NextResponse.json({ ok: true });
}
