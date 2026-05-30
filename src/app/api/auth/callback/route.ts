// src/app/api/auth/callback/route.ts
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (code) {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Successful OAuth login – send to dashboard
            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    // OAuth failed – redirect to signup with error
    return NextResponse.redirect(`${origin}/signup?error=oauth_failed`);
}