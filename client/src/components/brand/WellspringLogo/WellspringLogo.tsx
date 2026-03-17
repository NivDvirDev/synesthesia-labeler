import React from 'react';
import { Link } from 'react-router-dom';
import { WellspringIcon } from './WellspringIcon/WellspringIcon';
import { Button } from '../../atoms';
import './WellspringLogo.css';

const WellspringLogo: React.FC = () => (
  <section className="landing-hero">
    <WellspringIcon size={120} animate />
    <h1 className="landing-hero-title">The Wellspring</h1>
    <p className="landing-hero-tagline">
      Rate how well visuals capture sound
    </p>
    <p className="landing-hero-sub">
      Watch audio visualizations. Rate them on sync, aesthetics, and motion.
      Compare your perception with AI. Climb the leaderboard.
    </p>
    <div className="landing-hero-cta">
      <Link to="/app" style={{ textDecoration: 'none' }}>
        <Button variant="primary" size="md">Start Rating</Button>
      </Link>
      <Link to="/rankings" style={{ textDecoration: 'none' }}>
        <Button variant="secondary" size="md">Explore Rankings</Button>
      </Link>
    </div>
    <div className="landing-hero-quick">
      <Link to="/swipe" className="landing-quick-mode-link">⚡ Try Quick Mode →</Link>
    </div>
  </section>
);

export default WellspringLogo;
