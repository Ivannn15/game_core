import { useEffect, useRef } from 'react';
import { uiText } from '../data/strings';
import { GameController } from '../game/controller';
import { GameResult } from '../game/types';
import './GameStage.scss';

interface Props {
  controller: GameController;
  isRunning: boolean;
  result: GameResult | null;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function GameStage({ controller, isRunning, result, onRun, onStop, onReset }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      controller.render(ctx, canvas.width, canvas.height);
      requestAnimationFrame(draw);
    };
    draw();
  }, [controller]);

  return (
    <div className="game-stage">
      <canvas ref={canvasRef} width={480} height={480} aria-label="Поле игры" />
      <div className="controls">
        <button type="button" onClick={onRun} disabled={isRunning}>
          {uiText.runButton}
        </button>
        <button type="button" onClick={onStop} disabled={!isRunning}>
          {uiText.stopButton}
        </button>
        <button type="button" onClick={onReset}>
          {uiText.resetButton}
        </button>
      </div>
      {result && (
        <div className={`result ${result.success ? 'success' : 'fail'}`}>
          {result.success
            ? uiText.runSummarySuccess
            : `${uiText.runSummaryFailPrefix} ${result.message ?? ''}`}
        </div>
      )}
    </div>
  );
}
