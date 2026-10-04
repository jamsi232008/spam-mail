import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  Inbox, 
  AlertTriangle, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { emailService, authService } from '../services/api';

export default function ComposeEmail() {
  const navigate = useNavigate();
  const currentUser = authService.getStoredUser() || { email: 'student@college.edu' };

  const [sender, setSender] = useState(currentUser.email || 'student@college.edu');
  const [receiver, setReceiver] = useState('demo@spamshield.ai');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() && !body.trim()) {
      setErrorMsg('Please enter either a subject or email message.');
      return;
    }

    try {
      setSending(true);
      setErrorMsg(null);
      const res = await emailService.createEmail({
        sender,
        receiver,
        subject,
        body,
      });
      setResult(res);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const loadTemplate = (type) => {
    setResult(null);
    setErrorMsg(null);
    if (type === 'prize_spam') {
      setSender('lottery-central@cash-prize-claims.org');
      setReceiver('demo@spamshield.ai');
      setSubject('Congratulations! You won a cash prize');
      setBody('You have been selected for a special reward. Click the link below immediately to claim your prize.');
    } else if (type === 'bank_spam') {
      setSender('security-dept@national-bank-alert.xyz');
      setReceiver('demo@spamshield.ai');
      setSubject('URGENT: Your bank account has been suspended');
      setBody('Urgent account verification required. We detected unauthorized login attempts on your checking account. Click here to verify your identity and restore access within 24 hours.');
    } else if (type === 'crypto_spam') {
      setSender('trader@crypto-arbitrage-double.biz');
      setReceiver('demo@spamshield.ai');
      setSubject('Double your Bitcoin in 24 hours with zero risk');
      setBody('Deposit $100 today and receive guaranteed 10x cryptocurrency returns directly into your wallet. Exclusive limited offer!');
    } else if (type === 'meeting_legit') {
      setSender('dr.sharma@college.edu');
      setReceiver('demo@spamshield.ai');
      setSubject('Machine Learning Project: First Review Schedule Announcement');
      setBody('Dear students, the first phase review for the final year Machine Learning projects will take place this Thursday in Lab 304 starting at 10:00 AM. Please ensure your slide deck and architecture diagrams are uploaded to the portal.');
    } else if (type === 'assignment_legit') {
      setSender('prof.johnson@college.edu');
      setReceiver('demo@spamshield.ai');
      setSubject('CS402 Database Systems: Assignment 3 Deadline Extension');
      setBody('Based on multiple student requests, the deadline for submitting Assignment 3 on SQL indexing and query optimization has been extended to Sunday at 11:59 PM. Please submit your Jupyter notebook.');
    }
  };

  const resetForm = () => {
    setSubject('');
    setBody('');
    setResult(null);
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Description Banner */}
      <div className="glass-panel" style={styles.banner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={20} color="var(--cyan)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
            Simulate Email Dispatch & Automatic Filtering
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Send an email through the simulated gateway. The backend ML model analyzes content in real time:
          <strong style={{ color: '#f43f5e' }}> SPAM</strong> automatically routes into the <strong style={{ color: '#fbbf24' }}>BIN</strong>, while 
          <strong style={{ color: '#10b981' }}> LEGITIMATE</strong> emails land cleanly in your <strong style={{ color: '#34d399' }}>INBOX</strong>.
        </p>
      </div>

      {/* Preset Demo Buttons for Panel Review */}
      <div className="glass-panel" style={styles.presetsCard}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          One-Click Panel Demo Presets:
        </div>
        <div style={styles.presetButtons}>
          <button
            type="button"
            onClick={() => loadTemplate('prize_spam')}
            style={{ ...styles.presetBtn, borderColor: 'var(--spam-border)', color: '#ff6b81' }}
            id="btn-preset-prize-spam"
          >
            <ShieldAlert size={14} />
            <span>Spam: Cash Prize</span>
          </button>

          <button
            type="button"
            onClick={() => loadTemplate('bank_spam')}
            style={{ ...styles.presetBtn, borderColor: 'var(--spam-border)', color: '#ff8597' }}
            id="btn-preset-bank-spam"
          >
            <ShieldAlert size={14} />
            <span>Spam: Bank Verification</span>
          </button>

          <button
            type="button"
            onClick={() => loadTemplate('crypto_spam')}
            style={{ ...styles.presetBtn, borderColor: 'var(--spam-border)', color: '#f87171' }}
            id="btn-preset-crypto-spam"
          >
            <ShieldAlert size={14} />
            <span>Spam: Crypto Scam</span>
          </button>

          <button
            type="button"
            onClick={() => loadTemplate('meeting_legit')}
            style={{ ...styles.presetBtn, borderColor: 'var(--legit-border)', color: '#34d399' }}
            id="btn-preset-meeting-legit"
          >
            <ShieldCheck size={14} />
            <span>Legit: ML Project Meeting</span>
          </button>

          <button
            type="button"
            onClick={() => loadTemplate('assignment_legit')}
            style={{ ...styles.presetBtn, borderColor: 'var(--legit-border)', color: '#6ee7b7' }}
            id="btn-preset-assignment-legit"
          >
            <ShieldCheck size={14} />
            <span>Legit: Assignment Extension</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="banner banner-spam">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* RESULT MODAL / BANNER (Automatic Spam to Bin) */}
      {result && (
        <div
          className="glass-panel"
          style={{
            ...styles.resultCard,
            borderColor: result.routing.prediction === 'SPAM' ? 'var(--spam-border)' : 'var(--legit-border)',
            boxShadow: result.routing.prediction === 'SPAM' ? '0 0 25px var(--spam-glow)' : '0 0 25px var(--legit-glow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              ...styles.resultIconBox,
              backgroundColor: result.routing.prediction === 'SPAM' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: result.routing.prediction === 'SPAM' ? '#f43f5e' : '#10b981',
            }}>
              {result.routing.prediction === 'SPAM' ? <ShieldAlert size={28} /> : <ShieldCheck size={28} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={result.routing.prediction === 'SPAM' ? 'badge badge-spam' : 'badge badge-legit'}>
                  {result.routing.prediction === 'SPAM' ? '🚨 SPAM DETECTED' : '✅ LEGITIMATE EMAIL'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ML Confidence: <strong>{(result.routing.confidence * 100).toFixed(2)}%</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                {result.message}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Routing destination: <strong style={{ color: result.routing.folder === 'BIN' ? '#f59e0b' : '#34d399' }}>
                  {result.routing.folder}
                </strong>
                {result.routing.features_highlighted?.length > 0 && (
                  <span> • Trigger words: {result.routing.features_highlighted.join(', ')}</span>
                )}
              </p>
            </div>
          </div>

          <div style={styles.resultActions}>
            {result.routing.folder === 'BIN' ? (
              <button
                onClick={() => navigate('/bin')}
                className="btn btn-danger"
                id="btn-view-in-bin"
              >
                <Trash2 size={16} />
                <span>View Quarantined Email in Bin</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/inbox')}
                className="btn btn-success"
                id="btn-view-in-inbox"
              >
                <Inbox size={16} />
                <span>View in Inbox</span>
              </button>
            )}

            <button
              onClick={resetForm}
              className="btn btn-secondary"
            >
              Compose Another
            </button>
          </div>
        </div>
      )}

      {/* Main Compose Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={styles.formCard}>
        <div style={styles.formRow}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">From (Sender)</label>
            <input
              type="text"
              className="form-input"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g. sender@example.com"
              id="input-sender"
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">To (Receiver)</label>
            <input
              type="text"
              className="form-input"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="e.g. student@college.edu"
              id="input-receiver"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line..."
            id="input-subject"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Message Body</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: '180px' }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your email message here, or choose a preset demo template above..."
            id="input-body"
          />
        </div>

        <div style={styles.formFooter}>
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-outline"
          >
            Clear Fields
          </button>

          <button
            type="submit"
            disabled={sending}
            className="btn btn-primary"
            style={{ minWidth: '160px' }}
            id="btn-send-email"
          >
            <Send size={16} />
            <span>{sending ? 'Analyzing with ML...' : 'SEND EMAIL'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  banner: {
    padding: '18px 22px',
    borderRadius: '14px',
  },
  presetsCard: {
    padding: '16px 20px',
    borderRadius: '14px',
  },
  presetButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
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
  resultCard: {
    padding: '20px 24px',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    animation: 'slideDown 0.3s ease',
  },
  resultIconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '14px',
  },
  formCard: {
    padding: '26px',
    borderRadius: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  formFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
};
