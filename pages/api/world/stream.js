import { withAuth } from '@/lib/auth';
import { registerSubscriber } from '@/lib/worldPresenceHub';

function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Register this client for real-time presence stream
  registerSubscriber(req.userId, res);
}

export default withAuth(handler);
