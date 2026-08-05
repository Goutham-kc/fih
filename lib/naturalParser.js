/**
 * Hyper-accurate Semantic Natural Language & Text Normalizer Engine for WhatsApp.
 * Supports pre-normalization, multiline email/announcement cleaners, exact time extraction, and smart categorization.
 */
import * as chrono from 'chrono-node';


function normalizeText(text) {
  return text
    // Informal Slang & Abbreviation Replacements
    .replace(/\b(tmr|tmrw|tmro|tmrw's|tmrws|2moro|2morrow|tom)\b/gi, 'tomorrow')
    .replace(/\b(2day|tday)\b/gi, 'today')
    .replace(/\b(tonite|2night)\b/gi, 'tonight')
    .replace(/\b(nxt|next)\s+wk\b/gi, 'next week')
    .replace(/\b(eval|evaln)\b/gi, 'evaluation')
    .replace(/\b(subm|subn)\b/gi, 'submission')
    .replace(/\b(b4)\b/gi, 'before')
    .replace(/\b(pls|plz)\b/gi, 'please')
    .replace(/\b(bday)\b/gi, 'birthday')
    .replace(/\b(anniv)\b/gi, 'anniversary')
    .replace(/\b(eod|end of day|end-of-day)\b/gi, 'today 11:59pm')
    .replace(/\b(eow|end of week|end-of-week)\b/gi, 'sunday 11:59pm')
    // Times
    .replace(/\b(\d{1,2})\s*[\.:]\s*(\d{2})\s*(am|pm)\b/gi, '$1:$2 $3')
    .replace(/\b(\d{1,2})\s*(am|pm)\b/gi, '$1:00 $2')
    .replace(/\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:hr|hour|period)\b/gi, '$1th hour')
    // Currency
    .replace(/\b(\d+(?:\.\d+)?)\s*k\b/gi, (_, n) => (parseFloat(n) * 1000).toString())
    .replace(/\b(\d+(?:\.\d+)?)\s*(?:rupees|rs|inr|bucks)\b/gi, '₹$1')
    .replace(/\b(?:rupees|rs|inr)\s*(\d+(?:\.\d+)?)\b/gi, '₹$1');
}

function getUpcomingDay(dayName) {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const targetIndex = days.indexOf(dayName.toLowerCase());
  if (targetIndex === -1) return null;

  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffsetMs);

  const currentIndex = istNow.getDay();
  let diff = targetIndex - currentIndex;
  if (diff <= 0) diff += 7;

  const targetISTYear = istNow.getFullYear();
  const targetISTMonth = istNow.getMonth();
  const targetISTDay = istNow.getDate() + diff;

  // 23:59:00 IST corresponds to 18:29:00 UTC
  return new Date(Date.UTC(targetISTYear, targetISTMonth, targetISTDay, 18, 29, 0, 0));
}

function extractAmount(text) {
  const m1 = text.match(/(?:rs\.?|inr|₹)\s*(\d+(?:\.\d+)?)\b|\b(\d+(?:\.\d+)?)\s*(?:rs\.?|inr|₹|rupees|bucks)\b/i);
  if (m1) return parseFloat(m1[1] || m1[2]);

  const isDebtVerb = /\b(owe|owed|owes|give|gave|pay|paid|transfer|send|sent|settle|settled|due|balance|borrowed|lent|loaned|repaid|cleared|returned|received|got)\b/i.test(text);
  if (isDebtVerb) {
    const m2 = text.match(/\b(\d+(?:\.\d+)?)\b/);
    if (m2) return parseFloat(m2[1]);
  }

  const m3 = text.match(/\b(?:owe|owed|owes|give|pay|paid|gave|transfer|settle|borrowed|lent|loaned|repaid|cleared)\s+.*?\b(\d+(?:\.\d+)?)\b/i);
  if (m3) return parseFloat(m3[1]);

  const m4 = text.match(/\b(\d+(?:\.\d+)?)\b/);
  if (m4 && text.split(/\s+/).length <= 4) return parseFloat(m4[1]);

  return null;
}

