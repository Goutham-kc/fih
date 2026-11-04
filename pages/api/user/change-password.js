import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current password and new password are required' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  try {
    await connectDB();
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newHash;
    await user.save();

    await logAudit(req.userId, {
      action: 'SYSTEM',
      module: 'system',
      description: 'Account password was updated successfully (via Settings)',
      environmentMode: user.environmentMode || 'live',
    });

    return res.status(200).json({ ok: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: err.message || 'Server error changing password' });
  }
}

export default withAuth(handler);
