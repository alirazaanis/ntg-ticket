'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
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
} from '@mantine/core';
import {
  IconAlertCircle,
  IconMail,
  IconLock,
  IconClock,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useLoginAttempts } from '../../../hooks/useLoginAttempts';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAttemptLogin) {
      setError(
        `Too many failed attempts. Please wait ${formattedRemainingTime} before trying again.`
      );
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
            `Invalid credentials. Account will be locked after ${remainingAttempts} more failed attempt.`
          );
        } else {
          setError(
            `Invalid email or password. ${remainingAttempts} attempts remaining.`
          );
        }
      } else if (result?.ok) {
        // Reset attempts on successful login
        resetAttempts();
        // Redirect immediately after successful login
        router.push('/dashboard');
      }
    } catch (error) {
      incrementAttempts();
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta='center' mb='md'>
        Welcome back!
      </Title>
      <Text c='dimmed' size='sm' ta='center' mt={5} mb={30}>
        Sign in to your NTG Ticket account
      </Text>

      <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color='red'>
                {error}
              </Alert>
            )}

            {isLocked && (
              <Alert icon={<IconClock size={16} />} color='orange'>
                Account temporarily locked due to too many failed attempts.
                Please wait {formattedRemainingTime} before trying again.
              </Alert>
            )}

            {attempts > 0 && !isLocked && (
              <Alert icon={<IconAlertCircle size={16} />} color='yellow'>
                {remainingAttempts} login attempts remaining.
              </Alert>
            )}

            <TextInput
              label='Email'
              placeholder='your@email.com'
              required
              leftSection={<IconMail size={16} />}
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
              type='email'
            />

            <PasswordInput
              label='Password'
              placeholder='Your password'
              required
              leftSection={<IconLock size={16} />}
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
            />

            <Button type='submit' fullWidth loading={loading}>
              Sign in
            </Button>

            <Divider label='or' labelPosition='center' />

            <Group justify='center'>
              <Text size='sm'>
                Don't have an account?{' '}
                <Link href='/auth/signup' style={{ textDecoration: 'none' }}>
                  Sign up
                </Link>
              </Text>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
