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
  IconFilter,
  IconRefresh,
  IconEye,
  IconCopy,
} from '@tabler/icons-react';
import {
  useCustomFields,
  useDeleteCustomField,
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

  const createForm = useForm<CreateCustomFieldInput>({
    initialValues: {
      name: '',
      fieldType: CustomFieldType.TEXT,
      isRequired: false,
      options: [],
      isActive: true,
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
    },
  });

  const filteredFields =
    customFields?.filter(field =>
      field.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const totalPages = Math.ceil(filteredFields.length / pageSize);
  const paginatedFields = filteredFields.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCreateField = () => {
    // This would be implemented with the actual create mutation
    notifications.show({
      title: 'Custom Field Created',
      message: 'Custom field has been created successfully',
      color: 'green',
    });
    setCreateModalOpen(false);
    createForm.reset();
    refetch();
  };

  const handleEditField = () => {
    // This would be implemented with the actual update mutation
    notifications.show({
      title: 'Custom Field Updated',
      message: 'Custom field has been updated successfully',
      color: 'green',
    });
    setEditModalOpen(false);
    setSelectedField(null);
    refetch();
  };

  const handleDeleteField = async () => {
    if (!selectedField) return;

    try {
      await deleteCustomField.mutateAsync(selectedField.id);
      notifications.show({
        title: 'Custom Field Deleted',
        message: 'Custom field has been deleted successfully',
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
          <Title order={2}>Custom Fields Management</Title>
          <Text c='dimmed' size='sm'>
            Manage custom fields for tickets
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Custom Field
        </Button>
      </Group>

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
            <Button variant='light' leftSection={<IconFilter size={16} />}>
              Filters
            </Button>
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
              <Table.Th>Name</Table.Th>
              <Table.Th>Type</Table.Th>
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
                  <Text fw={500}>{field.name}</Text>
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
                    {field.isActive ? 'Active' : 'Inactive'}
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
        title='Create Custom Field'
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
              <Button type='submit'>Create Field</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title='Edit Custom Field'
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
              <Button type='submit'>Update Field</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title='Delete Custom Field'
      >
        <Stack>
          <Alert color='red' title='Warning'>
            Are you sure you want to delete this custom field? This action
            cannot be undone.
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
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
