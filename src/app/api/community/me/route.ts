/**
 * GET   /api/community/me — the signed-in member's community profile
 * PATCH /api/community/me — edit their bio / display name
 *
 * Karma and the counts are read-only here: they are maintained by database
 * triggers, and accepting them from a request body would let a member write
 * their own reputation.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityWriteLimiter } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { MAX_BIO_LEN } from "@/lib/community/constants";
import { ensureMember, errorResponse } from "@/lib/community/server";
import type { CommunityMe } from "@/lib/community/types";

export async function GET() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ me: null });

    const member = await ensureMember(supabase, user);
    if (!member.ok) return errorResponse(member.error, 500);

    const [{ data: profile }, { data: memberships }] = await Promise.all([
        supabase
            .from("community_members")
            .select("user_id, handle, display_name, avatar_url, bio, post_karma, comment_karma, post_count, comment_count")
            .eq("user_id", user.id)
            .maybeSingle(),
        supabase.from("community_memberships").select("space_id").eq("user_id", user.id),
    ]);

    if (!profile) return NextResponse.json({ me: null });

    const me: CommunityMe = {
        user_id: profile.user_id,
        handle: profile.handle,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        post_karma: profile.post_karma ?? 0,
        comment_karma: profile.comment_karma ?? 0,
        karma: (profile.post_karma ?? 0) + (profile.comment_karma ?? 0),
        post_count: profile.post_count ?? 0,
        comment_count: profile.comment_count ?? 0,
        joined_space_ids: (memberships ?? []).map((m: any) => m.space_id),
    };

    return NextResponse.json({ me });
}

export async function PATCH(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const { success } = await checkLimit(communityWriteLimiter, user.id);
    if (!success) return errorResponse("Too many requests", 429);

    let body: { display_name?: string; bio?: string };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.display_name === "string") {
        const name = body.display_name.trim().slice(0, 80);
        if (!name) return errorResponse("Display name can't be empty", 400);
        patch.display_name = name;
    }
    if (typeof body.bio === "string") {
        patch.bio = body.bio.trim().slice(0, MAX_BIO_LEN) || null;
    }

    const { error } = await supabase
        .from("community_members")
        .update(patch)
        .eq("user_id", user.id);

    if (error) {
        console.error("[community] profile update failed:", error);
        return errorResponse("Could not save your profile", 500);
    }
    return NextResponse.json({ success: true });
}
