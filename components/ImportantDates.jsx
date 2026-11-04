import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
  Calendar,
  Gift,
  PartyPopper,
  Flame,
  Award,
} from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';
import WoodPanel from '@/components/ui/WoodPanel';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import CharacterSprite from '@/components/character/CharacterSprite';
import { soundManager } from '@/lib/soundManager';
import { fireSuccessBurst } from '@/lib/confetti';

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
    const loadTimer = setTimeout(() => {
      fetchDates();
    }, 0);
    return () => clearTimeout(loadTimer);
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
      soundManager.playSfx('fanfare');
      fireSuccessBurst();
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
        <WoodPanel variant="default" style={{ marginBottom: 20, height: 110, padding: 16 }}>
          <div className="skeleton-loading" style={{ height: 40, width: '100%', borderRadius: 6 }} />
        </WoodPanel>
        <SkeletonLoader count={3} height={70} />
      </div>
    );
  }

  const { thisWeek, thisMonth, later, past } = groupDates(dates);

  function renderGroup(label, items, badgeColor, iconEmoji) {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: badgeColor || '#c4b5a5',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-pixel, monospace)',
          }}
        >
          <span>{iconEmoji} {label}</span>
          <span style={{ height: 1, flex: 1, background: '#4d3324' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((d) => {
            const days = getDaysUntil(d.date);
            const isToday = days === 0;
            const isSoon = days > 0 && days <= 7;

            return (
              <WoodPanel
                key={d._id}
                variant={isToday ? 'golden' : 'default'}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
                        {d.title}
                      </span>
                      {d.recurring !== 'none' && (
                        <PixelBadge variant="default" size="sm">
                          {d.recurring === 'yearly' ? '🎂 ANNUAL' : '🔄 MONTHLY'}
                        </PixelBadge>
                      )}
                    </div>
                    <div className="tabular-nums" style={{ fontSize: 12, color: '#c4b5a5', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-pixel, monospace)' }}>
                      <Calendar size={12} color="#e07a3f" />
                      Date: <strong style={{ color: '#fdf6e2' }}>{d.date}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <PixelBadge
                    variant={isToday ? 'warning' : isSoon ? 'warning' : days < 0 ? 'default' : 'success'}
                    size="sm"
                  >
                    {days === 0 ? '🎉 Today!' : days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`}
                  </PixelBadge>

                  <button
                    onClick={() => deleteDate(d._id, d.title)}
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
                    title="Delete date"
                    aria-label={`Delete date: ${d.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </WoodPanel>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Festival Grounds Hero Banner */}
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
              Village Festivals
            </span>
            <PartyPopper size={16} color="#f2c230" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
            {dates.length}
          </div>
          <div style={{ fontSize: 11, color: '#c4b5a5', marginTop: 4 }}>
            Inscribed festival milestones
          </div>
        </WoodPanel>

        <WoodPanel variant="default" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8fc45a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Approaching Festivals
            </span>
            <Sparkles size={16} color="#8fc45a" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#8fc45a', fontFamily: 'var(--font-pixel, monospace)' }}>
            {thisWeek.length + thisMonth.length}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Gatherings in next 30 days
          </div>
        </WoodPanel>

        <WoodPanel variant="dark" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Carrier Reminders
            </span>
            <span style={{ fontSize: 16 }}>🕊️</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#c4b5a5', fontFamily: 'var(--font-pixel, monospace)' }}>
            Active
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Automated WhatsApp chimes
          </div>
        </WoodPanel>
      </div>

      {/* 2. Inscribe Date Form Card */}
      <WoodPanel variant="default" style={{ padding: '18px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Gift size={16} color="#f2c230" />
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fdf6e2', margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
              Inscribe Festival / Milestone on Calendar
            </h3>
          </div>
          <PixelButton
            variant="wood"
            size="sm"
            onClick={fetchDates}
            title="Refresh dates"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </PixelButton>
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
                  color: '#c4b5a5',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: 6,
                  letterSpacing: '0.04em',
                }}
              >
                MILESTONE TITLE
              </label>
              <input
                className="fih-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mom's Birthday, Visa Renewal"
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
                DATE (MM-DD or YYYY-MM-DD)
              </label>
              <input
                className="fih-input tabular-nums"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 09-14 or 2026-11-20"
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
                RECURRING
              </label>
              <select
                className="fih-input"
                value={recurring}
                onChange={(e) => setRecurring(e.target.value)}
                style={{
                  background: '#241a15',
                  borderColor: '#4d3324',
                  color: '#fdf6e2',
                }}
              >
                <option value="none">One-time Milestone</option>
                <option value="yearly">🎂 Yearly (Birthday / Solstice)</option>
                <option value="monthly">🔄 Monthly Cycle</option>
              </select>
            </div>

            <PixelButton
              type="submit"
              variant="golden"
              disabled={adding}
              style={{ minHeight: 42, padding: '0 18px', width: '100%' }}
            >
              <Plus size={16} />
              <span>{adding ? 'Inscribing...' : 'Inscribe Date'}</span>
            </PixelButton>
          </div>
        </form>
      </WoodPanel>

      {/* 3. Grouped Dates Display */}
      {dates.length === 0 ? (
        <WoodPanel variant="default" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <CharacterSprite character="clover" state="idle" size={64} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fdf6e2', marginBottom: 6, fontFamily: 'var(--font-pixel, monospace)' }}>
            No festival dates inscribed yet
          </h3>
          <p style={{ color: '#a38d7b', fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
            Add birthdays, milestones, or village gatherings to receive automated carrier-pigeon reminders before the celebration.
          </p>
        </WoodPanel>
      ) : (
        <>
          {renderGroup('This Week’s Celebrations', thisWeek, '#f2c230', '🎉')}
          {renderGroup('This Month’s Gatherings', thisMonth, '#6888c8', '🌸')}
          {renderGroup('Later in the Year', later, '#8fc45a', '🍂')}
          {renderGroup('Past Solstices & Memories', past, '#a38d7b', '❄️')}
        </>
      )}
    </div>
  );
}
