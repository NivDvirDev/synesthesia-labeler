import React from 'react';
import { Link } from 'react-router-dom';
import { WellspringLogo } from '../WellspringLogo/WellspringLogo';

const WellspringHero: React.FC = () => (
  <section className="landing-hero">
    <WellspringLogo size={120} animate />
    <h1 className="landing-hero-title">The Wellspring</h1>
    <p className="landing-hero-tagline">
      Rate how well visuals capture sound
    </p>
    <p className="landing-hero-sub">
      Watch audio visualizations. Rate them on sync, aesthetics, and motion.
      Compare your perception with AI. Climb the leaderboard.
    </p>
    <div className="landing-hero-cta">
      <Link to="/app" className="btn btn-join">Start Rating</Link>
      <Link to="/rankings" className="btn btn-outline">Explore Rankings</Link>
    </div>
    <div className="landing-hero-quick">
      <Link to="/swipe" className="landing-quick-mode-link">⚡ Try Quick Mode →</Link>
    </div>
  </section>
);

export default WellspringHero;
