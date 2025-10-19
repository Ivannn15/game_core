import './LevelList.scss';
import { Level } from '../data/levels';
import { uiText } from '../data/strings';

interface Props {
  levels: Level[];
  current: string;
  onSelect: (id: string) => void;
}

export function LevelList({ levels, current, onSelect }: Props) {
  return (
    <div className="level-list">
      <h2>{uiText.levelListTitle}</h2>
      <ol>
        {levels.map((level) => (
          <li key={level.id} className={level.id === current ? 'active' : ''}>
            <button type="button" onClick={() => onSelect(level.id)}>
              {level.title}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
