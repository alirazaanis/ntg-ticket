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
  Image,
  Stack,
  useMantineTheme,
} from '@mantine/core';
import {
  IconBell,
  IconLogout,
  IconSettings,
  IconUser,
  IconHelp,
} from '@tabler/icons-react';
import { RTLChevronDown } from '../ui/RTLIcon';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotificationsStore } from '../../stores/useNotificationsStore';
import { useSiteBranding } from '../../hooks/useSiteBranding';
import { useMarkNotificationAsRead } from '../../hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { LanguageSwitcher } from '../language/LanguageSwitcher';
import { authApi } from '../../lib/apiClient';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslations } from 'next-intl';

interface AppHeaderProps {
  onHelpClick?: () => void;
  mobileOpened: boolean;
  toggleMobile: () => void;
}

export function AppHeader({
  onHelpClick,
  mobileOpened,
  toggleMobile,
}: AppHeaderProps) {
  const t = useTranslations('common');
  const { user, logout } = useAuthStore();
  const { unreadCount, getRecentNotifications } = useNotificationsStore();
  const { siteName } = useSiteBranding();
  const router = useRouter();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const markAsReadMutation = useMarkNotificationAsRead();

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
        return 'cyan';
      case 'END_USER':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return t('administrator');
      case 'SUPPORT_MANAGER':
        return t('supportManager');
      case 'SUPPORT_STAFF':
        return t('supportStaff');
      case 'END_USER':
        return t('endUser');
      default:
        return t('user');
    }
  };

  return (
    <AppShell.Header>
      <Group h='100%' px='md' justify='space-between'>
        {/* Left side - Logo and Brand */}
        <Group>
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom='sm'
            size='sm'
          />
          <Group
            gap='xs'
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            {/* Logo */}
            <Image
              src='/logo.svg'
              alt='NTG Ticket Logo'
              w={32}
              h={32}
              style={{ objectFit: 'contain' }}
            />
            {!isMobile && (
              <Text fw={700} size='lg' c='red'>
                {siteName}
              </Text>
            )}
          </Group>
        </Group>

        {/* Right side - Actions */}
        <Group gap='xs'>
          {/* Notifications - Always visible (most important) */}
          <Menu shadow='md' width={400}>
            <Menu.Target>
              <ActionIcon variant='subtle' color='red' size='lg' pos='relative'>
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
              <Menu.Label>{t('notifications')}</Menu.Label>

              {/* Show recent notifications (up to 5) */}
              {getRecentNotifications(5).length > 0 ? (
                getRecentNotifications(5).map(notification => (
                  <Menu.Item
                    key={notification.id}
                    leftSection={<IconBell size={14} />}
                    onClick={() => {
                      // Mark as read if unread using API
                      if (!notification.isRead) {
                        markAsReadMutation.mutate(notification.id);
                      }
                      // Navigate to notification or related page
                      router.push('/notifications');
                    }}
                    style={{
                      transition: 'background-color 0.2s ease',
                      marginBottom: '4px',
                      backgroundColor: notification.isRead
                        ? 'transparent'
                        : theme.colors.red[0],
                    }}
                    onMouseEnter={e => {
                      // Use theme-aware hover: light for light mode, dark for dark mode
                      const isDarkMode =
                        document.documentElement.getAttribute(
                          'data-mantine-color-scheme'
                        ) === 'dark';
                      if (isDarkMode) {
                        e.currentTarget.style.backgroundColor =
                          'var(--mantine-color-red-2)';
                        e.currentTarget.style.color =
                          'var(--mantine-color-red-8)';
                      } else {
                        e.currentTarget.style.backgroundColor =
                          'var(--mantine-color-red-0)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor =
                        notification.isRead
                          ? 'transparent'
                          : theme.colors.red[0];
                      e.currentTarget.style.color = 'inherit';
                    }}
                  >
                    <Stack gap={4}>
                      <Group justify='space-between'>
                        <Text size='sm' fw={notification.isRead ? 400 : 600}>
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <Badge size='xs' color='red' variant='filled'>
                            New
                          </Badge>
                        )}
                      </Group>
                      <Text size='xs' c='dimmed' lineClamp={2}>
                        {notification.message}
                      </Text>
                      <Text size='xs' c='dimmed'>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Text>
                    </Stack>
                  </Menu.Item>
                ))
              ) : (
                <Menu.Item disabled>
                  <Text size='sm' c='dimmed'>
                    No notifications
                  </Text>
                </Menu.Item>
              )}

              {/* View all notifications */}
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconBell size={14} />}
                onClick={() => router.push('/notifications')}
                style={{
                  transition: 'background-color 0.2s ease',
                  marginBottom: '4px',
                }}
                onMouseEnter={e => {
                  // Use theme-aware hover: light for light mode, dark for dark mode
                  const isDarkMode =
                    document.documentElement.getAttribute(
                      'data-mantine-color-scheme'
                    ) === 'dark';
                  if (isDarkMode) {
                    e.currentTarget.style.backgroundColor =
                      'var(--mantine-color-red-2)';
                    e.currentTarget.style.color = 'var(--mantine-color-red-8)';
                  } else {
                    e.currentTarget.style.backgroundColor =
                      'var(--mantine-color-red-0)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'inherit';
                }}
              >
                <Group justify='space-between'>
                  <Text size='sm'>{t('viewAllNotifications')}</Text>
                  {unreadCount > 0 && (
                    <Badge size='xs' color='red' variant='filled'>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Group>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* User Profile - Always visible (personal) */}
          <Menu shadow='md' width={isMobile ? 200 : 250}>
            <Menu.Target>
              {isMobile ? (
                <ActionIcon variant='subtle' color='red' size='lg'>
                  <Avatar size='sm' src={user?.avatar} />
                </ActionIcon>
              ) : (
                <Button
                  variant='subtle'
                  color='red'
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
                    <RTLChevronDown size={14} />
                  </Group>
                </Button>
              )}
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{t('account')}</Menu.Label>
              {isMobile && (
                <Menu.Item>
                  <Text size='sm' fw={500}>
                    {user?.name}
                  </Text>
                  <Badge
                    size='xs'
                    color={getRoleBadgeColor(user?.role || 'END_USER')}
                  >
                    {getRoleLabel(user?.role || 'END_USER')}
                  </Badge>
                </Menu.Item>
              )}
              <Menu.Item
                leftSection={<IconUser size={14} />}
                onClick={() => router.push('/profile')}
                style={{
                  transition: 'background-color 0.2s ease',
                  marginBottom: '4px',
                }}
                onMouseEnter={e => {
                  // Use theme-aware hover: light for light mode, dark for dark mode
                  const isDarkMode =
                    document.documentElement.getAttribute(
                      'data-mantine-color-scheme'
                    ) === 'dark';
                  if (isDarkMode) {
                    e.currentTarget.style.backgroundColor =
                      'var(--mantine-color-red-2)';
                    e.currentTarget.style.color = 'var(--mantine-color-red-8)';
                  } else {
                    e.currentTarget.style.backgroundColor =
                      'var(--mantine-color-red-0)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'inherit';
                }}
              >
                <Text size='sm'>{t('profile')}</Text>
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => router.push('/settings')}
                style={{
                  transition: 'background-color 0.2s ease',
                  marginBottom: '4px',
                }}
                onMouseEnter={e => {
                  // Use theme-aware hover: light for light mode, dark for dark mode
                  const isDarkMode =
                    document.documentElement.getAttribute(
                      'data-mantine-color-scheme'
                    ) === 'dark';
                  if (isDarkMode) {
                    e.currentTarget.style.backgroundColor =
                      'var(--mantine-color-red-2)';
                    e.currentTarget.style.color = 'var(--mantine-color-red-8)';
                  } else {
                    e.currentTarget.style.backgroundColor =
                      'var(--mantine-color-red-0)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'inherit';
                }}
              >
                <Text size='sm'>{t('settings')}</Text>
              </Menu.Item>
              {isMobile && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconHelp size={14} />}
                    onClick={onHelpClick}
                    style={{
                      transition: 'background-color 0.2s ease',
                      marginBottom: '4px',
                    }}
                    onMouseEnter={e => {
                      // Use theme-aware hover: light for light mode, dark for dark mode
                      const isDarkMode =
                        document.documentElement.getAttribute(
                          'data-mantine-color-scheme'
                        ) === 'dark';
                      if (isDarkMode) {
                        e.currentTarget.style.backgroundColor =
                          'var(--mantine-color-red-2)';
                        e.currentTarget.style.color =
                          'var(--mantine-color-red-8)';
                      } else {
                        e.currentTarget.style.backgroundColor =
                          'var(--mantine-color-red-0)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'inherit';
                    }}
                  >
                    <Text size='sm'>{t('helpSupport')}</Text>
                  </Menu.Item>
                </>
              )}
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
                color='red'
                style={{
                  '&:hover': {
                    backgroundColor: 'var(--mantine-color-red-1)',
                  },
                }}
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Desktop-only elements - Preferences and Support */}
          {!isMobile && (
            <>
              {/* Help & Support */}
              <ActionIcon
                variant='subtle'
                color='red'
                size='lg'
                onClick={onHelpClick}
                title='Help & Support'
              >
                <IconHelp size={20} />
              </ActionIcon>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <ThemeToggle />
            </>
          )}
        </Group>
      </Group>
    </AppShell.Header>
  );
}
