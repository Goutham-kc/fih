import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Debt from '@/models/Debt';
import User from '@/models/User';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;
  const user = await User.findById(userId);
  const mode = user?.environmentMode || 'live';
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
    return res.status(200).json({ debts, summary: { totalOwe, totalOwed, net: totalOwed - totalOwe } });
  }

  if (req.method === 'POST') {
    const { person, amount, direction, note, currency } = req.body || {};
    if (!person || !amount || !direction)
      return res.status(400).json({ error: { message: 'person, amount, direction required', code: 'MISSING_FIELDS' } });
    const debt = await Debt.create({ userId, person, amount, direction, note, currency, environmentMode: mode });
    return res.status(201).json({ debt });
  }

  return res.status(405).end();
}

export default withAuth(handler);
