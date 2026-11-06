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
        email: user.email,
        username: user.username || '',
        whatsappNumber: user.whatsappNumber,
        environmentMode: user.environmentMode || 'live',
        theme: user.theme || 'dark',
      });
    }

    if (req.method === 'PATCH') {
      const { environmentMode, theme, whatsappNumber, username } = req.body || {};
      let modeChanged = false;

      if (username !== undefined) {
        const cleanUsername = String(username).toLowerCase().trim();
        if (cleanUsername) {
          if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(cleanUsername)) {
            return res.status(400).json({ error: 'Username must be 3-30 characters (letters, numbers, _, -, .)' });
          }
          if (cleanUsername !== user.username) {
            const inUse = await User.findOne({
              _id: { $ne: userId },
              username: cleanUsername,
            });
            if (inUse) {
              return res.status(409).json({ error: 'This username is already taken' });
            }
            user.username = cleanUsername;
          }
        } else {
          user.username = undefined;
        }
      }

      if (whatsappNumber !== undefined) {
        const cleanPhone = String(whatsappNumber).replace(/\D/g, '').trim();
        if (cleanPhone.length < 10) {
          return res.status(400).json({ error: 'Please provide a valid WhatsApp number with country code (at least 10 digits)' });
        }
        if (cleanPhone !== user.whatsappNumber) {
          const last10 = cleanPhone.slice(-10);
          const inUse = await User.findOne({
            _id: { $ne: userId },
            $or: [
              { whatsappNumber: cleanPhone },
              { whatsappNumber: new RegExp(last10 + '$') },
            ],
          });
          if (inUse) {
            return res.status(409).json({ error: 'This WhatsApp number is already linked to another account' });
          }
          user.whatsappNumber = cleanPhone;
        }
      }

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
          environmentMode: user.environmentMode,
        });
      }

      return res.status(200).json({
        email: user.email,
        username: user.username || '',
        whatsappNumber: user.whatsappNumber,
        environmentMode: user.environmentMode,
        theme: user.theme,
      });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Settings API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
