import { useState, useEffect } from 'react';
import { RefreshCw, History, ShieldAlert } from 'lucide-react';

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
      case 'deadline': return 'var(--accent-rose)';
      case 'date': return 'var(--accent-violet)';
      case 'watch': return 'var(--accent-amber)';
      case 'reminder': return 'var(--accent-cyan)';
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
          margin-bottom: 20px;
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
          padding: 14px 18px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          box-shadow: var(--shadow-card);
        }
        .badge-create { background: rgba(16, 185, 129, 0.12); color: var(--accent-emerald); }
        .badge-update { background: rgba(245, 158, 11, 0.12); color: var(--accent-amber); }
        .badge-delete { background: rgba(244, 63, 94, 0.12); color: var(--accent-rose); }
        .badge-notification { background: rgba(99, 102, 241, 0.12); color: var(--accent-indigo); }
        .badge-system { background: rgba(107, 114, 128, 0.12); color: var(--text-muted); }
        
        .badge-mode {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.04em;
        }
        .badge-mode.live { background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.25); }
        .badge-mode.dev { background: rgba(245, 158, 11, 0.1); color: var(--accent-amber); border: 1px solid rgba(245, 158, 11, 0.25); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Audit Log Chronicle
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Trace operations, message parsing, and reminder events
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs} style={{ fontSize: 12, padding: '4px 12px', minHeight: 32 }}>
          <RefreshCw size={13} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
          <div>Loading audit trail...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="fih-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <History size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>No audit records found</div>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className={`badge ${getActionBadgeClass(log.action)}`} style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', textTransform: 'uppercase' }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: moduleColor, letterSpacing: '0.04em' }}>
                        {log.module}
                      </span>
                      <span className={`badge-mode ${log.environmentMode === 'development' ? 'dev' : 'live'}`}>
                        {log.environmentMode === 'development' ? 'dev' : 'live'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4, wordBreak: 'break-word' }}>
                      {log.description}
                    </div>
                  </div>
                  <div className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'right', flexShrink: 0 }}>
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
