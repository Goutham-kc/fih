import { useState, useEffect } from 'react';

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('show');
  const [adding, setAdding] = useState(false);
  const [ratingFor, setRatingFor] = useState(null);
  const [tempRating, setTempRating] = useState(8);

  async function fetchItems() {
    const res = await fetch('/api/watchlist');
    if (res.ok) setItems((await res.json()).items);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  async function addItem(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type }),
    });
    setTitle(''); setType('show');
    await fetchItems();
    setAdding(false);
  }

  async function updateStatus(id, status, rating) {
    await fetch(`/api/watchlist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(rating != null ? { rating } : {}) }),
    });
    fetchItems();
  }

  async function deleteItem(id) {
    if (!confirm('Remove from watchlist?')) return;
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
    fetchItems();
  }

  const planned = items.filter(i => i.status === 'planned');
  const inProgress = items.filter(i => i.status === 'in_progress');
  const done = items.filter(i => i.status === 'done');

  function renderItem(item) {
    return (
      <div key={item._id} className="item-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
              {item.title}
            </div>
            <span className="badge badge-planned" style={{ fontSize: 10, textTransform: 'uppercase' }}>
              {item.type}
            </span>
            {item.status === 'done' && item.rating && (
              <span style={{ marginLeft: 8, color: '#fbbf24', fontSize: 13, fontWeight: 700 }}>
                ★ {item.rating}/10
              </span>
            )}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => deleteItem(item._id)} style={{ color: 'var(--text-muted)', padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {item.status !== 'in_progress' && (
            <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => updateStatus(item._id, 'in_progress')}>
              In Progress
            </button>
          )}
          {item.status !== 'planned' && (
            <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => updateStatus(item._id, 'planned')}>
              Plan
            </button>
          )}
          {item.status !== 'done' && (
            <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => { setRatingFor(item._id); setTempRating(8); }}>
              Complete
            </button>
          )}
        </div>

        {/* Rating Prompt Drawer */}
        {ratingFor === item._id && (
          <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-sunken)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Rate this item (1-10):</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <input
                type="range"
                min="1"
                max="10"
                value={tempRating}
                onChange={e => setTempRating(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-violet)' }}
              />
              <span style={{ color: '#fbbf24', fontWeight: 800, minWidth: 36, fontSize: 14 }}>
                ★ {tempRating}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, fontSize: 12, padding: '6px' }} onClick={() => { updateStatus(item._id, 'done', tempRating); setRatingFor(null); }}>
                Save Rating
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px' }} onClick={() => { updateStatus(item._id, 'done'); setRatingFor(null); }}>
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
        <div>Loading watchlist...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Create Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Add to Watch / Read List</h3>
          <button className="btn btn-secondary" onClick={fetchItems} style={{ fontSize: 12, padding: '4px 10px' }} title="Refresh watchlist">
            ↻ Refresh
          </button>
        </div>
        <form onSubmit={addItem}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>TITLE</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Severance, Dune, Cyberpunk" required />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>TYPE</label>
              <select className="input" value={type} onChange={e => setType(e.target.value)}>
                <option value="movie">Movie</option>
                <option value="show">TV Show</option>
                <option value="anime">Anime</option>
                <option value="book">Book</option>
                <option value="paper">Paper / Article</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={adding} style={{ height: 46 }}>
              {adding ? 'Adding...' : '+ Add Item'}
            </button>
          </div>
        </form>
      </div>

      {/* Kanban Board */}
      <div className="kanban">
        <div className="kanban-col">
          <div className="kanban-header">
            <h3 style={{ color: 'var(--accent-indigo)' }}>Planned</h3>
            <span className="tab-count">{planned.length}</span>
          </div>
          {planned.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>Nothing planned</p> : planned.map(renderItem)}
        </div>

        <div className="kanban-col">
          <div className="kanban-header">
            <h3 style={{ color: 'var(--accent-amber)' }}>In Progress</h3>
            <span className="tab-count">{inProgress.length}</span>
          </div>
          {inProgress.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>Nothing active</p> : inProgress.map(renderItem)}
        </div>

        <div className="kanban-col">
          <div className="kanban-header">
            <h3 style={{ color: 'var(--accent-emerald)' }}>Completed</h3>
            <span className="tab-count">{done.length}</span>
          </div>
          {done.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>Nothing finished yet</p> : done.map(renderItem)}
        </div>
      </div>
    </div>
  );
}
