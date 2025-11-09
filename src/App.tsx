import { useEffect, useMemo, useState } from 'react';
import { levels } from './data/levels';
import { friendlyErrors } from './data/friendlyErrors';
import { LevelList } from './components/LevelList';
import { TaskPanel } from './components/TaskPanel';
import { GameStage } from './components/GameStage';
import { CodeWorkspace } from './components/CodeWorkspace';
import { createGameController } from './game/controller';
import { PythonRunner } from './game/pythonRunner';
import { GameLogEntry, GameResult } from './game/types';
import { useInterval } from './hooks/useInterval';
import './styles/app.scss';
import { HeaderBar } from './components/HeaderBar';

const controller = createGameController();
const runner = new PythonRunner(controller, friendlyErrors);

export default function App() {
  const [selectedLevelId, setSelectedLevelId] = useState(levels[0].id);
  const [log, setLog] = useState<GameLogEntry[]>([]);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const [showTests, setShowTests] = useState(false);
  const [code, setCode] = useState(levels[0].starter_code);

  const level = useMemo(() => levels.find((l) => l.id === selectedLevelId) ?? levels[0], [selectedLevelId]);
  const levelNumber = useMemo(
    () => levels.findIndex((item) => item.id === level.id) + 1,
    [level.id]
  );

  useEffect(() => {
    controller.loadLevel(level);
    controller.reset();
    runner.setLevel(level);
    setLog([]);
    setGameResult(null);
    setHintStep(0);
    setCode(level.starter_code);
  }, [level]);

  useInterval(() => {
    controller.tick();
  }, 16);

  const runWithCode = async (codeToRun: string) => {
    setLog([]);
    setGameResult(null);
    setIsRunning(true);
    const result = await runner.run(codeToRun);
    setLog(result.log);
    setGameResult(result);
    setIsRunning(false);
    return result;
  };

  const handleExecute = (codeToRun: string) => {
    setCode(codeToRun);
    return runWithCode(codeToRun);
  };

  const handleCheck = () => runWithCode(code);

  const handleStop = () => {
    runner.stop();
    controller.stop();
    setIsRunning(false);
  };

  const handleReset = () => {
    runner.stop();
    controller.reset();
    setLog([]);
    setGameResult(null);
    setHintStep(0);
  };

  const nextHint = () => {
    setHintStep((prev) => Math.min(prev + 1, level.hints.length));
  };

  const displayedHints = level.hints.slice(0, hintStep);

  return (
    <div className="page">
      <HeaderBar currentLevelTitle={level.title} levelNumber={levelNumber} totalLevels={levels.length} />
      <div className="app">
        <aside className="sidebar">
          <LevelList levels={levels} current={selectedLevelId} onSelect={setSelectedLevelId} />
          <TaskPanel
            level={level}
            hints={displayedHints}
            onHintClick={nextHint}
            onToggleTests={() => setShowTests((prev) => !prev)}
            showTests={showTests}
            goalStates={gameResult?.goalsCompleted}
          />
        </aside>
        <section className="workspace">
          <CodeWorkspace
            level={level}
            log={log}
            code={code}
            onCodeChange={setCode}
            onRun={handleExecute}
            onCheck={handleCheck}
            isRunning={isRunning}
            gameResult={gameResult}
          />
        </section>
        <main className="main">
          <GameStage
            controller={controller}
            isRunning={isRunning}
            result={gameResult}
            onRun={() => runWithCode(code)}
            onStop={handleStop}
            onReset={handleReset}
          />
        </main>
      </div>
    </div>
  );
}
