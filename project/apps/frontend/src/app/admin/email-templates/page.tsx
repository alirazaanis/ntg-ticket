'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Grid,
  Card,
  Badge,
  Stack,
  Loader,
  Alert,
  Table,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
  Switch,
  Select,
  Tabs,
} from '@mantine/core';
import { RichTextEditorComponent } from '../../../components/ui/RichTextEditor';
import {
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconMail,
  IconAlertCircle,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  usePreviewEmailTemplate,
} from '../../../hooks/useEmailTemplates';
import { EmailTemplate, EmailTemplateType } from '../../../types/unified';

const templateTypeColors: Record<EmailTemplateType, string> = {
  [EmailTemplateType.TICKET_CREATED]: 'blue',
  [EmailTemplateType.TICKET_ASSIGNED]: 'green',
  [EmailTemplateType.STATUS_CHANGED]: 'orange',
  [EmailTemplateType.COMMENT_ADDED]: 'purple',
  [EmailTemplateType.SLA_WARNING]: 'red',
  [EmailTemplateType.AUTO_CLOSE_WARNING]: 'yellow',
};

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('list');

  const { data: templates, isLoading, error } = useEmailTemplates();
  const createTemplateMutation = useCreateEmailTemplate();
  const updateTemplateMutation = useUpdateEmailTemplate();
  const deleteTemplateMutation = useDeleteEmailTemplate();
  const previewTemplateMutation = usePreviewEmailTemplate();

  const createForm = useForm({
    initialValues: {
      name: '',
      subject: '',
      html: '',
      type: EmailTemplateType.TICKET_CREATED,
      isActive: true,
      variables: [] as string[],
    },
    validate: {
      name: value => (!value ? 'Name is required' : null),
      subject: value => (!value ? 'Subject is required' : null),
      html: value => (!value ? 'HTML content is required' : null),
    },
  });

  const editForm = useForm({
    initialValues: {
      name: '',
      subject: '',
      html: '',
      type: EmailTemplateType.TICKET_CREATED,
      isActive: true,
      variables: [] as string[],
    },
    validate: {
      name: value => (!value ? 'Name is required' : null),
      subject: value => (!value ? 'Subject is required' : null),
      html: value => (!value ? 'HTML content is required' : null),
    },
  });

  const handleCreateTemplate = async (values: typeof createForm.values) => {
    try {
      await createTemplateMutation.mutateAsync(values);
      notifications.show({
        title: 'Success',
        message: 'Email template created successfully',
        color: 'green',
      });
      setCreateModalOpen(false);
      createForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create email template',
        color: 'red',
      });
    }
  };

  const handleUpdateTemplate = async (values: typeof editForm.values) => {
    if (!selectedTemplate) return;

    try {
      await updateTemplateMutation.mutateAsync({
        id: selectedTemplate.id,
        data: values,
      });
      notifications.show({
        title: 'Success',
        message: 'Email template updated successfully',
        color: 'green',
      });
      setEditModalOpen(false);
      setSelectedTemplate(null);
      editForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update email template',
        color: 'red',
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplateMutation.mutateAsync(templateId);
      notifications.show({
        title: 'Success',
        message: 'Email template deleted successfully',
        color: 'green',
      });
      setDeleteModalOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete email template',
        color: 'red',
      });
    }
  };

  const handlePreviewTemplate = async (template: EmailTemplate) => {
    try {
      const previewData = {
        user: { name: 'John Doe', email: 'john@example.com' },
        ticket: {
          ticketNumber: 'TKT-001',
          title: 'Sample Ticket',
          priority: 'HIGH',
          status: 'OPEN',
          category: 'SOFTWARE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          url: 'https://example.com/tickets/TKT-001',
        },
        assignee: { name: 'Jane Smith', email: 'jane@example.com' },
        requester: { name: 'John Doe', email: 'john@example.com' },
      };

      await previewTemplateMutation.mutateAsync({
        id: template.id,
        variables: previewData,
      });
      setSelectedTemplate(template);
      setPreviewModalOpen(true);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to preview email template',
        color: 'red',
      });
    }
  };

  const openEditModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    editForm.setValues({
      name: template.name,
      subject: template.subject,
      html: template.html,
      type: template.type,
      isActive: template.isActive,
      variables: template.variables,
    });
    setEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <Container size='xl' py='md'>
        <Group justify='center' mt='xl'>
          <Loader size='lg' />
          <Text>Loading email templates...</Text>
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size='xl' py='md'>
        <Alert icon={<IconAlertCircle size={16} />} title='Error' color='red'>
          Failed to load email templates: {String(error)}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size='xl' py='md'>
      <Group justify='space-between' mb='xl'>
        <div>
          <Title order={1}>Email Templates</Title>
          <Text c='dimmed'>Manage email notification templates</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModalOpen(true)}
        >
          Add Template
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value='list'>Templates</Tabs.Tab>
          <Tabs.Tab value='preview'>Preview</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='list' pt='md'>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Subject</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {templates?.map((template: EmailTemplate) => (
                  <Table.Tr key={template.id}>
                    <Table.Td>
                      <Group gap='sm'>
                        <IconMail size={16} />
                        <Text fw={500}>{template.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={templateTypeColors[template.type]}
                        variant='light'
                      >
                        {template.type.replace('_', ' ')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size='sm' c='dimmed'>
                        {template.subject}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={template.isActive ? 'green' : 'red'}
                        variant='light'
                      >
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size='sm'>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow='md' width={200}>
                        <Menu.Target>
                          <ActionIcon variant='subtle'>
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={14} />}
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            Preview
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => openEditModal(template)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color='red'
                            onClick={() => {
                              setSelectedTemplate(template);
                              setDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>

          {templates && templates.length === 0 && (
            <Card shadow='sm' padding='xl' radius='md' withBorder mt='md'>
              <Stack align='center' gap='md'>
                <IconMail size={48} color='var(--mantine-color-dimmed)' />
                <Text size='lg' fw={500}>
                  No email templates found
                </Text>
                <Text c='dimmed' ta='center'>
                  Create your first email template to customize notifications.
                </Text>
                <Button onClick={() => setCreateModalOpen(true)}>
                  Create Template
                </Button>
              </Stack>
            </Card>
          )}
        </Tabs.Panel>

        <Tabs.Panel value='preview' pt='md'>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Title order={3} mb='md'>
              Template Preview
            </Title>
            <Text c='dimmed'>
              Select a template from the list to preview it here.
            </Text>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Create Template Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title='Create Email Template'
        size='lg'
        centered
      >
        <form onSubmit={createForm.onSubmit(handleCreateTemplate)}>
          <Stack gap='md'>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label='Template Name'
                  placeholder='Enter template name'
                  required
                  {...createForm.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label='Template Type'
                  placeholder='Select type'
                  required
                  data={Object.values(EmailTemplateType).map(type => ({
                    value: type as string,
                    label: (type as string).replace('_', ' '),
                  }))}
                  {...createForm.getInputProps('type')}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label='Subject'
              placeholder='Enter email subject'
              required
              {...createForm.getInputProps('subject')}
            />
            <RichTextEditorComponent
              label='HTML Content'
              placeholder='Enter HTML content with variables like {{user.name}}'
              required
              minHeight={300}
              maxHeight={500}
              value={createForm.values.html}
              onChange={(value: string) =>
                createForm.setFieldValue('html', value)
              }
              error={createForm.errors.html}
              allowImageUpload={false}
              allowTableInsertion={true}
              allowCodeBlocks={true}
              allowHeadings={true}
              allowLists={true}
              allowTextFormatting={true}
              allowTextAlignment={true}
              allowTextColor={true}
              allowHighlight={true}
              allowLinks={true}
              allowUndoRedo={true}
              allowClearFormatting={true}
              showToolbar={true}
              toolbarPosition='top'
            />
            <Switch
              label='Active'
              description='Template is available for use'
              {...createForm.getInputProps('isActive', { type: 'checkbox' })}
            />
            <Group justify='flex-end'>
              <Button
                variant='outline'
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                loading={createTemplateMutation.isPending}
                leftSection={<IconDeviceFloppy size={16} />}
              >
                Create Template
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title='Edit Email Template'
        size='lg'
        centered
      >
        <form onSubmit={editForm.onSubmit(handleUpdateTemplate)}>
          <Stack gap='md'>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label='Template Name'
                  placeholder='Enter template name'
                  required
                  {...editForm.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label='Template Type'
                  placeholder='Select type'
                  required
                  data={Object.values(EmailTemplateType).map(type => ({
                    value: type as string,
                    label: (type as string).replace('_', ' '),
                  }))}
                  {...editForm.getInputProps('type')}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label='Subject'
              placeholder='Enter email subject'
              required
              {...editForm.getInputProps('subject')}
            />
            <RichTextEditorComponent
              label='HTML Content'
              placeholder='Enter HTML content with variables like {{user.name}}'
              required
              minHeight={300}
              maxHeight={500}
              value={editForm.values.html}
              onChange={(value: string) =>
                editForm.setFieldValue('html', value)
              }
              error={editForm.errors.html}
              allowImageUpload={false}
              allowTableInsertion={true}
              allowCodeBlocks={true}
              allowHeadings={true}
              allowLists={true}
              allowTextFormatting={true}
              allowTextAlignment={true}
              allowTextColor={true}
              allowHighlight={true}
              allowLinks={true}
              allowUndoRedo={true}
              allowClearFormatting={true}
              showToolbar={true}
              toolbarPosition='top'
            />
            <Switch
              label='Active'
              description='Template is available for use'
              {...editForm.getInputProps('isActive', { type: 'checkbox' })}
            />
            <Group justify='flex-end'>
              <Button variant='outline' onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type='submit'
                loading={updateTemplateMutation.isPending}
                leftSection={<IconDeviceFloppy size={16} />}
              >
                Update Template
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Preview Template Modal */}
      <Modal
        opened={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title='Email Template Preview'
        size='lg'
        centered
      >
        {selectedTemplate && (
          <Stack gap='md'>
            <Text fw={500}>Subject: {selectedTemplate.subject}</Text>
            <div
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: 'var(--mantine-radius-md)',
                padding: 'var(--mantine-spacing-md)',
                backgroundColor: 'var(--mantine-color-gray-0)',
              }}
              dangerouslySetInnerHTML={{ __html: selectedTemplate.html }}
            />
          </Stack>
        )}
      </Modal>

      {/* Delete Template Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title='Delete Email Template'
        centered
      >
        <Stack gap='md'>
          <Text>
            Are you sure you want to delete template "{selectedTemplate?.name}"?
            This action cannot be undone.
          </Text>
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color='red'
              onClick={() =>
                selectedTemplate?.id &&
                handleDeleteTemplate(selectedTemplate.id)
              }
              loading={deleteTemplateMutation.isPending}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
