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
    if (!confirm(`Settle all active debts with ${personName}?`)) return;
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>💸</div>
        <div>Loading debts...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Hero Summary Cards */}
      <div className="grid-summary" style={{ marginBottom: 24 }}>
        <div className="summary-card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
          <div className="label">You Owe</div>
          <div className="amount" style={{ color: 'var(--accent-rose)' }}>
            ₹{summary.totalOwe.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unsettled payable</div>
        </div>

        <div className="summary-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
          <div className="label">Owed to You</div>
          <div className="amount" style={{ color: 'var(--accent-emerald)' }}>
            ₹{summary.totalOwed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unsettled receivable</div>
        </div>

        <div className="summary-card" style={{ borderLeft: `4px solid ${summary.net >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}` }}>
          <div className="label">Net Position</div>
          <div className="amount" style={{ color: summary.net >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {summary.net >= 0 ? '+' : ''}₹{summary.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overall balance</div>
        </div>
      </div>

      {/* Add Debt Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Record New Debt / Credit</h3>
        <form onSubmit={addDebt}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>PERSON</label>
              <input className="input" value={person} onChange={e => setPerson(e.target.value)} placeholder="e.g. Alex" required />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>AMOUNT (₹)</label>
              <input className="input" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>TYPE</label>
              <select className="input" value={direction} onChange={e => setDirection(e.target.value)}>
                <option value="i_owe">🔴 I owe them</option>
                <option value="owed_to_me">🟢 They owe me</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>NOTE (OPTIONAL)</label>
              <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Dinner split" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={adding} style={{ height: 46 }}>
              {adding ? 'Adding...' : '+ Save Record'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Balances by Person</h2>
        <button className="btn btn-secondary" onClick={() => setShowSettled(!showSettled)} style={{ fontSize: 12 }}>
          {showSettled ? 'Hide Settled' : 'Show Settled'}
        </button>
      </div>

      {/* Cards per Person */}
      {Object.keys(byPerson).length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No debts recorded</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Use the form above or text your WhatsApp bot: <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{'>debt owe John 500'}</code></p>
        </div>
      ) : (
        Object.entries(byPerson).map(([name, ds]) => {
          const net = getPersonNet(ds);
          const hasActive = ds.some(d => !d.settled);

          return (
            <div key={name} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16
                  }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{name}</h3>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: net > 0 ? 'var(--accent-emerald)' : net < 0 ? 'var(--accent-rose)' : 'var(--text-muted)',
                      marginTop: 2
                    }}>
                      {net > 0 ? `owes you ₹${net.toLocaleString('en-IN')}` : net < 0 ? `you owe ₹${Math.abs(net).toLocaleString('en-IN')}` : 'All settled'}
                    </div>
                  </div>
                </div>

                {hasActive && (
                  <button className="btn btn-secondary" onClick={() => settleAll(name)} style={{ fontSize: 12, padding: '6px 14px' }}>
                    ✓ Settle All
                  </button>
                )}
              </div>

              {/* Debt Entries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                {ds.map(d => (
                  <div key={d._id} style={{
                    fontSize: 13,
                    background: 'rgba(14, 15, 26, 0.6)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    opacity: d.settled ? 0.45 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        color: d.direction === 'i_owe' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                        fontWeight: 700,
                        fontSize: 11
                      }}>
                        {d.direction === 'i_owe' ? '🔴 YOU OWE' : '🟢 OWES YOU'}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{d.amount}</span>
                      {d.note && <span style={{ color: 'var(--text-muted)' }}>· {d.note}</span>}
                    </div>

                    {d.settled && <span className="badge badge-done">Settled</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
