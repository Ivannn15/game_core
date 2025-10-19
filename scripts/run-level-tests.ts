import { createGameController } from '../src/game/controller';
import { PythonRunner } from '../src/game/pythonRunner';
import { friendlyErrors } from '../src/data/friendlyErrors';
import { levels } from '../src/data/levels';

async function main() {
  const controller = createGameController();
  const runner = new PythonRunner(controller, friendlyErrors);
  let passed = 0;

  for (const level of levels) {
    controller.loadLevel(level);
    runner.setLevel(level);
    const result = await runner.run(level.solution);
    if (!result.success) {
      console.error(`❌ ${level.id} не прошёл тесты: ${result.message ?? 'ошибка'}`);
      console.error('Лог выполнения:', result.log.map((entry) => `${entry.type}: ${entry.message}`).join('\n'));
      process.exitCode = 1;
      return;
    }
    passed += 1;
    console.log(`✅ ${level.id} пройден`);
  }

  console.log(`Все уровни (${passed}) успешно проходят эталонные решения.`);
}

main().catch((error) => {
  console.error('Сбой автотеста уровней:', error);
  process.exitCode = 1;
});
