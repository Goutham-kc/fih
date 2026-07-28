import { useState, useEffect } from 'react';

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
      setTodos(data.todos);
    }
    setLoading(false);
  }

  useEffect(() => { fetchTodos(); }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, dueDate: dueDate || null, priority }),
    });
    setTitle('');
    setDueDate('');
    setPriority('medium');
    await fetchTodos();
    setAdding(false);
  }

  async function markDone(id, currentStatus) {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: currentStatus === 'done' ? 'open' : 'done' }),
    });
    fetchTodos();
  }

  async function deleteTodo(id) {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    fetchTodos();
  }

  function isOverdue(todo) {
    return todo.status === 'open' && todo.dueDate && new Date(todo.dueDate) < new Date();
  }

  function formatDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const open = todos.filter(t => t.status === 'open' && (filterPriority === 'all' || t.priority === filterPriority));
  const done = todos.filter(t => t.status === 'done');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
        <div>Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Create Todo Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={addTodo}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                className="input"
                style={{ flex: 1, fontSize: 15 }}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done today?"
                required
              />
              <button type="submit" className="btn btn-primary" disabled={adding} style={{ height: 46, padding: '0 24px' }}>
                {adding ? 'Adding...' : '+ Add Task'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>DUE</span>
                <input
                  className="input"
                  type="datetime-local"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>PRIORITY</span>
                <select
                  className="input"
                  style={{ width: 'auto', padding: '6px 32px 6px 12px', fontSize: 13 }}
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Open Tasks ({open.length})</h2>
          {filterPriority !== 'all' && (
            <button className="btn btn-ghost" onClick={() => setFilterPriority('all')} style={{ fontSize: 12, padding: '2px 8px' }}>
              Reset filter
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'high', 'medium', 'low'].map(p => (
            <button
              key={p}
              className={`btn ${filterPriority === p ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setFilterPriority(p)}
              style={{ fontSize: 12, padding: '4px 10px', textTransform: 'capitalize' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {open.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No pending tasks!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All caught up or try clearing your priority filters.</p>
        </div>
      ) : (
        open.map(todo => (
          <div key={todo._id} className="todo-item">
            <div
              className="custom-checkbox"
              onClick={() => markDone(todo._id, todo.status)}
              title="Mark as done"
            >
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{todo.title}</span>
                <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>
                {isOverdue(todo) && <span className="badge badge-overdue">overdue</span>}
              </div>
              {todo.dueDate && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>📅</span> {formatDate(todo.dueDate)}
                </div>
              )}
            </div>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => deleteTodo(todo._id)}
              style={{ color: 'var(--text-muted)', fontSize: 14 }}
              title="Delete task"
            >
              🗑️
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
            style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 12px' }}
          >
            {showDone ? '▲ Hide' : '▼ Show'} Completed Tasks ({done.length})
          </button>

          {showDone && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {done.map(todo => (
                <div key={todo._id} className="todo-item done-item">
                  <div
                    className="custom-checkbox checked"
                    onClick={() => markDone(todo._id, todo.status)}
                    title="Mark open"
                  >
                    ✓
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 14 }}>{todo.title}</span>
                  </div>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => deleteTodo(todo._id)}
                    style={{ color: 'var(--text-muted)', fontSize: 13 }}
                  >
                    🗑️
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
