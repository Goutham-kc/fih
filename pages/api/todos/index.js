import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Todo from '@/models/Todo';
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
    const todos = await Todo.find(queryFilter).sort({ dueDate: 1, createdAt: -1 });
    return res.status(200).json({ todos });
  }

  if (req.method === 'POST') {
    const { title, description, dueDate, priority } = req.body || {};
    if (!title) return res.status(400).json({ error: { message: 'Title required', code: 'MISSING_FIELDS' } });
    const todo = await Todo.create({ userId, title, description, dueDate: dueDate || null, priority, environmentMode: mode });
    return res.status(201).json({ todo });
  }

  return res.status(405).end();
}

export default withAuth(handler);
