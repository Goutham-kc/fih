import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ThemeToggle } from '@/lib/theme';
import AuroraBackground from '@/components/AuroraBackground';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const cleanPhone = whatsappNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setError('Please enter a valid phone number with country code (e.g. 919876543210)');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, whatsappNumber: cleanPhone }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error?.message || 'Registration failed');
        } else {
          router.push('/');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Sign In
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
  }

  function toggleMode(newMode) {
    setMode(newMode);
    setError('');
  }

  return (
    <>
      <Head>
        <title>{mode === 'register' ? 'Create Account' : 'Sign In'} — fih</title>
        <meta name="description" content="Sign in or register for your fih personal operating system" />
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
            maxWidth: '420px',
            padding: '36px 30px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Brand Identity */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 44,
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

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-sunken)',
              padding: 4,
              borderRadius: 10,
              marginBottom: 24,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => toggleMode('signin')}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: mode === 'signin' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => toggleMode('register')}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: mode === 'register' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
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

            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label
                  htmlFor="whatsapp"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                    letterSpacing: '0.04em',
                  }}
                >
                  WHATSAPP PHONE NUMBER
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  className="fih-input"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 919876543210 (with country code)"
                  required
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Include country code without + (e.g. India 91…, US 1…)
                </span>
              </div>
            )}

            <div style={{ marginBottom: mode === 'register' ? 16 : 22 }}>
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

            {mode === 'register' && (
              <div style={{ marginBottom: 22 }}>
                <label
                  htmlFor="confirmPassword"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                    letterSpacing: '0.04em',
                  }}
                >
                  CONFIRM PASSWORD
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="fih-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

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
                  {mode === 'register' ? 'Creating Account...' : 'Authenticating...'}
                </>
              ) : mode === 'register' ? (
                'Create Account →'
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          {mode === 'register' && (
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.4 }}>
              💡 Once registered, any WhatsApp message you send to the bot from this phone number will sync automatically to your private dashboard.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
