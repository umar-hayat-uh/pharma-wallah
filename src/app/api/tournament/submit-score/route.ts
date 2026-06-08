import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code, gameType, score, playerName } = await request.json();

  if (!code || !gameType || score === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createServiceSupabaseClient();

  // Validate code again
  const { data: entry, error: entryError } = await supabase
    .from("entry_codes")
    .select("*")
    .eq("code", code)
    .single();

  if (entryError || !entry) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  // Determine attempt number
  const { count } = await supabase
    .from("tournament_scores")
    .select("*", { count: "exact", head: true })
    .eq("entry_code", code);

  const attemptNumber = (count || 0) + 1;

  // Insert score
  const { error: insertError } = await supabase
    .from("tournament_scores")
    .insert({
      entry_code: code,
      player_name: playerName || entry.team_name || "Anonymous",
      game_type: gameType,
      score,
      attempt_number: attemptNumber,
    });

  if (insertError) {
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }

  // Mark code as used if it's the last allowed attempt
  const allowedAttempts = (entry.max_retries || 0) + 1;
  if (attemptNumber >= allowedAttempts) {
    await supabase
      .from("entry_codes")
      .update({ is_used: true })
      .eq("code", code);
  }

  return NextResponse.json({ success: true, attemptNumber });
}