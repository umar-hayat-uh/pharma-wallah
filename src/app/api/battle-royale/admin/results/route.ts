import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminGuard } from "@/lib/battle-royale/admin";
import { firstIssue, resultsActionSchema } from "@/lib/battle-royale/schemas";
import { SETTINGS_TAG, db, engineErrorResponse, errorResponse, readJson, readSettings } from "@/lib/battle-royale/server";
import { sendBattleEmails } from "@/lib/battle-royale/email";
import { invalidateLeaderboard } from "@/lib/battle-royale/leaderboard";

/** The closed flag is a later column; say which SQL adds it rather than "something went wrong". */
function closedFlagError(error: { message?: string }, where: string) {
  if (String(error.message ?? "").includes("event_closed")) {
    return errorResponse("Run supabase/migrations/20260929_battle_royale_closed.sql in the Supabase SQL editor first.", 503);
  }
  return engineErrorResponse(error, where);
}

/** Most emails one request sends; a larger field is notified in batches. */
const MAX_NOTIFY = 150;

/*
 * The closing sequence from the event plan: freeze the board (and stop new
 * battles), verify, finalise (Top N become winners), then notify.
 * Finalising requires a frozen board, so the winners can't change underneath
 * the announcement.
 */
export async function POST(req: Request) {
  const guard = await adminGuard("admin");
  if (guard.response) return guard.response;

  const parsed = resultsActionSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const action = parsed.data;

  const svc = await db();
  const settings = await readSettings();
  if (!settings) return errorResponse("Settings are unavailable.", 503);
  const now = new Date().toISOString();
  // Every action here changes what the public board shows.
  if (action.action !== "notify") await invalidateLeaderboard();

  switch (action.action) {
    case "freeze": {
      const { error } = await svc
        .from("br_settings")
        .update({ leaderboard_frozen_at: now, competition_open: false, updated_at: now })
        .eq("id", 1);
      if (error) return engineErrorResponse(error, "freeze");
      break;
    }
    case "unfreeze": {
      if (settings.resultsFinalized) return errorResponse("Un-finalise the results before unfreezing the board.", 409);
      const { error } = await svc.from("br_settings").update({ leaderboard_frozen_at: null, updated_at: now }).eq("id", 1);
      if (error) return engineErrorResponse(error, "unfreeze");
      break;
    }
    case "finalize": {
      if (!settings.leaderboardFrozenAt) return errorResponse("Freeze the leaderboard before finalising results.", 409);
      const { data, error } = await svc.rpc("br_finalize_results", { p_winners: settings.winnersCount });
      if (error) return engineErrorResponse(error, "finalize");
      revalidateTag(SETTINGS_TAG);
      await invalidateLeaderboard();
      return NextResponse.json({ ok: true, labelled: data });
    }
    case "unfinalize": {
      const { error } = await svc.rpc("br_unfinalize_results");
      if (error) return engineErrorResponse(error, "unfinalize");
      break;
    }
    case "close": {
      // One button for the end of the event: registration and battles off, the
      // board frozen (if it isn't already — an earlier freeze time is kept), and
      // the public pages reduced to the leaderboard and My result.
      const { error } = await svc
        .from("br_settings")
        .update({
          event_closed: true,
          registration_open: false,
          competition_open: false,
          leaderboard_frozen_at: settings.leaderboardFrozenAt ?? now,
          updated_at: now,
        })
        .eq("id", 1);
      if (error) return closedFlagError(error, "close");
      break;
    }
    case "reopen": {
      // Only lifts the curtain. Registration, battles and the freeze stay as they
      // are — the organisers turn each back on deliberately.
      const { error } = await svc.from("br_settings").update({ event_closed: false, updated_at: now }).eq("id", 1);
      if (error) return closedFlagError(error, "reopen");
      break;
    }
    case "notify": {
      if (!settings.resultsFinalized) return errorResponse("Finalise the results before emailing them.", 409);
      // Result emails go to everyone ranked; qualification only to the
      // participants an admin marked qualified or not qualified.
      let query = svc.from("br_leaderboard").select("participant_id").order("rank").limit(MAX_NOTIFY);
      if (action.type === "qualification") query = query.in("final_status", ["qualified", "not_qualified"]);
      const { data, error } = await query;
      if (error) return engineErrorResponse(error, "notify list");
      const tally = await sendBattleEmails(action.type, (data ?? []).map((r) => r.participant_id));
      return NextResponse.json({ ok: true, ...tally, capped: (data?.length ?? 0) >= MAX_NOTIFY });
    }
  }
  revalidateTag(SETTINGS_TAG);
  await invalidateLeaderboard();
  return NextResponse.json({ ok: true });
}
