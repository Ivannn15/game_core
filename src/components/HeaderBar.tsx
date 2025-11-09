import './HeaderBar.scss';
import { uiText } from '../data/strings';

interface HeaderBarProps {
  currentLevelTitle: string;
  levelNumber: number;
  totalLevels: number;
}

export function HeaderBar({ currentLevelTitle, levelNumber, totalLevels }: HeaderBarProps) {
  return (
    <header className="header-bar">
      <div className="brand">
        <span className="brand__label">{uiText.brandName}</span>
        <h1>{uiText.brandTagline}</h1>
        <p>{uiText.brandDescription}</p>
      </div>
      <div className="progress">
        <p className="progress__grades">{uiText.gradeBadge}</p>
        <p className="progress__current">
          {uiText.currentLevelLabel} {levelNumber} / {totalLevels}
        </p>
        <p className="progress__title">{currentLevelTitle}</p>
      </div>
    </header>
  );
}
