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
  Textarea,
  Switch,
  Card,
  Stack,
  Pagination,
  Tabs,
  Alert,
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
  IconStar,
  IconUsers,
  IconClock,
  IconFilter,
} from '@tabler/icons-react';
import {
  useSavedSearches,
  useCreateSavedSearch,
  useUpdateSavedSearch,
  useDeleteSavedSearch,
  useExecuteSavedSearch,
  useDuplicateSavedSearch,
  usePopularSearches,
} from '../../../hooks/useSavedSearches';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { SavedSearch, CreateSavedSearchInput } from '../../../types/unified';

export default function SavedSearchesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState<SavedSearch | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('all');

  const { data: savedSearches, isLoading, refetch } = useSavedSearches();
  const { data: popularSearches } = usePopularSearches(10);
  const createSavedSearch = useCreateSavedSearch();
  const updateSavedSearch = useUpdateSavedSearch();
  const deleteSavedSearch = useDeleteSavedSearch();
  const executeSavedSearch = useExecuteSavedSearch();
  const duplicateSavedSearch = useDuplicateSavedSearch();

  const createForm = useForm<CreateSavedSearchInput>({
    initialValues: {
      name: '',
      description: '',
      searchCriteria: '',
      isPublic: false,
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      searchCriteria: (value) => (!value ? 'Search criteria is required' : null),
    },
  });

  const editForm = useForm<CreateSavedSearchInput>({
    initialValues: {
      name: '',
      description: '',
      searchCriteria: '',
      isPublic: false,
    },
  });

  const filteredSearches = savedSearches?.filter((searchItem) =>
    searchItem.name.toLowerCase().includes(search.toLowerCase()) ||
    searchItem.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredSearches.length / pageSize);
  const paginatedSearches = filteredSearches.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCreateSearch = async (values: CreateSavedSearchInput) => {
    try {
      await createSavedSearch.mutateAsync(values);
      notifications.show({
        title: 'Saved Search Created',
        message: 'Saved search has been created successfully',
        color: 'green',
      });
      setCreateModalOpen(false);
      createForm.reset();
      refetch();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create saved search',
        color: 'red',
      });
    }
  };

  const handleEditSearch = async (values: CreateSavedSearchInput) => {
    if (!selectedSearch) return;

    try {
      await updateSavedSearch.mutateAsync({
        id: selectedSearch.id,
        data: values,
      });
      notifications.show({
        title: 'Saved Search Updated',
        message: 'Saved search has been updated successfully',
        color: 'green',
      });
      setEditModalOpen(false);
      setSelectedSearch(null);
      refetch();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update saved search',
        color: 'red',
      });
    }
  };

  const handleDeleteSearch = async () => {
    if (!selectedSearch) return;

    try {
      await deleteSavedSearch.mutateAsync(selectedSearch.id);
      notifications.show({
        title: 'Saved Search Deleted',
        message: 'Saved search has been deleted successfully',
        color: 'green',
      });
      setDeleteModalOpen(false);
      setSelectedSearch(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete saved search',
        color: 'red',
      });
    }
  };

  const handleExecuteSearch = async () => {
    if (!selectedSearch) return;

    try {
      const result = await executeSavedSearch.mutateAsync({
        id: selectedSearch.id,
        page: 1,
        limit: 20,
      });
      notifications.show({
        title: 'Search Executed',
        message: `Found ${result.data.length} results`,
        color: 'green',
      });
      setExecuteModalOpen(false);
      // Navigate to search results
      router.push(`/tickets?search=${encodeURIComponent(selectedSearch.searchCriteria)}`);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to execute saved search',
        color: 'red',
      });
    }
  };

  const handleDuplicateSearch = async () => {
    if (!selectedSearch) return;

    try {
      await duplicateSavedSearch.mutateAsync({
        id: selectedSearch.id,
        name: `${selectedSearch.name} (Copy)`,
      });
      notifications.show({
        title: 'Search Duplicated',
        message: 'Saved search has been duplicated successfully',
        color: 'green',
      });
      refetch();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to duplicate saved search',
        color: 'red',
      });
    }
  };

  const openEditModal = (search: SavedSearch) => {
    setSelectedSearch(search);
    editForm.setValues({
      name: search.name,
      description: search.description || '',
      searchCriteria: search.searchCriteria,
      isPublic: search.isPublic,
    });
    setEditModalOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Saved Searches</Title>
          <Text c="dimmed" size="sm">
            Manage saved search queries
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Saved Search
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
        <Tabs.List>
          <Tabs.Tab value="all" leftSection={<IconSearch size={16} />}>
            All Searches
          </Tabs.Tab>
          <Tabs.Tab value="popular" leftSection={<IconStar size={16} />}>
            Popular
          </Tabs.Tab>
          <Tabs.Tab value="public" leftSection={<IconUsers size={16} />}>
            Public
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="all">
          <Card mt="md">
            <Group justify="space-between" mb="md">
              <Group>
                <TextInput
                  placeholder="Search saved searches..."
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 300 }}
                />
                <Button
                  variant="light"
                  leftSection={<IconFilter size={16} />}
                >
                  Filters
                </Button>
              </Group>
              <ActionIcon
                variant="light"
                onClick={() => refetch()}
                loading={isLoading}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>

            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Visibility</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Updated</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedSearches.map((searchItem) => (
                  <Table.Tr key={searchItem.id}>
                    <Table.Td>
                      <Text fw={500}>{searchItem.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" truncate>
                        {searchItem.description || 'No description'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={searchItem.isPublic ? 'blue' : 'gray'}
                        variant="light"
                        leftSection={searchItem.isPublic ? <IconUsers size={14} /> : <IconClock size={14} />}
                      >
                        {searchItem.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatDate(searchItem.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatDate(searchItem.updatedAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={14} />}
                            onClick={() => {
                              setSelectedSearch(searchItem);
                              setExecuteModalOpen(true);
                            }}
                          >
                            Execute
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => openEditModal(searchItem)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconCopy size={14} />}
                            onClick={() => {
                              setSelectedSearch(searchItem);
                              handleDuplicateSearch();
                            }}
                          >
                            Duplicate
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => {
                              setSelectedSearch(searchItem);
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
              <Group justify="center" mt="md">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                />
              </Group>
            )}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="popular">
          <Card mt="md">
            <Stack>
              <Title order={4}>Popular Searches</Title>
              {popularSearches?.map((popularSearch) => (
                <Card key={popularSearch.id} withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{popularSearch.name}</Text>
                      <Text size="sm" c="dimmed">
                        {popularSearch.description}
                      </Text>
                      <Group gap="xs" mt="xs">
                        <Badge size="sm" color="blue" variant="light">
                          {popularSearch.usageCount} uses
                        </Badge>
                        <Badge size="sm" color="green" variant="light">
                          {popularSearch.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </Group>
                    </div>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => {
                        setSelectedSearch(popularSearch);
                        setExecuteModalOpen(true);
                      }}
                    >
                      Execute
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="public">
          <Card mt="md">
            <Stack>
              <Title order={4}>Public Searches</Title>
              <Text size="sm" c="dimmed">
                Searches shared by other users
              </Text>
              {/* Public searches would be filtered here */}
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Create Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Saved Search"
        size="lg"
      >
        <form onSubmit={createForm.onSubmit(handleCreateSearch)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Search name"
              required
              {...createForm.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Search description"
              {...createForm.getInputProps('description')}
            />
            <Textarea
              label="Search Criteria"
              placeholder="Enter search criteria (JSON format)"
              required
              minRows={4}
              {...createForm.getInputProps('searchCriteria')}
            />
            <Switch
              label="Public Search"
              description="Make this search available to other users"
              {...createForm.getInputProps('isPublic', { type: 'checkbox' })}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createSavedSearch.isPending}>
                Create Search
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Saved Search"
        size="lg"
      >
        <form onSubmit={editForm.onSubmit(handleEditSearch)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Search name"
              required
              {...editForm.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Search description"
              {...editForm.getInputProps('description')}
            />
            <Textarea
              label="Search Criteria"
              placeholder="Enter search criteria (JSON format)"
              required
              minRows={4}
              {...editForm.getInputProps('searchCriteria')}
            />
            <Switch
              label="Public Search"
              description="Make this search available to other users"
              {...editForm.getInputProps('isPublic', { type: 'checkbox' })}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={updateSavedSearch.isPending}>
                Update Search
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Execute Modal */}
      <Modal
        opened={executeModalOpen}
        onClose={() => setExecuteModalOpen(false)}
        title="Execute Saved Search"
      >
        <Stack>
          <Text size="sm" fw={500}>Search: {selectedSearch?.name}</Text>
          <Text size="sm" c="dimmed">{selectedSearch?.description}</Text>
          <Alert color="blue" title="Search Execution">
            This will execute the saved search and show results in the tickets page.
          </Alert>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setExecuteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecuteSearch} loading={executeSavedSearch.isPending}>
              Execute Search
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Saved Search"
      >
        <Stack>
          <Alert color="red" title="Warning">
            Are you sure you want to delete this saved search? This action cannot be undone.
          </Alert>
          <Text size="sm">
            Search: <strong>{selectedSearch?.name}</strong>
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteSearch}
              loading={deleteSavedSearch.isPending}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
