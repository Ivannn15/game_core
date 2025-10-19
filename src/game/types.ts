import type { Level } from '../data/levels';

export type TileType = 'empty' | 'wall' | 'coin' | 'door' | 'key';

export interface Vector2 {
  x: number;
  y: number;
}

export interface GameActor {
  position: Vector2;
  hasKey: boolean;
  coins: number;
  message?: string;
}

export interface AnimationState {
  from: Vector2;
  to: Vector2;
  progress: number;
}

export type GameCommand =
  | { type: 'move'; direction: Vector2 }
  | { type: 'say'; text: string }
  | { type: 'pick' }
  | { type: 'open' };

export interface GameLogEntry {
  type: 'info' | 'error' | 'success';
  message: string;
  line?: number | null;
}

export interface GameResult {
  success: boolean;
  message?: string;
  log: GameLogEntry[];
  goalsCompleted: boolean[];
}

export interface RuleCheck {
  name: string;
  value: boolean;
}

export interface RunnerFriendlyError {
  match: RegExp;
  message: string;
  hint?: string;
}

export interface ExecutionResult {
  log: GameLogEntry[];
  success: boolean;
  message?: string;
  goalsCompleted: boolean[];
}

export interface TestResult {
  passed: boolean;
  name: string;
  details?: string;
}

export interface GameSnapshot {
  actor: GameActor;
  level: Level;
  collectedCoins: number;
  openedDoor: boolean;
  collisions: number;
  steps: number;
  events: string[];
}
