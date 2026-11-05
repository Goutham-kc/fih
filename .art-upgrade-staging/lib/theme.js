import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on client mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('fih_theme') || 'dark';
    setThemeState(saved);

    // Optional background sync with user profile if authenticated
    fetch('/api/user/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.theme && data.theme !== saved) {
          // If server has a saved theme, apply it
          setThemeState(data.theme);
        }
      })
      .catch(() => {});
  }, []);

  // Compute resolved theme & apply data-theme attribute
  useEffect(() => {
    if (!mounted) return;

    function computeTheme() {
      let active = theme;
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        active = prefersDark ? 'dark' : 'light';
      }
      setResolvedTheme(active);
      document.documentElement.setAttribute('data-theme', active);

      // Update mobile browser chrome / status bar color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', active === 'light' ? '#f4f5f9' : '#121319');
      }
    }

    computeTheme();
    localStorage.setItem('fih_theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => computeTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('fih_theme', newTheme);
    // Background sync to DB
    fetch('/api/user/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const currentResolved = prev === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : prev;
      const nextTheme = currentResolved === 'dark' ? 'light' : 'dark';
      localStorage.setItem('fih_theme', nextTheme);
      // Background sync to DB
      fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: nextTheme }),
      }).catch(() => {});
      return nextTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle({ size = 18, className = '', style = {} }) {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  // If not mounted yet, render skeleton placeholder to prevent layout shift
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`theme-toggle-btn ${className}`}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-hover)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 0,
          ...style,
        }}
      >
        <span style={{ width: size, height: size }} />
      </button>
    );
  }

  const isLight = resolvedTheme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      className={`theme-toggle-btn ${className}`}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-hover)',
        color: isLight ? '#f59e0b' : '#c0c1ff',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: 0,
        flexShrink: 0,
        ...style,
      }}
    >
      {isLight ? (
        // Sun Icon
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'transform 0.3s ease' }}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Moon Icon
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'transform 0.3s ease' }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
