import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const GAMES_MAP: Record<string, string[]> = {
  solo_single: ['mcq'],
  solo_pass: ['mcq', 'flashcard', 'spotting'],
  team_single: ['mcq'],
  team_pass: ['mcq', 'flashcard', 'spotting'],
};

const RETRIES_MAP: Record<string, number> = {
  solo_single: 2,
  solo_pass: 3,
  team_single: 2,
  team_pass: 3,
};

export async function POST(request: Request) {
  const userSupabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user || user.email !== "shayanhusein@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { registration_id, entry_type, team_name, team_members } = await request.json();
  if (!registration_id || !entry_type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createServiceSupabaseClient();

  let code = '';
  let isUnique = false;
  while (!isUnique) {
    code = generateCode();
    const { data: existing } = await supabase.from('entry_codes').select('code').eq('code', code).single();
    if (!existing) isUnique = true;
  }

  const { error: codeError } = await supabase.from('entry_codes').insert({
    code,
    entry_type,
    games_included: GAMES_MAP[entry_type] || [],
    max_retries: RETRIES_MAP[entry_type] || 0,
    is_used: false,
    team_name: team_name || null,
    team_members: team_members || null,
  });

  if (codeError) {
    console.error('Code insert error:', codeError);
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from('tournament_registrations')
    .update({ status: 'approved', entry_code: code })
    .eq('id', registration_id);

  if (updateError) {
    await supabase.from('entry_codes').delete().eq('code', code);
    return NextResponse.json({ error: 'Failed to approve registration' }, { status: 500 });
  }

  return NextResponse.json({ success: true, code });
}