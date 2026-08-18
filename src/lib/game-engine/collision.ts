import type { GridConfig, GridPosition } from "./types";

export function toPixels(
  position: GridPosition,
  grid: GridConfig
): { x: number; y: number } {
  return {
    x: (position?.col ?? 0) * grid.cellSize,
    y: (position?.row ?? 0) * grid.cellSize,
  };
}

export function positionsEqual(a: GridPosition, b: GridPosition): boolean {
  if (!a || !b) return false;
  return a.col === b.col && a.row === b.row;
}

export function isWithinBounds(pos: GridPosition, grid: GridConfig): boolean {
  if (!pos) return false;
  return (
    pos.col >= 0 && pos.col < grid.cols && pos.row >= 0 && pos.row < grid.rows
  );
}

export function randomEmptyCell(
  grid: GridConfig,
  occupiedPositions: GridPosition[]
): GridPosition | null {
  const emptyCells: GridPosition[] = [];
  const head = occupiedPositions && occupiedPositions.length > 0 ? occupiedPositions[0] : null;

  for (let col = 0; col < grid.cols; col++) {
    for (let row = 0; row < grid.rows; row++) {
      const isOccupied = occupiedPositions.some(
        (p) => p && p.col === col && p.row === row
      );
      // Avoid spawning directly on or right next to the head (distance <= 2) so player has time to react
      const distToHead = head ? Math.abs(col - head.col) + Math.abs(row - head.row) : 5;
      if (!isOccupied && distToHead > 2) {
        emptyCells.push({ col, row });
      }
    }
  }

  // Fallback if grid is crowded
  if (emptyCells.length === 0) {
    for (let col = 0; col < grid.cols; col++) {
      for (let row = 0; row < grid.rows; row++) {
        if (!occupiedPositions.some((p) => p && p.col === col && p.row === row)) {
          emptyCells.push({ col, row });
        }
      }
    }
  }

  if (emptyCells.length === 0) return null;
  const idx = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[idx];
}