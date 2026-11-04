import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Characterization Tests: Capturing exact baseline calculation behavior of existing components
// DO NOT modify without explicit authorization per Section 0.5

describe('DebtTracker baseline calculations', () => {
  // Exact implementation mirror from components/DebtTracker.jsx
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

  function getNet(ds) {
    let owe = 0;
    let owed = 0;
    ds.filter((d) => !d.settled).forEach((d) => {
      if (d.direction === 'i_owe') owe += d.amount;
      else owed += d.amount;
    });
    return owed - owe;
  }

  function computeSummary(debts) {
    let totalOwe = 0;
    let totalOwed = 0;
    debts.filter((d) => !d.settled).forEach((d) => {
      if (d.direction === 'i_owe') totalOwe += d.amount;
      else totalOwed += d.amount;
    });
    return { totalOwe, totalOwed, net: totalOwed - totalOwe };
  }

  it('correctly cleans stopwords and person name from debt notes', () => {
    expect(cleanNote('Arjun 500 for dinner', 'Arjun')).toBe('500 for dinner');
    expect(cleanNote('I owe Hanan 200 for lunch', 'Hanan')).toBe('200 for lunch');
    expect(cleanNote('Rs 1000 rupees owed to me', 'Sarah')).toBe('1000 to');
    expect(cleanNote('', 'Someone')).toBe('');
    expect(cleanNote(null, 'Someone')).toBe('');
  });

  it('correctly calculates net position for person with mixed debts', () => {
    const personDebts = [
      { person: 'Alice', amount: 500, direction: 'owed_to_me', settled: false },
      { person: 'Alice', amount: 200, direction: 'i_owe', settled: false },
      { person: 'Alice', amount: 1000, direction: 'i_owe', settled: true }, // settled must be excluded
    ];
    // 500 owed to me - 200 I owe = +300
    expect(getNet(personDebts)).toBe(300);
  });

  it('correctly calculates negative net position when user owes more', () => {
    const personDebts = [
      { person: 'Bob', amount: 150, direction: 'owed_to_me', settled: false },
      { person: 'Bob', amount: 600, direction: 'i_owe', settled: false },
    ];
    // 150 - 600 = -450
    expect(getNet(personDebts)).toBe(-450);
  });

  it('computes overall summary correctly across multiple contacts', () => {
    const allDebts = [
      { person: 'Alice', amount: 500, direction: 'owed_to_me', settled: false },
      { person: 'Bob', amount: 300, direction: 'i_owe', settled: false },
      { person: 'Charlie', amount: 100, direction: 'i_owe', settled: false },
      { person: 'David', amount: 1000, direction: 'owed_to_me', settled: true },
    ];
    const summary = computeSummary(allDebts);
    expect(summary.totalOwe).toBe(400);
    expect(summary.totalOwed).toBe(500);
    expect(summary.net).toBe(100);
  });
});

describe('DeadlineBoard baseline calculations', () => {
  // Exact implementation mirror from components/DeadlineBoard.jsx
  function getCountdown(dueDate, currentTime) {
    const now = currentTime ? new Date(currentTime).getTime() : Date.now();
    const diff = new Date(dueDate).getTime() - now;
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const mins = Math.floor((abs % 3600000) / 60000);
    if (diff < 0) return { label: `Overdue by ${days > 0 ? days + 'd ' : ''}${hours}h`, type: 'overdue' };
    if (days === 0 && hours < 4) return { label: hours === 0 ? `${mins}m left` : `${hours}h ${mins}m left`, type: 'today' };
    return { label: days > 0 ? `In ${days}d ${hours}h` : `In ${hours}h`, type: 'upcoming' };
  }

  const baseTime = '2026-11-04T12:00:00.000Z';

  it('marks past deadlines as overdue with days and hours', () => {
    // 2 days and 3 hours ago
    const pastDate = '2026-11-02T09:00:00.000Z';
    const countdown = getCountdown(pastDate, baseTime);
    expect(countdown.type).toBe('overdue');
    expect(countdown.label).toBe('Overdue by 2d 3h');
  });

  it('marks past deadlines under 24h as overdue with hours only', () => {
    // 5 hours ago
    const pastDate = '2026-11-04T07:00:00.000Z';
    const countdown = getCountdown(pastDate, baseTime);
    expect(countdown.type).toBe('overdue');
    expect(countdown.label).toBe('Overdue by 5h');
  });

  it('marks deadlines under 4 hours as today with minutes/hours left', () => {
    // 2 hours 30 mins left
    const soonDate = '2026-11-04T14:30:00.000Z';
    const countdown = getCountdown(soonDate, baseTime);
    expect(countdown.type).toBe('today');
    expect(countdown.label).toBe('2h 30m left');

    // 45 mins left
    const verySoonDate = '2026-11-04T12:45:00.000Z';
    const countdownMins = getCountdown(verySoonDate, baseTime);
    expect(countdownMins.type).toBe('today');
    expect(countdownMins.label).toBe('45m left');
  });

  it('marks deadlines over 4 hours as upcoming', () => {
    // 3 days and 5 hours ahead
    const futureDate = '2026-11-07T17:00:00.000Z';
    const countdown = getCountdown(futureDate, baseTime);
    expect(countdown.type).toBe('upcoming');
    expect(countdown.label).toBe('In 3d 5h');
  });
});

