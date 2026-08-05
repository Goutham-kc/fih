import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import WatchlistItem from '@/models/WatchlistItem';

async function handler(req, res) {
  try {
    await connectDB();
    const { id } = req.query;
    const userId = req.userId;
    const item = await WatchlistItem.findOne({ _id: id, userId });
    if (!item) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });

    if (req.method === 'PATCH') {
      const { status, rating, notes, type } = req.body || {};
      if (status !== undefined) item.status = status;
      if (rating !== undefined) item.rating = rating;
      if (notes !== undefined) item.notes = notes;
      if (type !== undefined) item.type = type;
      await item.save();
      return res.status(200).json({ item });
    }

    if (req.method === 'DELETE') {
      await item.deleteOne();
      return res.status(204).end();
    }

    return res.status(405).end();
  } catch (error) {
    console.error('Watchlist API error:', error);
    return res.status(500).json({ error: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
