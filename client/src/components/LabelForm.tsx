import React, { Component } from 'react';
import { Dimension, DimensionKey, Label, LabelData, RatingValue } from '../types';

const DOT_COLORS = ['#ff4444', '#ff8c3c', '#ffd43c', '#8cff3c', '#3cff6e'];

const DIMENSIONS: (Dimension & { icon: string })[] = [
  {
    key: 'sync_quality',
    label: 'Sync Quality',
    icon: '\u{1F3B5}',
    descriptions: {
      1: 'No sync at all',
      2: 'Occasional sync',
      3: 'Moderate sync',
      4: 'Good sync',
      5: 'Perfect sync',
    },
  },
  {
    key: 'aesthetic_quality',
    label: 'Aesthetic Quality',
    icon: '\u2728',
    descriptions: {
      1: 'Unappealing',
      2: 'Below average',
      3: 'Average',
      4: 'Visually appealing',
      5: 'Stunning',
    },
  },
  {
    key: 'visual_audio_alignment',
    label: 'Visual-Audio Alignment',
    icon: '\u{1F517}',
    descriptions: {
      1: 'Completely mismatched',
      2: 'Poorly aligned',
      3: 'Somewhat aligned',
      4: 'Well aligned',
      5: 'Perfect alignment',
    },
  },
  {
    key: 'motion_smoothness',
    label: 'Motion Smoothness',
    icon: '\u{1F30A}',
    descriptions: {
      1: 'Very choppy',
      2: 'Somewhat choppy',
      3: 'Acceptable',
      4: 'Smooth',
      5: 'Perfectly fluid',
    },
  },
];

interface LabelFormProps {
  clipId: string;
  existingLabel?: Label;
  autoLabel?: Label;
  onSave: (clipId: string, data: LabelData) => void;
  onSkip: () => void;
  onPrev: () => void;
  onNext: () => void;
  saving: boolean;
}

interface LabelFormState {
  sync_quality: number | null;
  visual_audio_alignment: number | null;
  aesthetic_quality: number | null;
  motion_smoothness: number | null;
  notes: string;
  showNotes: boolean;
  activeDimension: number;
  justRated: string | null;
  hoveredDot: { dim: string; val: number } | null;
}

