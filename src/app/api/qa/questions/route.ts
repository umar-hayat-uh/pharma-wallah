import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const MAX_LIMIT = 50;
const MAX_TITLE_LEN = 300;
const MAX_CONTENT_LEN = 20000;
const MAX_TAGS = 5;

function errorResponse(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

function resolveName(profile: { display_name: string | null; email?: string | null } | null) {
    if (!profile) return null;
    if (profile.display_name && profile.display_name.trim()) return profile.display_name.trim();
    if (profile.email) return profile.email.split("@")[0];
    return null;
}

/** Lowercase, trim, dedupe, cap tag count/length so filters stay consistent with the UI's fixed tag list. */
function normalizeTags(tags: unknown): string[] {
    if (!Array.isArray(tags)) return [];
    const cleaned = tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40))
        .filter(Boolean);
    return Array.from(new Set(cleaned)).slice(0, MAX_TAGS);
}

export async function GET(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const pageRaw = parseInt(searchParams.get("page") || "1", 10);
    const limitRaw = parseInt(searchParams.get("limit") || "10", 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), MAX_LIMIT) : 10;
    const tag = searchParams.get("tag")?.trim().toLowerCase() || null;
    const offset = (page - 1) * limit;

    let query = supabase
        .from("questions")
        .select(
            `
      id, user_id, title, content, tags, views, score, created_at, updated_at,
      profiles!left (display_name, avatar_url, email),
      answers_count:answers(count)
    `,
            { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (tag) {
        query = query.contains("tags", [tag]);
    }

    const { data, error, count } = await query;
    if (error) {
        console.error("GET /questions DB error:", error);
        return errorResponse("Database error", 500);
    }

    // Fetch the current user's own votes for just this page of questions so
    // the UI can highlight the active button and toggle correctly on re-click.
    const { data: { user } } = await supabase.auth.getUser();
    let userVotes: Record<string, "up" | "down"> = {};
    if (user && data && data.length > 0) {
        const ids = data.map((q: any) => q.id);
        const { data: votes } = await supabase
            .from("votes")
            .select("target_id, vote_type")
            .eq("user_id", user.id)
            .eq("target_type", "question")
            .in("target_id", ids);
        userVotes = Object.fromEntries((votes || []).map((v: any) => [v.target_id, v.vote_type]));
    }

    const questions =
        data?.map((q: any) => ({
            ...q,
            profiles: q.profiles
                ? { full_name: resolveName(q.profiles), avatar_url: q.profiles.avatar_url }
                : null,
            answers_count: q.answers_count?.[0]?.count ?? 0,
            // votes_count kept for any old frontend still reading it; new UI should read `score`
            votes_count: q.score,
            user_vote: userVotes[q.id] ?? null,
        })) || [];

    return NextResponse.json({ questions, total: count || 0, page, limit });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return errorResponse("Unauthorized", 401);
    }

    let body: { title?: string; content?: string; tags?: string[] };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const title = body.title?.trim() || "";
    const content = body.content?.trim() || "";

    if (!title) {
        return errorResponse("Title is required", 400);
    }
    if (title.length > MAX_TITLE_LEN) {
        return errorResponse(`Title must be ${MAX_TITLE_LEN} characters or fewer`, 400);
    }
    if (content.length > MAX_CONTENT_LEN) {
        return errorResponse(`Content must be ${MAX_CONTENT_LEN} characters or fewer`, 400);
    }

    const { data, error } = await supabase
        .from("questions")
        .insert({
            user_id: user.id,
            title,
            content,
            tags: normalizeTags(body.tags),
        })
        .select()
        .single();

    if (error) {
        console.error("POST /questions DB error:", error);
        return errorResponse(error.message, 500);
    }
    return NextResponse.json({ question: data }, { status: 201 });
}