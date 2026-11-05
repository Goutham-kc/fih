import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import WatchlistItem from '@/models/WatchlistItem';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

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
      const items = await WatchlistItem.find(queryFilter).sort({ createdAt: -1 });
      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      const { title, type, notes } = req.body || {};
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: { message: 'title required', code: 'MISSING_FIELDS' } });
      }

      const validTypes = ['movie', 'show', 'anime', 'book', 'paper'];
      const cleanType = validTypes.includes(type) ? type : 'show';

      const item = await WatchlistItem.create({
        userId,
        title: title.trim(),
        type: cleanType,
        notes: notes || '',
        environmentMode: mode
      });

      await logAudit(userId, {
        action: 'CREATE',
        module: 'watch',
        description: `Added "${item.title}" to watchlist [${item.type}]`,
        environmentMode: mode
      });
      return res.status(201).json({ item });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Watchlist API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
