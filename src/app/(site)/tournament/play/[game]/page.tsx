"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
    Loader2,
    Clock,
    Zap,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Trophy,
    Flame,
    Send,
    HelpCircle,
    AlertTriangle,
    RotateCcw,
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
            setError("Missing game session code or type.");
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
            setError("Network connection issue. Please verify your connection.");
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
                setError(data.error || "Failed to submit final score.");
            }
        } catch {
            setError("Network error encountered during score submission.");
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
    }, [currentIndex, loading, gameOver, questions.length, showFeedback, game]);

    // Loading Screen
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 pt-10">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <Zap className="w-6 h-6 text-blue-600 absolute animate-pulse" />
                </div>
                <p className="mt-4 text-slate-500 font-medium text-sm tracking-wide">Loading arena...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-xl shadow-slate-200/50 max-w-md w-full">
                    <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Session Error</h3>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">{error}</p>
                    <button
                        onClick={() => (window.location.href = `/tournament/games?code=${code}`)}
                        className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Return to Games
                    </button>
                </div>
            </div>
        );
    }

    // Game Over Screen
    if (gameOver) {
        const displayScore = finalScore?.score ?? score;
        const pct = questions.length > 0 ? Math.round((displayScore / questions.length) * 100) : 0;
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-slate-50 pointer-events-none" />

                <div className="relative z-10 bg-white/90 border border-slate-200/80 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl shadow-slate-200/60 max-w-md w-full">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 border border-amber-200 p-0.5 shadow-md shadow-amber-500/10 mb-6">
                        <div className="w-full h-full bg-amber-50 rounded-[14px] flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-amber-500 animate-bounce" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                        {pct >= 80 ? "Outstanding!" : pct >= 50 ? "Nice Work!" : "Game Over!"}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mb-6">Tournament Challenge Complete</p>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 mb-6">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                            Final Score
                        </span>
                        <div className="text-5xl font-black text-slate-900 tracking-tight">
                            {displayScore}
                            <span className="text-2xl text-slate-400 font-bold"> / {questions.length}</span>
                        </div>
                        <div className="mt-2 text-xs font-semibold text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200/60">
                            {pct}% Accuracy Rate
                        </div>
                    </div>

                    {bestStreak >= 2 && (
                        <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200/60 py-2.5 px-4 rounded-xl text-amber-700 font-bold text-xs uppercase tracking-wide mb-6">
                            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" /> Peak Streak: {bestStreak} Correct
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => (window.location.href = `/tournament/games?code=${code}`)}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
                        >
                            Back to Arena
                        </button>
                        <button
                            onClick={() => (window.location.href = "/leaderboard")}
                            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all"
                        >
                            View Leaderboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const q = questions[currentIndex];
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;
    const timerPercentage = (timeLeft / TIME_PER_QUESTION) * 100;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-100/30 via-slate-50 to-slate-50 pointer-events-none" />

            <div className="w-full max-w-2xl z-10 space-y-6">
                {/* Top Header Controls */}
                <div className="flex justify-between items-center bg-white/80 border border-slate-200/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm">
                    <button
                        onClick={() => (window.location.href = `/tournament/games?code=${code}`)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium text-xs sm:text-sm tracking-wide transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Quit
                    </button>

                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Countdown Display */}
                        <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-bold">
                            <Clock className={`w-4 h-4 ${timeLeft <= 5 ? "text-red-500 animate-bounce" : "text-blue-600"}`} />
                            <span className={timeLeft <= 5 ? "text-red-600" : "text-slate-700"}>{timeLeft}s</span>
                        </div>

                        {/* Score Tracker */}
                        <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-amber-600">
                            <Trophy className="w-4 h-4" />
                            <span>{score}</span>
                        </div>

                        {/* Streak Counter */}
                        {streak >= 2 && (
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-amber-700 text-xs font-bold animate-pulse">
                                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>{streak}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress & Time Gauges */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 px-1 tracking-wider uppercase">
                        <span>
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>

                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden p-0.5">
                        <div
                            className="bg-gradient-to-r from-blue-600 to-teal-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Question Timer Ring/Line */}
                    <div className="w-full bg-slate-200/50 rounded-full h-1 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 linear ${timeLeft <= 5 ? "bg-red-500" : "bg-blue-500"
                                }`}
                            style={{ width: `${timerPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Main Interactive Workspace Card */}
                <div className="bg-white/90 border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all">
                    {/* Multiple Choice Mode */}
                    {game === "mcq" && "options" in q && (
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed mb-6">
                                {q.question}
                            </h3>

                            <div className="grid grid-cols-1 gap-3">
                                {q.options.map((opt, idx) => {
                                    let stateStyle =
                                        "bg-slate-50/80 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:border-blue-400 hover:text-slate-900";

                                    if (showFeedback) {
                                        if (typeof correctAnswerDisplay === "number" && idx === correctAnswerDisplay) {
                                            stateStyle =
                                                "bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold shadow-sm";
                                        } else if (idx === selectedOption) {
                                            stateStyle = "bg-red-50 border-red-300 text-red-800 font-semibold";
                                        } else {
                                            stateStyle = "bg-slate-50/40 border-slate-200/40 text-slate-400 opacity-50";
                                        }
                                    }

                                    return (
                                        <button
                                            key={opt + idx}
                                            onClick={() => handleAnswer(idx)}
                                            disabled={showFeedback}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between font-medium text-sm sm:text-base ${stateStyle}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-mono shadow-xs">
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                {opt}
                                            </span>

                                            {showFeedback && typeof correctAnswerDisplay === "number" && idx === correctAnswerDisplay && (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                            )}
                                            {showFeedback && idx === selectedOption && idx !== correctAnswerDisplay && (
                                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Flashcard / Identification Mode */}
                    {game === "flashcard" && "term" in q && (
                        <div className="space-y-6">
                            <div className="text-center py-4">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-50 to-teal-50 border border-blue-100 p-0.5 shadow-sm mb-4">
                                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                                        <HelpCircle className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{q.term}</h3>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                                    Identify or Define
                                </p>
                            </div>

                            {!showFeedback ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (typedAnswer.trim()) handleAnswer(typedAnswer);
                                    }}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={typedAnswer}
                                        onChange={(e) => setTypedAnswer(e.target.value)}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm"
                                        placeholder="Type your response here..."
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                        Correct Definition
                                    </span>
                                    <p className="text-base font-bold text-emerald-700">{String(correctAnswerDisplay)}</p>

                                    {!isCorrect && typedAnswer && (
                                        <p className="text-xs text-red-500/80 pt-1 border-t border-slate-200">
                                            Your answer: <span className="line-through">{typedAnswer}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Answer Feedback Indicator Overlay */}
            {showFeedback && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    {isCorrect ? (
                        <div className="bg-emerald-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-emerald-600/20 backdrop-blur-md flex items-center gap-2 font-black text-sm uppercase tracking-wide">
                            <CheckCircle2 className="w-5 h-5 stroke-[3]" /> Correct (+1)
                        </div>
                    ) : (
                        <div className="bg-red-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-red-600/20 backdrop-blur-md flex items-center gap-2 font-black text-sm uppercase tracking-wide">
                            <XCircle className="w-5 h-5 stroke-[3]" /> Incorrect
                        </div>
                    )}
                </div>
            )}

            {/* Score Submission Modal */}
            {submitting && (
                <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-3 shadow-xl">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="font-semibold text-slate-700 text-sm">Recording tournament score...</span>
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
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            }
        >
            <GamePlayInner />
        </Suspense>
    );
}