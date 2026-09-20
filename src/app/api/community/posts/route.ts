/**
 * GET  /api/community/posts — the feed (hot / new / top / rising, filterable)
 * POST /api/community/posts — create a post
 *
 * Model B (RLS-enforced): anon client + the member's cookies only. See
 * `src/lib/community/server.ts` for why, and never swap in the service role.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkLimit, communityReadLimiter, communityWriteLimiter } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/tournament-redis";
import { NextResponse } from "next/server";
import {
    FEED_LIMIT,
    MAX_BODY_LEN,
    MAX_FEED_LIMIT,
    MAX_TITLE_LEN,
    MIN_TITLE_LEN,
    RISING_WINDOW_HOURS,
    type FeedSort,
} from "@/lib/community/constants";
import {
    clampInt,
    ensureMember,
    errorResponse,
    firstOf,
    isFeedSort,
    isPostKind,
    isValidUUID,
    loadVotes,
    normalizeLink,
    normalizeTags,
    rangeCutoff,
    shapeAuthor,
} from "@/lib/community/server";
import type { CommunityPost } from "@/lib/community/types";

// The columns every feed row needs, plus the two embeds. Declared once so the
// feed and the single-post route cannot drift apart.
const POST_SELECT = `
    id, kind, title, body, link_url, image_url, flair, tags,
    score, comment_count, view_count, is_pinned, is_locked, is_deleted,
    accepted_comment_id, created_at, edited_at, user_id, space_id,
    space:community_spaces!inner (id, slug, name, icon, accent),
    author:community_members!inner (user_id, handle, display_name, avatar_url, post_karma, comment_karma)
`;

/** Body is trimmed for the feed card — the full text only loads on the post page. */
const FEED_EXCERPT_LEN = 500;

