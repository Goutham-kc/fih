import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

async function handler(req, res) {
  try {
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
      let modeChanged = false;

      if (environmentMode !== undefined) {
        if (!['live', 'development'].includes(environmentMode)) {
          return res.status(400).json({ error: 'Invalid environmentMode. Must be live or development' });
        }
        if (user.environmentMode !== environmentMode) {
          user.environmentMode = environmentMode;
          modeChanged = true;
        }
      }

      if (theme !== undefined) {
        if (!['dark', 'light', 'system'].includes(theme)) {
          return res.status(400).json({ error: 'Invalid theme. Must be dark, light, or system' });
        }
        user.theme = theme;
      }

      await user.save();

      // Only log audit after user.save() succeeds
      if (modeChanged) {
        await logAudit(userId, {
          action: 'SYSTEM',
          module: 'system',
          description: `Switched environment mode to: ${user.environmentMode.toUpperCase()} (via UI setting)`,
          environmentMode: user.environmentMode
        });
      }

      return res.status(200).json({
        environmentMode: user.environmentMode,
        theme: user.theme
      });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Settings API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
