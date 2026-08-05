import { connectDB } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import Deadline from '@/models/Deadline';
import Todo from '@/models/Todo';
import ImportantDate from '@/models/ImportantDate';
import Reminder from '@/models/Reminder';
import User from '@/models/User';



function minutesUntil(date) {
  return (new Date(date) - Date.now()) / 60000;
}

export default async function handler(req, res) {
  const secret = req.headers['x-cron-secret'] || req.query.secret;
  const isExternalCron =
    req.headers['x-vercel-cron'] === '1' ||
    req.headers['user-agent']?.includes('vercel-cron') ||
    req.headers['user-agent']?.includes('cron-job') ||
    req.headers['user-agent']?.includes('Cron-Job');

  // If CRON_SECRET is defined in env, enforce it unless triggered by recognized cron provider
  if (process.env.CRON_SECRET && !isExternalCron && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await connectDB();

  const users = await User.find({});
  let sent = 0;

  for (const user of users) {
    const userId = user._id;
    const waNumber = user.whatsappNumber;
    const mode = user.environmentMode || 'live';
    const envQuery = mode === 'live'
      ? { userId, $or: [{ environmentMode: 'live' }, { environmentMode: { $exists: false } }] }
      : { userId, environmentMode: 'development' };

    // --- Timed Reminders (Atomic claim lock prevents duplicates) ---
    const dueReminders = await Reminder.find({
      ...envQuery,
      sent: false,
      remindAt: { $lte: new Date() },
    });
    for (const r of dueReminders) {
      const claimed = await Reminder.findOneAndUpdate(
        { _id: r._id, sent: false },
        { sent: true, sentAt: new Date() },
        { new: true }
      );
      if (claimed) {
        await sendWhatsAppMessage(waNumber, `🔔 Reminder [${mode.toUpperCase()}]: "${r.title}"`);
        sent++;
      }
    }

    // --- Deadlines ---
    const deadlines = await Deadline.find(envQuery);
    for (const dl of deadlines) {
      const minsLeft = minutesUntil(dl.dueDate);

      // Overdue alert (if not completed and not yet notified as overdue)
      if (minsLeft < 0) {
        // Atomic claim for overdue notification
        const claimed = await Deadline.findOneAndUpdate(
          { _id: dl._id, remindersSent: { $ne: -1 } },
          { $addToSet: { remindersSent: -1 } },
          { new: true }
        );
        if (claimed) {
          const dueTimeStr = new Date(dl.dueDate).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
          await sendWhatsAppMessage(waNumber, `⚠️ Overdue Deadline [${mode.toUpperCase()}]: "${dl.title}" was due at ${dueTimeStr}!`);
          sent++;
        }
        continue;
      }

      // Check offsets in descending order (largest time remaining to smallest)
      const offsets = [...(dl.reminderOffsets || [2880, 1440, 60])].sort((a, b) => b - a);

      for (let i = 0; i < offsets.length; i++) {
        const offset = offsets[i];
        if (dl.remindersSent.includes(offset)) continue;

        // Skip offsets that had already passed by the time this deadline was created.
        // (e.g. don't send a 48h warning for a deadline created 26h away)
        const createdMinsBeforeDue = (new Date(dl.dueDate) - new Date(dl.createdAt)) / 60000;
        if (createdMinsBeforeDue < offset) continue;

        // Next smaller offset boundary (or 0 if smallest offset)
        const nextOffset = offsets[i + 1] || 0;

        // If time remaining has crossed this offset threshold
        if (minsLeft <= offset && minsLeft > nextOffset) {
          // Atomic claim: only one cron instance can claim this offset
          const claimed = await Deadline.findOneAndUpdate(
            { _id: dl._id, remindersSent: { $ne: offset } },
            { $addToSet: { remindersSent: offset } },
            { new: true }
          );
          if (claimed) {
            const humanTime = offset >= 1440
              ? `${Math.round(offset / 1440)} day(s)`
              : offset >= 60
              ? `${Math.round(offset / 60)} hour(s)`
              : `${offset} minute(s)`;

            await sendWhatsAppMessage(waNumber, `⏰ Deadline Alert [${mode.toUpperCase()}]: "${dl.title}" is due in ${humanTime}!`);
            sent++;
          }
          break; // Fire one offset notification per execution
        }
      }
    }

    // --- Todos with due date in next hour (Atomic claim lock) ---
    const soonTodos = await Todo.find({
      ...envQuery,
      status: 'open',
      reminderSent: { $ne: true },
      dueDate: { $gt: new Date(), $lt: new Date(Date.now() + 65 * 60 * 1000) },
    });
    for (const todo of soonTodos) {
      const claimed = await Todo.findOneAndUpdate(
        { _id: todo._id, reminderSent: { $ne: true } },
        { reminderSent: true },
        { new: true }
      );
      if (claimed) {
        await sendWhatsAppMessage(waNumber, `⏰ Reminder [${mode.toUpperCase()}]: To-do "${todo.title}" is due soon.`);
        sent++;
      }
    }

    // --- Important dates today (IST) ---
    const now = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffsetMs);
    const mm = String(istNow.getMonth() + 1).padStart(2, '0');
    const dd = String(istNow.getDate()).padStart(2, '0');
    const todayStr = `${istNow.getFullYear()}-${mm}-${dd}`;
    const mmdd = `${mm}-${dd}`;

    const allDates = await ImportantDate.find(envQuery);
    for (const d of allDates) {
      const matches =
        (d.recurring === 'yearly' && d.date.endsWith(`-${mmdd}`)) ||
        (d.recurring === 'monthly' && d.date.endsWith(`-${dd}`)) ||
        (d.recurring === 'none' && d.date === todayStr);
      
      if (matches && d.lastNotifiedDate !== todayStr) {
        const claimedDate = await ImportantDate.findOneAndUpdate(
          { _id: d._id, lastNotifiedDate: { $ne: todayStr } },
          { lastNotifiedDate: todayStr },
          { new: true }
        );
        if (claimedDate) {
          await sendWhatsAppMessage(waNumber, `📅 Today is: ${d.title}!`);
          sent++;
        }
      }
    }
  }

  console.log(`Reminders sent: ${sent}`);
  return res.status(200).json({ sent });
}
