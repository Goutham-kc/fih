import { connectDB } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { parseCommand } from '@/lib/commandParser';
import { getPendingIntent, createPendingIntent, clearPendingIntent } from '@/lib/pendingIntent';
import { fuzzyMatch } from '@/lib/fuzzyMatch';
import User from '@/models/User';
import Todo from '@/models/Todo';
import Debt from '@/models/Debt';
import Deadline from '@/models/Deadline';
import ImportantDate from '@/models/ImportantDate';
import WatchlistItem from '@/models/WatchlistItem';

const HELP_TEXT = `Commands:
>todo <text> [| due-date]
>done <fuzzy-title>
>debt owe <person> <amount> [note]
>debt owed <person> <amount> [note]
>debt settle <person>
>deadline <title> | <date> [time] [| category]
>date <title> | <MM-DD or YYYY-MM-DD> [| yearly|monthly]
>watch <title> [| type]
>watch <title> done [rating]
>list <todo|debt|deadline|date|watch>
cancel — cancel a pending question`;

function formatTodo(t, i) {
  const due = t.dueDate ? ` (due ${new Date(t.dueDate).toLocaleDateString('en-IN')})` : '';
  const priority = t.priority !== 'medium' ? ` [${t.priority}]` : '';
  return `${i + 1}. ${t.title}${due}${priority}`;
}

function formatDebt(person, debts) {
  let owe = 0, owed = 0;
  debts.forEach(d => {
    if (d.direction === 'i_owe') owe += d.amount;
    else owed += d.amount;
  });
  const net = owed - owe;
  const label = net > 0 ? `owes you ₹${net}` : net < 0 ? `you owe ₹${Math.abs(net)}` : 'settled';
  return `${person}: ${label}`;
}

