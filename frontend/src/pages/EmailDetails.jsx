import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  RotateCcw, 
  Trash2, 
  Mail, 
  MailOpen, 
  Clock, 
  Cpu, 
  User, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { emailService } from '../services/api';

export default function EmailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await emailService.getEmailById(id);
      setEmail(data);
      // Auto-mark as read if unread
      if (!data.is_read) {
        await emailService.markRead(id, true);
        setEmail((prev) => ({ ...prev, is_read: true }));
      }
    } catch (err) {
      console.error('Error loading email details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRestore = async () => {
    try {
      await emailService.restoreEmail(id);
      setBanner({ type: 'success', text: 'Email restored to Inbox!' });
      setEmail((prev) => ({ ...prev, folder: 'INBOX', moved_to_bin_at: null }));
      setTimeout(() => setBanner(null), 3500);
    } catch (err) {
      setBanner({ type: 'error', text: 'Failed to restore email.' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this email permanently?')) return;
    try {
      await emailService.deleteEmail(id);
      navigate(email.folder === 'BIN' ? '/bin' : '/inbox');
    } catch (err) {
      setBanner({ type: 'error', text: 'Failed to delete.' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <span style={{ color: 'var(--text-muted)' }}>Loading email message...</span>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <h3>Email Not Found</h3>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '12px' }}>
          Go Back
        </button>
      </div>
    );
  }

  const isSpam = email.folder === 'BIN' || email.is_spam;
  const spamProb = Math.round((email.spam_probability || 0) * 100);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Navigation Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '8px 14px' }}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {email.folder === 'BIN' && (
            <button onClick={handleRestore} className="btn btn-success" id="btn-details-restore">
              <RotateCcw size={15} />
              <span>Restore to Inbox</span>
            </button>
          )}
          <button onClick={handleDelete} className="btn btn-danger" id="btn-details-delete">
            <Trash2 size={15} />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>

      {banner && (
        <div className={`banner banner-${banner.type === 'success' ? 'success' : 'spam'}`}>
          {banner.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{banner.text}</span>
        </div>
      )}

      {/* AI ML Security Analysis Card */}
      <div
        className="glass-panel"
        style={{
          ...styles.mlCard,
          borderColor: isSpam ? 'var(--spam-border)' : 'var(--legit-border)',
          background: isSpam
            ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(12, 19, 34, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(12, 19, 34, 0.9) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              ...styles.iconWrapper,
              backgroundColor: isSpam ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isSpam ? '#f43f5e' : '#10b981',
            }}>
              {isSpam ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={isSpam ? 'badge badge-spam' : 'badge badge-legit'}>
                  {email.prediction}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Folder: <strong style={{ color: email.folder === 'BIN' ? '#f59e0b' : '#34d399' }}>{email.folder}</strong>
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                {isSpam
                  ? 'Quarantined Threat: Automatically isolated to protect inbox'
                  : 'Verified Safe: Delivered cleanly to Inbox'}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SPAM PROBABILITY</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isSpam ? '#f43f5e' : '#34d399' }}>
              {spamProb}%
            </div>
          </div>
        </div>

        {/* Confidence Meter Bar */}
        <div className="confidence-meter" style={{ height: '10px', marginTop: 12 }}>
          <div
            className={`confidence-fill ${isSpam ? 'confidence-fill-spam' : 'confidence-fill-legit'}`}
            style={{ width: `${Math.max(spamProb, 3)}%` }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 4 }}>
          <span>0% (Completely Clean)</span>
          <span>50% (Decision Threshold)</span>
          <span>100% (High Spam Risk)</span>
        </div>
      </div>

      {/* Main Email Content Card */}
      <div className="glass-panel" style={styles.contentCard}>
        {/* Email Header */}
        <div style={styles.emailHeader}>
          <h2 style={styles.subjectTitle}>{email.subject || '(No Subject)'}</h2>

          <div style={styles.metaGrid}>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>From:</span>
              <span style={styles.metaValue}>{email.sender}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>To:</span>
              <span style={styles.metaValue}>{email.receiver}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Date:</span>
              <span style={styles.metaValue}>
                {new Date(email.created_at).toLocaleString()}
              </span>
            </div>
            {email.moved_to_bin_at && (
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Moved to Bin:</span>
                <span style={{ ...styles.metaValue, color: '#f59e0b' }}>
                  {new Date(email.moved_to_bin_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Email Body */}
        <div style={styles.emailBody}>
          {email.body ? (
            email.body.split('\n').map((paragraph, idx) => (
              <p key={idx} style={{ marginBottom: '14px', lineHeight: '1.7' }}>
                {paragraph}
              </p>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>(Empty email body)</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  mlCard: {
    padding: '20px 24px',
    borderRadius: '16px',
    border: '1px solid',
  },
  iconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCard: {
    padding: '28px',
    borderRadius: '16px',
  },
  emailHeader: {
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: '24px',
  },
  subjectTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
    marginBottom: '16px',
  },
  metaGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  metaLabel: {
    width: '110px',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  metaValue: {
    color: 'var(--text-main)',
  },
  emailBody: {
    fontSize: '0.95rem',
    color: 'var(--text-main)',
    minHeight: '200px',
  },
};
