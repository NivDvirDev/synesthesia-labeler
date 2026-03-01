import React, { Component } from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { login, register, googleLogin } from '../api';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
  googleClientId: string | null;
}

interface LoginPageState {
  mode: 'login' | 'register';
  username: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
}

class LoginPage extends Component<LoginPageProps, LoginPageState> {
  state: LoginPageState = {
    mode: 'login',
    username: '',
    email: '',
    password: '',
    error: '',
    loading: false,
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { mode, username, email, password } = this.state;
    this.setState({ error: '', loading: true });

    try {
      if (mode === 'register') {
        if (!username.trim()) {
          this.setState({ error: 'Username is required', loading: false });
          return;
        }
        const { user, token } = await register(username.trim(), email.trim(), password);
        this.props.onLogin(user, token);
      } else {
        const { user, token } = await login(email.trim(), password);
        this.props.onLogin(user, token);
      }
    } catch (err: any) {
      this.setState({ error: err.message || 'Something went wrong', loading: false });
    }
  };

  handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      this.setState({ error: 'Google sign-in failed: no credential received' });
      return;
    }
    this.setState({ error: '', loading: true });
    try {
      const { user, token } = await googleLogin(response.credential);
      this.props.onLogin(user, token);
    } catch (err: any) {
      this.setState({ error: err.message || 'Google sign-in failed', loading: false });
    }
  };

  handleGoogleError = () => {
    this.setState({ error: 'Google sign-in was cancelled or failed' });
  };

  toggleMode = () => {
    this.setState((s) => ({
      mode: s.mode === 'login' ? 'register' : 'login',
      error: '',
    }));
  };

  renderGoogleButton() {
    const { googleClientId } = this.props;
    if (!googleClientId) return null;

    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <div className="google-signin-section">
          <div className="google-btn-wrapper">
            <GoogleLogin
              onSuccess={this.handleGoogleSuccess}
              onError={this.handleGoogleError}
              size="large"
              width="336"
              text={this.state.mode === 'login' ? 'signin_with' : 'signup_with'}
              theme="filled_black"
              shape="rectangular"
            />
          </div>
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">or</span>
            <span className="login-divider-line" />
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  render() {
    const { mode, username, email, password, error, loading } = this.state;

    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Synesthesia Web Labeler</h1>
          <p className="login-subtitle">
            {mode === 'login' ? 'Sign in to start labeling' : 'Create your account'}
          </p>

          {this.renderGoogleButton()}

          <form onSubmit={this.handleSubmit} className="login-form">
            {mode === 'register' && (
              <div className="login-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => this.setState({ username: e.target.value })}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => this.setState({ email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value })}
                placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn btn-login" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="login-switch">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button className="login-link" onClick={this.toggleMode}>
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button className="login-link" onClick={this.toggleMode}>
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
