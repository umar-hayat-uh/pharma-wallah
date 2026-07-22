import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

function errorResponse(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return errorResponse("Unauthorized", 401);
    }

    let body: { target_id?: string; target_type?: string; vote_type?: string };
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body", 400);
    }

    const { target_id, target_type, vote_type } = body;

    if (
        !target_id ||
        !["question", "answer"].includes(target_type ?? "") ||
        !["up", "down"].includes(vote_type ?? "")
    ) {
        return errorResponse("Invalid payload", 400);
    }

    const isQuestion = target_type === "question";

    // Confirm the target actually exists before writing a vote row against it.
    // Prevents orphaned votes on typo'd/deleted ids and gives a clean 404
    // instead of a confusing FK error.
    const { data: targetExists, error: targetError } = await supabase
        .from(isQuestion ? "questions" : "answers")
        .select("id")
        .eq("id", target_id)
        .maybeSingle();

    if (targetError) {
        return errorResponse("Database error", 500);
    }
    if (!targetExists) {
        return errorResponse(`${target_type} not found`, 404);
    }

    // NOTE: target_id/target_type are required (NOT NULL) columns on the
    // votes table, alongside the question_id/answer_id pair used for
    // PostgREST embedded joins. Both must be populated on every write.
    const voteData = {
        user_id: user.id,
        target_id,
        target_type,
        question_id: isQuestion ? target_id : null,
        answer_id: !isQuestion ? target_id : null,
        vote_type,
    };

    const { data, error } = await supabase
        .from("votes")
        .upsert(voteData, { onConflict: "user_id,target_id,target_type" })
        .select()
        .single();

    if (error) {
        console.error("Error saving vote:", error);
        return errorResponse(error.message, 500);
    }

    return NextResponse.json({ vote: data });
}

export async function DELETE(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const target_id = searchParams.get("target_id");
    const target_type = searchParams.get("target_type");

    if (!target_id || !["question", "answer"].includes(target_type ?? "")) {
        return errorResponse("Missing or invalid params", 400);
    }

    const { error, count } = await supabase
        .from("votes")
        .delete({ count: "exact" })
        .eq("user_id", user.id)
        .eq("target_id", target_id)
        .eq("target_type", target_type as string);

    if (error) {
        console.error("Error deleting vote:", error);
        return errorResponse(error.message, 500);
    }
    if (count === 0) {
        return errorResponse("Vote not found", 404);
    }

    return NextResponse.json({ success: true });
}