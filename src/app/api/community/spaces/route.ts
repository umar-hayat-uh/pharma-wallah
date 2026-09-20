/**
 * GET /api/community/spaces — every pharmacy space, with the viewer's memberships.
 *
 * Spaces are seeded by the migration and are not user-creatable, so there is no
 * POST here: `community_spaces` has a read-only RLS policy and no insert policy,
 * which means even a crafted request cannot add one.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityReadLimiter } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/tournament-redis";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/community/server";
import type { CommunitySpace } from "@/lib/community/types";

export async function GET(req: Request) {
    const supabase = await createServerSupabaseClient();

    const { data: { user: viewer } } = await supabase.auth.getUser();

    // Cheap query, but it is public and runs on every community page load, so
    // an anonymous caller is still capped (§6 rule 6). 60/10s per IP is far
    // above real browsing, including a shared campus NAT.
    if (!viewer) {
        const { success } = await checkLimit(communityReadLimiter, getClientIp(req));
        if (!success) return errorResponse("Too many requests", 429);
    }

    const { data, error } = await supabase
        .from("community_spaces")
        .select("id, slug, name, tagline, description, icon, accent, flairs, rules, member_count, post_count, is_default")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    if (error) {
        console.error("[community] spaces query failed:", error);
        return errorResponse("Database error", 500);
    }

    let joined = new Set<string>();
    const user = viewer;
    if (user) {
        const { data: memberships } = await supabase
            .from("community_memberships")
            .select("space_id")
            .eq("user_id", user.id);
        joined = new Set((memberships ?? []).map((m: any) => m.space_id));
    }

    const spaces: CommunitySpace[] = (data ?? []).map((s: any) => ({
        ...s,
        flairs: s.flairs ?? [],
        rules: s.rules ?? [],
        joined: joined.has(s.id),
    }));

    return NextResponse.json({ spaces });
}
