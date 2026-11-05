import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Deadline from '@/models/Deadline';
import mongoose from 'mongoose';

async function handler(req, res) {
  try {
    await connectDB();
    const { id } = req.query;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID', code: 'INVALID_ID' } });
    }

    const deadline = await Deadline.findOne({ _id: id, userId });
    if (!deadline) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });

    if (req.method === 'PATCH') {
      const { title, dueDate, category, reminderOffsets } = req.body || {};
      if (title !== undefined) {
        if (typeof title !== 'string' || !title.trim()) {
          return res.status(400).json({ error: { message: 'Title cannot be empty', code: 'INVALID_TITLE' } });
        }
        deadline.title = title.trim();
      }

      if (dueDate !== undefined) {
        const parsed = new Date(dueDate);
        if (isNaN(parsed.getTime())) {
          return res.status(400).json({ error: { message: 'Invalid dueDate format', code: 'INVALID_DATE' } });
        }
        deadline.dueDate = parsed;
        // Reset sent reminders so newly scheduled deadline triggers proper warnings
        deadline.remindersSent = [];
      }

      if (category !== undefined) {
        const validCategories = ['academic', 'internship', 'personal'];
        if (!validCategories.includes(category)) {
          return res.status(400).json({ error: { message: 'Invalid category', code: 'INVALID_CATEGORY' } });
        }
        deadline.category = category;
      }

      if (reminderOffsets !== undefined && Array.isArray(reminderOffsets)) {
        deadline.reminderOffsets = reminderOffsets
          .map(n => parseInt(n, 10))
          .filter(n => !isNaN(n) && n > 0 && n <= 43200);
      }

      await deadline.save();
      return res.status(200).json({ deadline });
    }

    if (req.method === 'DELETE') {
      await deadline.deleteOne();
      return res.status(204).end();
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Deadline [id] API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
