import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Reminder from '@/models/Reminder';
import User from '@/models/User';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { logAudit } from '@/lib/audit';

async function checkAndSendDueReminders(user) {
  if (!user || !user.whatsappNumber) return;
  const userId = user._id;
  const waNumber = user.whatsappNumber;
  const mode = user.environmentMode || 'live';
  const queryFilter = mode === 'live'
    ? { userId, $or: [{ environmentMode: 'live' }, { environmentMode: { $exists: false } }] }
    : { userId, environmentMode: 'development' };

  const dueReminders = await Reminder.find({
    ...queryFilter,
    sent: false,
    remindAt: { $lte: new Date() },
  });

  for (const r of dueReminders) {
    const claimed = await Reminder.findOneAndUpdate(
      { _id: r._id, sent: false },
      { sent: true, sentAt: new Date() },
      { new: true }
    );
    if (claimed) {
      await sendWhatsAppMessage(waNumber, `🔔 Reminder [${mode.toUpperCase()}]: "${claimed.title}"`);
      await logAudit(userId, {
        action: 'NOTIFICATION',
        module: 'reminder',
        description: `Dispatched WhatsApp reminder: "${claimed.title}"`,
        environmentMode: mode
      });
    }
  }
}

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
      const reminders = await Reminder.find(queryFilter).sort({ remindAt: 1 });
      return res.status(200).json({ reminders });
    }

    if (req.method === 'POST') {
      const { title, remindAt } = req.body || {};
      if (!title || typeof title !== 'string' || !title.trim() || !remindAt) {
        return res.status(400).json({ error: { message: 'Title and remindAt date required', code: 'MISSING_FIELDS' } });
      }

      const parsedAt = new Date(remindAt);
      if (isNaN(parsedAt.getTime())) {
        return res.status(400).json({ error: { message: 'Invalid remindAt date format', code: 'INVALID_DATE' } });
      }

      const reminder = await Reminder.create({
        userId,
        title: title.trim(),
        remindAt: parsedAt,
        environmentMode: mode,
      });

      // Check immediately if this newly created reminder is already due
      if (parsedAt <= new Date()) {
        await checkAndSendDueReminders(user);
      }

      return res.status(201).json({ reminder });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Reminders API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
