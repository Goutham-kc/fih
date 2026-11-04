import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fireSuccessBurst } from '@/lib/confetti';
import {
  Plus,
  Trash2,
  RefreshCw,
  Star,
  Film,
  Sparkles,
  Tv,
  BookOpen,
  Scroll,
  Clapperboard,
  Dices,
  Play,
} from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';
import WoodPanel from '@/components/ui/WoodPanel';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import CharacterSprite from '@/components/character/CharacterSprite';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('show');
  const [adding, setAdding] = useState(false);
  const [ratingFor, setRatingFor] = useState(null);
  const [tempRating, setTempRating] = useState(8);
  const [surpriseItem, setSurpriseItem] = useState(null);

  async function fetchItems() {
    const res = await fetch('/api/watchlist');
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      fetchItems();
    }, 0);
    return () => clearTimeout(loadTimer);
  }, []);

  async function addItem(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), type }),
    });

    if (res.ok) {
      soundManager.playSfx('wood');
      eventBus.emit(EVENTS.WATCH_ADDED, { title: title.trim(), type });
      setTitle('');
      setType('show');
      toast.success('Archived in Juniper’s Cinema Library 🎬');
      await fetchItems();
    } else {
      toast.error('Failed to add item');
    }
    setAdding(false);
  }

  async function updateStatus(id, status, rating) {
    try {
      if (status === 'done') {
        soundManager.playSfx('harvest');
        fireSuccessBurst();
        const target = items.find((i) => i._id === id);
        eventBus.emit(EVENTS.WATCH_STATUS, { id, title: target?.title, status: 'done' });
      } else {
        soundManager.playSfx('click');
      }
      const res = await fetch(`/api/watchlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(rating != null ? { rating } : {}) }),
      });
      if (res.ok) {
        toast.success(`Moved to ${status === 'in_progress' ? 'Now Projecting' : status === 'done' ? 'Watched Reel' : 'Now Showing'}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(`Error updating: ${errData.error?.message || res.statusText}`);
      }
    } catch (error) {
      toast.error(`Network error: ${error.message}`);
    }
    fetchItems();
  }

  async function deleteItem(id, itemTitle) {
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
    toast('Reel removed', { description: itemTitle || '' });
    fetchItems();
  }

  const planned = items.filter((i) => i.status === 'planned');
  const inProgress = items.filter((i) => i.status === 'in_progress');
  const done = items.filter((i) => i.status === 'done');

  // Spec feature: "Surprise me" random unwatched selector
  function handleSurpriseMe() {
    const pool = [...planned, ...inProgress];
    if (pool.length === 0) {
      toast.info('No unprojected reels in the queue! Hand Juniper a ticket first.');
      return;
    }
    soundManager.playSfx('coin');
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSurpriseItem(pick);
    toast.success(`Juniper loaded: "${pick.title}" onto the projector beam! 📽️`);
  }

  const getTypeIcon = (itemType) => {
    switch (itemType) {
      case 'movie':
        return <Film size={12} />;
      case 'show':
        return <Tv size={12} />;
      case 'anime':
        return <Clapperboard size={12} />;
      case 'book':
        return <BookOpen size={12} />;
      case 'paper':
        return <Scroll size={12} />;
      default:
        return <Film size={12} />;
    }
  };

  function renderItem(item) {
    const isChosen = surpriseItem && surpriseItem._id === item._id;

    return (
      <WoodPanel
        key={item._id}
        variant={isChosen ? 'golden' : 'default'}
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          borderColor: isChosen ? '#f2c230' : undefined,
          boxShadow: isChosen ? '0 0 14px rgba(242,194,48,0.3)' : undefined,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: '#fdf6e2',
                marginBottom: 4,
                wordBreak: 'break-word',
                fontFamily: 'var(--font-pixel, monospace)',
              }}
            >
              {item.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: '#241a15',
                  border: '1px solid #4d3324',
                  color: '#f2c230',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-pixel, monospace)',
                }}
              >
                {getTypeIcon(item.type)}
                {item.type}
              </span>

              {item.status === 'done' && item.rating && (
                <span
                  className="tabular-nums"
                  style={{
                    color: '#f2c230',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontFamily: 'var(--font-pixel, monospace)',
                  }}
                >
                  <Star size={11} fill="#f2c230" /> {item.rating}/10
                </span>
              )}

              {isChosen && (
                <PixelBadge variant="warning" size="sm">
                  ✨ FEATURED TONIGHT
                </PixelBadge>
              )}
            </div>
          </div>

          <button
            onClick={() => deleteItem(item._id, item.title)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8c705f',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Remove reel"
            aria-label={`Remove ${item.title} from watchlist`}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          {item.status !== 'in_progress' && (
            <PixelButton
              variant="wood"
              size="sm"
              style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={() => updateStatus(item._id, 'in_progress')}
            >
              <Play size={10} />
              <span>Project</span>
            </PixelButton>
          )}

          {item.status !== 'planned' && (
            <PixelButton
              variant="wood"
              size="sm"
              style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={() => updateStatus(item._id, 'planned')}
            >
              <span>Hold</span>
            </PixelButton>
          )}

          {item.status !== 'done' && (
            <PixelButton
              variant="golden"
              size="sm"
              style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={() => {
                setRatingFor(item._id);
                setTempRating(8);
              }}
            >
              <Star size={11} />
              <span>Watched</span>
            </PixelButton>
          )}
        </div>

        {/* Rating Prompt Drawer */}
        {ratingFor === item._id && (
          <div
            style={{
              marginTop: 8,
              padding: 10,
              background: '#19110c',
              borderRadius: 6,
              border: '1px solid #4d3324',
            }}
          >
            <div style={{ fontSize: 11, color: '#c4b5a5', marginBottom: 6, fontWeight: 700, fontFamily: 'var(--font-pixel, monospace)' }}>
              Rate this reel (1-10):
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <input
                type="range"
                min="1"
                max="10"
                value={tempRating}
                onChange={(e) => setTempRating(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#f2c230' }}
              />
              <span
                className="tabular-nums"
                style={{
                  color: '#f2c230',
                  fontWeight: 700,
                  minWidth: 42,
                  fontSize: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontFamily: 'var(--font-pixel, monospace)',
                }}
              >
                <Star size={12} fill="#f2c230" /> {tempRating}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <PixelButton
                variant="golden"
                size="sm"
                style={{ flex: 1, padding: '4px' }}
                onClick={() => {
                  updateStatus(item._id, 'done', tempRating);
                  setRatingFor(null);
                }}
              >
                Save
              </PixelButton>
              <PixelButton
                variant="wood"
                size="sm"
                style={{ padding: '4px 8px' }}
                onClick={() => {
                  updateStatus(item._id, 'done');
                  setRatingFor(null);
                }}
              >
                Skip
              </PixelButton>
            </div>
          </div>
        )}
      </WoodPanel>
    );
  }

  if (loading) {
    return (
      <div className="animate-fade">
        <WoodPanel variant="default" style={{ marginBottom: 20, height: 100, padding: 16 }}>
          <div className="skeleton-loading" style={{ height: 40, width: '100%', borderRadius: 6 }} />
        </WoodPanel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <SkeletonLoader count={2} height={90} />
          <SkeletonLoader count={2} height={90} />
          <SkeletonLoader count={2} height={90} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Moonlight Cinema Header & Projector Controls */}
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
              Reels in Queue
            </span>
            <Film size={16} color="#f2c230" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
            {planned.length}
          </div>
          <div style={{ fontSize: 11, color: '#c4b5a5', marginTop: 4 }}>
            Waiting for projector slot
          </div>
        </WoodPanel>

        <WoodPanel variant="default" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8fc45a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Now Projecting
            </span>
            <Play size={16} color="#8fc45a" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#8fc45a', fontFamily: 'var(--font-pixel, monospace)' }}>
            {inProgress.length}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Active on screen beam
          </div>
        </WoodPanel>

        <WoodPanel variant="dark" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Watched Archive
            </span>
            <Star size={16} color="#f2c230" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 800, color: '#c4b5a5', fontFamily: 'var(--font-pixel, monospace)' }}>
            {done.length}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Archived cinema classics
          </div>
        </WoodPanel>
      </div>

      {/* 2. Hand Juniper a Ticket Form */}
      <WoodPanel variant="default" style={{ padding: '18px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clapperboard size={16} color="#f2c230" />
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fdf6e2', margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
              Hand Juniper a New Ticket Stub
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <PixelButton
              variant="golden"
              size="sm"
              onClick={handleSurpriseMe}
              title="Pick a random unwatched reel"
            >
              <Dices size={14} />
              <span>Surprise Me</span>
            </PixelButton>

            <PixelButton
              variant="wood"
              size="sm"
              onClick={fetchItems}
              title="Refresh cinema library"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </PixelButton>
          </div>
        </div>

        <form onSubmit={addItem}>
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
                TITLE OR CHRONICLE
              </label>
              <input
                className="fih-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Severance, Dune, Cyberpunk"
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
                MEDIUM TYPE
              </label>
              <select
                className="fih-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  background: '#241a15',
                  borderColor: '#4d3324',
                  color: '#fdf6e2',
                }}
              >
                <option value="movie">🎬 Movie Reel</option>
                <option value="show">📺 TV Chronicle</option>
                <option value="anime">⛩️ Anime Scroll</option>
                <option value="book">📖 Literary Volume</option>
                <option value="paper">📜 Research Paper</option>
              </select>
            </div>

            <PixelButton
              type="submit"
              variant="golden"
              disabled={adding}
              style={{ minHeight: 42, padding: '0 18px', width: '100%' }}
            >
              <Plus size={16} />
              <span>{adding ? 'Loading...' : 'Load onto Projector'}</span>
            </PixelButton>
          </div>
        </form>
      </WoodPanel>

      {/* 3. Three-Column Cinema Kanban Shelves */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {/* Shelf 1: Now Showing / Planned */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: '#241a15',
              border: '2px solid #4d3324',
              borderRadius: 6,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fdf6e2', margin: 0, textTransform: 'uppercase', fontFamily: 'var(--font-pixel, monospace)' }}>
              Now Showing ({planned.length})
            </h3>
            <PixelBadge variant="default" size="sm">
              TICKETS
            </PixelBadge>
          </div>

          {planned.length === 0 ? (
            <WoodPanel variant="default" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ color: '#a38d7b', fontSize: 12, margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
                No planned reels in the queue.
              </p>
            </WoodPanel>
          ) : (
            planned.map(renderItem)
          )}
        </div>

        {/* Shelf 2: In Projection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: '#241a15',
              border: '2px solid #4d3324',
              borderRadius: 6,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#8fc45a', margin: 0, textTransform: 'uppercase', fontFamily: 'var(--font-pixel, monospace)' }}>
              In Projection ({inProgress.length})
            </h3>
            <PixelBadge variant="success" size="sm">
              PROJECTING
            </PixelBadge>
          </div>

          {inProgress.length === 0 ? (
            <WoodPanel variant="default" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ color: '#a38d7b', fontSize: 12, margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
                Screen beam is idling.
              </p>
            </WoodPanel>
          ) : (
            inProgress.map(renderItem)
          )}
        </div>

        {/* Shelf 3: Watched Shelf */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: '#241a15',
              border: '2px solid #4d3324',
              borderRadius: 6,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f2c230', margin: 0, textTransform: 'uppercase', fontFamily: 'var(--font-pixel, monospace)' }}>
              Watched Archive ({done.length})
            </h3>
            <PixelBadge variant="warning" size="sm">
              ARCHIVED
            </PixelBadge>
          </div>

          {done.length === 0 ? (
            <WoodPanel variant="default" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ color: '#a38d7b', fontSize: 12, margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
                No completed chronicles yet.
              </p>
            </WoodPanel>
          ) : (
            done.map(renderItem)
          )}
        </div>
      </div>
    </div>
  );
}
