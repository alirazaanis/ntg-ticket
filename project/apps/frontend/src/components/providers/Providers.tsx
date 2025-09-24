'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../../lib/theme';
import { AuthProvider } from './AuthProvider';
import { WebSocketProvider } from './WebSocketProvider';
import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { SkipLink } from '../accessibility/SkipLink';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { GlobalErrorHandler } from '../error/GlobalErrorHandler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, use light theme as default
  if (!mounted) {
    return (
      <MantineProvider theme={theme} defaultColorScheme='light'>
        {children}
      </MantineProvider>
    );
  }

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme={resolvedTheme}
      forceColorScheme={resolvedTheme}
    >
      {children}
    </MantineProvider>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            <SkipLink targetId='main-content'>Skip to main content</SkipLink>
            <GlobalErrorHandler />
            <main id='main-content' role='main'>
              <Notifications position='top-right' />
              <AuthProvider>
                <WebSocketProvider>{children}</WebSocketProvider>
              </AuthProvider>
            </main>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
