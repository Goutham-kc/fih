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
    if (!confirm('Delete this date?')) return;
    await fetch(`/api/dates/${id}`, { method: 'DELETE' });
    fetchDates();
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading...</div>;

  const { thisWeek, thisMonth, later, past } = groupDates(dates);

  function renderGroup(label, items) {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</div>
        {items.map(d => {
          const days = getDaysUntil(d.date);
          return (
            <div key={d._id} className="card" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{d.title}</span>
                  {d.recurring !== 'none' && <span className="tag">{d.recurring}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                  <span>{d.date}</span>
                  <span className={`countdown-chip ${days <= 7 ? 'today' : 'upcoming'}`}>
                    {days === 0 ? 'Today!' : days > 0 ? `in ${days}d` : `${Math.abs(days)}d ago`}
                  </span>
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => deleteDate(d._id)} style={{ padding: '4px 8px', fontSize: 14 }}>🗑️</button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={addDate}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Title</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mom's birthday" required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Date (MM-DD or YYYY-MM-DD)</label>
              <input className="input" value={date} onChange={e => setDate(e.target.value)} placeholder="09-14" required />
            </div>
            <div className="form-group">
              <label>Recurring</label>
              <select className="input" value={recurring} onChange={e => setRecurring(e.target.value)}>
                <option value="none">One-time</option>
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding} style={{ alignSelf: 'flex-end' }}>
              {adding ? '...' : '+ Add'}
            </button>
          </div>
        </form>
      </div>

      {dates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎂</div>
          <p>No important dates yet.</p>
        </div>
      ) : (
        <>
          {renderGroup('This Week', thisWeek)}
          {renderGroup('This Month', thisMonth)}
          {renderGroup('Later', later)}
          {renderGroup('Past', past)}
        </>
      )}
    </div>
  );
}
