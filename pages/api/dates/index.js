import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import ImportantDate from '@/models/ImportantDate';
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
      const dates = await ImportantDate.find(queryFilter).sort({ date: 1 });
      return res.status(200).json({ dates });
    }

    if (req.method === 'POST') {
      const { title, date, recurring, notes } = req.body || {};
      if (!title || typeof title !== 'string' || !title.trim() || !date) {
        return res.status(400).json({ error: { message: 'title and date required', code: 'MISSING_FIELDS' } });
      }

      const isMMDD = /^\d{2}-\d{2}$/.test(date);
      const isFullDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
      if (!isMMDD && !isFullDate) {
        return res.status(400).json({ error: { message: 'Date format must be MM-DD (e.g. 09-14) or YYYY-MM-DD (e.g. 2026-09-14)', code: 'INVALID_DATE_FORMAT' } });
      }

      const validRecurring = ['yearly', 'monthly', 'none'];
      const cleanRecurring = validRecurring.includes(recurring) ? recurring : 'none';

      const importantDate = await ImportantDate.create({
        userId,
        title: title.trim(),
        date,
        recurring: cleanRecurring,
        notes: notes || '',
        environmentMode: mode
      });
      return res.status(201).json({ importantDate });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Dates API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
