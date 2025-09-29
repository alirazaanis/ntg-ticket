'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  Group,
  Box,
  ThemeIcon,
  Anchor,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconMail,
  IconLock,
  IconClock,
  IconCheck,
} from '@tabler/icons-react';
import { RTLArrowRight } from '../../../components/ui/RTLIcon';
import Link from 'next/link';
import { useLoginAttempts } from '../../../hooks/useLoginAttempts';
import { AuthLayout } from '../../../components/layouts/AuthLayout';

export default function SignInPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<
    'email' | 'password' | 'complete'
  >('email');
  const [emailValid, setEmailValid] = useState(false);
  const router = useRouter();
  const {
    attempts,
    isLocked,
    remainingAttempts,
    canAttemptLogin,
    formattedRemainingTime,
    incrementAttempts,
    resetAttempts,
  } = useLoginAttempts();

  // Real-time email validation (UIR7: Immediate error feedback)
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailValid(validateEmail(value));
    setError('');
  };

  const handleEmailNext = () => {
    if (emailValid) {
      setCurrentStep('password');
    } else {
      setError(t('emailInvalid'));
    }
  };

  const handleBack = () => {
    if (currentStep === 'password') {
      setCurrentStep('email');
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAttemptLogin) {
      setError(t('tooManyAttempts', { time: formattedRemainingTime }));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        incrementAttempts();
        if (remainingAttempts <= 1) {
          setError(
            t('invalidCredentialsLocked', { attempts: remainingAttempts })
          );
        } else {
          setError(
            t('invalidCredentialsRemaining', { attempts: remainingAttempts })
          );
        }
        setCurrentStep('password'); // Stay on password step to retry
      } else if (result?.ok) {
        // Reset attempts on successful login
        resetAttempts();
        setCurrentStep('complete');
        // Redirect immediately after successful login
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (error) {
      incrementAttempts();
      setError(t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  // Guided step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <Stack gap='lg'>
            <Box>
              <Title order={2} size='1.8rem' fw={700} mb='xs'>
                {t('welcome')}
              </Title>
              <Text c='dimmed' size='sm'>
                {t('enterEmailToContinue')}
              </Text>
            </Box>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color='red'
                variant='light'
                radius='md'
              >
                {error}
              </Alert>
            )}

            <TextInput
              label={t('email')}
              placeholder='your@email.com'
              required
              leftSection={<IconMail size={18} />}
              value={email}
              onChange={e => handleEmailChange(e.currentTarget.value)}
              type='email'
              size='lg'
              radius='md'
              autoComplete='email'
              name='email'
              id='email'
              dir='auto'
              error={email && !emailValid ? t('emailInvalid') : ''}
              styles={theme => ({
                input: {
                  border: emailValid
                    ? `2px solid ${theme.colors.green[5]}`
                    : `2px solid ${theme.colors.gray[3]}`,
                  '&:focus': {
                    borderColor: emailValid
                      ? theme.colors.green[5]
                      : theme.colors.red[5],
                  },
                },
              })}
            />

            <Button
              onClick={handleEmailNext}
              fullWidth
              disabled={!emailValid}
              size='lg'
              radius='md'
              rightSection={<RTLArrowRight size={18} />}
              style={theme => ({
                background: emailValid
                  ? 'linear-gradient(135deg, #C52720 0%, #991b1b 100%)'
                  : theme.colors.gray[3],
                border: 'none',
                fontWeight: 600,
                color: emailValid ? 'white' : theme.colors.gray[6],
              })}
            >
              {tCommon('next')}
            </Button>

            <Group justify='center'>
              <Text size='sm' c='dimmed'>
                {t('dontHaveAccount')}{' '}
                <Anchor
                  component={Link}
                  href='/auth/signup'
                  fw={600}
                  style={theme => ({
                    color: theme.colors.red[5],
                    textDecoration: 'none',
                  })}
                >
                  {t('signUp')}
                </Anchor>
              </Text>
            </Group>
          </Stack>
        );

      case 'password':
        return (
          <form onSubmit={handleSubmit}>
            <Stack gap='lg'>
              <Box>
                <Button
                  variant='subtle'
                  leftSection={<RTLArrowRight size={16} />}
                  onClick={handleBack}
                  size='sm'
                  mb='md'
                  style={{ alignSelf: 'flex-start' }}
                >
                  {tCommon('back')}
                </Button>
                <Title order={2} size='1.8rem' fw={700} mb='xs'>
                  {t('password')}
                </Title>
                <Text c='dimmed' size='sm'>
                  {t('welcomeBack')}, {email}
                </Text>
              </Box>

              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color='red'
                  variant='light'
                  radius='md'
                >
                  {error}
                </Alert>
              )}

              {isLocked && (
                <Alert
                  icon={<IconClock size={16} />}
                  color='orange'
                  variant='light'
                  radius='md'
                >
                  {t('accountLockedWait', { time: formattedRemainingTime })}
                </Alert>
              )}

              {attempts > 0 && !isLocked && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color='yellow'
                  variant='light'
                  radius='md'
                >
                  {t('invalidCredentialsRemaining', {
                    attempts: remainingAttempts,
                  })}
                </Alert>
              )}

              <PasswordInput
                label={t('password')}
                placeholder='Enter your password'
                required
                leftSection={<IconLock size={18} />}
                value={password}
                onChange={e => setPassword(e.currentTarget.value)}
                size='lg'
                radius='md'
                autoFocus
                autoComplete='current-password'
                name='password'
                id='password'
                dir='auto'
                styles={theme => ({
                  input: {
                    border: `2px solid ${theme.colors.gray[3]}`,
                    '&:focus': {
                      borderColor: theme.colors.red[5],
                    },
                  },
                })}
              />

              <Button
                type='submit'
                fullWidth
                loading={loading}
                size='lg'
                radius='md'
                style={{
                  background:
                    'linear-gradient(135deg, #C52720 0%, #991b1b 100%)',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {t('signIn')}
              </Button>

              <Group justify='center'>
                <Text size='sm' c='dimmed'>
                  {t('forgotPassword')}{' '}
                  <Anchor
                    href='#'
                    fw={600}
                    style={theme => ({
                      color: theme.colors.red[5],
                      textDecoration: 'none',
                    })}
                  >
                    {t('resetPassword')}
                  </Anchor>
                </Text>
              </Group>
            </Stack>
          </form>
        );

      case 'complete':
        return (
          <Stack gap='lg' align='center'>
            <Box ta='center'>
              <ThemeIcon
                size={60}
                radius='xl'
                variant='gradient'
                gradient={{ from: 'green', to: 'teal' }}
                mb='md'
              >
                <IconCheck size={30} />
              </ThemeIcon>
              <Title order={2} size='1.8rem' fw={700} mb='xs'>
                {t('welcome')}!
              </Title>
              <Text c='dimmed' size='sm'>
                {t('redirectingToDashboard')}
              </Text>
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout title={t('welcome')} subtitle={t('subtitle')} type='signin'>
      {renderStepContent()}
    </AuthLayout>
  );
}
