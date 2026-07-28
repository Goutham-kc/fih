import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Reminder from '@/models/Reminder';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;

  if (req.method === 'GET') {
    const reminders = await Reminder.find({ userId }).sort({ remindAt: 1 });
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
      remindAt: new Date(remindAt),
    });

    return res.status(201).json({ reminder });
  }

  return res.status(405).end();
}

export default withAuth(handler);
