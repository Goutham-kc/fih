import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Sparkles, Plus, Trash2, RefreshCw, Calendar, Gift } from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';
import { playSound } from '@/lib/soundEffects';

function getDaysUntil(dateStr) {
  const now = new Date();
  const mm = now.getMonth() + 1;
  const dd = now.getDate();
  const yyyy = now.getFullYear();

  let target;
  if (/^\d{2}-\d{2}$/.test(dateStr)) {
    const [m, d] = dateStr.split('-').map(Number);
    target = new Date(yyyy, m - 1, d);
    if (target < now) target = new Date(yyyy + 1, m - 1, d);
  } else {
    target = new Date(dateStr);
  }
  return Math.ceil((target - now) / 86400000);
}

function groupDates(dates) {
  const thisWeek = [];
  const thisMonth = [];
  const later = [];
  const past = [];
  dates.forEach((d) => {
    const days = getDaysUntil(d.date);
    if (days < 0) past.push(d);
    else if (days <= 7) thisWeek.push(d);
    else if (days <= 30) thisMonth.push(d);
    else later.push(d);
  });
  return { thisWeek, thisMonth, later, past };
}

export default function ImportantDates() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [recurring, setRecurring] = useState('none');
  const [adding, setAdding] = useState(false);

  async function fetchDates() {
    const res = await fetch('/api/dates');
    if (res.ok) {
      const data = await res.json();
      setDates(data.dates || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchDates();
  }, []);

  async function addDate(e) {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;
    setAdding(true);
    const res = await fetch('/api/dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), date: date.trim(), recurring }),
    });

    if (res.ok) {
      playSound('fanfare');
      setTitle('');
      setDate('');
      setRecurring('none');
      toast.success('Festival date inscribed on the calendar 🌸');
      await fetchDates();
    } else {
      toast.error('Failed to save date');
    }
    setAdding(false);
  }

  async function deleteDate(id, dateTitle) {
    await fetch(`/api/dates/${id}`, { method: 'DELETE' });
    toast('Date removed', { description: dateTitle || '' });
    fetchDates();
  }

  if (loading) {
    return (
      <div className="animate-fade">
        <div className="fih-card" style={{ marginBottom: 24, height: 110 }}>
          <div className="skeleton-loading" style={{ height: 40, width: '100%', borderRadius: 10, marginBottom: 12 }} />
        </div>
        <SkeletonLoader count={3} height={70} />
      </div>
    );
  }

  const { thisWeek, thisMonth, later, past } = groupDates(dates);

  function renderGroup(label, items, badgeColor) {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: badgeColor || 'var(--text-muted)',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>{label}</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((d) => {
            const days = getDaysUntil(d.date);
            return (
              <div
                key={d._id}
                className="fih-card stagger-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                        {d.title}
                      </span>
                      {d.recurring !== 'none' && (
                        <span className="badge badge-planned" style={{ textTransform: 'capitalize' }}>
                          {d.recurring}
                        </span>
                      )}
                    </div>
                    <div className="tabular-nums" style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      Date: <strong style={{ color: 'var(--text-primary)' }}>{d.date}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span
                    className={`countdown-chip tabular-nums ${days === 0 ? 'today' : days > 0 && days <= 7 ? 'today' : 'upcoming'}`}
                    style={{ fontSize: 12, padding: '4px 12px' }}
                  >
                    {days === 0 ? 'Today' : days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`}
                  </span>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => deleteDate(d._id, d.title)}
                    style={{ color: 'var(--text-muted)', padding: '6px 8px', minHeight: 32 }}
                    title="Delete date"
                    aria-label={`Delete date: ${d.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Create Form Card */}
      <div className="fih-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Track Important Date / Milestone
          </h3>
          <button
            className="btn btn-secondary"
            onClick={fetchDates}
            style={{ fontSize: 12, padding: '4px 10px', minHeight: 32 }}
            title="Refresh dates"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
        <form onSubmit={addDate}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
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
                className="fih-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mom's Birthday, Visa Renewal"
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
                DATE (MM-DD or YYYY-MM-DD)
              </label>
              <input
                className="fih-input tabular-nums"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 09-14 or 2026-11-20"
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
                RECURRING
              </label>
              <select
                className="fih-input"
                value={recurring}
                onChange={(e) => setRecurring(e.target.value)}
              >
                <option value="none">One-time Milestone</option>
                <option value="yearly">Yearly (Birthday / Anniversary)</option>
                <option value="monthly">Monthly Cycle</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={adding}
              style={{ minHeight: 42, padding: '0 20px' }}
            >
              <Plus size={16} />
              <span>{adding ? 'Saving...' : 'Save Date'}</span>
            </button>
          </div>
        </form>
      </div>

      {dates.length === 0 ? (
        <div className="fih-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No important dates saved</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Add birthdays, milestones, or anniversaries to receive automated WhatsApp reminders.
          </p>
        </div>
      ) : (
        <>
          {renderGroup('This Week', thisWeek, 'var(--accent-amber)')}
          {renderGroup('This Month', thisMonth, 'var(--accent-indigo)')}
          {renderGroup('Upcoming Later', later, 'var(--accent-violet)')}
          {renderGroup('Past Events', past, 'var(--text-muted)')}
        </>
      )}
    </div>
  );
}
