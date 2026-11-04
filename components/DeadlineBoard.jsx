import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  Pin,
  Award,
  AlertTriangle,
  Scroll,
  Briefcase,
  Flower2,
  CheckCircle2,
} from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';
import WoodPanel from '@/components/ui/WoodPanel';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import CharacterSprite from '@/components/character/CharacterSprite';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';
import { fireSuccessBurst } from '@/lib/confetti';

export default function DeadlineBoard() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('personal');
  const [adding, setAdding] = useState(false);

  const [now, setNow] = useState(() => Date.now());

  async function fetchDeadlines() {
    const res = await fetch('/api/deadlines');
    if (res.ok) {
      const data = await res.json();
      setDeadlines(data.deadlines || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    const loadTimer = setTimeout(() => {
      fetchDeadlines();
    }, 0);

    return () => {
      clearInterval(timer);
      clearTimeout(loadTimer);
    };
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
      soundManager.playSfx('wood');
      eventBus.emit(EVENTS.DEADLINE_CREATED, { title: title.trim(), category });
      setTitle('');
      setDueDate('');
      setCategory('personal');
      toast.success('Notice pinned to Town Bulletin Board 📌');
      await fetchDeadlines();
    } else {
      toast.error('Failed to create deadline');
    }
    setAdding(false);
  }

  async function deleteDeadline(id, dlTitle) {
    soundManager.playSfx('harvest');
    fireSuccessBurst();
    eventBus.emit(EVENTS.DEADLINE_COMPLETED, { id, title: dlTitle });
    await fetch(`/api/deadlines/${id}`, { method: 'DELETE' });
    toast.success('Notice harvested & completed from board! 🌾', {
      description: dlTitle || '',
    });
    fetchDeadlines();
  }

  function getCountdown(dueDate) {
    const diff = new Date(dueDate) - now;
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const mins = Math.floor((abs % 3600000) / 60000);
    if (diff < 0) return { label: `Overdue by ${days > 0 ? days + 'd ' : ''}${hours}h`, type: 'overdue' };
    if (days === 0 && hours < 4) return { label: hours === 0 ? `${mins}m left` : `${hours}h ${mins}m left`, type: 'today' };
    return { label: days > 0 ? `In ${days}d ${hours}h` : `In ${hours}h`, type: 'upcoming' };
  }

  const filtered = deadlines.filter((d) => filterCategory === 'all' || d.category === filterCategory);

  // Summary counts for Marigold's board
  const overdueCount = deadlines.filter((d) => new Date(d.dueDate) - now < 0).length;
  const urgentCount = deadlines.filter((d) => {
    const diff = new Date(d.dueDate) - now;
    return diff >= 0 && diff < 86400000;
  }).length;

  if (loading) {
    return (
      <div className="animate-fade">
        <WoodPanel variant="default" style={{ marginBottom: 24, height: 110, padding: 18 }}>
          <div className="skeleton-loading" style={{ height: 40, width: '100%', borderRadius: 6, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton-loading" style={{ height: 34, width: 140, borderRadius: 6 }} />
            <div className="skeleton-loading" style={{ height: 34, width: 140, borderRadius: 6 }} />
          </div>
        </WoodPanel>
        <SkeletonLoader count={3} height={90} />
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Town Notice Board Hero Banner & Marigold */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 12,
        }}
      >
        <WoodPanel variant="golden" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f2c230', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pinned Notices
            </span>
            <Pin size={16} color="#f2c230" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
            {deadlines.length}
          </div>
          <div style={{ fontSize: 11, color: '#c4b5a5', marginTop: 4 }}>
            Active on village bulletin
          </div>
        </WoodPanel>

        <WoodPanel variant="default" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e07a3f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ripening Fast
            </span>
            <Clock size={16} color="#e07a3f" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#e07a3f', fontFamily: 'var(--font-pixel, monospace)' }}>
            {urgentCount}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Due within next 24 hours
          </div>
        </WoodPanel>

        <WoodPanel variant="dark" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: overdueCount > 0 ? '#e05338' : '#8fc45a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overdue Crops
            </span>
            {overdueCount > 0 ? <AlertTriangle size={16} color="#e05338" /> : <Award size={16} color="#8fc45a" />}
          </div>
          <div
            className="tabular-nums"
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: overdueCount > 0 ? '#e05338' : '#8fc45a',
              fontFamily: 'var(--font-pixel, monospace)',
            }}
          >
            {overdueCount}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            {overdueCount > 0 ? 'Needs harvest attention' : 'Board is fully caught up'}
          </div>
        </WoodPanel>
      </div>

      {/* 2. Pin a Notice Form (Town Bulletin Board style) */}
      <WoodPanel variant="default" style={{ padding: '18px 20px', position: 'relative' }}>
        {/* Brass Tack corner decoration */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: '#c4b5a5',
          }}
        >
          <Pin size={13} color="#e07a3f" />
          <span>Notice Pinned</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Scroll size={16} color="#f2c230" />
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fdf6e2', margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
            Pin Upcoming Harvest Deadline
          </h3>
        </div>

        <form onSubmit={addDeadline}>
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
                  color: '#c4b5a5',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: 6,
                  letterSpacing: '0.04em',
                }}
              >
                NOTICE TITLE
              </label>
              <input
                className="fih-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. End Semester Exam, Crop Delivery"
                required
                style={{
                  background: '#241a15',
                  borderColor: '#4d3324',
                  color: '#fdf6e2',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 11,
                  color: '#c4b5a5',
                  fontWeight: 700,
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
                style={{
                  background: '#241a15',
                  borderColor: '#4d3324',
                  color: '#fdf6e2',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 11,
                  color: '#c4b5a5',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: 6,
                  letterSpacing: '0.04em',
                }}
              >
                CATEGORY RIBBON
              </label>
              <select
                className="fih-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  background: '#241a15',
                  borderColor: '#4d3324',
                  color: '#fdf6e2',
                }}
              >
                <option value="personal">🌸 Personal (Garden)</option>
                <option value="academic">📜 Academic (Academy)</option>
                <option value="internship">💼 Internship (Guild)</option>
              </select>
            </div>

            <PixelButton
              type="submit"
              variant="golden"
              disabled={adding}
              style={{ minHeight: 42, padding: '0 18px', width: '100%' }}
            >
              <Plus size={16} />
              <span>{adding ? 'Pinning...' : 'Pin Notice'}</span>
            </PixelButton>
          </div>
        </form>
      </WoodPanel>

      {/* 3. Filter Ribbons & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fdf6e2', margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
            Notice Board ({filtered.length})
          </h2>
          <PixelButton
            variant="wood"
            size="sm"
            onClick={fetchDeadlines}
            title="Refresh town bulletin"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </PixelButton>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Notices', icon: null },
            { id: 'personal', label: 'Personal', icon: '🌸' },
            { id: 'academic', label: 'Academic', icon: '📜' },
            { id: 'internship', label: 'Internship', icon: '💼' },
          ].map((cat) => (
            <PixelButton
              key={cat.id}
              size="sm"
              variant={filterCategory === cat.id ? 'golden' : 'wood'}
              onClick={() => setFilterCategory(cat.id)}
            >
              <span>{cat.icon ? `${cat.icon} ` : ''}{cat.label}</span>
            </PixelButton>
          ))}
        </div>
      </div>

      {/* 4. Notice Board Cards */}
      {filtered.length === 0 ? (
        <WoodPanel variant="default" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <CharacterSprite character="marigold" state="idle" size={64} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fdf6e2', marginBottom: 6, fontFamily: 'var(--font-pixel, monospace)' }}>
            Nothing is ripening. Enjoy the sunshine.
          </h3>
          <p style={{ color: '#a38d7b', fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
            The town notice board is quiet. Pin an upcoming deadline above or message Wren on WhatsApp to dispatch a harvest notice.
          </p>
        </WoodPanel>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((dl) => {
            const cd = getCountdown(dl.dueDate);
            const isOverdue = cd.type === 'overdue';
            const isToday = cd.type === 'today';

            const categoryTheme =
              dl.category === 'academic'
                ? { label: 'Academic', icon: <Scroll size={12} />, color: '#6888c8', border: '#3b4b6b', bg: '#1c2438' }
                : dl.category === 'internship'
                ? { label: 'Internship', icon: <Briefcase size={12} />, color: '#f2c230', border: '#785b18', bg: '#2b220e' }
                : { label: 'Personal', icon: <Flower2 size={12} />, color: '#8fc45a', border: '#3b5423', bg: '#1c2814' };

            return (
              <WoodPanel
                key={dl._id}
                variant={isOverdue ? 'dark' : 'default'}
                style={{
                  padding: '16px 20px',
                  position: 'relative',
                  borderColor: isOverdue ? '#80261f' : isToday ? '#a66a1a' : undefined,
                }}
              >
                {/* Visual pin tack at top-left corner */}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#e07a3f',
                    border: '2px solid #5a2c16',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  }}
                  title="Pinned with brass tack"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginLeft: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
                        {dl.title}
                      </span>

                      {/* Category Ribbon */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 3,
                          color: categoryTheme.color,
                          border: `1px solid ${categoryTheme.border}`,
                          background: categoryTheme.bg,
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-pixel, monospace)',
                        }}
                      >
                        {categoryTheme.icon}
                        {categoryTheme.label}
                      </span>

                      {/* Urgency Countdown Ribbon */}
                      <PixelBadge
                        variant={isOverdue ? 'danger' : isToday ? 'warning' : 'success'}
                        size="sm"
                      >
                        {isOverdue ? '🥀 ' : isToday ? '⚡ ' : '🌱 '}
                        {cd.label}
                      </PixelBadge>
                    </div>

                    {/* Due Date tabular */}
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: 12,
                        color: '#c4b5a5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: 'var(--font-pixel, monospace)',
                      }}
                    >
                      <Calendar size={13} color="#e07a3f" />
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

                    {/* Automated Reminders (pigeon dispatched) */}
                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#a38d7b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} color="#f2c230" /> Pigeons Dispatched:
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
                              fontSize: 10,
                              background: '#241a15',
                              border: '1px solid #4d3324',
                              padding: '2px 6px',
                              borderRadius: 3,
                              color: dl.remindersSent?.includes(o) ? '#8fc45a' : '#c4b5a5',
                              fontFamily: 'var(--font-pixel, monospace)',
                            }}
                          >
                            🕊️ {o >= 1440 ? `${o / 1440}d` : o >= 60 ? `${o / 60}h` : `${o}m`} before
                            {dl.remindersSent?.includes(o) ? ' ✓' : ''}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Harvest / Complete Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PixelButton
                      variant="wood"
                      size="sm"
                      onClick={() => deleteDeadline(dl._id, dl.title)}
                      title="Harvest / Complete notice"
                      aria-label={`Harvest deadline: ${dl.title}`}
                      style={{ padding: '6px 10px' }}
                    >
                      <CheckCircle2 size={14} color="#8fc45a" />
                      <span style={{ fontSize: 11 }}>Harvest</span>
                    </PixelButton>

                    <button
                      onClick={() => deleteDeadline(dl._id, dl.title)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8c705f',
                        cursor: 'pointer',
                        padding: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove notice from board"
                      aria-label={`Delete notice: ${dl.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </WoodPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
