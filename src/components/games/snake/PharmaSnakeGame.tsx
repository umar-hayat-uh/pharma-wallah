"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameCanvas from "@/lib/game-engine/GameCanvas";
import { useGameLoop } from "@/lib/game-engine/useGameLoop";
import { useGameState } from "@/lib/game-engine/useGameState";
import { randomEmptyCell, positionsEqual } from "@/lib/game-engine/collision";
import type { GridConfig, GridEntity, GridPosition, GameResult } from "@/lib/game-engine/types";
import {
    createInitialSnake,
    nextHeadPosition,
    checkSnakeCollision,
    isOppositeDirection,
    type Direction,
} from "./snake-logic";
import {
    pickRandomCondition,
    pickRandomPill,
    isPillCorrectForCondition,
    CONDITIONS,
    type ConditionCard,
} from "./pharma-conditions";
import { Heart, Trophy, Play, RotateCcw, ShieldAlert } from "lucide-react";

const GRID: GridConfig = { cols: 16, rows: 16, cellSize: 28 };
const TICK_MS = 150;
const STARTING_LIVES = 3;
const FRUIT_SPAWN_CHANCE = 0.3;
const PILL_LIFETIME_MS = 5000; // pill disappears after 5s if not eaten

interface PillEntity extends GridEntity {
    data: { pillName: string; isCorrect: boolean };
}

