'use client';

import { useState } from 'react';
import {
  Container,
  Tabs,
  Stack,
  Title,
  Text,
  Group,
  Button,
  Card,
  Grid,
  Modal,
  Alert,
  Loader,
  Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconUsers,
  IconSettings,
  IconChartBar,
  IconShield,
  IconMail,
  IconAlertCircle,
} from '@tabler/icons-react';
import { UserForm, UserFormData } from '../forms/UserForm';
import { CustomFieldForm } from '../forms/CustomFieldForm';
import { EmailTemplateForm } from '../forms/EmailTemplateForm';
import { SystemSettingsForm } from '../forms/SystemSettingsForm';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '../../hooks/useUsers';
import {
  useCustomFields,
  useCreateCustomField,
  useUpdateCustomField,
  useDeleteCustomField,
} from '../../hooks/useCustomFields';
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
} from '../../hooks/useEmailTemplates';
import {
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput,
} from '../../lib/apiClient';
import {
  useSystemSettings,
  useUpdateSystemSettings,
} from '../../hooks/useSystemSettings';
import {
  User,
  CustomField,
  EmailTemplate,
  SystemSettings,
  UserRole,
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
} from '../../types/unified';

// Union type for editing items
type EditingItem = User | CustomField | EmailTemplate;

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
  const [showEmailTemplateForm, setShowEmailTemplateForm] = useState(false);
  const [showSystemSettingsForm, setShowSystemSettingsForm] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  // Hooks for data fetching and mutations
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const {
    data: customFields,
    isLoading: customFieldsLoading,
    error: customFieldsError,
  } = useCustomFields();
  const {
    data: emailTemplates,
    isLoading: emailTemplatesLoading,
    error: emailTemplatesError,
  } = useEmailTemplates();
  const {
    data: systemSettings,
    isLoading: systemSettingsLoading,
    error: systemSettingsError,
  } = useSystemSettings();

  // Mutation hooks
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const createCustomFieldMutation = useCreateCustomField();
  const updateCustomFieldMutation = useUpdateCustomField();
  const deleteCustomFieldMutation = useDeleteCustomField();

  const createEmailTemplateMutation = useCreateEmailTemplate();
  const updateEmailTemplateMutation = useUpdateEmailTemplate();
  const deleteEmailTemplateMutation = useDeleteEmailTemplate();

  const updateSystemSettingsMutation = useUpdateSystemSettings();

  const handleUserSubmit = async (data: UserFormData) => {
    try {
      if (editingItem && 'email' in editingItem) {
        // For updates, password is optional
        const userData = {
          name: data.name,
          email: data.email,
          role: data.role as
            | 'ADMIN'
            | 'SUPPORT_MANAGER'
            | 'SUPPORT_STAFF'
            | 'END_USER',
          isActive: data.isActive,
          ...(data.password && { password: data.password }),
        };

        await updateUserMutation.mutateAsync({
          id: editingItem.id,
          data: { ...userData, role: userData.role as UserRole },
        });
        notifications.show({
          title: 'Success',
          message: 'User updated successfully',
          color: 'green',
        });
      } else {
        // For creation, password is required
        if (!data.password) {
          notifications.show({
            title: 'Error',
            message: 'Password is required for new users',
            color: 'red',
          });
          return;
        }

        const userData = {
          name: data.name,
          email: data.email,
          role: data.role as
            | 'ADMIN'
            | 'SUPPORT_MANAGER'
            | 'SUPPORT_STAFF'
            | 'END_USER',
          isActive: data.isActive,
          password: data.password,
        };

        await createUserMutation.mutateAsync({
          ...userData,
          role: userData.role as UserRole,
        });
        notifications.show({
          title: 'Success',
          message: 'User created successfully',
          color: 'green',
        });
      }
      setShowUserForm(false);
      setEditingItem(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit user',
        color: 'red',
      });
    }
  };

  const handleCustomFieldSubmit = async (
    data: CreateCustomFieldInput | UpdateCustomFieldInput
  ) => {
    try {
      if (editingItem && 'fieldType' in editingItem) {
        await updateCustomFieldMutation.mutateAsync({
          id: editingItem.id,
          data: data as UpdateCustomFieldInput,
        });
        notifications.show({
          title: 'Success',
          message: 'Custom field updated successfully',
          color: 'green',
        });
      } else {
        await createCustomFieldMutation.mutateAsync(
          data as CreateCustomFieldInput
        );
        notifications.show({
          title: 'Success',
          message: 'Custom field created successfully',
          color: 'green',
        });
      }
      setShowCustomFieldForm(false);
      setEditingItem(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit custom field',
        color: 'red',
      });
    }
  };

  const handleEmailTemplateSubmit = async (
    data: CreateEmailTemplateInput | UpdateEmailTemplateInput
  ) => {
    try {
      if (editingItem && 'type' in editingItem) {
        if (editingItem.id) {
          await updateEmailTemplateMutation.mutateAsync({
            id: editingItem.id,
            data: data as UpdateEmailTemplateInput,
          });
        }
        notifications.show({
          title: 'Success',
          message: 'Email template updated successfully',
          color: 'green',
        });
      } else {
        await createEmailTemplateMutation.mutateAsync(
          data as CreateEmailTemplateInput
        );
        notifications.show({
          title: 'Success',
          message: 'Email template created successfully',
          color: 'green',
        });
      }
      setShowEmailTemplateForm(false);
      setEditingItem(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit email template',
        color: 'red',
      });
    }
  };

  const handleSystemSettingsSubmit = async (data: Partial<SystemSettings>) => {
    try {
      await updateSystemSettingsMutation.mutateAsync(data);
      notifications.show({
        title: 'Success',
        message: 'System settings updated successfully',
        color: 'green',
      });
      setShowSystemSettingsForm(false);
      setEditingItem(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit system settings',
        color: 'red',
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingItem(user);
    setShowUserForm(true);
  };

  const handleEditCustomField = (customField: CustomField) => {
    setEditingItem(customField);
    setShowCustomFieldForm(true);
  };

  const handleEditEmailTemplate = (emailTemplate: EmailTemplate) => {
    setEditingItem(emailTemplate);
    setShowEmailTemplateForm(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserMutation.mutateAsync(id);
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete user',
          color: 'red',
        });
      }
    }
  };

  const handleDeleteCustomField = async (id: string) => {
    if (confirm('Are you sure you want to delete this custom field?')) {
      try {
        await deleteCustomFieldMutation.mutateAsync(id);
        notifications.show({
          title: 'Success',
          message: 'Custom field deleted successfully',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete custom field',
          color: 'red',
        });
      }
    }
  };

  const handleDeleteEmailTemplate = async (id: string) => {
    if (confirm('Are you sure you want to delete this email template?')) {
      try {
        await deleteEmailTemplateMutation.mutateAsync(id);
        notifications.show({
          title: 'Success',
          message: 'Email template deleted successfully',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete email template',
          color: 'red',
        });
      }
    }
  };

  return (
    <Container size='xl'>
      <Stack gap='md'>
        <Title order={2}>System Administration</Title>

        <Tabs
          value={activeTab}
          onChange={value => setActiveTab(value || 'users')}
        >
          <Tabs.List>
            <Tabs.Tab value='users' leftSection={<IconUsers size={16} />}>
              Users
            </Tabs.Tab>
            <Tabs.Tab
              value='custom-fields'
              leftSection={<IconSettings size={16} />}
            >
              Custom Fields
            </Tabs.Tab>
            <Tabs.Tab
              value='email-templates'
              leftSection={<IconMail size={16} />}
            >
              Email Templates
            </Tabs.Tab>
            <Tabs.Tab
              value='system-settings'
              leftSection={<IconShield size={16} />}
            >
              System Settings
            </Tabs.Tab>
            <Tabs.Tab
              value='analytics'
              leftSection={<IconChartBar size={16} />}
            >
              Analytics
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='users' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>User Management</Title>
                <Button onClick={() => setShowUserForm(true)}>Add User</Button>
              </Group>

              {usersError && (
                <Alert icon={<IconAlertCircle size={16} />} color='red'>
                  Failed to load users: {usersError.message}
                </Alert>
              )}

              {usersLoading ? (
                <Center py='xl'>
                  <Loader size='lg' />
                </Center>
              ) : (
                <Grid>
                  {users?.data?.data?.map((user: User) => (
                    <Grid.Col span={6} key={user.id}>
                      <Card>
                        <Group justify='space-between'>
                          <div>
                            <Text fw={500}>{user.name}</Text>
                            <Text size='sm' color='dimmed'>
                              {user.email}
                            </Text>
                            <Text size='xs' color='dimmed'>
                              Role: {user.role} | Status:{' '}
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Text>
                          </div>
                          <Group gap='xs'>
                            <Button
                              size='xs'
                              variant='light'
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              size='xs'
                              variant='light'
                              color='red'
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </Button>
                          </Group>
                        </Group>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='custom-fields' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>Custom Fields</Title>
                <Button onClick={() => setShowCustomFieldForm(true)}>
                  Add Custom Field
                </Button>
              </Group>

              {customFieldsError && (
                <Alert icon={<IconAlertCircle size={16} />} color='red'>
                  Failed to load custom fields: {customFieldsError.message}
                </Alert>
              )}

              {customFieldsLoading ? (
                <Center py='xl'>
                  <Loader size='lg' />
                </Center>
              ) : (
                <Grid>
                  {customFields?.map((field: CustomField) => (
                    <Grid.Col span={6} key={field.id}>
                      <Card>
                        <Group justify='space-between'>
                          <div>
                            <Text fw={500}>{field.name}</Text>
                            <Text size='sm' color='dimmed'>
                              Type: {field.fieldType}
                            </Text>
                            <Text size='xs' color='dimmed'>
                              Required: {field.isRequired ? 'Yes' : 'No'} |
                              Active: {field.isActive ? 'Yes' : 'No'}
                            </Text>
                            {field.options && (
                              <Text size='xs' color='dimmed'>
                                Options: {field.options.join(', ')}
                              </Text>
                            )}
                          </div>
                          <Group gap='xs'>
                            <Button
                              size='xs'
                              variant='light'
                              onClick={() => handleEditCustomField(field)}
                            >
                              Edit
                            </Button>
                            <Button
                              size='xs'
                              variant='light'
                              color='red'
                              onClick={() => handleDeleteCustomField(field.id)}
                            >
                              Delete
                            </Button>
                          </Group>
                        </Group>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='email-templates' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>Email Templates</Title>
                <Button onClick={() => setShowEmailTemplateForm(true)}>
                  Add Template
                </Button>
              </Group>

              {emailTemplatesError && (
                <Alert icon={<IconAlertCircle size={16} />} color='red'>
                  Failed to load email templates: {emailTemplatesError.message}
                </Alert>
              )}

              {emailTemplatesLoading ? (
                <Center py='xl'>
                  <Loader size='lg' />
                </Center>
              ) : (
                <Grid>
                  {emailTemplates?.map((template: EmailTemplate) => (
                    <Grid.Col span={6} key={template.id}>
                      <Card>
                        <Group justify='space-between'>
                          <div>
                            <Text fw={500}>{template.name}</Text>
                            <Text size='sm' color='dimmed'>
                              Type: {template.type}
                            </Text>
                            <Text size='sm' color='dimmed' mt='xs'>
                              Subject: {template.subject}
                            </Text>
                            <Text size='xs' color='dimmed'>
                              Active: {template.isActive ? 'Yes' : 'No'}
                            </Text>
                          </div>
                          <Group gap='xs'>
                            <Button
                              size='xs'
                              variant='light'
                              onClick={() => handleEditEmailTemplate(template)}
                            >
                              Edit
                            </Button>
                            <Button
                              size='xs'
                              variant='light'
                              color='red'
                              onClick={() =>
                                handleDeleteEmailTemplate(template.id || '')
                              }
                            >
                              Delete
                            </Button>
                          </Group>
                        </Group>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='system-settings' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>System Settings</Title>
                <Button onClick={() => setShowSystemSettingsForm(true)}>
                  Edit Settings
                </Button>
              </Group>

              {systemSettingsError && (
                <Alert icon={<IconAlertCircle size={16} />} color='red'>
                  Failed to load system settings: {systemSettingsError.message}
                </Alert>
              )}

              {systemSettingsLoading ? (
                <Center py='xl'>
                  <Loader size='lg' />
                </Center>
              ) : (
                <Grid>
                  <Grid.Col span={12}>
                    <Card>
                      <Text fw={500} mb='md'>
                        Current System Settings
                      </Text>
                      {systemSettings && (
                        <Stack gap='sm'>
                          <Text size='sm'>
                            <strong>Site Name:</strong>{' '}
                            {systemSettings.siteName || 'Not set'}
                          </Text>
                          <Text size='sm'>
                            <strong>Timezone:</strong>{' '}
                            {systemSettings.timezone || 'Not set'}
                          </Text>
                          <Text size='sm'>
                            <strong>Language:</strong>{' '}
                            {systemSettings.language || 'Not set'}
                          </Text>
                          <Text size='sm'>
                            <strong>Email Notifications:</strong>{' '}
                            {systemSettings.emailNotifications
                              ? 'Enabled'
                              : 'Disabled'}
                          </Text>
                          <Text size='sm'>
                            <strong>Auto Assign Tickets:</strong>{' '}
                            {systemSettings.autoAssignTickets
                              ? 'Enabled'
                              : 'Disabled'}
                          </Text>
                          <Text size='sm'>
                            <strong>Session Timeout:</strong>{' '}
                            {systemSettings.sessionTimeout || 'Not set'} minutes
                          </Text>
                        </Stack>
                      )}
                    </Card>
                  </Grid.Col>
                </Grid>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='analytics' pt='md'>
            <Stack gap='md'>
              <Title order={3}>System Analytics</Title>

              <Grid>
                <Grid.Col span={6}>
                  <Card>
                    <Title order={4}>System Health</Title>
                    <Text size='sm' color='dimmed' mt='xs'>
                      System health metrics would be displayed here
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card>
                    <Title order={4}>Performance</Title>
                    <Text size='sm' color='dimmed' mt='xs'>
                      Performance metrics would be displayed here
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Modals */}
      <Modal
        opened={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit User' : 'Add User'}
        size='lg'
      >
        <UserForm
          onSubmit={handleUserSubmit}
          onCancel={() => {
            setShowUserForm(false);
            setEditingItem(null);
          }}
          initialData={editingItem as User | undefined}
          isEditing={!!editingItem}
        />
      </Modal>

      <Modal
        opened={showCustomFieldForm}
        onClose={() => {
          setShowCustomFieldForm(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Custom Field' : 'Add Custom Field'}
        size='lg'
      >
        <CustomFieldForm
          onSubmit={handleCustomFieldSubmit}
          onCancel={() => {
            setShowCustomFieldForm(false);
            setEditingItem(null);
          }}
          initialData={(editingItem as CustomField) || undefined}
          isEditing={!!editingItem}
        />
      </Modal>

      <Modal
        opened={showEmailTemplateForm}
        onClose={() => {
          setShowEmailTemplateForm(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Email Template' : 'Add Email Template'}
        size='lg'
      >
        <EmailTemplateForm
          onSubmit={handleEmailTemplateSubmit}
          onCancel={() => {
            setShowEmailTemplateForm(false);
            setEditingItem(null);
          }}
          initialData={editingItem as EmailTemplate}
          isEditing={!!editingItem}
        />
      </Modal>

      <Modal
        opened={showSystemSettingsForm}
        onClose={() => {
          setShowSystemSettingsForm(false);
          setEditingItem(null);
        }}
        title='System Settings'
        size='lg'
      >
        <SystemSettingsForm
          onSubmit={handleSystemSettingsSubmit}
          onCancel={() => {
            setShowSystemSettingsForm(false);
            setEditingItem(null);
          }}
        />
      </Modal>
    </Container>
  );
}
