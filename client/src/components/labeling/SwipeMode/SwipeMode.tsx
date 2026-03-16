import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SwipeCard from '../SwipeCard/SwipeCard';
import SwipeGuestPrompt from '../SwipeGuestPrompt/SwipeGuestPrompt';
import { saveSwipeLabel } from '../../../api';
import './SwipeMode.css';

interface ClipItem {
  id: string;
  filename: string;
  video_url?: string;
}

interface SwipeUser {
  id: number;
  username: string;
  token: string;
}

const SwipeMode: React.FC = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState<SwipeUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [guestSwipeCount, setGuestSwipeCount] = useState(0);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [swipedCount, setSwipedCount] = useState(0);
  const [muted, setMuted] = useState(false);

  // Check auth and load clips on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    if (token && username) {
      setUser({ id: Number(userId), username, token });
    }
    setAuthChecked(true);

    // Load clips from API
    const apiBase = '/api';
    const url = `${apiBase}/clips?mode=unlabeled&limit=50`;
    fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then(r => r.json())
      .then((data: ClipItem[]) => {
        // Shuffle for variety
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setClips(shuffled);
        setLoading(false);
      })
      .catch(() => {
        // Fall back to all clips
        fetch(`${apiBase}/clips`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
          .then(r => r.json())
          .then((data: ClipItem[]) => {
            setClips([...data].sort(() => Math.random() - 0.5));
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  const handleCommit = useCallback(async (score: number) => {
    const clip = clips[currentIndex];
    if (!clip) return;

    // Guest mode: only allow 3 free swipes
    if (!user) {
      if (guestSwipeCount >= 3) {
        setShowGuestPrompt(true);
        return;
      }
      setGuestSwipeCount(c => c + 1);
      // Try to save (will likely 401), ignore error
      saveSwipeLabel(clip.id, score, null).catch(() => {});
    } else {
      setSaving(true);
      try {
        await saveSwipeLabel(clip.id, score, user.token);
      } catch (e) {
        console.error('Save failed:', e);
      }
      setSaving(false);
    }

    setSwipedCount(c => c + 1);
    setCurrentIndex(i => i + 1);
  }, [clips, currentIndex, user, guestSwipeCount]);

  const currentClip = clips[currentIndex];

  // Build video URL — match pattern from VideoPlayer component
  const getVideoUrl = (clip: ClipItem): string => {
    if (clip.video_url) return clip.video_url;
    return `/videos/${clip.filename}`;
  };

  if (loading) {
    return (
      <div className="swipe-mode swipe-mode--loading">
        <div className="swipe-loading-spinner">🌀</div>
        <p>Loading clips…</p>
      </div>
    );
  }

  if (!currentClip || currentIndex >= clips.length) {
    return (
      <div className="swipe-mode swipe-mode--done">
        <div className="swipe-done-icon">🎉</div>
        <h2>All caught up!</h2>
        <p>You've swiped through {swipedCount} clips{user ? ' — scores saved to your profile.' : '.'}</p>
        {!user && (
          <button className="swipe-done-cta" onClick={() => navigate('/app')}>
            Sign up to see your rank
          </button>
        )}
        <button className="swipe-done-secondary" onClick={() => setCurrentIndex(0)}>
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="swipe-mode">
      <header className="swipe-header">
        <div className="swipe-header-brand">
          <span className="swipe-header-flame">🔥</span>
          <span className="swipe-header-title">Quick Rate</span>
        </div>
        <div className="swipe-header-actions">
          {user ? (
            <span className="swipe-header-user">@{user.username}</span>
          ) : (
            <button className="swipe-header-signin" onClick={() => navigate('/app')}>
              Sign in to save
            </button>
          )}
          <button className="swipe-header-detail" onClick={() => navigate('/app')}>
            Detail Mode →
          </button>
        </div>
      </header>

      <div className="swipe-arena">
        <div className="swipe-hint swipe-hint--left">👎</div>
        <SwipeCard
          key={currentClip.id}
          clip={{ id: currentClip.id, videoUrl: getVideoUrl(currentClip) }}
          onCommit={handleCommit}
          disabled={saving}
          muted={muted}
          onMuteToggle={() => setMuted(m => !m)}
        />
        <div className="swipe-hint swipe-hint--right">👍</div>
      </div>

      <div className="swipe-footer">
        <div className="swipe-footer-instructions">
          ← drag to score 1–5 →
        </div>
        <div className="swipe-footer-count">
          {swipedCount} rated · {clips.length - currentIndex} left
        </div>
      </div>

      {showGuestPrompt && (
        <SwipeGuestPrompt onContinue={() => setShowGuestPrompt(false)} />
      )}
    </div>
  );
};

export default SwipeMode;
