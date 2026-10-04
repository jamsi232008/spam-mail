import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Inbox, 
  PenSquare, 
  Trash2, 
  Cpu, 
  History, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { authService } from '../services/api';

export default function Sidebar({ unreadCount = 0, binCount = 0 }) {
  const navigate = useNavigate();
  const user = authService.getStoredUser() || { name: 'Alex Rivera', email: 'demo@spamshield.ai' };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inbox', label: 'Inbox', icon: Inbox, badge: unreadCount > 0 ? unreadCount : null, badgeType: 'legit' },
    { to: '/compose', label: 'Compose', icon: PenSquare, highlight: true },
    { to: '/bin', label: 'Spam Bin', icon: Trash2, badge: binCount > 0 ? binCount : null, badgeType: 'spam' },
    { to: '/spam-detection', label: 'AI Spam Sandbox', icon: Cpu },
    { to: '/detection-history', label: 'Detection History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.brandIconWrapper}>
          <ShieldAlert size={28} color="#6366f1" />
        </div>
        <div style={styles.brandText}>
          <div style={styles.brandTitle}>
            SMART SPAM <span style={{ color: '#6366f1' }}>SHIELD</span>
          </div>
          <div style={styles.brandSubtitle}>AI Spam Filter Engine</div>
        </div>
      </div>

      {/* Security Status Pill */}
      <div style={styles.statusPill}>
        <span style={styles.statusDot}></span>
        <span>ML Core: Multinomial NB</span>
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
                ...(item.highlight && !isActive ? styles.navLinkHighlight : {}),
              })}
            >
              <Icon size={18} style={{ opacity: 0.9 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span style={item.badgeType === 'spam' ? styles.badgeSpam : styles.badgeLegit}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Model Spec Card */}
      <div style={styles.modelCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>
          <Zap size={14} color="#06b6d4" />
          <span>REAL-TIME PROTECTION</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Spam is auto-routed to Bin upon arrival. Legitimate arrives in Inbox.
        </p>
      </div>

      {/* User Footer & Logout */}
      <div style={styles.userFooter}>
        <div style={styles.userAvatar}>
          {user.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user.name || 'User'}</div>
          <div style={styles.userEmail}>{user.email || 'user@college.edu'}</div>
        </div>
        <button 
          onClick={handleLogout} 
          title="Logout" 
          style={styles.logoutBtn}
          id="btn-sidebar-logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '270px',
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    flexShrink: 0,
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  brandIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#f8fafc',
  },
  brandSubtitle: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  statusPill: {
    marginTop: '14px',
    padding: '6px 10px',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.725rem',
    color: '#38bdf8',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '20px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#ffffff',
    fontWeight: '600',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    boxShadow: '0 0 15px rgba(99, 102, 241, 0.15)',
  },
  navLinkHighlight: {
    color: '#a5b4fc',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  badgeSpam: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    color: '#f43f5e',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    fontSize: '0.7rem',
    padding: '2px 7px',
    borderRadius: '999px',
    fontWeight: 700,
  },
  badgeLegit: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    fontSize: '0.7rem',
    padding: '2px 7px',
    borderRadius: '999px',
    fontWeight: 700,
  },
  modelCard: {
    backgroundColor: 'rgba(18, 28, 48, 0.6)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '12px',
    marginTop: 'auto',
    marginBottom: '16px',
  },
  userFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-subtle)',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
};
