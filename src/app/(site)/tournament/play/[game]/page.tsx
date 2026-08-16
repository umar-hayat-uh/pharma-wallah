"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
    Loader2, Clock, Zap, ArrowLeft, CheckCircle, XCircle, Trophy, Flame,
} from "lucide-react";

type GameType = "mcq" | "flashcard";

interface MCQClientQuestion {
    id: string;
    question: string;
    options: string[];
}
interface FlashcardClientQuestion {
    id: string;
    term: string;
}

const TIME_PER_QUESTION = 15;

function GamePlayInner() {
    const params = useParams();
    const searchParams = useSearchParams();
    const game = params?.game as GameType;
    const code = (searchParams.get("code") || "").toUpperCase();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [questions, setQuestions] = useState<(MCQClientQuestion | FlashcardClientQuestion)[]>([]);
    const [attemptNumber, setAttemptNumber] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [correctAnswerDisplay, setCorrectAnswerDisplay] = useState<string | number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [finalScore, setFinalScore] = useState<{ score: number; timeTaken: number } | null>(null);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const [submitting, setSubmitting] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [typedAnswer, setTypedAnswer] = useState("");

    const fetchQuestions = useCallback(async () => {
        if (!code || !game) {
            setError("Missing code or game type.");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/tournament/game-questions?code=${code}&game=${game}`);
            const data = await res.json();
            if (res.ok) {
                setQuestions(data.questions);
                setAttemptNumber(data.attemptNumber);
            } else {
                setError(data.error || "Failed to load questions.");
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, [code, game]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const finishGame = useCallback(async () => {
        if (attemptNumber == null) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/tournament/submit-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, gameType: game, attemptNumber }),
            });
            const data = await res.json();
            if (res.ok) {
                setFinalScore({ score: data.score, timeTaken: data.timeTaken });
            } else {
                setError(data.error || "Failed to submit your score.");
            }
        } catch {
            setError("Network error while submitting your score.");
        } finally {
            setSubmitting(false);
            setGameOver(true);
        }
    }, [code, game, attemptNumber]);

    const handleAnswer = useCallback(
        async (optionIdxOrAnswer: number | string) => {
            if (showFeedback || gameOver || questions.length === 0 || attemptNumber == null) return;
            if (timerRef.current) clearInterval(timerRef.current);

            const q = questions[currentIndex];
            const payload: Record<string, unknown> = {
                code,
                game,
                attemptNumber,
                questionId: q.id,
            };
            if (game === "mcq") {
                payload.selectedOption = optionIdxOrAnswer;
                setSelectedOption(optionIdxOrAnswer as number);
            } else {
                payload.typedAnswer = optionIdxOrAnswer;
            }

            try {
                const res = await fetch("/api/tournament/check-answer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (res.ok) {
                    setIsCorrect(data.correct);
                    setCorrectAnswerDisplay(data.correctAnswer);
                    setScore(data.runningScore);
                    if (data.correct) {
                        setStreak((s) => {
                            const next = s + 1;
                            setBestStreak((b) => Math.max(b, next));
                            return next;
                        });
                    } else {
                        setStreak(0);
                    }
                } else {
                    // Question already answered / session issue — just move on gracefully
                    setIsCorrect(false);
                }
            } catch {
                setIsCorrect(false);
            }

            setShowFeedback(true);

            setTimeout(() => {
                setShowFeedback(false);
                setIsCorrect(null);
                setSelectedOption(null);
                setCorrectAnswerDisplay(null);
                setTypedAnswer("");
                if (currentIndex + 1 < questions.length) {
                    setCurrentIndex((prev) => prev + 1);
                    setTimeLeft(TIME_PER_QUESTION);
                } else {
                    finishGame();
                }
            }, 1400);
        },
        [showFeedback, gameOver, questions, currentIndex, code, game, attemptNumber, finishGame]
    );

    useEffect(() => {
        if (loading || gameOver || questions.length === 0 || showFeedback) return;
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleAnswer(game === "flashcard" ? "" : -1);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, loading, gameOver, questions.length, showFeedback, game]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm max-w-md w-full">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => (window.location.href = `/tournament/games?code=${code}`)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        Back to Games
                    </button>
                </div>
            </div>
        );
    }

    if (gameOver) {
        const displayScore = finalScore?.score ?? score;
        const pct = questions.length > 0 ? Math.round((displayScore / questions.length) * 100) : 0;
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm max-w-md w-full">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                        {pct >= 80 ? "Outstanding!" : pct >= 50 ? "Nice work!" : "Game Over!"}
                    </h2>
                    <p className="text-gray-600 mb-4">Your final score</p>
                    <p className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent mb-1">
                        {displayScore}
                        <span className="text-2xl text-gray-300"> / {questions.length}</span>
                    </p>
                    {bestStreak >= 3 && (
                        <p className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm mb-4">
                            <Flame className="w-4 h-4" /> Best streak: {bestStreak} in a row
                        </p>
                    )}
                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            onClick={() => (window.location.href = `/tournament/games?code=${code}`)}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                        >
                            Back to Games
                        </button>
                        <button
                            onClick={() => (window.location.href = "/leaderboard")}
                            className="w-full py-3 border-2 border-blue-600 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition"
                        >
                            View Leaderboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const q = questions[currentIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-2xl flex justify-between items-center mb-6">
                <button
                    onClick={() => (window.location.href = `/tournament/games?code=${code}`)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Quit
                </button>
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="flex items-center gap-1 text-lg font-semibold tabular-nums">
                        <Clock className={`w-5 h-5 ${timeLeft <= 5 ? "text-red-500" : "text-blue-600"}`} />
                        <span className={timeLeft <= 5 ? "text-red-500 font-bold" : "text-gray-700"}>{timeLeft}s</span>
                    </div>
                    <div className="flex items-center gap-1 text-lg font-semibold text-gray-700 tabular-nums">
                        <Trophy className="w-5 h-5 text-yellow-500" /> {score}
                    </div>
                    {streak >= 2 && (
                        <div className="flex items-center gap-1 text-lg font-bold text-amber-500 animate-pulse">
                            <Flame className="w-5 h-5" /> {streak}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full max-w-2xl bg-gray-200 rounded-full h-2 mb-8 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-blue-600 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentIndex / questions.length) * 100}%` }}
                />
            </div>

            <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
                {game === "mcq" && "options" in q && (
                    <>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">{q.question}</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {q.options.map((opt, idx) => {
                                let btnClass =
                                    "text-left p-4 bg-gray-50 border border-gray-200 rounded-xl transition font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300";
                                if (showFeedback) {
                                    if (typeof correctAnswerDisplay === "number" && idx === correctAnswerDisplay) {
                                        btnClass = "text-left p-4 bg-green-50 border border-green-400 rounded-xl font-medium text-green-700";
                                    } else if (idx === selectedOption) {
                                        btnClass = "text-left p-4 bg-red-50 border border-red-400 rounded-xl font-medium text-red-700";
                                    }
                                }
                                return (
                                    <button
                                        key={opt + idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={showFeedback}
                                        className={btnClass}
                                    >
                                        <span className="flex items-center justify-between">
                                            {opt}
                                            {showFeedback && typeof correctAnswerDisplay === "number" && idx === correctAnswerDisplay && (
                                                <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                                            )}
                                            {showFeedback && idx === selectedOption && idx !== correctAnswerDisplay && (
                                                <XCircle className="w-5 h-5 text-red-500 ml-2" />
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {game === "flashcard" && "term" in q && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center text-white text-3xl font-bold mb-3">
                                ?
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{q.term}</h3>
                            <p className="text-sm text-gray-500 mt-1">Type the answer below</p>
                        </div>
                        {!showFeedback ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAnswer(typedAnswer);
                                }}
                                className="flex gap-3"
                            >
                                <input
                                    type="text"
                                    value={typedAnswer}
                                    onChange={(e) => setTypedAnswer(e.target.value)}
                                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
                                    placeholder="Your answer..."
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl"
                                >
                                    Submit
                                </button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">
                                    Correct answer: {correctAnswerDisplay}
                                </p>
                                {isCorrect ? (
                                    <p className="text-green-600 font-medium mt-2">You got it right!</p>
                                ) : (
                                    <p className="text-red-600 font-medium mt-2">
                                        Your answer: {typedAnswer || "(empty)"}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {showFeedback && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                    {isCorrect ? (
                        <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-bold animate-bounce">
                            Correct! +1
                        </div>
                    ) : (
                        <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-bold">
                            Not quite
                        </div>
                    )}
                </div>
            )}

            {submitting && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-xl">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="font-medium text-gray-700">Saving your score...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function GamePlayPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            }
        >
            <GamePlayInner />
        </Suspense>
    );
}
