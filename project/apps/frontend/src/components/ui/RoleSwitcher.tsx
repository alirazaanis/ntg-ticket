'use client';

import { useState } from 'react';
import { Button, Menu, Badge, Group, Text, ActionIcon } from '@mantine/core';
import { IconChevronDown, IconRefresh } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { UserRole } from '../../types/unified';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../stores/useAuthStore';
import { notifications } from '@mantine/notifications';

interface RoleSwitcherProps {
  userRoles: UserRole[];
  activeRole: UserRole;
  isMobile?: boolean;
}

export function RoleSwitcher({
  userRoles,
  activeRole,
  isMobile = false,
}: RoleSwitcherProps) {
  const t = useTranslations('auth');
  const { updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'red';
      case UserRole.SUPPORT_MANAGER:
        return 'orange';
      case UserRole.SUPPORT_STAFF:
        return 'cyan';
      case UserRole.END_USER:
        return 'green';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return t('roles.admin');
      case UserRole.SUPPORT_MANAGER:
        return t('roles.support_manager');
      case UserRole.SUPPORT_STAFF:
        return t('roles.support_staff');
      case UserRole.END_USER:
        return t('roles.end_user');
      default:
        return role;
    }
  };

  const handleRoleSwitch = async (newRole: UserRole) => {
    if (newRole === activeRole) return;

    setLoading(true);
    try {
      const result = await authApi.switchRole({ activeRole: newRole });

      // Update the user in the auth store with new tokens
      updateUser({
        ...result.data,
        activeRole: newRole,
      });

      notifications.show({
        title: t('roleSwitched'),
        message: t('roleSwitchedMessage', { role: getRoleLabel(newRole) }),
        color: 'green',
      });

      // Reload the page to refresh all role-based data
      window.location.reload();
    } catch (error) {
      notifications.show({
        title: t('roleSwitchFailed'),
        message: t('roleSwitchFailedMessage'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show switcher if user has only one role
  if (userRoles.length <= 1) {
    return (
      <Badge size='xs' color={getRoleBadgeColor(activeRole)}>
        {getRoleLabel(activeRole)}
      </Badge>
    );
  }

  if (isMobile) {
    return (
      <Menu shadow='md' width={200}>
        <Menu.Target>
          <ActionIcon variant='subtle' color='red' size='sm' loading={loading}>
            <IconRefresh size={14} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{t('switchRole')}</Menu.Label>
          {userRoles.map(role => (
            <Menu.Item
              key={role}
              onClick={() => handleRoleSwitch(role)}
              disabled={loading}
              leftSection={
                <Badge
                  size='xs'
                  color={getRoleBadgeColor(role)}
                  variant={role === activeRole ? 'filled' : 'light'}
                >
                  {getRoleLabel(role)}
                </Badge>
              }
            >
              <Text size='sm'>
                {role === activeRole
                  ? `${getRoleLabel(role)} (Current)`
                  : getRoleLabel(role)}
              </Text>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <Menu shadow='md' width={250}>
      <Menu.Target>
        <Button
          variant='subtle'
          color='red'
          size='xs'
          rightSection={<IconChevronDown size={12} />}
          loading={loading}
        >
          <Group gap='xs'>
            <Badge size='xs' color={getRoleBadgeColor(activeRole)}>
              {getRoleLabel(activeRole)}
            </Badge>
            <Text size='xs' c='dimmed'>
              {userRoles.length > 1 ? `+${userRoles.length - 1}` : ''}
            </Text>
          </Group>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('switchRole')}</Menu.Label>
        {userRoles.map(role => (
          <Menu.Item
            key={role}
            onClick={() => handleRoleSwitch(role)}
            disabled={loading}
            leftSection={
              <Badge
                size='xs'
                color={getRoleBadgeColor(role)}
                variant={role === activeRole ? 'filled' : 'light'}
              >
                {getRoleLabel(role)}
              </Badge>
            }
          >
            <Text size='sm'>
              {role === activeRole
                ? `${getRoleLabel(role)} (Current)`
                : getRoleLabel(role)}
            </Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
