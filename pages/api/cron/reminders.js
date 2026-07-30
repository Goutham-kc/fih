import { connectDB } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import Deadline from '@/models/Deadline';
import Todo from '@/models/Todo';
import ImportantDate from '@/models/ImportantDate';
import Reminder from '@/models/Reminder';
import User from '@/models/User';

const TOLERANCE_MINUTES = 15;

function minutesUntil(date) {
  return (new Date(date) - Date.now()) / 60000;
}

export default async function handler(req, res) {
  const secret = req.headers['x-cron-secret'] || req.query.secret;
  const isVercelCron = req.headers['x-vercel-cron'] === '1' || req.headers['user-agent']?.includes('vercel-cron');
  if (!isVercelCron && secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
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
      for (const offset of dl.reminderOffsets) {
        if (dl.remindersSent.includes(offset)) continue;
        if (Math.abs(minsLeft - offset) <= TOLERANCE_MINUTES) {
          const humanTime = offset >= 1440
            ? `${Math.round(offset / 1440)} day(s)`
            : offset >= 60
            ? `${Math.round(offset / 60)} hour(s)`
            : `${offset} minute(s)`;
          await sendWhatsAppMessage(waNumber, `⏰ Deadline Alert [${mode.toUpperCase()}]: "${dl.title}" is due in ${humanTime}!`);
          dl.remindersSent.push(offset);
          await dl.save();
          sent++;
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

    // --- Important dates today ---
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const today = `${now.getFullYear()}-${mm}-${dd}`;
    const mmdd = `${mm}-${dd}`;

    const allDates = await ImportantDate.find(envQuery);
    for (const d of allDates) {
      const matches =
        (d.recurring === 'yearly' && d.date === mmdd) ||
        (d.recurring === 'monthly' && d.date.endsWith(`-${dd}`)) ||
        (d.recurring === 'none' && d.date === today);
      if (matches) {
        await sendWhatsAppMessage(waNumber, `📅 Today is: ${d.title}!`);
        sent++;
      }
    }
  }

  console.log(`Reminders sent: ${sent}`);
  return res.status(200).json({ sent });
}
