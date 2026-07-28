import { useState, useEffect } from 'react';

export default function DebtTracker() {
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({ totalOwe: 0, totalOwed: 0, net: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('balances'); // 'balances' | 'journal'
  const [journalFilter, setJournalFilter] = useState('all'); // 'all' | 'settled' | 'active'
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

  const activeDebts = debts.filter(d => !d.settled);

  // Group active debts by person
  const byPerson = {};
  activeDebts.forEach(d => {
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

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  const filteredJournal = debts.filter(d => {
    if (journalFilter === 'settled') return d.settled;
    if (journalFilter === 'active') return !d.settled;
    return true;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
        <div>Loading ledger...</div>
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
                <option value="i_owe">I owe them</option>
                <option value="owed_to_me">They owe me</option>
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

      {/* View Switcher Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255, 255, 255, 0.03)', padding: 4, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn ${activeTab === 'balances' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('balances')}
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              Active Balances ({activeDebts.length})
            </button>
            <button
              className={`btn ${activeTab === 'journal' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('journal')}
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              Transaction Journal ({debts.length})
            </button>
          </div>

          <button className="btn btn-secondary" onClick={fetchDebts} style={{ fontSize: 12, padding: '6px 12px' }} title="Refresh ledger">
            ↻ Refresh
          </button>
        </div>

        {activeTab === 'journal' && (
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'settled', 'active'].map(f => (
              <button
                key={f}
                className={`btn ${journalFilter === f ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setJournalFilter(f)}
                style={{ fontSize: 12, padding: '4px 10px', textTransform: 'capitalize' }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View 1: Active Balances by Person */}
      {activeTab === 'balances' && (
        Object.keys(byPerson).length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No active debts</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All balances are settled! Check the Transaction Journal for past history.</p>
          </div>
        ) : (
          Object.entries(byPerson).map(([name, ds]) => {
            const net = getPersonNet(ds);

            return (
              <div key={name} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
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
                      fontSize: 16,
                      color: '#1000a9'
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

                  <button className="btn btn-secondary" onClick={() => settleAll(name)} style={{ fontSize: 12, padding: '6px 14px' }}>
                    ✓ Settle All
                  </button>
                </div>

                {/* Debt Entries */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {ds.map(d => (
                    <div key={d._id} style={{
                      fontSize: 13,
                      background: 'rgba(14, 15, 26, 0.6)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1, minWidth: 160 }}>
                        <span style={{
                          color: d.direction === 'i_owe' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                          fontWeight: 700,
                          fontSize: 11
                        }}>
                          {d.direction === 'i_owe' ? 'YOU OWE' : 'OWES YOU'}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{d.amount}</span>
                        {d.note && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                            · {d.note}
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                        {formatDate(d.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )
      )}

      {/* View 2: Transaction Journal & History */}
      {activeTab === 'journal' && (
        filteredJournal.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No transactions in journal</h3>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 20px' }}>Date</th>
                    <th style={{ padding: '14px 20px' }}>Person</th>
                    <th style={{ padding: '14px 20px' }}>Direction</th>
                    <th style={{ padding: '14px 20px' }}>Amount</th>
                    <th style={{ padding: '14px 20px' }}>Note</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJournal.map(d => (
                    <tr key={d._id} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: d.settled ? 0.65 : 1 }}>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(d.createdAt)}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {d.person}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${d.direction === 'i_owe' ? 'badge-high' : 'badge-done'}`}>
                          {d.direction === 'i_owe' ? 'YOU OWE' : 'OWES YOU'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: d.direction === 'i_owe' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                        ₹{d.amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                        {d.note || '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {d.settled ? (
                          <span className="badge badge-done" style={{ fontSize: 11 }}>
                            Settled {d.settledDate ? `(${new Date(d.settledDate).toLocaleDateString('en-IN')})` : ''}
                          </span>
                        ) : (
                          <span className="badge badge-medium" style={{ fontSize: 11 }}>
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
