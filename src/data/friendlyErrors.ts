import { RunnerFriendlyError } from '../game/types';

export const friendlyErrors: RunnerFriendlyError[] = [
  { match: /SyntaxError: bad input/, message: 'Ой! Кажется, пропущен символ. Проверь скобки и двоеточия.' },
  { match: /SyntaxError: invalid syntax/, message: 'Похоже, где-то лишний или забытый знак. Подсказка: посмотри на строку ошибки.' },
  { match: /NameError: name '(.*)' is not defined/, message: 'Неизвестная команда. Может быть, имелось в виду move_right()?' },
  { match: /IndentationError/, message: 'Отступы должны быть ровными. Проверь пробелы перед командами.' },
  { match: /TypeError: '(.*)' object is not callable/, message: 'Команда записана как переменная? Добавь круглые скобки.' },
  { match: /TypeError: can't assign to function call/, message: 'Нельзя записывать значение прямо в команду. Создай переменную слева от =.' },
  { match: /IndexError/, message: 'Список пуст или индекс слишком большой. Проверь числа в квадратных скобках.' },
  { match: /KeyError/, message: 'Такого ключа нет. Подсказка: проверь имя в словаре.' },
  { match: /ZeroDivisionError/, message: 'На ноль делить нельзя. Подумай, что положить в знаменатель.' },
  { match: /AttributeError/, message: 'Такой команды у объекта нет. Подсказка: посмотри на список доступных действий.' },
  { match: /timeout/, message: 'Похоже, цикл слишком долгий. Подсказка: добавь условие выхода или счётчик.' },
  { match: /SystemError|RuntimeError/, message: 'Исполнение остановилось. Попробуй перезапустить уровень.' },
  { match: /TypeError: unsupported operand type/, message: 'Команды пытаются сложить несочетаемые вещи. Проверь типы данных.' },
  { match: /ValueError/, message: 'Значение не подошло. Подсказка: проверь текст или число, которое передаётся в функцию.' },
  { match: /RecursionError/, message: 'Функция вызывает саму себя без остановки. Добавь условие выхода.' },
  { match: /MemoryError/, message: 'Слишком много данных. Подумай, как сократить повторения.' },
  { match: /StopIteration/, message: 'Цикл закончился неожиданно. Проверь, что ты перебираешь.' },
  { match: /UnboundLocalError/, message: 'Переменная используется до присваивания. Сначала заполни её значением.' },
  { match: /AssertionError/, message: 'Проверка не прошла. Подсказка: распечатай значение через print().' },
  { match: /TypeError/, message: 'Что-то не так с типами. Проверь, что складываешь числа с числами, а строки со строками.' }
];
