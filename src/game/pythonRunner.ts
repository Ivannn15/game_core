/* eslint-disable @typescript-eslint/no-explicit-any */
import Sk from 'skulpt';
import { Level } from '../data/levels';
import { GameController } from './controller';
import { GameCommand, GameLogEntry, GameResult, RunnerFriendlyError } from './types';

const TIME_LIMIT_MS = 2000;

export class PythonRunner {
  private controller: GameController;
  private level: Level | null = null;
  private friendlyErrors: RunnerFriendlyError[];
  private isStopped = false;

  constructor(controller: GameController, friendlyErrors: RunnerFriendlyError[]) {
    this.controller = controller;
    this.friendlyErrors = friendlyErrors;
  }

  setLevel(level: Level) {
    this.level = level;
  }

  async run(code: string): Promise<GameResult> {
    if (!this.level) {
      return { success: false, message: 'Уровень не загружен', log: [], goalsCompleted: [] };
    }
    this.isStopped = false;
    this.controller.reset();
    const log: GameLogEntry[] = [];

    const api = this.createApi(log);

    const SkAny: any = Sk;
    SkAny.execLimit = TIME_LIMIT_MS;
    SkAny.configure({
      output: (text: string) => {
        if (text.trim()) {
          log.push({ type: 'info', message: text.trim() });
        }
      },
      read: (x: string) => {
        throw new Error(`Неизвестный модуль ${x}`);
      }
    });

    SkAny.builtins.__import__ = new SkAny.builtin.func(() => {
      throw new SkAny.builtin.ImportError('Импорт запрещён.');
    });

    Object.entries(api).forEach(([name, func]) => {
      SkAny.builtins[name] = new SkAny.builtin.func(func);
    });

    let success = true;
    let message: string | undefined;

    try {
      await SkAny.misceval.asyncToPromise(() => SkAny.importMainWithBody('<stdin>', false, code, true));
    } catch (error: any) {
      success = false;
      const friendly = this.toFriendly(error);
      log.push({ type: 'error', message: friendly.message, line: friendly.line });
      message = friendly.message;
    }

    if (this.isStopped) {
      success = false;
      message = 'Выполнение остановлено.';
      log.push({ type: 'error', message });
    }

    const snapshot = this.controller.getSnapshot();
    const goalsCompleted = this.level.tests.map((test) => evaluateTest(test, snapshot, code));
    const passedAll = success && goalsCompleted.every(Boolean);

    if (passedAll) {
      log.push({ type: 'success', message: 'Все цели выполнены!' });
    } else if (!message) {
      const remaining = goalsCompleted.filter((g) => !g).length;
      message = `Готово не всё. Осталось целей: ${remaining}.`;
    }

    return {
      success: passedAll,
      message,
      log,
      goalsCompleted
    };
  }

  stop() {
    this.isStopped = true;
  }

  private toFriendly(error: any) {
    const text = String(error);
    for (const item of this.friendlyErrors) {
      if (item.match.test(text)) {
        return { message: item.message, line: parseLine(text) };
      }
    }
    return { message: text, line: parseLine(text) };
  }

  private createApi(log: GameLogEntry[]) {
    return {
      move_right: () => this.wrapCommand({ type: 'move', direction: { x: 1, y: 0 } }, log),
      move_left: () => this.wrapCommand({ type: 'move', direction: { x: -1, y: 0 } }, log),
      move_up: () => this.wrapCommand({ type: 'move', direction: { x: 0, y: -1 } }, log),
      move_down: () => this.wrapCommand({ type: 'move', direction: { x: 0, y: 1 } }, log),
      pick: () => this.wrapCommand({ type: 'pick' }, log),
      open: () => this.wrapCommand({ type: 'open' }, log),
      say: (text: any) => {
        const value = Sk.ffi.remapToJs(text);
        this.controller.say(String(value));
        log.push({ type: 'info', message: `Герой говорит: ${String(value)}` });
        return Sk.builtin.none.none$;
      },
      print: (value: any) => {
        log.push({ type: 'info', message: String(Sk.ffi.remapToJs(value)) });
        return Sk.builtin.none.none$;
      },
      is_wall_ahead: () => {
        const facing = this.controller.getFacing();
        const next = { x: this.controller.getSnapshot().actor.position.x + facing.x, y: this.controller.getSnapshot().actor.position.y + facing.y };
        const result = this.controller.isWallAt(next);
        return Sk.ffi.remapToPy(result);
      },
      see_item: (dir: any) => {
        const js = Sk.ffi.remapToJs(dir);
        const result = this.controller.seeItem(String(js));
        return Sk.ffi.remapToPy(result);
      },
      at_goal: () => Sk.ffi.remapToPy(this.controller.atGoal()),
      turn_left: () => {
        this.controller.turnLeft();
        log.push({ type: 'info', message: 'Поворот влево' });
        return Sk.builtin.none.none$;
      },
      turn_right: () => {
        this.controller.turnRight();
        log.push({ type: 'info', message: 'Поворот вправо' });
        return Sk.builtin.none.none$;
      }
    };
  }

  private wrapCommand(command: GameCommand, log: GameLogEntry[]) {
    const entry = this.controller.enqueue(command);
    if (entry) {
      log.push(entry);
    }
    return Sk.builtin.none.none$;
  }
}

function evaluateTest(test: Level['tests'][number], snapshot: any, code: string): boolean {
  if (test.type === 'state') {
    return Object.entries(test.must_have).every(([key, expected]) => {
      const actual = (snapshot as any)[key];
      if (actual && typeof actual === 'object' && 'position' in actual) {
        return JSON.stringify(actual) === JSON.stringify(expected);
      }
      return JSON.stringify(actual) === JSON.stringify(expected);
    });
  }
  if (test.type === 'rule') {
    switch (test.name) {
      case 'no_collision':
        return snapshot.collisions === 0;
      case 'said_hi':
        return snapshot.events.some((event: string) => event.startsWith('say:'));
      case 'used_if':
        return /\bif\b/.test(code);
      case 'used_for':
        return /\bfor\b/.test(code);
      case 'loop_guard':
        return /break/.test(code) || /steps\s*<\s*\d+/.test(code);
      case 'used_def':
        return /\bdef\b/.test(code);
      case 'used_mix':
        return /\b(if|elif)\b/.test(code) && (/\bfor\b/.test(code) || /\bwhile\b/.test(code));
      default:
        return Boolean(test.value);
    }
  }
  return false;
}

function parseLine(errorText: string): number | null {
  const match = errorText.match(/on line (\d+)/);
  if (match) {
    return Number(match[1]);
  }
  const matchAlt = errorText.match(/line\s+(\d+)/);
  return matchAlt ? Number(matchAlt[1]) : null;
}
