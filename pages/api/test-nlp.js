import { parseNaturalLanguage } from '@/lib/naturalParser';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  // Guard: allow in development or with admin secret
  const isDev = process.env.NODE_ENV !== 'production';
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  const isAuthorized = isDev || (process.env.ADMIN_SECRET && secret === process.env.ADMIN_SECRET);

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const q = req.query.q || '';
    const parsed = parseNaturalLanguage(q);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
