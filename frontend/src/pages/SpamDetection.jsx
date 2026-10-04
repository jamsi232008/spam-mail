import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Code2 
} from 'lucide-react';
import { mlService } from '../services/api';

export default function SpamDetection() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!subject.trim() && !body.trim()) {
      setErrorMsg('Please enter either a subject or email body to evaluate.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await mlService.predictText(subject, body);
      setResult(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Prediction request failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (type) => {
    setErrorMsg(null);
    if (type === 'lottery') {
      setSubject('URGENT: Claim your $1,000,000 lottery cash prize now');
      setBody('Congratulations! Your email was selected in the official international mobile lottery. Click here to verify your identity and claim your free cash prize immediately.');
    } else if (type === 'phishing') {
      setSubject('Security Notice: Your bank account will be deactivated in 12 hours');
      setBody('Dear customer, we detected unauthorized login attempts from a suspicious device. Verify your account credentials and password immediately at http://secure-bank-login.xyz to avoid suspension.');
    } else if (type === 'crypto') {
      setSubject('Guaranteed 10x Returns: Deposit Bitcoin today');
      setBody('Our high-frequency AI crypto trading bot guarantees 200% profit in 24 hours with zero risk. Wire transfer funds or deposit Ethereum to start making passive income.');
    } else if (type === 'college') {
      setSubject('Department Circular: Machine Learning Capstone Review Schedule');
      setBody('Dear final year students, the internal assessment committee will review capstone project implementations this Friday in Lab 304. Please bring your model metrics, slides, and code repositories.');
    } else if (type === 'internship') {
      setSubject('Internship Offer: Junior Software Engineer at TechCorp');
      setBody('We are excited to extend an offer for the Summer 2026 Software Development Internship. Please find attached the offer details, compensation structure, and orientation schedule.');
    }
  };

  const isSpam = result?.prediction === 'SPAM';
  const confidencePercent = result ? (result.confidence * 100).toFixed(2) : 0;
  const spamProbPercent = result ? (result.spam_probability * 100).toFixed(2) : 0;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Sandbox Header Banner */}
      <div className="glass-panel" style={styles.headerBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={styles.iconBox}>
            <Cpu size={24} color="#06b6d4" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
              AI Model Sandbox & Live Spam Tester
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Inspect and test the trained Multinomial Naive Bayes classifier in real-time.
              Enter any arbitrary text or choose a test case below to inspect feature indicators and probability scores.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Test Scenarios for Panel Presentation */}
      <div className="glass-panel" style={styles.presetsCard}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Interactive Panel Test Scenarios:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            onClick={() => loadSample('lottery')}
            style={{ ...styles.presetBtn, borderColor: 'var(--spam-border)', color: '#ff6b81' }}
            id="sandbox-preset-lottery"
          >
            <ShieldAlert size={14} />
            <span>Spam: Lottery Prize ($1M)</span>
          </button>
          <button
            type="button"
            onClick={() => loadSample('phishing')}
            style={{ ...styles.presetBtn, borderColor: 'var(--spam-border)', color: '#ff8597' }}
            id="sandbox-preset-phishing"
          >
            <ShieldAlert size={14} />
            <span>Spam: Bank Phishing Alert</span>
          </button>
          <button
            type="button"
            onClick={() => loadSample('crypto')}
            style={{ ...styles.presetBtn, borderColor: 'var(--spam-border)', color: '#f87171' }}
            id="sandbox-preset-crypto"
          >
            <ShieldAlert size={14} />
            <span>Spam: Crypto Scam</span>
          </button>
          <button
            type="button"
            onClick={() => loadSample('college')}
            style={{ ...styles.presetBtn, borderColor: 'var(--legit-border)', color: '#34d399' }}
            id="sandbox-preset-college"
          >
            <ShieldCheck size={14} />
            <span>Legit: College Project Notice</span>
          </button>
          <button
            type="button"
            onClick={() => loadSample('internship')}
            style={{ ...styles.presetBtn, borderColor: 'var(--legit-border)', color: '#6ee7b7' }}
            id="sandbox-preset-internship"
          >
            <ShieldCheck size={14} />
            <span>Legit: Internship Offer</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="banner banner-spam">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Two-Column Layout: Input Area vs Live ML Prediction Output */}
      <div style={styles.grid}>
        {/* Input Form */}
        <form onSubmit={handleCheck} className="glass-panel" style={styles.formCard}>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Congratulations! You won..."
              id="sandbox-input-subject"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Body Content</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '190px' }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste email text to analyze with TF-IDF and Naive Bayes..."
              id="sandbox-input-body"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px' }}
            id="btn-sandbox-check"
          >
            <Zap size={16} />
            <span>{loading ? 'Evaluating with ML Engine...' : 'CHECK EMAIL'}</span>
          </button>
        </form>

        {/* Prediction Results Display */}
        <div className="glass-panel" style={styles.resultCard}>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  CLASSIFICATION INFERENCE
                </span>
                <span className={isSpam ? 'badge badge-spam' : 'badge badge-legit'}>
                  {result.prediction}
                </span>
              </div>

              {/* Big Prediction Card */}
              <div style={{
                ...styles.verdictBox,
                backgroundColor: isSpam ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                borderColor: isSpam ? 'var(--spam-border)' : 'var(--legit-border)',
              }}>
                <div style={{
                  ...styles.verdictIcon,
                  backgroundColor: isSpam ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isSpam ? '#f43f5e' : '#10b981',
                }}>
                  {isSpam ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                    {result.prediction === 'SPAM' ? 'SPAM DETECTED' : 'LEGITIMATE EMAIL'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isSpam ? '#ff8597' : '#6ee7b7' }}>
                    {isSpam
                      ? 'Decision: Automatic isolation to BIN required'
                      : 'Decision: Clean traffic approved for INBOX'}
                  </div>
                </div>
              </div>

              {/* Metrics Display */}
              <div style={styles.metricsRow}>
                <div style={styles.metricBox}>
                  <div style={styles.metricLabel}>CONFIDENCE</div>
                  <div style={{ ...styles.metricNum, color: isSpam ? '#f43f5e' : '#34d399' }}>
                    {confidencePercent}%
                  </div>
                </div>

                <div style={styles.metricBox}>
                  <div style={styles.metricLabel}>SPAM PROBABILITY</div>
                  <div style={{ ...styles.metricNum, color: isSpam ? '#f43f5e' : '#38bdf8' }}>
                    {spamProbPercent}%
                  </div>
                </div>
              </div>

              {/* Confidence Progress Meter */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Spam Probability Meter</span>
                  <span style={{ fontWeight: 700, color: isSpam ? '#f43f5e' : '#10b981' }}>{spamProbPercent}%</span>
                </div>
                <div className="confidence-meter" style={{ height: '10px' }}>
                  <div
                    className={`confidence-fill ${isSpam ? 'confidence-fill-spam' : 'confidence-fill-legit'}`}
                    style={{ width: `${Math.max(parseFloat(spamProbPercent), 3)}%` }}
                  />
                </div>
              </div>

              {/* Explainable AI: Keywords Detected */}
              {result.features_highlighted?.length > 0 && (
                <div style={styles.featuresSection}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    DETECTED RISK PATTERNS & TOKENS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.features_highlighted.map((term, i) => (
                      <span key={i} style={styles.featureBadge}>
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.placeholderState}>
              <Code2 size={40} color="var(--text-muted)" />
              <h4 style={{ color: '#ffffff', marginTop: 12 }}>Ready for Inference</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: 4 }}>
                Enter email text or click any demo preset above to see real-time classification metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  headerBanner: {
    padding: '20px 24px',
    borderRadius: '16px',
  },
  iconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  presetsCard: {
    padding: '16px 20px',
    borderRadius: '14px',
  },
  presetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid',
    borderRadius: '8px',
    fontSize: '0.775rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '20px',
  },
  formCard: {
    padding: '24px',
    borderRadius: '16px',
  },
  resultCard: {
    padding: '24px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '380px',
  },
  verdictBox: {
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  verdictIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  metricBox: {
    padding: '12px',
    backgroundColor: 'rgba(12, 19, 34, 0.7)',
    borderRadius: '10px',
    border: '1px solid var(--border-subtle)',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  metricNum: {
    fontSize: '1.5rem',
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
    marginTop: '2px',
  },
  featuresSection: {
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-subtle)',
  },
  featureBadge: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    color: '#ff8597',
    border: '1px solid rgba(244, 63, 94, 0.3)',
  },
  placeholderState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px',
  },
};
