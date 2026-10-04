import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  LogIn, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { authService } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@spamshield.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('demo@spamshield.ai');
    setPassword('password123');
    try {
      setLoading(true);
      setErrorMsg(null);
      await authService.login('demo@spamshield.ai', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Demo login failed. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        {/* Brand Header */}
        <div style={styles.brandSection}>
          <div style={styles.brandIconBox}>
            <ShieldAlert size={32} color="#6366f1" />
          </div>
          <h1 style={styles.brandTitle}>
            SMART SPAM <span style={{ color: '#6366f1' }}>SHIELD</span>
          </h1>
          <p style={styles.brandSubtitle}>
            AI-Powered Email Spam Detection and Automatic Filtering
          </p>
        </div>

        {/* Quick Demo Login Alert for Panel Members */}
        <div style={styles.demoNotice}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
            <Sparkles size={14} />
            <span>COLLEGE PANEL DEMO ACCESS</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Click below to instantly log in using pre-seeded test credentials:
          </p>
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            style={styles.demoBtn}
            id="btn-quick-demo-login"
          >
            <span>Log in as Demo User (Alex Rivera)</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {errorMsg && (
          <div className="banner banner-spam" style={{ marginBottom: 16 }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                id="login-email-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                id="login-password-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            id="btn-login-submit"
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account?</span>{' '}
          <Link to="/register" style={{ color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '36px 32px',
    borderRadius: '20px',
    border: '1px solid rgba(99, 102, 241, 0.25)',
  },
  brandSection: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  brandIconBox: {
    width: '56px',
    height: '56px',
    margin: '0 auto 14px auto',
    borderRadius: '16px',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
  },
  brandTitle: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  brandSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    lineHeight: '1.4',
  },
  demoNotice: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '20px',
  },
  demoBtn: {
    marginTop: '8px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.35)',
    borderRadius: '8px',
    color: '#38bdf8',
    fontSize: '0.775rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    marginTop: '20px',
  },
};
