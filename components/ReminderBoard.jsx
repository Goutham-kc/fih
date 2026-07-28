import { useState, useEffect } from 'react';

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
      if (isManual) setTimeout(() => setRefreshing(false), 500);
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
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), remindAt }),
      });

      if (res.ok) {
        setTitle('');
        setRemindAt('');
        fetchReminders();
      }
    } catch (err) {
      console.error('Failed to create reminder', err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReminder = async (id) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r._id !== id));
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
    if (diff < 0) return { text: 'Overdue / Pending Trigger', color: '#ff4b4b' };
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return { text: `In ${mins} min${mins === 1 ? '' : 's'}`, color: '#f59e0b' };
    const hours = Math.floor(mins / 60);
    if (hours < 24) return { text: `In ${hours} hr${hours === 1 ? '' : 's'}`, color: '#3b82f6' };
    const days = Math.floor(hours / 24);
    return { text: `In ${days} day${days === 1 ? '' : 's'}`, color: '#10b981' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header with Refresh & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255, 255, 255, 0.05)', padding: 4, borderRadius: 12 }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'upcoming' ? 'var(--gradient-primary)' : 'transparent',
              color: activeTab === 'upcoming' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            Upcoming ({upcomingReminders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'history' ? 'var(--gradient-primary)' : 'transparent',
              color: activeTab === 'history' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            Sent / Past ({historyReminders.length})
          </button>
        </div>

        <button
          onClick={() => fetchReminders(true)}
          className="btn btn-secondary"
          style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ display: 'inline-block', transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s ease' }}>↻</span>
          Refresh
        </button>
      </div>

      {/* Add New Reminder Form */}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>⏰ Set New Reminder</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <input
            type="text"
            placeholder="Reminder title (e.g. Call Mom, Take medicine)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            required
          />
          <input
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            className="input"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
          {submitting ? 'Setting...' : '+ Set Reminder'}
        </button>
      </form>

      {/* List Display */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>Loading reminders...</div>
      ) : activeTab === 'upcoming' ? (
        upcomingReminders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No upcoming reminders</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>You're all caught up! Use the form above or text WhatsApp to add one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingReminders.map((r) => {
              const badge = getRelativeBadge(r.remindAt);
              return (
                <div
                  key={r._id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    padding: '16px 20px',
                    borderLeft: `4px solid ${badge.color}`,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{r.title}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: `${badge.color}20`,
                          color: badge.color,
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🗓️ {formatDateTime(r.remindAt)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => toggleSent(r._id, r.sent)}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '6px 12px' }}
                    >
                      ✓ Mark Sent
                    </button>
                    <button
                      onClick={() => deleteReminder(r._id)}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '6px 10px', color: '#ff4b4b', borderColor: '#ff4b4b40' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        historyReminders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No sent reminder history</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Completed alerts will appear here for audit history.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {historyReminders.map((r) => (
              <div
                key={r._id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '16px 20px',
                  opacity: 0.75,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{r.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🗓️ Triggered: {formatDateTime(r.sentAt || r.remindAt)}</span>
                </div>

                <button
                  onClick={() => deleteReminder(r._id)}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: '6px 10px', color: '#ff4b4b', borderColor: '#ff4b4b40' }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
