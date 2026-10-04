import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  RotateCcw, 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import EmailCard from '../components/EmailCard';
import { emailService } from '../services/api';

export default function Bin() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banner, setBanner] = useState(null);

  const fetchBinEmails = async () => {
    try {
      setLoading(true);
      const data = await emailService.getEmails('BIN', search);
      setEmails(data.emails || []);
    } catch (err) {
      console.error('Error fetching bin emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBinEmails();
  }, [search]);

  const handleRestore = async (id) => {
    try {
      const res = await emailService.restoreEmail(id);
      setEmails((prev) => prev.filter((e) => e.id !== id));
      setBanner({
        type: 'success',
        text: `Restored! Email "${res.email?.subject}" moved back to Inbox.`
      });
      setTimeout(() => setBanner(null), 5000);
    } catch (err) {
      setBanner({ type: 'error', text: 'Failed to restore email.' });
      setTimeout(() => setBanner(null), 4000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this spam email? This action cannot be undone.')) return;
    try {
      await emailService.deleteEmail(id);
      setEmails((prev) => prev.filter((e) => e.id !== id));
      setBanner({ type: 'success', text: 'Spam email permanently deleted from database.' });
      setTimeout(() => setBanner(null), 4000);
    } catch (err) {
      setBanner({ type: 'error', text: 'Failed to delete email.' });
      setTimeout(() => setBanner(null), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {banner && (
        <div className={`banner banner-${banner.type === 'success' ? 'success' : 'spam'}`}>
          {banner.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{banner.text}</span>
        </div>
      )}

      {/* Quarantined Spam Header Notice */}
      <div className="glass-panel" style={styles.headerBar}>
        <div style={styles.noticeBox}>
          <ShieldAlert size={20} color="#f43f5e" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ff6b81' }}>
              SPAM QUARANTINE BIN (Automatic ML Routing)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Emails classified as SPAM by the Multinomial Naive Bayes model are safely held here instead of reaching your inbox.
              You can restore false alarms back to Inbox or permanently remove them.
            </div>
          </div>
        </div>

        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search quarantined spam messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              id="input-bin-search"
            />
          </div>

          <button
            onClick={fetchBinEmails}
            style={styles.refreshBtn}
            title="Refresh Bin"
            id="btn-refresh-bin"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Spam Email List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={styles.emptyState}>
            <RefreshCw size={24} className="animate-spin" color="var(--spam)" />
            <span style={{ color: 'var(--text-muted)', marginTop: 8 }}>Loading quarantined emails...</span>
          </div>
        ) : emails.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <Trash2 size={44} color="var(--text-muted)" />
            <h3 style={{ color: '#ffffff', marginTop: 12 }}>Spam Bin is Empty</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              {search ? 'No spam matches your search.' : 'No spam currently quarantined. Try composing a test spam email or loading demo data!'}
            </p>
          </div>
        ) : (
          emails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onRestore={handleRestore}
              onDelete={handleDelete}
              showRestore={true}
            />
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  headerBar: {
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    borderRadius: '14px',
    border: '1px solid rgba(244, 63, 94, 0.2)',
  },
  noticeBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid var(--spam-border)',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(12, 19, 34, 0.8)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '8px 14px',
  },
  searchInput: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#ffffff',
    outline: 'none',
    fontSize: '0.875rem',
  },
  refreshBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    padding: '9px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: '52px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    textAlign: 'center',
  },
};
