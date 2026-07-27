import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Deadline from '@/models/Deadline';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;

  if (req.method === 'GET') {
    const deadlines = await Deadline.find({ userId }).sort({ dueDate: 1 });
    return res.status(200).json({ deadlines });
  }

  if (req.method === 'POST') {
    const { title, dueDate, category, reminderOffsets } = req.body || {};
    if (!title || !dueDate)
      return res.status(400).json({ error: { message: 'title and dueDate required', code: 'MISSING_FIELDS' } });
    const deadline = await Deadline.create({ userId, title, dueDate, category, reminderOffsets });
    return res.status(201).json({ deadline });
  }

  return res.status(405).end();
}

export default withAuth(handler);
