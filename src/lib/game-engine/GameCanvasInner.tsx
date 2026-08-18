"use client";

import React from "react";
import { Stage, Layer, Rect, Group, Circle, Text } from "react-konva";
import type { GridConfig, GridEntity } from "./types";
import { toPixels } from "./collision";

export interface GameCanvasProps {
  grid: GridConfig;
  entities: GridEntity[];
  direction?: "up" | "down" | "left" | "right";
  colorMap?: Record<string, string>;
  renderEntity?: (entity: GridEntity, grid: GridConfig) => React.ReactNode;
  backgroundColor?: string;
  scale?: number;
}

export default function GameCanvasInner({
  grid,
  entities,
  direction = "right",
  renderEntity,
  backgroundColor = "#111827",
  scale = 1,
}: GameCanvasProps) {
  const baseWidth = grid.cols * grid.cellSize;
  const baseHeight = grid.rows * grid.cellSize;
  const cs = grid.cellSize;

  const width = baseWidth * scale;
  const height = baseHeight * scale;

  return (
    <Stage width={width} height={height} className="rounded-xl overflow-hidden border border-gray-700">
      <Layer scaleX={scale} scaleY={scale}>
        {/* Background */}
        <Rect x={0} y={0} width={baseWidth} height={baseHeight} fill={backgroundColor} />

        {/* Checkerboard */}
        {Array.from({ length: grid.cols }).map((_, c) =>
          Array.from({ length: grid.rows }).map((_, r) => {
            const isDark = (c + r) % 2 === 0;
            return (
              <Rect
                key={`cell-${c}-${r}`}
                x={c * cs}
                y={r * cs}
                width={cs}
                height={cs}
                fill={isDark ? "#111827" : "#0f1623"}
              />
            );
          })
        )}

        {/* Border */}
        <Rect x={0} y={0} width={baseWidth} height={baseHeight} stroke="#374151" strokeWidth={2} />

        {/* Entities */}
        {entities.map((entity) => {
          if (renderEntity) return <Group key={entity.id}>{renderEntity(entity, grid)}</Group>;

          const { x, y } = toPixels(entity.position, grid);
          const cx = x + cs / 2;
          const cy = y + cs / 2;

          if (entity.kind === "snake-head") {
            const size = cs - 2;
            const r = size / 2;
            let eyeL = { x: cx - r * 0.35, y: cy - r * 0.3 };
            let eyeR = { x: cx + r * 0.35, y: cy - r * 0.3 };

            if (direction === "right") {
              eyeL = { x: cx + r * 0.2, y: cy - r * 0.35 };
              eyeR = { x: cx + r * 0.2, y: cy + r * 0.35 };
            } else if (direction === "left") {
              eyeL = { x: cx - r * 0.2, y: cy - r * 0.35 };
              eyeR = { x: cx - r * 0.2, y: cy + r * 0.35 };
            } else if (direction === "down") {
              eyeL = { x: cx - r * 0.35, y: cy + r * 0.2 };
              eyeR = { x: cx + r * 0.35, y: cy + r * 0.2 };
            } else {
              eyeL = { x: cx - r * 0.35, y: cy - r * 0.2 };
              eyeR = { x: cx + r * 0.35, y: cy - r * 0.2 };
            }

            return (
              <Group key={entity.id}>
                <Rect
                  x={x + 1}
                  y={y + 1}
                  width={size}
                  height={size}
                  fill="#22c55e"
                  cornerRadius={6}
                  stroke="#15803d"
                  strokeWidth={1}
                />
                <Circle x={eyeL.x} y={eyeL.y} radius={3.5} fill="#ffffff" />
                <Circle x={eyeR.x} y={eyeR.y} radius={3.5} fill="#ffffff" />
                <Circle x={eyeL.x} y={eyeL.y} radius={1.8} fill="#000000" />
                <Circle x={eyeR.x} y={eyeR.y} radius={1.8} fill="#000000" />
              </Group>
            );
          }

          if (entity.kind === "snake-body") {
            const size = cs - 4;
            return (
              <Group key={entity.id}>
                <Rect
                  x={x + 2}
                  y={y + 2}
                  width={size}
                  height={size}
                  fill="#4ade80"
                  cornerRadius={4}
                  stroke="#22c55e"
                  strokeWidth={1}
                />
              </Group>
            );
          }

          if (entity.kind === "correct-pill" || entity.kind === "wrong-pill") {
            const isCorrect = entity.kind === "correct-pill";
            const pillName = entity.data?.pillName || (isCorrect ? "Rx Drug" : "Wrong");
            const mainColor = isCorrect ? "#3b82f6" : "#ef4444";
            const lightColor = isCorrect ? "#93c5fd" : "#fca5a5";
            const capsuleW = cs * 0.82;
            const capsuleH = cs * 0.42;

            return (
              <Group key={entity.id}>
                <Rect
                  x={cx - capsuleW / 2 + 1}
                  y={cy - capsuleH / 2 + 2}
                  width={capsuleW}
                  height={capsuleH}
                  cornerRadius={capsuleH / 2}
                  fill="rgba(0,0,0,0.3)"
                />
                <Rect
                  x={cx - capsuleW / 2}
                  y={cy - capsuleH / 2}
                  width={capsuleW / 2}
                  height={capsuleH}
                  fill={mainColor}
                  cornerRadius={[capsuleH / 2, 0, 0, capsuleH / 2]}
                />
                <Rect
                  x={cx}
                  y={cy - capsuleH / 2}
                  width={capsuleW / 2}
                  height={capsuleH}
                  fill={lightColor}
                  cornerRadius={[0, capsuleH / 2, capsuleH / 2, 0]}
                />
                <Rect
                  x={cx - capsuleW / 2 + 3}
                  y={cy - capsuleH / 2 + 2}
                  width={capsuleW - 6}
                  height={capsuleH * 0.25}
                  fill="rgba(255,255,255,0.3)"
                  cornerRadius={3}
                />
                <Text
                  x={cx - 32}
                  y={cy + capsuleH / 2 + 2}
                  width={64}
                  text={pillName.length > 9 ? pillName.substring(0, 8) + "…" : pillName}
                  fontSize={8}
                  fontStyle="bold"
                  fill={isCorrect ? "#93c5fd" : "#fca5a5"}
                  align="center"
                />
              </Group>
            );
          }

          if (entity.kind === "fruit") {
            const r = cs * 0.35;
            return (
              <Group key={entity.id}>
                <Circle x={cx} y={cy} radius={r} fill="#ef4444" stroke="#b91c1c" strokeWidth={1} />
                <Circle x={cx - r * 0.25} y={cy - r * 0.3} radius={r * 0.3} fill="rgba(255,255,255,0.4)" />
                <Rect x={cx - 1} y={cy - r - 4} width={2} height={5} fill="#65a30d" cornerRadius={1} />
                <Circle x={cx + 3} y={cy - r - 2} radius={2.5} fill="#22c55e" />
                <Text
                  x={cx - 18}
                  y={cy + r + 2}
                  width={36}
                  text="+25"
                  fontSize={8}
                  fontStyle="bold"
                  fill="#fbbf24"
                  align="center"
                />
              </Group>
            );
          }

          return null;
        })}
      </Layer>
    </Stage>
  );
}