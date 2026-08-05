import '@/styles/globals.css';
import Head from 'next/head';
import { ThemeProvider } from '@/lib/theme';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="alternate icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#121319" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

