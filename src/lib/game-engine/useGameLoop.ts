"use client";

import { useEffect, useRef } from "react";
import type { GameLoopConfig } from "./types";

/**
 * Drives any grid game's tick rate using requestAnimationFrame internally,
 * but only calls onTick at the fixed interval you specify (tickMs) — not
 * every animation frame.
 */
export function useGameLoop({ tickMs, onTick, isRunning }: GameLoopConfig) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!isRunning) {
      accumulatorRef.current = 0;
      lastTimeRef.current = 0;
      return;
    }

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      accumulatorRef.current += delta;

      let ticksThisFrame = 0;
      while (accumulatorRef.current >= tickMs && ticksThisFrame < 5) {
        onTickRef.current(tickMs);
        accumulatorRef.current -= tickMs;
        ticksThisFrame++;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isRunning, tickMs]);
}

export default useGameLoop;