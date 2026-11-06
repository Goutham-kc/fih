import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ThemeToggle } from '@/lib/theme';
import AuroraBackground from '@/components/AuroraBackground';

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
        <title>Sign In — fih</title>
        <meta name="description" content="Sign in to your fih personal operating system" />
      </Head>

      <div
        style={{
          minHeight: '100vh',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-dark)',
          padding: '24px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AuroraBackground />

        {/* Top-right theme toggle */}
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 20 }}>
          <ThemeToggle size={18} />
        </div>

        {/* Ambient Radial Glow */}
        <div className="ambient-glow" style={{ top: '15%', left: '25%' }} />

        <div
          className="fih-card animate-fade"
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '40px 32px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Brand Identity */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 48,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              fih
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
              Precision Personal Operating System
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                  letterSpacing: '0.04em',
                }}
              >
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                className="fih-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                  letterSpacing: '0.04em',
                }}
              >
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                className="fih-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--badge-high-bg)',
                  border: '1px solid var(--badge-high-border)',
                  color: 'var(--badge-high-color)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: 13,
                  marginBottom: 18,
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', height: 44, fontSize: 14, borderRadius: 10 }}
            >
              {loading ? (
                <>
                  <span className="spin-loading" style={{ marginRight: 8, fontSize: 16 }}>⟳</span>
                  Authenticating...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
