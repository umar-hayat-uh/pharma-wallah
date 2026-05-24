// src/app/api/progress/route.ts
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  // Auth check with regular client
  const userSupabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Service‑role client for DB operations
  const supabase = await createServiceSupabaseClient();

  // Fetch progress row
  const { data: progressRow } = await supabase
    .from("progress")
    .select("id, total_time_spent_min, current_streak, longest_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!progressRow) {
    return NextResponse.json({
      units: [],
      flashcards: [],
      quizAttempts: [],
      spotting: [],
      recentActivity: [],
      totalTimeSpentMin: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
  }

  const progressId = progressRow.id;

  // Fetch child tables separately
  const { data: units } = await supabase
    .from("unit_progress")
    .select("*")
    .eq("progress_id", progressId);

  const { data: flashcards } = await supabase
    .from("flashcard_progress")
    .select("*")
    .eq("progress_id", progressId);

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("progress_id", progressId)
    .order("attempted_at", { ascending: false });

  const { data: spotting } = await supabase
    .from("spotting_progress")
    .select("*")
    .eq("progress_id", progressId);

  // Activity log is linked by user_id, not progress_id
  const { data: activityLog } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: false })
    .limit(20);

  return NextResponse.json({
    units: units || [],
    flashcards: flashcards || [],
    quizAttempts: quizAttempts || [],
    spotting: spotting || [],
    recentActivity: activityLog || [],
    totalTimeSpentMin: progressRow.total_time_spent_min ?? 0,
    currentStreak: progressRow.current_streak ?? 0,
    longestStreak: progressRow.longest_streak ?? 0,
  });
}

export async function POST(req: Request) {
  // Auth check
  const userSupabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Service‑role client
  const supabase = await createServiceSupabaseClient();

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, ...payload } = body;

  try {
    // Ensure progress row exists
    const { data: existing } = await supabase
      .from("progress")
      .select("id, total_time_spent_min")
      .eq("user_id", user.id)
      .maybeSingle();

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

      if (insertError) {
        console.error("Progress insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      progressId = newProgress?.id;
    }

    // Handle event types
    switch (type) {
      case "unit":
        await supabase.from("unit_progress").upsert(
          {
            progress_id: progressId,
            unit_id: payload.unitId,
            unit_title: payload.unitTitle || "",
            subject: payload.subject || "",
            semester: payload.semester || "",
            last_visited: new Date().toISOString(),
          },
          { onConflict: "progress_id, unit_id" }
        );
        break;

      case "flashcard":
        await supabase.from("flashcard_progress").upsert(
          {
            progress_id: progressId,
            category: payload.category,
            cards_reviewed: 1,
            cards_correct: payload.correct ? 1 : 0,
            last_practiced: new Date().toISOString(),
          },
          { onConflict: "progress_id, category" }
        );
        break;

      case "quiz":
        await supabase.from("quiz_attempts").insert({
          progress_id: progressId,
          quiz_id: payload.quizId,
          subject: payload.subject,
          score: payload.score,
          total: payload.total,
          time_taken_min: payload.timeTakenMin || 0,
          attempted_at: new Date().toISOString(),
        });
        break;

      case "spotting":
        await supabase.from("spotting_progress").upsert(
          {
            progress_id: progressId,
            lesson_id: payload.lessonId,
            category: payload.category,
            last_visited: new Date().toISOString(),
          },
          { onConflict: "progress_id, lesson_id" }
        );
        break;

      case "activity":
        await supabase.from("activity_log").insert({
          user_id: user.id,
          type: payload.type || "generic",
          label: payload.label || "",
          href: payload.href || "",
          timestamp: new Date().toISOString(),
        });
        break;

      default:
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
    }

    // Also insert an activity log entry for the event (if not already an activity)
    if (type !== "activity") {
      const activityLabel: Record<string, string> = {
        unit: `Visited: ${payload.unitTitle || payload.unitId}`,
        flashcard: `Practiced flashcards: ${payload.category}`,
        quiz: `Quiz: ${payload.subject} – ${payload.score}/${payload.total}`,
        spotting: `Spotting: ${payload.lessonId}`,
      };
      await supabase.from("activity_log").insert({
        user_id: user.id,
        type: type,
        label: activityLabel[type] || type,
        href: payload.href || "",
        timestamp: new Date().toISOString(),
      });
    }

    // Update last active and total time
    const timeToAdd = payload.timeSpentMin || 0;
    await supabase
      .from("progress")
      .update({
        last_active_at: new Date().toISOString(),
        total_time_spent_min: (existing?.total_time_spent_min || 0) + timeToAdd,
      })
      .eq("id", progressId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/progress error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}