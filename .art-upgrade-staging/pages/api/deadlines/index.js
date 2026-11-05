import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Deadline from '@/models/Deadline';
import User from '@/models/User';

async function handler(req, res) {
  try {
    await connectDB();
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: { message: 'User not found', code: 'USER_NOT_FOUND' } });

    const mode = user.environmentMode || 'live';
    const queryFilter = mode === 'live'
      ? { userId, $or: [{ environmentMode: 'live' }, { environmentMode: { $exists: false } }] }
      : { userId, environmentMode: 'development' };

    if (req.method === 'GET') {
      const deadlines = await Deadline.find(queryFilter).sort({ dueDate: 1 });
      return res.status(200).json({ deadlines });
    }

    if (req.method === 'POST') {
      const { title, dueDate, category, reminderOffsets } = req.body || {};
      if (!title || typeof title !== 'string' || !title.trim() || !dueDate) {
        return res.status(400).json({ error: { message: 'title and dueDate required', code: 'MISSING_FIELDS' } });
      }

      const parsedDue = new Date(dueDate);
      if (isNaN(parsedDue.getTime())) {
        return res.status(400).json({ error: { message: 'Invalid dueDate format', code: 'INVALID_DATE' } });
      }

      const validCategories = ['academic', 'internship', 'personal'];
      const cleanCategory = validCategories.includes(category) ? category : 'personal';

      let cleanOffsets = [2880, 1440, 60];
      if (Array.isArray(reminderOffsets) && reminderOffsets.length > 0) {
        cleanOffsets = reminderOffsets
          .map(n => parseInt(n, 10))
          .filter(n => !isNaN(n) && n > 0 && n <= 43200); // Max 30 days
      }

      const deadline = await Deadline.create({
        userId,
        title: title.trim(),
        dueDate: parsedDue,
        category: cleanCategory,
        reminderOffsets: cleanOffsets,
        environmentMode: mode
      });
      return res.status(201).json({ deadline });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Deadlines API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
