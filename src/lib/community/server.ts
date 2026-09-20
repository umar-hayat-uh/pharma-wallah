/**
 * Community — server-side helpers shared by every `/api/community/*` route.
 *
 * AUTHORIZATION MODEL: these routes are **Model B** (MEMORY.md §3) — they use
 * only `createServerSupabaseClient()` (anon key + the member's cookies), so the
 * RLS policies shipped in `supabase/migrations/20260920_community.sql` are what
 * protect the data. Never switch one of these routes to the service-role client
 * to make a permissions error go away: that removes the only protection it has.
 *
 * The one deliberate exception is `ensureMember()`, explained on the function.
 *
 * Pure helpers (validation, normalisation, tree building) live in `./pure.ts`
 * so they can be unit-tested without Next; they are re-exported from here so a
 * route handler still has a single import.
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export * from "./pure";

export function errorResponse(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Derives a stable, readable handle from whatever the auth record offers.
 * Not unique on its own — `ensureMember` appends a discriminator on collision.
 */
function baseHandle(user: User): string {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const candidate =
        (typeof meta.user_name === "string" && meta.user_name) ||
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        (user.email ? user.email.split("@")[0] : "") ||
        "member";

    const slug = candidate
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24);

    return slug || "member";
}

function displayNameOf(user: User): string {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    for (const key of ["full_name", "name", "display_name", "user_name"]) {
        const value = meta[key];
        if (typeof value === "string" && value.trim()) return value.trim().slice(0, 80);
    }
    return user.email ? user.email.split("@")[0] : "Member";
}

function avatarOf(user: User): string | null {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    for (const key of ["avatar_url", "picture"]) {
        const value = meta[key];
        if (typeof value === "string" && value.startsWith("http")) return value;
    }
    return null;
}

/**
 * Makes sure the signed-in user has a `community_members` row before any write.
 *
 * Posts, comments, votes and saves are all foreign-keyed to `community_members`
 * rather than to `profiles`, because `profiles`' structure is not in this repo
 * and the community must not break if it changes. That FK means a member's very
 * first action would otherwise fail, so every write route calls this first.
 *
 * It writes only the caller's own row (`user_id = user.id`), which is exactly
 * what the `community_members_insert` RLS policy permits — so this stays on the
 * anon client like everything else here.
 */
export async function ensureMember(
    supabase: SupabaseClient,
    user: User
): Promise<{ ok: true } | { ok: false; error: string }> {
    const { data: existing, error: readError } = await supabase
        .from("community_members")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (readError) {
        console.error("[community] member lookup failed:", readError);
        return { ok: false, error: "Database error" };
    }
    if (existing) return { ok: true };

    const handle = baseHandle(user);
    // A handle collision is expected (two "ahmed"s), not exceptional: retry once
    // with a short suffix drawn from the user id, which is already unique.
    const candidates = [handle, `${handle}-${user.id.slice(0, 4)}`];

    for (const candidate of candidates) {
        const { error } = await supabase.from("community_members").insert({
            user_id: user.id,
            handle: candidate,
            display_name: displayNameOf(user),
            avatar_url: avatarOf(user),
        });
        if (!error) return { ok: true };
        // 23505 = unique_violation. On the handle, try the next candidate; on the
        // primary key, another request created the row first — that's a success.
        if (error.code === "23505") {
            if (error.message.includes("pkey")) return { ok: true };
            continue;
        }
        console.error("[community] member insert failed:", error);
        return { ok: false, error: "Could not create your community profile" };
    }

    // Both candidates collided on the handle — fall back to no handle rather
    // than blocking the member's first post over a cosmetic field.
    const { error } = await supabase
        .from("community_members")
        .insert({ user_id: user.id, display_name: displayNameOf(user), avatar_url: avatarOf(user) });
    if (error && error.code !== "23505") {
        console.error("[community] member insert fallback failed:", error);
        return { ok: false, error: "Could not create your community profile" };
    }
    return { ok: true };
}

/**
 * Loads the viewer's votes for a set of targets in one query.
 * Returns an empty map when signed out — callers then render neutral arrows.
 */
export async function loadVotes(
    supabase: SupabaseClient,
    userId: string | null,
    targetType: "post" | "comment",
    ids: string[]
): Promise<Record<string, 1 | -1>> {
    if (!userId || ids.length === 0) return {};
    const { data, error } = await supabase
        .from("community_votes")
        .select("target_id, value")
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .in("target_id", ids);

    if (error) {
        // A vote highlight is cosmetic — degrade to "no vote" rather than
        // failing the whole feed (CLAUDE.md §6 rule 8).
        console.warn("[community] vote lookup failed:", error.message);
        return {};
    }
    return Object.fromEntries((data ?? []).map((v: any) => [v.target_id, v.value])) as Record<
        string,
        1 | -1
    >;
}