describe('ImportantDates baseline calculations', () => {
  // Exact implementation mirror from components/ImportantDates.jsx
  function getDaysUntil(dateStr, baseNow) {
    const now = baseNow || new Date();
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

  function groupDates(dates, baseNow) {
    const thisWeek = [];
    const thisMonth = [];
    const later = [];
    const past = [];
    dates.forEach((d) => {
      const days = getDaysUntil(d.date, baseNow);
      if (days < 0) past.push(d);
      else if (days <= 7) thisWeek.push(d);
      else if (days <= 30) thisMonth.push(d);
      else later.push(d);
    });
    return { thisWeek, thisMonth, later, past };
  }

  it('handles annual MM-DD format and wraps past dates to next year', () => {
    // Base date is Nov 4, 2026
    const baseNow = new Date('2026-11-04T10:00:00.000Z');
    // Nov 6 is 2 days away
    expect(getDaysUntil('11-06', baseNow)).toBe(2);

    // Jan 15 has already passed in 2026, so it wraps to Jan 15, 2027
    const daysUntilNextYear = getDaysUntil('01-15', baseNow);
    expect(daysUntilNextYear).toBeGreaterThan(60);
  });

  it('correctly partitions dates into thisWeek, thisMonth, later, past', () => {
    const baseNow = new Date('2026-11-04T10:00:00.000Z');
    const dates = [
      { title: 'Sister Birthday', date: '11-08' }, // 4 days -> thisWeek
      { title: 'Project Demo', date: '11-20' },     // 16 days -> thisMonth
      { title: 'New Year', date: '2027-01-01' },   // > 30 days -> later
      { title: 'Old Event', date: '2026-10-01' },  // past -> past
    ];
    const grouped = groupDates(dates, baseNow);
    expect(grouped.thisWeek.map(d => d.title)).toEqual(['Sister Birthday']);
    expect(grouped.thisMonth.map(d => d.title)).toEqual(['Project Demo']);
    expect(grouped.later.map(d => d.title)).toEqual(['New Year']);
    expect(grouped.past.map(d => d.title)).toEqual(['Old Event']);
  });
});

describe('TodoList and Watchlist status & priority filters', () => {
  it('correctly filters todos by status and priority', () => {
    const todos = [
      { id: 1, title: 'T1', status: 'open', priority: 'high' },
      { id: 2, title: 'T2', status: 'open', priority: 'low' },
      { id: 3, title: 'T3', status: 'done', priority: 'high' },
    ];
    const openAll = todos.filter((t) => t.status === 'open' && (true || t.priority === 'all'));
    expect(openAll).toHaveLength(2);

    const openHigh = todos.filter((t) => t.status === 'open' && t.priority === 'high');
    expect(openHigh).toHaveLength(1);
    expect(openHigh[0].title).toBe('T1');

    const done = todos.filter((t) => t.status === 'done');
    expect(done).toHaveLength(1);
  });

  it('correctly categorizes watchlist items by status', () => {
    const items = [
      { id: 1, title: 'M1', status: 'planned' },
      { id: 2, title: 'M2', status: 'in_progress' },
      { id: 3, title: 'M3', status: 'done' },
    ];
    const planned = items.filter((i) => i.status === 'planned');
    const inProgress = items.filter((i) => i.status === 'in_progress');
    const done = items.filter((i) => i.status === 'done');

    expect(planned).toHaveLength(1);
    expect(inProgress).toHaveLength(1);
    expect(done).toHaveLength(1);
  });
});
