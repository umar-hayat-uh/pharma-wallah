// app/auth/callback/route.ts
// Supabase calls this URL after the user clicks the email verification link.
// It exchanges the one-time code for a real session, then redirects to the
// email-verified page (which shows the success screen before going to dashboard).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (code) {
        const cookieStore = cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        // Exchange the one-time code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Redirect to the "email verified" page which shows the success UI
            return NextResponse.redirect(`${origin}/email-verified`);
        }
    }

    // Something went wrong — send back to signup with an error flag
    return NextResponse.redirect(`${origin}/signup?error=verification_failed`);
}