import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Todo from '@/models/Todo';

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;
  const userId = req.userId;
  const todo = await Todo.findOne({ _id: id, userId });
  if (!todo) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });

  if (req.method === 'PATCH') {
    const { title, description, dueDate, priority, status } = req.body || {};
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (dueDate !== undefined) todo.dueDate = dueDate || null;
    if (priority !== undefined) todo.priority = priority;
    if (status !== undefined) {
      todo.status = status;
      todo.completedAt = status === 'done' ? new Date() : null;
    }
    await todo.save();
    return res.status(200).json({ todo });
  }

  if (req.method === 'DELETE') {
    await todo.deleteOne();
    return res.status(204).end();
  }

  return res.status(405).end();
}

export default withAuth(handler);
