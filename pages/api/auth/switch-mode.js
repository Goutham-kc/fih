import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { logAudit } from '@/lib/audit';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, mode, password } = req.body;
  if (!token || !mode || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['live', 'development'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode specified' });
  }

  await connectDB();

  try {
    const user = await User.findOne({ 
      modeSwitchToken: token,
      modeSwitchExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Update mode and clear token
    user.environmentMode = mode;
    user.modeSwitchToken = undefined;
    user.modeSwitchExpires = undefined;
    await user.save();

    await logAudit(user._id, {
      action: 'SYSTEM',
      module: 'system',
      description: `Switched environment mode to: ${mode.toUpperCase()} (via secure link verification)`,
      environmentMode: mode
    });

    // Notify user via WhatsApp
    await sendWhatsAppMessage(user.whatsappNumber, `✅ Your account is now in *${mode.toUpperCase()}* mode.`);

    return res.status(200).json({ success: true, mode });
  } catch (error) {
    console.error('Mode switch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
