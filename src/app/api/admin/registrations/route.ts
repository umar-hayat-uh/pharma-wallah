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
    .from("tournament_registrations")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
