import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Reminder from '@/models/Reminder';
import mongoose from 'mongoose';

async function handler(req, res) {
  try {
    await connectDB();
    const { id } = req.query;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID', code: 'INVALID_ID' } });
    }

    const reminder = await Reminder.findOne({ _id: id, userId });
    if (!reminder) return res.status(404).json({ error: { message: 'Reminder not found', code: 'NOT_FOUND' } });

    if (req.method === 'PATCH') {
      const { title, remindAt, sent } = req.body || {};
      if (title !== undefined) {
        if (typeof title !== 'string' || !title.trim()) {
          return res.status(400).json({ error: { message: 'Title cannot be empty', code: 'INVALID_TITLE' } });
        }
        reminder.title = title.trim();
      }

      if (remindAt !== undefined) {
        const parsed = new Date(remindAt);
        if (isNaN(parsed.getTime())) {
          return res.status(400).json({ error: { message: 'Invalid remindAt format', code: 'INVALID_DATE' } });
        }
        reminder.remindAt = parsed;
      }

      if (sent !== undefined) {
        reminder.sent = Boolean(sent);
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
  } catch (err) {
    console.error('Reminder [id] API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
