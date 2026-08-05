import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (req.method === 'GET') {
    return res.status(200).json({
      environmentMode: user.environmentMode || 'live',
      theme: user.theme || 'dark'
    });
  }

  if (req.method === 'PATCH') {
    const { environmentMode, theme } = req.body || {};
    if (environmentMode) {
      if (!['live', 'development'].includes(environmentMode)) {
        return res.status(400).json({ error: 'Invalid environmentMode. Must be live or development' });
      }
      user.environmentMode = environmentMode;
      await logAudit(userId, {
        action: 'SYSTEM',
        module: 'system',
        description: `Switched environment mode to: ${environmentMode.toUpperCase()} (via UI setting)`,
        environmentMode: environmentMode
      });
    }
    if (theme) {
      if (!['dark', 'light', 'system'].includes(theme)) {
        return res.status(400).json({ error: 'Invalid theme. Must be dark, light, or system' });
      }
      user.theme = theme;
    }
    await user.save();
    return res.status(200).json({
      environmentMode: user.environmentMode,
      theme: user.theme
    });
  }

  return res.status(405).end();
}

export default withAuth(handler);
