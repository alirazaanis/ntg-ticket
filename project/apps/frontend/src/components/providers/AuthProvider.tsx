'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '../../stores/useAuthStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else if (status === 'authenticated' && session?.user) {
      try {
        // Validate required fields
        if (
          !session.user.id ||
          !session.user.email ||
          !session.user.name ||
          !session.user.role
        ) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          isActive: true,
          avatar: session.user.image || undefined,
        });
        setLoading(false);
      } catch (error) {
        setUser(null);
        setLoading(false);
      }
    } else if (status === 'unauthenticated') {
      setUser(null);
      setLoading(false);
    }
  }, [session, status, setUser, setLoading]);

  return <>{children}</>;
}
