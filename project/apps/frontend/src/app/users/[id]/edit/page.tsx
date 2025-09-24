'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Card,
  Alert,
  Loader,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconAlertCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { UserForm } from '../../../../../components/forms/UserForm';
import { useUser, useUpdateUser } from '../../../../../hooks/useUsers';
import { UserFormData } from '../../../../../types/unified';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useUser(userId);
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (data: UserFormData) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data,
      });
      notifications.show({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
      });
      router.push(`/users/${userId}`);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update user',
        color: 'red',
      });
    }
  };

  const handleCancel = () => {
    router.push(`/users/${userId}`);
  };

  if (isLoading) {
    return (
      <Container size='md' py='md'>
        <Group justify='center' mt='xl'>
          <Loader size='lg' />
          <Text>Loading user details...</Text>
        </Group>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container size='md' py='md'>
        <Alert icon={<IconAlertCircle size={16} />} title='Error' color='red'>
          Failed to load user: {error?.message || 'User not found'}
        </Alert>
        <Group mt='md'>
          <Button
            variant='outline'
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size='md' py='md'>
      <Group mb='xl'>
        <Button
          variant='subtle'
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleCancel}
        >
          Back to User
        </Button>
        <div>
          <Title order={1}>Edit User</Title>
          <Text c='dimmed'>Update user information and settings</Text>
        </div>
      </Group>

      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <UserForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={user}
          isEditing={true}
        />
      </Card>

      {updateUserMutation.isError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title='Error'
          color='red'
          mt='md'
        >
          Failed to update user. Please check the form and try again.
        </Alert>
      )}
    </Container>
  );
}
