import { useState, useEffect } from 'react';
import {
  RefreshCw,
  History,
  Search,
  BookOpen,
  Scroll,
  Filter,
  Layers,
  Table,
  Library,
  Feather,
  Sparkles,
  X,
} from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';
import WoodPanel from '@/components/ui/WoodPanel';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import CharacterSprite from '@/components/character/CharacterSprite';

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all'); // 'all' | 'whatsapp' | 'web'
  const [viewStyle, setViewStyle] = useState('timeline'); // 'timeline' | 'shelf'
  const [selectedLog, setSelectedLog] = useState(null);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      fetchLogs();
    }, 0);
    return () => clearTimeout(loadTimer);
  }, []);

  function getActionBadgeVariant(action) {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'danger';
      case 'NOTIFICATION': return 'info';
      default: return 'default';
    }
  }

  function getModuleColor(module) {
    switch (module) {
      case 'todo': return '#8fc45a';
      case 'debt': return '#f2c230';
      case 'deadline': return '#e07a3f';
      case 'date': return '#a855f7';
      case 'watch': return '#38bdf8';
      case 'reminder': return '#ec4899';
      default: return '#c4b5a5';
    }
  }

  // Derive source based on confirmed bot code ("via WhatsApp" / "WhatsApp")
  function getSourceInfo(description) {
    if (!description) return { type: 'web', label: 'Web Quill', icon: '🪶' };
    const isWa = /whatsapp/i.test(description);
    if (isWa) {
      return { type: 'whatsapp', label: 'Wren Dispatch', icon: '🕊️' };
    }
    return { type: 'web', label: 'Web Quill', icon: '🪶' };
  }

  const filteredLogs = logs.filter((log) => {
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const sourceInfo = getSourceInfo(log.description);
    const matchesSource =
      selectedSource === 'all' ||
      (selectedSource === 'whatsapp' && sourceInfo.type === 'whatsapp') ||
      (selectedSource === 'web' && sourceInfo.type === 'web');
    const matchesSearch =
      !searchQuery.trim() ||
      log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesModule && matchesSource && matchesSearch;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Header & Moss the Archivist's Chronicle Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 12,
        }}
      >
        <WoodPanel variant="golden" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f2c230', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Archive Records
            </span>
            <BookOpen size={16} color="#f2c230" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
            {logs.length}
          </div>
          <div style={{ fontSize: 11, color: '#c4b5a5', marginTop: 4 }}>
            Inscribed in cellar chronicles
          </div>
        </WoodPanel>

        <WoodPanel variant="default" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pigeon Dispatches
            </span>
            <span style={{ fontSize: 16 }}>🕊️</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-pixel, monospace)' }}>
            {logs.filter((l) => /whatsapp/i.test(l.description || '')).length}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Arrived via WhatsApp carrier
          </div>
        </WoodPanel>

        <WoodPanel variant="dark" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8fc45a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Web Inscriptions
            </span>
            <Feather size={16} color="#8fc45a" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#8fc45a', fontFamily: 'var(--font-pixel, monospace)' }}>
            {logs.filter((l) => !/whatsapp/i.test(l.description || '')).length}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Authored via dashboard quill
          </div>
        </WoodPanel>
      </div>

      {/* 2. Search & Filter Bar */}
      <WoodPanel variant="default" style={{ padding: '16px 18px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search box with magnifying glass */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 240px', position: 'relative' }}>
            <Search size={15} color="#c4b5a5" style={{ position: 'absolute', left: 12 }} />
            <input
              type="text"
              placeholder="Search archive chronicle records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="fih-input"
              style={{
                paddingLeft: 36,
                background: '#241a15',
                borderColor: '#4d3324',
                color: '#fdf6e2',
                fontSize: 12,
                height: 38,
              }}
            />
          </div>

          {/* Module Filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="fih-input"
              style={{
                background: '#241a15',
                borderColor: '#4d3324',
                color: '#fdf6e2',
                fontSize: 12,
                height: 38,
                padding: '0 10px',
              }}
            >
              <option value="all">All Modules</option>
              <option value="todo">🌱 Farm Quests (todo)</option>
              <option value="debt">🪙 Ledger Hut (debt)</option>
              <option value="deadline">📌 Notice Board (deadline)</option>
              <option value="reminder">🔔 Bell Tower (reminder)</option>
              <option value="watch">🎬 Cinema (watch)</option>
              <option value="date">⭐ Festival Dates (date)</option>
            </select>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="fih-input"
              style={{
                background: '#241a15',
                borderColor: '#4d3324',
                color: '#fdf6e2',
                fontSize: 12,
                height: 38,
                padding: '0 10px',
              }}
            >
              <option value="all">All Sources</option>
              <option value="whatsapp">🕊️ Wren / WhatsApp</option>
              <option value="web">🪶 Web Dashboard</option>
            </select>

            {/* View Style Toggle */}
            <div style={{ display: 'flex', gap: 4 }}>
              <PixelButton
                variant={viewStyle === 'timeline' ? 'golden' : 'wood'}
                size="sm"
                onClick={() => setViewStyle('timeline')}
                title="Table & Timeline view"
              >
                <Table size={13} />
                <span>Timeline</span>
              </PixelButton>

              <PixelButton
                variant={viewStyle === 'shelf' ? 'golden' : 'wood'}
                size="sm"
                onClick={() => setViewStyle('shelf')}
                title="Cellar Book Shelf view"
              >
                <Library size={13} />
                <span>Shelf</span>
              </PixelButton>
            </div>

            <PixelButton
              variant="wood"
              size="sm"
              onClick={fetchLogs}
              title="Refresh archive"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </PixelButton>
          </div>
        </div>
      </WoodPanel>

      {/* 3. Log Records Display */}
      {loading ? (
        <SkeletonLoader count={4} height={76} />
      ) : filteredLogs.length === 0 ? (
        <WoodPanel variant="default" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <CharacterSprite character="moss" state="idle" size={64} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fdf6e2', marginBottom: 6, fontFamily: 'var(--font-pixel, monospace)' }}>
            No records etched in the archive
          </h3>
          <p style={{ color: '#a38d7b', fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
            Moss the Turtle sits peacefully at his ledger. Records are never rewritten in the cellar.
          </p>
        </WoodPanel>
      ) : viewStyle === 'shelf' ? (
        /* Cellar Oak Book Shelf Visual Presentation */
        <WoodPanel variant="dark" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Library size={16} color="#f2c230" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fdf6e2', textTransform: 'uppercase', fontFamily: 'var(--font-pixel, monospace)' }}>
              Cellar Book Shelf Archive ({filteredLogs.length} Volumes)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 12,
            }}
          >
            {filteredLogs.map((log) => {
              const moduleColor = getModuleColor(log.module);
              const sourceInfo = getSourceInfo(log.description);

              return (
                <button
                  key={log._id}
                  onClick={() => setSelectedLog(log)}
                  style={{
                    background: '#1f130b',
                    border: `2px solid ${moduleColor}`,
                    borderRadius: 6,
                    padding: '12px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                    <span style={{ fontSize: 14 }}>{sourceInfo.icon}</span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: moduleColor,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-pixel, monospace)',
                      }}
                    >
                      {log.action}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fdf6e2',
                      marginBottom: 4,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontFamily: 'var(--font-pixel, monospace)',
                    }}
                  >
                    {log.description}
                  </div>
                  <div className="tabular-nums" style={{ fontSize: 9, color: '#a38d7b', marginTop: 'auto' }}>
                    {new Date(log.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </WoodPanel>
      ) : (
        /* Dense Timeline & Table View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredLogs.map((log) => {
            const moduleColor = getModuleColor(log.module);
            const sourceInfo = getSourceInfo(log.description);
            const badgeVariant = getActionBadgeVariant(log.action);

            return (
              <WoodPanel
                key={log._id}
                variant="default"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedLog(log)}
                title="Click to inspect archival entry in full detail"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                  {/* Source Stamp Icon */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: '#1f130b',
                      border: '1.5px solid #4d3324',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                    title={sourceInfo.label}
                  >
                    {sourceInfo.icon}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <PixelBadge variant={badgeVariant} size="sm">
                        {log.action}
                      </PixelBadge>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: moduleColor,
                          letterSpacing: '0.04em',
                          fontFamily: 'var(--font-pixel, monospace)',
                        }}
                      >
                        {log.module}
                      </span>

                      <span
                        style={{
                          fontSize: 10,
                          color: log.environmentMode === 'development' ? '#f59e0b' : '#10b981',
                          background: log.environmentMode === 'development' ? '#78350f33' : '#064e3b33',
                          border: `1px solid ${log.environmentMode === 'development' ? '#f59e0b55' : '#10b98155'}`,
                          padding: '1px 6px',
                          borderRadius: 3,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-pixel, monospace)',
                        }}
                      >
                        {log.environmentMode === 'development' ? 'DEV' : 'LIVE'}
                      </span>

                      <span
                        style={{
                          fontSize: 10,
                          color: '#c4b5a5',
                          fontFamily: 'var(--font-pixel, monospace)',
                        }}
                      >
                        • {sourceInfo.label}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: '#fdf6e2',
                        marginTop: 2,
                        wordBreak: 'break-word',
                        fontFamily: 'var(--font-pixel, monospace)',
                      }}
                    >
                      {log.description}
                    </div>
                  </div>
                </div>

                <div
                  className="tabular-nums"
                  style={{
                    fontSize: 11,
                    color: '#c4b5a5',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                    flexShrink: 0,
                    fontFamily: 'var(--font-pixel, monospace)',
                  }}
                >
                  {new Date(log.createdAt).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </div>
              </WoodPanel>
            );
          })}
        </div>
      )}

      {/* 4. Strictly Read-Only Detail Modal */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 520 }}
          >
            <WoodPanel variant="golden" style={{ padding: 24, position: 'relative' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'transparent',
                  border: 'none',
                  color: '#c4b5a5',
                  cursor: 'pointer',
                  padding: 4,
                }}
                aria-label="Close archive detail"
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <CharacterSprite character="moss" state="talk" size={40} />
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fdf6e2', margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
                    Archival Record Detail
                  </h3>
                  <span style={{ fontSize: 11, color: '#c4b5a5', fontStyle: 'italic' }}>
                    “Records in the archive are etched in stone. They are never rewritten.”
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: '#1f130b',
                  border: '1.5px solid #4d3324',
                  borderRadius: 8,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <span style={{ fontSize: 10, color: '#a38d7b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                    RECORD DESCRIPTION
                  </span>
                  <div style={{ fontSize: 14, color: '#fdf6e2', fontWeight: 600 }}>
                    {selectedLog.description}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#a38d7b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                      ACTION & MODULE
                    </span>
                    <div style={{ fontSize: 12, color: getModuleColor(selectedLog.module), fontWeight: 700 }}>
                      {selectedLog.action} • {selectedLog.module}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 10, color: '#a38d7b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                      SOURCE & DISPATCH
                    </span>
                    <div style={{ fontSize: 12, color: '#fdf6e2', fontWeight: 600 }}>
                      {getSourceInfo(selectedLog.description).icon} {getSourceInfo(selectedLog.description).label}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 10, color: '#a38d7b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                      ENVIRONMENT MODE
                    </span>
                    <div style={{ fontSize: 12, color: selectedLog.environmentMode === 'development' ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                      {selectedLog.environmentMode?.toUpperCase() || 'LIVE'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 10, color: '#a38d7b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                      TIMESTAMP (IST)
                    </span>
                    <div className="tabular-nums" style={{ fontSize: 11, color: '#c4b5a5' }}>
                      {new Date(selectedLog.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PixelButton
                  variant="wood"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                >
                  Close Volume
                </PixelButton>
              </div>
            </WoodPanel>
          </div>
        </div>
      )}
    </div>
  );
}
