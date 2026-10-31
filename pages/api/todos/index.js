import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Todo from '@/models/Todo';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

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
      const todos = await Todo.find(queryFilter).sort({ dueDate: 1, createdAt: -1 });
      return res.status(200).json({ todos });
    }

    if (req.method === 'POST') {
      const { title, description, dueDate, priority } = req.body || {};
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: { message: 'Title required', code: 'MISSING_FIELDS' } });
      }

      let parsedDue = null;
      if (dueDate) {
        parsedDue = new Date(dueDate);
        if (isNaN(parsedDue.getTime())) {
          return res.status(400).json({ error: { message: 'Invalid dueDate format', code: 'INVALID_DATE' } });
        }
      }

      const validPriorities = ['low', 'medium', 'high'];
      const cleanPriority = validPriorities.includes(priority) ? priority : 'medium';

      const todo = await Todo.create({
        userId,
        title: title.trim(),
        description: description || '',
        dueDate: parsedDue,
        priority: cleanPriority,
        environmentMode: mode
      });

      await logAudit(userId, {
        action: 'CREATE',
        module: 'todo',
        description: `Created to-do: "${todo.title}"`,
        environmentMode: mode
      });
      return res.status(201).json({ todo });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Todos API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
