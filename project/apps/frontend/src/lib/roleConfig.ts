import { UserRole } from '../types/unified';

export const roleConfig = {
  [UserRole.END_USER]: {
    color: 'blue',
    label: 'End User',
    icon: 'IconUser',
  },
  [UserRole.SUPPORT_STAFF]: {
    color: 'green',
    label: 'Support Staff',
    icon: 'IconUsers',
  },
  [UserRole.SUPPORT_MANAGER]: {
    color: 'orange',
    label: 'Support Manager',
    icon: 'IconShield',
  },
  [UserRole.ADMIN]: {
    color: 'red',
    label: 'Administrator',
    icon: 'IconSettings',
  },
} as const;

export const getRoleColor = (role: UserRole): string => {
  return roleConfig[role]?.color || 'gray';
};

export const getRoleLabel = (role: UserRole): string => {
  return roleConfig[role]?.label || 'Unknown';
};
