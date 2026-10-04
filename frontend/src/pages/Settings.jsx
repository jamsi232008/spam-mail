import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Database, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck 
} from 'lucide-react';
import { mlService, dashboardService } from '../services/api';

export default function Settings() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [threshold, setThreshold] = useState(0.50);
  const [banner, setBanner] = useState(null);

  const fetchModelInfo = async () => {
    try {
      setLoading(true);
      const info = await mlService.getModelInfo();
      setModelInfo(info);
    } catch (err) {
      console.error('Failed to load model info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      const res = await mlService.retrainModel();
      setBanner({
        type: 'success',
        text: `Model successfully retrained! New test accuracy: ${(res.metrics?.accuracy * 100).toFixed(2)}%`,
      });
      await fetchModelInfo();
      setTimeout(() => setBanner(null), 5000);
    } catch (err) {
      setBanner({ type: 'error', text: 'Model retraining failed.' });
      setTimeout(() => setBanner(null), 4000);
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {banner && (
        <div className={`banner banner-${banner.type === 'success' ? 'success' : 'spam'}`}>
          {banner.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{banner.text}</span>
        </div>
      )}

      {/* Settings Header */}
      <div className="glass-panel" style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={styles.iconBox}>
            <SettingsIcon size={22} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
              System & Model Configuration
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Inspect machine learning parameters, pipeline configuration, and application security rules.
            </p>
          </div>
        </div>
      </div>

      {/* Model Hyperparameters & Architecture */}
      <div className="glass-panel" style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Active Classifier Pipeline
            </h3>
          </div>
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            id="btn-settings-retrain"
          >
            <RefreshCw size={14} className={retraining ? 'animate-spin' : ''} />
            <span>{retraining ? 'Retraining...' : 'Retrain Pipeline'}</span>
          </button>
        </div>

        <div style={styles.paramsGrid}>
          <div style={styles.paramItem}>
            <span style={styles.paramLabel}>Algorithm</span>
            <span style={styles.paramValue}>{modelInfo?.model_name || 'Multinomial Naive Bayes'}</span>
          </div>
          <div style={styles.paramItem}>
            <span style={styles.paramLabel}>Feature Extractor</span>
            <span style={styles.paramValue}>TF-IDF (Sublinear Scaling)</span>
          </div>
          <div style={styles.paramItem}>
            <span style={styles.paramLabel}>N-Gram Range</span>
            <span style={styles.paramValue}>(1, 2) Unigram + Bigram</span>
          </div>
          <div style={styles.paramItem}>
            <span style={styles.paramLabel}>Laplace Smoothing (α)</span>
            <span style={styles.paramValue}>0.15</span>
          </div>
          <div style={styles.paramItem}>
            <span style={styles.paramLabel}>Vocabulary Limit</span>
            <span style={styles.paramValue}>3,500 Features</span>
          </div>
          <div style={styles.paramItem}>
            <span style={styles.paramLabel}>Current Training Size</span>
            <span style={styles.paramValue}>{modelInfo?.dataset_size || 134} Samples</span>
          </div>
        </div>
      </div>

      {/* Decision Threshold Controller */}
      <div className="glass-panel" style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sliders size={20} color="#6366f1" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Spam Classification Decision Threshold
            </h3>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--cyan)', fontSize: '1.1rem' }}>
            {threshold.toFixed(2)}
          </span>
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
          Any email with a predicted spam probability greater than or equal to this threshold is automatically intercepted and routed to the <strong>BIN</strong>.
        </p>

        <input
          type="range"
          min="0.30"
          max="0.80"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
          id="threshold-slider"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
          <span>0.30 (Aggressive Filtering)</span>
          <span>0.50 (Standard Recommended)</span>
          <span>0.80 (Conservative)</span>
        </div>
      </div>

      {/* Enterprise & API Integration Notice (College Project Context) */}
      <div className="glass-panel" style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <ShieldCheck size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            Production Gateway & Integration Roadmap
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          This prototype demonstrates an <strong>application-level simulated email gateway</strong> designed for demonstration to college evaluation panels without incurring API charges or requiring sensitive external email account credentials.
        </p>

        <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <span style={{ fontSize: '0.8rem', color: '#c7d2fe', fontWeight: 600 }}>
            Future Production Roadmap:
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Direct mailbox synchronization can be connected using authorized OAuth2 Google Gmail API (`users.messages.list`) or Microsoft Graph API (`/me/mailFolders/inbox/messages`).
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    padding: '20px 24px',
    borderRadius: '16px',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: '24px',
    borderRadius: '16px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  paramsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  paramItem: {
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(12, 19, 34, 0.6)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
  },
  paramLabel: {
    fontSize: '0.725rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  paramValue: {
    fontSize: '0.925rem',
    fontWeight: 700,
    color: '#ffffff',
    marginTop: '4px',
  },
};
