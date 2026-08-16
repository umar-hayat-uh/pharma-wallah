import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = ["shayanhusein@gmail.com"];

const ENTRY_DEFAULTS: Record<string, { games: string[]; maxRetries: number }> = {
  solo_single: { games: ["mcq"], maxRetries: 2 },
  solo_pass: { games: ["mcq", "flashcard", "spotting"], maxRetries: 3 },
  team_single: { games: ["mcq"], maxRetries: 2 },
  team_pass: { games: ["mcq", "flashcard", "spotting"], maxRetries: 3 },
};

async function requireAdmin() {
  const userSupabase = await createServerSupabaseClient();
  const { data: { user }, error } = await userSupabase.auth.getUser();
  if (error || !user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return null;
  }
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("entry_codes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { entry_type, team_name, team_members, games_included } = body;

  const defaults = ENTRY_DEFAULTS[entry_type];
  if (!defaults) {
    return NextResponse.json({ error: "Invalid entry type" }, { status: 400 });
  }

  const games = games_included && games_included.length > 0 ? games_included : defaults.games;
  const code = crypto.randomUUID().slice(0, 8).toUpperCase();

  const payload: Record<string, unknown> = {
    code,
    entry_type,
    games_included: games,
    max_retries: defaults.maxRetries,
    is_used: false,
    team_name: entry_type.startsWith("team") ? team_name || null : null,
    team_members: entry_type.startsWith("team") ? team_members || [] : null,
  };

  const supabase = await createServiceSupabaseClient();
  const { error: insertError } = await supabase.from("entry_codes").insert(payload);
  if (insertError) {
    console.error("Code insert error:", insertError);
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }

  return NextResponse.json({ code });
}
