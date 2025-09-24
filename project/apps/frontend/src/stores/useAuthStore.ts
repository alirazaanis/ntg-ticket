import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'END_USER' | 'SUPPORT_STAFF' | 'SUPPORT_MANAGER' | 'ADMIN';
  isActive: boolean;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: user => set({ user, isAuthenticated: !!user }),
      setLoading: isLoading => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
      hasRole: (role: string): boolean => {
        const state = get();
        return state.user?.role === role;
      },
      hasAnyRole: (roles: string[]): boolean => {
        const state = get();
        return state.user ? roles.includes(state.user.role) : false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
