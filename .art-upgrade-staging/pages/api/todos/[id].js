import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Todo from '@/models/Todo';
import { logAudit } from '@/lib/audit';
import mongoose from 'mongoose';

async function handler(req, res) {
  try {
    await connectDB();
    const { id } = req.query;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID', code: 'INVALID_ID' } });
    }

    const todo = await Todo.findOne({ _id: id, userId });
    if (!todo) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });

    const mode = todo.environmentMode || 'live';

    if (req.method === 'PATCH') {
      const { title, description, dueDate, priority, status } = req.body || {};
      let statusChanged = false;

      if (status !== undefined) {
        if (!['open', 'done'].includes(status)) {
          return res.status(400).json({ error: { message: 'status must be open or done', code: 'INVALID_STATUS' } });
        }
        if (status !== todo.status) statusChanged = true;
        todo.status = status;
        todo.completedAt = status === 'done' ? new Date() : null;
      }

      if (priority !== undefined) {
        if (!['low', 'medium', 'high'].includes(priority)) {
          return res.status(400).json({ error: { message: 'priority must be low, medium, or high', code: 'INVALID_PRIORITY' } });
        }
        todo.priority = priority;
      }

      if (title !== undefined) {
        if (typeof title !== 'string' || !title.trim()) {
          return res.status(400).json({ error: { message: 'Title cannot be empty', code: 'INVALID_TITLE' } });
        }
        todo.title = title.trim();
      }

      if (description !== undefined) todo.description = description;

      if (dueDate !== undefined) {
        if (dueDate === null || dueDate === '') {
          todo.dueDate = null;
        } else {
          const parsed = new Date(dueDate);
          if (isNaN(parsed.getTime())) {
            return res.status(400).json({ error: { message: 'Invalid dueDate format', code: 'INVALID_DATE' } });
          }
          todo.dueDate = parsed;
        }
      }

      await todo.save();

      let logMsg = `Updated to-do: "${todo.title}"`;
      if (statusChanged) {
        logMsg = todo.status === 'done' 
          ? `Completed to-do: "${todo.title}"` 
          : `Reopened to-do: "${todo.title}"`;
      }
      await logAudit(userId, {
        action: 'UPDATE',
        module: 'todo',
        description: logMsg,
        environmentMode: mode
      });

      return res.status(200).json({ todo });
    }

    if (req.method === 'DELETE') {
      await todo.deleteOne();
      await logAudit(userId, {
        action: 'DELETE',
        module: 'todo',
        description: `Deleted to-do: "${todo.title}"`,
        environmentMode: mode
      });
      return res.status(204).end();
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Todo [id] API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
