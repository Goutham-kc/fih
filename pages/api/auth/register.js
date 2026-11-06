import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { signToken, serializeCookie } from '@/lib/auth';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, whatsappNumber } = req.body || {};

  if (!email || !password || !whatsappNumber) {
    return res.status(400).json({
      error: { message: 'Email, password, and WhatsApp number are required', code: 'MISSING_FIELDS' },
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = String(whatsappNumber).replace(/\D/g, '').trim();

  if (password.length < 6) {
    return res.status(400).json({
      error: { message: 'Password must be at least 6 characters', code: 'PASSWORD_TOO_SHORT' },
    });
  }

  if (cleanPhone.length < 10) {
    return res.status(400).json({
      error: { message: 'Please enter a valid phone number with country code (at least 10 digits)', code: 'INVALID_PHONE' },
    });
  }

  try {
    await connectDB();

    // Check if email already in use
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({
        error: { message: 'An account with this email already exists', code: 'EMAIL_IN_USE' },
      });
    }

    // Check if whatsappNumber already in use (by exact or last 10 digits)
    const last10 = cleanPhone.slice(-10);
    const existingPhone = await User.findOne({
      $or: [
        { whatsappNumber: cleanPhone },
        { whatsappNumber: new RegExp(last10 + '$') },
      ],
    });
    if (existingPhone) {
      return res.status(409).json({
        error: { message: 'This WhatsApp phone number is already registered to another account', code: 'PHONE_IN_USE' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: cleanEmail,
      passwordHash,
      whatsappNumber: cleanPhone,
      environmentMode: 'live',
      theme: 'dark',
    });

    await logAudit(user._id, {
      action: 'SYSTEM',
      module: 'auth',
      description: `New user account created: ${cleanEmail}`,
      environmentMode: 'live',
    });

    const token = signToken(user._id);
    res.setHeader(
      'Set-Cookie',
      serializeCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    );

    return res.status(201).json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        whatsappNumber: user.whatsappNumber,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      error: { message: err.message || 'Server error', code: 'SERVER_ERROR' },
    });
  }
}
