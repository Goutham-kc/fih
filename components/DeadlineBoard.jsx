import { useState, useEffect } from 'react';

export default function DeadlineBoard() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
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
    if (diff < 0) return { label: `Overdue by ${days > 0 ? days + 'd ' : ''}${hours}h`, type: 'overdue' };
    if (days === 0 && hours < 4) return { label: hours === 0 ? `${mins}m left` : `${hours}h ${mins}m left`, type: 'today' };
    return { label: days > 0 ? `In ${days}d ${hours}h` : `In ${hours}h`, type: 'upcoming' };
  }

  const filtered = deadlines.filter(d => filterCategory === 'all' || d.category === filterCategory);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
        <div>Loading deadlines...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Create Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Add Upcoming Deadline</h3>
        <form onSubmit={addDeadline}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>TITLE</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. End Semester Exam" required />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>DUE DATE &amp; TIME</label>
              <input className="input" type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CATEGORY</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="personal">Personal</option>
                <option value="academic">Academic</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={adding} style={{ height: 46 }}>
              {adding ? 'Adding...' : '+ Save Deadline'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Upcoming Deadlines ({filtered.length})</h2>
          <button className="btn btn-secondary" onClick={fetchDeadlines} style={{ fontSize: 12, padding: '4px 10px' }} title="Refresh deadlines">
            ↻ Refresh
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'personal', 'academic', 'internship'].map(cat => (
            <button
              key={cat}
              className={`btn ${filterCategory === cat ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setFilterCategory(cat)}
              style={{ fontSize: 12, padding: '4px 10px', textTransform: 'capitalize' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline Cards */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No deadlines found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Create a deadline above or text your WhatsApp bot.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(dl => {
            const cd = getCountdown(dl.dueDate);
            const borderAccent = dl.category === 'academic' ? 'var(--accent-violet)' : dl.category === 'internship' ? 'var(--accent-amber)' : 'var(--accent-cyan)';

            return (
              <div key={dl._id} className="card" style={{ borderLeft: `4px solid ${borderAccent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{dl.title}</span>
                      <span className={`badge badge-${dl.category}`}>{dl.category}</span>
                      <span className={`countdown-chip ${cd.type}`}>{cd.label}</span>
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Due: {new Date(dl.dueDate).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>Automated Reminders:</span>
                      {dl.reminderOffsets.map(o => (
                        <span key={o} style={{
                          fontSize: 11,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          padding: '2px 8px',
                          borderRadius: 8,
                          color: 'var(--text-secondary)'
                        }}>
                          {o >= 1440 ? `${o/1440}d` : o >= 60 ? `${o/60}h` : `${o}m`} before
                          {dl.remindersSent.includes(o) ? ' ✓' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="btn btn-ghost btn-icon" onClick={() => deleteDeadline(dl._id)} style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
