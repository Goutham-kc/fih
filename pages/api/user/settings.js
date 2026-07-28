import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import User from '@/models/User';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (req.method === 'GET') {
    return res.status(200).json({ environmentMode: user.environmentMode || 'live' });
  }

  if (req.method === 'PATCH') {
    const { environmentMode } = req.body || {};
    if (!['live', 'development'].includes(environmentMode)) {
      return res.status(400).json({ error: 'Invalid environmentMode. Must be live or development' });
    }
    user.environmentMode = environmentMode;
    await user.save();
    return res.status(200).json({ environmentMode: user.environmentMode });
  }

  return res.status(405).end();
}

export default withAuth(handler);