function parseTargetTime(text) {

  // We use parse which handles NLP relative time like "in a month"
  // Set timezone to 330 (IST, UTC+5:30) to prevent 5.5 hour offset bugs
  const results = chrono.parse(text, new Date(), { timezone: 330 });
  
  if (results && results.length > 0) {
    const first = results[0];
    let parsedDate = first.date();

    // If the hour is not strictly given, set it to morning (9:00 AM IST)
    if (!first.start.isCertain('hour')) {
      const istTime = new Date(parsedDate.getTime() + 5.5 * 60 * 60 * 1000);
      istTime.setUTCHours(9, 0, 0, 0);
      parsedDate = new Date(istTime.getTime() - 5.5 * 60 * 60 * 1000);

      // If the resulting morning time is in the past, roll it to tomorrow morning
      if (parsedDate < new Date()) {
        parsedDate.setDate(parsedDate.getDate() + 1);
      }
    }
    return parsedDate;
  }

  // Fallback if chrono couldn't understand it
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffsetMs);

  let isTomorrow = /\b(tomorrow|tmr|tmrw|2moro|2morrow)\b/i.test(text);
  let isToday = /\b(today|2day|tday)\b/i.test(text);

  if (isTomorrow) {
    const istDay = istNow.getDate() + 1;
    return new Date(Date.UTC(istNow.getFullYear(), istNow.getMonth(), istDay, 3, 30, 0));
  }

  if (isToday) {
    const istDay = istNow.getDate();
    return new Date(Date.UTC(istNow.getFullYear(), istNow.getMonth(), istDay, 12, 30, 0));
  }

  return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour default
}

