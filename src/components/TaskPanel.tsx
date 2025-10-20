import { Level } from '../data/levels';
import { uiText } from '../data/strings';
import './TaskPanel.scss';

interface Props {
  level: Level;
  hints: string[];
  onHintClick: () => void;
  onToggleTests: () => void;
  showTests: boolean;
  goalStates?: boolean[];
}

export function TaskPanel({ level, hints, onHintClick, onToggleTests, showTests, goalStates }: Props) {
  return (
    <div className="task-panel">
      <header>
        <h1>{level.title}</h1>
        <p>{level.story}</p>
      </header>
      <section className="task">
        <h2>{uiText.taskTitle}</h2>
        <p>{level.task.instruction}</p>
        <div className="task-example">
          <h3>{uiText.taskExampleTitle}</h3>
          <pre>
            <code>{level.task.example}</code>
          </pre>
        </div>
        <div className="task-explanation">
          <h3>{uiText.taskConceptTitle}</h3>
          <p>{level.task.explanation}</p>
        </div>
      </section>
      <section>
        <h3>{uiText.goalsTitle}</h3>
        <ul>
          {level.goals.map((goal, idx) => (
            <li key={goal}>
              <label>
                <input
                  type="checkbox"
                  disabled
                  checked={goalStates ? goalStates[idx] ?? false : false}
                />
                <span>{goal}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section className="hints">
        <button type="button" onClick={onHintClick}>
          {uiText.hintButton}
        </button>
        <ul>
          {hints.map((hint, index) => (
            <li key={index}>{hint}</li>
          ))}
        </ul>
      </section>
      <section className="tests">
        <h3>{uiText.testsTitle}</h3>
        <button type="button" onClick={onToggleTests}>
          {showTests ? uiText.hideTests : uiText.showTests}
        </button>
        {showTests && (
          <ul>
            {level.tests.map((test, index) => (
              <li key={index}>{renderTestDescription(test)}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function renderTestDescription(test: Level['tests'][number]) {
  switch (test.type) {
    case 'state':
      return `Состояние: ${test.must_have ? JSON.stringify(test.must_have) : ''}`;
    case 'rule':
      return `Правило: ${describeRule(test.name)}`;
    default:
      return 'Проверка';
  }
}

function describeRule(name: string) {
  const dictionary: Record<string, string> = {
    no_collision: 'без столкновений',
    said_hi: 'герой поздоровался',
    used_if: 'использован if',
    used_for: 'использован цикл for',
    loop_guard: 'у цикла есть ограничение',
    used_def: 'создана функция',
    used_mix: 'есть условие и цикл'
  };
  return dictionary[name] ?? name;
}