export async function GET(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Signed-in readers are trusted (they have an account); anonymous traffic is
    // limited by IP so the public feed can't be walked wholesale by a scraper.
    if (!user) {
        const { success } = await checkLimit(communityReadLimiter, getClientIp(req));
        if (!success) return errorResponse("Too many requests", 429);
    }

    const sortParam = searchParams.get("sort");
    const sort: FeedSort = isFeedSort(sortParam) ? sortParam : "hot";
    const page = clampInt(searchParams.get("page"), 1, 1, 500);
    const limit = clampInt(searchParams.get("limit"), FEED_LIMIT, 1, MAX_FEED_LIMIT);
    const offset = (page - 1) * limit;

    const spaceSlug = searchParams.get("space")?.trim().toLowerCase() || null;
    const tag = searchParams.get("tag")?.trim().toLowerCase() || null;
    const kindParam = searchParams.get("kind");
    const authorId = searchParams.get("author");
    const search = searchParams.get("q")?.trim().slice(0, 120) || null;
    const savedOnly = searchParams.get("saved") === "1";
    const unansweredOnly = searchParams.get("unanswered") === "1";
    const range = searchParams.get("range") as any;

    let query = supabase
        .from("community_posts")
        .select(POST_SELECT, { count: "exact" })
        .eq("is_deleted", false);

    if (spaceSlug) query = query.eq("community_spaces.slug", spaceSlug);
    if (tag) query = query.contains("tags", [tag]);
    if (isPostKind(kindParam)) query = query.eq("kind", kindParam);
    if (isValidUUID(authorId)) query = query.eq("user_id", authorId);

    // A question with no accepted answer and nothing written under it yet.
    if (unansweredOnly) query = query.eq("kind", "question").is("accepted_comment_id", null).eq("comment_count", 0);

    if (search) {
        // `or` needs the commas/parens escaped out of the user's text, or a
        // search for "a,b" would be read as two separate filters.
        const safe = search.replace(/[,()*]/g, " ").trim();
        if (safe) query = query.or(`title.ilike.%${safe}%,body.ilike.%${safe}%`);
    }

    // "Saved" is a private view: resolve the member's saved ids first, then
    // constrain the feed to them. RLS already hides other members' saves, so
    // this can never leak someone else's list.
    if (savedOnly) {
        if (!user) return errorResponse("Unauthorized", 401);
        const { data: saves, error: savesError } = await supabase
            .from("community_saves")
            .select("post_id")
            .eq("user_id", user.id);
        if (savesError) {
            console.error("[community] saves lookup failed:", savesError);
            return errorResponse("Database error", 500);
        }
        const ids = (saves ?? []).map((s: any) => s.post_id);
        if (ids.length === 0) {
            return NextResponse.json({ posts: [], next_page: null, total: 0 });
        }
        query = query.in("id", ids);
    }

    switch (sort) {
        case "new":
            query = query.order("created_at", { ascending: false });
            break;
        case "top":
            query = query
                .order("score", { ascending: false })
                .order("created_at", { ascending: false });
            if (range) {
                const cutoff = rangeCutoff(
                    ["day", "week", "month", "year", "all"].includes(range) ? range : "all"
                );
                if (cutoff) query = query.gte("created_at", cutoff);
            }
            break;
        case "rising":
            // Recent posts ordered by score: what is picking up speed *now*.
            query = query
                .gte("created_at", new Date(Date.now() - RISING_WINDOW_HOURS * 3600_000).toISOString())
                .order("score", { ascending: false })
                .order("comment_count", { ascending: false });
            break;
        case "hot":
        default:
            // Pinned posts lead their space, then Reddit's decayed rank.
            query = query.order("is_pinned", { ascending: false }).order("hot_rank", { ascending: false });
            break;
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
        console.error("[community] feed query failed:", error);
        return errorResponse("Database error", 500);
    }

    const rows = data ?? [];
    const ids = rows.map((r: any) => r.id);

    // The viewer's votes and saves are two small lookups rather than joins, so
    // a failure in either degrades a badge instead of the whole feed.
    const [votes, savedIds] = await Promise.all([
        loadVotes(supabase, user?.id ?? null, "post", ids),
        (async () => {
            if (!user || ids.length === 0) return new Set<string>();
            const { data: saves } = await supabase
                .from("community_saves")
                .select("post_id")
                .eq("user_id", user.id)
                .in("post_id", ids);
            return new Set((saves ?? []).map((s: any) => s.post_id));
        })(),
    ]);

    const posts: CommunityPost[] = rows.map((row: any) => {
        const space = firstOf<any>(row.space);
        return {
            id: row.id,
            kind: row.kind,
            title: row.title,
            body: (row.body ?? "").slice(0, FEED_EXCERPT_LEN),
            link_url: row.link_url,
            image_url: row.image_url,
            flair: row.flair,
            tags: row.tags ?? [],
            score: row.score ?? 0,
            comment_count: row.comment_count ?? 0,
            view_count: row.view_count ?? 0,
            is_pinned: !!row.is_pinned,
            is_locked: !!row.is_locked,
            is_deleted: false,
            accepted_comment_id: row.accepted_comment_id ?? null,
            created_at: row.created_at,
            edited_at: row.edited_at ?? null,
            author: shapeAuthor(row.author, row.user_id),
            space: {
                id: space?.id ?? row.space_id,
                slug: space?.slug ?? "general",
                name: space?.name ?? "General",
                icon: space?.icon ?? "MessageSquare",
                accent: space?.accent ?? "#1C7BD9",
            },
            user_vote: votes[row.id] ?? null,
            saved: savedIds.has(row.id),
            is_author: !!user && row.user_id === user.id,
        };
    });

    const total = count ?? 0;
    return NextResponse.json({
        posts,
        next_page: offset + posts.length < total ? page + 1 : null,
        total,
    });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const { success } = await checkLimit(communityWriteLimiter, user.id);
    if (!success) return errorResponse("You're posting too quickly. Give it a minute.", 429);

    let body: {
        space_id?: string;
        kind?: string;
        title?: string;
        body?: string;
        link_url?: string;
        image_url?: string;
        flair?: string;
        tags?: string[];
    };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const title = (body.title ?? "").trim();
    const text = (body.body ?? "").trim();
    const kind = isPostKind(body.kind) ? body.kind : "discussion";

    if (title.length < MIN_TITLE_LEN) {
        return errorResponse(`Title must be at least ${MIN_TITLE_LEN} characters`, 400);
    }
    if (title.length > MAX_TITLE_LEN) {
        return errorResponse(`Title must be ${MAX_TITLE_LEN} characters or fewer`, 400);
    }
    if (text.length > MAX_BODY_LEN) {
        return errorResponse(`Body must be ${MAX_BODY_LEN} characters or fewer`, 400);
    }
    if (!isValidUUID(body.space_id)) {
        return errorResponse("Choose a space for your post", 400);
    }

    const link = normalizeLink(body.link_url);
    if (kind === "link" && !link) {
        return errorResponse("A link post needs a valid http(s) URL", 400);
    }
    const image = normalizeLink(body.image_url);
    if (kind === "image" && !image) {
        return errorResponse("An image post needs a valid image URL", 400);
    }

    // The space must exist, and its flair list is the only set a post may use —
    // otherwise a crafted request could write an arbitrary label onto a card.
    const { data: space, error: spaceError } = await supabase
        .from("community_spaces")
        .select("id, flairs")
        .eq("id", body.space_id)
        .maybeSingle();

    if (spaceError) {
        console.error("[community] space lookup failed:", spaceError);
        return errorResponse("Database error", 500);
    }
    if (!space) return errorResponse("That space does not exist", 404);

    const flair =
        typeof body.flair === "string" && (space.flairs ?? []).includes(body.flair)
            ? body.flair
            : null;

    const member = await ensureMember(supabase, user);
    if (!member.ok) return errorResponse(member.error, 500);

    const { data, error } = await supabase
        .from("community_posts")
        .insert({
            space_id: space.id,
            user_id: user.id,
            kind,
            title,
            body: text,
            link_url: kind === "link" ? link : null,
            image_url: kind === "image" ? image : null,
            flair,
            tags: normalizeTags(body.tags),
        })
        .select("id")
        .single();

    if (error) {
        console.error("[community] post insert failed:", error);
        return errorResponse("Could not publish your post", 500);
    }

    return NextResponse.json({ post: { id: data.id } }, { status: 201 });
}
