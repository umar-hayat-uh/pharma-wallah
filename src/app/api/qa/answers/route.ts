import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const MAX_CONTENT_LEN = 20000;

function errorResponse(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return errorResponse("Unauthorized", 401);
    }

    let body: { question_id?: string; content?: string };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const question_id = body.question_id;
    const content = body.content?.trim() || "";

    if (!question_id || !content) {
        return errorResponse("Missing fields", 400);
    }
    if (content.length > MAX_CONTENT_LEN) {
        return errorResponse(`Answer must be ${MAX_CONTENT_LEN} characters or fewer`, 400);
    }

    // Verify the question exists before writing — turns a confusing FK
    // error into a clean 404.
    const { data: question, error: qError } = await supabase
        .from("questions")
        .select("id")
        .eq("id", question_id)
        .maybeSingle();

    if (qError) {
        console.error("POST /answers question lookup error:", qError);
        return errorResponse("Database error", 500);
    }
    if (!question) {
        return errorResponse("Question not found", 404);
    }

    const { data, error } = await supabase
        .from("answers")
        .insert({ question_id, user_id: user.id, content })
        .select()
        .single();

    if (error) {
        console.error("POST /answers DB error:", error);
        return errorResponse(error.message, 500);
    }
    return NextResponse.json({ answer: data }, { status: 201 });
}