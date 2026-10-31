import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Debt from '@/models/Debt';
import mongoose from 'mongoose';

async function handler(req, res) {
  try {
    await connectDB();
    const { id } = req.query;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID', code: 'INVALID_ID' } });
    }

    const debt = await Debt.findOne({ _id: id, userId });
    if (!debt) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });

    if (req.method === 'PATCH') {
      // Whitelist updatable fields to prevent mass-assignment of userId, _id, environmentMode
      const { person, amount, direction, note, currency, settled } = req.body || {};
      if (person !== undefined) debt.person = person;
      if (amount !== undefined) debt.amount = amount;
      if (direction !== undefined) debt.direction = direction;
      if (note !== undefined) debt.note = note;
      if (currency !== undefined) debt.currency = currency;
      if (settled !== undefined) {
        debt.settled = settled;
        debt.settledDate = settled ? new Date() : null;
      }
      await debt.save();
      return res.status(200).json({ debt });
    }

    if (req.method === 'DELETE') {
      await debt.deleteOne();
      return res.status(204).end();
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Debt [id] API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
