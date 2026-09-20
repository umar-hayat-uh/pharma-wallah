/**
 * Community — the pure layer.
 *
 * Deliberately free of `next/*`, Supabase and React: everything here is a plain
 * function of its inputs, which is what makes it testable with
 * `node --test scripts/community.test.mts`. Anything needing a request, a
 * response or a database client belongs in `./server.ts`, which re-exports
 * this module so route handlers keep importing from one place.
 */

import {
    ALLOWED_LINK_PROTOCOLS,
    MAX_TAGS,
    MAX_TAG_LEN,
    type CommentSort,
    type FeedSort,
    type PostKind,
    type TopRange,
} from "./constants";
import type { CommunityAuthor, CommunityComment } from "./types";

/** The UUID shape Supabase issues. Rejects junk before it reaches Postgres. */
export function isValidUUID(id: string | null | undefined): id is string {
    return (
        typeof id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    );
}

/** Lowercase, hyphenate, dedupe and cap — matches the old Q&A normaliser. */
export function normalizeTags(tags: unknown): string[] {
    if (!Array.isArray(tags)) return [];
    const cleaned = tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-").slice(0, MAX_TAG_LEN))
        .filter(Boolean);
    return Array.from(new Set(cleaned)).slice(0, MAX_TAGS);
}

/**
 * Accepts a link-post URL only if it parses AND uses http(s).
 * Blocks `javascript:` and `data:` before they can ever reach an href.
 */
export function normalizeLink(raw: unknown): string | null {
    if (typeof raw !== "string" || !raw.trim()) return null;
    const value = raw.trim();
    try {
        const url = new URL(value);
        if (!ALLOWED_LINK_PROTOCOLS.includes(url.protocol)) return null;
        return url.toString().slice(0, 2000);
    } catch {
        return null;
    }
}

export function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
    const parsed = parseInt(raw ?? "", 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
}

/** Cut-off timestamp for `top`'s range filter; null means "all time". */
export function rangeCutoff(range: TopRange): string | null {
    const hours: Record<Exclude<TopRange, "all">, number> = {
        day: 24,
        week: 24 * 7,
        month: 24 * 30,
        year: 24 * 365,
    };
    if (range === "all") return null;
    return new Date(Date.now() - hours[range] * 3600_000).toISOString();
}

export function isFeedSort(value: string | null): value is FeedSort {
    return value === "hot" || value === "new" || value === "top" || value === "rising";
}

export function isCommentSort(value: string | null): value is CommentSort {
    return value === "top" || value === "new" || value === "old";
}

export function isPostKind(value: unknown): value is PostKind {
    return value === "discussion" || value === "question" || value === "link" || value === "image";
}

/** PostgREST returns an embed as an object or a one-element array; normalise. */
export function firstOf<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
}

export function shapeAuthor(raw: any, userId: string | null): CommunityAuthor | null {
    const member = firstOf<any>(raw);
    if (!member) return null;
    return {
        user_id: userId ?? member.user_id ?? "",
        handle: member.handle ?? null,
        display_name: member.display_name ?? null,
        avatar_url: member.avatar_url ?? null,
        karma: (member.post_karma ?? 0) + (member.comment_karma ?? 0),
    };
}

/**
 * Turns the flat list from `community_comment_tree()` into a real tree.
 *
 * The RPC returns roots *and* every descendant in one array, so this runs in a
 * single pass: index by id, then attach each node to its parent. A node whose
 * parent is not in the list (possible when a root page cuts a thread) is kept
 * as a root rather than dropped — losing a member's reply would be worse than
 * showing it slightly out of place.
 */
export function buildCommentTree(
    flat: any[],
    viewerId: string | null,
    votes: Record<string, 1 | -1>,
    acceptedId: string | null,
    sort: CommentSort = "top"
): CommunityComment[] {
    const byId = new Map<string, CommunityComment>();

    for (const row of flat) {
        byId.set(row.id, {
            id: row.id,
            post_id: row.post_id,
            parent_id: row.parent_id,
            body: row.is_deleted ? "" : row.body,
            depth: row.depth ?? 0,
            score: row.score ?? 0,
            reply_count: row.reply_count ?? 0,
            is_deleted: !!row.is_deleted,
            created_at: row.created_at,
            edited_at: row.edited_at ?? null,
            author: row.is_deleted
                ? null
                : {
                      user_id: row.user_id,
                      handle: row.author?.handle ?? null,
                      display_name: row.author?.display_name ?? null,
                      avatar_url: row.author?.avatar_url ?? null,
                      karma: row.author?.karma ?? 0,
                  },
            user_vote: votes[row.id] ?? null,
            is_author: !!viewerId && row.user_id === viewerId,
            is_accepted: !!acceptedId && row.id === acceptedId,
            replies: [],
        });
    }

    const roots: CommunityComment[] = [];
    // Array.from, not a for..of over .values(): this tsconfig targets ES5-era
    // iteration and would need --downlevelIteration for a Map iterator.
    for (const node of Array.from(byId.values())) {
        const parent = node.parent_id ? byId.get(node.parent_id) : null;
        if (parent) parent.replies.push(node);
        else roots.push(node);
    }

    // The accepted answer always leads whatever the sort — it is the answer the
    // asker endorsed, and burying it under "new" would defeat the point. Below
    // it the member's chosen order applies, at every level, so a highly-rated
    // reply surfaces inside its own thread too.
    //
    // This must honour `sort`: the RPC uses it only to choose WHICH top-level
    // comments to load, so re-sorting here unconditionally by score would make
    // the New/Old tabs look broken.
    const compare = (a: CommunityComment, b: CommunityComment) => {
        const accepted = Number(b.is_accepted) - Number(a.is_accepted);
        if (accepted !== 0) return accepted;
        if (sort === "new") return a.created_at < b.created_at ? 1 : -1;
        if (sort === "old") return a.created_at < b.created_at ? -1 : 1;
        return b.score - a.score || (a.created_at < b.created_at ? -1 : 1);
    };

    const sortNodes = (nodes: CommunityComment[]) => {
        nodes.sort(compare);
        nodes.forEach((n) => sortNodes(n.replies));
    };
    sortNodes(roots);

    return roots;
}

