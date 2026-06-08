"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Medal, Loader2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

interface LeaderboardEntry {
    id: number;
    code: string;
    name: string;
    gameType: string;
    score: number;
    attempt: number;
    playedAt: string;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterGame, setFilterGame] = useState<string>("all");
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchLeaderboard = useCallback(async (game?: string) => {
        try {
            setLoading(true);
            const url = `/api/tournament/leaderboard${game && game !== "all" ? `?game=${game}` : ""}`;
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                setEntries(data);
                setLastUpdate(new Date());
            } else {
                setError(data.error || "Failed to load leaderboard.");
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard(filterGame);
    }, [filterGame, fetchLeaderboard]);

    // Auto‑refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLeaderboard(filterGame);
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, [filterGame, fetchLeaderboard]);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
        if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="w-5 h-5 text-center text-gray-500 font-bold">{index + 1}</span>;
    };

    const getGameColor = (game: string) => {
        switch (game) {
            case "mcq": return "text-blue-700 bg-blue-50";
            case "flashcard": return "text-amber-700 bg-amber-50";
            case "spotting": return "text-green-700 bg-green-50";
            default: return "text-gray-700 bg-gray-50";
        }
    };

    return (
        <div className="min-h-screen  flex flex-col items-center pt-10 p-4 sm:p-6 lg:p-8">
            {/* Header */}
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

            <div className="max-w-4xl w-full space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => (window.location.href = "/tournament/play")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Play Page
                </button>

                {/* Title & Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-blue-600" /> Live Leaderboard
                        </h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <RefreshCw className="w-3 h-3" /> Auto‑refreshes every 60s
                        </p>
                    </div>
                    <select
                        value={filterGame}
                        onChange={(e) => setFilterGame(e.target.value)}
                        className="p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                    >
                        <option value="all">All Games</option>
                        <option value="mcq">MCQ Battle</option>
                        <option value="flashcard">Flashcard Rush</option>
                        <option value="spotting">Spotting Challenge</option>
                    </select>
                </div>

                {/* Loading / Error */}
                {loading && entries.length === 0 && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {error && (
                    <div className="bg-white rounded-2xl border border-red-200 p-6 text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Leaderboard Table */}
                {!loading && !error && entries.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">#</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Player / Team</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Game</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Score</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Attempt</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-600">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {entries.map((entry, idx) => (
                                        <tr
                                            key={entry.id}
                                            className={`hover:bg-gray-50 ${idx < 3 ? "bg-gradient-to-r from-blue-50/50 to-transparent" : ""
                                                }`}
                                        >
                                            <td className="px-4 py-3 font-bold">{getRankIcon(idx)}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {entry.name}
                                                <span className="block text-xs text-gray-500 font-mono">{entry.code}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getGameColor(entry.gameType)}`}>
                                                    {entry.gameType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-blue-600 text-lg">
                                                {entry.score}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-600">
                                                #{entry.attempt}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                                {new Date(entry.playedAt).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!loading && !error && entries.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No scores yet. Be the first to play!
                    </div>
                )}
            </div>
        </div>
    );
}