"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
    Loader2, Clock, Zap, ArrowLeft, CheckCircle, XCircle, Trophy, ArrowUp,
} from "lucide-react";

type Question = {
    question: string;
    options: string[];
    answer: number;
};

/* ── Inner component that uses useSearchParams & useParams ─ */
function GamePlayInner() {
    const params = useParams();
    const searchParams = useSearchParams();
    const game = params?.game as string;
    const code = searchParams.get("code") || "";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
                const sanitized = data.questions.map((q: any) => ({
                    question: q.question,
                    options: q.options.map((opt: any) => (typeof opt === 'string' ? opt : opt.text)),
                    answer: typeof q.answer === 'number' ? q.answer : q.answer.id,
                }));
                setQuestions(sanitized);
            } else {
                setError(data.error || "Failed to load questions.");
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    }, [code, game]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    useEffect(() => {
        if (loading || gameOver || questions.length === 0 || showFeedback) return;
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleAnswer(-1);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [currentIndex, loading, gameOver, questions.length, showFeedback]);

    const handleAnswer = (optionIdx: number) => {
        if (showFeedback || gameOver || questions.length === 0) return;
        if (timerRef.current) clearInterval(timerRef.current);

        const q = questions[currentIndex];
        const correct = optionIdx === q.answer;
        setSelectedOption(optionIdx === -1 ? null : optionIdx);
        setIsCorrect(correct);
        setShowFeedback(true);

        if (correct) {
            setScore(s => s + 1);
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }

        setTimeout(() => {
            setShowFeedback(false);
            setIsCorrect(null);
            setSelectedOption(null);
            if (currentIndex + 1 < questions.length) {
                setCurrentIndex(prev => prev + 1);
                setTimeLeft(10);
            } else {
                setGameOver(true);
                submitScore();
            }
        }, 1500);
    };

    const submitScore = async () => {
        try {
            await fetch("/api/tournament/submit-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, gameType: game, score }),
            });
        } catch { }
    };

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
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm max-w-md w-full">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center mb-6">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Game Over!</h2>
                    <p className="text-gray-600 mb-6">
                        Your final score: <span className="text-2xl font-bold text-blue-600">{score} / {questions.length}</span>
                    </p>
                    <button
                        onClick={() => (window.location.href = `/tournament/games?code=${code}`)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        Back to Games
                    </button>
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
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1 text-lg font-semibold">
                        <Clock className={`w-5 h-5 ${timeLeft <= 3 ? "text-red-500" : "text-blue-600"}`} />
                        <span className={`${timeLeft <= 3 ? "text-red-500 font-bold" : "text-gray-700"}`}>{timeLeft}s</span>
                    </div>
                    <div className="flex items-center gap-1 text-lg font-semibold text-gray-700">
                        <Trophy className="w-5 h-5 text-yellow-500" /> {score}
                    </div>
                    {streak >= 2 && (
                        <div className="flex items-center gap-1 text-lg font-semibold text-amber-500">
                            <Zap className="w-5 h-5" /> {streak}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full max-w-2xl bg-gray-200 rounded-full h-2 mb-8">
                <div
                    className="bg-gradient-to-r from-blue-600 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                />
            </div>

            <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">{q.question}</h3>
                <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, idx) => {
                        let buttonClasses = "text-left p-4 bg-gray-50 border border-gray-200 rounded-xl transition font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300";
                        if (showFeedback && selectedOption !== null) {
                            if (idx === q.answer) {
                                buttonClasses = "text-left p-4 bg-green-50 border border-green-400 rounded-xl font-medium text-green-700";
                            } else if (idx === selectedOption) {
                                buttonClasses = "text-left p-4 bg-red-50 border border-red-400 rounded-xl font-medium text-red-700";
                            }
                        }
                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={showFeedback}
                                className={buttonClasses}
                            >
                                <span className="flex items-center justify-between">
                                    {opt}
                                    {showFeedback && idx === q.answer && <CheckCircle className="w-5 h-5 text-green-500 ml-2" />}
                                    {showFeedback && idx === selectedOption && idx !== q.answer && <XCircle className="w-5 h-5 text-red-500 ml-2" />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showFeedback && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
                    {isCorrect ? (
                        <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-bold animate-bounce">
                            ✅ Correct! +1
                        </div>
                    ) : (
                        <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-bold">
                            ❌ Wrong!
                        </div>
                    )}
                </div>
            )}

            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg hover:shadow-xl transition flex items-center justify-center"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}

/* ── Exported page component with Suspense ───────────────── */
export default function GamePlayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        }>
            <GamePlayInner />
        </Suspense>
    );
}