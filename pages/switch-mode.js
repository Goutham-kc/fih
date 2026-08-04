import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <Head>
        <title>Switch Mode - FIH</title>
      </Head>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
              <span className="text-xl">🥀</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-white text-center mb-2">Switch Environment</h1>
          
          {status === 'success' ? (
            <div className="text-center mt-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-zinc-300 mb-6">
                Your account is now in <strong className="text-white">{mode.toUpperCase()}</strong> mode. You can return to WhatsApp.
              </p>
              <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <p className="text-zinc-400 text-center mb-8 text-sm">
                Enter your password to switch to <strong className="text-white">{mode?.toUpperCase()}</strong> mode.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Account Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    placeholder="Enter your password"
                    autoFocus
                  />
                </div>

                {status === 'error' && errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'error' && !password}
                  className="w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    'Confirm Switch'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
