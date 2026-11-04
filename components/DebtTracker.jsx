import { useState, useEffect } from 'react';
import { fireSuccessBurst, fireBigCelebration } from '@/lib/confetti';
import { toast } from 'sonner';
import {
  Plus,
  Check,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Coins,
  Scale,
  Stamp,
  BookOpen,
  History,
} from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';
import WoodPanel from '@/components/ui/WoodPanel';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

function cleanNote(note, personName) {
  if (!note) return '';
  const stopWords = ['i', 'me', 'you', 'my', 'rs', 'inr', 'rupees', 'owes', 'owe', 'owed', 'give', 'pay', 'paid'];
  const lowerName = personName ? personName.toLowerCase() : '';
  const words = note.trim().split(/\s+/).filter((w) => {
    const lw = w.toLowerCase();
    return lw !== lowerName && !stopWords.includes(lw);
  });
  return words.join(' ');
}

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
      setDebts(data.debts || []);
      setSummary(data.summary || { totalOwe: 0, totalOwed: 0, net: 0 });
    }
    setLoading(false);
  }

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      fetchDebts();
    }, 0);
    return () => clearTimeout(loadTimer);
  }, []);

  async function addDebt(e) {
    e.preventDefault();
    if (!person.trim() || !amount) return;
    setAdding(true);
    const parsedAmount = parseFloat(amount);
    const res = await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person: person.trim(), amount: parsedAmount, direction, note: note.trim() }),
    });

    if (res.ok) {
      soundManager.playSfx('coin');
      eventBus.emit(EVENTS.DEBT_CREATED, { person: person.trim(), amount: parsedAmount, direction });
      setPerson('');
      setAmount('');
      setNote('');
      setDirection('i_owe');
      toast.success('Favor recorded in Bram’s ledger 🪙');
      await fetchDebts();
    } else {
      toast.error('Failed to save record');
    }
    setAdding(false);
  }

  async function settleSingleDebt(debtId) {
    soundManager.playSfx('stamp');
    fireSuccessBurst();
    const target = debts.find((d) => d._id === debtId);
    eventBus.emit(EVENTS.DEBT_SETTLED, { id: debtId, person: target?.person, amount: target?.amount });
    await fetch(`/api/debts/${debtId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settled: true }),
    });
    toast.success('Favor settled with wax seal!');
    fetchDebts();
  }

  async function settleAll(personName) {
    soundManager.playSfx('fanfare');
    fireBigCelebration();
    const toSettle = debts.filter((d) => d.person === personName && !d.settled);
    eventBus.emit(EVENTS.DEBT_SETTLED, { person: personName, count: toSettle.length });
    await Promise.all(
      toSettle.map((d) =>
        fetch(`/api/debts/${d._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settled: true }),
        })
      )
    );
    toast.success(`Settled all tabs with ${personName} 🪙`);
    fetchDebts();
  }

  const activeDebts = debts.filter((d) => !d.settled);

  // Group active debts by person
  const byPerson = {};
  activeDebts.forEach((d) => {
    if (!byPerson[d.person]) byPerson[d.person] = [];
    byPerson[d.person].push(d);
  });

  function getPersonNet(ds) {
    let owe = 0;
    let owed = 0;
    ds.filter((d) => !d.settled).forEach((d) => {
      if (d.direction === 'i_owe') owe += d.amount;
      else owed += d.amount;
    });
    return owed - owe;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const filteredJournal = debts.filter((d) => {
    if (journalFilter === 'settled') return d.settled;
    if (journalFilter === 'active') return !d.settled;
    return true;
  });

  if (loading) {
    return (
      <div className="animate-fade">
        <div className="grid-summary" style={{ marginBottom: 24 }}>
          <div className="summary-card skeleton-loading" style={{ height: 96 }} />
          <div className="summary-card skeleton-loading" style={{ height: 96 }} />
          <div className="summary-card skeleton-loading" style={{ height: 96 }} />
        </div>
        <SkeletonLoader count={3} height={80} />
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Hero Summary: The Brass Balance Scales */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}
      >
        {/* You Owe Card */}
        <WoodPanel variant="default" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              You Owe (Payable)
            </span>
            <ArrowDownLeft size={16} color="#c2415a" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#c2415a', fontFamily: 'var(--font-pixel, monospace)' }}>
            ₹{summary.totalOwe.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Unsettled tabs in valley
          </div>
        </WoodPanel>

        {/* Owed to You Card */}
        <WoodPanel variant="default" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Owed to You (Receivable)
            </span>
            <ArrowUpRight size={16} color="#8fc45a" />
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#8fc45a', fontFamily: 'var(--font-pixel, monospace)' }}>
            ₹{summary.totalOwed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
            Gold due from neighbors
          </div>
        </WoodPanel>

        {/* Net Ledger Position */}
        <WoodPanel variant="golden" style={{ padding: '16px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f2c230', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Balance Position
            </span>
            <Scale size={16} color="#f2c230" />
          </div>
          <div
            className="tabular-nums"
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: summary.net >= 0 ? '#8fc45a' : '#c2415a',
              fontFamily: 'var(--font-pixel, monospace)',
            }}
          >
            {summary.net >= 0 ? '+' : ''}₹{summary.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: '#c4b5a5', marginTop: 4 }}>
            {summary.net >= 0 ? 'Surplus in gold pouch' : 'Net deficit owed'}
          </div>
        </WoodPanel>
      </div>

      {/* 2. Inscribe in Ledger Form */}
      <WoodPanel variant="default" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Coins size={16} color="#f2c230" />
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fdf6e2', margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
            Inscribe New Tab in Bram’s Ledger
          </h3>
        </div>

        <form onSubmit={addDebt}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
              gap: 12,
              alignItems: 'end',
            }}
          >
            <div>
              <label style={{ fontSize: 11, color: '#c4b5a5', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
                PERSON / NEIGHBOR
              </label>
              <input
                className="fih-input"
                style={{ background: '#24140b', border: '1px solid #7b4a28', color: '#fdf6e2' }}
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g. Alex"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#c4b5a5', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
                GOLD AMOUNT (₹)
              </label>
              <input
                className="fih-input tabular-nums"
                style={{ background: '#24140b', border: '1px solid #7b4a28', color: '#fdf6e2' }}
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#c4b5a5', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
                DIRECTION
              </label>
              <select
                className="fih-input"
                style={{ background: '#24140b', border: '1px solid #7b4a28', color: '#fdf6e2' }}
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
              >
                <option value="i_owe">🔴 I owe them (Borrowed)</option>
                <option value="owed_to_me">🟢 They owe me (Lent)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#c4b5a5', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
                NOTE / FAVOR DETAILS
              </label>
              <input
                className="fih-input"
                style={{ background: '#24140b', border: '1px solid #7b4a28', color: '#fdf6e2' }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Dinner at saloon"
              />
            </div>

            <div>
              <PixelButton
                type="submit"
                variant="primary"
                size="md"
                disabled={adding}
                style={{ width: '100%', height: 40 }}
              >
                <Plus size={15} />
                <span>{adding ? 'Inscribing...' : 'Record Tab'}</span>
              </PixelButton>
            </div>
          </div>
        </form>
      </WoodPanel>

      {/* 3. Navigation Controls: Active Balances vs Full Journal */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <PixelButton
            variant={activeTab === 'balances' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('balances')}
          >
            <Coins size={12} />
            <span>Active Tabs ({Object.keys(byPerson).length} People)</span>
          </PixelButton>

          <PixelButton
            variant={activeTab === 'journal' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('journal')}
          >
            <History size={12} />
            <span>Journal Archive ({debts.length})</span>
          </PixelButton>
        </div>

        <PixelButton
          variant="secondary"
          size="sm"
          onClick={fetchDebts}
          title="Refresh ledger"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </PixelButton>
      </div>

      {/* 4. Tab 1: Active Balances Grouped by Person */}
      {activeTab === 'balances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.keys(byPerson).length === 0 ? (
            <WoodPanel style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🦡⚖️</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f2c230', margin: '0 0 6px 0' }}>
                The ledger is completely clean!
              </h3>
              <p style={{ color: '#c4b5a5', fontSize: 13, margin: 0 }}>
                Bram is polishing the scale in the quiet lantern light. All debts are settled and tabs cleared.
              </p>
            </WoodPanel>
          ) : (
            Object.entries(byPerson).map(([personName, personDebts]) => {
              const net = getPersonNet(personDebts);
              return (
                <WoodPanel key={personName} variant="default" style={{ padding: '16px 18px' }}>
                  {/* Person Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 10,
                      marginBottom: 12,
                      paddingBottom: 10,
                      borderBottom: '1px solid rgba(123, 74, 40, 0.4)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#fdf6e2' }}>
                          {personName}
                        </span>
                        <PixelBadge variant={net >= 0 ? 'success' : 'danger'}>
                          {net >= 0 ? 'Owes You' : 'You Owe'} ₹{Math.abs(net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </PixelBadge>
                      </div>
                      <span style={{ fontSize: 11, color: '#a38d7b', marginTop: 2, display: 'block' }}>
                        {personDebts.length} active ledger record{personDebts.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <PixelButton
                      variant="golden"
                      size="sm"
                      onClick={() => settleAll(personName)}
                      title={`Settle all tabs with ${personName} with wax seal`}
                    >
                      <Stamp size={12} />
                      <span>Settle All with {personName}</span>
                    </PixelButton>
                  </div>

                  {/* Individual debts list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {personDebts.map((d) => (
                      <div
                        key={d._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: 8,
                          border: '1px solid rgba(123, 74, 40, 0.3)',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, color: d.direction === 'i_owe' ? '#c2415a' : '#8fc45a', fontWeight: 700 }}>
                            {d.direction === 'i_owe' ? '🔴 You owe' : '🟢 Owes you'}
                          </span>
                          <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: '#fdf6e2' }}>
                            ₹{d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          {d.note && (
                            <span style={{ fontSize: 12, color: '#c4b5a5', fontStyle: 'italic' }}>
                              “{cleanNote(d.note, d.person)}”
                            </span>
                          )}
                          <span style={{ fontSize: 10, color: '#a38d7b' }}>
                            {formatDate(d.createdAt)}
                          </span>
                        </div>

                        <PixelButton
                          variant="secondary"
                          size="sm"
                          onClick={() => settleSingleDebt(d._id)}
                          title="Settle this specific tab"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                        >
                          <Check size={11} />
                          <span>Settle</span>
                        </PixelButton>
                      </div>
                    ))}
                  </div>
                </WoodPanel>
              );
            })
          )}
        </div>
      )}

      {/* 5. Tab 2: Journal Archive */}
      {activeTab === 'journal' && (
        <WoodPanel variant="default" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fdf6e2', margin: 0 }}>
              Transaction Journal History
            </h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'active', 'settled'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setJournalFilter(f)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: journalFilter === f ? '1px solid #f2c230' : '1px solid #7b4a28',
                    background: journalFilter === f ? '#7b4a28' : '#2b1a11',
                    color: journalFilter === f ? '#f2c230' : '#c4b5a5',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredJournal.length === 0 ? (
              <p style={{ color: '#a38d7b', fontSize: 12, textAlign: 'center', padding: 16 }}>
                No records matching this filter in Bram&apos;s journal.
              </p>
            ) : (
              filteredJournal.map((d) => (
                <div
                  key={d._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: d.settled ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)',
                    borderRadius: 6,
                    border: '1px solid rgba(123, 74, 40, 0.25)',
                    opacity: d.settled ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <PixelBadge variant={d.settled ? 'success' : 'warning'}>
                      {d.settled ? 'SEALED / SETTLED' : 'ACTIVE'}
                    </PixelBadge>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#fdf6e2' }}>
                      {d.person}
                    </span>
                    <span className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: d.direction === 'i_owe' ? '#c2415a' : '#8fc45a' }}>
                      {d.direction === 'i_owe' ? '-₹' : '+₹'}{d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    {d.note && (
                      <span style={{ fontSize: 11, color: '#c4b5a5', fontStyle: 'italic' }}>
                        “{cleanNote(d.note, d.person)}”
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: '#a38d7b' }}>
                    {formatDate(d.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </WoodPanel>
      )}
    </div>
  );
}
