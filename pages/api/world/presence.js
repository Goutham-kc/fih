import { withAuth } from '@/lib/auth';
import { updatePlayerPresence, getActivePlayers } from '@/lib/worldPresenceHub';

async function handler(req, res) {
  try {
    const userId = req.userId;

    if (req.method === 'POST') {
      const { x, y, dir, walking, characterId } = req.body || {};
      const self = await updatePlayerPresence(userId, { x, y, dir, walking, characterId });
      const otherPlayers = await getActivePlayers(userId);

      return res.status(200).json({
        ok: true,
        self: {
          id: self.id,
          name: self.name,
          email: self.email,
        },
        players: otherPlayers,
      });
    }

    if (req.method === 'GET') {
      const otherPlayers = await getActivePlayers(userId);
      return res.status(200).json({
        ok: true,
        players: otherPlayers,
      });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('World Presence API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

export default withAuth(handler);
