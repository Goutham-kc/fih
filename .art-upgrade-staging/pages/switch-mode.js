import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ThemeToggle } from '@/lib/theme';

export default function SwitchMode() {
  const router = useRouter();
  const { token, mode } = router.query;
  
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Validate URL parameters
  useEffect(() => {
    if (router.isReady) {
      if (!token || !mode) {
        setStatus('error');
        setErrorMessage('Invalid link. Missing token or mode.');
      } else if (!['live', 'development'].includes(mode)) {
        setStatus('error');
        setErrorMessage('Invalid mode requested.');
      }
    }
  }, [router.isReady, token, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, mode, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to switch mode.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  if (!router.isReady) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-canvas)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      position: 'relative'
    }}>
      <Head>
        <title>Switch Mode - FIH</title>
      </Head>

      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 20 }}>
        <ThemeToggle size={18} />
      </div>

      <div className="card" style={{
        width: '100%',
        maxWidth: 440,
        padding: 32,
        boxShadow: 'var(--shadow-modal)',
        borderRadius: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--bg-sunken)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}>
            🥀
          </div>
        </div>
        
        <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: 'var(--text-primary)' }}>
          Switch Environment
        </h1>
        
        {status === 'success' ? (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(74, 222, 128, 0.15)',
              color: 'var(--accent-emerald)',
              marginBottom: 16
            }}>
              <svg style={{ width: 32, height: 32 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Your account is now in <strong style={{ color: 'var(--text-primary)' }}>{mode?.toUpperCase()}</strong> mode. You can return to WhatsApp.
            </p>
            <Link href="/" className="btn btn-secondary" style={{ display: 'inline-block', padding: '8px 20px', fontSize: 13 }}>
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, fontSize: 13 }}>
              Enter your password to switch to <strong style={{ color: 'var(--text-primary)' }}>{mode?.toUpperCase()}</strong> mode.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Account Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input"
                  placeholder="Enter your password"
                  autoFocus
                />
              </div>

              {status === 'error' && errorMessage && (
                <div style={{
                  padding: 12,
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: 'var(--accent-rose)',
                  textAlign: 'center',
                  fontWeight: 600
                }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || (status === 'error' && !password)}
                className="btn btn-primary"
                style={{ height: 44, width: '100%', fontSize: 14 }}
              >
                {status === 'loading' ? 'Switching...' : 'Confirm Switch'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
