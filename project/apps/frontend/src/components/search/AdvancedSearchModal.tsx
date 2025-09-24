'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Modal,
  Stack,
  TextInput,
  MultiSelect,
  Button,
  Group,
  Text,
  Divider,
  ActionIcon,
  Badge,
  Paper,
  Tabs,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconSearch,
  IconFilter,
  IconX,
  IconPlus,
  IconBookmark,
} from '@tabler/icons-react';
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  SearchCriteria,
  SavedSearch,
} from '../../types/unified';

interface AdvancedSearchModalProps {
  opened: boolean;
  onClose: () => void;
  onSearch: (filters: SearchCriteria) => void;
  initialFilters?: Partial<SearchCriteria>;
}

export function AdvancedSearchModal({
  opened,
  onClose,
  onSearch,
  initialFilters = {},
}: AdvancedSearchModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string | null>('filters');
  const [filters, setFilters] = useState<SearchCriteria>({
    search: '',
    status: [],
    priority: [],
    category: [],
    impact: [],
    urgency: [],
    slaLevel: [],
    assignedTo: [],
    requester: [],
    dateFrom: null,
    dateTo: null,
    tags: [],
    customFields: {},
    ...initialFilters,
  });
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchName, setSearchName] = useState('');

  const statusOptions = Object.values(TicketStatus).map(status => ({
    value: status,
    label: status.replace('_', ' '),
  }));

  const priorityOptions = Object.values(TicketPriority).map(priority => ({
    value: priority,
    label: priority,
  }));

  const categoryOptions = Object.values(TicketCategory).map(category => ({
    value: category,
    label: category.replace('_', ' '),
  }));

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleSaveSearch = () => {
    if (!searchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      description: '',
      searchCriteria: JSON.stringify({ ...filters }),
      userId: session?.user?.id || '',
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedSearches(prev => [...prev, newSearch]);
    setSearchName('');
  };

  const handleLoadSearch = (search: SavedSearch) => {
    const searchCriteria = JSON.parse(search.searchCriteria) as SearchCriteria;
    setFilters(searchCriteria);
    setActiveTab('filters');
  };

  const handleDeleteSearch = (searchId: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== searchId));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      category: [],
      impact: [],
      urgency: [],
      slaLevel: [],
      assignedTo: [],
      requester: [],
      dateFrom: null,
      dateTo: null,
      tags: [],
      customFields: {},
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title='Advanced Search'
      size='lg'
      centered
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value='filters' leftSection={<IconFilter size={16} />}>
            Filters
          </Tabs.Tab>
          <Tabs.Tab value='saved' leftSection={<IconBookmark size={16} />}>
            Saved Searches
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='filters' pt='md'>
          <Stack gap='md'>
            <TextInput
              label='Search Text'
              placeholder='Search in title, description, comments...'
              leftSection={<IconSearch size={16} />}
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
            />

            <Group grow>
              <MultiSelect
                label='Status'
                placeholder='Select statuses'
                data={statusOptions}
                value={filters.status}
                onChange={value =>
                  setFilters(prev => ({ ...prev, status: value }))
                }
                clearable
              />
              <MultiSelect
                label='Priority'
                placeholder='Select priorities'
                data={priorityOptions}
                value={filters.priority}
                onChange={value =>
                  setFilters(prev => ({ ...prev, priority: value }))
                }
                clearable
              />
            </Group>

            <Group grow>
              <MultiSelect
                label='Category'
                placeholder='Select categories'
                data={categoryOptions}
                value={filters.category}
                onChange={value =>
                  setFilters(prev => ({ ...prev, category: value }))
                }
                clearable
              />
              <MultiSelect
                label='Assigned To'
                placeholder='Select assignees'
                data={[
                  { value: 'user1', label: 'John Doe' },
                  { value: 'user2', label: 'Jane Smith' },
                ]}
                value={filters.assignedTo}
                onChange={value =>
                  setFilters(prev => ({ ...prev, assignedTo: value }))
                }
                clearable
                searchable
              />
            </Group>

            <Group grow>
              <DateInput
                label='Date From'
                placeholder='Select start date'
                value={filters.dateFrom}
                onChange={value =>
                  setFilters(prev => ({ ...prev, dateFrom: value }))
                }
                clearable
              />
              <DateInput
                label='Date To'
                placeholder='Select end date'
                value={filters.dateTo}
                onChange={value =>
                  setFilters(prev => ({ ...prev, dateTo: value }))
                }
                clearable
              />
            </Group>

            <Divider />

            <Group justify='space-between'>
              <Button variant='outline' onClick={clearFilters}>
                Clear All
              </Button>
              <Group>
                <Button onClick={handleSearch}>Search</Button>
              </Group>
            </Group>

            <Paper withBorder p='md'>
              <Group justify='space-between' mb='sm'>
                <Text fw={500}>Save Search</Text>
                <ActionIcon variant='subtle' size='sm'>
                  <IconPlus size={14} />
                </ActionIcon>
              </Group>
              <Group>
                <TextInput
                  placeholder='Search name'
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  size='sm'
                  onClick={handleSaveSearch}
                  disabled={!searchName.trim()}
                >
                  Save
                </Button>
              </Group>
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value='saved' pt='md'>
          <Stack gap='md'>
            {savedSearches.length === 0 ? (
              <Text c='dimmed' ta='center' py='xl'>
                No saved searches yet. Create your first search above!
              </Text>
            ) : (
              savedSearches.map(search => (
                <Paper key={search.id} withBorder p='md'>
                  <Group justify='space-between' mb='sm'>
                    <Group>
                      <Text fw={500}>{search.name}</Text>
                      {!search.isPublic && (
                        <Badge size='xs' color='blue'>
                          Default
                        </Badge>
                      )}
                    </Group>
                    <Group gap='xs'>
                      <ActionIcon
                        variant='subtle'
                        size='sm'
                        onClick={() => handleLoadSearch(search)}
                      >
                        <IconSearch size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant='subtle'
                        size='sm'
                        color='red'
                        onClick={() => handleDeleteSearch(search.id)}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text size='sm' c='dimmed'>
                    Created {new Date(search.createdAt).toLocaleDateString()}
                  </Text>
                  <Group gap='xs' mt='sm'>
                    {(() => {
                      try {
                        const criteria = JSON.parse(search.searchCriteria) as SearchCriteria;
                        return (
                          <>
                            {criteria.status?.length && criteria.status.length > 0 && (
                              <Badge size='xs' variant='light'>
                                {criteria.status.length} status
                                {criteria.status.length > 1 ? 'es' : ''}
                              </Badge>
                            )}
                            {criteria.priority?.length && criteria.priority.length > 0 && (
                              <Badge size='xs' variant='light'>
                                {criteria.priority.length} priorit
                                {criteria.priority.length > 1 ? 'ies' : 'y'}
                              </Badge>
                            )}
                            {criteria.category?.length && criteria.category.length > 0 && (
                              <Badge size='xs' variant='light'>
                                {criteria.category.length} categor
                                {criteria.category.length > 1 ? 'ies' : 'y'}
                              </Badge>
                            )}
                          </>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                  </Group>
                </Paper>
              ))
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
