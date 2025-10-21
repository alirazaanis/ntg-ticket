'use client';

// import { useState } from 'react'; // Removed unused import
import { useTranslations } from 'next-intl';
import {
  Modal,
  Title,
  Text,
  Stack,
  Group,
  Card,
  Badge,
  ThemeIcon,
  Box,
  Alert,
  ActionIcon,
} from '@mantine/core';
import {
  IconUser,
  IconShield,
  IconUsers,
  IconSettings,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { UserRole } from '../../types/unified';
import { roleConfig } from '../../lib/roleConfig';

interface RoleSelectionModalProps {
  opened: boolean;
  onClose: () => void;
  roles: UserRole[];
  activeRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  loading: boolean;
  error: string | null;
}

const modalRoleConfig = {
  [UserRole.END_USER]: {
    icon: IconUser,
    color: roleConfig[UserRole.END_USER].color,
    title: 'End User',
    description: 'Submit and track your support tickets',
    permissions: ['Create tickets', 'View own tickets', 'Add comments'],
  },
  [UserRole.SUPPORT_STAFF]: {
    icon: IconUsers,
    color: roleConfig[UserRole.SUPPORT_STAFF].color,
    title: 'Support Staff',
    description: 'Handle assigned tickets and provide support',
    permissions: ['View assigned tickets', 'Resolve tickets', 'Add comments'],
  },
  [UserRole.SUPPORT_MANAGER]: {
    icon: IconShield,
    color: roleConfig[UserRole.SUPPORT_MANAGER].color,
    title: 'Support Manager',
    description: 'Manage team and oversee ticket operations',
    permissions: [
      'Assign tickets',
      'View all tickets',
      'Manage team',
      'Generate reports',
    ],
  },
  [UserRole.ADMIN]: {
    icon: IconSettings,
    color: roleConfig[UserRole.ADMIN].color,
    title: 'Administrator',
    description: 'Full system access and user management',
    permissions: [
      'Manage users',
      'System settings',
      'View all data',
      'Admin functions',
    ],
  },
};

export function RoleSelectionModal({
  opened,
  onClose,
  roles,
  activeRole,
  onRoleSelect,
  // loading, // Removed unused parameter
  error,
}: RoleSelectionModalProps) {
  const t = useTranslations('auth');

  const handleRoleClick = (role: UserRole) => {
    onRoleSelect(role);
  };

  const availableRoles = roles.map(role => ({
    role,
    ...modalRoleConfig[role],
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify='space-between' w='100%'>
          <Title order={3} fw={600}>
            {t('selectRole')}
          </Title>
          <ActionIcon variant='subtle' color='gray' onClick={onClose} size='sm'>
            <IconX size={16} />
          </ActionIcon>
        </Group>
      }
      size='lg'
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <Stack gap='lg'>
        <Box>
          <Text size='sm' c='dimmed' mb='md'>
            {t('youHaveMultipleRoles')}
          </Text>
          {error && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color='red'
              variant='light'
              radius='md'
              mb='md'
            >
              <Text size='sm'>{error}</Text>
            </Alert>
          )}
        </Box>

        <Stack gap='md'>
          {availableRoles.map(
            ({ role, icon: Icon, color, title, description, permissions }) => (
              <Card
                key={role}
                shadow='sm'
                padding='lg'
                radius='md'
                withBorder
                style={{
                  cursor: 'pointer',
                  borderColor:
                    activeRole === role
                      ? `var(--mantine-color-${color}-5)`
                      : undefined,
                  borderWidth: activeRole === role ? 2 : 1,
                  opacity: 1,
                }}
                onClick={() => handleRoleClick(role)}
              >
                <Group justify='space-between' mb='sm'>
                  <Group gap='sm'>
                    <ThemeIcon
                      size='lg'
                      radius='md'
                      variant='light'
                      color={color}
                    >
                      <Icon size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={600} size='lg'>
                        {title}
                      </Text>
                      <Text size='sm' c='dimmed'>
                        {description}
                      </Text>
                    </Box>
                  </Group>
                  <Badge
                    color={color}
                    variant={activeRole === role ? 'filled' : 'light'}
                    size='sm'
                  >
                    {role.replace('_', ' ')}
                    {activeRole === role && ' (Current)'}
                  </Badge>
                </Group>

                <Text size='xs' c='dimmed' mb='xs'>
                  Permissions:
                </Text>
                <Group gap='xs'>
                  {permissions.map(permission => (
                    <Badge
                      key={permission}
                      size='xs'
                      variant='outline'
                      color={color}
                    >
                      {permission}
                    </Badge>
                  ))}
                </Group>
              </Card>
            )
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
