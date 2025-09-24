'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell, LoadingOverlay } from '@mantine/core';
import { useAuthStore } from '../../stores/useAuthStore';
import { AppHeader } from './AppHeader';
import { AppNavbar } from './AppNavbar';
import { DynamicMetadata } from './DynamicMetadata';
import { useEffect } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading' || isLoading) {
    return <LoadingOverlay visible />;
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  // Wait for user to be loaded from session
  if (!user) {
    return <LoadingOverlay visible />;
  }

  return (
    <>
      <DynamicMetadata />
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 280, breakpoint: 'sm' }}
        padding='md'
      >
        <AppHeader />
        <AppNavbar />
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
}
