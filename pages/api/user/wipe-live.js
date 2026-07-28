import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Todo from '@/models/Todo';
import Debt from '@/models/Debt';
import Deadline from '@/models/Deadline';
import ImportantDate from '@/models/ImportantDate';
import WatchlistItem from '@/models/WatchlistItem';
import Reminder from '@/models/Reminder';
import PendingIntent from '@/models/PendingIntent';

async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') return res.status(405).end();

  await connectDB();
  const userId = req.userId;
  const liveQuery = { userId, $or: [{ environmentMode: 'live' }, { environmentMode: { $exists: false } }] };

  const [t, d, dl, dt, w, r, p] = await Promise.all([
    Todo.deleteMany(liveQuery),
    Debt.deleteMany(liveQuery),
    Deadline.deleteMany(liveQuery),
    ImportantDate.deleteMany(liveQuery),
    WatchlistItem.deleteMany(liveQuery),
    Reminder.deleteMany(liveQuery),
    PendingIntent.deleteMany(liveQuery),
  ]);

  const deletedCounts = {
    todos: t.deletedCount,
    debts: d.deletedCount,
    deadlines: dl.deletedCount,
    importantDates: dt.deletedCount,
    watchlistItems: w.deletedCount,
    reminders: r.deletedCount,
    pendingIntents: p.deletedCount,
  };

  return res.status(200).json({ ok: true, message: 'Live database wiped successfully.', deletedCounts });
}

export default withAuth(handler);
