/**
 * POST /api/community/report — flag a post or comment for a moderator.
 *
 * Reports are write-mostly: the RLS policy lets a member insert one and read
 * only their own. Moderators read the queue in the Supabase dashboard — there
 * is deliberately no GET here, so no route can ever expose the whole table.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityWriteLimiter } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { MAX_REPORT_DETAILS_LEN, REPORT_REASONS } from "@/lib/community/constants";
import { ensureMember, errorResponse, isValidUUID } from "@/lib/community/server";

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Sign in to report", 401);

    const { success } = await checkLimit(communityWriteLimiter, user.id);
    if (!success) return errorResponse("Too many requests", 429);

    let body: { target_type?: string; target_id?: string; reason?: string; details?: string };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    if (body.target_type !== "post" && body.target_type !== "comment") {
        return errorResponse("Invalid target type", 400);
    }
    if (!isValidUUID(body.target_id)) return errorResponse("Invalid target", 400);
    // The reason must be one of the published list — free text goes in `details`,
    // so the moderation queue stays groupable.
    if (!REPORT_REASONS.includes(body.reason as any)) {
        return errorResponse("Choose a reason", 400);
    }

    const member = await ensureMember(supabase, user);
    if (!member.ok) return errorResponse(member.error, 500);

    const { error } = await supabase.from("community_reports").upsert(
        {
            reporter_id: user.id,
            target_type: body.target_type,
            target_id: body.target_id,
            reason: body.reason,
            details: (body.details ?? "").trim().slice(0, MAX_REPORT_DETAILS_LEN) || null,
        },
        { onConflict: "reporter_id,target_type,target_id" }
    );

    if (error) {
        console.error("[community] report failed:", error);
        return errorResponse("Could not send the report", 500);
    }

    // Reporting the same thing twice looks identical to the reporter, on
    // purpose — it gives nothing away about moderation state.
    return NextResponse.json({ reported: true });
}