export default function PharmaSnakeGame({
    onGameOver,
}: {
    onGameOver?: (result: GameResult) => void;
}) {
    /* ── Core State ── */
    const snakeRef = useRef<GridPosition[]>(createInitialSnake(GRID));
    const [snake, setSnake] = useState<GridPosition[]>(() => snakeRef.current);
    const [direction, setDirection] = useState<Direction>("right");

    const currentDirectionRef = useRef<Direction>("right");
    const pendingDirectionRef = useRef<Direction>("right");
    const pillRef = useRef<PillEntity | null>(null);
    const phaseRef = useRef<"idle" | "playing" | "gameover">("idle");

    const [activeCondition, setActiveCondition] = useState<ConditionCard>(CONDITIONS[0]);
    const [pill, setPill] = useState<PillEntity | null>(null);
    const [shakeKey, setShakeKey] = useState(0);
    const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const gameState = useGameState({
        startingLives: STARTING_LIVES,
        onGameOver,
    });

    // ── Responsive scaling ──
    const outerContainerRef = useRef<HTMLDivElement>(null);
    const [canvasScale, setCanvasScale] = useState(1);

    // Keep phaseRef in sync
    useEffect(() => {
        phaseRef.current = gameState.phase as any;
    }, [gameState.phase]);

    useEffect(() => {
        setActiveCondition(pickRandomCondition());
    }, []);

    // Observe the outer container and compute scale
    useEffect(() => {
        const container = outerContainerRef.current;
        if (!container) return;

        const updateScale = () => {
            const originalWidth = GRID.cols * GRID.cellSize;
            const computedStyle = getComputedStyle(container);
            const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
            // Subtract padding and a small safety margin
            const availableWidth = container.clientWidth - paddingLeft - paddingRight - 4;
            const scale = Math.min(1, availableWidth / originalWidth);
            setCanvasScale(Math.max(0.1, scale));
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    /* ── Pill Spawning ── */
    const spawnPill = useCallback(
        (currentSnake: GridPosition[]) => {
            const cell = randomEmptyCell(GRID, currentSnake);
            if (!cell) return;

            const isFruitSpawn = Math.random() < FRUIT_SPAWN_CHANCE;
            let newPill: PillEntity;

            if (isFruitSpawn) {
                newPill = {
                    id: `fruit-${Date.now()}`,
                    position: cell,
                    kind: "fruit",
                    data: { pillName: "Bonus Fruit", isCorrect: true },
                };
            } else {
                const pillDef = pickRandomPill(activeCondition.id);
                const correct = isPillCorrectForCondition(pillDef, activeCondition.id);
                newPill = {
                    id: `pill-${Date.now()}`,
                    position: cell,
                    kind: correct ? "correct-pill" : "wrong-pill",
                    data: { pillName: pillDef.name, isCorrect: correct },
                };
            }

            pillRef.current = newPill;
            setPill(newPill);
        },
        [activeCondition]
    );

    /* ── Reset / Start ── */
    const resetRound = useCallback(() => {
        const initial = createInitialSnake(GRID);
        snakeRef.current = initial;
        setSnake(initial);
        currentDirectionRef.current = "right";
        pendingDirectionRef.current = "right";
        setDirection("right");
        pillRef.current = null;
        setPill(null);
        setToast(null);
        setActiveCondition(pickRandomCondition());
        gameState.start();
    }, [gameState]);

    // Spawn first pill when game starts
    useEffect(() => {
        if (gameState.phase === "playing" && !pillRef.current) {
            spawnPill(snakeRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.phase]);

    /* ── Keyboard Input ── */
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const map: Record<string, Direction> = {
                ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
                w: "up", s: "down", a: "left", d: "right",
            };
            const next = map[e.key];
            if (!next) return;
            e.preventDefault();
            if (!isOppositeDirection(next, currentDirectionRef.current)) {
                pendingDirectionRef.current = next;
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    /* ── Game Tick ── */
    const handleTick = useCallback(() => {
        if (phaseRef.current !== "playing") return;

        const currentDir = currentDirectionRef.current;
        let nextDir = pendingDirectionRef.current;

        if (isOppositeDirection(currentDir, nextDir)) {
            nextDir = currentDir;
            pendingDirectionRef.current = currentDir;
        }

        currentDirectionRef.current = nextDir;
        setDirection(nextDir);

        const currentPill = pillRef.current;
        const currentSnake = snakeRef.current;

        if (!currentSnake || currentSnake.length < 2) return;

        const head = currentSnake[0];
        const newHead = nextHeadPosition(head, nextDir);

        const ateThisTick = currentPill && positionsEqual(newHead, currentPill.position);
        const bodyForCollisionCheck = ateThisTick ? currentSnake : currentSnake.slice(0, -1);

        const { hitWall, hitSelf } = checkSnakeCollision(newHead, bodyForCollisionCheck, GRID);

        if (hitWall || hitSelf) {
            const ended = gameState.loseLife(1);
            setShakeKey((k) => k + 1);
            setToast({ text: "💀 Hit obstacle! −1 Life", type: "error" });

            if (ended) {
                gameState.endGame({ finalCondition: activeCondition.condition });
                return;
            }

            // Soft reset
            const fresh = createInitialSnake(GRID);
            snakeRef.current = fresh;
            setSnake(fresh);
            currentDirectionRef.current = "right";
            pendingDirectionRef.current = "right";
            setDirection("right");
            pillRef.current = null;
            setPill(null);
            return;
        }

        let grew = false;
        if (ateThisTick && currentPill) {
            if (currentPill.kind === "fruit") {
                gameState.addScore(25);
                grew = true;
                setToast({ text: "🍎 Bonus Fruit! +25 XP", type: "success" });
            } else if (currentPill.data.isCorrect) {
                gameState.addScore(10);
                grew = true;
                setToast({ text: `✅ ${currentPill.data.pillName} is correct! +10`, type: "success" });
            } else {
                const ended = gameState.loseLife(2);
                setShakeKey((k) => k + 1);
                setToast({ text: `❌ ${currentPill.data.pillName} is WRONG! −2 Lives`, type: "error" });

                if (ended) {
                    gameState.endGame({ finalCondition: activeCondition.condition });
                    return;
                }

                const fresh = createInitialSnake(GRID);
                snakeRef.current = fresh;
                setSnake(fresh);
                currentDirectionRef.current = "right";
                pendingDirectionRef.current = "right";
                setDirection("right");
                pillRef.current = null;
                setPill(null);
                return;
            }
            pillRef.current = null;
            setPill(null);
        }

        const newSnake = grew
            ? [newHead, ...currentSnake]
            : [newHead, ...currentSnake.slice(0, -1)];

        snakeRef.current = newSnake;
        setSnake(newSnake);
    }, [gameState, activeCondition]);

    useGameLoop({
        tickMs: TICK_MS,
        onTick: handleTick,
        isRunning: gameState.isPlaying,
    });

    // Respawn pill after eating
    useEffect(() => {
        if (gameState.isPlaying && !pillRef.current) {
            const t = setTimeout(() => spawnPill(snakeRef.current), 80);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pill, gameState.isPlaying]);

    // NEW: Auto‑remove pill if it lives too long (prevents wrong‑pill dead‑ends)
    useEffect(() => {
        if (!gameState.isPlaying || !pill) return;
        const timer = setTimeout(() => {
            pillRef.current = null;
            setPill(null);
        }, PILL_LIFETIME_MS);
        return () => clearTimeout(timer);
    }, [pill, gameState.isPlaying]);

    // Rotate condition every 80 points
    useEffect(() => {
        if (gameState.score > 0 && gameState.score % 80 === 0) {
            setActiveCondition(pickRandomCondition());
        }
    }, [gameState.score]);

    /* ── Build entity list ── */
    const entities: GridEntity[] = [
        ...snake.map((seg, idx) => ({
            id: `seg-${idx}`,
            position: seg,
            kind: idx === 0 ? "snake-head" : "snake-body",
        })),
        ...(pill ? [pill] : []),
    ];

    /* ── Render ── */
    return (
        <div
            ref={outerContainerRef}
            className="flex flex-col items-center gap-3 text-gray-100 font-sans max-w-lg mx-auto select-none px-2 sm:px-0"
        >
            {/* Target Condition Banner */}
            <div className="w-full bg-gray-900/80 rounded-xl border border-gray-700 p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                    🎯 Collect the correct drug for
                </p>
                <p className="text-lg font-bold text-white leading-tight">{activeCondition.condition}</p>
                <p className="text-xs text-blue-400 font-medium mt-1">{activeCondition.subtitle}</p>
            </div>

            {/* Score & Lives Bar */}
            <div className="w-full flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1">
                    {Array.from({ length: STARTING_LIVES }).map((_, i) => (
                        <Heart
                            key={i}
                            className={`w-5 h-5 ${
                                i < gameState.lives
                                    ? "text-red-500 fill-red-500"
                                    : "text-gray-700 fill-gray-800"
                            }`}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400">
                    <Trophy className="w-4 h-4" />
                    {gameState.score}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold text-center border ${
                        toast.type === "success"
                            ? "bg-emerald-950/80 border-emerald-700 text-emerald-300"
                            : "bg-red-950/80 border-red-700 text-red-300"
                    }`}
                >
                    {toast.text}
                </div>
            )}

            {/* Game Canvas – responsive wrapper */}
            <div className="w-full flex justify-center overflow-hidden">
                <GameCanvas
                    grid={GRID}
                    entities={entities}
                    direction={direction}
                    scale={canvasScale}
                />
            </div>

            {/* Start Button */}
            {gameState.phase === "idle" && (
                <button
                    onClick={resetRound}
                    className="flex items-center gap-2 px-7 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-base rounded-xl shadow-lg active:scale-95 transition-all"
                >
                    <Play className="w-5 h-5 fill-white" /> Start Game
                </button>
            )}

            {/* Game Over */}
            {gameState.phase === "gameover" && (
                <div className="text-center space-y-2 bg-gray-900 border border-gray-700 p-5 rounded-xl w-full">
                    <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
                    <p className="text-2xl font-bold text-white">Game Over</p>
                    <p className="text-gray-400 text-sm">
                        Score:{" "}
                        <span className="font-mono font-bold text-xl text-amber-400">
                            {gameState.score}
                        </span>
                    </p>
                    <button
                        onClick={resetRound}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition mx-auto mt-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Play Again
                    </button>
                </div>
            )}

            {/* Mobile D-Pad */}
            {gameState.phase === "playing" && (
                <div className="grid grid-cols-3 gap-1.5 mt-1 sm:hidden touch-manipulation">
                    <div />
                    <button
                        onClick={() => {
                            if (!isOppositeDirection("up", currentDirectionRef.current))
                                pendingDirectionRef.current = "up";
                        }}
                        className="p-4 bg-gray-800 active:bg-gray-600 rounded-lg font-bold text-xl border border-gray-700 min-w-[64px] min-h-[64px] flex items-center justify-center"
                    >
                        ↑
                    </button>
                    <div />
                    <button
                        onClick={() => {
                            if (!isOppositeDirection("left", currentDirectionRef.current))
                                pendingDirectionRef.current = "left";
                        }}
                        className="p-4 bg-gray-800 active:bg-gray-600 rounded-lg font-bold text-xl border border-gray-700 min-w-[64px] min-h-[64px] flex items-center justify-center"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => {
                            if (!isOppositeDirection("down", currentDirectionRef.current))
                                pendingDirectionRef.current = "down";
                        }}
                        className="p-4 bg-gray-800 active:bg-gray-600 rounded-lg font-bold text-xl border border-gray-700 min-w-[64px] min-h-[64px] flex items-center justify-center"
                    >
                        ↓
                    </button>
                    <button
                        onClick={() => {
                            if (!isOppositeDirection("right", currentDirectionRef.current))
                                pendingDirectionRef.current = "right";
                        }}
                        className="p-4 bg-gray-800 active:bg-gray-600 rounded-lg font-bold text-xl border border-gray-700 min-w-[64px] min-h-[64px] flex items-center justify-center"
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}