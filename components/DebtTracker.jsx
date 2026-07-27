import { useState, useEffect } from 'react';

export default function DebtTracker() {
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({ totalOwe: 0, totalOwed: 0, net: 0 });
  const [loading, setLoading] = useState(true);
  const [showSettled, setShowSettled] = useState(false);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState('i_owe');
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);

  async function fetchDebts() {
    const res = await fetch('/api/debts');
    if (res.ok) {
      const data = await res.json();
      setDebts(data.debts);
      setSummary(data.summary);
    }
    setLoading(false);
  }

  useEffect(() => { fetchDebts(); }, []);

  async function addDebt(e) {
    e.preventDefault();
    if (!person || !amount) return;
    setAdding(true);
    await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person, amount: parseFloat(amount), direction, note }),
    });
    setPerson(''); setAmount(''); setNote(''); setDirection('i_owe');
    await fetchDebts();
    setAdding(false);
  }

  async function settleAll(personName) {
    if (!confirm(`Settle all debts with ${personName}?`)) return;
    const toSettle = debts.filter(d => d.person === personName && !d.settled);
    await Promise.all(toSettle.map(d =>
      fetch(`/api/debts/${d._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settled: true }),
      })
    ));
    fetchDebts();
  }

  const visible = debts.filter(d => showSettled ? true : !d.settled);

  // Group by person
  const byPerson = {};
  visible.forEach(d => {
    if (!byPerson[d.person]) byPerson[d.person] = [];
    byPerson[d.person].push(d);
  });

  function getPersonNet(ds) {
    let owe = 0, owed = 0;
    ds.filter(d => !d.settled).forEach(d => {
      if (d.direction === 'i_owe') owe += d.amount;
      else owed += d.amount;
    });
    return owed - owe;
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div className="animate-fade">
      {/* Summary cards */}
      <div className="grid-summary" style={{ marginBottom: 20 }}>
        <div className="summary-card">
          <div className="label">You Owe</div>
          <div className="amount" style={{ color: '#ff4d6d' }}>₹{summary.totalOwe.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Owed to You</div>
          <div className="amount" style={{ color: '#06d6a0' }}>₹{summary.totalOwed.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Net</div>
          <div className="amount" style={{ color: summary.net >= 0 ? '#06d6a0' : '#ff4d6d' }}>
            {summary.net >= 0 ? '+' : ''}₹{summary.net.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Add debt form */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={addDebt}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Person</label>
              <input className="input" value={person} onChange={e => setPerson(e.target.value)} placeholder="Name" required />
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input className="input" type="number" min="0.01" step="0.01" value={amount}
                onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label>Direction</label>
              <select className="input" value={direction} onChange={e => setDirection(e.target.value)}>
                <option value="i_owe">I owe them</option>
                <option value="owed_to_me">They owe me</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Note</label>
              <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding} style={{ alignSelf: 'flex-end' }}>
              {adding ? '...' : '+ Add'}
            </button>
          </div>
        </form>
      </div>

      <button className="btn btn-ghost" onClick={() => setShowSettled(!showSettled)}
        style={{ marginBottom: 12, fontSize: 13 }}>
        {showSettled ? 'Hide settled' : 'Show settled'}
      </button>

      {Object.keys(byPerson).length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <p>No debts recorded yet.</p>
        </div>
      ) : (
        Object.entries(byPerson).map(([name, ds]) => {
          const net = getPersonNet(ds);
          return (
            <div key={name} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{name}</span>
                  <span style={{ marginLeft: 10, fontWeight: 700,
                    color: net > 0 ? '#06d6a0' : net < 0 ? '#ff4d6d' : 'var(--text-secondary)' }}>
                    {net > 0 ? `owes you ₹${net.toFixed(2)}` : net < 0 ? `you owe ₹${Math.abs(net).toFixed(2)}` : 'settled'}
                  </span>
                </div>
                {ds.some(d => !d.settled) && (
                  <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => settleAll(name)}>
                    ✓ Settle all
                  </button>
                )}
              </div>
              {ds.map(d => (
                <div key={d._id} style={{
                  fontSize: 13, color: 'var(--text-secondary)',
                  display: 'flex', gap: 8, alignItems: 'center',
                  opacity: d.settled ? 0.4 : 1, paddingLeft: 8, marginBottom: 2,
                }}>
                  <span>{d.direction === 'i_owe' ? '↑ owe' : '↓ owed'}</span>
                  <span style={{ color: 'var(--text-primary)' }}>₹{d.amount}</span>
                  {d.note && <span>· {d.note}</span>}
                  {d.settled && <span className="badge badge-done">settled</span>}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
