import { useState, useEffect } from 'react';

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    setLoading(true);
    const res = await fetch('/api/audit-logs');
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  function getActionBadgeClass(action) {
    switch (action) {
      case 'CREATE': return 'badge-create';
      case 'UPDATE': return 'badge-update';
      case 'DELETE': return 'badge-delete';
      case 'NOTIFICATION': return 'badge-notification';
      default: return 'badge-system';
    }
  }

  function getModuleColor(module) {
    switch (module) {
      case 'todo': return 'var(--accent-indigo)';
      case 'debt': return 'var(--accent-emerald)';
      case 'deadline': return 'var(--accent-pink)';
      case 'date': return 'var(--accent-violet)';
      case 'watch': return 'var(--accent-amber)';
      case 'reminder': return 'var(--accent-blue)';
      default: return 'var(--text-muted)';
    }
  }

  return (
    <div className="animate-fade">
      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 24px;
          margin-top: 16px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: var(--border-subtle);
        }
        .timeline-item {
          position: relative;
          margin-bottom: 24px;
        }
        .timeline-dot {
          position: absolute;
          left: -24px;
          top: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 4px solid var(--bg-dark);
          box-shadow: 0 0 0 1px var(--border-subtle);
        }
        .timeline-content {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .badge-create { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .badge-update { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .badge-delete { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .badge-notification { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .badge-system { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }
        
        .badge-mode {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
        .badge-mode.live { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .badge-mode.dev { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Audit Log History</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Trace operations, message parsing, and reminder events</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs} style={{ fontSize: 12, padding: '6px 12px' }}>
          ↻ Refresh Logs
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
          <div>Loading audit trail...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.5 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{ fontSize: 14, fontWeight: 600 }}>No audit records found</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Perform actions on WhatsApp or the dashboard to populate the logs.</div>
        </div>
      ) : (
        <div className="timeline">
          {logs.map((log) => {
            const moduleColor = getModuleColor(log.module);
            return (
              <div key={log._id} className="timeline-item">
                <div 
                  className="timeline-dot" 
                  style={{ background: moduleColor }} 
                />
                <div className="timeline-content">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className={`badge ${getActionBadgeClass(log.action)}`} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', textTransform: 'uppercase' }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: moduleColor, letterSpacing: '0.05em' }}>
                        {log.module}
                      </span>
                      <span className={`badge-mode ${log.environmentMode === 'development' ? 'dev' : 'live'}`}>
                        {log.environmentMode === 'development' ? 'dev' : 'live'}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 4 }}>
                      {log.description}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {new Date(log.createdAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
