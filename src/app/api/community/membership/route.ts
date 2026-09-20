/**
 * POST   /api/community/membership — join a space   (body: { space_id })
 * DELETE /api/community/membership?space_id=… — leave it
 *
 * Joining only personalises the feed and the member counter; every space stays
 * publicly readable either way. The space's `member_count` is maintained by a
 * database trigger, never incremented from here.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityWriteLimiter } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { ensureMember, errorResponse, isValidUUID } from "@/lib/community/server";

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Sign in to join a space", 401);

    const { success } = await checkLimit(communityWriteLimiter, user.id);
    if (!success) return errorResponse("Too many requests", 429);

    let body: { space_id?: string };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }
    if (!isValidUUID(body.space_id)) return errorResponse("Invalid space", 400);

    const member = await ensureMember(supabase, user);
    if (!member.ok) return errorResponse(member.error, 500);

    // Already a member is success, not a conflict — the button is a toggle.
    const { error } = await supabase
        .from("community_memberships")
        .upsert({ user_id: user.id, space_id: body.space_id }, { onConflict: "user_id,space_id" });

    if (error) {
        console.error("[community] join failed:", error);
        return errorResponse("Could not join the space", 500);
    }
    return NextResponse.json({ joined: true });
}

export async function DELETE(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const spaceId = new URL(req.url).searchParams.get("space_id");
    if (!isValidUUID(spaceId)) return errorResponse("Invalid space", 400);

    const { error } = await supabase
        .from("community_memberships")
        .delete()
        .eq("user_id", user.id)
        .eq("space_id", spaceId);

    if (error) {
        console.error("[community] leave failed:", error);
        return errorResponse("Could not leave the space", 500);
    }
    return NextResponse.json({ joined: false });
}
