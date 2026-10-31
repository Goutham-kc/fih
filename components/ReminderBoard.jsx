import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Clock, Plus, Trash2, RefreshCw, Check, Calendar } from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function ReminderBoard() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'

  const [title, setTitle] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    fetchReminders();
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
        setTitle('');
        setRemindAt('');
        toast.success('Reminder scheduled');
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
    const diff = new Date(dateStr) - new Date();
    if (diff < 0) return { text: 'Overdue / Pending Trigger', color: 'var(--accent-rose)', bg: 'var(--badge-high-bg)', border: 'var(--badge-high-border)' };
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return { text: `In ${mins} min${mins === 1 ? '' : 's'}`, color: 'var(--accent-amber)', bg: 'var(--badge-medium-bg)', border: 'var(--badge-medium-border)' };
    const hours = Math.floor(mins / 60);
    if (hours < 24) return { text: `In ${hours} hr${hours === 1 ? '' : 's'}`, color: 'var(--accent-indigo)', bg: 'var(--badge-planned-bg)', border: 'var(--border-subtle)' };
    const days = Math.floor(hours / 24);
    return { text: `In ${days} day${days === 1 ? '' : 's'}`, color: 'var(--accent-emerald)', bg: 'var(--badge-low-bg)', border: 'var(--badge-low-border)' };
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* View Switcher & Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: 'var(--bg-sunken)',
            border: '1px solid var(--border-subtle)',
            padding: 3,
            borderRadius: 10,
          }}
        >
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`btn ${activeTab === 'upcoming' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: activeTab === 'upcoming' ? 600 : 500,
              minHeight: 32,
            }}
          >
            Upcoming ({upcomingReminders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: activeTab === 'history' ? 600 : 500,
              minHeight: 32,
            }}
          >
            Sent / Past ({historyReminders.length})
          </button>
        </div>

        <button
          onClick={() => fetchReminders(true)}
          className="btn btn-secondary"
          style={{ fontSize: 12, padding: '4px 12px', minHeight: 32 }}
        >
          <RefreshCw
            size={13}
            style={{
              transform: refreshing ? 'rotate(360deg)' : 'none',
              transition: 'transform 0.4s ease',
            }}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Set New Reminder Form Card */}
      <form onSubmit={handleSubmit} className="fih-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 14 }}>
          Set New Reminder Alert
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div>
            <label
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontWeight: 600,
                display: 'block',
                marginBottom: 6,
                letterSpacing: '0.04em',
              }}
            >
              TITLE
            </label>
            <input
              type="text"
              placeholder="e.g. Call Mom, Review PR..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="fih-input"
              required
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontWeight: 600,
                display: 'block',
                marginBottom: 6,
                letterSpacing: '0.04em',
              }}
            >
              REMIND AT
            </label>
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="fih-input tabular-nums"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ minHeight: 42, padding: '0 20px' }}
          >
            <Plus size={16} />
            <span>{submitting ? 'Setting...' : 'Set Reminder'}</span>
          </button>
        </div>
      </form>

      {/* List Display */}
      {loading ? (
        <SkeletonLoader count={3} height={70} />
      ) : activeTab === 'upcoming' ? (
        upcomingReminders.length === 0 ? (
          <div className="fih-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No upcoming reminders</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              All caught up! Use the form above or message your WhatsApp bot to schedule one.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingReminders.map((r) => {
              const badge = getRelativeBadge(r.remindAt);
              return (
                <div
                  key={r._id}
                  className="fih-card stagger-item"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    padding: '16px 20px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {r.title}
                      </span>
                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>
                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Calendar size={12} />
                      {formatDateTime(r.remindAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => toggleSent(r._id, r.sent)}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '6px 12px', minHeight: 34 }}
                    >
                      <Check size={13} />
                      <span>Mark Sent</span>
                    </button>
                    <button
                      onClick={() => deleteReminder(r._id, r.title)}
                      className="btn btn-ghost btn-icon"
                      style={{ color: 'var(--text-muted)', padding: '6px 8px', minHeight: 34 }}
                      title="Delete reminder"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : historyReminders.length === 0 ? (
        <div className="fih-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No sent reminder history</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Completed alerts will appear here for audit history.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {historyReminders.map((r) => (
            <div
              key={r._id}
              className="fih-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                padding: '16px 20px',
                opacity: 0.7,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textDecoration: 'line-through',
                  }}
                >
                  {r.title}
                </span>
                <span
                  className="tabular-nums"
                  style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Clock size={12} />
                  Triggered: {formatDateTime(r.sentAt || r.remindAt)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => toggleSent(r._id, r.sent)}
                  className="btn btn-ghost"
                  style={{ fontSize: 12, padding: '4px 10px', minHeight: 32 }}
                  title="Move back to upcoming"
                >
                  Reopen
                </button>
                <button
                  onClick={() => deleteReminder(r._id, r.title)}
                  className="btn btn-ghost btn-icon"
                  style={{ color: 'var(--text-muted)', padding: '6px 8px', minHeight: 32 }}
                  title="Delete record"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
