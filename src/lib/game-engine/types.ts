export interface GridPosition {
  col: number;
  row: number;
}

export interface GridConfig {
  cols: number;
  rows: number;
  cellSize: number;
}

export interface GridEntity {
  id: string;
  position: GridPosition;
  kind: string;
  data?: any;
  [key: string]: any;
}

export type GamePhase = "idle" | "playing" | "paused" | "gameover";

export interface GameResult {
  finalCondition?: string;
  score?: number;
  [key: string]: any;
}

export interface GameLoopConfig {
  tickMs: number;
  onTick: (delta: number) => void;
  isRunning: boolean;
}

export interface GameStateConfig {
  startingLives?: number;
  onGameOver?: (result: GameResult) => void;
}