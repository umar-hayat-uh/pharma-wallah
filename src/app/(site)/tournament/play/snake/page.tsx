"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PharmaSnakeGame from "@/components/games/snake/PharmaSnakeGame";
import type { GameResult } from "@/lib/game-engine/types";

function SnakePageInner() {
    const searchParams = useSearchParams();
    const code = (searchParams.get("code") || "").toUpperCase();

    const handleGameOver = async (result: GameResult) => {
        // Same submit-score contract as your other games — adapt the payload
        // shape to whatever your finalized submit-score route expects for
        // continuous (non-question-based) games. Placeholder shown here:
        try {
            await fetch("/api/tournament/submit-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    gameType: "snake",
                    score: result.score,
                    timeTaken: Math.round(result.durationMs / 1000),
                }),
            });
        } catch {
            // non-fatal for the demo; wire proper error handling once
            // submit-score is extended to accept continuous-game payloads
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-8 max-w-2xl">
                <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 mb-6">
                    <div className="bg-white rounded-2xl px-8 py-4">
                        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
                            Pharma Snake
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Treat the condition. Avoid the wrong pill.</p>
                    </div>
                </div>
            </div>
            <PharmaSnakeGame onGameOver={handleGameOver} />
        </div>
    );
}

export default function SnakePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SnakePageInner />
        </Suspense>
    );
}
