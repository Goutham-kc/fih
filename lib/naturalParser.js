/**
 * Natural Language Parser for WhatsApp Messages.
 * Extracts intent, entities (person, amount, dueDate, category), and query options (sortBy, personFilter).
 */

export function parseNaturalLanguage(rawText) {
  const text = rawText.trim();

  // ── 0. LIST / QUERY PATTERNS ─────────────────────────────────────────
  const isQuery = /^(?:show|get|list|view|display|check|what|which|my)\b/i.test(text) ||
                  /\b(?:list|show|my\s+debts|my\s+todos|my\s+deadlines)\b/i.test(text);

  if (isQuery) {
    let module = null;
    if (/\b(debt|debts|money|balance|balances|ledger)\b/i.test(text)) module = 'debt';
    else if (/\b(todo|todos|task|tasks|to-do|to-dos)\b/i.test(text)) module = 'todo';
    else if (/\b(deadline|deadlines|due)\b/i.test(text)) module = 'deadline';
    else if (/\b(date|dates|birthday|birthdays)\b/i.test(text)) module = 'date';
    else if (/\b(watchlist|movies|shows|books)\b/i.test(text) || /\bwatch\s+list\b/i.test(text)) module = 'watch';

    if (!module) {
      return { type: 'list_vague', confidence: 'low' };
    }

    let sortBy = 'default';
    if (/\b(?:by|sort\s+by)\s+person\b/i.test(text) || /\bgrouped\s+by\s+person\b/i.test(text)) sortBy = 'person';
    else if (/\b(?:by|sort\s+by)\s+amount\b/i.test(text) || /\b(highest|lowest)\b/i.test(text)) sortBy = 'amount';
    else if (/\b(?:by|sort\s+by)\s+(?:time|date)\b/i.test(text) || /\b(recent|oldest)\b/i.test(text)) sortBy = 'time';
    else if (/\b(?:by|sort\s+by)\s+priority\b/i.test(text)) sortBy = 'priority';

    let personFilter = null;
    const personMatch = text.match(/\b(?:for|with|from|of)\s+([a-zA-Z]+)\b/i);
    if (personMatch) {
      const p = personMatch[1].toLowerCase();
      if (!['person', 'amount', 'time', 'date', 'priority'].includes(p)) {
        personFilter = personMatch[1];
      }
    }

    return { type: 'list', module, sortBy, personFilter, confidence: 'high' };
  }


  // ── 1. DEBT CREATION PATTERNS ──────────────────────────────────────────

  // Settle: "settle alex", "settled with alex"
  let m = text.match(/\b(?:settle|settled)(?:\s+with)?\s+([a-zA-Z]+)/i);
  if (m) {
    return { type: 'debt', action: 'settle', person: m[1], confidence: 'high' };
  }

  // I owe: "i have to give amir 300", "give john 500 for dinner", "pay alex 200"
  m = text.match(/\b(?:i\s+have\s+to\s+)?(?:give|pay|owe|send|transfer)\s+([a-zA-Z]+)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)(?:\s+(?:for|note)?\s*(.+))?/i);
  if (m) {
    return {
      type: 'debt', action: 'owe', person: m[1], amount: parseFloat(m[2]),
      direction: 'i_owe', note: m[3] || '', confidence: 'high'
    };
  }

  // I owe (Reverse order): "give 500 to alex", "pay 200 to john for lunch"
  m = text.match(/\b(?:give|pay|owe|send|transfer)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s+(?:to\s+)?([a-zA-Z]+)(?:\s+(?:for|note)?\s*(.+))?/i);
  if (m) {
    return {
      type: 'debt', action: 'owe', person: m[2], amount: parseFloat(m[1]),
      direction: 'i_owe', note: m[3] || '', confidence: 'high'
    };
  }

  // Owed to me: "amir owes me 300", "sam 500 owed", "get 300 from alex"
  m = text.match(/\b([a-zA-Z]+)\s+(?:owes\s+me|gave\s+me|needs\s+to\s+pay\s+me)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)(?:\s+(?:for|note)?\s*(.+))?/i);
  if (m) {
    return {
      type: 'debt', action: 'owed', person: m[1], amount: parseFloat(m[2]),
      direction: 'owed_to_me', note: m[3] || '', confidence: 'high'
    };
  }

  m = text.match(/\b(?:get|collect|take)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s+from\s+([a-zA-Z]+)(?:\s+(?:for|note)?\s*(.+))?/i);
  if (m) {
    return {
      type: 'debt', action: 'owed', person: m[2], amount: parseFloat(m[1]),
      direction: 'owed_to_me', note: m[3] || '', confidence: 'high'
    };
  }

  m = text.match(/\b([a-zA-Z]+)\s+(\d+(?:\.\d+)?)\s+owed(?:\s+(?:for|note)?\s*(.+))?/i);
  if (m) {
    return {
      type: 'debt', action: 'owed', person: m[1], amount: parseFloat(m[2]),
      direction: 'owed_to_me', note: m[3] || '', confidence: 'high'
    };
  }

  m = text.match(/\b([a-zA-Z]+)\s+(\d+(?:\.\d+)?)\s+owe(?:\s+(?:for|note)?\s*(.+))?/i);
  if (m) {
    return {
      type: 'debt', action: 'owe', person: m[1], amount: parseFloat(m[2]),
      direction: 'i_owe', note: m[3] || '', confidence: 'high'
    };
  }


  // ── 2. DEADLINE / DATE PATTERNS ──────────────────────────────────────────

  // Deadline: "Srp due on 24th", "Finish notes before 24th", "submit report by 15th Aug"
  m = text.match(/^(.+?)\s+(?:before|by|due(?:\s+on|\s+by)?|deadline|on)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)?/i);
  if (m) {
    const title = m[1].trim();
    const day = parseInt(m[2], 10);
    const monthStr = m[3];

    const now = new Date();
    let monthIndex = now.getMonth();
    if (monthStr) {
      const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
      monthIndex = months.indexOf(monthStr.toLowerCase().slice(0, 3));
    }

    let targetDate = new Date(now.getFullYear(), monthIndex, day, 23, 59);
    if (targetDate < now && !monthStr) {
      targetDate.setMonth(now.getMonth() + 1);
    }

    return { type: 'deadline', title, dueDate: targetDate, category: 'personal', confidence: 'high' };
  }

  // Important Date: "Mom's birthday on 14 Sept"
  m = text.match(/^(.+?)\s+(?:on|is\s+on)\s+(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i);
  if (m) {
    const title = m[1].trim();
    const day = String(m[2]).padStart(2, '0');
    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const monthNum = String(months.indexOf(m[3].toLowerCase().slice(0, 3)) + 1).padStart(2, '0');
    return { type: 'date', title, date: `${monthNum}-${day}`, recurring: 'yearly', confidence: 'high' };
  }


  // ── 3. WATCHLIST PATTERNS ─────────────────────────────────────────────

  // Watch/Read: "watch Oppenheimer", "read Atomic Habits", "movie Inception"
  m = text.match(/^(?:watch|movie|show|anime|read|book|paper)\s+(.+)/i);
  if (m) {
    const kw = text.split(/\s+/)[0].toLowerCase();
    const type = ['read', 'book', 'paper'].includes(kw) ? 'book' : 'show';
    return { type: 'watch', title: m[1].trim(), watchType: type, confidence: 'high' };
  }


  // ── 4. TO-DO VERBS ─────────────────────────────────────────────────────

  // Action verbs: "buy milk", "call dad", "clean room", "finish notes"
  if (/^(?:buy|call|clean|fix|finish|do|make|submit|check|remind\s+me\s+to)\s+/i.test(text)) {
    const title = text.replace(/^remind\s+me\s+to\s+/i, '').trim();
    return { type: 'todo', title, confidence: 'high' };
  }


  // ── 5. AMBIGUOUS / UNDERSPECIFIED ──────────────────────────────────────
  return { type: 'ambiguous', rawText: text, confidence: 'low' };
}
