import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import WatchlistItem from '@/models/WatchlistItem';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;
  const user = await User.findById(userId);
  const mode = user?.environmentMode || 'live';
  const queryFilter = mode === 'live'
    ? { userId, $or: [{ environmentMode: 'live' }, { environmentMode: { $exists: false } }] }
    : { userId, environmentMode: 'development' };

  if (req.method === 'GET') {
    const items = await WatchlistItem.find(queryFilter).sort({ createdAt: -1 });
    return res.status(200).json({ items });
  }

  if (req.method === 'POST') {
    const { title, type, notes } = req.body || {};
    if (!title)
      return res.status(400).json({ error: { message: 'title required', code: 'MISSING_FIELDS' } });
    const item = await WatchlistItem.create({ userId, title, type, notes, environmentMode: mode });
    await logAudit(userId, {
      action: 'CREATE',
      module: 'watch',
      description: `Added "${item.title}" to watchlist [${type}]`,
      environmentMode: mode
    });
    return res.status(201).json({ item });
  }

  return res.status(405).end();
}

export default withAuth(handler);
