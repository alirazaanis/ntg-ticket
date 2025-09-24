'use client';

import {
  AppShell,
  Group,
  Text,
  Button,
  Menu,
  Avatar,
  Badge,
  ActionIcon,
  Burger,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBell,
  IconLogout,
  IconSettings,
  IconUser,
  IconChevronDown,
} from '@tabler/icons-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotificationsStore } from '../../stores/useNotificationsStore';
import { useSiteBranding } from '../../hooks/useSiteBranding';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { authApi } from '../../lib/apiClient';

export function AppHeader() {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const { siteName } = useSiteBranding();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint using the project's API pattern
      await authApi.logout();
    } catch (error) {}

    // Clear local auth store
    logout();

    // Use NextAuth's signOut with proper configuration
    await signOut({
      callbackUrl: '/',
      redirect: true,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'SUPPORT_MANAGER':
        return 'orange';
      case 'SUPPORT_STAFF':
        return 'blue';
      case 'END_USER':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'SUPPORT_MANAGER':
        return 'Support Manager';
      case 'SUPPORT_STAFF':
        return 'Support Staff';
      case 'END_USER':
        return 'End User';
      default:
        return 'User';
    }
  };

  return (
    <AppShell.Header>
      <Group h='100%' px='md' justify='space-between'>
        <Group>
          <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
          <Text fw={700} size='lg' c='blue'>
            {siteName}
          </Text>
        </Group>

        <Group>
          <ThemeToggle />

          <Menu shadow='md' width={200}>
            <Menu.Target>
              <ActionIcon
                variant='subtle'
                color='gray'
                size='lg'
                pos='relative'
              >
                <IconBell size={20} />
                {unreadCount > 0 && (
                  <Badge
                    size='xs'
                    color='red'
                    pos='absolute'
                    top={-2}
                    right={-2}
                    style={{ minWidth: 18, height: 18 }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Notifications</Menu.Label>
              <Menu.Item
                leftSection={<IconBell size={14} />}
                onClick={() => router.push('/notifications')}
              >
                View all notifications
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Menu shadow='md' width={250}>
            <Menu.Target>
              <Button
                variant='subtle'
                leftSection={<Avatar size='sm' src={user?.avatar} />}
              >
                <Group gap='xs'>
                  <div>
                    <Text size='sm' fw={500}>
                      {user?.name}
                    </Text>
                    <Badge
                      size='xs'
                      color={getRoleBadgeColor(user?.role || 'END_USER')}
                    >
                      {getRoleLabel(user?.role || 'END_USER')}
                    </Badge>
                  </div>
                  <IconChevronDown size={14} />
                </Group>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={14} />}
                onClick={() => router.push('/profile')}
              >
                Profile
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => router.push('/settings')}
              >
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
                color='red'
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
