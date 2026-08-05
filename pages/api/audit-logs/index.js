import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import AuditLog from '@/models/AuditLog';
import User from '@/models/User';

async function handler(req, res) {
  await connectDB();
  const userId = req.userId;
  const user = await User.findById(userId);
  const mode = user?.environmentMode || 'live';
  
  const queryFilter = mode === 'live'
    ? { userId, $or: [{ environmentMode: 'live' }, { environmentMode: { $exists: false } }] }
    : { userId, environmentMode: 'development' };

  if (req.method === 'GET') {
    const logs = await AuditLog.find(queryFilter).sort({ createdAt: -1 }).limit(150);
    return res.status(200).json({ logs });
  }

  return res.status(405).end();
}

export default withAuth(handler);
