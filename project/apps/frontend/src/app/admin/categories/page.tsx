'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
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
  Textarea,
  Switch,
} from '@mantine/core';
import {
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconClipboardList,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../../../hooks/useCategories';
import { Category } from '../../../../types/unified';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: categories, isLoading, error } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const createForm = useForm({
    initialValues: {
      name: '',
      description: '',
      isActive: true,
    },
    validate: {
      name: value => (!value ? 'Name is required' : null),
    },
  });

  const editForm = useForm({
    initialValues: {
      name: '',
      description: '',
      isActive: true,
    },
    validate: {
      name: value => (!value ? 'Name is required' : null),
    },
  });

  const handleCreateCategory = async (values: typeof createForm.values) => {
    try {
      await createCategoryMutation.mutateAsync(values);
      notifications.show({
        title: 'Success',
        message: 'Category created successfully',
        color: 'green',
      });
      setCreateModalOpen(false);
      createForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create category',
        color: 'red',
      });
    }
  };

  const handleUpdateCategory = async (values: typeof editForm.values) => {
    if (!selectedCategory) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: selectedCategory.id,
        data: values,
      });
      notifications.show({
        title: 'Success',
        message: 'Category updated successfully',
        color: 'green',
      });
      setEditModalOpen(false);
      setSelectedCategory(null);
      editForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update category',
        color: 'red',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      notifications.show({
        title: 'Success',
        message: 'Category deleted successfully',
        color: 'green',
      });
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete category',
        color: 'red',
      });
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    editForm.setValues({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
    setEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <Container size='xl' py='md'>
        <Group justify='center' mt='xl'>
          <Loader size='lg' />
          <Text>Loading categories...</Text>
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size='xl' py='md'>
        <Alert icon={<IconAlertCircle size={16} />} title='Error' color='red'>
          Failed to load categories: {String(error)}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size='xl' py='md'>
      <Group justify='space-between' mb='xl'>
        <div>
          <Title order={1}>Categories</Title>
          <Text c='dimmed'>Manage ticket categories and subcategories</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModalOpen(true)}
        >
          Add Category
        </Button>
      </Group>

      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {categories?.map((category: Category) => (
              <Table.Tr key={category.id}>
                <Table.Td>
                  <Group gap='sm'>
                    <IconClipboardList size={16} />
                    <Text fw={500}>{category.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size='sm' c='dimmed'>
                    {category.description || 'No description'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={category.isActive ? 'green' : 'red'}
                    variant='light'
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size='sm'>
                    {new Date(category.createdAt).toLocaleDateString()}
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
                        onClick={() => {
                          // View category details
                        }}
                      >
                        View Details
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() => openEditModal(category)}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color='red'
                        onClick={() => {
                          setSelectedCategory(category);
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

      {categories && categories.length === 0 && (
        <Card shadow='sm' padding='xl' radius='md' withBorder mt='md'>
          <Stack align='center' gap='md'>
            <IconClipboardList size={48} color='var(--mantine-color-dimmed)' />
            <Text size='lg' fw={500}>
              No categories found
            </Text>
            <Text c='dimmed' ta='center'>
              Create your first category to organize tickets.
            </Text>
            <Button onClick={() => setCreateModalOpen(true)}>
              Create Category
            </Button>
          </Stack>
        </Card>
      )}

      {/* Create Category Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title='Create New Category'
        centered
      >
        <form onSubmit={createForm.onSubmit(handleCreateCategory)}>
          <Stack gap='md'>
            <TextInput
              label='Category Name'
              placeholder='Enter category name'
              required
              {...createForm.getInputProps('name')}
            />
            <Textarea
              label='Description'
              placeholder='Enter category description (optional)'
              {...createForm.getInputProps('description')}
            />
            <Switch
              label='Active'
              description='Category is available for use'
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
                loading={createCategoryMutation.isPending}
              >
                Create Category
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title='Edit Category'
        centered
      >
        <form onSubmit={editForm.onSubmit(handleUpdateCategory)}>
          <Stack gap='md'>
            <TextInput
              label='Category Name'
              placeholder='Enter category name'
              required
              {...editForm.getInputProps('name')}
            />
            <Textarea
              label='Description'
              placeholder='Enter category description (optional)'
              {...editForm.getInputProps('description')}
            />
            <Switch
              label='Active'
              description='Category is available for use'
              {...editForm.getInputProps('isActive', { type: 'checkbox' })}
            />
            <Group justify='flex-end'>
              <Button
                variant='outline'
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                loading={updateCategoryMutation.isPending}
              >
                Update Category
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title='Delete Category'
        centered
      >
        <Stack gap='md'>
          <Text>
            Are you sure you want to delete category "{selectedCategory?.name}"?
            This action cannot be undone and may affect existing tickets.
          </Text>
          <Group justify='flex-end'>
            <Button
              variant='outline'
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color='red'
              onClick={() =>
                selectedCategory?.id && handleDeleteCategory(selectedCategory.id)
              }
              loading={deleteCategoryMutation.isPending}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
