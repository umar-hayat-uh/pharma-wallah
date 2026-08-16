"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, Play, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

type GameType = "mcq" | "flashcard" | "spotting";

interface CodeData {
    code: string;
    entry_type: string;
    games_included: string[];
    max_retries: number;
    team_name?: string | null;
    team_members?: string[];
}

interface GameInfo {
    type: GameType;
    label: string;
    icon: string;
    description: string;
    colorClass: string;
    available: boolean;
}

const GAMES: Record<GameType, GameInfo> = {
    mcq: {
        type: "mcq",
        label: "MCQ Battle",
        icon: "🧠",
        description: "Test your knowledge with multiple choice questions from pharmaceutical sciences.",
        colorClass: "border-blue-400 bg-blue-50",
        available: true,
    },
    flashcard: {
        type: "flashcard",
        label: "Flashcard Rush",
        icon: "⚡",
        description: "Type the answer fast — recall key concepts before the clock runs out.",
        colorClass: "border-amber-400 bg-amber-50",
        available: true,
    },
    spotting: {
        type: "spotting",
        label: "Spotting Challenge",
        icon: "🔬",
        description: "Identify histological slides, pathology samples, and powder microscopy specimens.",
        colorClass: "border-green-400 bg-green-50",
        available: false,
    },
};

function TournamentGamesInner() {
    const searchParams = useSearchParams();
    const code = (searchParams.get("code") || "").toUpperCase();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [codeData, setCodeData] = useState<CodeData | null>(null);

    const validateCode = useCallback(async () => {
        if (!code) {
            setError("No code provided.");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/tournament/validate-code?code=${encodeURIComponent(code)}`);
            const data = await res.json();
            if (data.valid) {
                setCodeData(data);
            } else {
                setError(data.message || "Invalid or used code.");
            }
        } catch {
            setError("Failed to verify code. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [code]);

    useEffect(() => {
        validateCode();
    }, [validateCode]);

    const includedGames: GameType[] =
        codeData?.games_included?.filter((g): g is GameType => g in GAMES) || [];

    const allowedAttempts = (codeData?.max_retries ?? 0) + 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-10 max-w-2xl">
                <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 mb-6">
                    <div className="bg-white rounded-2xl px-8 py-4">
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
                            PharmaWallah Science Fair
                        </h1>
                        <p className="text-lg text-gray-600 mt-1">Tournament 2026</p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl w-full space-y-6">
                <button
                    onClick={() => (window.location.href = "/tournament/play")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Play Page
                </button>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <p className="text-red-600 font-semibold mb-2">{error}</p>
                        <button
                            onClick={() => (window.location.href = "/tournament/play")}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                        >
                            Go Back
                        </button>
                    </div>
                )}

                {codeData && !loading && !error && (
                    <>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Entry Code</p>
                                <p className="text-2xl font-mono font-bold text-gray-900 tracking-widest">
                                    {codeData.code}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    {codeData.entry_type.replace("_", " ")}
                                </span>
                                {codeData.team_name && (
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                        {codeData.team_name}
                                    </span>
                                )}
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    {allowedAttempts} attempt{allowedAttempts > 1 ? "s" : ""} allowed
                                </span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-blue-600" /> Choose Your Game
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {includedGames.map((game) => {
                                const info = GAMES[game];
                                return (
                                    <div
                                        key={game}
                                        className={`bg-white border-2 ${info.colorClass} rounded-2xl shadow-sm p-6 flex flex-col justify-between transition-all ${info.available ? "hover:shadow-md hover:-translate-y-1" : "opacity-70"
                                            }`}
                                    >
                                        <div>
                                            <div className="text-4xl mb-3">{info.icon}</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{info.label}</h3>
                                            <p className="text-gray-600 text-sm">{info.description}</p>
                                        </div>
                                        {info.available ? (
                                            <button
                                                onClick={() => (window.location.href = `/tournament/play/${game}?code=${codeData.code}`)}
                                                className="mt-6 w-full py-2.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-center gap-2"
                                            >
                                                <Play className="w-4 h-4" /> Start Game
                                            </button>
                                        ) : (
                                            <div className="mt-6 w-full py-2.5 bg-gray-100 text-gray-400 font-bold rounded-xl text-center">
                                                Coming Soon
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {includedGames.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 py-10">
                                    No games available for this code. Please contact the staff.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function TournamentGamesPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            }
        >
            <TournamentGamesInner />
        </Suspense>
    );
}
