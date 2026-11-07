import { withAuth } from '@/lib/auth';
import { removePlayerPresence } from '@/lib/worldPresenceHub';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await removePlayerPresence(req.userId);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('World leave API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

export default withAuth(handler);
