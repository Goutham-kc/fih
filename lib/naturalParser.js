/**
 * Hyper-flexible Semantic Natural Language Parser for WhatsApp Messages.
 * Extracts intent, entities, and queries across arbitrary word order and informal sentence structures.
 */

export function parseNaturalLanguage(rawText) {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // ── 0. QUERY PATTERNS (List / Show / What are my) ──────────────────────
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


  // ── 1. DEBT SEMANTIC PATTERNS ──────────────────────────────────────────
  const numMatch = text.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:rs\.?|inr|₹|rupees)?\b/i);
  const amount = numMatch ? parseFloat(numMatch[1]) : null;

  const isDebtVerb = /\b(give|gave|pay|paid|owe|owed|owes|get|collect|took|transfer|send|sent|settle|settled|rupees|rs|inr|₹)\b/i.test(text);

  if (amount && isDebtVerb) {
    let person = null;

    // Direct person extraction patterns
    let pm = text.match(/\b(?:give|pay|owe|send|transfer)\s+([a-zA-Z]+)\b/i) ||
             text.match(/\b(?:to|from|with)\s+([a-zA-Z]+)\b/i) ||
             text.match(/\b([a-zA-Z]+)\s+(?:owes|gave|paid|needs)\b/i) ||
             text.match(/\b([a-zA-Z]+)\s+(?:owe|owed)\b/i);

    if (pm) {
      const pCandidate = pm[1].toLowerCase();
      const debtKeywords = ['me', 'i', 'my', 'you', 'rs', 'inr', 'rupees', 'give', 'pay', 'owe', 'owed', 'owes', 'get', 'to', 'from', 'due'];
      if (!debtKeywords.includes(pCandidate)) {
        person = pm[1];
      }
    }

    if (!person) {
      const stopWords = ['i','me','my','you','he','she','we','they','have','to','for','from','in','on','at','by','give','gave','pay','paid','owe','owed','owes','get','collect','take','send','sent','transfer','settle','settled','rupees','rs','inr','due','deadline','before','with','and'];
      const candidates = words.filter(w => !stopWords.includes(w) && !/^\d+(?:\.\d+)?$/.test(w));
      if (candidates.length > 0) person = candidates[0];
    }

    if (person) {
      person = person.charAt(0).toUpperCase() + person.slice(1);
      let direction = 'i_owe';
      if (/\b(owed|owes|get|collect|from|took|gave\s+me|needs\s+to\s+pay)\b/i.test(text)) {
        direction = 'owed_to_me';
      }

      const isSettle = /\b(settle|settled)\b/i.test(text);
      return {
        type: 'debt',
        action: isSettle ? 'settle' : (direction === 'i_owe' ? 'owe' : 'owed'),
        person,
        amount,
        direction,
        note: text.replace(/\b(?:i\s+have\s+to\s+)?(?:give|pay|owe|owes|get|collect|send|transfer|rs\.?|inr|₹|\d+(?:\.\d+)?|rupees)\b/gi, '').trim(),
        confidence: 'high'
      };
    }
  }


  // ── 2. DEADLINE & DATE SEMANTIC PATTERNS ──────────────────────────────
  const dateMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?(?:\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)?\b/i);
  const isDeadlineKeyword = /\b(due|deadline|before|by|schedule|submit|finish|complete)\b/i.test(text);

  if (dateMatch && isDeadlineKeyword && !amount) {
    const day = parseInt(dateMatch[1], 10);
    const monthStr = dateMatch[2];

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

    let title = text
      .replace(/\b(?:due(?:\s+on|\s+by)?|deadline|before|by|on)\s+(?:the\s+)?\d{1,2}(?:st|nd|rd|th)?(?:\s+[a-z]+)?\b/gi, '')
      .replace(/\b\d{1,2}(?:st|nd|rd|th)?(?:\s+[a-z]+)?\s+(?:due(?:\s+on|\s+by)?|deadline|on|by|before)\b/gi, '')
      .trim();

    return {
      type: 'deadline',
      title: title || text,
      dueDate: targetDate,
      category: 'personal',
      confidence: 'high'
    };
  }

  // Important Date: "Mom's birthday on 14 Sept"
  const dateEventMatch = text.match(/^(.+?)\s+(?:on|is\s+on)\s+(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i);
  if (dateEventMatch) {
    const title = dateEventMatch[1].trim();
    const day = String(dateEventMatch[2]).padStart(2, '0');
    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const monthNum = String(months.indexOf(dateEventMatch[3].toLowerCase().slice(0, 3)) + 1).padStart(2, '0');
    return { type: 'date', title, date: `${monthNum}-${day}`, recurring: 'yearly', confidence: 'high' };
  }


  // ── 3. WATCHLIST PATTERNS ─────────────────────────────────────────────
  const watchMatch = text.match(/^(?:watch|movie|show|anime|read|book|paper)\s+(.+)/i);
  if (watchMatch) {
    const kw = text.split(/\s+/)[0].toLowerCase();
    const type = ['read', 'book', 'paper'].includes(kw) ? 'book' : 'show';
    return { type: 'watch', title: watchMatch[1].trim(), watchType: type, confidence: 'high' };
  }


  // ── 4. TO-DO VERBS ─────────────────────────────────────────────────────
  if (/^(?:buy|call|clean|fix|finish|do|make|submit|check|remind\s+me\s+to)\s+/i.test(text)) {
    const title = text.replace(/^remind\s+me\s+to\s+/i, '').trim();
    return { type: 'todo', title, confidence: 'high' };
  }


  // ── 5. AMBIGUOUS FALLBACK ──────────────────────────────────────────────
  return { type: 'ambiguous', rawText: text, confidence: 'low' };
}
