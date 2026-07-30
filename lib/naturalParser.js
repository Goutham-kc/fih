/**
 * Hyper-accurate Semantic Natural Language & Text Normalizer Engine for WhatsApp.
 * Supports pre-normalization, multiline email/announcement cleaners, exact time extraction, and smart categorization.
 */

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
    // Times
    .replace(/\b(\d{1,2})\s*[\.:]\s*(\d{2})\s*(am|pm)\b/gi, '$1:$2 $3')
    .replace(/\b(\d{1,2})\s*(am|pm)\b/gi, '$1:00 $2')
    .replace(/\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:hr|hour|period)\b/gi, '$1th hour')
    // Currency
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

  const isDebtVerb = /\b(owe|owed|owes|give|gave|pay|paid|transfer|send|sent|settle|settled|due|balance)\b/i.test(text);
  if (isDebtVerb) {
    const m2 = text.match(/\b(\d+(?:\.\d+)?)\b/);
    if (m2) return parseFloat(m2[1]);
  }

  const m3 = text.match(/\b(?:owe|owed|owes|give|pay|paid|gave|transfer|settle)\s+.*?\b(\d+(?:\.\d+)?)\b/i);
  if (m3) return parseFloat(m3[1]);

  return null;
}

function parseTargetTime(text) {
  const tm = text.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/i);

  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffsetMs);

  let isTomorrow = /\b(tomorrow|tmr|tmrw|2moro|2morrow)\b/i.test(text);
  let isToday = /\b(today|2day|tday)\b/i.test(text);

  if (tm) {
    let hours = parseInt(tm[1], 10);
    const minutes = tm[2] ? parseInt(tm[2], 10) : 0;
    const ampm = tm[3].toLowerCase();

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    const istDay = istNow.getDate() + (isTomorrow ? 1 : 0);
    const targetUTC = new Date(Date.UTC(istNow.getFullYear(), istNow.getMonth(), istDay, hours - 5, minutes - 30, 0));
    if (targetUTC < now && !isTomorrow) targetUTC.setDate(targetUTC.getDate() + 1);
    return targetUTC;
  }

  // Smart defaults when no explicit hour/minute is provided:
  if (isTomorrow) {
    const istDay = istNow.getDate() + 1;
    return new Date(Date.UTC(istNow.getFullYear(), istNow.getMonth(), istDay, 3, 30, 0));
  }

  if (isToday) {
    const istDay = istNow.getDate();
    return new Date(Date.UTC(istNow.getFullYear(), istNow.getMonth(), istDay, 12, 30, 0));
  }

  return new Date(now.getTime() + 60 * 60 * 1000);
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

  // ── 0b. BULK SCHEDULE / SYLLABUS PARSER ────────────────────────────────
  // Detects structured inputs like:
  //   WEEK 1 - Deadline: 13-07-2026
  //   Topic Name
  //   • Task 1
  //   • Task 2
  const deadlineHeaderRe = /(?:week\s*\d+\s*[-–—]\s*)?deadline\s*:\s*(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})/gi;
  const headerMatches = [...rawClean.matchAll(deadlineHeaderRe)];
  if (headerMatches.length >= 2) {
    // Split input by deadline headers and parse each section
    const lines = rawClean.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];
    let currentDate = null;

    for (const line of lines) {
      const headerMatch = line.match(/(?:week\s*\d+\s*[-–—]\s*)?deadline\s*:\s*(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})/i);
      if (headerMatch) {
        const day = parseInt(headerMatch[1], 10);
        const month = parseInt(headerMatch[2], 10) - 1;
        const year = parseInt(headerMatch[3], 10);
        // 23:59 IST = 18:29 UTC
        currentDate = new Date(Date.UTC(year, month, day, 18, 29, 0, 0));
        continue;
      }

      if (!currentDate) continue;

      // Skip topic header lines (lines without bullet markers that are just section titles)
      const cleanLine = line.replace(/^[•\-\*\u2022\u2023\u25E6\u2043]\s*/, '').trim();
      if (!cleanLine) continue;

      // Lines with bullet markers are tasks -> deadlines
      const isBullet = /^[•\-\*\u2022\u2023\u25E6\u2043]/.test(line);
      if (isBullet) {
        items.push({
          type: 'deadline',
          title: cleanLine,
          dueDate: currentDate,
          category: 'academic'
        });
      } else {
        // Non-bullet lines are topic headers -> also add as deadlines with topic context
        items.push({
          type: 'deadline',
          title: cleanLine,
          dueDate: currentDate,
          category: 'academic'
        });
      }
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


  // ── 0.5. FINANCIAL BALANCE QUERY ENGINE ("how much i owe Amir") ─────────────────────────
  const isBalanceQuery = /\b(how\s+much|what\s+is\s+my\s+balance|total\s+debt|total\s+owed|my\s+balance)\b/i.test(text);
  if (isBalanceQuery) {
    let person = null;
    const pm = text.match(/\b(?:owe|owed|to|from|for|with)\s+([a-zA-Z]+)\b/i) ||
               text.match(/\b([a-zA-Z]+)\s+(?:owes|owe)\b/i);

    if (pm) {
      const candidate = pm[1].toLowerCase();
      const stopWords = ['me','i','my','you','we','they','do','does','did','am','is','are','have','has','in','total','all','much'];
      if (!stopWords.includes(candidate)) {
        person = pm[1].charAt(0).toUpperCase() + pm[1].slice(1);
      }
    }

    return { type: 'balance_query', person, rawText: text, confidence: 'high' };
  }

  // ── 1. QUERY PATTERNS (List / Show / What are my) ──────────────────────
  const isQuery = /^(?:show|get|list|view|display|check|what|which|my|how|sort)\b/i.test(text) ||
                  /\b(?:list|show|sort|my\s+debts|my\s+todos|my\s+deadlines)\b/i.test(text);

  if (isQuery) {
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

  const amount = extractAmount(text);
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

      const stopWords = ['me', 'i', 'you', 'my', 'rs', 'inr', 'rupees', 'owes', 'owe', 'owed', 'give', 'pay', 'paid'];
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


  // ── 3. DEADLINE & EVALUATION PATTERNS ──────────────────────────────────
  const dayMatch = text.match(/\b(friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/i);
  const relativeMatch = text.match(/\b(tomorrow|tmr|tmrw|2moro|2morrow|today)\b/i);
  const dateMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?(?:\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)?\b(?!\s*(?:am|pm|hrs?|hours?|:\d{2}))/i);
  const isDeadlineKeyword = /\b(due|deadline|before|by|schedule|submit|finish|complete|evaluation|exam|viva|test|quiz|presentation|project|slides|hard\s+copy|report|assignment)\b/i.test(text);

  if ((dayMatch || relativeMatch || dateMatch) && isDeadlineKeyword) {
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
      const day = parseInt(dateMatch[1], 10);
      const monthStr = dateMatch[2];
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
      if (targetDate < now && !monthStr) {
        targetDate = new Date(Date.UTC(year, monthIndex + 1, day, hours, minutes, 0, 0));
      }
    }

    const firstSentence = rawClean.split('.')[0];
    let title = firstSentence
      .replace(/\b(?:this|next)?\s*(?:friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/gi, '')
      .replace(/\b(?:tomorrow|tmr|tmrw|2moro|2morrow|today)\b/gi, '')
      .replace(/\b\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)\b/gi, '')
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
                      text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?/i);
  if (onDateMatch && !isDeadlineKeyword) {
    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    let day, monthStr;
    // Figure out which capture group is the day vs month
    if (/^\d+$/.test(onDateMatch[1])) {
      day = parseInt(onDateMatch[1], 10);
      monthStr = onDateMatch[2];
    } else {
      monthStr = onDateMatch[1];
      day = parseInt(onDateMatch[2], 10);
    }
    const monthIndex = months.indexOf(monthStr.toLowerCase().slice(0, 3));
    const now = new Date();
    let year = now.getFullYear();
    const candidate = new Date(year, monthIndex, day);
    if (candidate < now) year++;
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Extract title: everything except the "on <date>" portion
    let title = rawClean
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
      recurring: 'none',
      confidence: 'high'
    };
  }


  // ── 4. REMINDER / TIMED EVENT PATTERNS ────────────────────────────────
  const isReminderKeyword = /\b(class|meeting|meet|lecture|session|conducted|hr|hour|today|tomorrow|tmr|tmrw|2moro|tonight|at\s+\d{1,2}|am|pm|remind|ticket|book)\b/i.test(text);
  if (isReminderKeyword) {
    const remindAt = parseTargetTime(text);
    return { type: 'reminder', title: cleanTitle(rawClean.split('.')[0]), remindAt, confidence: 'high' };
  }


  // ── 5. TO-DO ACTION VERBS ──────────────────────────────────────────────
  const isTodoAction = /^(?:prepare|submit|contact|call|buy|bring|clean|fix|finish|do|make|check|email|collect)\b/i.test(text) ||
                       /\b(must\s+meet|must\s+submit|need\s+to|should\s+contact|must\s+register)\b/i.test(text);

  if (isTodoAction) {
    return { type: 'todo', title: rawClean.split('.')[0], confidence: 'high' };
  }


  // ── 6. WATCHLIST PATTERNS ─────────────────────────────────────────────
  const watchMatch = text.match(/^(?:watch|movie|show|anime|read|book|paper)\s+(.+)/i);
  if (watchMatch) {
    const kw = text.split(/\s+/)[0].toLowerCase();
    const type = ['read', 'book', 'paper'].includes(kw) ? 'book' : 'show';
    return { type: 'watch', title: watchMatch[1].trim(), watchType: type, confidence: 'high' };
  }


  // ── 7. AMBIGUOUS FALLBACK (Prompts with Reminder choice!) ─────────────
  return { type: 'ambiguous', rawText: rawClean, confidence: 'low' };
}