async function handleCommand(parsed, userId, reply) {
  switch (parsed.type) {
    case 'help':
      return reply(HELP_TEXT);

    case 'did_you_mean':
      return reply(`Did you mean \`>${parsed.suggestion}\`? Try \`>help\` for all commands.`);

    case 'error':
      return reply(parsed.message);

    case 'todo': {
      const todo = await Todo.create({ userId, title: parsed.title, dueDate: parsed.dueDate });
      const due = todo.dueDate ? ` — due ${new Date(todo.dueDate).toLocaleDateString('en-IN')}` : '';
      return reply(`✅ To-do added: "${todo.title}"${due}`);
    }

    case 'done': {
      const openTodos = await Todo.find({ userId, status: 'open' });
      const { match, ambiguous, candidates } = fuzzyMatch(parsed.query, openTodos);
      if (!match && !ambiguous)
        return reply(`Couldn't find an open to-do matching that. Try \`>list todo\`.`);
      if (ambiguous) {
        const list = candidates.slice(0, 5).map((c, i) => `${i + 1}. ${c.item.title}`).join('\n');
        await createPendingIntent(userId, {
          module: 'done_pick',
          partialData: { candidates: candidates.slice(0, 5).map(c => c.item._id.toString()) },
          missingField: 'pick',
          question: `Which one?\n${list}`,
        });
        return reply(`Which one?\n${list}`);
      }
      match.status = 'done';
      match.completedAt = new Date();
      await match.save();
      return reply(`✅ Marked done: "${match.title}"`);
    }

    case 'debt': {
      if (parsed.action === 'history' || parsed.action === 'journal') {
        const debts = await Debt.find({ userId }).sort({ createdAt: -1 }).limit(10);
        if (!debts.length) return reply('Your transaction journal is empty.');
        const lines = debts.map((d, i) => {
          const dir = d.direction === 'i_owe' ? 'you owe' : 'owes you';
          const status = d.settled ? ` [Settled ${d.settledDate ? new Date(d.settledDate).toLocaleDateString('en-IN') : ''}]` : ' [Active]';
          return `${i + 1}. ${d.person} (${dir} ₹${d.amount})${d.note ? ` - ${d.note}` : ''}${status}`;
        });
        return reply(`📜 Transaction Journal (Last 10):\n\n${lines.join('\n')}`);
      }

      if (parsed.action === 'settle') {
        const debts = await Debt.find({ userId, person: new RegExp(parsed.person, 'i'), settled: false });
        if (!debts.length) return reply(`No unsettled debts found for "${parsed.person}".`);
        await Debt.updateMany({ _id: { $in: debts.map(d => d._id) } }, { settled: true, settledDate: new Date() });
        return reply(`✅ Settled all debts with ${debts[0].person}. Transaction saved to your Journal.`);
      }
      const debt = await Debt.create({
        userId, person: parsed.person, amount: parsed.amount,
        direction: parsed.direction, note: parsed.note,
      });
      const dir = parsed.direction === 'i_owe' ? `you owe ${debt.person}` : `${debt.person} owes you`;
      return reply(`✅ Recorded: ${dir} ₹${debt.amount}${debt.note ? ` (${debt.note})` : ''}`);
    }

    case 'deadline': {
      const dl = await Deadline.create({
        userId, title: parsed.title, dueDate: parsed.dueDate, category: parsed.category,
      });
      return reply(`✅ Deadline added: "${dl.title}" — due ${new Date(dl.dueDate).toLocaleString('en-IN')} (${dl.category})`);
    }

    case 'date': {
      const d = await ImportantDate.create({
        userId, title: parsed.title, date: parsed.date, recurring: parsed.recurring,
      });
      return reply(`✅ Date saved: "${d.title}" on ${d.date}${d.recurring !== 'none' ? ` (${d.recurring})` : ''}`);
    }

    case 'watch': {
      if (parsed.watchAction === 'add') {
        const item = await WatchlistItem.create({ userId, title: parsed.title, type: parsed.watchType });
        return reply(`✅ Added to watchlist: "${item.title}" [${item.type}]`);
      }
      // done
      const items = await WatchlistItem.find({ userId, status: { $ne: 'done' } });
      const { match, ambiguous, candidates } = fuzzyMatch(parsed.query, items);
      if (!match && !ambiguous) return reply(`Couldn't find "${parsed.query}" in your watchlist.`);
      if (ambiguous) {
        const list = candidates.slice(0, 5).map((c, i) => `${i + 1}. ${c.item.title}`).join('\n');
        await createPendingIntent(userId, {
          module: 'watch_done_pick',
          partialData: { candidates: candidates.slice(0, 5).map(c => c.item._id.toString()), rating: parsed.rating },
          missingField: 'pick',
          question: `Which one?\n${list}`,
        });
        return reply(`Which one?\n${list}`);
      }
      match.status = 'done';
      if (parsed.rating) match.rating = parsed.rating;
      await match.save();
      return reply(`✅ Marked as watched: "${match.title}"${parsed.rating ? ` — rated ${parsed.rating}/10` : ''}`);
    }

    case 'list': {
      const mod = parsed.module;
      if (mod === 'todo') {
        const todos = await Todo.find({ userId, status: 'open' }).sort({ dueDate: 1 });
        if (!todos.length) return reply('No open to-dos!');
        return reply(`Open to-dos:\n${todos.map(formatTodo).join('\n')}`);
      }
      if (mod === 'debt') {
        const debts = await Debt.find({ userId, settled: false });
        if (!debts.length) return reply('No unsettled debts!');
        const byPerson = {};
        debts.forEach(d => { byPerson[d.person] = byPerson[d.person] || []; byPerson[d.person].push(d); });
        const lines = Object.entries(byPerson).map(([p, ds]) => formatDebt(p, ds));
        return reply(`Debts:\n${lines.join('\n')}`);
      }
      if (mod === 'deadline') {
        const deadlines = await Deadline.find({ userId }).sort({ dueDate: 1 });
        if (!deadlines.length) return reply('No deadlines!');
        const lines = deadlines.map((d, i) => `${i + 1}. ${d.title} — ${new Date(d.dueDate).toLocaleString('en-IN')} [${d.category}]`);
        return reply(`Deadlines:\n${lines.join('\n')}`);
      }
      if (mod === 'date') {
        const dates = await ImportantDate.find({ userId });
        if (!dates.length) return reply('No important dates!');
        const lines = dates.map((d, i) => `${i + 1}. ${d.title} — ${d.date}${d.recurring !== 'none' ? ` (${d.recurring})` : ''}`);
        return reply(`Important dates:\n${lines.join('\n')}`);
      }
      if (mod === 'watch') {
        const items = await WatchlistItem.find({ userId }).sort({ status: 1 });
        if (!items.length) return reply('Your watchlist is empty!');
        const lines = items.map((it, i) => `${i + 1}. ${it.title} [${it.type}] — ${it.status}${it.rating ? ` ★${it.rating}` : ''}`);
        return reply(`Watchlist:\n${lines.join('\n')}`);
      }
      return reply(`Unknown module. Try >list todo|debt|deadline|date|watch`);
    }

    default:
      return reply(`Sorry, I couldn't process that command. Try \`>help\`.`);
  }
}

