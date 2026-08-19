"use client";

import { Suspense, useEffect, useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Trophy, Play, ArrowLeft, Loader2, AlertCircle, Sparkles } from "lucide-react";

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
        colorClass: "border-blue-400/60 bg-blue-50/50 hover:bg-blue-50",
        available: true,
    },
    flashcard: {
        type: "flashcard",
        label: "Flashcard Rush",
        icon: "⚡",
        description: "Type the answer fast — recall key concepts before the clock runs out.",
        colorClass: "border-amber-400/60 bg-amber-50/50 hover:bg-amber-50",
        available: true,
    },
    spotting: {
        type: "spotting",
        label: "Spotting Challenge",
        icon: "🔬",
        description: "Identify histological slides, pathology samples, and powder microscopy specimens.",
        colorClass: "border-emerald-400/60 bg-emerald-50/50 hover:bg-emerald-50",
        available: false,
    },
};

interface GameCardProps {
    info: GameInfo;
    code: string;
    onStartGame: (gameType: GameType) => void;
    isPending: boolean;
}

function GameCard({ info, onStartGame, isPending }: GameCardProps) {
    return (
        <div
            className={`bg-white border-2 ${info.colorClass} rounded-2xl shadow-sm p-6 flex flex-col justify-between transition-all duration-200 ${info.available
                ? "hover:shadow-lg hover:-translate-y-1"
                : "opacity-60 cursor-not-allowed"
                }`}
        >
            <div>
                <div className="text-4xl mb-3 select-none" role="img" aria-label={info.label}>
                    {info.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{info.label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{info.description}</p>
            </div>

            {info.available ? (
                <button
                    onClick={() => onStartGame(info.type)}
                    disabled={isPending}
                    className="mt-6 w-full py-2.5 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-current" /> Start Game
                        </>
                    )}
                </button>
            ) : (
                <div className="mt-6 w-full py-2.5 bg-gray-100 text-gray-400 font-semibold rounded-xl text-center text-sm border border-gray-200">
                    Coming Soon
                </div>
            )}
        </div>
    );
}

function TournamentGamesInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const code = (searchParams.get("code") || "").trim().toUpperCase();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [codeData, setCodeData] = useState<CodeData | null>(null);

    const validateCode = useCallback(async () => {
        if (!code) {
            setError("No entry code provided.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/tournament/validate-code?code=${encodeURIComponent(code)}`, {
                cache: "no-store",
            });

            if (!res.ok) {
                throw new Error("Server responded with an issue.");
            }

            const data = await res.json();

            if (data.valid) {
                setCodeData(data);
            } else {
                setError(data.message || "Invalid or already redeemed tournament code.");
            }
        } catch {
            setError("Unable to verify entry code. Please check your network and try again.");
        } finally {
            setLoading(false);
        }
    }, [code]);

    useEffect(() => {
        validateCode();
    }, [validateCode]);

    const handleNavigation = (path: string) => {
        startTransition(() => {
            router.push(path);
        });
    };

    const handleStartGame = (gameType: GameType) => {
        if (!codeData?.code) return;
        handleNavigation(`/tournament/play/${gameType}?code=${encodeURIComponent(codeData.code)}`);
    };

    const includedGames: GameType[] =
        codeData?.games_included?.filter((g): g is GameType => g in GAMES) || [];

    const allowedAttempts = (codeData?.max_retries ?? 0) + 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col items-center p-4 pt-10 sm:p-6 lg:p-8">
            {/* Header Banner */}
            <header className="text-center mb-8 max-w-2xl w-full">
                <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400 shadow-md">
                    <div className="bg-white rounded-2xl px-8 py-5">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                                PharmaWallah Science Fair
                            </h1>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-gray-500">
                            Tournament Arena 2026
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl w-full space-y-6">
                {/* Navigation back */}
                <button
                    onClick={() => handleNavigation("/tournament/play")}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors group disabled:opacity-50"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Code Entry
                </button>

                {/* Loading Skeleton State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                        <p className="text-sm font-medium text-gray-500">Validating tournament ticket...</p>
                    </div>
                )}

                {/* Error Alert Box */}
                {error && !loading && (
                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center max-w-md mx-auto">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-600 font-semibold mb-6">{error}</p>
                        <button
                            onClick={() => handleNavigation("/tournament/play")}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                            Return to Entry Portal
                        </button>
                    </div>
                )}

                {/* Code Metadata & Game Options */}
                {codeData && !loading && !error && (
                    <>
                        {/* Ticket Information Bar */}
                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Verified Entry Code
                                </p>
                                <p className="text-2xl font-mono font-black text-gray-900 tracking-widest mt-0.5">
                                    {codeData.code}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 capitalize">
                                    {codeData.entry_type.replace(/_/g, " ")}
                                </span>
                                {codeData.team_name && (
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                        Team: {codeData.team_name}
                                    </span>
                                )}
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                    {allowedAttempts} {allowedAttempts === 1 ? "Attempt" : "Attempts"} Permitted
                                </span>
                            </div>
                        </section>

                        {/* Game Selection Grid */}
                        <section className="space-y-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-blue-600" /> Choose Game Mode
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {includedGames.map((gameType) => (
                                    <GameCard
                                        key={gameType}
                                        info={GAMES[gameType]}
                                        code={codeData.code}
                                        onStartGame={handleStartGame}
                                        isPending={isPending}
                                    />
                                ))}

                                {includedGames.length === 0 && (
                                    <div className="col-span-full bg-white border border-dashed border-gray-300 rounded-2xl text-center text-gray-500 py-12 px-4">
                                        No active tournament modes associated with this pass. Please contact the tournament desk.
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default function TournamentGamesPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            }
        >
            <TournamentGamesInner />
        </Suspense>
    );
}