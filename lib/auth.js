import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing in Vercel settings.');
  }
  return secret;
}

export function signToken(userId) {
  return jwt.sign({ userId: userId.toString() }, getJwtSecret(), { expiresIn: '30d' });
}

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const cookies = parse(req.headers.cookie || '');
      const token = cookies.token;
      if (!token) throw new Error('No token');
      const { userId } = jwt.verify(token, getJwtSecret());
      req.userId = userId;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ error: { message: err.message || 'Unauthorized', code: 'UNAUTHORIZED' } });
    }
  };
}
