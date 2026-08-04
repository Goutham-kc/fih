import { distance } from 'fastest-levenshtein';

const KNOWN_MODULES = ['todo', 'done', 'debt', 'deadline', 'date', 'watch', 'list', 'mode', 'help', 'reminder'];

/**
 * Find the closest known module name using Levenshtein distance.
 * Returns { exact, suggestion } where suggestion is set if distance <= 2.
 */
function findModule(word) {
  const lower = word.toLowerCase();
  if (KNOWN_MODULES.includes(lower)) return { exact: lower, suggestion: null };
  let best = null;
  let bestDist = Infinity;
  for (const mod of KNOWN_MODULES) {
    const d = distance(lower, mod);
    if (d < bestDist) { bestDist = d; best = mod; }
  }
  return { exact: null, suggestion: bestDist <= 2 ? best : null };
}

/**
 * Parse a date string in 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM' format.
 * Returns a Date or null.
 */
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const chrono = require('chrono-node');
  const parsedDate = chrono.parseDate(dateStr);
  if (parsedDate) return parsedDate;

  const trimmed = dateStr.trim();
  // Fallback
  const full = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  if (full) return new Date(`${full[1]}T${full[2]}:00`);
  // YYYY-MM-DD
  const dateOnly = trimmed.match(/^\d{4}-\d{2}-\d{2}$/);
  if (dateOnly) return new Date(`${trimmed}T00:00:00`);
  return null;
}

/**
 * Main command parser.
 * Input: raw message string (already trimmed).
 * Returns:
 *   { type: 'unknown', nudge } – not a command
 *   { type: 'did_you_mean', suggestion } – close but wrong
 *   { type: 'help' }
 *   { type: 'list', module }
 *   { type: 'todo', title, dueDate } – dueDate may be null
 *   { type: 'done', query }
 *   { type: 'debt', action, person, amount, note } – action: owe|owed|settle
 *   { type: 'deadline', title, dueDate, category } – dueDate/category may be null
 *   { type: 'date', title, date, recurring } – date/recurring may be null
 *   { type: 'watch', title, watchType, watchAction, rating } – watchAction: add|done
 *   { type: 'missing', module, missingField, question, partialData }
 *   { type: 'error', message }
 */
