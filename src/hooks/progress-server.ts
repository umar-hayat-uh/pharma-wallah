// src/lib/progress-server.ts
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { redis, progressCacheKey } from "@/lib/redis";

export type ProgressEventPayload = {
  type: "unit" | "flashcard" | "quiz" | "spotting" | "activity";
  [key: string]: unknown;
};

export class ProgressEventValidationError extends Error {}

/** Basic runtime validation per event type — matches the NOT NULL columns in your schema. */
function validateEvent(payload: ProgressEventPayload): void {
  const { type } = payload;
  switch (type) {
    case "unit":
      if (!payload.unitId || typeof payload.unitId !== "string") {
        throw new ProgressEventValidationError("unit event requires unitId");
      }
      break;
    case "flashcard":
      if (!payload.category || typeof payload.category !== "string") {
        throw new ProgressEventValidationError("flashcard event requires category");
      }
      break;
    case "quiz":
      if (typeof payload.score !== "number" || typeof payload.total !== "number") {
        throw new ProgressEventValidationError("quiz event requires numeric score and total");
      }
      if (!payload.quizId || typeof payload.quizId !== "string") {
        throw new ProgressEventValidationError("quiz event requires quizId");
      }
      break;
    case "spotting":
      if (!payload.lessonId || typeof payload.lessonId !== "string") {
        throw new ProgressEventValidationError("spotting event requires lessonId");
      }
      break;
    case "activity":
      // label/href are optional text columns; no hard requirement beyond type.
      break;
    default:
      throw new ProgressEventValidationError(`Unknown event type: ${String(type)}`);
  }
}

export async function invalidateProgressCache(userId: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(progressCacheKey(userId));
  } catch (err) {
    console.error("[progress] cache invalidation failed", err);
  }
}

/**
 * Applies a single progress event for a user: ensures a `progress` row
 * exists, upserts/inserts into the relevant child table, writes a matching
 * activity_log entry with a human-readable label, and bumps total_time_spent_min.
 *
 * Shared by both the single-event POST route and the batched route so the
 * two paths can never drift in behaviour.
 */
export async function applyProgressEvent(
  supabase: Awaited<ReturnType<typeof createServiceSupabaseClient>>,
  user: { id: string; email?: string | null; user_metadata?: any },
  payload: ProgressEventPayload
): Promise<void> {
  validateEvent(payload);
  const { type, ...rest } = payload;

  const { data: existing, error: fetchErr } = await supabase
    .from("progress")
    .select("id, total_time_spent_min")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr) throw fetchErr;

  let progressId = existing?.id;

  if (!progressId) {
    const { data: newProgress, error: insertError } = await supabase
      .from("progress")
      .insert({
        user_id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name ?? user.email,
        avatar_url: user.user_metadata?.avatar_url,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;
    progressId = newProgress?.id;
  }

  switch (type) {
    case "unit": {
      const { error } = await supabase.from("unit_progress").upsert(
        {
          progress_id: progressId,
          unit_id: rest.unitId,
          unit_title: rest.unitTitle || "",
          subject: rest.subject || "",
          semester: rest.semester || "",
          last_visited: new Date().toISOString(),
        },
        { onConflict: "progress_id, unit_id" }
      );
      if (error) throw error;
      break;
    }
    case "flashcard": {
      const { error } = await supabase.from("flashcard_progress").upsert(
        {
          progress_id: progressId,
          category: rest.category,
          cards_reviewed: 1,
          cards_correct: rest.correct ? 1 : 0,
          last_practiced: new Date().toISOString(),
        },
        { onConflict: "progress_id, category" }
      );
      if (error) throw error;
      break;
    }
    case "quiz": {
      const { error } = await supabase.from("quiz_attempts").insert({
        progress_id: progressId,
        quiz_id: rest.quizId,
        subject: rest.subject,
        score: rest.score,
        total: rest.total,
        time_taken_min: typeof rest.timeTakenMin === "number" ? rest.timeTakenMin : 0,
        attempted_at: new Date().toISOString(),
      });
      if (error) throw error;
      break;
    }
    case "spotting": {
      const { error } = await supabase.from("spotting_progress").upsert(
        {
          progress_id: progressId,
          lesson_id: rest.lessonId,
          category: rest.category,
          last_visited: new Date().toISOString(),
        },
        { onConflict: "progress_id, lesson_id" }
      );
      if (error) throw error;
      break;
    }
    case "activity": {
      const { error } = await supabase.from("activity_log").insert({
        user_id: user.id,
        type: (rest.subType as string) || (rest.type as string) || "generic",
        label: (rest.label as string) || "",
        href: (rest.href as string) || "",
        timestamp: new Date().toISOString(),
      });
      if (error) throw error;
      break;
    }
  }

  // Human-readable label for the feed — this is what DashboardTabs.tsx's
  // FeedTab renders instead of the raw event type.
  if (type !== "activity") {
    const activityLabel: Record<string, string> = {
      unit: `Visited: ${(rest.unitTitle as string) || (rest.unitId as string)}`,
      flashcard: `Practiced flashcards: ${rest.category}`,
      quiz: `Quiz: ${rest.subject} – ${rest.score}/${rest.total}`,
      spotting: `Spotting: ${(rest.lessonTitle as string) || (rest.lessonId as string)}`,
    };
    const { error } = await supabase.from("activity_log").insert({
      user_id: user.id,
      type,
      label: activityLabel[type] || type,
      href: (rest.href as string) || "",
      timestamp: new Date().toISOString(),
    });
    if (error) throw error;
  }

  const timeToAdd = typeof rest.timeSpentMin === "number" ? rest.timeSpentMin : 0;
  const { error: updateErr } = await supabase
    .from("progress")
    .update({
      last_active_at: new Date().toISOString(),
      total_time_spent_min: (existing?.total_time_spent_min || 0) + timeToAdd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", progressId);
  if (updateErr) throw updateErr;
}