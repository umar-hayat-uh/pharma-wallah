import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, year, semester } = await request.json();
  if (!name || !email || !year || !semester) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const supabase = await createServiceSupabaseClient();
  const { error } = await supabase
    .from('tournament_registrations')
    .insert({ name, email, year, semester, status: 'pending' });

  if (error) {
    return NextResponse.json({ error: 'Failed to submit registration.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Registration submitted. Visit the cashier to complete payment.' });
}