"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Trophy, Medal, Award, RefreshCw, ArrowLeft, Users, Zap, Brain, Search,
} from "lucide-react";
import type { LeaderboardData, LeaderboardEntry } from "@/lib/leaderboard-data";

const GAME_TABS: { key: keyof LeaderboardData; label: string; icon: React.ElementType; accent: string }[] = [
    { key: "mcq", label: "MCQ Battle", icon: Brain, accent: "from-blue-600 to-blue-400" },
    { key: "flashcard", label: "Flashcard Rush", icon: Zap, accent: "from-amber-500 to-amber-300" },
    { key: "spotting", label: "Spotting Challenge", icon: Search, accent: "from-green-600 to-green-400" },
];

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-md shadow-yellow-500/30 ring-2 ring-yellow-200">
                <Trophy className="w-4.5 h-4.5 text-white" size={18} />
            </div>
        );
    }
    if (rank === 2) {
        return (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-sm">
                <Medal className="w-4 h-4 text-white" size={16} />
            </div>
        );
    }
    if (rank === 3) {
        return (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-sm">
                <Award className="w-4 h-4 text-white" size={16} />
            </div>
        );
    }
    return (
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-500">{rank}</span>
        </div>
    );
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
    const isTopThree = rank <= 3;
    return (
        <div
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isTopThree
                    ? "bg-gradient-to-r from-blue-50 to-green-50/60 border border-blue-100"
                    : "hover:bg-gray-50"
                }`}
        >
            <RankBadge rank={rank} />
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{entry.name}</p>
                <p className="text-xs text-gray-400 font-mono tracking-wide">{entry.code}</p>
            </div>
            {entry.timeTaken !== null && (
                <span className="hidden sm:block text-xs text-gray-400 tabular-nums">{entry.timeTaken}s</span>
            )}
            <div className="text-right">
                <span
                    className={`text-xl font-extrabold tabular-nums ${isTopThree ? "text-blue-700" : "text-gray-700"
                        }`}
                >
                    {entry.score}
                </span>
            </div>
        </div>
    );
}

export default function LeaderboardClient({ initialData }: { initialData: LeaderboardData }) {
    const [activeTab, setActiveTab] = useState<keyof LeaderboardData>("mcq");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Manual refresh re-runs the server component (Next.js RSC), which
    // reads from the SAME 30s Redis cache as everyone else — this never
    // fires a fresh Supabase query on its own. Safe for viewers to spam.
    const handleRefresh = () => {
        startTransition(() => router.refresh());
    };

    const activeEntries = initialData[activeTab] || [];
    const activeMeta = GAME_TABS.find((t) => t.key === activeTab)!;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center pt-10 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-8 max-w-2xl">
                <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 mb-6">
                    <div className="bg-white rounded-2xl px-8 py-4">
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
                            PharmaWallah Science Fair
                        </h1>
                        <p className="text-lg text-gray-600 mt-1">Tournament 2026</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl w-full space-y-6">
                <button
                    onClick={() => (window.location.href = "/tournament/play")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Play Page
                </button>

                {/* Title row */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-blue-600" /> Live Leaderboard
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            <p className="text-xs text-gray-500 font-medium">Updates every 30s</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Game tabs */}
                <div className="flex gap-2 p-1 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    {GAME_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${isActive
                                        ? `bg-gradient-to-r ${tab.accent} text-white shadow-md`
                                        : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Leaderboard list */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4">
                    {activeEntries.length > 0 ? (
                        <div className="space-y-1.5">
                            {activeEntries.map((entry, idx) => (
                                <LeaderboardRow key={entry.id} entry={entry} rank={idx + 1} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p className="font-medium">
                                {activeTab === "spotting"
                                    ? "Spotting Challenge isn't live yet — check back soon."
                                    : "No scores yet. Be the first to play!"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
