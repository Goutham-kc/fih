import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Login failed');
      } else {
        router.push('/');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Login — fih</title>
        <meta name="description" content="Sign in to your fih dashboard" />
      </Head>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        padding: '24px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'slideUp 0.4s ease forwards',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6c63ff, #3ecfcf)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-2px',
              lineHeight: 1,
              marginBottom: '8px',
            }}>fih</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Your life, organized.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="email">✉️ Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="password">🔒 Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,77,109,0.1)',
                border: '1px solid rgba(255,77,109,0.3)',
                color: '#ff4d6d',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
              }}>{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', height: '44px', fontSize: '15px' }}
            >
              {loading ? '⏳ Signing in...' : '→ Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '24px', marginBottom: 0 }}>
            Single-user app · <a href="https://github.com" style={{ color: 'var(--accent1)' }}>GitHub</a>
          </p>
        </div>
      </div>
    </>
  );
}
