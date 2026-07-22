import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const MAX_TITLE_LEN = 300;
const MAX_CONTENT_LEN = 20000;

// ─── Helpers ────────────────────────────────────────────────────────────────

function resolveName(profile: { display_name: string | null; email?: string | null } | null) {
    if (!profile) return null;
    if (profile.display_name && profile.display_name.trim()) return profile.display_name.trim();
    if (profile.email) return profile.email.split("@")[0];
    return null;
}

function transformQuestion(raw: any, userVotes: Record<string, "up" | "down">) {
    return {
        ...raw,
        profiles: raw.profiles
            ? { full_name: resolveName(raw.profiles), avatar_url: raw.profiles.avatar_url }
            : null,
        user_vote: userVotes[raw.id] ?? null,
        answers: (raw.answers || [])
            .map((a: any) => ({
                ...a,
                profiles: a.profiles
                    ? { full_name: resolveName(a.profiles), avatar_url: a.profiles.avatar_url }
                    : null,
                votes: a.score,
                user_vote: userVotes[a.id] ?? null,
            }))
            // Highest-voted answers first, ties broken by newest
            .sort((a: any, b: any) => b.votes - a.votes || (a.created_at < b.created_at ? 1 : -1)),
    };
}

function errorResponse(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

function isValidUUID(id: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// ─── GET ───────────────────────────────────────────────────────────────────

export async function GET(req: Request, { params }: { params: { id: string } }) {
    if (!isValidUUID(params.id)) {
        return errorResponse("Question not found", 404);
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("questions")
        .select(`
            id, title, content, tags, views, score, created_at, updated_at, user_id,
            profiles!left (display_name, avatar_url, email),
            answers (
                id, user_id, content, created_at, score,
                profiles!left (display_name, avatar_url, email)
            )
        `)
        .eq("id", params.id)
        .maybeSingle();

    if (error) {
        console.error("GET /questions/:id DB error:", error);
        return errorResponse("Database error", 500);
    }
    if (!data) {
        return errorResponse("Question not found", 404);
    }

    // Increment views asynchronously – non-blocking, fire-and-forget
    supabase
        .rpc("increment_question_views", { question_id: params.id })
        .then(
            ({ error }) => { if (error) console.warn("View increment failed:", error); },
            (err) => console.warn("View increment error:", err)
        );

    const { data: { user } } = await supabase.auth.getUser();
    let userVotes: Record<string, "up" | "down"> = {};
    if (user) {
        const targetIds = [params.id, ...((data as any).answers || []).map((a: any) => a.id)];
        const { data: votes } = await supabase
            .from("votes")
            .select("target_id, vote_type")
            .eq("user_id", user.id)
            .in("target_id", targetIds);
        userVotes = Object.fromEntries((votes || []).map((v: any) => [v.target_id, v.vote_type]));
    }

    return NextResponse.json({ question: transformQuestion(data, userVotes) });
}

// ─── PUT ───────────────────────────────────────────────────────────────────

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    const updatePayload = {
        title,
        content,
        tags: Array.isArray(body.tags) ? body.tags.slice(0, 5) : [],
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("questions")
        .update(updatePayload)
        .eq("id", params.id)
        .eq("user_id", user.id)
        .select()
        .maybeSingle();

    if (error) {
        console.error("PUT /questions/:id DB error:", error);
        return errorResponse(error.message, 500);
    }
    if (!data) {
        return errorResponse("Question not found or you do not have permission", 404);
    }

    return NextResponse.json({ question: data });
}

// ─── DELETE ────────────────────────────────────────────────────────────────

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return errorResponse("Unauthorized", 401);
    }

    const { error, count } = await supabase
        .from("questions")
        .delete({ count: "exact" })
        .eq("id", params.id)
        .eq("user_id", user.id);

    if (error) {
        console.error("DELETE /questions/:id DB error:", error);
        return errorResponse(error.message, 500);
    }
    if (count === 0) {
        return errorResponse("Question not found or already deleted", 404);
    }

    return NextResponse.json({ success: true });
}