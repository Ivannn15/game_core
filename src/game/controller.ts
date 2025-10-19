import { Level } from '../data/levels';
import {
  AnimationState,
  GameActor,
  GameCommand,
  GameLogEntry,
  GameSnapshot,
  Vector2
} from './types';

export interface GameController {
  loadLevel: (level: Level) => void;
  reset: () => void;
  tick: () => void;
  render: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  enqueue: (command: GameCommand) => GameLogEntry | null;
  stop: () => void;
  getSnapshot: () => GameSnapshot;
  isWallAt: (pos: Vector2) => boolean;
  seeItem: (direction: string) => boolean;
  atGoal: () => boolean;
  getFacing: () => Vector2;
  turnLeft: () => void;
  turnRight: () => void;
  say: (text: string) => void;
}

interface TileContent {
  type: 'empty' | 'wall' | 'coin' | 'door' | 'key';
  position: Vector2;
  collected?: boolean;
  opened?: boolean;
}

class GameControllerImpl implements GameController {
  private level: Level | null = null;
  private actor: GameActor = { position: { x: 0, y: 0 }, hasKey: false, coins: 0 };
  private tiles: TileContent[] = [];
  private animation: AnimationState | null = null;
  private lastTick = performance.now();
  private collisions = 0;
  private steps = 0;
  private events: string[] = [];
  private facing: Vector2 = { x: 1, y: 0 };

