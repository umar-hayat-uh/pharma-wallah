/**
 * POST /api/community/vote — cast, switch or take back a vote.
 *
 * SERVER-AUTHORITATIVE, deliberately (CLAUDE.md §6 rule 4). The client sends a
 * direction only — never a score, never a delta. The `community_vote` RPC works
 * out whether that direction means cast / switch / toggle-off, writes it in one
 * statement, and returns the score it actually stored. The UI updates
 * optimistically but then replaces its guess with this number, so a double-tap,
 * a stale tab or a crafted request can't desynchronise the count.
 *
 * The RPC runs as the caller (security invoker), so the vote RLS policy still
 * decides whether this member may vote at all.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityVoteLimiter } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { ensureMember, errorResponse, isValidUUID } from "@/lib/community/server";

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Sign in to vote", 401);

    const { success } = await checkLimit(communityVoteLimiter, user.id);
    if (!success) return errorResponse("Too many votes, slow down", 429);

    let body: { target_type?: string; target_id?: string; value?: number };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const { target_type, target_id, value } = body;

    if (target_type !== "post" && target_type !== "comment") {
        return errorResponse("Invalid target type", 400);
    }
    if (!isValidUUID(target_id)) return errorResponse("Invalid target", 400);
    if (value !== 1 && value !== -1) return errorResponse("Invalid vote", 400);

    const member = await ensureMember(supabase, user);
    if (!member.ok) return errorResponse(member.error, 500);

    const { data, error } = await supabase.rpc("community_vote", {
        p_target_type: target_type,
        p_target_id: target_id,
        p_value: value,
    });

    if (error) {
        console.error("[community] vote failed:", error);
        return errorResponse("Could not save your vote", 500);
    }

    // { score, value } — value is null when the member took their vote back.
    return NextResponse.json({
        score: (data as any)?.score ?? 0,
        user_vote: (data as any)?.value ?? null,
    });
}
