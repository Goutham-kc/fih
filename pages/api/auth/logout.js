import { serialize } from 'cookie';

export default function handler(req, res) {
  res.setHeader(
    'Set-Cookie',
    serialize('token', '', { httpOnly: true, maxAge: 0, path: '/' })
  );
  return res.status(200).json({ ok: true });
}
