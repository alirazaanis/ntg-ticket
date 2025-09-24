'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  Group,
  Divider,
  Select,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconMail,
  IconLock,
  IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePasswordValidation } from '../../../hooks/usePasswordValidation';
import { userApi } from '../../../lib/apiClient';
import { UserRole } from '@/types/unified';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'END_USER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError('Passwords do not match');
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
        router.push('/auth/signin?message=Account created successfully');
      } else {
        setError('An error occurred while creating your account');
      }
    } catch (error: unknown) {
      // Handle signup error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 409) {
          setError('An account with this email already exists');
        } else if (axiosError.response?.status === 400) {
          setError(
            axiosError.response?.data?.message || 'Invalid data provided'
          );
        } else {
          setError('An error occurred. Please try again.');
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Container size={420} my={40}>
      <Title ta='center' mb='md'>
        Create account
      </Title>
      <Text c='dimmed' size='sm' ta='center' mt={5} mb={30}>
        Sign up for NTG Ticket System
      </Text>

      <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color='red'>
                {error}
              </Alert>
            )}

            <TextInput
              label='Full Name'
              placeholder='John Doe'
              required
              leftSection={<IconUser size={16} />}
              value={formData.name}
              onChange={e => handleChange('name', e.currentTarget.value)}
            />

            <TextInput
              label='Email'
              placeholder='your@email.com'
              required
              leftSection={<IconMail size={16} />}
              value={formData.email}
              onChange={e => handleChange('email', e.currentTarget.value)}
              type='email'
            />

            <Select
              label='Role'
              placeholder='Select your role'
              data={[
                { value: 'END_USER', label: 'End User' },
                { value: 'SUPPORT_STAFF', label: 'Support Staff' },
                { value: 'SUPPORT_MANAGER', label: 'Support Manager' },
                { value: 'ADMIN', label: 'Administrator' },
              ]}
              value={formData.role}
              onChange={value => handleChange('role', value || 'END_USER')}
            />

            <PasswordInput
              label='Password'
              placeholder='Your password'
              required
              leftSection={<IconLock size={16} />}
              value={formData.password}
              onChange={e => handleChange('password', e.currentTarget.value)}
            />

            <PasswordInput
              label='Confirm Password'
              placeholder='Confirm your password'
              required
              leftSection={<IconLock size={16} />}
              value={formData.confirmPassword}
              onChange={e =>
                handleChange('confirmPassword', e.currentTarget.value)
              }
            />

            <Button type='submit' fullWidth loading={loading}>
              Create account
            </Button>

            <Divider label='or' labelPosition='center' />

            <Group justify='center'>
              <Text size='sm'>
                Already have an account?{' '}
                <Link href='/auth/signin' style={{ textDecoration: 'none' }}>
                  Sign in
                </Link>
              </Text>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
