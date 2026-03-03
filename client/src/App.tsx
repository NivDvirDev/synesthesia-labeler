import React, { Component } from 'react';
import { getClips, getClip, getStats, saveLabel, getMe, getConfig } from './api';
import ClipList from './components/ClipList';
import VideoPlayer from './components/VideoPlayer';
import LabelForm from './components/LabelForm';
import StatsPanel from './components/StatsPanel';
import RatingsTable from './components/RatingsTable';
import ProgressBar from './components/ProgressBar';
import LoginPage from './components/LoginPage';
import { ClipSummary, ClipDetail, ClipMode, Label, LabelData, Stats, User, AppConfig } from './types';

interface AppState {
  clips: ClipSummary[];
  selectedClipId: string | null;
  selectedClip: ClipDetail | null;
  mode: ClipMode;
  stats: Stats | null;
  saving: boolean;
  user: User | null;
  authChecked: boolean;
  appConfig: AppConfig | null;
  showRatings: boolean;
}

class App extends Component<{}, AppState> {
  state: AppState = {
    clips: [],
    selectedClipId: null,
    selectedClip: null,
    mode: 'unlabeled',
    stats: null,
    saving: false,
    user: null,
    authChecked: false,
    appConfig: null,
    showRatings: false,
  };

  componentDidMount() {
    this.checkAuth();
    this.loadConfig();
  }

  checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      this.setState({ authChecked: true });
      return;
    }
    getMe()
      .then((user) => {
        this.setState({ user, authChecked: true }, () => {
          this.loadClips();
          this.loadStats();
        });
      })
      .catch(() => {
        localStorage.removeItem('token');
        this.setState({ authChecked: true });
      });
  };

  loadConfig = () => {
    getConfig().then((appConfig) => this.setState({ appConfig })).catch(() => {});
  };

  handleLogin = (user: User, token: string) => {
    localStorage.setItem('token', token);
    this.setState({ user }, () => {
      this.loadClips();
      this.loadStats();
    });
  };

  handleLogout = () => {
    localStorage.removeItem('token');
    this.setState({
      user: null,
      clips: [],
      selectedClipId: null,
      selectedClip: null,
      stats: null,
    });
  };

  loadClips = () => {
    getClips(this.state.mode).then((clips) => {
      this.setState({ clips });
    });
  };

  loadStats = () => {
    getStats().then((stats) => this.setState({ stats }));
  };

  loadClip = (id: string) => {
    getClip(id).then((clip) => {
      this.setState({ selectedClipId: id, selectedClip: clip });
    });
  };

  handleModeChange = (mode: ClipMode) => {
    this.setState({ mode }, this.loadClips);
  };

  handleSelect = (id: string) => {
    this.loadClip(id);
  };

  handleSave = (clipId: string, labelData: LabelData) => {
    this.setState({ saving: true });
    saveLabel(clipId, labelData)
      .then(() => {
        this.setState({ saving: false });
        this.loadClips();
        this.loadStats();
        this.loadClip(clipId);
        this.goToNext();
      })
      .catch((err) => {
        this.setState({ saving: false });
        alert(err.message || 'Save failed');
      });
  };

  handleSkip = () => {
    this.goToNext();
  };

  goToNext = () => {
    const { clips, selectedClipId } = this.state;
    const idx = clips.findIndex((c) => c.id === selectedClipId);
    if (idx >= 0 && idx < clips.length - 1) {
      this.loadClip(clips[idx + 1].id);
    }
  };

  goToPrev = () => {
    const { clips, selectedClipId } = this.state;
    const idx = clips.findIndex((c) => c.id === selectedClipId);
    if (idx > 0) {
      this.loadClip(clips[idx - 1].id);
    }
  };

  handleRandom = () => {
    const { clips } = this.state;
    if (clips.length === 0) return;
    const clip = clips[Math.floor(Math.random() * clips.length)];
    this.loadClip(clip.id);
  };

  render() {
    const { clips, selectedClipId, selectedClip, mode, stats, saving, user, authChecked, appConfig, showRatings } = this.state;

    if (!authChecked) {
      return (
        <div className="app">
          <div className="empty-state"><p>Loading...</p></div>
        </div>
      );
    }

    if (!user) {
      return <LoginPage onLogin={this.handleLogin} googleClientId={appConfig?.googleClientId || null} />;
    }

    const myLabel: Label | undefined = selectedClip
      ? (selectedClip.labels || []).find((l) => l.username === user.username)
      : undefined;
    const autoLabel: Label | undefined = selectedClip
      ? (selectedClip.labels || []).find((l) => l.user_id == null)
      : undefined;
    const useHF = appConfig?.useHuggingFace || false;

    return (
      <div className="app">
        {stats && (
          <ProgressBar
            total={stats.total_clips}
            labeled={stats.labeled_human}
            remaining={stats.unlabeled}
          />
        )}

        <header className="app-header">
          <h1>Synesthesia</h1>
          {stats && <StatsPanel stats={stats} />}
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <button className="btn-logout" onClick={this.handleLogout}>Logout</button>
          </div>
        </header>

        <main className="app-main">
          <ClipList
            clips={clips}
            selectedClipId={selectedClipId}
            onSelect={this.handleSelect}
            mode={mode}
            onModeChange={this.handleModeChange}
            onRandom={this.handleRandom}
          />

          {selectedClip ? (
            <div className="labeling-layout">
              <div className="workspace-video">
                <VideoPlayer
                  clipId={selectedClip.id}
                  filename={selectedClip.filename}
                  metadata={selectedClip}
                  useHuggingFace={useHF}
                />
                <button
                  className="ratings-toggle"
                  onClick={() => this.setState({ showRatings: !showRatings })}
                >
                  {showRatings ? '\u25BE All Ratings' : '\u25B8 All Ratings'}
                  {selectedClip.labels && selectedClip.labels.length > 0 && (
                    <span className="ratings-toggle-count">
                      {selectedClip.labels.filter((l) => l.user_id != null).length}
                    </span>
                  )}
                </button>
                {showRatings && (
                  <RatingsTable
                    labels={selectedClip.labels || []}
                    currentUsername={user.username}
                  />
                )}
              </div>
              <div className="rating-panel">
                <LabelForm
                  clipId={selectedClip.id}
                  existingLabel={myLabel}
                  autoLabel={autoLabel}
                  onSave={this.handleSave}
                  onSkip={this.handleSkip}
                  onPrev={this.goToPrev}
                  onNext={this.goToNext}
                  saving={saving}
                />
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Select a clip to begin labeling.</p>
            </div>
          )}
        </main>
        <footer className="app-footer">Synesthesia Eval</footer>
      </div>
    );
  }
}

export default App;
