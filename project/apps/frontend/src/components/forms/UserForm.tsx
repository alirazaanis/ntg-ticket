'use client';

import { useState } from 'react';
import {
  TextInput,
  // Select, // Removed unused import
  MultiSelect,
  Button,
  Group,
  Stack,
  Grid,
  Switch,
  PasswordInput,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showErrorNotification } from '@/lib/notifications';
import { usePasswordValidation } from '../../hooks/usePasswordValidation';

import { UserFormData, User } from '../../types/unified';

// Re-export for backward compatibility
export type { UserFormData, User };

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  initialData?: User;
  isEditing?: boolean;
}

const roles = [
  { value: 'END_USER', label: 'End User' },
  { value: 'SUPPORT_STAFF', label: 'Support Staff' },
  { value: 'SUPPORT_MANAGER', label: 'Support Manager' },
  { value: 'ADMIN', label: 'Administrator' },
];

export function UserForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validatePassword } = usePasswordValidation();

  const form = useForm<UserFormData>({
    initialValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      roles: initialData?.roles || ['END_USER'],
      isActive: initialData?.isActive ?? true,
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: value => (!value ? 'Name is required' : null),
      email: value => (!/^\S+@\S+\.\S+$/.test(value) ? 'Invalid email' : null),
      roles: value =>
        !value || value.length === 0 ? 'At least one role is required' : null,
      password: value => {
        if (!isEditing && !value) return 'Password is required';
        if (value) return validatePassword(value);
        return null;
      },
      confirmPassword: (value, values) => {
        if (!isEditing && value !== values.password)
          return 'Passwords do not match';
        return null;
      },
    },
  });

  const handleSubmit = async (values: UserFormData) => {
    setIsSubmitting(true);
    try {
      const formData = { ...values };
      if (isEditing) {
        delete formData.password;
        delete formData.confirmPassword;
      }
      await onSubmit(formData);
    } catch (error) {
      showErrorNotification('Error', 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap='md'>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label='Full Name'
              placeholder='Enter full name'
              required
              {...form.getInputProps('name')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label='Email'
              placeholder='Enter email address'
              required
              type='email'
              {...form.getInputProps('email')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <MultiSelect
              label='Roles'
              placeholder='Select roles'
              required
              data={roles}
              {...form.getInputProps('roles')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Switch
              label='Active'
              description='User can access the system'
              {...form.getInputProps('isActive', { type: 'checkbox' })}
            />
          </Grid.Col>
        </Grid>

        {!isEditing && (
          <Grid>
            <Grid.Col span={6}>
              <PasswordInput
                label='Password'
                placeholder='Enter password'
                required
                {...form.getInputProps('password')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <PasswordInput
                label='Confirm Password'
                placeholder='Confirm password'
                required
                {...form.getInputProps('confirmPassword')}
              />
            </Grid.Col>
          </Grid>
        )}

        {isEditing && (
          <Alert color='blue' title='Password'>
            Leave password fields empty to keep the current password. Enter a
            new password to change it.
          </Alert>
        )}

        <Group justify='flex-end' mt='xl'>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' loading={isSubmitting}>
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
