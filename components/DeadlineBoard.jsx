import { useState, useEffect } from 'react';

export default function DeadlineBoard() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('personal');
  const [adding, setAdding] = useState(false);

  async function fetchDeadlines() {
    const res = await fetch('/api/deadlines');
    if (res.ok) setDeadlines((await res.json()).deadlines);
    setLoading(false);
  }

  useEffect(() => { fetchDeadlines(); }, []);

  async function addDeadline(e) {
    e.preventDefault();
    if (!title || !dueDate) return;
    setAdding(true);
    await fetch('/api/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, dueDate, category }),
    });
    setTitle(''); setDueDate(''); setCategory('personal');
    await fetchDeadlines();
    setAdding(false);
  }

  async function deleteDeadline(id) {
    if (!confirm('Delete this deadline?')) return;
    await fetch(`/api/deadlines/${id}`, { method: 'DELETE' });
    fetchDeadlines();
  }

  function getCountdown(dueDate) {
    const diff = new Date(dueDate) - Date.now();
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const mins = Math.floor((abs % 3600000) / 60000);
    if (diff < 0) return { label: `overdue by ${days > 0 ? days + 'd ' : ''}${hours}h`, type: 'overdue' };
    if (days === 0 && hours < 4) return { label: hours === 0 ? `${mins}m left` : `${hours}h ${mins}m left`, type: 'today' };
    return { label: days > 0 ? `in ${days}d ${hours}h` : `in ${hours}h`, type: 'upcoming' };
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div className="animate-fade">
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={addDeadline}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Title</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Deadline title" required />
            </div>
            <div className="form-group">
              <label>Due date &amp; time</label>
              <input className="input" type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="personal">Personal</option>
                <option value="academic">Academic</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding} style={{ alignSelf: 'flex-end' }}>
              {adding ? '...' : '+ Add'}
            </button>
          </div>
        </form>
      </div>

      {deadlines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>No deadlines yet.</p>
        </div>
      ) : (
        deadlines.map(dl => {
          const cd = getCountdown(dl.dueDate);
          return (
            <div key={dl._id} className="card" style={{ marginBottom: 10, borderLeft: `3px solid ${dl.category === 'academic' ? '#a78bfa' : dl.category === 'internship' ? '#fb923c' : '#6c63ff'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{dl.title}</span>
                    <span className={`badge badge-${dl.category}`}>{dl.category}</span>
                    <span className={`countdown-chip ${cd.type}`}>{cd.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {new Date(dl.dueDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {dl.reminderOffsets.map(o => (
                      <span key={o} className="tag">
                        {o >= 1440 ? `${o/1440}d` : o >= 60 ? `${o/60}h` : `${o}m`} before
                        {dl.remindersSent.includes(o) ? ' ✓' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => deleteDeadline(dl._id)} style={{ padding: '4px 8px', fontSize: 16 }}>🗑️</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
