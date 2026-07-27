import { useState, useEffect } from 'react';

const TYPE_EMOJI = { movie: '🎥', show: '📺', anime: '⚡', book: '📚', paper: '📝' };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {TYPE_EMOJI[item.type] || '📌'} {item.title}
            </div>
            <span className="tag" style={{ fontSize: 11 }}>{item.type}</span>
            {item.status === 'done' && item.rating && (
              <span style={{ marginLeft: 6, color: '#ffd166', fontSize: 13 }}>{'★'.repeat(Math.round(item.rating/2))} {item.rating}/10</span>
            )}
          </div>
          <button className="btn btn-ghost" onClick={() => deleteItem(item._id)}
            style={{ padding: '2px 6px', fontSize: 13 }}>✕</button>
        </div>
        {/* Status actions */}
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {item.status !== 'in_progress' && (
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => updateStatus(item._id, 'in_progress')}>
              ▶ Watching
            </button>
          )}
          {item.status !== 'planned' && (
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => updateStatus(item._id, 'planned')}>
              ← Plan
            </button>
          )}
          {item.status !== 'done' && (
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px', color: '#06d6a0' }}
              onClick={() => { setRatingFor(item._id); setTempRating(8); }}>
              ✓ Done
            </button>
          )}
        </div>
        {/* Rating prompt */}
        {ratingFor === item._id && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="range" min="1" max="10" value={tempRating}
              onChange={e => setTempRating(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent1)' }} />
            <span style={{ color: '#ffd166', minWidth: 28 }}>{tempRating}/10</span>
            <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}
              onClick={() => { updateStatus(item._id, 'done', tempRating); setRatingFor(null); }}>
              Save
            </button>
            <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => { updateStatus(item._id, 'done'); setRatingFor(null); }}>
              Skip
            </button>
          </div>
        )}
      </div>
    );
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div className="animate-fade">
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={addItem}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Title</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Movie, show, book..." required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select className="input" value={type} onChange={e => setType(e.target.value)}>
                <option value="movie">🎥 Movie</option>
                <option value="show">📺 Show</option>
                <option value="anime">⚡ Anime</option>
                <option value="book">📚 Book</option>
                <option value="paper">📝 Paper</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding} style={{ alignSelf: 'flex-end' }}>
              {adding ? '...' : '+ Add'}
            </button>
          </div>
        </form>
      </div>

      <div className="kanban">
        <div className="kanban-col">
          <h3 style={{ color: '#6c63ff' }}>📋 Planned ({planned.length})</h3>
          {planned.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nothing planned</p> : planned.map(renderItem)}
        </div>
        <div className="kanban-col">
          <h3 style={{ color: '#ffd166' }}>▶ In Progress ({inProgress.length})</h3>
          {inProgress.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nothing in progress</p> : inProgress.map(renderItem)}
        </div>
        <div className="kanban-col">
          <h3 style={{ color: '#06d6a0' }}>✅ Done ({done.length})</h3>
          {done.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nothing finished yet</p> : done.map(renderItem)}
        </div>
      </div>
    </div>
  );
}
