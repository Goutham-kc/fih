import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(userId) {
  return jwt.sign({ userId: userId.toString() }, JWT_SECRET, { expiresIn: '30d' });
}

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const cookies = parse(req.headers.cookie || '');
      const token = cookies.token;
      if (!token) throw new Error('No token');
      const { userId } = jwt.verify(token, JWT_SECRET);
      req.userId = userId;
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
    }
  };
}
