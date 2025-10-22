'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Button,
  Table,
  Group,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
  Select,
  Switch,
  Grid,
  Alert,
  Pagination,
  Stack,
  Card,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconSearch,
  IconRefresh,
  IconEye,
  IconCopy,
} from '@tabler/icons-react';
import {
  useCustomFields,
  useDeleteCustomField,
  useCreateCustomField,
  useUpdateCustomField,
} from '../../../hooks/useCustomFields';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import {
  CustomField,
  CreateCustomFieldInput,
  CustomFieldType,
} from '../../../types/unified';

export default function CustomFieldsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { data: customFields, isLoading, refetch } = useCustomFields();
  const deleteCustomField = useDeleteCustomField();
  const createCustomField = useCreateCustomField();
  const updateCustomField = useUpdateCustomField();

  const createForm = useForm<CreateCustomFieldInput>({
    initialValues: {
      name: '',
      fieldType: CustomFieldType.TEXT,
      isRequired: false,
      options: [],
      isActive: true,
      description: '',
    },
    validate: {
      name: (value: string) => (!value ? 'Name is required' : null),
      fieldType: (value: string) => (!value ? 'Type is required' : null),
    },
  });

  const editForm = useForm<CreateCustomFieldInput>({
    initialValues: {
      name: '',
      fieldType: CustomFieldType.TEXT,
      isRequired: false,
      options: [],
      isActive: true,
      description: '',
    },
  });

  const filteredFields =
    customFields?.filter(field => {
      const matchesSearch = field.name.toLowerCase().includes(search.toLowerCase()) ||
        (field.description && field.description.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    }) || [];

  const totalPages = Math.ceil(filteredFields.length / pageSize);
  const paginatedFields = filteredFields.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCreateField = async (values: CreateCustomFieldInput) => {
    try {
      await createCustomField.mutateAsync(values);
      notifications.show({
        title: 'Field Added to Ticket Form',
        message: 'Custom field has been added to the ticket creation form',
        color: 'green',
      });
      setCreateModalOpen(false);
      createForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create custom field',
        color: 'red',
      });
    }
  };

  const handleEditField = async (values: CreateCustomFieldInput) => {
    if (!selectedField) return;
    
    try {
      await updateCustomField.mutateAsync({
        id: selectedField.id,
        data: values,
      });
      notifications.show({
        title: 'Ticket Form Field Updated',
        message: 'Custom field has been updated in the ticket creation form',
        color: 'green',
      });
      setEditModalOpen(false);
      setSelectedField(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update custom field',
        color: 'red',
      });
    }
  };

  const handleDeleteField = async () => {
    if (!selectedField) return;

    try {
      await deleteCustomField.mutateAsync(selectedField.id);
      notifications.show({
        title: 'Field Removed from Ticket Form',
        message: 'Custom field has been removed from the ticket creation form',
        color: 'green',
      });
      setDeleteModalOpen(false);
      setSelectedField(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete custom field',
        color: 'red',
      });
    }
  };

  const openEditModal = (field: CustomField) => {
    setSelectedField(field);
    editForm.setValues({
      name: field.name,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      options: field.options || [],
      isActive: field.isActive,
      description: field.description || '',
    });
    setEditModalOpen(true);
  };

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT':
        return 'blue';
      case 'NUMBER':
        return 'green';
      case 'SELECT':
        return 'orange';
      case 'MULTI_SELECT':
        return 'purple';
      case 'DATE':
        return 'cyan';
      case 'BOOLEAN':
        return 'pink';
      default:
        return 'gray';
    }
  };

  const fieldTypeOptions = [
    { value: CustomFieldType.TEXT, label: 'Text' },
    { value: CustomFieldType.NUMBER, label: 'Number' },
    { value: CustomFieldType.SELECT, label: 'Select' },
    { value: CustomFieldType.DATE, label: 'Date' },
    { value: CustomFieldType.BOOLEAN, label: 'Boolean' },
  ];

  return (
    <Container size='xl' py='md'>
        <Group justify='space-between' mb='xl'>
          <div>
            <Title order={2}>Ticket Creation Fields</Title>
            <Text c='dimmed' size='sm'>
              Manage custom fields that appear in the ticket creation form
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Field to Ticket Form
          </Button>
        </Group>

        <Alert color='blue' mb='md'>
          <Text size='sm'>
            <strong>How it works:</strong> All custom fields you create will appear in the ticket creation form for all users. 
            Changes here are immediately reflected in the ticket creation form - no refresh needed!
          </Text>
        </Alert>

      <Card>
        <Group justify='space-between' mb='md'>
          <Group>
            <TextInput
              placeholder='Search custom fields...'
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 300 }}
            />
          </Group>
          <Group>
            <ActionIcon
              variant='light'
              onClick={() => refetch()}
              loading={isLoading}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Field Name</Table.Th>
              <Table.Th>Field Type</Table.Th>
              <Table.Th>Required</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedFields.map(field => (
              <Table.Tr key={field.id}>
                <Table.Td>
                  <div>
                    <Text fw={500}>{field.name}</Text>
                    {field.description && (
                      <Text size='xs' c='dimmed' mt={2}>
                        {field.description}
                      </Text>
                    )}
                  </div>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={getFieldTypeColor(field.fieldType)}
                    variant='light'
                  >
                    {field.fieldType}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={field.isRequired ? 'red' : 'gray'}
                    variant='light'
                  >
                    {field.isRequired ? 'Required' : 'Optional'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={field.isActive ? 'green' : 'red'}
                    variant='light'
                  >
                    {field.isActive ? 'Shown in Form' : 'Hidden from Form'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size='sm' c='dimmed'>
                    {new Date(field.createdAt).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon variant='subtle'>
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEye size={14} />}
                        onClick={() =>
                          router.push(`/admin/custom-fields/${field.id}`)
                        }
                      >
                        View Details
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() => openEditModal(field)}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconCopy size={14} />}
                        onClick={() => {
                          // Implement duplicate functionality
                        }}
                      >
                        Duplicate
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconEye size={14} />}
                        onClick={async () => {
                          try {
                            await updateCustomField.mutateAsync({
                              id: field.id,
                              data: { isActive: !field.isActive },
                            });
                            notifications.show({
                              title: 'Ticket Form Field Updated',
                              message: `Field ${field.isActive ? 'hidden from' : 'shown in'} ticket creation form`,
                              color: 'green',
                            });
                          } catch (error) {
                            notifications.show({
                              title: 'Error',
                              message: 'Failed to update field status',
                              color: 'red',
                            });
                          }
                        }}
                      >
                        {field.isActive ? 'Hide from Ticket Form' : 'Show in Ticket Form'}
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color='red'
                        onClick={() => {
                          setSelectedField(field);
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

        {totalPages > 1 && (
          <Group justify='center' mt='md'>
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
            />
          </Group>
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title='Add Field to Ticket Form'
        size='lg'
      >
        <form onSubmit={createForm.onSubmit(handleCreateField)}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label='Name'
                  placeholder='field_name'
                  required
                  {...createForm.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label='Type'
                  placeholder='Select field type'
                  required
                  data={fieldTypeOptions}
                  {...createForm.getInputProps('fieldType')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label='Field Description'
              placeholder='Help text shown to users when creating tickets (optional)'
              {...createForm.getInputProps('description')}
            />

            <Grid>
              <Grid.Col span={6}>
                <Switch
                  label='Required'
                  {...createForm.getInputProps('isRequired', {
                    type: 'checkbox',
                  })}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Switch
                  label='Active'
                  {...createForm.getInputProps('isActive', {
                    type: 'checkbox',
                  })}
                />
              </Grid.Col>
            </Grid>

            <Group justify='flex-end' mt='md'>
              <Button variant='light' onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' loading={createCustomField.isPending}>
                Add to Ticket Form
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title='Edit Ticket Form Field'
        size='lg'
      >
        <form onSubmit={editForm.onSubmit(handleEditField)}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label='Name'
                  placeholder='field_name'
                  required
                  {...editForm.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label='Type'
                  placeholder='Select field type'
                  required
                  data={fieldTypeOptions}
                  {...editForm.getInputProps('fieldType')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label='Field Description'
              placeholder='Help text shown to users when creating tickets (optional)'
              {...editForm.getInputProps('description')}
            />

            <Grid>
              <Grid.Col span={6}>
                <Switch
                  label='Required'
                  {...editForm.getInputProps('isRequired', {
                    type: 'checkbox',
                  })}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Switch
                  label='Active'
                  {...editForm.getInputProps('isActive', { type: 'checkbox' })}
                />
              </Grid.Col>
            </Grid>

            <Group justify='flex-end' mt='md'>
              <Button variant='light' onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' loading={updateCustomField.isPending}>
                Update Ticket Form Field
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title='Remove Field from Ticket Form'
      >
        <Stack>
          <Alert color='red' title='Warning'>
            Are you sure you want to remove this field from the ticket creation form? 
            This action cannot be undone and the field will no longer appear when users create tickets.
          </Alert>
          <Text size='sm'>
            Field: <strong>{selectedField?.name}</strong>
          </Text>
          <Group justify='flex-end' mt='md'>
            <Button variant='light' onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color='red'
              onClick={handleDeleteField}
              loading={deleteCustomField.isPending}
            >
              Remove from Ticket Form
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