function cleanTitle(text) {
  let cleaned = text
    .replace(/\b(tomorrow|tmr|tmrw|tmro|tmrw's|tmrws|2moro|2morrow|tom|today|2day|tday|tonight|2night)\b/gi, '')
    .replace(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : text;
}

function extractCleanAnnouncementEvent(text) {
  let teamName = null;
  const teamMatch = text.match(/\b([A-Z0-9_-]+\s+(?:Team|Group|Batch|Class))\b/i);
  if (teamMatch) {
    teamName = teamMatch[1];
  }

  let clean = text
    .replace(/^(?:good\s+(?:morning|afternoon|evening)|hi|hello|dear|hey)\b.*?(?:\n|,|\.)/gi, '')
    .replace(/\b(?:just\s+a\s+reminder(?:\s+for)?|this\s+is\s+to\s+inform\s+you(?:\s+that)?|please\s+note\s+that)\b/gi, '')
    .trim();

  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  const mainLine = lines.find(l => /\b(call|meeting|session|lecture|class|webinar|viva|exam)\b/i.test(l)) || lines[0] || text;

  const kwMatch = mainLine.match(/\b(call|meeting|session|lecture|class|webinar|viva|exam|evaluation)\b/i);
  const kw = kwMatch ? kwMatch[1].toLowerCase() : 'event';

  let title = teamName ? `${teamName} ${kw}` : mainLine
    .replace(/\b(?:tomorrow|today|tonight|yesterday)'?s?\b/gi, '')
    .replace(/\b\d{1,2}[\.:]\d{2}(?:\s*(?:am|pm))?(?:\s*-\s*\d{1,2}[\.:]\d{2}(?:\s*(?:am|pm))?)?\b/gi, '')
    .replace(/\b(?:our|first|second|third)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  title = title.charAt(0).toUpperCase() + title.slice(1);
  return { title, remindAt: parseTargetTime(clean) };
}

export function parseNaturalLanguage(rawText) {
  const rawClean = rawText.trim();
  const text = normalizeText(rawClean);
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // ── 0. HELP / MENU / COMMANDS QUERY ─────────────────────────────────────
  if (/^(?:help|h|menu|commands|\?)$/i.test(text) || /^help\b/i.test(text)) {
    return { type: 'help', confidence: 'high' };
  }

  // ── 0a. EXPLICIT "REMIND ME" / REMINDER PATTERN (Highest priority!) ────
  const remindMeMatch = text.match(/^remind\s+(?:me\s+)?(?:at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+)?(.+)/i);
  if (remindMeMatch) {
    let reminderBody = remindMeMatch[2];

    let titleText = reminderBody;
    const toMatch = reminderBody.match(/(?:at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)|tomorrow|today|\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+to\s+(.+)/i) ||
                    reminderBody.match(/^to\s+(.+?)(?:\s+(?:at|on|by)\s+\d{1,2}|\s+(?:tomorrow|today)|$)/i) ||
                    reminderBody.match(/(.+?)\s+at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm).*)/i) ||
                    reminderBody.match(/(.+?)\s+(tomorrow|today|\d{1,2}(?::\d{2})?\s*(?:am|pm).*)/i);

    if (toMatch) {
      titleText = toMatch[1];
    }

    let cleanTitleText = titleText
      .replace(/^(?:to|that)\s+/i, '')
      .replace(/\b(?:at|on|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '')
      .replace(/\b(?:tomorrow|today|tonight)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    cleanTitleText = cleanTitleText.charAt(0).toUpperCase() + cleanTitleText.slice(1);
    const remindAt = parseTargetTime(text);
    return { type: 'reminder', title: cleanTitleText || 'Reminder', remindAt, confidence: 'high' };
  }

  // ── 0b. BULK SCHEDULE / SYLLABUS PARSER ────────────────────────────────
  const deadlineHeaderRe = /(?:week\s*\d+\s*[-–—]\s*)?deadline\s*:\s*(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})/gi;
  const headerMatches = [...rawClean.matchAll(deadlineHeaderRe)];
  if (headerMatches.length >= 2) {
    const lines = rawClean.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];
    let currentDate = null;

    for (const line of lines) {
      const headerMatch = line.match(/(?:week\s*\d+\s*[-–—]\s*)?deadline\s*:\s*(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})/i);
      if (headerMatch) {
        const day = parseInt(headerMatch[1], 10);
        const month = parseInt(headerMatch[2], 10) - 1;
        const year = parseInt(headerMatch[3], 10);
        currentDate = new Date(Date.UTC(year, month, day, 18, 29, 0, 0));
        continue;
      }

      if (!currentDate) continue;

      const cleanLine = line.replace(/^[•\-\*\u2022\u2023\u25E6\u2043]\s*/, '').trim();
      if (!cleanLine) continue;

      items.push({
        type: 'deadline',
        title: cleanLine,
        dueDate: currentDate,
        category: 'academic'
      });
    }

    if (items.length > 0) {
      return { type: 'announcement', items, confidence: 'high' };
    }
  }

  // ── 0c. MULTILINE ANNOUNCEMENT & EMAIL CLEANER ──────────────────────────
  if (/\b(good\s+morning|hi\s+team|dear\s+all|just\s+a\s+reminder)\b/i.test(rawClean) && /\b(call|meeting|session|webinar|lecture|class)\b/i.test(rawClean)) {
    const { title, remindAt } = extractCleanAnnouncementEvent(rawClean);
    return { type: 'reminder', title, remindAt, confidence: 'high' };
  }

  // Multi-clause period class schedules
  if (text.includes(',') && /\b\d{1,2}(?:st|nd|rd|th)?\s*hour\b/i.test(text)) {
    const parts = rawClean.split(',');
    const items = parts.map(p => ({
      type: 'reminder',
      title: p.trim(),
      remindAt: parseTargetTime(p.trim())
    }));
    return { type: 'multi_reminder', items, confidence: 'high' };
  }

  const isMultiSentence = text.includes('.') || text.length > 50 || /\b(directed\s+to|required\s+to|all\s+students|announcement)\b/i.test(text);
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

  // ── 0.5. FINANCIAL BALANCE QUERY ENGINE ─────────────────────────────────
  const isBalanceQuery = /\b(how\s+much|what\s+is\s+my\s+balance|total\s+debt|total\s+owed|my\s+balance|who\s+owes|who\s+do\s+i\s+owe|whom\s+do\s+i\s+owe)\b/i.test(text);
  if (isBalanceQuery) {
    let person = null;
    const pm = text.match(/\b(?:owe|owed|to|from|for|with)\s+([a-zA-Z]+)\b/i) ||
               text.match(/\b([a-zA-Z]+)\s+(?:owes|owe)\b/i);

    if (pm) {
      const candidate = pm[1].toLowerCase();
      const stopWords = ['me','i','my','you','we','they','do','does','did','am','is','are','have','has','in','total','all','much','who','whom'];
      if (!stopWords.includes(candidate)) {
        person = pm[1].charAt(0).toUpperCase() + pm[1].slice(1);
      }
    }

    return { type: 'balance_query', person, rawText: text, confidence: 'high' };
  }

  // ── 1. QUERY PATTERNS (List / Show / What are my) ──────────────────────
  const isQuery = /^(?:show|get|list|view|display|check|what|which|my|how|sort)\b/i.test(text) ||
                  /\b(?:list|show|sort|my\s+debts|my\s+todos|my\s+deadlines)\b/i.test(text) ||
                  /^(?:debts?|todos?|reminders?|deadlines?|dates?|watchlist)$/i.test(text);

  // Don't enter query mode if text also starts with a strong action verb (e.g. "Get 5 books from library")
  const isActionStart = /^(?:buy|get|bring|clean|fix|finish|do|make|pick|collect|prepare)\b/i.test(text);

  if (isQuery && !isActionStart) {
    let module = null;
    if (/\b(debt|debts|money|balance|balances|ledger)\b/i.test(text)) module = 'debt';
    else if (/\b(todo|todos|task|tasks|to-do|to-dos)\b/i.test(text)) module = 'todo';
    else if (/\b(reminder|reminders|remind)\b/i.test(text)) module = 'reminder';
    else if (/\b(deadline|deadlines|due)\b/i.test(text)) module = 'deadline';
    else if (/\b(date|dates|birthday|birthdays)\b/i.test(text)) module = 'date';
    else if (/\b(watchlist|movies|shows|books)\b/i.test(text) || /\bwatch\s+list\b/i.test(text)) module = 'watch';

    if (module) {
      let sortBy = 'default';
      if (/\b(?:by|sort\s+by)\s+person\b/i.test(text) || /\bgrouped\s+by\s+person\b/i.test(text)) sortBy = 'person';
      else if (/\b(?:by|sort\s+by)\s+amount\b/i.test(text) || /\b(highest|lowest)\b/i.test(text)) sortBy = 'amount';
      else if (/\b(?:by|sort\s+by)\s+(?:time|date)\b/i.test(text) || /\b(recent|oldest)\b/i.test(text)) sortBy = 'time';
      else if (/\b(?:by|sort\s+by)\s+priority\b/i.test(text)) sortBy = 'priority';

      let personFilter = null;
      const personMatch = text.match(/\b(?:for|with|from|of|by)\s+([a-zA-Z]+)\b/i);
      if (personMatch) {
        const p = personMatch[1].toLowerCase();
        if (!['person', 'amount', 'time', 'date', 'priority', 'default', 'name'].includes(p)) {
          personFilter = personMatch[1];
        }
      }

      return { type: 'list', module, sortBy, personFilter, confidence: 'high' };
    }
  }

  // ── 2. DEBT SEMANTIC PATTERNS ──────────────────────────────────────────
  // Plus/Minus Shorthand e.g. "Hanan +100", "+100 Hanan", "Hanan -50 for lunch"
  const pmShorthand = rawClean.match(/\b([a-zA-Z]+)\s*([+-])\s*(\d+(?:\.\d+)?)(?:\s+(?:for|note)?\s*(.+))?/i) ||
                      rawClean.match(/([+-])\s*(\d+(?:\.\d+)?)\s*([a-zA-Z]+)(?:\s+(?:for|note)?\s*(.+))?/i);
  if (pmShorthand) {
    let person, sign, amountVal, noteVal;
    if (/[+-]/.test(pmShorthand[2])) {
      person = pmShorthand[1];
      sign = pmShorthand[2];
      amountVal = parseFloat(pmShorthand[3]);
      noteVal = pmShorthand[4] || '';
    } else {
      sign = pmShorthand[1];
      amountVal = parseFloat(pmShorthand[2]);
      person = pmShorthand[3];
      noteVal = pmShorthand[4] || '';
    }
    person = person.charAt(0).toUpperCase() + person.slice(1);
    const direction = sign === '+' ? 'owed_to_me' : 'i_owe';
    return {
      type: 'debt',
      action: direction === 'i_owe' ? 'owe' : 'owed',
      person,
      amount: amountVal,
      direction,
      note: noteVal.trim(),
      confidence: 'high'
    };
  }

  // Explicit Settle command without amount (e.g. "Settle Keshu" or "Keshu settled")
  const settleMatch = text.match(/\b(?:settle|settled|clear|cleared)(?:\s+all\s+debts\s+)?(?:\s+with)?\s+([a-zA-Z]+)\b/i) ||
                      text.match(/\b([a-zA-Z]+)\s+(?:is\s+)?(?:settled|cleared)\b/i);
  if (settleMatch) {
    const pCandidate = settleMatch[1];
    const stopWords = ['me','i','my','you','we','they','all','up','debt','debts','the','our','it','this'];
    if (!stopWords.includes(pCandidate.toLowerCase())) {
      return {
        type: 'debt',
        action: 'settle',
        person: pCandidate.charAt(0).toUpperCase() + pCandidate.slice(1),
        confidence: 'high'
      };
    }
  }

  // Debt Verbs (including borrowed, lent, loaned, cleared, repaid, returned)
  const isDebtVerb = /\b(give|gave|pay|paid|owe|owed|owes|get|collect|took|transfer|send|sent|settle|settled|borrowed|lent|loaned|repaid|cleared|returned|received|got|rupees|rs|inr|₹)\b/i.test(text);
  const amount = extractAmount(text);

  if (amount && isDebtVerb) {
    let person = null;

    let pm = text.match(/\b(?:give|pay|owe|send|transfer|borrowed\s+from|lent\s+to|loaned\s+to|repaid|cleared\s+with|paid\s+back|paid)\s+([a-zA-Z]+)\b/i) ||
             text.match(/\b(?:to|from|with)\s+([a-zA-Z]+)\b/i) ||
             text.match(/\b([a-zA-Z]+)\s+(?:owes|gave|paid|needs|borrowed|lent|loaned|repaid|cleared|returned)\b/i) ||
             text.match(/\b([a-zA-Z]+)\s+(?:owe|owed)\b/i);

    if (pm) {
      const pCandidate = pm[1].toLowerCase();
      const debtKeywords = ['me', 'i', 'my', 'you', 'rs', 'inr', 'rupees', 'give', 'pay', 'owe', 'owed', 'owes', 'get', 'to', 'from', 'due', 'back'];
      if (!debtKeywords.includes(pCandidate)) {
        person = pm[1];
      }
    }

    if (!person) {
      const stopWords = ['i','me','my','you','he','she','we','they','have','to','for','from','in','on','at','by','give','gave','pay','paid','owe','owed','owes','get','collect','take','send','sent','transfer','settle','settled','borrowed','lent','loaned','repaid','cleared','returned','received','got','rupees','rs','inr','due','deadline','before','with','and','back'];
      const candidates = words.filter(w => !stopWords.includes(w) && !/^\d+(?:\.\d+)?$/.test(w));
      if (candidates.length > 0) person = candidates[0];
    }

    if (person) {
      person = person.charAt(0).toUpperCase() + person.slice(1);

      let isSettle = /\b(settle|settled|cleared|repaid|paid\s+back|returned)\b/i.test(text);
      let direction = 'i_owe';

      if (/\b(owed|owes|get|collect|from|took|gave\s+me|needs\s+to\s+pay|lent|loaned|borrowed\s+from\s+me)\b/i.test(text)) {
        direction = 'owed_to_me';
      } else if (/\b(borrowed\s+from|borrowed)\b/i.test(text) && !/from\s+me/i.test(text)) {
        direction = 'i_owe';
      }

      let note = text
        .replace(new RegExp(person, 'gi'), '')
        .replace(/\b(?:i\s+have\s+to\s+)?(?:give|pay|owe|owed|owes|get|collect|send|transfer|borrowed|lent|loaned|repaid|cleared|returned|received|got|paid\s+back|rs\.?|inr|₹|\d+(?:\.\d+)?|rupees|me|i|you|to|from|back)\b/gi, '')
        .trim();

      const stopWords = ['me', 'i', 'you', 'my', 'rs', 'inr', 'rupees', 'owes', 'owe', 'owed', 'give', 'pay', 'paid', 'back'];
      const noteWords = note.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase()) && w.toLowerCase() !== person.toLowerCase());
      note = noteWords.join(' ');

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

  // Name + Amount Shorthand without +/- or verb (e.g., "Rahul 500", "500 Rahul lunch")
  const nameAmountShorthand = rawClean.match(/^([a-zA-Z]+)\s+(\d+(?:\.\d+)?)(?:\s+(.+))?$/i) ||
                               rawClean.match(/^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)(?:\s+(.+))?$/i);
  if (nameAmountShorthand) {
    let p, amtStr, noteStr;
    if (/^\d/.test(nameAmountShorthand[1])) {
      amtStr = nameAmountShorthand[1];
      p = nameAmountShorthand[2];
      noteStr = nameAmountShorthand[3] || '';
    } else {
      p = nameAmountShorthand[1];
      amtStr = nameAmountShorthand[2];
      noteStr = nameAmountShorthand[3] || '';
    }

    const pLower = p.toLowerCase();
    const reservedWords = ['watch', 'read', 'list', 'show', 'help', 'done', 'todo', 'debt', 'date', 'due',
      'buy', 'get', 'pay', 'call', 'fix', 'clean', 'make', 'check', 'send', 'book', 'pick', 'bring',
      'prepare', 'submit', 'contact', 'email', 'collect', 'register', 'finish', 'do', 'remind'];
    if (!reservedWords.includes(pLower)) {
      p = p.charAt(0).toUpperCase() + p.slice(1);
      return {
        type: 'debt',
        action: 'owe',
        person: p,
        amount: parseFloat(amtStr),
        direction: 'i_owe',
        note: noteStr.trim(),
        confidence: 'high'
      };
    }
  }

  // ── 3. DEADLINE & EVALUATION PATTERNS ──────────────────────────────────
  const dayMatch = text.match(/\b(friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/i);
  const relativeMatch = text.match(/\b(tomorrow|tmr|tmrw|2moro|2morrow|today)\b/i);
  const monthDayMatch = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
  const dayMonthMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?(?:\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)?\b(?!\s*(?:am|pm|hrs?|hours?|:\d{2}))/i);
  const isoDateMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  const numericDateMatch = text.match(/\b(\d{1,2})[-/\.](\d{1,2})(?:[-/\.](\d{2,4}))?\b/);
  const dateMatch = monthDayMatch || dayMonthMatch || isoDateMatch || numericDateMatch;
  const isDeadlineKeyword = /\b(due|deadline|before|by|schedule|submit|submission|finish|complete|evaluation|exam|viva|test|quiz|presentation|project|slides|hard\s+copy|report|assignment|notes|diary|manual|ppt|homework|lab|code|draft|thesis|essay|paper|review)\b/i.test(text);

  const hasDateContext = dayMatch || relativeMatch || dateMatch;

  // If this message has a reminder-like event keyword (meeting, class, flight, etc), prefer reminder over deadline
  const isReminderEvent = /\b(class|meeting|meet|lecture|session|flight|train|bus|doctor|appointment|interview|standup|sync|webinar|workshop|gym|practice|rehearsal)\b/i.test(text);

  if (hasDateContext && isDeadlineKeyword && !isReminderEvent) {
    let targetDate = null;
    const timeMatch = text.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/i);

    if (relativeMatch) {
      if (timeMatch) {
        targetDate = parseTargetTime(text);
      } else {
        const isTomorrow = /\b(tomorrow|tmr|tmrw|2moro|2morrow)\b/i.test(text);
        const now = new Date();
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffsetMs);
        const istDay = istNow.getDate() + (isTomorrow ? 1 : 0);
        targetDate = new Date(Date.UTC(istNow.getFullYear(), istNow.getMonth(), istDay, 18, 29, 0, 0));
      }
    } else if (dayMatch) {
      targetDate = getUpcomingDay(dayMatch[1]);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const ampm = timeMatch[3].toLowerCase();
        if (ampm === 'pm' && hours < 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0;
        const istDate = new Date(targetDate.getTime() + (5.5 * 60 * 60 * 1000));
        targetDate = new Date(Date.UTC(istDate.getUTCFullYear(), istDate.getUTCMonth(), istDate.getUTCDate(), hours - 5, minutes - 30, 0));
      }
    } else if (dateMatch) {
      if (isoDateMatch) {
        const year = parseInt(isoDateMatch[1], 10);
        const monthIndex = parseInt(isoDateMatch[2], 10) - 1;
        const day = parseInt(isoDateMatch[3], 10);
        targetDate = new Date(Date.UTC(year, monthIndex, day, 18, 29, 0, 0));
      } else if (numericDateMatch) {
        const day = parseInt(numericDateMatch[1], 10);
        const monthIndex = parseInt(numericDateMatch[2], 10) - 1;
        let year = new Date().getFullYear();
        if (numericDateMatch[3]) {
          let y = parseInt(numericDateMatch[3], 10);
          if (y < 100) y += 2000;
          year = y;
        }
        let hours = 18, minutes = 29;
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
          const ampm = timeMatch[3].toLowerCase();
          if (ampm === 'pm' && h < 12) h += 12;
          if (ampm === 'am' && h === 12) h = 0;
          hours = h - 5;
          minutes = m - 30;
        }
        targetDate = new Date(Date.UTC(year, monthIndex, day, hours, minutes, 0, 0));
        const now = new Date();
        if (targetDate < now) {
          targetDate = new Date(Date.UTC(year + 1, monthIndex, day, hours, minutes, 0, 0));
        }
      } else {
        let day, monthStr;
        if (monthDayMatch) {
          day = parseInt(monthDayMatch[2], 10);
          monthStr = monthDayMatch[1];
        } else {
          day = parseInt(dayMonthMatch[1], 10);
          monthStr = dayMonthMatch[2];
        }
        const now = new Date();
        let monthIndex = now.getMonth();
        if (monthStr) {
          const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
          monthIndex = months.indexOf(monthStr.toLowerCase().slice(0, 3));
        }
        let hours = 18, minutes = 29;
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
          const ampm = timeMatch[3].toLowerCase();
          if (ampm === 'pm' && h < 12) h += 12;
          if (ampm === 'am' && h === 12) h = 0;
          hours = h - 5;
          minutes = m - 30;
        }
        let year = now.getFullYear();
        targetDate = new Date(Date.UTC(year, monthIndex, day, hours, minutes, 0, 0));
        if (targetDate < now) {
          if (monthStr) {
            targetDate = new Date(Date.UTC(year + 1, monthIndex, day, hours, minutes, 0, 0));
          } else {
            targetDate = new Date(Date.UTC(year, monthIndex + 1, day, hours, minutes, 0, 0));
          }
        }
      }
    }

    const firstSentence = rawClean.split(/\.(?!\d)/)[0];
    let title = firstSentence
      .replace(/\b(?:this|next)?\s*(?:friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/gi, '')
      .replace(/\b(?:tomorrow|tmr|tmrw|2moro|2morrow|today)\b/gi, '')
      .replace(/\b\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)\b/gi, '')
      .replace(/\b\d{4}-\d{2}-\d{2}\b/gi, '')
      .replace(/\b\d{1,2}[-/\.]\d{1,2}(?:[-/\.]\d{2,4})?\b/gi, '')
      .replace(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*\d{1,2}(?:st|nd|rd|th)?\b/gi, '')
      .replace(/\b\d{1,2}(?:st|nd|rd|th)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/gi, '')
      .replace(/\b(?:due(?:\s+on|\s+by)?|deadline|before|by|on|at)\b/gi, '')
      .replace(/^[\s,]+/, '')
      .replace(/[\s,]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      type: 'deadline',
      title: title || firstSentence,
      dueDate: targetDate || new Date(),
      category: 'academic',
      confidence: 'high'
    };
  }

  // ── 3b. IMPORTANT DATE PATTERNS (e.g. "Spiderman Brand New Day on Aug 1") ──
  const onDateMatch = text.match(/\bon\s+(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i) ||
                      text.match(/\bon\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?/i) ||
                      text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i) ||
                      text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?/i) ||
                      text.match(/\b(?:birthday|anniversary)\s+on\s+(\d{1,2}(?:st|nd|rd|th)?\s+[a-z]+|[a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}[-/]\d{1,2})/i);

  if (onDateMatch && !isDeadlineKeyword) {
    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    let day = 1, monthIndex = 0;

    if (onDateMatch[1] && onDateMatch[2]) {
      if (/^\d+$/.test(onDateMatch[1])) {
        day = parseInt(onDateMatch[1], 10);
        monthIndex = months.indexOf(onDateMatch[2].toLowerCase().slice(0, 3));
      } else {
        monthIndex = months.indexOf(onDateMatch[1].toLowerCase().slice(0, 3));
        day = parseInt(onDateMatch[2], 10);
      }
    }

    if (monthIndex === -1) monthIndex = 0;

    const isYearly = /\b(every\s+year|yearly|annual|annually)\b/i.test(text);
    const isMonthly = /\b(every\s+month|monthly)\b/i.test(text);
    const recurring = isYearly ? 'yearly' : (isMonthly ? 'monthly' : 'none');

    const now = new Date();
    let year = now.getFullYear();
    const candidate = new Date(year, monthIndex, day);
    if (candidate < now) year++;
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    let title = rawClean
      .replace(/\b(?:every\s+year|yearly|annual|annually|every\s+month|monthly)\b/gi, '')
      .replace(/\b(?:on\s+)?(?:\d{1,2}(?:st|nd|rd|th)?\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+\d{1,2}(?:st|nd|rd|th)?)?\b/gi, '')
      .replace(/\b(?:on\s+)?\d{1,2}(?:st|nd|rd|th)?\b/gi, '')
      .replace(/^[\s,\-–]+/, '')
      .replace(/[\s,\-–]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      type: 'date',
      title: title || rawClean,
      date: dateStr,
      recurring,
      confidence: 'high'
    };
  }

  // ── 4. REMINDER / TIMED EVENT PATTERNS ────────────────────────────────
  const isReminderKeyword = /\b(class|meeting|meet|lecture|session|conducted|hr|hour|today|tomorrow|tmr|tmrw|2moro|tonight|at\s+\d{1,2}|am|pm|remind|ticket|doctor|appointment|flight|train|bus|interview|standup|sync|webinar|workshop)\b/i.test(text);
  // Don't let reminder keywords swallow strong Todo action verbs (e.g. "Book a cab", "Register for the workshop")
  const isTodoActionVerb = /^(?:prepare|submit|contact|call|buy|bring|clean|fix|finish|do|make|check|email|collect|pay|register|pick|get|book)\b/i.test(text);
  if (isReminderKeyword && !isTodoActionVerb) {
    const remindAt = parseTargetTime(text);
    return { type: 'reminder', title: cleanTitle(rawClean.split(/\.(?!\d)/)[0]), remindAt, confidence: 'high' };
  }

  // ── 5. WATCHLIST PATTERNS ─────────────────────────────────────────────
  const watchMatch = text.match(/^(?:(?:wanna|want\s+to|plan\s+to|need\s+to|have\s+to|gotta|must)\s+)?(?:continue\s+)?(?:watch|watching|movie|show|anime|read|reading|binge|binging|stream|streaming)\s+(.+)/i) ||
                      text.match(/^book\s*:\s*(.+)/i) ||
                      text.match(/^add\s+(.+?)\s+to\s+(?:my\s+)?watchlist\b/i);
  if (watchMatch) {
    let itemTitle = watchMatch[1].replace(/\btoo$/i, '').trim();
    itemTitle = itemTitle.charAt(0).toUpperCase() + itemTitle.slice(1);
    const isBook = /\b(read|reading|paper)\b/i.test(text) || /^book\s*:/i.test(text);
    return { type: 'watch', watchAction: 'add', title: itemTitle, watchType: isBook ? 'book' : 'show', confidence: 'high' };
  }

  // ── 6. TO-DO ACTION VERBS & PHRASES ─────────────────────────────────────
  const isTodoAction = /^(?:prepare|submit|contact|call|buy|bring|clean|fix|finish|do|make|check|email|collect|pay|register|pick|get|book)\b/i.test(text) ||
                       /\b(must\s+meet|must\s+submit|need\s+to|should\s+contact|must\s+register|remember\s+to|don'?t\s+forget\s+to|have\s+to|gotta|need\s+to)\b/i.test(text) ||
                       /^(?:todo|task)\s*[:\-]\s*/i.test(rawClean);

  if (isTodoAction) {
    let cleanTitleText = rawClean
      .replace(/^(?:todo|task)\s*[:\-]\s*/i, '')
      .replace(/^(?:remember\s+to|don'?t\s+forget\s+to|have\s+to|gotta|need\s+to)\s+/i, '')
      .trim();
    cleanTitleText = cleanTitleText.charAt(0).toUpperCase() + cleanTitleText.slice(1);
    return { type: 'todo', title: cleanTitleText || rawClean, confidence: 'high' };
  }

  // ── 7. AMBIGUOUS FALLBACK ──────────────────────────────────────────────
  return { type: 'ambiguous', rawText: rawClean, confidence: 'low' };
}
