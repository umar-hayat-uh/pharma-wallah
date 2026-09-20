/**
 * GET    /api/community/posts/:id — one post, full body
 * PATCH  /api/community/posts/:id — edit (author only)
 * DELETE /api/community/posts/:id — soft delete (author only)
 *
 * Model B (RLS-enforced). The `.eq("user_id", user.id)` on the write paths is
 * belt-and-braces alongside the RLS policy, matching how the old Q&A routes
 * were written — a reader of this file should not have to check the dashboard
 * to see that only an author can edit their post.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityWriteLimiter } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { MAX_BODY_LEN, MAX_TITLE_LEN, MIN_TITLE_LEN } from "@/lib/community/constants";
import {
    errorResponse,
    firstOf,
    isValidUUID,
    loadVotes,
    normalizeTags,
    shapeAuthor,
} from "@/lib/community/server";
import type { CommunityPost } from "@/lib/community/types";

const POST_SELECT = `
    id, kind, title, body, link_url, image_url, flair, tags,
    score, comment_count, view_count, is_pinned, is_locked, is_deleted,
    accepted_comment_id, created_at, edited_at, user_id, space_id,
    space:community_spaces!inner (id, slug, name, icon, accent, rules, description),
    author:community_members!inner (user_id, handle, display_name, avatar_url, post_karma, comment_karma)
`;

export async function GET(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Post not found", 404);

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("community_posts")
        .select(POST_SELECT)
        .eq("id", params.id)
        .maybeSingle();

    if (error) {
        console.error("[community] post read failed:", error);
        return errorResponse("Database error", 500);
    }
    if (!data) return errorResponse("Post not found", 404);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const votes = await loadVotes(supabase, user?.id ?? null, "post", [data.id]);

    // Fire-and-forget: a view counter must never delay or fail a read.
    supabase.rpc("increment_community_post_views", { p_post_id: params.id }).then(
        ({ error }) => {
            if (error) console.warn("[community] view increment failed:", error.message);
        },
        (err) => console.warn("[community] view increment error:", err)
    );

    let saved = false;
    if (user) {
        const { data: save } = await supabase
            .from("community_saves")
            .select("post_id")
            .eq("user_id", user.id)
            .eq("post_id", data.id)
            .maybeSingle();
        saved = !!save;
    }

    const space = firstOf<any>((data as any).space);
    const post: CommunityPost & { space_rules: string[]; space_description: string | null } = {
        id: data.id,
        kind: (data as any).kind,
        title: (data as any).is_deleted ? "[deleted]" : (data as any).title,
        body: (data as any).is_deleted ? "" : (data as any).body,
        link_url: (data as any).link_url,
        image_url: (data as any).image_url,
        flair: (data as any).flair,
        tags: (data as any).tags ?? [],
        score: (data as any).score ?? 0,
        comment_count: (data as any).comment_count ?? 0,
        view_count: (data as any).view_count ?? 0,
        is_pinned: !!(data as any).is_pinned,
        is_locked: !!(data as any).is_locked,
        is_deleted: !!(data as any).is_deleted,
        accepted_comment_id: (data as any).accepted_comment_id ?? null,
        created_at: (data as any).created_at,
        edited_at: (data as any).edited_at ?? null,
        author: (data as any).is_deleted
            ? null
            : shapeAuthor((data as any).author, (data as any).user_id),
        space: {
            id: space?.id ?? (data as any).space_id,
            slug: space?.slug ?? "general",
            name: space?.name ?? "General",
            icon: space?.icon ?? "MessageSquare",
            accent: space?.accent ?? "#1C7BD9",
        },
        space_rules: space?.rules ?? [],
        space_description: space?.description ?? null,
        user_vote: votes[data.id] ?? null,
        saved,
        is_author: !!user && (data as any).user_id === user.id,
    };

    return NextResponse.json({ post });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Post not found", 404);

    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const { success } = await checkLimit(communityWriteLimiter, user.id);
    if (!success) return errorResponse("Too many requests", 429);

    let body: { title?: string; body?: string; tags?: string[]; flair?: string };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const title = (body.title ?? "").trim();
    const text = (body.body ?? "").trim();

    if (title.length < MIN_TITLE_LEN) {
        return errorResponse(`Title must be at least ${MIN_TITLE_LEN} characters`, 400);
    }
    if (title.length > MAX_TITLE_LEN) {
        return errorResponse(`Title must be ${MAX_TITLE_LEN} characters or fewer`, 400);
    }
    if (text.length > MAX_BODY_LEN) {
        return errorResponse(`Body must be ${MAX_BODY_LEN} characters or fewer`, 400);
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from("community_posts")
        .update({
            title,
            body: text,
            tags: normalizeTags(body.tags),
            updated_at: now,
            edited_at: now,
        })
        .eq("id", params.id)
        .eq("user_id", user.id) // ownership — never trust the id alone
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("[community] post update failed:", error);
        return errorResponse("Could not save your changes", 500);
    }
    if (!data) return errorResponse("Post not found, or it isn't yours to edit", 404);

    return NextResponse.json({ post: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) return errorResponse("Post not found", 404);

    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    // Soft delete, so the discussion underneath keeps its shape — Reddit does
    // the same. The row stays; the API stops returning its title and body.
    const { data, error } = await supabase
        .from("community_posts")
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq("id", params.id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("[community] post delete failed:", error);
        return errorResponse("Could not delete the post", 500);
    }
    if (!data) return errorResponse("Post not found, or it isn't yours to delete", 404);

    return NextResponse.json({ success: true });
}
