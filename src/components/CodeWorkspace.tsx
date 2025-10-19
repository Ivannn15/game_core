import { useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Level } from '../data/levels';
import { uiText } from '../data/strings';
import { GameLogEntry, GameResult } from '../game/types';
import './CodeWorkspace.scss';

interface Props {
  level: Level;
  log: GameLogEntry[];
  code: string;
  onCodeChange: (value: string) => void;
  onRun: (code: string) => void;
  onCheck: () => void;
  isRunning: boolean;
  gameResult: GameResult | null;
}

export function CodeWorkspace({ level, log, code, onCodeChange, onRun, onCheck, isRunning, gameResult }: Props) {
  useEffect(() => {
    onCodeChange(level.starter_code);
  }, [level, onCodeChange]);

  const extensions = useMemo(() => [python()], []);

  return (
    <div className="code-workspace">
      <div className="editor">
        <CodeMirror
          value={code}
          height="360px"
          extensions={extensions}
          onChange={(value) => onCodeChange(value)}
          theme="dark"
          basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
        />
      </div>
      <div className="editor-controls">
        <button type="button" onClick={onCheck} disabled={isRunning}>
          {uiText.checkButton}
        </button>
        <button type="button" onClick={() => onRun(code)} disabled={isRunning}>
          {uiText.runButton}
        </button>
      </div>
      <div className="console" aria-live="polite">
        <h3>{uiText.consoleTitle}</h3>
        <ul>
          {log.map((entry, index) => (
            <li key={index} className={entry.type}>
              <span className="line">{entry.line != null ? `стр. ${entry.line}: ` : ''}</span>
              <span>{entry.message}</span>
            </li>
          ))}
        </ul>
        {gameResult && (
          <div className={`summary ${gameResult.success ? 'success' : 'fail'}`}>
            {gameResult.success ? uiText.successMessage : gameResult.message ?? uiText.tryAgain}
          </div>
        )}
      </div>
    </div>
  );
}
