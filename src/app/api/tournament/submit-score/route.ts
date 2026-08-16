import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { submitScoreLimiter, getClientIp, checkRateLimit, redis } from "@/lib/tournament-redis";
import { invalidateLeaderboardCache } from "@/lib/leaderboard-data";
import { NextResponse } from "next/server";

interface AttemptSession {
    code: string;
    game: string;
    attemptNumber: number;
    questionIds: string[];
    correctCount: number;
    answeredIds: string[];
    startedAt: number;
}

function sessionKey(code: string, game: string, attemptNumber: number) {
    return `tournament:attempt:${code}:${game}:${attemptNumber}`;
}

export async function POST(request: Request) {
    const ip = getClientIp(request);
    const rl = await checkRateLimit(submitScoreLimiter, `${ip}`);
    if (rl.blocked) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { code, gameType, attemptNumber, playerName } = body as {
        code?: string;
        gameType?: string;
        attemptNumber?: number;
        playerName?: string;
    };

    if (!code || !gameType || !attemptNumber) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // The Redis session (built up via /check-answer during play) is the
    // source of truth for the score — never trust a score value from the
    // client directly, since that would let anyone POST an arbitrary score.
    const key = sessionKey(code, gameType, attemptNumber);
    const session = await redis.get<AttemptSession>(key);

    if (!session || session.code !== code || session.game !== gameType) {
        return NextResponse.json(
            { error: "No active game session found for this attempt. Please play the game to record a score." },
            { status: 400 }
        );
    }

    const score = session.correctCount;
    const timeTaken = Math.round((Date.now() - session.startedAt) / 1000);

    const supabase = await createServiceSupabaseClient();

    const { data: entry, error: entryError } = await supabase
        .from("entry_codes")
        .select("*")
        .eq("code", code)
        .single();

    if (entryError || !entry) {
        return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    const { error: insertError } = await supabase.from("tournament_scores").insert({
        entry_code: code,
        player_name: playerName || entry.team_name || "Anonymous",
        game_type: gameType,
        score,
        attempt_number: attemptNumber,
        time_taken: timeTaken,
    });

    if (insertError) {
        console.error("submit-score insert failed:", insertError);
        return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
    }

    // Mark code as fully used if this was the last allowed attempt.
    const allowedAttempts = (entry.max_retries || 0) + 1;
    if (attemptNumber >= allowedAttempts) {
        await supabase.from("entry_codes").update({ is_used: true }).eq("code", code);
        try {
            await redis.del(`tournament:code:${code}`); // clear cached "valid" state
        } catch { /* non-fatal */ }
    }

    // Clean up the attempt session — it's been persisted to Postgres now.
    try {
        await redis.del(key);
    } catch { /* non-fatal */ }

    // Refresh the leaderboard cache right away so the player sees their
    // own result reflected quickly, without every viewer hitting Postgres.
    await invalidateLeaderboardCache();

    return NextResponse.json({ success: true, score, timeTaken, attemptNumber });
}
