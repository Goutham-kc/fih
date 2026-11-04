import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  Calendar,
  Bell,
  BellRing,
  BellOff,
  Sparkles,
} from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';
import WoodPanel from '@/components/ui/WoodPanel';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import CharacterSprite from '@/components/character/CharacterSprite';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

export default function ReminderBoard() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'
  const [title, setTitle] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const fetchReminders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/reminders');
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
      }
    } catch (err) {
      console.error('Failed to fetch reminders', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 400);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    const loadTimer = setTimeout(() => {
      fetchReminders();
    }, 0);

    return () => {
      clearInterval(timer);
      clearTimeout(loadTimer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !remindAt) return;
    setSubmitting(true);

    try {
      const isoRemindAt = new Date(remindAt).toISOString();
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), remindAt: isoRemindAt }),
      });

      if (res.ok) {
        soundManager.playSfx('bell');
        eventBus.emit(EVENTS.REMINDER_CREATED, { title: title.trim() });
        setTitle('');
        setRemindAt('');
        toast.success('Pigeon dispatch scheduled 📬');
        fetchReminders();
      } else {
        toast.error('Failed to schedule reminder');
      }
    } catch (err) {
      console.error('Failed to create reminder', err);
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReminder = async (id, rTitle) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r._id !== id));
        toast('Reminder removed', { description: rTitle || '' });
      }
    } catch (err) {
      console.error('Failed to delete reminder', err);
    }
  };

  const toggleSent = async (id, currentSent) => {
    try {
      soundManager.playSfx('bell');
      if (!currentSent) {
        eventBus.emit(EVENTS.REMINDER_FIRED, { id });
      }
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sent: !currentSent }),
      });
      if (res.ok) {
        toast.success(currentSent ? 'Moved to upcoming' : 'Marked as sent');
        fetchReminders();
      }
    } catch (err) {
      console.error('Failed to update reminder', err);
    }
  };

  const upcomingReminders = reminders.filter((r) => !r.sent);
  const historyReminders = reminders.filter((r) => r.sent);

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRelativeBadge = (dateStr) => {
    const diff = new Date(dateStr).getTime() - now;
    if (diff < 0) return { text: 'Overdue / Pending Trigger', color: '#e05338', bg: '#2b1411', border: '#78261e' };
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return { text: `In ${mins} min${mins === 1 ? '' : 's'}`, color: '#f2c230', bg: '#2b220e', border: '#785b18' };
    const hours = Math.floor(mins / 60);
    if (hours < 24) return { text: `In ${hours} hr${hours === 1 ? '' : 's'}`, color: '#6888c8', bg: '#1c2438', border: '#3b4b6b' };
    const days = Math.floor(hours / 24);
    return { text: `In ${days} day${days === 1 ? '' : 's'}`, color: '#8fc45a', bg: '#1c2814', border: '#3b5423' };
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Bell Tower Hero Summary Cards */}
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
              Active Belfry Bells
            </span>
            <BellRing size={16} color="#f2c230" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
            {upcomingReminders.length}
          </div>
          <div style={{ fontSize: 11, color: '#c4b5a5', marginTop: 4 }}>
            Strung along tower rope
          </div>
        </WoodPanel>

        <WoodPanel variant="default" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e07a3f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Next Chime Due
            </span>
            <Clock size={16} color="#e07a3f" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 800, color: '#e07a3f', fontFamily: 'var(--font-pixel, monospace)', marginTop: 4 }}>
            {upcomingReminders.length > 0 ? getRelativeBadge(upcomingReminders[0].remindAt).text : 'No chimes queued'}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Hoot is watching the clock
          </div>
        </WoodPanel>

        <WoodPanel variant="dark" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Silent Bells Archive
            </span>
            <BellOff size={16} color="#a38d7b" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#c4b5a5', fontFamily: 'var(--font-pixel, monospace)' }}>
            {historyReminders.length}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Past dispatched dispatches
          </div>
        </WoodPanel>
      </div>

      {/* 2. Tie a New Bell Form */}
      <WoodPanel variant="default" style={{ padding: '18px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Bell size={16} color="#f2c230" />
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fdf6e2', margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
            Tie a New Bell to the Belfry
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: 12,
              alignItems: 'end',
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: '#c4b5a5',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: 6,
                  letterSpacing: '0.04em',
                }}
              >
                REMINDER TITLE
              </label>
              <input
                type="text"
                placeholder="e.g. Call Vet, Review Academy Scroll..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="fih-input"
                required
                style={{
                  background: '#241a15',
                  borderColor: '#4d3324',
                  color: '#fdf6e2',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 11,
                  color: '#c4b5a5',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: 6,
                  letterSpacing: '0.04em',
                }}
              >
                CHIME AT (DATE & TIME)
              </label>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="fih-input tabular-nums"
                required
                style={{
                  background: '#241a15',
                  borderColor: '#4d3324',
                  color: '#fdf6e2',
                }}
              />
            </div>

            <PixelButton
              type="submit"
              variant="golden"
              disabled={submitting}
              style={{ minHeight: 42, padding: '0 18px', width: '100%' }}
            >
              <Plus size={16} />
              <span>{submitting ? 'Tying...' : 'Tie Bell'}</span>
            </PixelButton>
          </div>
        </form>
      </WoodPanel>

      {/* 3. View Switcher & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <PixelButton
            variant={activeTab === 'upcoming' ? 'golden' : 'wood'}
            size="sm"
            onClick={() => setActiveTab('upcoming')}
          >
            <BellRing size={13} />
            <span>Upcoming Bells ({upcomingReminders.length})</span>
          </PixelButton>

          <PixelButton
            variant={activeTab === 'history' ? 'golden' : 'wood'}
            size="sm"
            onClick={() => setActiveTab('history')}
          >
            <BellOff size={13} />
            <span>Silent Bells Drawer ({historyReminders.length})</span>
          </PixelButton>
        </div>

        <PixelButton
          variant="wood"
          size="sm"
          onClick={() => fetchReminders(true)}
          title="Refresh belfry"
        >
          <RefreshCw
            size={12}
            style={{
              transform: refreshing ? 'rotate(360deg)' : 'none',
              transition: 'transform 0.4s ease',
            }}
          />
          <span>Refresh</span>
        </PixelButton>
      </div>

      {/* 4. Reminder Bells List */}
      {loading ? (
        <SkeletonLoader count={3} height={80} />
      ) : activeTab === 'upcoming' ? (
        upcomingReminders.length === 0 ? (
          <WoodPanel variant="default" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <CharacterSprite character="hoot" state="sleep" size={64} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fdf6e2', marginBottom: 6, fontFamily: 'var(--font-pixel, monospace)' }}>
              The belfry is still. Hoot is snoozing peacefully.
            </h3>
            <p style={{ color: '#a38d7b', fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
              All reminder bells are silent. Tie a new bell to the tower garland above or send a message via Wren on WhatsApp.
            </p>
          </WoodPanel>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingReminders.map((r, idx) => {
              const badge = getRelativeBadge(r.remindAt);
              const isNext = idx === 0;

              return (
                <WoodPanel
                  key={r._id}
                  variant={isNext ? 'golden' : 'default'}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    padding: '16px 20px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 18 }}>🔔</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
                        {r.title}
                      </span>
                      {isNext && (
                        <PixelBadge variant="warning" size="sm">
                          ⚡ NEXT CHIME
                        </PixelBadge>
                      )}
                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 3,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          fontFamily: 'var(--font-pixel, monospace)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>

                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: 12,
                        color: '#c4b5a5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: 'var(--font-pixel, monospace)',
                      }}
                    >
                      <Calendar size={13} color="#e07a3f" />
                      {formatDateTime(r.remindAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <PixelButton
                      variant="golden"
                      size="sm"
                      onClick={() => toggleSent(r._id, r.sent)}
                      style={{ padding: '6px 12px' }}
                    >
                      <Check size={13} />
                      <span>Ring & Mark Sent</span>
                    </PixelButton>

                    <button
                      onClick={() => deleteReminder(r._id, r.title)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8c705f',
                        cursor: 'pointer',
                        padding: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete reminder bell"
                      aria-label={`Delete reminder: ${r.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </WoodPanel>
              );
            })}
          </div>
        )
      ) : historyReminders.length === 0 ? (
        <WoodPanel variant="default" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fdf6e2', marginBottom: 6, fontFamily: 'var(--font-pixel, monospace)' }}>
            No silent bells in the drawer
          </h3>
          <p style={{ color: '#a38d7b', fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
            Completed alerts and rung chimes will rest here in the belfry archive.
          </p>
        </WoodPanel>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {historyReminders.map((r) => (
            <WoodPanel
              key={r._id}
              variant="dark"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                padding: '14px 18px',
                opacity: 0.75,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🔕</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#a38d7b',
                      textDecoration: 'line-through',
                      fontFamily: 'var(--font-pixel, monospace)',
                    }}
                  >
                    {r.title}
                  </span>
                </div>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 11,
                    color: '#8c705f',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'var(--font-pixel, monospace)',
                  }}
                >
                  <Clock size={11} />
                  Triggered: {formatDateTime(r.sentAt || r.remindAt)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <PixelButton
                  variant="wood"
                  size="sm"
                  onClick={() => toggleSent(r._id, r.sent)}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  title="Move bell back to active belfry garland"
                >
                  Reopen
                </PixelButton>

                <button
                  onClick={() => deleteReminder(r._id, r.title)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8c705f',
                    cursor: 'pointer',
                    padding: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Delete record"
                  aria-label={`Delete reminder: ${r.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </WoodPanel>
          ))}
        </div>
      )}
    </div>
  );
}
