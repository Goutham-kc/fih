import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Reminder from '@/models/Reminder';

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;
  const userId = req.userId;

  const reminder = await Reminder.findOne({ _id: id, userId });
  if (!reminder) return res.status(404).json({ error: { message: 'Reminder not found', code: 'NOT_FOUND' } });

  if (req.method === 'PATCH') {
    const { title, remindAt, sent } = req.body || {};
    if (title !== undefined) reminder.title = title;
    if (remindAt !== undefined) reminder.remindAt = new Date(remindAt);
    if (sent !== undefined) {
      reminder.sent = sent;
      reminder.sentAt = sent ? new Date() : null;
    }
    await reminder.save();
    return res.status(200).json({ reminder });
  }

  if (req.method === 'DELETE') {
    await reminder.deleteOne();
    return res.status(204).end();
  }

  return res.status(405).end();
}

export default withAuth(handler);
