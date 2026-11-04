import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isConfigured } from "@/lib/services";
import { unavailableSupabase } from "@/lib/supabase-unavailable";

/**
 * Server-only Supabase client.
 *
 * IMPORTANT:
 * Never import this file from client components.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 *
 * Created on first use, not when the module loads (2026-11-04). `next build`
 * loads every route module while collecting page data, so the old module-scope
 * check made the BUILD need the service-role key — and a host's build
 * environment then had to hold it (Netlify scans the build environment's
 * secrets against the output). Call sites are unchanged: `supabaseAdmin.from(…)`
 * builds the client on the first property access, then reuses it. Without the
 * keys it is a stand-in whose queries answer "unavailable at the moment"
 * (src/lib/supabase-unavailable.ts) — callers that use it as a cache (DailyMed,
 * PubMed) then simply miss and fetch live.
 */
let client: SupabaseClient | null = null;

function getAdmin(): SupabaseClient {
    if (client) return client;
    if (!isConfigured("supabaseAdmin")) return unavailableSupabase<SupabaseClient>();
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    return client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const c = getAdmin();
        const value = Reflect.get(c, prop, c);
        return typeof value === "function" ? value.bind(c) : value;
    },
});
