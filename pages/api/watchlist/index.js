import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import WatchlistItem from '@/models/WatchlistItem';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;

  if (req.method === 'GET') {
    const items = await WatchlistItem.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ items });
  }

  if (req.method === 'POST') {
    const { title, type, notes } = req.body || {};
    if (!title) return res.status(400).json({ error: { message: 'title required', code: 'MISSING_FIELDS' } });
    const item = await WatchlistItem.create({ userId, title, type, notes });
    return res.status(201).json({ item });
  }

  return res.status(405).end();
}

export default withAuth(handler);