export default async function handler(req, res) {
  // GET — Meta webhook verification handshake
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  if (req.method !== 'POST') return res.status(405).end();

  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch {}
  }

  // Extract the message
  const entry = payload?.entry?.[0];
  const change = entry?.changes?.[0];
  const messageObj = change?.value?.messages?.[0];
  if (!messageObj) return res.status(200).end(); // ACK non-message events

  const from = messageObj.from; // E.164 without '+'
  const text = messageObj.text?.body?.trim();
  if (!text) return res.status(200).end();

  await connectDB();

  // Find user by WhatsApp number (flexible with or without '+' prefix)
  const waNumberWithPlus = from.startsWith('+') ? from : `+${from}`;
  const waNumberWithoutPlus = from.replace(/^\+/, '');
  const user = await User.findOne({
    whatsappNumber: { $in: [waNumberWithPlus, waNumberWithoutPlus] },
  });

  if (!user) {
    console.warn('Unknown WhatsApp sender:', from);
    return res.status(200).end();
  }

  const userId = user._id;
  const reply = (msg) => sendWhatsAppMessage(waNumberWithPlus, msg);

  // Handle 'cancel'
  if (text.toLowerCase() === 'cancel') {
    await clearPendingIntent(userId);
    await reply('Cancelled.');
    return res.status(200).end();
  }

  // Check for pending intent
  const pending = await getPendingIntent(userId);
  if (pending) {
    // Handle numbered pick for ambiguous fuzzy matches
    if (['done_pick', 'watch_done_pick'].includes(pending.module)) {
      const pick = parseInt(text, 10);
      const ids = pending.partialData.candidates;
      if (isNaN(pick) || pick < 1 || pick > ids.length) {
        await reply(`Please reply with a number between 1 and ${ids.length}.`);
        return res.status(200).end();
      }
      const chosenId = ids[pick - 1];
      await clearPendingIntent(userId);
      if (pending.module === 'done_pick') {
        const todo = await Todo.findById(chosenId);
        todo.status = 'done'; todo.completedAt = new Date();
        await todo.save();
        await reply(`✅ Marked done: "${todo.title}"`);
      } else {
        const item = await WatchlistItem.findById(chosenId);
        item.status = 'done';
        if (pending.partialData.rating) item.rating = pending.partialData.rating;
        await item.save();
        await reply(`✅ Marked as watched: "${item.title}"${pending.partialData.rating ? ` — rated ${pending.partialData.rating}/10` : ''}`);
      }
      return res.status(200).end();
    }

function parseDebtInput(text, defaultData = {}) {
  const clean = text.trim();
  const subTokens = clean.split(/\s+/);

  let action = defaultData.action;
  let person = defaultData.person;
  let amount = defaultData.amount;
  let note = defaultData.note || '';

  const numMatch = clean.match(/(\d+(?:\.\d+)?)/);
  if (numMatch && !amount) {
    amount = parseFloat(numMatch[1]);
  }

  if (/\b(owed|owes|receivable|to_me)\b/i.test(clean)) {
    action = 'owed';
  } else if (/\b(owe|pay|payable)\b/i.test(clean)) {
    action = 'owe';
  } else if (/\b(settle|settled)\b/i.test(clean)) {
    action = 'settle';
  }

  const keywords = ['owe', 'owed', 'owes', 'settle', 'i', 'me', 'you', 'to', 'for', 'rs', 'inr', '₹'];
  const nameTokens = subTokens.filter(t => !/^\d+(?:\.\d+)?$/.test(t) && !keywords.includes(t.toLowerCase()));
  if (nameTokens.length > 0 && !person) {
    person = nameTokens.join(' ');
  }

  return { action, person, amount, note };
}

    // Handle debt pending intent
    if (pending.module === 'debt') {
      const merged = parseDebtInput(text, pending.partialData);
      if (merged.person && merged.amount && merged.action) {
        await clearPendingIntent(userId);
        const direction = merged.action === 'owe' ? 'i_owe' : 'owed_to_me';
        const debt = await Debt.create({
          userId, person: merged.person, amount: merged.amount,
          direction, note: merged.note,
        });
        const dir = direction === 'i_owe' ? `you owe ${debt.person}` : `${debt.person} owes you`;
        await reply(`✅ Recorded: ${dir} ₹${debt.amount}${debt.note ? ` (${debt.note})` : ''}`);
        return res.status(200).end();
      }

      await createPendingIntent(userId, {
        module: 'debt',
        partialData: merged,
        missingField: 'details',
        question: !merged.person ? `Who is this debt with?` : !merged.amount ? `How much is the amount?` : `Do you owe ${merged.person} or do they owe you?`
      });

      const promptMsg = !merged.person && !merged.amount ? `Who is this debt with and what is the amount?\n(Reply e.g.: Andrew 177 owed OR Alex 500 owe)`
        : !merged.person ? `Who is this debt of ₹${merged.amount} with?\n(Reply e.g.: Andrew owed OR Alex owe)`
        : !merged.amount ? `How much is the debt with ${merged.person}?\n(Reply e.g.: 500)`
        : `Did you owe ${merged.person} or do they owe you?\n(Reply owe OR owed)`;
      await reply(promptMsg);
      return res.status(200).end();
    }

    // Handle classify_forward pending intent for forwarded / plain text messages
    if (pending.module === 'classify_forward') {
      const choice = text.trim().toLowerCase();
      const rawText = pending.partialData.rawText;

      if (choice === '1' || choice === 'todo' || choice.includes('to-do')) {
        await clearPendingIntent(userId);
        const todo = await Todo.create({ userId, title: rawText });
        await reply(`✅ To-do added: "${todo.title}"`);
        return res.status(200).end();
      }

      if (choice === '2' || choice === 'debt') {
        await clearPendingIntent(userId);
        const parsedData = parseDebtInput(rawText);
        if (parsedData.person && parsedData.amount && parsedData.action) {
          const direction = parsedData.action === 'owe' ? 'i_owe' : 'owed_to_me';
          const debt = await Debt.create({
            userId, person: parsedData.person, amount: parsedData.amount,
            direction, note: parsedData.note,
          });
          const dir = direction === 'i_owe' ? `you owe ${debt.person}` : `${debt.person} owes you`;
          await reply(`✅ Recorded: ${dir} ₹${debt.amount}${debt.note ? ` (${debt.note})` : ''}`);
          return res.status(200).end();
        }

        await createPendingIntent(userId, {
          module: 'debt',
          partialData: parsedData,
          missingField: 'details',
          question: !parsedData.person ? `Who is this debt with?` : `How much is the amount?`
        });

        const promptMsg = !parsedData.person && !parsedData.amount ? `Who is this debt with and what is the amount?\n(Reply e.g.: Andrew 177 owed OR Alex 500 owe)`
          : !parsedData.person ? `Who is this debt of ₹${parsedData.amount} with?\n(Reply e.g.: Andrew owed OR Alex owe)`
          : !parsedData.amount ? `How much is the debt with ${parsedData.person}?\n(Reply e.g.: 500)`
          : `Did you owe ${parsedData.person} or do they owe you?\n(Reply owe OR owed)`;
        await reply(promptMsg);
        return res.status(200).end();
      }

      if (choice === '3' || choice === 'deadline') {
        await clearPendingIntent(userId);
        const parsedDl = parseCommand(`>deadline ${rawText}`);
        if (parsedDl.type === 'deadline') {
          await handleCommand(parsedDl, userId, reply);
          return res.status(200).end();
        }
        await createPendingIntent(userId, {
          module: 'deadline',
          partialData: { title: rawText },
          missingField: 'dueDate',
          question: `When is "${rawText}" due?\n(Reply e.g.: 2026-08-15 18:00)`
        });
        await reply(`When is "${rawText}" due?\n(Reply e.g.: 2026-08-15 18:00)`);
        return res.status(200).end();
      }

      if (choice === '4' || choice === 'date') {
        await clearPendingIntent(userId);
        const parsedDate = parseCommand(`>date ${rawText}`);
        if (parsedDate.type === 'date') {
          await handleCommand(parsedDate, userId, reply);
          return res.status(200).end();
        }
        await createPendingIntent(userId, {
          module: 'date',
          partialData: { title: rawText },
          missingField: 'date',
          question: `What is the date for "${rawText}"?\n(Reply e.g.: 09-14 for birthday or 2026-11-01)`
        });
        await reply(`What is the date for "${rawText}"?\n(Reply e.g.: 09-14 for birthday or 2026-11-01)`);
        return res.status(200).end();
      }

      if (choice === '5' || choice === 'watch' || choice.includes('watchlist')) {
        await clearPendingIntent(userId);
        const item = await WatchlistItem.create({ userId, title: rawText, type: 'show' });
        await reply(`✅ Added to watchlist: "${item.title}" [show]`);
        return res.status(200).end();
      }

      await reply(`Please reply with 1-5 or type cancel:\n1. To-do\n2. Debt\n3. Deadline\n4. Important Date\n5. Watchlist`);
      return res.status(200).end();
    }

    // Generic field answer
    const newPartial = { ...pending.partialData, [pending.missingField]: text };
    const syntheticCommand = buildSyntheticCommand(pending.module, newPartial);
    const reParsed = parseCommand(syntheticCommand);
    await clearPendingIntent(userId);

    if (reParsed.type === 'missing') {
      await createPendingIntent(userId, reParsed);
      await reply(reParsed.question);
    } else {
      await handleCommand(reParsed, userId, reply);
    }
    return res.status(200).end();
  }

  // Non-command message (e.g. forwarded text without leading >)
  if (!text.startsWith('>')) {
    await createPendingIntent(userId, {
      module: 'classify_forward',
      partialData: { rawText: text },
      missingField: 'choice',
      question: `What should I save this as?\n\n1. To-do\n2. Debt\n3. Deadline\n4. Important Date\n5. Watchlist\n\nReply 1-5 or type cancel.`
    });
    await reply(`What should I save this as?\n\n1. To-do\n2. Debt\n3. Deadline\n4. Important Date\n5. Watchlist\n\nReply 1-5 or type cancel.`);
    return res.status(200).end();
  }

  // Fresh command starting with >
  const parsed = parseCommand(text);
  if (parsed.type === 'missing') {
    await createPendingIntent(userId, {
      module: parsed.module,
      partialData: parsed.partialData,
      missingField: parsed.missingField,
      question: parsed.question,
    });
    await reply(parsed.question);
    return res.status(200).end();
  }

  await handleCommand(parsed, userId, reply);
  return res.status(200).end();
}

// Rebuild a synthetic command string from partial data + new answer
function buildSyntheticCommand(module, data) {
  switch (module) {
    case 'todo': return `>todo ${data.title || ''}${data.dueDate ? ` | ${data.dueDate}` : ''}`;
    case 'deadline': return `>deadline ${data.title || ''} | ${data.dueDate || ''} | ${data.category || 'personal'}`;
    case 'date': return `>date ${data.title || ''} | ${data.date || ''} | ${data.recurring || 'none'}`;
    case 'debt': return `>debt ${data.action || 'owe'} ${data.person || ''} ${data.amount || ''} ${data.note || ''}`;
    case 'watch': return `>watch ${data.title || ''}`;
    case 'done': return `>done ${data.query || ''}`;
    case 'list': return `>list ${data.module || ''}`;
    default: return `>${module} ${Object.values(data).join(' ')}`;
  }
}
