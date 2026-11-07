import Presence from '@/models/Presence';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

// Ensure singleton instance across Next.js dev server reloads
const globalHub = globalThis.__WORLD_PRESENCE_HUB__ || {
  players: new Map(),
  subscribers: new Set(),
  userCache: new Map(),
  hydrated: false,
};

globalThis.__WORLD_PRESENCE_HUB__ = globalHub;

/**
 * Invalidate or update cached user info when profile changes
 */
export function invalidateUserCache(userId, newUsername = null) {
  const idStr = userId.toString();
  if (newUsername) {
    const raw = String(newUsername).trim();
    const formatted = raw.charAt(0).toUpperCase() + raw.slice(1);
    const existing = globalHub.userCache.get(idStr);
    globalHub.userCache.set(idStr, {
      email: existing?.email || '',
      name: formatted,
    });
    const p = globalHub.players.get(idStr);
    if (p) {
      p.name = formatted;
      broadcast({
        type: 'player_moved',
        player: { ...p },
      });
    }
  } else {
    globalHub.userCache.delete(idStr);
  }
}

/**
 * Format user display name from username or email handle
 */
export function formatDisplayName(user) {
  if (!user) return 'Villager';
  const raw = user.username || user.email?.split('@')[0] || 'Villager';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * Get cached or DB user info
 */
async function getUserInfo(userId) {
  const userIdStr = userId.toString();
  if (globalHub.userCache.has(userIdStr)) {
    return globalHub.userCache.get(userIdStr);
  }
  try {
    await connectDB();
    const user = await User.findById(userId).select('email username');
    if (user) {
      const info = {
        email: user.email || '',
        name: formatDisplayName(user),
      };
      globalHub.userCache.set(userIdStr, info);
      return info;
    }
  } catch (err) {
    console.error('[WorldPresenceHub] Failed to get user info:', err);
  }
  return { email: '', name: 'Villager' };
}

/**
 * Send an SSE event payload to all connected subscribers (optionally excluding a specific userId)
 */
function broadcast(payload, excludeUserId = null) {
  const excludeStr = excludeUserId ? excludeUserId.toString() : null;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of globalHub.subscribers) {
    if (excludeStr && res.userId && res.userId === excludeStr) {
      continue;
    }
    try {
      if (res.writable && !res.writableEnded) {
        res.write(data);
      } else {
        globalHub.subscribers.delete(res);
      }
    } catch {
      globalHub.subscribers.delete(res);
    }
  }
}

/**
 * Hydrate active players from MongoDB on cold boot
 */
async function ensureHydrated() {
  if (globalHub.hydrated) return;
  globalHub.hydrated = true;
  try {
    await connectDB();
    const cutoff = new Date(Date.now() - 20000);
    const existing = await Presence.find({ lastSeen: { $gte: cutoff } }).lean();
    for (const p of existing) {
      const idStr = p.userId.toString();
      if (!globalHub.players.has(idStr)) {
        globalHub.players.set(idStr, {
          id: idStr,
          name: p.name,
          email: p.email,
          characterId: p.characterId || 'celine',
          x: p.x,
          y: p.y,
          dir: p.dir || 0,
          walking: Boolean(p.walking),
          lastSeen: new Date(p.lastSeen).getTime(),
          lastDbSync: Date.now(),
        });
      }
    }
  } catch (err) {
    console.error('[WorldPresenceHub] Hydration error:', err);
  }
}

/**
 * Get active player list (last seen within 20s)
 */
export async function getActivePlayers(excludeUserId = null) {
  await ensureHydrated();
  const now = Date.now();
  const cutoff = now - 20000;
  const list = [];
  const excludeStr = excludeUserId ? excludeUserId.toString() : null;

  for (const [id, p] of globalHub.players.entries()) {
    if (p.lastSeen < cutoff) {
      globalHub.players.delete(id);
      broadcast({ type: 'player_left', id });
      continue;
    }
    if (id !== excludeStr) {
      list.push({
        id: p.id,
        name: p.name,
        email: p.email,
        characterId: p.characterId,
        x: p.x,
        y: p.y,
        dir: p.dir,
        walking: p.walking,
        timestamp: p.lastSeen,
      });
    }
  }
  return list;
}

/**
 * Update player position/state in real-time
 */
export async function updatePlayerPresence(userId, data = {}) {
  await ensureHydrated();
  const userIdStr = userId.toString();
  const now = Date.now();
  const userInfo = await getUserInfo(userId);

  const isNew = !globalHub.players.has(userIdStr);
  const existing = globalHub.players.get(userIdStr) || {};

  const playerObj = {
    id: userIdStr,
    name: userInfo.name,
    email: userInfo.email,
    characterId: data.characterId || existing.characterId || 'celine',
    x: Math.round(Number(data.x) ?? existing.x ?? 1324),
    y: Math.round(Number(data.y) ?? existing.y ?? 2133),
    dir: Number(data.dir) ?? existing.dir ?? 0,
    walking: Boolean(data.walking),
    lastSeen: now,
    lastDbSync: existing.lastDbSync || 0,
  };

  globalHub.players.set(userIdStr, playerObj);

  // Broadcast instantly to all other connected SSE clients
  broadcast({
    type: isNew ? 'player_joined' : 'player_moved',
    player: {
      id: playerObj.id,
      name: playerObj.name,
      email: playerObj.email,
      characterId: playerObj.characterId,
      x: playerObj.x,
      y: playerObj.y,
      dir: playerObj.dir,
      walking: playerObj.walking,
      timestamp: now,
    },
  }, userIdStr);

  // Throttled asynchronous database write (at most once every 5 seconds)
  if (now - playerObj.lastDbSync > 5000 || isNew) {
    playerObj.lastDbSync = now;
    connectDB()
      .then(() =>
        Presence.findOneAndUpdate(
          { userId },
          {
            userId,
            email: playerObj.email,
            name: playerObj.name,
            characterId: playerObj.characterId,
            x: playerObj.x,
            y: playerObj.y,
            dir: playerObj.dir,
            walking: playerObj.walking,
            lastSeen: new Date(now),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
      .catch((err) => console.error('[WorldPresenceHub] DB sync error:', err));
  }

  return playerObj;
}

/**
 * Remove player on explicit disconnect/leave
 */
export async function removePlayerPresence(userId) {
  const userIdStr = userId.toString();
  if (globalHub.players.has(userIdStr)) {
    globalHub.players.delete(userIdStr);
    broadcast({ type: 'player_left', id: userIdStr }, userIdStr);
    try {
      await connectDB();
      await Presence.deleteOne({ userId });
    } catch (err) {
      console.error('[WorldPresenceHub] Remove player DB error:', err);
    }
  }
}

/**
 * Register a client's SSE response stream
 */
export function registerSubscriber(userId, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send immediate flush of headers
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  res.userId = userId ? userId.toString() : null;
  globalHub.subscribers.add(res);

  // Send initial list of all current active players
  getActivePlayers(userId).then((players) => {
    try {
      if (res.writable && !res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'sync', players })}\n\n`);
      }
    } catch {
      globalHub.subscribers.delete(res);
    }
  });

  // Keep-alive heartbeat comment ping every 15 seconds
  const pingInterval = setInterval(() => {
    try {
      if (res.writable && !res.writableEnded) {
        res.write(': ping\n\n');
      } else {
        clearInterval(pingInterval);
        globalHub.subscribers.delete(res);
      }
    } catch {
      clearInterval(pingInterval);
      globalHub.subscribers.delete(res);
    }
  }, 15000);

  res.on('close', () => {
    clearInterval(pingInterval);
    globalHub.subscribers.delete(res);
  });
}
