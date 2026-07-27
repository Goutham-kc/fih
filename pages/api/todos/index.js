import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Todo from '@/models/Todo';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;

  if (req.method === 'GET') {
    const todos = await Todo.find({ userId }).sort({ dueDate: 1, createdAt: -1 });
    return res.status(200).json({ todos });
  }

  if (req.method === 'POST') {
    const { title, description, dueDate, priority } = req.body || {};
    if (!title) return res.status(400).json({ error: { message: 'Title required', code: 'MISSING_FIELDS' } });
    const todo = await Todo.create({ userId, title, description, dueDate: dueDate || null, priority });
    return res.status(201).json({ todo });
  }

  return res.status(405).end();
}

export default withAuth(handler);
