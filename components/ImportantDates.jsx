import { useState, useEffect } from 'react';

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
  const thisWeek = [], thisMonth = [], later = [], past = [];
  dates.forEach(d => {
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
    if (res.ok) setDates((await res.json()).dates);
    setLoading(false);
  }

  useEffect(() => { fetchDates(); }, []);

  async function addDate(e) {
    e.preventDefault();
    if (!title || !date) return;
    setAdding(true);
    await fetch('/api/dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, recurring }),
    });
    setTitle(''); setDate(''); setRecurring('none');
    await fetchDates();
    setAdding(false);
  }

  async function deleteDate(id) {
    if (!confirm('Delete this important date?')) return;
    await fetch(`/api/dates/${id}`, { method: 'DELETE' });
    fetchDates();
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
        <div>Loading dates...</div>
      </div>
    );
  }

  const { thisWeek, thisMonth, later, past } = groupDates(dates);

  function renderGroup(label, items, badgeColor) {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: badgeColor || 'var(--text-muted)',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span>{label}</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }}></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(d => {
            const days = getDaysUntil(d.date);
            return (
              <div key={d._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{d.title}</span>
                      {d.recurring !== 'none' && (
                        <span className="badge badge-planned" style={{ textTransform: 'capitalize' }}>
                          {d.recurring}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Date: <strong style={{ color: 'var(--text-primary)' }}>{d.date}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className={`countdown-chip ${days === 0 ? 'today' : days > 0 && days <= 7 ? 'today' : 'upcoming'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                    {days === 0 ? 'Today' : days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`}
                  </span>
                  <button className="btn btn-ghost btn-icon" onClick={() => deleteDate(d._id)} style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Delete
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
      {/* Create Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Track Important Date / Birthday</h3>
        <form onSubmit={addDate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>TITLE</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mom's Birthday" required />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>DATE (MM-DD or YYYY-MM-DD)</label>
              <input className="input" value={date} onChange={e => setDate(e.target.value)} placeholder="e.g. 09-14" required />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>RECURRING</label>
              <select className="input" value={recurring} onChange={e => setRecurring(e.target.value)}>
                <option value="none">One-time Event</option>
                <option value="yearly">Yearly (Birthdays, Anniversaries)</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={adding} style={{ height: 46 }}>
              {adding ? 'Adding...' : '+ Save Date'}
            </button>
          </div>
        </form>
      </div>

      {dates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No important dates saved</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Add birthdays or anniversaries to receive WhatsApp reminders.</p>
        </div>
      ) : (
        <>
          {renderGroup('This Week', thisWeek, 'var(--accent-amber)')}
          {renderGroup('This Month', thisMonth, 'var(--accent-cyan)')}
          {renderGroup('Upcoming Later', later, 'var(--accent-violet)')}
          {renderGroup('Past Events', past, 'var(--text-muted)')}
        </>
      )}
    </div>
  );
}
