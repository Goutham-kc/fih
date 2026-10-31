import { useState, useEffect } from 'react';
import { fireSuccessBurst } from '@/lib/confetti';
import { toast } from 'sonner';
import { Plus, RefreshCw, Trash2, Calendar, Check, AlertCircle } from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDone, setShowDone] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
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
    fetchTodos();
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
      setTitle('');
      setDueDate('');
      setPriority('medium');
      toast.success('Task added successfully');
      await fetchTodos();
    } else {
      toast.error('Failed to add task');
    }
    setAdding(false);
  }

  async function markDone(id, currentStatus) {
    const nextStatus = currentStatus === 'done' ? 'open' : 'done';
    if (nextStatus === 'done') {
      fireSuccessBurst();
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

  const open = todos.filter(
    (t) => t.status === 'open' && (filterPriority === 'all' || t.priority === filterPriority)
  );
  const done = todos.filter((t) => t.status === 'done');

  if (loading) {
    return (
      <div className="animate-fade">
        <div className="fih-card" style={{ marginBottom: 24, height: 112 }}>
          <div className="skeleton-loading" style={{ height: 40, width: '100%', borderRadius: 10, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton-loading" style={{ height: 34, width: 140, borderRadius: 8 }} />
            <div className="skeleton-loading" style={{ height: 34, width: 140, borderRadius: 8 }} />
          </div>
        </div>
        <SkeletonLoader count={4} height={64} />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Create Todo Form Card */}
      <div className="fih-card" style={{ marginBottom: 24 }}>
        <form onSubmit={addTodo}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                className="fih-input"
                style={{ flex: 1, fontSize: 14 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done today?"
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={adding}
                style={{ height: 42, padding: '0 20px', flexShrink: 0 }}
              >
                <Plus size={16} />
                <span>{adding ? 'Adding...' : 'Add Task'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  DUE
                </span>
                <input
                  className="fih-input"
                  type="datetime-local"
                  style={{ width: 'auto', minHeight: 36, padding: '4px 10px', fontSize: 13 }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  PRIORITY
                </span>
                <select
                  className="fih-input"
                  style={{ width: 'auto', minHeight: 36, padding: '4px 28px 4px 10px', fontSize: 13 }}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Header & Filter Controls */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Open Tasks ({open.length})
          </h2>
          <button
            className="btn btn-secondary"
            onClick={fetchTodos}
            style={{ fontSize: 12, padding: '4px 10px', minHeight: 32 }}
            title="Refresh tasks"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          {filterPriority !== 'all' && (
            <button
              className="btn btn-ghost"
              onClick={() => setFilterPriority('all')}
              style={{ fontSize: 12, padding: '2px 8px', minHeight: 32 }}
            >
              Reset filter
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              className={`btn ${filterPriority === p ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setFilterPriority(p)}
              style={{
                fontSize: 12,
                padding: '4px 12px',
                minHeight: 32,
                textTransform: 'capitalize',
                fontWeight: filterPriority === p ? 600 : 500,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {open.length === 0 ? (
        <div className="fih-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No pending tasks</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            All caught up or try resetting your priority filters.
          </p>
        </div>
      ) : (
        open.map((todo) => (
          <div key={todo._id} className="todo-item stagger-item">
            <div
              className="custom-checkbox"
              onClick={() => markDone(todo._id, todo.status)}
              title="Mark as done"
              role="checkbox"
              aria-checked="false"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    wordBreak: 'break-word',
                  }}
                >
                  {todo.title}
                </span>
                <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>
                {isOverdue(todo) && (
                  <span className="badge badge-overdue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={10} /> overdue
                  </span>
                )}
              </div>
              {todo.dueDate && (
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: 12,
                    color: isOverdue(todo) ? 'var(--accent-rose)' : 'var(--text-secondary)',
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
              className="btn btn-ghost btn-icon"
              onClick={() => deleteTodo(todo._id, todo.title)}
              style={{ color: 'var(--text-muted)', padding: '6px 8px', minHeight: 36 }}
              title="Delete task"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))
      )}

      {/* Completed Tasks Toggle Section */}
      {done.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowDone(!showDone)}
            style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 12px', minHeight: 36 }}
          >
            {showDone ? '▲ Hide' : '▼ Show'} Completed Tasks ({done.length})
          </button>

          {showDone && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {done.map((todo) => (
                <div key={todo._id} className="todo-item done-item">
                  <div
                    className="custom-checkbox checked"
                    onClick={() => markDone(todo._id, todo.status)}
                    title="Mark as open"
                    role="checkbox"
                    aria-checked="true"
                  >
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        textDecoration: 'line-through',
                        color: 'var(--text-muted)',
                        fontSize: 14,
                        wordBreak: 'break-word',
                      }}
                    >
                      {todo.title}
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => deleteTodo(todo._id, todo.title)}
                    style={{ color: 'var(--text-muted)', padding: '6px 8px', minHeight: 36 }}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
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
