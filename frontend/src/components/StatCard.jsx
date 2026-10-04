import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', badgeText }) {
  const colorMap = {
    primary: {
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.3)',
      glow: 'rgba(99, 102, 241, 0.25)',
      text: '#818cf8',
    },
    spam: {
      bg: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.3)',
      glow: 'rgba(244, 63, 94, 0.25)',
      text: '#f43f5e',
    },
    legit: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.25)',
      text: '#10b981',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      glow: 'rgba(245, 158, 11, 0.25)',
      text: '#f59e0b',
    },
    cyan: {
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.3)',
      glow: 'rgba(6, 182, 212, 0.25)',
      text: '#06b6d4',
    }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div style={{
      ...styles.card,
      borderColor: scheme.border,
      boxShadow: `0 8px 24px -6px rgba(0, 0, 0, 0.5), 0 0 15px ${scheme.glow}`,
    }} className="glass-panel">
      <div style={styles.topRow}>
        <div style={styles.titleWrapper}>
          <span style={styles.title}>{title}</span>
          {badgeText && (
            <span style={{ ...styles.badge, color: scheme.text, borderColor: scheme.border }}>
              {badgeText}
            </span>
          )}
        </div>
        {Icon && (
          <div style={{
            ...styles.iconBox,
            backgroundColor: scheme.bg,
            border: `1px solid ${scheme.border}`,
          }}>
            <Icon size={20} color={scheme.text} />
          </div>
        )}
      </div>

      <div style={styles.valueRow}>
        <span style={styles.value}>{value}</span>
      </div>

      {subtitle && (
        <div style={styles.subtitle}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    padding: '20px 22px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px',
    border: '1px solid',
    fontFamily: 'var(--font-mono)',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '4px',
  },
  value: {
    fontSize: '2rem',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    color: '#ffffff',
    fontFamily: 'var(--font-sans)',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
};
