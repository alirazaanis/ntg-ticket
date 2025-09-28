'use client';

import { useLocale } from 'next-intl';
import { Button, Menu, Group, Text, useMantineTheme } from '@mantine/core';
import { IconChevronDown, IconWorld } from '@tabler/icons-react';
import { useState } from 'react';

const languages: Array<{ code: string; name: string; flag: string }> = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();

  const currentLanguage =
    languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    // Set cookie and reload page
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year
    window.location.reload();
    setOpened(false);
  };

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Menu
        opened={opened}
        onOpen={() => setOpened(true)}
        onClose={() => setOpened(false)}
        radius='md'
        width='target'
        withinPortal
        shadow='md'
      >
        <Menu.Target>
          <Button
            variant='outline'
            color='blue'
            leftSection={<IconWorld size={16} />}
            rightSection={<IconChevronDown size={16} />}
            style={{
              minWidth: 120,
            }}
          >
            <Group gap='xs'>
              <Text size='sm'>{currentLanguage.flag}</Text>
              <Text size='sm'>{currentLanguage.name}</Text>
            </Group>
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Language</Menu.Label>
          {languages.map(language => (
            <Menu.Item
              key={language.code}
              leftSection={<Text size='lg'>{language.flag}</Text>}
              onClick={() => handleLanguageChange(language.code)}
              style={{
                backgroundColor:
                  locale === language.code
                    ? theme.colors.blue[1]
                    : 'transparent',
                color:
                  locale === language.code ? theme.colors.blue[6] : 'inherit',
                fontWeight: locale === language.code ? 600 : 400,
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
                  e.currentTarget.style.backgroundColor = theme.colors.blue[2];
                  e.currentTarget.style.color = theme.colors.blue[8];
                } else {
                  e.currentTarget.style.backgroundColor = '#f8f9ff';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor =
                  locale === language.code
                    ? theme.colors.blue[1]
                    : 'transparent';
                e.currentTarget.style.color =
                  locale === language.code ? theme.colors.blue[6] : 'inherit';
              }}
            >
              <Group justify='space-between'>
                <Text size='sm'>{language.name}</Text>
                {locale === language.code && (
                  <Text size='xs' c='blue'>
                    ✓
                  </Text>
                )}
              </Group>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
