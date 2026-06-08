import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameType = searchParams.get("game"); // optional filter

  const supabase = await createServiceSupabaseClient();

  // Build scores query
  let query = supabase
    .from("tournament_scores")
    .select(`
      id,
      entry_code,
      player_name,
      game_type,
      score,
      attempt_number,
      played_at,
      entry_codes ( team_name )
    `)
    .order("score", { ascending: false })
    .order("played_at", { ascending: true })
    .limit(50);

  if (gameType) {
    query = query.eq("game_type", gameType);
  }

  const { data: scores, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get all unique entry codes from scores (using Array.from to avoid Set spread issue)
  const entryCodes: string[] = Array.from(new Set(scores.map((s: any) => s.entry_code)));

  // Fetch registration names for these codes
  const { data: registrations, error: regError } = await supabase
    .from("tournament_registrations")
    .select("entry_code, name")
    .in("entry_code", entryCodes);

  if (regError) {
    console.error("Registration lookup error:", regError);
  }

  // Build a map: entry_code -> registration name
  const nameMap: Record<string, string> = {};
  if (registrations) {
    registrations.forEach((reg: any) => {
      if (reg.entry_code && reg.name) {
        nameMap[reg.entry_code] = reg.name;
      }
    });
  }

  // Build leaderboard entries
  const leaderboard = scores.map((entry: any) => {
    const regName = nameMap[entry.entry_code];
    const teamName = entry.entry_codes?.team_name;
    const playerName = entry.player_name;
    const displayName = regName || teamName || playerName || "Anonymous";

    return {
      id: entry.id,
      code: entry.entry_code,
      name: displayName,
      gameType: entry.game_type,
      score: entry.score,
      attempt: entry.attempt_number,
      playedAt: entry.played_at,
    };
  });

  return NextResponse.json(leaderboard);
}