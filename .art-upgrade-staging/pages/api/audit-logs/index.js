import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import AuditLog from '@/models/AuditLog';
import User from '@/models/User';

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
      const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 150));
      const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);

      const logs = await AuditLog.find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return res.status(200).json({ logs });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Audit logs API error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
}

export default withAuth(handler);
