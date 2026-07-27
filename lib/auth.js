import jwt from 'jsonwebtoken';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'fih_jwt_8d94e2a1b7c3f509e821d467a391c0b5e482f163a92d8e75';
}

export function parseCookies(cookieHeader = '') {
  const list = {};
  cookieHeader.split(';').forEach((cookie) => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    try {
      list[name] = decodeURIComponent(value);
    } catch {
      list[name] = value;
    }
  });
  return list;
}

export function serializeCookie(name, val, options = {}) {
  const enc = encodeURIComponent(val);
  let cookie = `${name}=${enc}`;
  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.httpOnly) cookie += `; HttpOnly`;
  if (options.secure) cookie += `; Secure`;
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  return cookie;
}

export function signToken(userId) {
  return jwt.sign({ userId: userId.toString() }, getJwtSecret(), { expiresIn: '30d' });
}

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const cookies = parseCookies(req.headers.cookie || '');
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
