import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { gameQuestionsLimiter, getClientIp, checkRateLimit } from "@/lib/tournament-redis";
import { MCQ_BANK } from "@/lib/tournament-data/mcq-bank";
import { FLASHCARD_BANK } from "@/lib/tournament-data/flashcard-bank";
import { NextResponse } from "next/server";

type GameType = "mcq" | "flashcard" | "spotting";

function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/** Strip the answer key before sending MCQ/flashcard questions to the client. */
function toPublicMCQ(q: (typeof MCQ_BANK)[number]) {
    return { id: q.id, question: q.question, options: q.options };
}
function toPublicFlashcard(q: (typeof FLASHCARD_BANK)[number]) {
    return { id: q.id, term: q.term };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();
    const game = searchParams.get("game") as GameType | null;

    if (!code || !game) {
        return NextResponse.json({ error: "Missing code or game type" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const rl = await checkRateLimit(gameQuestionsLimiter, `${ip}:${code}`);
    if (rl.blocked) {
        return NextResponse.json(
            { error: "Too many requests. Please wait a moment." },
            { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
    }

    const supabase = await createServiceSupabaseClient();

    // Atomically claim the next attempt number. This single RPC call replaces
    // the old "count scores, compare to max_retries" pattern that had a race
    // condition under concurrent requests — see migration.sql for details.
    const { data: attemptNumber, error: claimError } = await supabase.rpc(
        "claim_tournament_attempt",
        { p_code: code, p_game_type: game }
    );

    if (claimError) {
        const msg = claimError.message || "";
        if (msg.includes("INVALID_CODE")) {
            return NextResponse.json({ error: "Invalid entry code" }, { status: 401 });
        }
        if (msg.includes("CODE_USED") || msg.includes("NO_ATTEMPTS_LEFT")) {
            return NextResponse.json({ error: "No attempts left for this code" }, { status: 403 });
        }
        console.error("claim_tournament_attempt error:", claimError);
        return NextResponse.json({ error: "Failed to verify attempts" }, { status: 500 });
    }

    // Verify the code actually includes this game (claim succeeding just means
    // attempts are available, not that this specific game is unlocked for it).
    const { data: entry } = await supabase
        .from("entry_codes")
        .select("games_included")
        .eq("code", code)
        .single();

    if (!entry || !entry.games_included?.includes(game)) {
        return NextResponse.json({ error: "This game is not included in your code" }, { status: 403 });
    }

    let questions: any[] = [];

    if (game === "mcq") {
        questions = shuffle(MCQ_BANK).slice(0, 10).map(toPublicMCQ);
    } else if (game === "flashcard") {
        questions = shuffle(FLASHCARD_BANK).slice(0, 8).map(toPublicFlashcard);
    } else if (game === "spotting") {
        return NextResponse.json({ error: "Spotting is not yet available" }, { status: 501 });
    } else {
        return NextResponse.json({ error: "Unknown game type" }, { status: 400 });
    }

    return NextResponse.json({ questions, code, game, attemptNumber });
}
