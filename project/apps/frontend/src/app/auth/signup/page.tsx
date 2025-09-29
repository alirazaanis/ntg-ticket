'use client';

import { useState } from 'react';
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
  Select,
  Box,
  ThemeIcon,
  Anchor,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconMail,
  IconLock,
  IconUser,
  IconShield,
  IconArrowRight,
  IconCheck,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePasswordValidation } from '../../../hooks/usePasswordValidation';
import { userApi } from '../../../lib/apiClient';
import { UserRole } from '@/types/unified';
import { AuthLayout } from '../../../components/layouts/AuthLayout';

export default function SignUpPage() {
  const t = useTranslations('common');
  const tAuth = useTranslations('auth');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'END_USER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<
    'personal' | 'credentials' | 'role' | 'complete'
  >('personal');
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const router = useRouter();
  const { validatePassword } = usePasswordValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(tAuth('passwordMismatch'));
      setLoading(false);
      return;
    }

    // Sanitize inputs
    const sanitizedData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role as
        | 'END_USER'
        | 'SUPPORT_STAFF'
        | 'SUPPORT_MANAGER'
        | 'ADMIN',
      isActive: true,
    };

    try {
      const response = await userApi.createUser({
        ...sanitizedData,
        role: sanitizedData.role as UserRole,
      });

      if (response.status === 201) {
        router.push(
          `/auth/signin?message=${tAuth('accountCreatedSuccessfully')}`
        );
      } else {
        setError(tAuth('errorCreatingAccount'));
      }
    } catch (error: unknown) {
      // Handle signup error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 409) {
          setError(tAuth('accountExists'));
        } else if (axiosError.response?.status === 400) {
          setError(
            axiosError.response?.data?.message || tAuth('invalidDataProvided')
          );
        } else {
          setError(tAuth('errorOccurred'));
        }
      } else {
        setError(tAuth('errorOccurred'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation (UIR7: Immediate error feedback)
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    if (field === 'email') {
      setEmailValid(validateEmail(value));
    } else if (field === 'password') {
      const passwordError = validatePassword(value);
      setPasswordValid(!passwordError && value.length >= 8);
    }

    setError('');
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'personal':
        if (formData.name.trim() && emailValid) {
          setCurrentStep('credentials');
        } else {
          setError(tAuth('fillRequiredFields'));
        }
        break;
      case 'credentials':
        if (passwordValid && formData.password === formData.confirmPassword) {
          setCurrentStep('role');
        } else {
          setError(tAuth('passwordsMatchRequirements'));
        }
        break;
      case 'role':
        handleSubmit(new Event('submit') as unknown as React.FormEvent);
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'credentials':
        setCurrentStep('personal');
        break;
      case 'role':
        setCurrentStep('credentials');
        break;
    }
    setError('');
  };

  // Guided step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <Stack gap='lg'>
            <Box>
              <Title order={2} size='1.8rem' fw={700} mb='xs'>
                {tAuth('personalInfo')}
              </Title>
              <Text c='dimmed' size='sm'>
                {tAuth('personalInfoSubtitle')}
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

            <Stack gap='md'>
              <TextInput
                label={tAuth('fullName')}
                placeholder='John Doe'
                required
                leftSection={<IconUser size={18} />}
                value={formData.name}
                onChange={e => handleChange('name', e.currentTarget.value)}
                size='lg'
                radius='md'
                autoComplete='name'
                name='name'
                id='name'
                dir='auto'
                styles={theme => ({
                  input: {
                    border: formData.name.trim()
                      ? `2px solid ${theme.colors.green[5]}`
                      : `2px solid ${theme.colors.gray[3]}`,
                    '&:focus': {
                      borderColor: formData.name.trim()
                        ? theme.colors.green[5]
                        : theme.colors.blue[5],
                    },
                  },
                })}
              />

              <TextInput
                label={tAuth('email')}
                placeholder='your@email.com'
                required
                leftSection={<IconMail size={18} />}
                value={formData.email}
                onChange={e => handleChange('email', e.currentTarget.value)}
                type='email'
                size='lg'
                radius='md'
                autoComplete='email'
                name='email'
                id='email'
                dir='auto'
                error={
                  formData.email && !emailValid ? tAuth('emailInvalid') : ''
                }
                styles={theme => ({
                  input: {
                    border: emailValid
                      ? `2px solid ${theme.colors.green[5]}`
                      : `2px solid ${theme.colors.gray[3]}`,
                    '&:focus': {
                      borderColor: emailValid
                        ? theme.colors.green[5]
                        : theme.colors.blue[5],
                    },
                  },
                })}
              />
            </Stack>

            <Button
              onClick={handleNext}
              fullWidth
              disabled={!formData.name.trim() || !emailValid}
              size='lg'
              radius='md'
              rightSection={<IconArrowRight size={18} />}
              style={theme => ({
                background:
                  formData.name.trim() && emailValid
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : theme.colors.gray[3],
                border: 'none',
                fontWeight: 600,
                color:
                  formData.name.trim() && emailValid
                    ? 'white'
                    : theme.colors.gray[6],
              })}
            >
              {t('next')}
            </Button>

            <Group justify='center'>
              <Text size='sm' c='dimmed'>
                {tAuth('alreadyHaveAccount')}{' '}
                <Anchor
                  component={Link}
                  href='/auth/signin'
                  fw={600}
                  style={theme => ({
                    color: theme.colors.blue[5],
                    textDecoration: 'none',
                  })}
                >
                  {tAuth('signIn')}
                </Anchor>
              </Text>
            </Group>
          </Stack>
        );

      case 'credentials':
        return (
          <Stack gap='lg'>
            <Box>
              <Button
                variant='subtle'
                leftSection={
                  <IconArrowRight
                    size={16}
                    style={{ transform: 'rotate(180deg)' }}
                  />
                }
                onClick={handleBack}
                size='sm'
                mb='md'
                style={{ alignSelf: 'flex-start' }}
              >
                {t('back')}
              </Button>
              <Title order={2} size='1.8rem' fw={700} mb='xs'>
                {tAuth('createPassword')}
              </Title>
              <Text c='dimmed' size='sm'>
                {tAuth('createPasswordSubtitle')}
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

            <Stack gap='md'>
              <PasswordInput
                label={tAuth('password')}
                placeholder='Create a strong password'
                required
                leftSection={<IconLock size={18} />}
                value={formData.password}
                onChange={e => handleChange('password', e.currentTarget.value)}
                size='lg'
                radius='md'
                autoFocus
                autoComplete='new-password'
                name='password'
                id='password'
                dir='auto'
                error={
                  formData.password && !passwordValid
                    ? validatePassword(formData.password)
                    : ''
                }
                styles={theme => ({
                  input: {
                    border: passwordValid
                      ? `2px solid ${theme.colors.green[5]}`
                      : `2px solid ${theme.colors.gray[3]}`,
                    '&:focus': {
                      borderColor: passwordValid
                        ? theme.colors.green[5]
                        : theme.colors.blue[5],
                    },
                  },
                })}
              />

              <PasswordInput
                label={tAuth('confirmPassword')}
                placeholder='Confirm your password'
                required
                leftSection={<IconLock size={18} />}
                value={formData.confirmPassword}
                onChange={e =>
                  handleChange('confirmPassword', e.currentTarget.value)
                }
                size='lg'
                radius='md'
                autoComplete='new-password'
                name='confirmPassword'
                id='confirmPassword'
                dir='auto'
                error={
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? tAuth('passwordMismatch')
                    : ''
                }
                styles={theme => ({
                  input: {
                    border:
                      formData.confirmPassword &&
                      formData.password === formData.confirmPassword
                        ? `2px solid ${theme.colors.green[5]}`
                        : `2px solid ${theme.colors.gray[3]}`,
                    '&:focus': {
                      borderColor:
                        formData.confirmPassword &&
                        formData.password === formData.confirmPassword
                          ? theme.colors.green[5]
                          : theme.colors.blue[5],
                    },
                  },
                })}
              />
            </Stack>

            <Button
              onClick={handleNext}
              fullWidth
              disabled={
                !passwordValid || formData.password !== formData.confirmPassword
              }
              size='lg'
              radius='md'
              rightSection={<IconArrowRight size={18} />}
              style={theme => ({
                background:
                  passwordValid &&
                  formData.password === formData.confirmPassword
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : theme.colors.gray[3],
                border: 'none',
                fontWeight: 600,
                color:
                  passwordValid &&
                  formData.password === formData.confirmPassword
                    ? 'white'
                    : theme.colors.gray[6],
              })}
            >
              {t('next')}
            </Button>
          </Stack>
        );

      case 'role':
        return (
          <Stack gap='lg'>
            <Box>
              <Button
                variant='subtle'
                leftSection={
                  <IconArrowRight
                    size={16}
                    style={{ transform: 'rotate(180deg)' }}
                  />
                }
                onClick={handleBack}
                size='sm'
                mb='md'
                style={{ alignSelf: 'flex-start' }}
              >
                {t('back')}
              </Button>
              <Title order={2} size='1.8rem' fw={700} mb='xs'>
                {tAuth('selectRole')}
              </Title>
              <Text c='dimmed' size='sm'>
                {tAuth('selectRoleSubtitle')}
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

            <Select
              label={tAuth('role')}
              placeholder='Select your role'
              data={[
                {
                  value: 'END_USER',
                  label: tAuth('endUser'),
                },
                {
                  value: 'SUPPORT_STAFF',
                  label: tAuth('supportStaff'),
                },
                {
                  value: 'SUPPORT_MANAGER',
                  label: tAuth('supportManager'),
                },
                { value: 'ADMIN', label: tAuth('administrator') },
              ]}
              value={formData.role}
              onChange={value => handleChange('role', value || 'END_USER')}
              size='lg'
              radius='md'
              dir='auto'
              styles={theme => ({
                input: {
                  border: `2px solid ${theme.colors.gray[3]}`,
                  '&:focus': {
                    borderColor: theme.colors.blue[5],
                  },
                },
              })}
            />

            <Button
              onClick={handleNext}
              fullWidth
              loading={loading}
              size='lg'
              radius='md'
              rightSection={<IconArrowRight size={18} />}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 600,
              }}
            >
              {tAuth('createAccount')}
            </Button>

            <Box
              style={theme => ({
                background: `linear-gradient(135deg, ${theme.colors.blue[0]} 0%, ${theme.colors.blue[1]} 100%)`,
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${theme.colors.blue[2]}`,
              })}
            >
              <Group gap='sm'>
                <ThemeIcon size='sm' variant='light' color='blue'>
                  <IconShield size={14} />
                </ThemeIcon>
                <Text size='xs' c='blue.7' fw={500}>
                  {tAuth('secureLogin')}
                </Text>
              </Group>
            </Box>
          </Stack>
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
                {tAuth('accountCreated')}
              </Title>
              <Text c='dimmed' size='sm'>
                {tAuth('welcome')}, {formData.name}!
              </Text>
              <Text c='dimmed' size='sm' mt='xs'>
                {tAuth('redirectingToSignIn')}
              </Text>
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={tAuth('welcome')}
      subtitle={tAuth('subtitle')}
      type='signup'
    >
      {renderStepContent()}
    </AuthLayout>
  );
}
