import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: { message: 'Email and password required', code: 'MISSING_FIELDS' } });

  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } });

    const token = signToken(user._id);
    res.setHeader(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: { message: err.message || 'Server error', code: 'SERVER_ERROR' } });
  }
}
