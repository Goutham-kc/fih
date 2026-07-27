import { useState, useEffect } from 'react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDone, setShowDone] = useState(false);
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
    if (!confirm('Delete this to-do?')) return;
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    fetchTodos();
  }

  function isOverdue(todo) {
    return todo.status === 'open' && todo.dueDate && new Date(todo.dueDate) < new Date();
  }

  function formatDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const open = todos.filter(t => t.status === 'open');
  const done = todos.filter(t => t.status === 'done');

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div className="animate-fade">
      {/* Add form */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={addTodo}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Task</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?" required />
            </div>
            <div className="form-group">
              <label>Due date</label>
              <input className="input" type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding} style={{ alignSelf: 'flex-end' }}>
              {adding ? '...' : '+ Add'}
            </button>
          </div>
        </form>
      </div>

      {/* Open todos */}
      {open.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>All clear! Add a to-do above.</p>
        </div>
      ) : (
        open.map(todo => (
          <div key={todo._id} className="todo-item">
            <input
              type="checkbox"
              checked={false}
              onChange={() => markDone(todo._id, todo.status)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500 }}>{todo.title}</span>
                <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>
                {isOverdue(todo) && <span className="badge badge-overdue">overdue</span>}
              </div>
              {todo.dueDate && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Due: {formatDate(todo.dueDate)}
                </div>
              )}
            </div>
            <button className="btn btn-ghost" onClick={() => deleteTodo(todo._id)}
              style={{ padding: '4px 8px', fontSize: 16 }}>🗑️</button>
          </div>
        ))
      )}

      {/* Done section */}
      {done.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="divider" />
          <button className="btn btn-ghost" onClick={() => setShowDone(!showDone)}
            style={{ fontSize: 13, marginBottom: 8 }}>
            {showDone ? '▲' : '▼'} Completed ({done.length})
          </button>
          {showDone && done.map(todo => (
            <div key={todo._id} className="todo-item done-item">
              <input type="checkbox" checked={true} onChange={() => markDone(todo._id, todo.status)} />
              <div style={{ flex: 1 }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{todo.title}</span>
              </div>
              <button className="btn btn-ghost" onClick={() => deleteTodo(todo._id)}
                style={{ padding: '4px 8px', fontSize: 14 }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
