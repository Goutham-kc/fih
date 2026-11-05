import '@/styles/globals.css';
import Head from 'next/head';
import { ThemeProvider } from '@/lib/theme';
import { Toaster } from 'sonner';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="alternate icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f8f9fc" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0d0e12" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <Component {...pageProps} />
      <Toaster richColors position="top-right" theme="system" closeButton />
    </ThemeProvider>
  );
}
