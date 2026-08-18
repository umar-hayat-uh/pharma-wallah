"use client";

import dynamic from "next/dynamic";
import type { GridConfig, GridEntity } from "./types";

export interface GameCanvasProps {
  grid: GridConfig;
  entities: GridEntity[];
  direction?: "up" | "down" | "left" | "right";
  colorMap?: Record<string, string>;
  renderEntity?: (entity: GridEntity, grid: GridConfig) => React.ReactNode;
  backgroundColor?: string;
  scale?: number;
}

const GameCanvasInner = dynamic(() => import("./GameCanvasInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        maxWidth: "min(100%, 448px)",
      }}
      className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl flex items-center justify-center text-xs text-slate-400 font-medium"
    >
      Loading Canvas...
    </div>
  ),
});

export default function GameCanvas(props: GameCanvasProps) {
  return <GameCanvasInner {...props} />;
}