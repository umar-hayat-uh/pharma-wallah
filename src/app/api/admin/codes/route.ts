import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = ["shayanhusein@gmail.com"];

export async function GET() {
  const userSupabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("entry_codes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const userSupabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { entry_type, team_name, team_members } = body;

  const entryTypes: Record<string, { games: string[]; maxRetries: number }> = {
    solo_single: { games: ["mcq"], maxRetries: 2 },
    solo_pass: { games: ["mcq", "flashcard", "spotting"], maxRetries: 3 },
    team_single: { games: ["mcq"], maxRetries: 2 },
    team_pass: { games: ["mcq", "flashcard", "spotting"], maxRetries: 3 },
  };

  const config = entryTypes[entry_type];
  if (!config) return NextResponse.json({ error: "Invalid entry type" }, { status: 400 });

  const code = crypto.randomUUID().slice(0, 8).toUpperCase();
  const payload: any = {
    code,
    entry_type,
    games_included: config.games,
    max_retries: config.maxRetries,
  };
  if (entry_type.startsWith("team")) {
    payload.team_name = team_name || null;
    payload.team_members = team_members || [];
  }

  const supabase = await createServiceSupabaseClient();
  const { error: insertError } = await supabase.from("entry_codes").insert(payload);
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ code });
}