'use client';

import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Box,
  Center,
  Flex,
} from '@mantine/core';
import { IconRocket } from '@tabler/icons-react';
import { RTLArrowRight } from '../ui/RTLIcon';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '../language/LanguageSwitcher';
import { ThemeToggle } from '../theme/ThemeToggle';

export function LandingPage() {
  const t = useTranslations('HomePage');

  return (
    <Box
      dir='auto'
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #1a0f0f 0%, #2e1a1a 50%, #3e1616 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(197, 39, 32, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(197, 39, 32, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      <Container size='xl' py='xl' style={{ position: 'relative', zIndex: 1 }}>
        {/* Language Switcher and Theme Toggle - Top Right */}
        <Flex justify='flex-end' mb='md' gap='md'>
          <LanguageSwitcher />
          <ThemeToggle />
        </Flex>

        <Stack gap='xl'>
          {/* Hero Section */}
          <Center py='xl' style={{ minHeight: '80vh' }}>
            <Stack align='center' gap='xl'>
              {/* Main Title */}
              <Title
                order={1}
                size='4rem'
                ta='center'
                fw={900}
                style={{
                  background:
                    'linear-gradient(135deg, #ffffff 0%, #ffa8a8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.1,
                }}
              >
                {t('title')}
              </Title>

              <Text
                size='xl'
                ta='center'
                maw={600}
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1.25rem',
                  lineHeight: 1.6,
                }}
              >
                {t('subtitle')}
              </Text>

              {/* CTA Buttons */}
              <Group mt='xl' gap='md'>
                <Button
                  component={Link}
                  href='/auth/signup'
                  size='xl'
                  radius='xl'
                  rightSection={<IconRocket size={20} />}
                  style={{
                    background:
                      'linear-gradient(135deg, #C52720 0%, #991b1b 100%)',
                    border: 'none',
                    fontWeight: 600,
                    padding: '16px 32px',
                  }}
                >
                  {t('getStarted')}
                </Button>
                <Button
                  component={Link}
                  href='/auth/signin'
                  variant='outline'
                  size='xl'
                  radius='xl'
                  rightSection={<RTLArrowRight size={20} />}
                  style={{
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '16px 32px',
                  }}
                >
                  {t('signIn')}
                </Button>
              </Group>
            </Stack>
          </Center>
        </Stack>
      </Container>
    </Box>
  );
}
