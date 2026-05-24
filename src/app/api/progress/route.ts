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

  // Fetch the progress row
  const { data: progressRow } = await supabase
    .from("progress")
    .select("id, total_time_spent_min, current_streak, longest_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  // If no progress row yet, return empty defaults
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

  // Fetch each related table separately (much more reliable)
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

  // Activity log is separate – linked by user_id, not progress_id
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

// ── Keep your existing POST function unchanged ──
export async function POST(req: Request) {
  // ... your current POST function (no changes needed)
}