'use client';

import { useAuthStore } from '../../stores/useAuthStore';
import { EndUserDashboard } from './EndUserDashboard';
import { SupportStaffDashboard } from './SupportStaffDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { AdminDashboard } from './AdminDashboard';

export function DashboardContent() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'END_USER':
      return <EndUserDashboard />;
    case 'SUPPORT_STAFF':
      return <SupportStaffDashboard />;
    case 'SUPPORT_MANAGER':
      return <ManagerDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <EndUserDashboard />;
  }
}
