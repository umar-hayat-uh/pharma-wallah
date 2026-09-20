/**
 * PATCH  /api/community/comments/:id — edit (author only)
 * DELETE /api/community/comments/:id — soft delete (author only)
 *
 * Deleting is soft for the same reason Reddit's is: the replies underneath keep
 * their parent, so a thread does not collapse when someone removes one line.
 * The API blanks the body and drops the author, so nothing is disclosed.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityWriteLimiter } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { MAX_COMMENT_LEN } from "@/lib/community/constants";
import { errorResponse, isValidUUID } from "@/lib/community/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Comment not found", 404);

    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const { success } = await checkLimit(communityWriteLimiter, user.id);
    if (!success) return errorResponse("Too many requests", 429);

    let body: { body?: string };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const text = (body.body ?? "").trim();
    if (!text) return errorResponse("A comment can't be empty", 400);
    if (text.length > MAX_COMMENT_LEN) {
        return errorResponse(`Comment must be ${MAX_COMMENT_LEN} characters or fewer`, 400);
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from("community_comments")
        .update({ body: text, updated_at: now, edited_at: now })
        .eq("id", params.id)
        .eq("user_id", user.id) // ownership
        .select("id, body, edited_at")
        .maybeSingle();

    if (error) {
        console.error("[community] comment update failed:", error);
        return errorResponse("Could not save your edit", 500);
    }
    if (!data) return errorResponse("Comment not found, or it isn't yours to edit", 404);

    return NextResponse.json({ comment: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Comment not found", 404);

    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const { data, error } = await supabase
        .from("community_comments")
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq("id", params.id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("[community] comment delete failed:", error);
        return errorResponse("Could not delete the comment", 500);
    }
    if (!data) return errorResponse("Comment not found, or it isn't yours to delete", 404);

    return NextResponse.json({ success: true });
}
