/**
 * POST /api/community/posts/:id/accept — mark a comment as the accepted answer
 * (body: { comment_id } — or { comment_id: null } to clear it)
 *
 * Only the asker may accept, and only on a Question post. Authorization is
 * resolved server-side from the post's own `user_id`: the comment id arriving
 * from the client is never treated as permission to write.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityWriteLimiter } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { errorResponse, isValidUUID } from "@/lib/community/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Post not found", 404);

    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const { success } = await checkLimit(communityWriteLimiter, user.id);
    if (!success) return errorResponse("Too many requests", 429);

    let body: { comment_id?: string | null };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const { data: post, error: postError } = await supabase
        .from("community_posts")
        .select("id, user_id, kind")
        .eq("id", params.id)
        .maybeSingle();

    if (postError) {
        console.error("[community] accept post lookup failed:", postError);
        return errorResponse("Database error", 500);
    }
    if (!post) return errorResponse("Post not found", 404);
    if (post.user_id !== user.id) {
        return errorResponse("Only the person who asked can accept an answer", 403);
    }
    if (post.kind !== "question") {
        return errorResponse("Only a question can have an accepted answer", 400);
    }

    // Clearing the accepted answer is a legitimate action, not an error.
    let commentId: string | null = null;
    if (body.comment_id) {
        if (!isValidUUID(body.comment_id)) return errorResponse("Invalid comment", 400);
        const { data: comment } = await supabase
            .from("community_comments")
            .select("id, post_id, is_deleted")
            .eq("id", body.comment_id)
            .maybeSingle();
        if (!comment || comment.post_id !== params.id || comment.is_deleted) {
            return errorResponse("That comment isn't on this post", 400);
        }
        commentId = comment.id;
    }

    const { error } = await supabase
        .from("community_posts")
        .update({ accepted_comment_id: commentId, updated_at: new Date().toISOString() })
        .eq("id", params.id)
        .eq("user_id", user.id);

    if (error) {
        console.error("[community] accept failed:", error);
        return errorResponse("Could not mark the answer", 500);
    }

    return NextResponse.json({ accepted_comment_id: commentId });
}
