import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, RefreshCw, Calendar, Clock, AlertTriangle } from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';

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
    if (res.ok) {
      const data = await res.json();
      setDeadlines(data.deadlines || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchDeadlines();
  }, []);

  async function addDeadline(e) {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    setAdding(true);
    const isoDueDate = new Date(dueDate).toISOString();
    const res = await fetch('/api/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), dueDate: isoDueDate, category }),
    });

    if (res.ok) {
      setTitle('');
      setDueDate('');
      setCategory('personal');
      toast.success('Deadline recorded');
      await fetchDeadlines();
    } else {
      toast.error('Failed to create deadline');
    }
    setAdding(false);
  }

  async function deleteDeadline(id, dlTitle) {
    await fetch(`/api/deadlines/${id}`, { method: 'DELETE' });
    toast('Deadline removed', {
      description: dlTitle || '',
    });
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

  const filtered = deadlines.filter((d) => filterCategory === 'all' || d.category === filterCategory);

  if (loading) {
    return (
      <div className="animate-fade">
        <div className="fih-card" style={{ marginBottom: 24, height: 110 }}>
          <div className="skeleton-loading" style={{ height: 40, width: '100%', borderRadius: 10, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton-loading" style={{ height: 34, width: 140, borderRadius: 8 }} />
            <div className="skeleton-loading" style={{ height: 34, width: 140, borderRadius: 8 }} />
          </div>
        </div>
        <SkeletonLoader count={3} height={76} />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Create Form Card */}
      <div className="fih-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 14 }}>
          Add Upcoming Deadline
        </h3>
        <form onSubmit={addDeadline}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                placeholder="e.g. End Semester Exam"
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
                DUE DATE & TIME
              </label>
              <input
                className="fih-input tabular-nums"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
                CATEGORY
              </label>
              <select
                className="fih-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="personal">Personal</option>
                <option value="academic">Academic</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={adding}
              style={{ minHeight: 42, padding: '0 20px' }}
            >
              <Plus size={16} />
              <span>{adding ? 'Saving...' : 'Save Deadline'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Upcoming Deadlines ({filtered.length})
          </h2>
          <button
            className="btn btn-secondary"
            onClick={fetchDeadlines}
            style={{ fontSize: 12, padding: '4px 10px', minHeight: 32 }}
            title="Refresh deadlines"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'personal', 'academic', 'internship'].map((cat) => (
            <button
              key={cat}
              className={`btn ${filterCategory === cat ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setFilterCategory(cat)}
              style={{
                fontSize: 12,
                padding: '4px 12px',
                minHeight: 32,
                textTransform: 'capitalize',
                fontWeight: filterCategory === cat ? 600 : 500,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline Cards */}
      {filtered.length === 0 ? (
        <div className="fih-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No deadlines found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Add a deadline above or text your WhatsApp assistant.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((dl) => {
            const cd = getCountdown(dl.dueDate);
            const borderAccent =
              dl.category === 'academic'
                ? 'var(--accent-violet)'
                : dl.category === 'internship'
                ? 'var(--accent-amber)'
                : 'var(--accent-indigo)';

            return (
              <div
                key={dl._id}
                className="fih-card stagger-item"
                style={{
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                        {dl.title}
                      </span>
                      <span className={`badge badge-${dl.category}`}>{dl.category}</span>
                      <span className={`countdown-chip ${cd.type}`}>{cd.label}</span>
                    </div>

                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Calendar size={13} />
                      <span>
                        Due:{' '}
                        {new Date(dl.dueDate).toLocaleDateString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> Automated Reminders:
                      </span>
                      {dl.reminderOffsets
                        .filter((o) => {
                          const reminderTime = new Date(new Date(dl.dueDate).getTime() - o * 60 * 1000);
                          return reminderTime > new Date(new Date(dl.createdAt).getTime() - 60000);
                        })
                        .map((o) => (
                          <span
                            key={o}
                            className="tabular-nums"
                            style={{
                              fontSize: 11,
                              background: 'var(--bg-sunken)',
                              border: '1px solid var(--border-subtle)',
                              padding: '2px 8px',
                              borderRadius: 6,
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {o >= 1440 ? `${o / 1440}d` : o >= 60 ? `${o / 60}h` : `${o}m`} before
                            {dl.remindersSent?.includes(o) ? ' ✓' : ''}
                          </span>
                        ))}
                    </div>
                  </div>

                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => deleteDeadline(dl._id, dl.title)}
                    style={{ color: 'var(--text-muted)', padding: '6px 8px', minHeight: 36 }}
                    title="Delete deadline"
                  >
                    <Trash2 size={15} />
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
