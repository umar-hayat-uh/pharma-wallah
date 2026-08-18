"use client";

import { useState, useCallback } from "react";
import type { GamePhase, GameResult, GameStateConfig } from "./types";

export function useGameState(config: GameStateConfig = {}) {
  const { startingLives = 3, onGameOver } = config;

  const [phase, setPhase] = useState<GamePhase>("idle");
  const [lives, setLives] = useState<number>(startingLives);
  const [score, setScore] = useState<number>(0);

  const start = useCallback(() => {
    setPhase("playing");
    setLives(startingLives);
    setScore(0);
  }, [startingLives]);

  const pause = useCallback(() => {
    setPhase((p) => (p === "playing" ? "paused" : p));
  }, []);

  const resume = useCallback(() => {
    setPhase((p) => (p === "paused" ? "playing" : p));
  }, []);

  const addScore = useCallback((amount: number) => {
    setScore((s) => s + amount);
  }, []);

  const loseLife = useCallback(
    (amount: number = 1): boolean => {
      let ended = false;
      setLives((prevLives) => {
        const next = Math.max(0, prevLives - amount);
        if (next <= 0) {
          ended = true;
          setPhase("gameover");
        }
        return next;
      });
      return ended;
    },
    []
  );

  const endGame = useCallback(
    (result?: GameResult) => {
      setPhase("gameover");
      if (onGameOver) {
        onGameOver({
          score,
          ...result,
        });
      }
    },
    [onGameOver, score]
  );

  return {
    phase,
    lives,
    score,
    isPlaying: phase === "playing",
    isIdle: phase === "idle",
    isGameOver: phase === "gameover",
    isPaused: phase === "paused",
    start,
    pause,
    resume,
    addScore,
    loseLife,
    endGame,
  };
}

export default useGameState;