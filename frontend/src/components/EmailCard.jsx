import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  RotateCcw, 
  Trash2, 
  Mail, 
  MailOpen, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

export default function EmailCard({
  email,
  onRestore,
  onDelete,
  onToggleRead,
  showRestore = false
}) {
  const navigate = useNavigate();

  const isSpam = email.folder === 'BIN' || email.is_spam;
  const confidencePercent = Math.round((email.spam_probability || 0.95) * 100);

  const formattedDate = email.created_at
    ? new Date(email.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: email.is_read ? 'rgba(12, 19, 34, 0.5)' : 'rgba(18, 28, 48, 0.85)',
        borderLeft: isSpam ? '4px solid #f43f5e' : '4px solid #10b981',
      }}
      className="glass-panel"
      onClick={() => navigate(`/emails/${email.id}`)}
    >
      <div style={styles.leftCol}>
        <div style={{
          ...styles.avatar,
          backgroundColor: isSpam ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          color: isSpam ? '#f43f5e' : '#10b981',
          border: isSpam ? '1px solid var(--spam-border)' : '1px solid var(--legit-border)',
        }}>
          {isSpam ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
        </div>
      </div>

      <div style={styles.midCol}>
        <div style={styles.topInfo}>
          <span style={styles.sender}>{email.sender}</span>
          <span style={styles.dot}>•</span>
          <span style={styles.date}>
            <Clock size={12} style={{ marginRight: 4 }} />
            {formattedDate}
          </span>
          {!email.is_read && <span style={styles.unreadDot} title="Unread" />}
        </div>

        <div style={{
          ...styles.subject,
          fontWeight: email.is_read ? '500' : '700',
          color: email.is_read ? 'var(--text-secondary)' : '#ffffff',
        }}>
          {email.subject || '(No Subject)'}
        </div>

        <div style={styles.bodySnippet}>
          {email.body ? (email.body.length > 120 ? email.body.substring(0, 120) + '...' : email.body) : 'No preview available.'}
        </div>
      </div>

      <div style={styles.rightCol} onClick={(e) => e.stopPropagation()}>
        <div style={styles.badgeWrapper}>
          {isSpam ? (
            <span className="badge badge-spam">
              <ShieldAlert size={12} /> SPAM {confidencePercent}%
            </span>
          ) : (
            <span className="badge badge-legit">
              <ShieldCheck size={12} /> LEGITIMATE
            </span>
          )}
        </div>

        <div style={styles.actionsRow}>
          {onToggleRead && (
            <button
              onClick={() => onToggleRead(email.id, !email.is_read)}
              style={styles.actionBtn}
              title={email.is_read ? 'Mark as Unread' : 'Mark as Read'}
            >
              {email.is_read ? <Mail size={15} /> : <MailOpen size={15} />}
            </button>
          )}

          {showRestore && onRestore && (
            <button
              onClick={() => onRestore(email.id)}
              style={{ ...styles.actionBtn, color: '#34d399' }}
              title="Restore to Inbox"
              id={`btn-restore-${email.id}`}
            >
              <RotateCcw size={15} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Restore</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(email.id)}
              style={{ ...styles.actionBtn, color: '#f87171' }}
              title="Delete Permanently"
              id={`btn-delete-${email.id}`}
            >
              <Trash2 size={15} />
            </button>
          )}

          <button
            onClick={() => navigate(`/emails/${email.id}`)}
            style={styles.actionBtn}
            title="View Details"
          >
            <ExternalLink size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    marginBottom: '10px',
    borderRadius: '12px',
    cursor: 'pointer',
    gap: '16px',
    transition: 'all 0.2s ease',
  },
  leftCol: {
    flexShrink: 0,
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  midCol: {
    flex: 1,
    minWidth: 0,
  },
  topInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    marginBottom: '4px',
  },
  sender: {
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  dot: {
    color: 'var(--text-muted)',
  },
  date: {
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    boxShadow: '0 0 8px #6366f1',
  },
  subject: {
    fontSize: '0.95rem',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bodySnippet: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
    flexShrink: 0,
  },
  badgeWrapper: {
    display: 'flex',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  actionBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s',
  },
};
