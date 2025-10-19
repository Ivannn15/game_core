import type { GameSnapshot } from '../game/types';

export type LevelTest =
  | { type: 'state'; at: 'end'; must_have: Partial<GameSnapshot> | Record<string, unknown> }
  | { type: 'rule'; name: string; value: boolean };

export interface Level {
  id: string;
  title: string;
  story: string;
  map: {
    rows: number;
    cols: number;
    tiles: string[];
    legend: Record<string, 'empty' | 'wall' | 'coin' | 'door' | 'key' | 'player' | 'enemy'>;
  };
  goals: string[];
  api: string[];
  teaching: string[];
  starter_code: string;
  tests: LevelTest[];
  hints: string[];
  solution: string;
  hero?: {
    stars: string[];
  };
}

const baseLegend: Level['map']['legend'] = {
  '.': 'empty',
  '#': 'wall',
  M: 'coin',
  P: 'player',
  D: 'door',
  K: 'key',
  E: 'enemy'
};

export const levels: Level[] = [
  {
    id: 'lvl-001-move-intro',
    title: 'Монета рядом',
    story: 'Герой проснулся и увидел монету. Дойди до неё простыми шагами.',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '..........',
        '..........',
        '..........',
        '...M......',
        '..........',
        '..P.......',
        '..........',
        '..........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Дойди до монеты', 'Собери монету'],
    api: ['move_right', 'move_left', 'move_up', 'move_down', 'pick', 'print'],
    teaching: ['движение', 'последовательность'],
    starter_code: `# Попробуй добраться до монеты!\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { collectedCoins: 1 } },
      { type: 'rule', name: 'no_collision', value: true }
    ],
    hints: [
      'Посмотри, где стоит герой и монета.',
      'Сначала поднимись вверх, затем шагни вправо.',
      'Не забудь команду pick() на клетке с монетой.',
      'Пример: move_up(); move_up(); move_right(); pick()'
    ],
    solution: `move_up()\nmove_up()\nmove_right()\npick()\n`,
    hero: { stars: ['без столкновений', 'быстро', 'без подсказок'] }
  },
  {
    id: 'lvl-002-maze',
    title: 'Извилистый коридор',
    story: 'Перед тобой короткий лабиринт. Пройди аккуратно, не врежься в стену.',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '########..',
        'P......#..',
        '.####..#..',
        '.#..M.#...',
        '.#..####..',
        '.#........',
        '.#########',
        '..........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Доберись до монеты', 'Избеги стен'],
    api: ['move_right', 'move_left', 'move_up', 'move_down', 'pick', 'print'],
    teaching: ['движение', 'ошибки'],
    starter_code: `# Пройди коридор до монеты\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { collectedCoins: 1 } },
      { type: 'rule', name: 'no_collision', value: true }
    ],
    hints: [
      'Посмотри на коридор: сначала двигайся вправо, пока не увидишь проход вниз.',
      'Когда появится свободная клетка снизу, спустись и поверни к монете.',
      'Сделай шаг влево, чтобы встать на монету, и вызови pick().',
      'Эталон: вправо ×5, вниз ×2, влево, pick()'
    ],
    solution: `move_right()\nmove_right()\nmove_right()\nmove_right()\nmove_right()\nmove_down()\nmove_down()\nmove_left()\npick()\n`
  },
  {
    id: 'lvl-003-variables',
    title: 'Шаги из коробочки',
    story: 'У героя есть число шагов в переменной. Дойди до монеты!',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '..........',
        '..#.......',
        '..........',
        '..#.......',
        '..#.......',
        '..P..M....',
        '..........',
        '..........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Собери монету', 'Не врезаться в стену'],
    api: ['move_right', 'move_left', 'move_up', 'move_down', 'pick', 'say', 'print'],
    teaching: ['переменные', 'целые числа'],
    starter_code: `steps = 3\n# Пройди steps шагов вправо\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { collectedCoins: 1 } },
      { type: 'rule', name: 'no_collision', value: true }
    ],
    hints: [
      'Переменная steps хранит число.',
      'Повтори шаг вправо steps раз.',
      'Можно использовать цикл или написать команды подряд.',
      'Пример решения: цикл for и команда pick()'
    ],
    solution: `steps = 3\nfor _ in range(steps):\n    move_right()\npick()\n`
  },
  {
    id: 'lvl-004-types',
    title: 'Привет, монета!',
    story: 'Научи героя здороваться и собирать монету.',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '..........',
        '..........',
        '....M.....',
        '..........',
        '...P......',
        '..........',
        '..........',
        '..........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Скажи «Привет»', 'Собери монету'],
    api: ['move_right', 'move_left', 'move_up', 'move_down', 'pick', 'say', 'print'],
    teaching: ['строки', 'print'],
    starter_code: `# Используй say("Привет") и команды движения\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { collectedCoins: 1 } },
      { type: 'rule', name: 'said_hi', value: true }
    ],
    hints: [
      'Команда say("Привет") покажет речь героя.',
      'Сделай шаг вправо и поднимись вверх два раза.',
      'Когда герой стоит на монете, вызови pick().',
      'Эталон: say("Привет"); move_right(); move_up() ×2; pick()'
    ],
    solution: `say("Привет")\nmove_right()\nmove_up()\nmove_up()\npick()\n`
  },
  {
    id: 'lvl-005-if',
    title: 'Поверни, если стена',
    story: 'В коридоре есть поворот. Реши, куда идти, если впереди стена.',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '#####.....',
        'P..#......',
        '#..#......',
        '#..#..M...',
        '#..#####..',
        '#.........',
        '#########.',
        '..........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Используй if', 'Собери монету'],
    api: [
      'move_right',
      'move_left',
      'move_up',
      'move_down',
      'pick',
      'say',
      'print',
      'is_wall_ahead'
    ],
    teaching: ['условия'],
    starter_code: `# Если перед героем стена, поверни.\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { collectedCoins: 1 } },
      { type: 'rule', name: 'used_if', value: true }
    ],
    hints: [
      'Сначала проверь is_wall_ahead().',
      'Если впереди стена, спустись на свободную дорожку.',
      'Дойди вправо до открытия и поднимись к монете.',
      'Эталон:\nmove_right()\nmove_right()\nif is_wall_ahead():\n    move_down()\n    move_down()\nmove_down()\nmove_down()\nfor _ in range(6):\n    move_right()\nmove_up()\nmove_up()\nmove_left()\nmove_left()\npick()'
    ],
    solution: `move_right()\nmove_right()\nif is_wall_ahead():\n    move_down()\n    move_down()\nmove_down()\nmove_down()\nmove_right()\nmove_right()\nmove_right()\nmove_right()\nmove_right()\nmove_right()\nmove_up()\nmove_up()\nmove_left()\nmove_left()\npick()\n`
  },
  {
    id: 'lvl-006-for-loop',
    title: 'Четыре шага вперёд',
    story: 'Коридор одинаковый. Повтори шаги с помощью цикла for.',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '..........',
        '..........',
        '..........',
        '..........',
        '..........',
        'P...M.....',
        '..........',
        '..........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Используй цикл for', 'Собери монету'],
    api: ['move_right', 'move_left', 'move_up', 'move_down', 'pick', 'print'],
    teaching: ['циклы for'],
    starter_code: `# Повтори движение четыре раза\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { collectedCoins: 1 } },
      { type: 'rule', name: 'used_for', value: true }
    ],
    hints: [
      'Цикл for i in range(4) повторит команду четыре раза.',
      'Внутри цикла двигайся вправо.',
      'После цикла подними монету.',
      'Эталон использует цикл for.'
    ],
    solution: `for _ in range(4):\n    move_right()\npick()\n`
  },
  {
    id: 'lvl-007-while-loop',
    title: 'До двери',
    story: 'Иди вперёд, пока не увидишь дверь. Не застревай!',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '..........',
        '..........',
        '..........',
        '..........',
        '..........',
        'P..K.D....',
        '..........',
        '..........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Используй while', 'Дойди до двери', 'Возьми ключ'],
    api: [
      'move_right',
      'move_left',
      'move_up',
      'move_down',
      'open',
      'pick',
      'print',
      'at_goal'
    ],
    teaching: ['циклы while'],
    starter_code: `# Иди пока не у двери. Не забудь про ограничение.\nsteps = 0\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { openedDoor: true, collectedCoins: 0 } },
      { type: 'rule', name: 'loop_guard', value: true }
    ],
    hints: [
      'Проверяй at_goal() внутри while.',
      'Добавь счётчик steps, чтобы остановиться.',
      'Иди вправо, пока справа не появится ключ, возьми его и открой дверь.',
      'Эталон:\nwhile not see_item("right") and steps < 12:\n    move_right()\n    steps += 1\nmove_right()\npick()\nwhile not at_goal() and steps < 24:\n    move_right()\n    steps += 1\nopen()'
    ],
    solution: `steps = 0\nwhile not see_item("right") and steps < 12:\n    move_right()\n    steps += 1\nmove_right()\nsteps += 1\npick()\nwhile not at_goal() and steps < 24:\n    move_right()\n    steps += 1\nopen()\n`
  },
  {
    id: 'lvl-008-functions',
    title: 'Танец лестницы',
    story: 'Создай функцию, которая делает шаг вверх и вправо. Повтори её.',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '..........',
        '..........',
        '..........',
        '..........',
        '....M.....',
        '..........',
        '..........',
        'P.........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Создай функцию', 'Используй функцию несколько раз', 'Собери монету'],
    api: ['move_right', 'move_left', 'move_up', 'move_down', 'pick'],
    teaching: ['функции'],
    starter_code: `# Создай функцию шаг-вверх-вправо и вызови её\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { collectedCoins: 1 } },
      { type: 'rule', name: 'used_def', value: true }
    ],
    hints: [
      'Напиши функцию с def.',
      'Внутри вызови move_right() и move_up().',
      'Повтори вызов несколько раз и возьми монету.',
      'Эталон:\ndef step_up_right():\n    move_right()\n    move_up()\nstep_up_right(); step_up_right(); step_up_right(); move_right(); pick()'
    ],
    solution: `def step_up_right():\n    move_right()\n    move_up()\n\nstep_up_right()\nstep_up_right()\nstep_up_right()\nmove_right()\npick()\n`
  },
  {
    id: 'lvl-009-combo',
    title: 'Три монеты и дверь',
    story: 'Используй переменные, циклы и условия, чтобы собрать монеты и открыть дверь.',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '..........',
        'P.M.M.MKD.',
        '..........',
        '..........',
        '..........',
        '..........',
        '..........',
        '..........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Собери три монеты', 'Возьми ключ и открой дверь'],
    api: [
      'move_right',
      'move_left',
      'move_up',
      'move_down',
      'pick',
      'open',
      'is_wall_ahead',
      'print',
      'say'
    ],
    teaching: ['переменные', 'циклы', 'условия'],
    starter_code: `# Собери монеты и открой дверь\ncoins = 0\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { collectedCoins: 3, openedDoor: true } },
      { type: 'rule', name: 'used_mix', value: true }
    ],
    hints: [
      'Следи за количеством монет в переменной.',
      'Используй цикл и условие, чтобы реагировать на разные шаги пути.',
      'Не забудь взять ключ перед дверью и вызвать open().',
      'Эталон:\ncoins = 0\nsteps = ["right", "right", "pick", ... , "open"]\nfor action in steps: если right — move_right(), если pick — pick() и увеличить счётчик, если open — open()'
    ],
    solution: `coins = 0\nsteps = ["right", "right", "pick", "right", "right", "pick", "right", "right", "pick", "right", "pick", "right", "open"]\nfor action in steps:\n    if action == "right":\n        move_right()\n    elif action == "pick":\n        pick()\n        if coins < 3:\n            coins += 1\n    elif action == "open":\n        open()\n`
  },
  {
    id: 'lvl-010-debug',
    title: 'Отладка ошибки',
    story: 'В коде героя спрятана ошибка. Найди её и исправь, опираясь на подсказки.',
    map: {
      rows: 10,
      cols: 10,
      tiles: [
        '..........',
        '..M.......',
        '..........',
        '..........',
        '..........',
        '..PK.D....',
        '..........',
        '..........',
        '..........',
        '..........'
      ],
      legend: baseLegend
    },
    goals: ['Исправь ошибку', 'Собери монету', 'Открой дверь'],
    api: ['move_right', 'move_left', 'move_up', 'move_down', 'pick', 'open', 'print'],
    teaching: ['отладка'],
    starter_code: `# Исправь: герой не доходит до двери\nmove_right()\nmove_up()\nmove_up()\npick()\nmove_right()\nmove_right()\nopen()\n`,
    tests: [
      { type: 'state', at: 'end', must_have: { collectedCoins: 1, openedDoor: true } },
      { type: 'rule', name: 'no_collision', value: true }
    ],
    hints: [
      'Сравни путь героя и карту.',
      'Стена закрывает путь: нужно обойти вниз.',
      'Не забудь взять ключ перед дверью.',
      'Эталон:\nmove_up() ×4, pick(), затем четыре шага вниз, move_right(), pick(), ещё два шага вправо и open()'
    ],
    solution: `move_up()\nmove_up()\nmove_up()\nmove_up()\npick()\nmove_down()\nmove_down()\nmove_down()\nmove_down()\nmove_right()\npick()\nmove_right()\nmove_right()\nopen()\n`
  }
];
