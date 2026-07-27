import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import ImportantDate from '@/models/ImportantDate';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;

  if (req.method === 'GET') {
    const dates = await ImportantDate.find({ userId }).sort({ date: 1 });
    return res.status(200).json({ dates });
  }

  if (req.method === 'POST') {
    const { title, date, recurring, notes } = req.body || {};
    if (!title || !date)
      return res.status(400).json({ error: { message: 'title and date required', code: 'MISSING_FIELDS' } });
    const d = await ImportantDate.create({ userId, title, date, recurring, notes });
    return res.status(201).json({ date: d });
  }

  return res.status(405).end();
}

export default withAuth(handler);
