import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Reminder from '@/models/Reminder';
import User from '@/models/User';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;
  const user = await User.findById(userId);
  const mode = user?.environmentMode || 'live';
  const queryFilter = mode === 'live'
    ? { userId, $or: [{ environmentMode: 'live' }, { environmentMode: { $exists: false } }] }
    : { userId, environmentMode: 'development' };

  if (req.method === 'GET') {
    const reminders = await Reminder.find(queryFilter).sort({ remindAt: 1 });
    return res.status(200).json({ reminders });
  }

  if (req.method === 'POST') {
    const { title, remindAt } = req.body || {};
    if (!title || !remindAt) {
      return res.status(400).json({ error: { message: 'Title and remindAt date required', code: 'MISSING_FIELDS' } });
    }
    const reminder = await Reminder.create({
      userId,
      title,
      remindAt,
      environmentMode: mode,
    });
    return res.status(201).json({ reminder });
  }

  return res.status(405).end();
}

export default withAuth(handler);
