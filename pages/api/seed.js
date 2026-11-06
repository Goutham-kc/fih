/**
 * Secure seed endpoint to provision user accounts.
 * Accounts can ONLY be created via this endpoint authorized by SEED_SECRET.
 * Call POST /api/seed with { email, username?, password, whatsappNumber } + 'x-seed-secret' header.
 */
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  if (!process.env.SEED_SECRET || req.headers['x-seed-secret'] !== process.env.SEED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-seed-secret header' });
  }

  const { email, username, password, whatsappNumber } = req.body || {};
  if (!email || !password || !whatsappNumber) {
    return res.status(400).json({ error: 'email, password, and whatsappNumber are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = String(whatsappNumber).replace(/\D/g, '').trim();
  let cleanUsername = username ? String(username).toLowerCase().trim() : null;

  if (cleanUsername) {
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({ error: 'Username must be 3-30 characters (letters, numbers, _, -, .)' });
    }
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'WhatsApp number must be at least 10 digits with country code' });
  }

  try {
    await connectDB();

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    if (cleanUsername) {
      const existingUser = await User.findOne({ username: cleanUsername });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this username already exists' });
      }
    }

    const last10 = cleanPhone.slice(-10);
    const existingPhone = await User.findOne({
      $or: [
        { whatsappNumber: cleanPhone },
        { whatsappNumber: new RegExp(last10 + '$') },
      ],
    });
    if (existingPhone) {
      return res.status(409).json({ error: 'WhatsApp number already registered to another user' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: cleanEmail,
      username: cleanUsername || undefined,
      passwordHash,
      whatsappNumber: cleanPhone,
      environmentMode: 'live',
      theme: 'dark',
    });

    return res.status(201).json({
      ok: true,
      userId: user._id,
      email: user.email,
      username: user.username,
      whatsappNumber: user.whatsappNumber,
    });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ error: err.message || 'Server error while seeding user' });
  }
}
