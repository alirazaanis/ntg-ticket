'use client';

import { ActionIcon, Menu, Group, Text } from '@mantine/core';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

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
        <ActionIcon variant='subtle' size='lg' aria-label='Toggle theme'>
          {getIcon()}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Theme</Menu.Label>
        <Menu.Item
          leftSection={<IconSun size={16} />}
          onClick={() => setTheme('light')}
          style={{
            backgroundColor:
              theme === 'light' ? 'var(--mantine-color-blue-1)' : 'transparent',
          }}
        >
          <Group justify='space-between'>
            <Text>Light</Text>
            {theme === 'light' && (
              <Text size='xs' c='blue'>
                ✓
              </Text>
            )}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<IconMoon size={16} />}
          onClick={() => setTheme('dark')}
          style={{
            backgroundColor:
              theme === 'dark' ? 'var(--mantine-color-blue-1)' : 'transparent',
          }}
        >
          <Group justify='space-between'>
            <Text>Dark</Text>
            {theme === 'dark' && (
              <Text size='xs' c='blue'>
                ✓
              </Text>
            )}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<IconDeviceDesktop size={16} />}
          onClick={() => setTheme('auto')}
          style={{
            backgroundColor:
              theme === 'auto' ? 'var(--mantine-color-blue-1)' : 'transparent',
          }}
        >
          <Group justify='space-between'>
            <Text>Auto</Text>
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
