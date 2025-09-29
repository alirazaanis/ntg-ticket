'use client';

import { useRTL } from '../../hooks/useRTL';
import { ReactNode } from 'react';

interface RTLProviderProps {
  children: ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  // This hook will automatically handle RTL direction updates
  useRTL();

  return <>{children}</>;
}
