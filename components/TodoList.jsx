import { useState, useEffect } from 'react';
import { fireSuccessBurst } from '@/lib/confetti';
import { toast } from 'sonner';
import {
  Plus,
  RefreshCw,
  Trash2,
  Calendar,
  Check,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  List,
  Sprout,
  CheckCircle2,
} from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';
import WoodPanel from '@/components/ui/WoodPanel';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDone, setShowDone] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('plot'); // 'plot' (Garden Plot) | 'ledger' (Classic List)
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [adding, setAdding] = useState(false);

  async function fetchTodos() {
    const res = await fetch('/api/todos');
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      fetchTodos();
    }, 0);
    return () => clearTimeout(loadTimer);
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    const isoDueDate = dueDate ? new Date(dueDate).toISOString() : null;
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), dueDate: isoDueDate, priority }),
    });

    if (res.ok) {
      soundManager.playSfx('quest');
      eventBus.emit(EVENTS.TASK_CREATED, { title: title.trim() });
      setTitle('');
      setDueDate('');
      setPriority('medium');
      toast.success('Quest recorded on the farm ledger 🌾');
      await fetchTodos();
    } else {
      toast.error('Failed to add quest');
    }
    setAdding(false);
  }

  async function markDone(id, currentStatus) {
    const nextStatus = currentStatus === 'done' ? 'open' : 'done';
    if (nextStatus === 'done') {
      soundManager.playSfx('harvest');
      fireSuccessBurst();
      const targetTodo = todos.find((t) => t._id === id);
      eventBus.emit(EVENTS.TASK_COMPLETED, { id, title: targetTodo?.title || '' });
    } else {
      soundManager.playSfx('wood');
    }
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchTodos();
  }

  async function deleteTodo(id, todoTitle) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    soundManager.playSfx('wood');
    toast('Task deleted', {
      description: todoTitle || '',
    });
    fetchTodos();
  }

  function isOverdue(todo) {
    return todo.status === 'open' && todo.dueDate && new Date(todo.dueDate) < new Date();
  }

  function formatDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Derive crop stage based on state and due date
  function getCropStage(todo) {
    if (todo.status === 'done') return { icon: '🌾', label: 'Harvested', color: '#f2c230' };
    if (isOverdue(todo)) return { icon: '🥀', label: 'Overdue', color: '#c2415a' };
    if (todo.dueDate) {
      const diffHours = (new Date(todo.dueDate) - new Date()) / (1000 * 60 * 60);
      if (diffHours < 24) return { icon: '🌿', label: 'Ripe / Due Soon', color: '#8fc45a' };
    }
    return { icon: '🌱', label: 'Growing', color: '#4f9bd1' };
  }

  const open = todos.filter(
    (t) => t.status === 'open' && (filterPriority === 'all' || t.priority === filterPriority)
  );
  const done = todos.filter((t) => t.status === 'done');

  if (loading) {
    return (
      <div className="animate-fade">
        <WoodPanel style={{ marginBottom: 24, height: 112 }}>
          <div className="skeleton-loading" style={{ height: 40, width: '100%', borderRadius: 10, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton-loading" style={{ height: 34, width: 140, borderRadius: 8 }} />
            <div className="skeleton-loading" style={{ height: 34, width: 140, borderRadius: 8 }} />
          </div>
        </WoodPanel>
        <SkeletonLoader count={4} height={64} />
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Plant a Seed / Add Quest Form */}
      <WoodPanel variant="default" style={{ padding: '18px 20px' }}>
        <form onSubmit={addTodo}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: -4 }}>
              <Sprout size={16} color="#8fc45a" />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#fdf6e2',
                  fontFamily: 'var(--font-pixel, monospace)',
                }}
              >
                Plant a Seed on the Farm
              </span>
            </div>

            <div className="form-row-responsive" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="fih-input"
                style={{
                  flex: 1,
                  minWidth: 260,
                  fontSize: 14,
                  background: '#24140b',
                  border: '2px solid #7b4a28',
                  color: '#fdf6e2',
                }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What chore will you tackle today on the farm?"
                required
              />
              <PixelButton
                type="submit"
                variant="primary"
                size="md"
                disabled={adding}
              >
                <Plus size={15} />
                <span>{adding ? 'Planting...' : 'Plant Quest'}</span>
              </PixelButton>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#c4b5a5', fontWeight: 700, letterSpacing: '0.04em' }}>
                  DUE DATE
                </span>
                <input
                  className="fih-input"
                  type="datetime-local"
                  style={{
                    width: 'auto',
                    minHeight: 34,
                    padding: '4px 10px',
                    fontSize: 13,
                    background: '#24140b',
                    border: '1px solid #7b4a28',
                    color: '#fdf6e2',
                  }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#c4b5a5', fontWeight: 700, letterSpacing: '0.04em' }}>
                  CROP PRIORITY
                </span>
                <select
                  className="fih-input"
                  style={{
                    width: 'auto',
                    minHeight: 34,
                    padding: '4px 28px 4px 10px',
                    fontSize: 13,
                    background: '#24140b',
                    border: '1px solid #7b4a28',
                    color: '#fdf6e2',
                  }}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">🌱 Low (Radish)</option>
                  <option value="medium">🌿 Medium (Parsnip)</option>
                  <option value="high">⭐ High (Starfruit)</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </WoodPanel>

      {/* 2. Controls & Garden / Ledger Toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 18,
              fontWeight: 700,
              color: '#fdf6e2',
              margin: 0,
            }}
          >
            🌾 The Seedbed ({open.length} growing)
          </h2>

          <PixelButton
            variant="secondary"
            size="sm"
            onClick={fetchTodos}
            title="Refresh quests"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </PixelButton>

          {/* View Mode Toggle: Garden Plot vs Classic Ledger */}
          <div
            style={{
              display: 'inline-flex',
              background: '#24140b',
              border: '1px solid #7b4a28',
              borderRadius: 6,
              padding: 2,
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('plot')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                background: viewMode === 'plot' ? '#7b4a28' : 'transparent',
                color: viewMode === 'plot' ? '#f2c230' : '#c4b5a5',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <LayoutGrid size={12} />
              <span>Garden</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ledger')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                background: viewMode === 'ledger' ? '#7b4a28' : 'transparent',
                color: viewMode === 'ledger' ? '#f2c230' : '#c4b5a5',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <List size={12} />
              <span>Ledger</span>
            </button>
          </div>

          {filterPriority !== 'all' && (
            <button
              type="button"
              onClick={() => setFilterPriority('all')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f2c230',
                fontSize: 11,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Priority Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <PixelButton
              key={p}
              variant={filterPriority === p ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterPriority(p)}
            >
              {p === 'high' ? '⭐ High' : p === 'medium' ? '🌿 Medium' : p === 'low' ? '🌱 Low' : 'All Crops'}
            </PixelButton>
          ))}
        </div>
      </div>

      {/* 3. Task List or Garden Plot Grid */}
      {open.length === 0 ? (
        <WoodPanel style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌾✨</div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f2c230', margin: '0 0 6px 0' }}>
            The fields are fully harvested!
          </h3>
          <p style={{ color: '#c4b5a5', fontSize: 13, margin: 0 }}>
            Pip is resting on the farmhouse porch. Add a new chore or enjoy the calm valley breeze.
          </p>
        </WoodPanel>
      ) : viewMode === 'plot' ? (
        /* GARDEN PLOT GRID VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {open.map((todo) => {
            const crop = getCropStage(todo);
            return (
              <div
                key={todo._id}
                className="pixel-plot-card"
                style={{
                  background: 'linear-gradient(180deg, #3d2315 0%, #24140b 100%)',
                  border: isOverdue(todo) ? '2px solid #c2415a' : '2px solid #7b4a28',
                  borderRadius: 10,
                  padding: '14px 16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }} title={crop.label}>{crop.icon}</span>
                    <div>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#fdf6e2',
                          display: 'block',
                          wordBreak: 'break-word',
                        }}
                      >
                        {todo.title}
                      </span>
                      <span style={{ fontSize: 11, color: crop.color, fontWeight: 600 }}>
                        {crop.label}
                      </span>
                    </div>
                  </div>

                  <PixelBadge variant={todo.priority === 'high' ? 'warning' : todo.priority === 'low' ? 'neutral' : 'success'}>
                    {todo.priority}
                  </PixelBadge>
                </div>

                {todo.dueDate && (
                  <div
                    style={{
                      fontSize: 11,
                      color: isOverdue(todo) ? '#c2415a' : '#c4b5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Calendar size={12} />
                    <span>Due: {formatDate(todo.dueDate)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 6, borderTop: '1px solid rgba(123, 74, 40, 0.4)' }}>
                  <PixelButton
                    variant="primary"
                    size="sm"
                    onClick={() => markDone(todo._id, todo.status)}
                  >
                    <Check size={13} />
                    <span>Harvest</span>
                  </PixelButton>

                  <button
                    type="button"
                    onClick={() => deleteTodo(todo._id, todo.title)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#a38d7b',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                    title="Compost / Delete task"
                    aria-label={`Delete task: ${todo.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CLASSIC LEDGER LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {open.map((todo) => (
            <div
              key={todo._id}
              className="todo-item stagger-item"
              style={{
                background: 'linear-gradient(180deg, #2b1a11 0%, #1f130b 100%)',
                border: '2px solid #7b4a28',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <div
                className="custom-checkbox"
                onClick={() => markDone(todo._id, todo.status)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    markDone(todo._id, todo.status);
                  }
                }}
                tabIndex={0}
                role="checkbox"
                aria-checked="false"
                aria-label={`Mark task "${todo.title}" as complete`}
                title="Mark as complete"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#fdf6e2',
                      wordBreak: 'break-word',
                    }}
                  >
                    {todo.title}
                  </span>
                  <PixelBadge variant={todo.priority === 'high' ? 'warning' : 'neutral'}>
                    {todo.priority}
                  </PixelBadge>
                  {isOverdue(todo) && (
                    <PixelBadge variant="danger">
                      <AlertCircle size={10} /> overdue
                    </PixelBadge>
                  )}
                </div>
                {todo.dueDate && (
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 12,
                      color: isOverdue(todo) ? '#c2415a' : '#c4b5a5',
                      marginTop: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Calendar size={12} />
                    Due: {formatDate(todo.dueDate)}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => deleteTodo(todo._id, todo.title)}
                style={{ color: '#a38d7b', padding: '6px 8px', minHeight: 36, cursor: 'pointer' }}
                title="Delete task"
                aria-label={`Delete task: ${todo.title}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4. Completed Tasks Toggle Section */}
      {done.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            className="pixel-btn secondary"
            onClick={() => setShowDone(!showDone)}
            style={{ fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}
          >
            {showDone ? '▲ Hide Harvested' : '▼ Show Harvested'} ({done.length} crops)
          </button>

          {showDone && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {done.map((todo) => (
                <div
                  key={todo._id}
                  className="todo-item done-item"
                  style={{
                    background: '#1a0f08',
                    border: '1px solid #5a361d',
                    borderRadius: 8,
                    padding: '8px 12px',
                    opacity: 0.75,
                  }}
                >
                  <div
                    className="custom-checkbox checked"
                    onClick={() => markDone(todo._id, todo.status)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        markDone(todo._id, todo.status);
                      }
                    }}
                    tabIndex={0}
                    role="checkbox"
                    aria-checked="true"
                    aria-label={`Mark task "${todo.title}" as open`}
                    title="Mark as open"
                  >
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        textDecoration: 'line-through',
                        color: '#a38d7b',
                        fontSize: 14,
                        wordBreak: 'break-word',
                      }}
                    >
                      {todo.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => deleteTodo(todo._id, todo.title)}
                    style={{ color: '#a38d7b', padding: '6px 8px', minHeight: 32, cursor: 'pointer' }}
                    title="Delete task"
                    aria-label={`Delete completed task: ${todo.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
