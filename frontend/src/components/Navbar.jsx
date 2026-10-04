import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Database, 
  PenSquare, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { dashboardService } from '../services/api';

export default function Navbar({ title = 'Dashboard', onDemoLoaded }) {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleLoadDemo = async () => {
    try {
      setLoadingDemo(true);
      setStatusMsg(null);
      const res = await dashboardService.loadDemoEmails();
      setStatusMsg({
        type: 'success',
        text: `Loaded ${res.details?.total_loaded || 34} emails! (${res.details?.spam_routed_to_bin || 17} Spam → Bin, ${res.details?.legitimate_routed_to_inbox || 17} Legit → Inbox)`
      });
      if (onDemoLoaded) onDemoLoaded();
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to load demo data.'
      });
      setTimeout(() => setStatusMsg(null), 5000);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.pageTitle}>{title}</h1>
        <div style={styles.pageSubtitle}>
          <span style={{ color: 'var(--cyan)' }}>Smart Spam Shield</span> • Machine Learning Security Engine
        </div>
      </div>

      <div style={styles.actions}>
        {/* Toast message if active */}
        {statusMsg && (
          <div style={{
            ...styles.toast,
            backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            borderColor: statusMsg.type === 'success' ? 'var(--legit-border)' : 'var(--spam-border)',
            color: statusMsg.type === 'success' ? '#34d399' : '#ff8597',
          }}>
            {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Load Demo Data Button (Requirement 18) */}
        <button
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          style={styles.btnDemo}
          title="Run 34 demo emails through actual ML classifier"
          id="btn-load-demo-emails"
        >
          <Database size={15} color="#06b6d4" />
          <span>{loadingDemo ? 'Running ML Inference...' : 'Load Demo Emails'}</span>
        </button>

        {/* Compose Shortcut */}
        <button
          onClick={() => navigate('/compose')}
          style={styles.btnCompose}
          id="btn-nav-compose"
        >
          <PenSquare size={15} />
          <span>Compose</span>
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    padding: '18px 28px',
    backgroundColor: 'rgba(12, 19, 34, 0.7)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 30,
  },
  pageTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: '600',
    animation: 'slideDown 0.25s ease',
  },
  btnDemo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 14px',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    borderRadius: '10px',
    color: '#38bdf8',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnCompose: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s',
  },
};
