/**
 * GET  /api/community/posts/:id/comments — the whole thread, nested
 * POST /api/community/posts/:id/comments — add a comment or a reply
 *
 * The tree comes from the `community_comment_tree` RPC: one round trip returns
 * a page of top-level comments *and* every descendant, which the server then
 * assembles. Fetching level by level would be N+1 on a deep thread.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityWriteLimiter } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import {
    COMMENT_ROOT_LIMIT,
    MAX_COMMENT_LEN,
    MAX_COMMENT_ROOT_LIMIT,
} from "@/lib/community/constants";
import {
    buildCommentTree,
    clampInt,
    ensureMember,
    errorResponse,
    isCommentSort,
    isValidUUID,
    loadVotes,
} from "@/lib/community/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Post not found", 404);

    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const sortParam = searchParams.get("sort");
    const sort = isCommentSort(sortParam) ? sortParam : "top";
    const limit = clampInt(searchParams.get("limit"), COMMENT_ROOT_LIMIT, 1, MAX_COMMENT_ROOT_LIMIT);
    const page = clampInt(searchParams.get("page"), 1, 1, 200);

    const { data, error } = await supabase.rpc("community_comment_tree", {
        p_post_id: params.id,
        p_sort: sort,
        p_root_limit: limit,
        p_root_offset: (page - 1) * limit,
    });

    if (error) {
        console.error("[community] comment tree failed:", error);
        return errorResponse("Database error", 500);
    }

    const flat: any[] = Array.isArray(data) ? data : [];

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // The accepted answer is a property of the post, not the comment, so it has
    // to be read separately before the tree can mark it.
    const { data: post } = await supabase
        .from("community_posts")
        .select("accepted_comment_id, is_locked, comment_count")
        .eq("id", params.id)
        .maybeSingle();

    const votes = await loadVotes(
        supabase,
        user?.id ?? null,
        "comment",
        flat.map((c) => c.id)
    );

    const comments = buildCommentTree(
        flat,
        user?.id ?? null,
        votes,
        post?.accepted_comment_id ?? null,
        sort
    );

    return NextResponse.json({
        comments,
        total: post?.comment_count ?? flat.length,
        is_locked: !!post?.is_locked,
        next_page: comments.length === limit ? page + 1 : null,
    });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Post not found", 404);

    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const { success } = await checkLimit(communityWriteLimiter, user.id);
    if (!success) return errorResponse("You're commenting too quickly. Give it a minute.", 429);

    let body: { body?: string; parent_id?: string | null };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const text = (body.body ?? "").trim();
    if (!text) return errorResponse("Write something first", 400);
    if (text.length > MAX_COMMENT_LEN) {
        return errorResponse(`Comment must be ${MAX_COMMENT_LEN} characters or fewer`, 400);
    }

    // A locked post accepts no new comments. Checked here rather than in RLS,
    // because the policy has no clean way to reach across to the parent post.
    const { data: post, error: postError } = await supabase
        .from("community_posts")
        .select("id, is_locked, is_deleted")
        .eq("id", params.id)
        .maybeSingle();

    if (postError) {
        console.error("[community] comment post lookup failed:", postError);
        return errorResponse("Database error", 500);
    }
    if (!post || post.is_deleted) return errorResponse("Post not found", 404);
    if (post.is_locked) return errorResponse("This post is locked", 403);

    let parentId: string | null = null;
    if (body.parent_id) {
        if (!isValidUUID(body.parent_id)) return errorResponse("Invalid parent comment", 400);
        // Confirm the parent belongs to this post before writing. The DB trigger
        // enforces it too, but a 400 here beats a raw Postgres exception.
        const { data: parent } = await supabase
            .from("community_comments")
            .select("id, post_id")
            .eq("id", body.parent_id)
            .maybeSingle();
        if (!parent || parent.post_id !== params.id) {
            return errorResponse("That comment isn't on this post", 400);
        }
        parentId = parent.id;
    }

    const member = await ensureMember(supabase, user);
    if (!member.ok) return errorResponse(member.error, 500);

    const { data, error } = await supabase
        .from("community_comments")
        .insert({ post_id: params.id, parent_id: parentId, user_id: user.id, body: text })
        .select("id, post_id, parent_id, body, depth, score, reply_count, created_at")
        .single();

    if (error) {
        console.error("[community] comment insert failed:", error);
        return errorResponse("Could not post your comment", 500);
    }

    // Returned in the same shape the tree uses, so the client can splice it
    // straight into the thread without refetching.
    const { data: profile } = await supabase
        .from("community_members")
        .select("handle, display_name, avatar_url, post_karma, comment_karma")
        .eq("user_id", user.id)
        .maybeSingle();

    return NextResponse.json(
        {
            comment: {
                ...data,
                is_deleted: false,
                edited_at: null,
                is_author: true,
                is_accepted: false,
                user_vote: null,
                replies: [],
                author: {
                    user_id: user.id,
                    handle: profile?.handle ?? null,
                    display_name: profile?.display_name ?? null,
                    avatar_url: profile?.avatar_url ?? null,
                    karma: (profile?.post_karma ?? 0) + (profile?.comment_karma ?? 0),
                },
            },
        },
        { status: 201 }
    );
}
