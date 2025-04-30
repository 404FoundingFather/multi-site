import React from 'react';
import type { AppProps } from 'next/app';
import { SiteProvider } from '../contexts/SiteContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import '../styles/globals.css';
import '../styles/navigation.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SiteProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </SiteProvider>
  );
}

export default MyApp;