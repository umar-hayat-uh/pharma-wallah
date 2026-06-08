import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ valid: false, message: 'No code provided' }, { status: 400 });

  const supabase = await createServiceSupabaseClient();
  const { data, error } = await supabase
    .from('entry_codes')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) {
    return NextResponse.json({ valid: false, message: 'Invalid code' });
  }

  if (data.is_used) {
    return NextResponse.json({ valid: false, message: 'Code already used' });
  }

  return NextResponse.json({
    valid: true,
    code: data.code,
    entry_type: data.entry_type,
    games_included: data.games_included,
    max_retries: data.max_retries,
    team_name: data.team_name,
    team_members: data.team_members,
  });
}