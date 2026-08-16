import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { gameQuestionsLimiter, getClientIp, checkRateLimit, redis } from "@/lib/tournament-redis";
import { MCQ_BANK } from "@/lib/tournament-data/mcq-bank";
import { FLASHCARD_BANK, normalizeAnswer } from "@/lib/tournament-data/flashcard-bank";
import { NextResponse } from "next/server";

type GameType = "mcq" | "flashcard";

interface AttemptSession {
    code: string;
    game: GameType;
    attemptNumber: number;
    questionIds: string[];
    correctCount: number;
    answeredIds: string[];
    startedAt: number;
}

function sessionKey(code: string, game: string, attemptNumber: number) {
    return `tournament:attempt:${code}:${game}:${attemptNumber}`;
}

/**
 * Checks a single answer against the server-side bank and records it in the
 * attempt's Redis session. This lets the UI show instant right/wrong
 * feedback (good for the gamified feel) without ever sending the full
 * answer key to the browser, and without trusting a client-reported score.
 */
export async function POST(request: Request) {
    const ip = getClientIp(request);
    const rl = await checkRateLimit(gameQuestionsLimiter, ip);
    if (rl.blocked) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { code, game, attemptNumber, questionId, selectedOption, typedAnswer } = body as {
        code?: string;
        game?: GameType;
        attemptNumber?: number;
        questionId?: string;
        selectedOption?: number;
        typedAnswer?: string;
    };

    if (!code || !game || !attemptNumber || !questionId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const key = sessionKey(code, game, attemptNumber);
    let session = await redis.get<AttemptSession>(key);

    if (!session) {
        // First answer of this attempt — verify the code/attempt is legitimate
        // against Postgres once, then seed the session.
        const supabase = await createServiceSupabaseClient();
        const { data: entry } = await supabase
            .from("entry_codes")
            .select("code, games_included")
            .eq("code", code)
            .single();

        if (!entry || !entry.games_included?.includes(game)) {
            return NextResponse.json({ error: "Invalid code or game" }, { status: 401 });
        }

        session = {
            code,
            game,
            attemptNumber,
            questionIds: [],
            correctCount: 0,
            answeredIds: [],
            startedAt: Date.now(),
        };
    }

    if (session.answeredIds.includes(questionId)) {
        return NextResponse.json({ error: "Question already answered" }, { status: 409 });
    }

    let correct = false;
    let correctAnswerDisplay: string | number | null = null;

    if (game === "mcq") {
        const q = MCQ_BANK.find((x) => x.id === questionId);
        if (!q) return NextResponse.json({ error: "Unknown question" }, { status: 400 });
        correct = selectedOption === q.answer;
        correctAnswerDisplay = q.answer;
    } else if (game === "flashcard") {
        const q = FLASHCARD_BANK.find((x) => x.id === questionId);
        if (!q) return NextResponse.json({ error: "Unknown question" }, { status: 400 });
        correct = normalizeAnswer(typedAnswer || "") === normalizeAnswer(q.answer);
        correctAnswerDisplay = q.answer;
    } else {
        return NextResponse.json({ error: "Unsupported game type" }, { status: 400 });
    }

    session.answeredIds.push(questionId);
    if (correct) session.correctCount += 1;

    await redis.set(key, session, { ex: 60 * 20 }); // 20 min TTL, well beyond any game session

    return NextResponse.json({
        correct,
        correctAnswer: correctAnswerDisplay,
        runningScore: session.correctCount,
        answeredCount: session.answeredIds.length,
    });
}
