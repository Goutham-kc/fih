import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import User from '@/models/User';
import Presence from '@/models/Presence';

async function handler(req, res) {
  try {
    await connectDB();
    const userId = req.userId;

    if (req.method === 'POST') {
      const { x, y, dir, walking, characterId } = req.body || {};
      const user = await User.findById(userId).select('email');
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Format display name from email (e.g. "arjun" from "arjun@gmail.com")
      const cleanEmail = user.email || '';
      const rawName = cleanEmail.split('@')[0] || 'Villager';
      const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      // Upsert current player's presence
      await Presence.findOneAndUpdate(
        { userId },
        {
          userId,
          email: cleanEmail,
          name: displayName,
          characterId: characterId || 'celine',
          x: Math.round(Number(x) || 1324),
          y: Math.round(Number(y) || 2133),
          dir: Number(dir) || 0,
          walking: Boolean(walking),
          lastSeen: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Fetch other players active in the last 20 seconds
      const activeCutoff = new Date(Date.now() - 20000);
      const otherPlayers = await Presence.find({
        userId: { $ne: userId },
        lastSeen: { $gte: activeCutoff },
      }).select('userId name email characterId x y dir walking lastSeen');

      return res.status(200).json({
        ok: true,
        self: {
          id: userId,
          name: displayName,
          email: cleanEmail,
        },
        players: otherPlayers.map((p) => ({
          id: p.userId.toString(),
          name: p.name,
          email: p.email,
          characterId: p.characterId || 'celine',
          x: p.x,
          y: p.y,
          dir: p.dir,
          walking: p.walking,
        })),
      });
    }

    if (req.method === 'GET') {
      const activeCutoff = new Date(Date.now() - 20000);
      const otherPlayers = await Presence.find({
        userId: { $ne: userId },
        lastSeen: { $gte: activeCutoff },
      }).select('userId name email characterId x y dir walking lastSeen');

      return res.status(200).json({
        players: otherPlayers.map((p) => ({
          id: p.userId.toString(),
          name: p.name,
          email: p.email,
          characterId: p.characterId || 'celine',
          x: p.x,
          y: p.y,
          dir: p.dir,
          walking: p.walking,
        })),
      });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('World Presence API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

export default withAuth(handler);
