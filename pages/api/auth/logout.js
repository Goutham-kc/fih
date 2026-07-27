import { serializeCookie } from '@/lib/auth';

export default function handler(req, res) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie('token', '', { httpOnly: true, maxAge: 0, path: '/' })
  );
  return res.status(200).json({ ok: true });
}