export function parseCommand(raw) {
  const text = raw.trim();

  // Must start with >
  if (!text.startsWith('>')) {
    return { type: 'unknown', nudge: "Commands start with `>` — try `>help` for the list." };
  }

  // Strip leading >
  const body = text.slice(1).trim();
  if (!body) return { type: 'help' };

  const tokens = body.split(/\s+/);
  const moduleName = tokens[0];
  const rest = tokens.slice(1).join(' ').trim();

  const { exact, suggestion } = findModule(moduleName);
  if (!exact) {
    if (suggestion) {
      return { type: 'did_you_mean', suggestion };
    }
    return { type: 'error', message: `Unknown command '${moduleName}'. Try \`>help\`.` };
  }

  // HELP
  if (exact === 'help') return { type: 'help' };

  // LIST
  if (exact === 'list') {
    const mod = rest || null;
    const validMods = ['todo', 'debt', 'deadline', 'date', 'watch'];
    if (!mod || !validMods.includes(mod)) {
      return { type: 'missing', module: 'list', missingField: 'module',
        question: `What should I list? (${validMods.join(', ')})`, partialData: {} };
    }
    return { type: 'list', module: mod };
  }

  // DONE (mark todo done)
  if (exact === 'done') {
    if (!rest) {
      return { type: 'missing', module: 'done', missingField: 'query',
        question: "Which to-do should I mark done? (send part of the title)", partialData: {} };
    }
    return { type: 'done', query: rest };
  }

  // TODO
  if (exact === 'todo') {
    if (!rest) {
      return { type: 'missing', module: 'todo', missingField: 'title',
        question: "What should the to-do say?", partialData: {} };
    }
    const parts = rest.split('|').map((p) => p.trim());
    const title = parts[0];
    const dueDateRaw = parts[1] || null;
    const dueDate = dueDateRaw ? parseDate(dueDateRaw) : null;
    if (dueDateRaw && !dueDate) {
      return { type: 'missing', module: 'todo', missingField: 'dueDate',
        question: "I couldn't read that date — try YYYY-MM-DD or YYYY-MM-DD HH:MM.",
        partialData: { title } };
    }
    return { type: 'todo', title, dueDate };
  }

  // DEBT
  if (exact === 'debt') {
    const subTokens = rest.split(/\s+/);
    const action = subTokens[0]?.toLowerCase();
    if (['history', 'journal'].includes(action)) {
      return { type: 'debt', action };
    }
    if (!['owe', 'owed', 'settle'].includes(action)) {
      return { type: 'missing', module: 'debt', missingField: 'action',
        question: "Did you mean `>debt owe`, `>debt owed`, `>debt settle`, or `>debt journal`?",
        partialData: {} };
    }
    if (action === 'settle') {
      const person = subTokens.slice(1).join(' ').trim();
      if (!person) {
        return { type: 'missing', module: 'debt', missingField: 'person',
          question: "Who do you want to settle with?", partialData: { action } };
      }
      return { type: 'debt', action: 'settle', person };
    }
    // owe / owed
    const person = subTokens[1];
    const amountRaw = subTokens[2];
    const note = subTokens.slice(3).join(' ');
    if (!person) {
      return { type: 'missing', module: 'debt', missingField: 'person',
        question: `Who ${action === 'owe' ? 'do you owe' : 'owes you'}?`,
        partialData: { action } };
    }
    const amount = parseFloat(amountRaw);
    if (!amountRaw || isNaN(amount)) {
      return { type: 'missing', module: 'debt', missingField: 'amount',
        question: `How much ${action === 'owe' ? `do you owe ${person}` : `does ${person} owe you`}? (send a number)`,
        partialData: { action, person } };
    }
    const direction = action === 'owe' ? 'i_owe' : 'owed_to_me';
    return { type: 'debt', action, person, amount, direction, note: note || '' };
  }

  // DEADLINE
  if (exact === 'deadline') {
    if (!rest) {
      return { type: 'missing', module: 'deadline', missingField: 'title',
        question: "What's the deadline title?", partialData: {} };
    }
    const parts = rest.split('|').map((p) => p.trim());
    const title = parts[0];
    const dueDateRaw = parts[1] || null;
    const categoryRaw = parts[2] || null;
    const validCategories = ['academic', 'personal'];
    const category = validCategories.includes(categoryRaw) ? categoryRaw : 'personal';
    if (!dueDateRaw) {
      return { type: 'missing', module: 'deadline', missingField: 'dueDate',
        question: `When is '${title}' due? (e.g. 2026-08-05 18:00)`,
        partialData: { title, category } };
    }
    const dueDate = parseDate(dueDateRaw);
    if (!dueDate) {
      return { type: 'missing', module: 'deadline', missingField: 'dueDate',
        question: "I couldn't read that date — try YYYY-MM-DD or YYYY-MM-DD HH:MM.",
        partialData: { title, category } };
    }
    return { type: 'deadline', title, dueDate, category };
  }

  // REMINDER
  if (exact === 'reminder') {
    if (!rest) {
      return { type: 'missing', module: 'reminder', missingField: 'title',
        question: "What should I remind you about?", partialData: {} };
    }
    const parts = rest.split('|').map((p) => p.trim());
    const title = parts[0];
    const remindAtRaw = parts[1] || null;
    
    if (!remindAtRaw) {
      return { type: 'missing', module: 'reminder', missingField: 'remindAt',
        question: `When should I remind you about '${title}'? (e.g. 2026-08-05 18:00)`,
        partialData: { title } };
    }
    const remindAt = parseDate(remindAtRaw);
    if (!remindAt) {
      return { type: 'missing', module: 'reminder', missingField: 'remindAt',
        question: "I couldn't read that date/time — try YYYY-MM-DD HH:MM.",
        partialData: { title } };
    }
    return { type: 'reminder', title, remindAt };
  }

  // DATE
  if (exact === 'date') {
    if (!rest) {
      return { type: 'missing', module: 'date', missingField: 'title',
        question: "What's the title of this important date?", partialData: {} };
    }
    const parts = rest.split('|').map((p) => p.trim());
    const title = parts[0];
    const dateRaw = parts[1] || null;
    const recurringRaw = parts[2]?.toLowerCase() || 'none';
    const validRecurring = ['yearly', 'monthly', 'none'];
    const recurring = validRecurring.includes(recurringRaw) ? recurringRaw : 'none';
    if (!dateRaw) {
      return { type: 'missing', module: 'date', missingField: 'date',
        question: `When is '${title}'? (e.g. 09-14 for MM-DD or 2026-11-01 for a one-time date)`,
        partialData: { title, recurring } };
    }
    // Validate MM-DD or YYYY-MM-DD
    const isMMDD = /^\d{2}-\d{2}$/.test(dateRaw);
    const isFullDate = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw);
    if (!isMMDD && !isFullDate) {
      return { type: 'missing', module: 'date', missingField: 'date',
        question: "Date format unclear — use MM-DD (e.g. 09-14) or YYYY-MM-DD (e.g. 2026-09-14).",
        partialData: { title, recurring } };
    }
    return { type: 'date', title, date: dateRaw, recurring };
  }

  // WATCH
  if (exact === 'watch') {
    if (!rest) {
      return { type: 'missing', module: 'watch', missingField: 'title',
        question: "What do you want to add to your watchlist?", partialData: {} };
    }
    // Check for 'done' sub-command: >watch <title> done [rating]
    const doneMatch = rest.match(/^(.+?)\s+done(?:\s+(\d+))?$/i);
    if (doneMatch) {
      const query = doneMatch[1].trim();
      const rating = doneMatch[2] ? parseInt(doneMatch[2], 10) : null;
      return { type: 'watch', watchAction: 'done', query, rating };
    }
    // Add: >watch <title> [| type]
    const parts = rest.split('|').map((p) => p.trim());
    const title = parts[0];
    const validTypes = ['movie', 'show', 'anime', 'book', 'paper'];
    const watchType = validTypes.includes(parts[1]?.toLowerCase()) ? parts[1].toLowerCase() : 'show';
    return { type: 'watch', watchAction: 'add', title, watchType };
  }

  // MODE
  if (exact === 'mode') {
    const targetMode = rest.toLowerCase();
    if (['dev', 'development', 'live'].includes(targetMode)) {
      return { type: 'mode', targetMode: targetMode === 'dev' ? 'development' : targetMode };
    }
    return { type: 'missing', module: 'mode', missingField: 'targetMode',
      question: "Which mode do you want to switch to? (live or dev)", partialData: {} };
  }

  return { type: 'error', message: `Unhandled command '${moduleName}'.` };
}
