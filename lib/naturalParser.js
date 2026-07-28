/**
 * Hyper-flexible Semantic Natural Language Parser for WhatsApp Messages & Group Announcements.
 * Extracts intent, entities, queries, and multi-item group announcements across arbitrary sentence structures.
 */

function getUpcomingDay(dayName) {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const targetIndex = days.indexOf(dayName.toLowerCase());
  if (targetIndex === -1) return null;

  const now = new Date();
  const currentIndex = now.getDay();
  let diff = targetIndex - currentIndex;
  if (diff <= 0) diff += 7;

  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diff);
  targetDate.setHours(23, 59, 0, 0);
  return targetDate;
}

export function parseNaturalLanguage(rawText) {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // ── 0. PARAGRAPH / GROUP ANNOUNCEMENT ENGINE ────────────────────────────
  const isMultiSentence = text.includes('.') || text.length > 40 || /\b(directed\s+to|required\s+to|all\s+students|announcement|submit|contact)\b/i.test(text);

  if (isMultiSentence) {
    const deadlineMatch = text.match(/(?:directed\s+to|required\s+to|please|pls)?\s*(?:submit|hand\s+in|turn\s+in|complete)\s+(.+?)\s+(?:by|before|on|due)\s+(friday|monday|tuesday|wednesday|thursday|saturday|sunday|\d{1,2}(?:st|nd|rd|th)?(?:\s+[a-z]+)?)/i);
    const todoMatch = text.match(/(?:pls|please|remember\s+to)?\s*(contact|call|email|get|collect|reach\s+out\s+to)\s+(.+?\b(?:for|about|to)\s+.+?)(?:\.|$)/i);

    if (deadlineMatch || todoMatch) {
      const items = [];

      if (deadlineMatch) {
        const rawTitle = deadlineMatch[1].replace(/^(?:the|all)\s+/i, '').trim();
        const dayStr = deadlineMatch[2];
        const dueDate = getUpcomingDay(dayStr) || new Date();
        items.push({
          type: 'deadline',
          title: rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1) + ' submission',
          dueDate,
          category: 'academic'
        });
      }

      if (todoMatch) {
        const action = todoMatch[1];
        const rest = todoMatch[2];
        items.push({
          type: 'todo',
          title: (action.charAt(0).toUpperCase() + action.slice(1) + ' ' + rest).trim()
        });
      }

      if (items.length > 0) {
        return { type: 'announcement', items, confidence: 'high' };
      }
    }
  }


  // ── 1. QUERY PATTERNS (List / Show / What are my) ──────────────────────
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


  // ── 2. DEBT SEMANTIC PATTERNS ──────────────────────────────────────────
  const numMatch = text.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:rs\.?|inr|₹|rupees)?\b/i);
  const amount = numMatch ? parseFloat(numMatch[1]) : null;
  const isDebtVerb = /\b(give|gave|pay|paid|owe|owed|owes|get|collect|took|transfer|send|sent|settle|settled|rupees|rs|inr|₹)\b/i.test(text);

  if (amount && isDebtVerb) {
    let person = null;

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
      let note = text
        .replace(new RegExp(person, 'gi'), '')
        .replace(/\b(?:i\s+have\s+to\s+)?(?:give|pay|owe|owed|owes|get|collect|send|transfer|rs\.?|inr|₹|\d+(?:\.\d+)?|rupees|me|i|you|to|from)\b/gi, '')
        .trim();

      return {
        type: 'debt',
        action: isSettle ? 'settle' : (direction === 'i_owe' ? 'owe' : 'owed'),
        person,
        amount,
        direction,
        note,
        confidence: 'high'
      };
    }
  }


  // ── 3. DEADLINE & DATE PATTERNS ─────────────────────────────────────────
  const dayMatch = text.match(/\b(friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/i);
  const dateMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?(?:\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)?\b/i);
  const isDeadlineKeyword = /\b(due|deadline|before|by|schedule|submit|finish|complete)\b/i.test(text);

  if ((dayMatch || dateMatch) && isDeadlineKeyword && !amount) {
    let targetDate = null;
    if (dayMatch) {
      targetDate = getUpcomingDay(dayMatch[1]);
    } else if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const monthStr = dateMatch[2];

      const now = new Date();
      let monthIndex = now.getMonth();
      if (monthStr) {
        const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        monthIndex = months.indexOf(monthStr.toLowerCase().slice(0, 3));
      }

      targetDate = new Date(now.getFullYear(), monthIndex, day, 23, 59);
      if (targetDate < now && !monthStr) {
        targetDate.setMonth(now.getMonth() + 1);
      }
    }

    let title = text
      .replace(/\b(?:due(?:\s+on|\s+by)?|deadline|before|by|on)\s+(?:the\s+)?(?:friday|monday|tuesday|wednesday|thursday|saturday|sunday|\d{1,2}(?:st|nd|rd|th)?(?:\s+[a-z]+)?)\b/gi, '')
      .trim();

    return {
      type: 'deadline',
      title: title || text,
      dueDate: targetDate || new Date(),
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


  // ── 4. WATCHLIST PATTERNS ─────────────────────────────────────────────
  const watchMatch = text.match(/^(?:watch|movie|show|anime|read|book|paper)\s+(.+)/i);
  if (watchMatch) {
    const kw = text.split(/\s+/)[0].toLowerCase();
    const type = ['read', 'book', 'paper'].includes(kw) ? 'book' : 'show';
    return { type: 'watch', title: watchMatch[1].trim(), watchType: type, confidence: 'high' };
  }


  // ── 5. REMINDER PATTERNS ───────────────────────────────────────────────
  const remindMatch = text.match(/^remind\s+(?:me\s+)?(?:to\s+)?(.+)/i);
  if (remindMatch) {
    const rawTitle = remindMatch[1].trim();
    const remindAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hr default
    return { type: 'reminder', title: rawTitle, remindAt, confidence: 'high' };
  }

  // ── 6. TO-DO VERBS ─────────────────────────────────────────────────────
  if (/^(?:buy|call|clean|fix|finish|do|make|submit|check)\s+/i.test(text)) {
    const title = text.trim();
    return { type: 'todo', title, confidence: 'high' };
  }


  // ── 6. AMBIGUOUS FALLBACK ──────────────────────────────────────────────
  return { type: 'ambiguous', rawText: text, confidence: 'low' };
}
