import React, { useState, useEffect } from 'react';
import { 
  Inbox as InboxIcon, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Filter, 
  Mail, 
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import EmailCard from '../components/EmailCard';
import { emailService } from '../services/api';

export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [banner, setBanner] = useState(null);

  const fetchInboxEmails = async () => {
    try {
      setLoading(true);
      const data = await emailService.getEmails('INBOX', search);
      setEmails(data.emails || []);
    } catch (err) {
      console.error('Failed to load inbox emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboxEmails();
  }, [search]);

  const handleToggleRead = async (id, isRead) => {
    try {
      await emailService.markRead(id, isRead);
      setEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_read: isRead } : e))
      );
    } catch (err) {
      console.error('Error marking read status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this email?')) return;
    try {
      await emailService.deleteEmail(id);
      setEmails((prev) => prev.filter((e) => e.id !== id));
      setBanner({ type: 'success', text: 'Email permanently deleted.' });
      setTimeout(() => setBanner(null), 3500);
    } catch (err) {
      setBanner({ type: 'error', text: 'Failed to delete email.' });
      setTimeout(() => setBanner(null), 3500);
    }
  };

  const displayedEmails = emails.filter((e) => {
    if (filterUnread && e.is_read) return false;
    return true;
  });

  const unreadCount = emails.filter((e) => !e.is_read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {banner && (
        <div className={`banner banner-${banner.type === 'success' ? 'success' : 'spam'}`}>
          <AlertCircle size={18} />
          <span>{banner.text}</span>
        </div>
      )}

      {/* Filter and Security Notice Header */}
      <div className="glass-panel" style={styles.headerBar}>
        <div style={styles.securityBadge}>
          <ShieldCheck size={18} color="#10b981" />
          <span style={{ fontSize: '0.825rem', color: '#6ee7b7', fontWeight: 600 }}>
            INBOX PROTECTED: All incoming spam is automatically routed to the Bin by ML Shield.
          </span>
        </div>

        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search legitimate inbox..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              id="input-inbox-search"
            />
          </div>

          <button
            onClick={() => setFilterUnread(!filterUnread)}
            style={{
              ...styles.filterBtn,
              backgroundColor: filterUnread ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: filterUnread ? 'var(--primary)' : 'var(--border-subtle)',
              color: filterUnread ? '#ffffff' : 'var(--text-secondary)',
            }}
            id="btn-filter-unread"
          >
            <Filter size={14} />
            <span>Unread Only ({unreadCount})</span>
          </button>

          <button
            onClick={fetchInboxEmails}
            style={styles.refreshBtn}
            title="Refresh Inbox"
            id="btn-refresh-inbox"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Email List Container */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={styles.emptyState}>
            <RefreshCw size={24} className="animate-spin" color="var(--cyan)" />
            <span style={{ color: 'var(--text-muted)', marginTop: 8 }}>Fetching inbox messages...</span>
          </div>
        ) : displayedEmails.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <InboxIcon size={44} color="var(--text-muted)" />
            <h3 style={{ color: '#ffffff', marginTop: 12 }}>No emails in Inbox</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              {search ? 'No emails match your search query.' : 'Your inbox is completely clean! Spam was filtered directly to the Bin.'}
            </p>
          </div>
        ) : (
          displayedEmails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onToggleRead={handleToggleRead}
              onDelete={handleDelete}
              showRestore={false}
            />
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  headerBar: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderRadius: '14px',
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
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
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 14px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    textAlign: 'center',
  },
};
