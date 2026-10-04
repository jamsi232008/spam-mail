import React, { useState, useEffect } from 'react';
import { 
  History, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Filter, 
  Cpu 
} from 'lucide-react';
import { mlService } from '../services/api';

export default function DetectionHistory() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await mlService.getDetections(filter);
      setDetections(data.detections || []);
    } catch (err) {
      console.error('Error fetching detection history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const filteredList = detections.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (item.subject && item.subject.toLowerCase().includes(term)) ||
      (item.prediction && item.prediction.toLowerCase().includes(term)) ||
      (item.model_name && item.model_name.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={styles.headerBar}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              ML Detection Audit Log
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Immutable chronological record of every email evaluated by the Multinomial Naive Bayes model.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={styles.controlsRow}>
          <div style={styles.searchBox}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              id="input-history-search"
            />
          </div>

          <div style={styles.tabGroup}>
            <button
              onClick={() => setFilter('all')}
              style={{
                ...styles.tabBtn,
                backgroundColor: filter === 'all' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                color: filter === 'all' ? '#ffffff' : 'var(--text-secondary)',
              }}
              id="filter-all-btn"
            >
              All Detections
            </button>
            <button
              onClick={() => setFilter('spam')}
              style={{
                ...styles.tabBtn,
                backgroundColor: filter === 'spam' ? '#f43f5e' : 'rgba(255, 255, 255, 0.05)',
                color: filter === 'spam' ? '#ffffff' : 'var(--text-secondary)',
              }}
              id="filter-spam-btn"
            >
              Spam Only
            </button>
            <button
              onClick={() => setFilter('legitimate')}
              style={{
                ...styles.tabBtn,
                backgroundColor: filter === 'legitimate' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                color: filter === 'legitimate' ? '#ffffff' : 'var(--text-secondary)',
              }}
              id="filter-legit-btn"
            >
              Legitimate Only
            </button>
          </div>

          <button
            onClick={fetchHistory}
            style={styles.refreshBtn}
            title="Refresh logs"
            id="btn-refresh-history"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Detections Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <RefreshCw size={24} className="animate-spin" color="var(--primary)" />
            <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>Querying detection logs...</div>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <History size={40} color="var(--text-muted)" />
            <h4 style={{ color: '#ffffff', marginTop: 12 }}>No Detections Found</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              No audit logs match the current filter.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Log ID</th>
                  <th>Subject / Content Evaluated</th>
                  <th style={{ width: '150px' }}>Prediction</th>
                  <th style={{ width: '130px' }}>Confidence</th>
                  <th style={{ width: '190px' }}>Model Engine</th>
                  <th style={{ width: '160px' }}>Evaluated At</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((log) => {
                  const isSpam = log.prediction === 'SPAM';
                  return (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        #{log.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isSpam ? (
                            <ShieldAlert size={16} color="#f43f5e" style={{ flexShrink: 0 }} />
                          ) : (
                            <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                          )}
                          <span>{log.subject || '(Direct ML Analysis)'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={isSpam ? 'badge badge-spam' : 'badge badge-legit'}>
                          {log.prediction}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isSpam ? '#ff8597' : '#34d399' }}>
                        {(log.confidence * 100).toFixed(2)}%
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Cpu size={14} color="#6366f1" />
                          <span>{log.model_name || 'Multinomial NB'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        {log.detected_at ? new Date(log.detected_at).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  headerBar: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRadius: '16px',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  searchBox: {
    flex: 1,
    minWidth: '220px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(12, 19, 34, 0.8)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '8px 12px',
  },
  searchInput: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#ffffff',
    outline: 'none',
    fontSize: '0.825rem',
  },
  tabGroup: {
    display: 'flex',
    gap: '6px',
  },
  tabBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
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
};