class LabelForm extends Component<LabelFormProps, LabelFormState> {
  private animTimer: ReturnType<typeof setTimeout> | null = null;
  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: LabelFormProps) {
    super(props);
    this.state = this.getInitialState(props);
  }

  getInitialState(props: LabelFormProps): LabelFormState {
    const label = props.existingLabel;
    if (label) {
      return {
        sync_quality: label.sync_quality ?? null,
        visual_audio_alignment: label.visual_audio_alignment ?? null,
        aesthetic_quality: label.aesthetic_quality ?? null,
        motion_smoothness: label.motion_smoothness ?? null,
        notes: label.notes || '',
        showNotes: !!label.notes,
        activeDimension: 0,
        justRated: null,
        hoveredDot: null,
      };
    }
    return {
      sync_quality: null,
      visual_audio_alignment: null,
      aesthetic_quality: null,
      motion_smoothness: null,
      notes: '',
      showNotes: false,
      activeDimension: 0,
      justRated: null,
      hoveredDot: null,
    };
  }

  componentDidUpdate(prevProps: LabelFormProps, prevState: LabelFormState) {
    if (prevProps.clipId !== this.props.clipId) {
      if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
      this.setState(this.getInitialState(this.props));
      return;
    }

    const prevComplete = DIMENSIONS.every((d) => prevState[d.key] != null);
    const nowComplete = this.isComplete();
    if (!prevComplete && nowComplete && this.state.justRated && !this.props.saving) {
      if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => this.handleSave(), 800);
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.animTimer) clearTimeout(this.animTimer);
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;

    const key = e.key;

    if (key >= '1' && key <= '5') {
      e.preventDefault();
      const dim = DIMENSIONS[this.state.activeDimension];
      this.handleRatingChange(dim.key, parseInt(key, 10) as RatingValue);
    } else if (key === 'Tab') {
      e.preventDefault();
      this.setState((s) => ({
        activeDimension: (s.activeDimension + 1) % DIMENSIONS.length,
      }));
    } else if (key === 'Enter') {
      e.preventDefault();
      if (this.isComplete()) this.handleSave();
    } else if (key === 'n') {
      e.preventDefault();
      this.props.onNext();
    } else if (key === 'p') {
      e.preventDefault();
      this.props.onPrev();
    } else if (key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      this.handleSave();
    }
  };

  handleRatingChange = (dimKey: DimensionKey, value: RatingValue) => {
    if (this.animTimer) clearTimeout(this.animTimer);

    this.setState({ [dimKey]: value, justRated: dimKey } as unknown as Pick<LabelFormState, DimensionKey>);

    this.animTimer = setTimeout(() => {
      this.setState({ justRated: null });
    }, 500);

    const idx = DIMENSIONS.findIndex((d) => d.key === dimKey);
    this.setState((prevState) => {
      const updated = { ...prevState, [dimKey]: value };
      for (let i = 1; i <= DIMENSIONS.length; i++) {
        const nextIdx = (idx + i) % DIMENSIONS.length;
        const nextDim = DIMENSIONS[nextIdx];
        if (updated[nextDim.key] == null) {
          return { activeDimension: nextIdx } as Pick<LabelFormState, 'activeDimension'>;
        }
      }
      return { activeDimension: idx } as Pick<LabelFormState, 'activeDimension'>;
    });
  };

  handleSave = () => {
    const { clipId, onSave } = this.props;
    const { sync_quality, visual_audio_alignment, aesthetic_quality, motion_smoothness, notes } = this.state;
    onSave(clipId, { sync_quality, visual_audio_alignment, aesthetic_quality, motion_smoothness, notes });
  };

  isComplete(): boolean {
    return DIMENSIONS.every((d) => this.state[d.key] != null);
  }

  ratedCount(): number {
    return DIMENSIONS.filter((d) => this.state[d.key] != null).length;
  }

  render() {
    const { autoLabel, onSkip, saving } = this.props;
    const { showNotes, activeDimension, justRated, hoveredDot } = this.state;
    const complete = this.isComplete();
    const rated = this.ratedCount();

    return (
      <div className={'label-form glass-panel' + (complete ? ' label-form-complete' : '')}>
        <div className="label-form-header">
          <span className="label-form-title">Rate This Clip</span>
          <span className="label-form-progress">
            {complete ? (
              <span className="label-form-check">{'\u2713'}</span>
            ) : (
              <span className="label-form-counter">{rated}/4</span>
            )}
          </span>
        </div>

        <div className="rating-dimensions">
          {DIMENSIONS.map((dim, i) => {
            const currentValue = this.state[dim.key] as number | null;
            const isActive = activeDimension === i;
            const wasJustRated = justRated === dim.key;
            const autoValue = autoLabel ? (autoLabel[dim.key] as number | null) : null;

            return (
              <div
                key={dim.key}
                className={
                  'rating-row' +
                  (isActive ? ' active' : '') +
                  (wasJustRated ? ' just-rated' : '') +
                  (currentValue != null ? ' rated' : '')
                }
                onClick={() => this.setState({ activeDimension: i })}
              >
                <div className="rating-row-left">
                  <span className="rating-row-icon">{dim.icon}</span>
                  <span className="rating-row-label">{dim.label}</span>
                </div>
                <div className="rating-row-dots">
                  {([1, 2, 3, 4, 5] as RatingValue[]).map((val) => {
                    const isHovered = hoveredDot?.dim === dim.key && hoveredDot?.val === val;
                    return (
                      <div key={val} className="rating-dot-wrapper">
                        <button
                          className={
                            'rating-dot' +
                            (currentValue === val ? ' selected pulse' : '') +
                            (currentValue != null && currentValue >= val ? ' filled' : '')
                          }
                          style={
                            {
                              '--dot-color': DOT_COLORS[val - 1],
                            } as React.CSSProperties
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            this.handleRatingChange(dim.key, val);
                          }}
                          onMouseEnter={() => this.setState({ hoveredDot: { dim: dim.key, val } })}
                          onMouseLeave={() => this.setState({ hoveredDot: null })}
                        >
                          <span className="rating-dot-inner" />
                        </button>
                        {isHovered && (
                          <span className="rating-tooltip">
                            {val} &mdash; {dim.descriptions[val]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {autoValue != null && (
                  <span className="rating-row-auto" title={`AI rated: ${autoValue}/5`}>
                    {autoValue}
                  </span>
                )}
                {currentValue != null && (
                  <span className="rating-row-value">{currentValue}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="label-form-actions">
          <button
            className={'btn btn-save' + (complete ? ' ready' : '')}
            onClick={this.handleSave}
            disabled={!complete || saving}
          >
            {saving ? 'Saving...' : complete ? 'Save \u2713' : 'Save'}
          </button>
          <button className="btn btn-skip" onClick={onSkip}>
            Skip
          </button>
          <button className="btn btn-nav" onClick={this.props.onPrev}>
            {'\u2039'}
          </button>
          <button className="btn btn-nav" onClick={this.props.onNext}>
            {'\u203A'}
          </button>
        </div>

        <div className="label-form-extras">
          <button
            className="notes-toggle"
            onClick={() => this.setState({ showNotes: !showNotes })}
          >
            {showNotes ? '\u25BE Notes' : '\u25B8 Notes'}
          </button>
          {showNotes && (
            <textarea
              className="notes-input"
              value={this.state.notes}
              onChange={(e) => this.setState({ notes: e.target.value })}
              placeholder="Optional notes..."
              rows={2}
            />
          )}
        </div>

        <div className="keyboard-hint">
          1-5 rate &middot; Tab cycle &middot; Enter save &middot; n/p nav &middot; {'\u2318'}S save
        </div>
      </div>
    );
  }
}

export default LabelForm;
