import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import ImportantDate from '@/models/ImportantDate';
import mongoose from 'mongoose';

async function handler(req, res) {
  try {
    await connectDB();
    const { id } = req.query;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID', code: 'INVALID_ID' } });
    }

    const record = await ImportantDate.findOne({ _id: id, userId });
    if (!record) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });

    if (req.method === 'PATCH') {
      const { title, date, recurring, notes } = req.body || {};
      if (title !== undefined) {
        if (typeof title !== 'string' || !title.trim()) {
          return res.status(400).json({ error: { message: 'Title cannot be empty', code: 'INVALID_TITLE' } });
        }
        record.title = title.trim();
      }

      if (date !== undefined) {
        const isMMDD = /^\d{2}-\d{2}$/.test(date);
        const isFullDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
        if (!isMMDD && !isFullDate) {
          return res.status(400).json({ error: { message: 'Date format must be MM-DD or YYYY-MM-DD', code: 'INVALID_DATE_FORMAT' } });
        }
        record.date = date;
        // Reset lastNotifiedDate so date changes re-trigger notification on the new date
        record.lastNotifiedDate = null;
      }

      if (recurring !== undefined) {
        const validRecurring = ['yearly', 'monthly', 'none'];
        if (!validRecurring.includes(recurring)) {
          return res.status(400).json({ error: { message: 'Invalid recurring value', code: 'INVALID_RECURRING' } });
        }
        record.recurring = recurring;
      }

      if (notes !== undefined) record.notes = notes;

      await record.save();
      return res.status(200).json({ date: record });
    }

    if (req.method === 'DELETE') {
      await record.deleteOne();
      return res.status(204).end();
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Dates [id] API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
