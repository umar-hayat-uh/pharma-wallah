/**
 * POST   /api/community/posts/:id/save — save a post to the member's list
 * DELETE /api/community/posts/:id/save — unsave it
 *
 * A save is private: the `community_saves` RLS policy scopes both reads and
 * writes to `auth.uid()`, so one member can never see or alter another's list.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityWriteLimiter } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { ensureMember, errorResponse, isValidUUID } from "@/lib/community/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Post not found", 404);

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Sign in to save posts", 401);

    const { success } = await checkLimit(communityWriteLimiter, user.id);
    if (!success) return errorResponse("Too many requests", 429);

    const member = await ensureMember(supabase, user);
    if (!member.ok) return errorResponse(member.error, 500);

    // Saving twice is a no-op rather than an error — the button is a toggle and
    // two quick taps must not surface a failure.
    const { error } = await supabase
        .from("community_saves")
        .upsert({ user_id: user.id, post_id: params.id }, { onConflict: "user_id,post_id" });

    if (error) {
        console.error("[community] save failed:", error);
        return errorResponse("Could not save the post", 500);
    }
    return NextResponse.json({ saved: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Post not found", 404);

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const { error } = await supabase
        .from("community_saves")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", params.id);

    if (error) {
        console.error("[community] unsave failed:", error);
        return errorResponse("Could not remove the post", 500);
    }
    return NextResponse.json({ saved: false });
}
