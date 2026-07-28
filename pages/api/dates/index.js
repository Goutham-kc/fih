import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import ImportantDate from '@/models/ImportantDate';
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
    const dates = await ImportantDate.find(queryFilter).sort({ date: 1 });
    return res.status(200).json({ dates });
  }

  if (req.method === 'POST') {
    const { title, date, recurring, notes } = req.body || {};
    if (!title || !date)
      return res.status(400).json({ error: { message: 'title and date required', code: 'MISSING_FIELDS' } });
    const importantDate = await ImportantDate.create({ userId, title, date, recurring, notes, environmentMode: mode });
    return res.status(201).json({ importantDate });
  }

  return res.status(405).end();
}

export default withAuth(handler);
