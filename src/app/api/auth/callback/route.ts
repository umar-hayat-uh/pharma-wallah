// src/app/api/auth/callback/route.ts
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (code) {
        // Use the same reliable server client as the rest of your app
        const supabase = await createServerSupabaseClient();

        // Exchange the one-time code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Redirect to the "email verified" page which shows the success UI
            return NextResponse.redirect(`${origin}/email-verified`);
        }
    }

    // Something went wrong – send back to signup with an error flag
    return NextResponse.redirect(`${origin}/signup?error=verification_failed`);
}