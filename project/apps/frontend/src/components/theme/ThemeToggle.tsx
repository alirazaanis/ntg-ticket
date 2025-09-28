'use client';

import { ActionIcon, Menu, Group, Text, useMantineTheme } from '@mantine/core';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mantineTheme = useMantineTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <IconSun size={16} />;
      case 'dark':
        return <IconMoon size={16} />;
      case 'auto':
        return <IconDeviceDesktop size={16} />;
      default:
        return <IconSun size={16} />;
    }
  };

  return (
    <Menu shadow='md' width={200}>
      <Menu.Target>
        <ActionIcon
          variant='subtle'
          color='blue'
          size='lg'
          aria-label='Toggle theme'
        >
          {getIcon()}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Theme</Menu.Label>
        <Menu.Item
          leftSection={<IconSun size={14} />}
          onClick={() => setTheme('light')}
          style={{
            backgroundColor:
              theme === 'light' ? mantineTheme.colors.blue[1] : 'transparent',
            color: theme === 'light' ? mantineTheme.colors.blue[6] : 'inherit',
            fontWeight: theme === 'light' ? 600 : 400,
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
                mantineTheme.colors.blue[2];
              e.currentTarget.style.color = mantineTheme.colors.blue[8];
            } else {
              e.currentTarget.style.backgroundColor = '#f8f9ff';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor =
              theme === 'light' ? mantineTheme.colors.blue[1] : 'transparent';
            e.currentTarget.style.color =
              theme === 'light' ? mantineTheme.colors.blue[6] : 'inherit';
          }}
        >
          <Group justify='space-between'>
            <Text size='sm'>Light</Text>
            {theme === 'light' && (
              <Text size='xs' c='blue'>
                ✓
              </Text>
            )}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<IconMoon size={14} />}
          onClick={() => setTheme('dark')}
          style={{
            backgroundColor:
              theme === 'dark' ? mantineTheme.colors.blue[1] : 'transparent',
            color: theme === 'dark' ? mantineTheme.colors.blue[6] : 'inherit',
            fontWeight: theme === 'dark' ? 600 : 400,
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
                mantineTheme.colors.blue[2];
              e.currentTarget.style.color = mantineTheme.colors.blue[8];
            } else {
              e.currentTarget.style.backgroundColor = '#f8f9ff';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor =
              theme === 'dark' ? mantineTheme.colors.blue[1] : 'transparent';
            e.currentTarget.style.color =
              theme === 'dark' ? mantineTheme.colors.blue[6] : 'inherit';
          }}
        >
          <Group justify='space-between'>
            <Text size='sm'>Dark</Text>
            {theme === 'dark' && (
              <Text size='xs' c='blue'>
                ✓
              </Text>
            )}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<IconDeviceDesktop size={14} />}
          onClick={() => setTheme('auto')}
          style={{
            backgroundColor:
              theme === 'auto' ? mantineTheme.colors.blue[1] : 'transparent',
            color: theme === 'auto' ? mantineTheme.colors.blue[6] : 'inherit',
            fontWeight: theme === 'auto' ? 600 : 400,
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
                mantineTheme.colors.blue[2];
              e.currentTarget.style.color = mantineTheme.colors.blue[8];
            } else {
              e.currentTarget.style.backgroundColor = '#f8f9ff';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor =
              theme === 'auto' ? mantineTheme.colors.blue[1] : 'transparent';
            e.currentTarget.style.color =
              theme === 'auto' ? mantineTheme.colors.blue[6] : 'inherit';
          }}
        >
          <Group justify='space-between'>
            <Text size='sm'>Auto</Text>
            {theme === 'auto' && (
              <Text size='xs' c='blue'>
                ✓
              </Text>
            )}
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
