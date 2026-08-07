// src/app/api/progress/route.ts
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { redis, progressCacheKey, PROGRESS_CACHE_TTL_SECONDS } from "@/lib/redis";
import { progressReadLimiter, progressWriteLimiter, checkLimit } from "@/lib/rateLimit";
import { applyProgressEvent, invalidateProgressCache, ProgressEventValidationError } from "@/lib/progress-server";

export async function GET() {
  const userSupabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = await checkLimit(progressReadLimiter, user.id);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const cacheKey = progressCacheKey(user.id);

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
      }
    } catch (err) {
      console.error("[progress GET] cache read failed", err);
    }
  }

  const supabase = await createServiceSupabaseClient();

  const { data: progressRow, error: progressErr } = await supabase
    .from("progress")
    .select("id, total_time_spent_min, current_streak, longest_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  if (progressErr) {
    console.error("[progress GET] failed to load progress row", progressErr);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }

  let payload;

  if (!progressRow) {
    payload = {
      units: [],
      flashcards: [],
      quizAttempts: [],
      spotting: [],
      recentActivity: [],
      totalTimeSpentMin: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  } else {
    const progressId = progressRow.id;

    const results = await Promise.allSettled([
      supabase.from("unit_progress").select("*").eq("progress_id", progressId),
      supabase.from("flashcard_progress").select("*").eq("progress_id", progressId),
      supabase.from("quiz_attempts").select("*").eq("progress_id", progressId).order("attempted_at", { ascending: false }),
      supabase.from("spotting_progress").select("*").eq("progress_id", progressId),
      supabase.from("activity_log").select("*").eq("user_id", user.id).order("timestamp", { ascending: false }).limit(20),
    ]);

    const [unitsRes, flashcardsRes, quizRes, spottingRes, activityRes] = results;

    // Partial failure handling: one failed query shouldn't 500 the whole
    // dashboard — degrade that section to empty and log it.
    const unwrap = <T,>(r: PromiseSettledResult<{ data: T[] | null; error: any }>, label: string): T[] => {
      if (r.status === "rejected") {
        console.error(`[progress GET] ${label} query rejected`, r.reason);
        return [];
      }
      if (r.value.error) {
        console.error(`[progress GET] ${label} query error`, r.value.error);
        return [];
      }
      return r.value.data || [];
    };

    payload = {
      units: unwrap(unitsRes as any, "unit_progress"),
      flashcards: unwrap(flashcardsRes as any, "flashcard_progress"),
      quizAttempts: unwrap(quizRes as any, "quiz_attempts"),
      spotting: unwrap(spottingRes as any, "spotting_progress"),
      recentActivity: unwrap(activityRes as any, "activity_log"),
      totalTimeSpentMin: progressRow.total_time_spent_min ?? 0,
      currentStreak: progressRow.current_streak ?? 0,
      longestStreak: progressRow.longest_streak ?? 0,
    };
  }

  if (redis) {
    redis
      .set(cacheKey, payload, { ex: PROGRESS_CACHE_TTL_SECONDS })
      .catch((err) => console.error("[progress GET] cache write failed", err));
  }

  return NextResponse.json(payload, { headers: { "X-Cache": "MISS" } });
}

export async function POST(req: Request) {
  const userSupabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = await checkLimit(progressWriteLimiter, user.id);
  if (!success) {
    return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = await createServiceSupabaseClient();

  try {
    await applyProgressEvent(supabase, user, body);
    await invalidateProgressCache(user.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof ProgressEventValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("POST /api/progress error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}