import type { GridConfig, GridPosition } from "@/lib/game-engine/types";
import { positionsEqual, isWithinBounds } from "@/lib/game-engine/collision";

export type Direction = "up" | "down" | "left" | "right";

const DIRECTION_DELTAS: Record<Direction, GridPosition> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

/** Prevents the classic "reverse into yourself" instant-death bug. */
export function isOppositeDirection(a: Direction, b: Direction): boolean {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}

export function nextHeadPosition(
  head: GridPosition,
  direction: Direction
): GridPosition {
  const delta = DIRECTION_DELTAS[direction];
  return { col: head.col + delta.col, row: head.row + delta.row };
}

export interface SnakeCollisionResult {
  hitWall: boolean;
  hitSelf: boolean;
}

/**
 * Checks whether moving the snake's head to `newHead` results in a fatal
 * collision (wall or self).
 */
export function checkSnakeCollision(
  newHead: GridPosition,
  body: GridPosition[],
  grid: GridConfig
): SnakeCollisionResult {
  const hitWall = !isWithinBounds(newHead, grid);
  const hitSelf = body.some((segment) => positionsEqual(segment, newHead));
  return { hitWall, hitSelf };
}

/** Builds the initial 3-segment snake, centered on the grid, facing right. */
export function createInitialSnake(grid: GridConfig): GridPosition[] {
  const startCol = Math.floor(grid.cols / 2);
  const startRow = Math.floor(grid.rows / 2);
  return [
    { col: startCol, row: startRow },
    { col: startCol - 1, row: startRow },
    { col: startCol - 2, row: startRow },
  ];
}