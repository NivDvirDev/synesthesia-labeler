import React from 'react';
import { ClipSummary, ClipMode } from '../types';

interface ClipListProps {
  clips: ClipSummary[];
  selectedClipId: string | null;
  onSelect: (id: string) => void;
  mode: ClipMode;
  onModeChange: (mode: ClipMode) => void;
  onRandom: () => void;
}

const MODES: { key: ClipMode; label: string }[] = [
  { key: 'unlabeled', label: 'Unlabeled' },
  { key: 'all', label: 'All' },
  { key: 'labeled', label: 'Review' },
];

const ClipList: React.FC<ClipListProps> = ({
  clips,
  selectedClipId,
  onSelect,
  mode,
  onModeChange,
  onRandom,
}) => {
  const currentIdx = selectedClipId
    ? clips.findIndex((c) => c.id === selectedClipId)
    : -1;
  const currentClip = currentIdx >= 0 ? clips[currentIdx] : null;

  const goPrev = () => {
    if (currentIdx > 0) onSelect(clips[currentIdx - 1].id);
  };

  const goNext = () => {
    if (currentIdx >= 0 && currentIdx < clips.length - 1) onSelect(clips[currentIdx + 1].id);
  };

  return (
    <nav className="clip-nav">
      <div className="clip-nav-modes">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={'mode-btn' + (mode === m.key ? ' active' : '')}
            onClick={() => onModeChange(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="clip-nav-position">
        <button
          className="clip-nav-arrow"
          onClick={goPrev}
          disabled={currentIdx <= 0}
        >
          {'\u2039'}
        </button>
        <span className="clip-nav-counter">
          {currentIdx >= 0 ? currentIdx + 1 : '\u2014'} / {clips.length}
        </span>
        <button
          className="clip-nav-arrow"
          onClick={goNext}
          disabled={currentIdx < 0 || currentIdx >= clips.length - 1}
        >
          {'\u203A'}
        </button>
      </div>

      {currentClip && (
        <span className="clip-nav-name" title={currentClip.filename}>
          #{currentClip.id}
          {currentClip.description ? ` \u2014 ${currentClip.description}` : ''}
        </span>
      )}

      <button className="clip-nav-random" onClick={onRandom} title="Random clip">
        {'\u21BB'}
      </button>
    </nav>
  );
};

export default ClipList;