  loadLevel(level: Level) {
    this.level = level;
    this.tiles = [];
    level.map.tiles.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        const type = level.map.legend[cell];
        if (type === 'player') {
          this.actor.position = { x, y };
        } else if (type && type !== 'empty') {
          this.tiles.push({ type, position: { x, y } });
        }
      });
    });
    this.actor.coins = 0;
    this.actor.hasKey = false;
    this.actor.message = undefined;
    this.animation = null;
    this.collisions = 0;
    this.steps = 0;
    this.events = [];
    this.facing = { x: 1, y: 0 };
  }

  reset() {
    if (!this.level) return;
    this.loadLevel(this.level);
  }

  tick() {
    const now = performance.now();
    const delta = now - this.lastTick;
    this.lastTick = now;
    if (this.animation) {
      this.animation.progress += delta / 200;
      if (this.animation.progress >= 1) {
        this.animation = null;
      }
    }
    if (this.actor.message) {
      // fade message
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.level) return;
    const cellW = width / this.level.map.cols;
    const cellH = height / this.level.map.rows;
    ctx.clearRect(0, 0, width, height);
    this.level.map.tiles.forEach((row, y) => {
      row.split('').forEach((_, x) => {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x * cellW, y * cellH, cellW - 1, cellH - 1);
      });
    });

    this.tiles.forEach((tile) => {
      if (tile.type === 'coin' && tile.collected) return;
      if (tile.type === 'key' && tile.collected) return;
      if (tile.type === 'door' && tile.opened) {
        ctx.fillStyle = '#15803d';
      } else {
        ctx.fillStyle = getTileColor(tile.type);
      }
      ctx.fillRect(tile.position.x * cellW + 6, tile.position.y * cellH + 6, cellW - 12, cellH - 12);
    });

    const pos = this.getActorDrawPosition(cellW, cellH);
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(pos.x + cellW / 2, pos.y + cellH / 2, Math.min(cellW, cellH) / 3, 0, Math.PI * 2);
    ctx.fill();

    if (this.actor.message) {
      ctx.fillStyle = '#fff';
      ctx.font = '16px Montserrat';
      ctx.fillText(this.actor.message, pos.x + 10, pos.y - 10);
    }
  }

  private getActorDrawPosition(cellW: number, cellH: number) {
    if (!this.animation) {
      return { x: this.actor.position.x * cellW, y: this.actor.position.y * cellH };
    }
    const { from, to, progress } = this.animation;
    const clamped = Math.min(1, Math.max(0, progress));
    const x = (from.x + (to.x - from.x) * clamped) * cellW;
    const y = (from.y + (to.y - from.y) * clamped) * cellH;
    return { x, y };
  }

  enqueue(command: GameCommand): GameLogEntry | null {
    switch (command.type) {
      case 'move':
        return this.handleMove(command.direction);
      case 'pick':
        return this.handlePick();
      case 'open':
        return this.handleOpen();
      case 'say':
        this.say(command.text);
        return { type: 'info', message: command.text };
      default:
        return null;
    }
  }

  stop() {
    this.animation = null;
  }

  getSnapshot(): GameSnapshot {
    return {
      actor: { ...this.actor },
      level: this.level!,
      collectedCoins: this.actor.coins,
      openedDoor: this.tiles.some((tile) => tile.type === 'door' && tile.opened),
      collisions: this.collisions,
      steps: this.steps,
      events: [...this.events]
    };
  }

  isWallAt(pos: Vector2): boolean {
    if (!this.level) return true;
    if (pos.x < 0 || pos.y < 0 || pos.x >= this.level.map.cols || pos.y >= this.level.map.rows) {
      return true;
    }
    const cellChar = this.level.map.tiles[pos.y][pos.x];
    const type = this.level.map.legend[cellChar];
    return type === 'wall';
  }

  seeItem(direction: string): boolean {
    const dir = directionVector(direction);
    const target = { x: this.actor.position.x + dir.x, y: this.actor.position.y + dir.y };
    return this.tiles.some(
      (tile) =>
        tile.position.x === target.x &&
        tile.position.y === target.y &&
        !tile.collected &&
        (tile.type === 'coin' || tile.type === 'key' || tile.type === 'door')
    );
  }

  atGoal(): boolean {
    return this.tiles.some(
      (tile) =>
        tile.type === 'door' &&
        tile.position.x === this.actor.position.x &&
        tile.position.y === this.actor.position.y
    );
  }

  getFacing() {
    return this.facing;
  }

  turnLeft() {
    const { x, y } = this.facing;
    this.facing = { x: -y, y: x };
  }

  turnRight() {
    const { x, y } = this.facing;
    this.facing = { x: y, y: -x };
  }

  say(text: string) {
    this.actor.message = text;
    this.events.push(`say:${text}`);
  }

  private handleMove(direction: Vector2): GameLogEntry {
    if (!this.level) {
      return { type: 'error', message: 'Уровень не загружен' };
    }
    const next = { x: this.actor.position.x + direction.x, y: this.actor.position.y + direction.y };
    this.facing = { ...direction };
    if (this.isWallAt(next)) {
      this.collisions += 1;
      this.events.push('collision');
      return { type: 'error', message: 'Бум! Стена рядом.' };
    }
    const from = { ...this.actor.position };
    this.actor.position = next;
    this.animation = { from, to: next, progress: 0 };
    this.steps += 1;
    this.events.push(`move:${direction.x},${direction.y}`);
    return { type: 'info', message: 'Шаг выполнен' };
  }

  private handlePick(): GameLogEntry {
    const tile = this.tiles.find(
      (t) =>
        t.position.x === this.actor.position.x &&
        t.position.y === this.actor.position.y &&
        !t.collected &&
        (t.type === 'coin' || t.type === 'key')
    );
    if (!tile) {
      return { type: 'error', message: 'Здесь нет предмета.' };
    }
    tile.collected = true;
    if (tile.type === 'coin') {
      this.actor.coins += 1;
      this.events.push('coin');
      return { type: 'success', message: 'Монета собрана!' };
    }
    if (tile.type === 'key') {
      this.actor.hasKey = true;
      this.events.push('key');
      return { type: 'success', message: 'Ключ у героя!' };
    }
    return { type: 'info', message: 'Предмет собран.' };
  }

  private handleOpen(): GameLogEntry {
    const door = this.tiles.find(
      (t) =>
        t.type === 'door' &&
        t.position.x === this.actor.position.x &&
        t.position.y === this.actor.position.y
    );
    if (!door) {
      return { type: 'error', message: 'Двери рядом нет.' };
    }
    if (!this.actor.hasKey) {
      return { type: 'error', message: 'Нужен ключ, чтобы открыть дверь.' };
    }
    if (!door.opened) {
      door.opened = true;
      this.events.push('door-open');
      return { type: 'success', message: 'Дверь открыта!' };
    }
    return { type: 'info', message: 'Дверь уже открыта.' };
  }
}

function directionVector(dir: string): Vector2 {
  switch (dir) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

function getTileColor(type: TileContent['type']) {
  switch (type) {
    case 'wall':
      return '#1e293b';
    case 'coin':
      return '#fbbf24';
    case 'door':
      return '#ea580c';
    case 'key':
      return '#facc15';
    default:
      return '#1f2937';
  }
}

export function createGameController(): GameController {
  return new GameControllerImpl();
}
