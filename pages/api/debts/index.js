import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Debt from '@/models/Debt';
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
      const debts = await Debt.find(queryFilter).sort({ createdAt: -1 });
      let totalOwe = 0, totalOwed = 0;
      debts.filter(d => !d.settled).forEach(d => {
        if (d.direction === 'i_owe') totalOwe += d.amount;
        else totalOwed += d.amount;
      });
      const net = Math.round((totalOwed - totalOwe) * 100) / 100;
      return res.status(200).json({ debts, summary: { totalOwe: Math.round(totalOwe * 100) / 100, totalOwed: Math.round(totalOwed * 100) / 100, net } });
    }

    if (req.method === 'POST') {
      const { person, amount, direction, note, currency } = req.body || {};
      const numAmount = parseFloat(amount);
      if (!person || isNaN(numAmount) || numAmount <= 0 || !['i_owe', 'owed_to_me'].includes(direction)) {
        return res.status(400).json({ error: { message: 'person, valid positive amount, and valid direction (i_owe/owed_to_me) required', code: 'INVALID_FIELDS' } });
      }
      const debt = await Debt.create({ userId, person: String(person).trim(), amount: numAmount, direction, note: note || '', currency: currency || 'INR', environmentMode: mode });
      return res.status(201).json({ debt });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Debts API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
