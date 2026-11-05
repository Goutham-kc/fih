/**
 * ONE-TIME seed endpoint to create the single app user.
 * Call POST /api/seed with { email, password, whatsappNumber } + SEED_SECRET header.
 * Remove or disable this file after first use.
 */
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-seed-secret'] !== process.env.SEED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, password, whatsappNumber } = req.body || {};
  if (!email || !password || !whatsappNumber)
    return res.status(400).json({ error: 'email, password, whatsappNumber required' });

  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'User already exists' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: email.toLowerCase(), passwordHash, whatsappNumber });
  return res.status(201).json({ ok: true, userId: user._id });
}
