/**
 * Community — the shapes the API returns.
 *
 * These are the contract between `src/app/api/community/*` and the client
 * components. Every route returns rows already flattened into these shapes, so
 * no component ever has to know about PostgREST's nested embed format.
 */

import type { PostKind } from "./constants";

export type CommunityAuthor = {
    user_id: string;
    handle: string | null;
    display_name: string | null;
    avatar_url: string | null;
    karma: number;
};

export type CommunitySpace = {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    icon: string;
    accent: string;
    flairs: string[];
    rules: string[];
    member_count: number;
    post_count: number;
    is_default: boolean;
    /** Whether the signed-in member has joined. Always false when signed out. */
    joined?: boolean;
};

export type CommunityPost = {
    id: string;
    kind: PostKind;
    title: string;
    body: string;
    link_url: string | null;
    image_url: string | null;
    flair: string | null;
    tags: string[];
    score: number;
    comment_count: number;
    view_count: number;
    is_pinned: boolean;
    is_locked: boolean;
    is_deleted: boolean;
    accepted_comment_id: string | null;
    created_at: string;
    edited_at: string | null;
    author: CommunityAuthor | null;
    space: Pick<CommunitySpace, "id" | "slug" | "name" | "icon" | "accent">;
    /** Viewer-specific. Null / false when signed out. */
    user_vote: 1 | -1 | null;
    saved: boolean;
    is_author: boolean;
};

export type CommunityComment = {
    id: string;
    post_id: string;
    parent_id: string | null;
    body: string;
    depth: number;
    score: number;
    reply_count: number;
    is_deleted: boolean;
    created_at: string;
    edited_at: string | null;
    author: CommunityAuthor | null;
    user_vote: 1 | -1 | null;
    is_author: boolean;
    is_accepted: boolean;
    /** Built by the API from parent_id; never stored. */
    replies: CommunityComment[];
};

export type CommunityMe = {
    user_id: string;
    handle: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    post_karma: number;
    comment_karma: number;
    karma: number;
    post_count: number;
    comment_count: number;
    joined_space_ids: string[];
};

export type FeedResponse = {
    posts: CommunityPost[];
    /** Cursor for the next page; null when the feed is exhausted. */
    next_page: number | null;
    total: number | null;
};
