import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { levels, Level } from '../src/data/levels';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const [, , command, providedPath] = process.argv;
  if (!command || !['export', 'import'].includes(command)) {
    console.log('Использование: tsx scripts/levels-cli.ts <export|import> [путь]');
    process.exit(1);
  }

  const targetPath = providedPath
    ? path.resolve(process.cwd(), providedPath)
    : path.resolve(__dirname, '../public/levels.json');

  if (command === 'export') {
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, JSON.stringify(levels, null, 2), 'utf8');
    console.log(`Экспортировано ${levels.length} уровней в ${targetPath}`);
    return;
  }

  if (command === 'import') {
    const file = await fs.readFile(targetPath, 'utf8');
    const parsed = JSON.parse(file) as Level[];
    validateLevels(parsed);
    const summary = parsed.map((lvl) => ({ id: lvl.id, goals: lvl.goals.length }));
    const summaryPath = path.resolve(__dirname, '../public/levels-import-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`Импортировано ${parsed.length} уровней из ${targetPath}`);
    console.log(`Краткое описание сохранено в ${summaryPath}`);
  }
}

function validateLevels(input: Level[]) {
  input.forEach((level) => {
    if (!level.id || !level.map || !Array.isArray(level.goals)) {
      throw new Error(`Неверная структура уровня: ${level.id}`);
    }
  });
}

main().catch((error) => {
  console.error('Ошибка скрипта уровней:', error);
  process.exit(1);
});
