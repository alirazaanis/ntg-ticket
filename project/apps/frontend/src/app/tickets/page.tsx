'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  Pagination,
  Loader,
  Alert,
  Tabs,
  ActionIcon,
  Menu,
  Modal,
} from '@mantine/core';
import {
  IconPlus,
  IconFilter,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconTicket,
  IconCalendar,
  IconUser,
  IconAlertCircle,
  IconX,
} from '@tabler/icons-react';
import {
  useTicketsWithPagination,
  useAllTicketsForCounting,
  useTotalTicketsCount,
  useDeleteTicket,
} from '../../hooks/useTickets';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  TicketStatus,
  TicketPriority,
  Ticket,
  TicketFilters,
} from '../../types/unified';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { AdvancedSearchModal } from '../../components/search/AdvancedSearchModal';
import { SimpleFiltersModal } from '../../components/forms/SimpleFiltersModal';
import { SearchBar } from '../../components/search/SearchBar';
import { useSearch } from '../../hooks/useSearch';
import { BulkActionsBar } from '../../components/bulk/BulkActionsBar';
import { BulkSelectCheckbox } from '../../components/bulk/BulkSelectCheckbox';
import { useBulkOperations } from '../../hooks/useBulkOperations';
import { PAGINATION_CONFIG } from '../../lib/constants';

const statusColors: Record<TicketStatus, string> = {
  NEW: 'blue',
  OPEN: 'green',
  IN_PROGRESS: 'yellow',
  ON_HOLD: 'orange',
  RESOLVED: 'gray',
  CLOSED: 'dark',
  REOPENED: 'purple',
};

const priorityColors: Record<TicketPriority, string> = {
  LOW: 'green',
  MEDIUM: 'yellow',
  HIGH: 'orange',
  CRITICAL: 'red',
};

export default function TicketsPage() {
  const t = useTranslations('tickets');
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [simpleFiltersOpen, setSimpleFiltersOpen] = useState(false);

  const {
    filters: searchFilters,
    recentSearches,
    updateFilters,
    clearFilters,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
    getSearchQuery,
    hasActiveFilters,
  } = useSearch();

  const {
    selectedTickets,
    toggleTicket,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    bulkUpdate,
    isProcessing,
  } = useBulkOperations();

  const searchQuery = getSearchQuery() as TicketFilters;
  const ticketsQuery = {
    ...searchQuery,
    page: currentPage,
    limit: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE, // 2 tickets per page
    // Add activeTab filter for backend filtering
    ...(activeTab === 'my' && { requesterId: [user?.id] }),
    ...(activeTab === 'assigned' && { assignedToId: [user?.id] }),
    ...(activeTab === 'open' && {
      status: ['NEW', 'OPEN', 'IN_PROGRESS'] as TicketStatus[],
    }),
    ...(activeTab === 'onhold' && {
      status: ['ON_HOLD'] as TicketStatus[],
    }),
    // Note: Overdue filtering is handled client-side since backend doesn't support dueDate filtering
    // ...(activeTab === 'overdue' && {
    //   status: [...STATUS_FILTERS.ACTIVE] as TicketStatus[],
    // }),
  };

  // Reset to page 1 when search filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery.search, activeTab]);

  // Clear selection when switching tabs
  React.useEffect(() => {
    clearSelection();
  }, [activeTab, clearSelection]);

  // Clear selection when switching pages
  React.useEffect(() => {
    clearSelection();
  }, [currentPage, clearSelection]);

  const {
    data: ticketsData,
    isLoading,
    error,
    isFetching,
  } = useTicketsWithPagination(ticketsQuery);

  // Get all tickets for counting (without pagination)
  const { data: allTicketsForCounting } = useAllTicketsForCounting(searchQuery);

  // Get total count of all tickets (no filters)
  const { data: totalTicketsCount } = useTotalTicketsCount();

  // Extract tickets and pagination from the response
  const tickets = ticketsData?.tickets || [];
  const pagination = ticketsData?.pagination;
  const allTickets = allTicketsForCounting || [];

  const deleteTicketMutation = useDeleteTicket();

  const handleCreateTicket = () => {
    router.push('/tickets/create');
  };

  const handleViewTicket = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  const handleEditTicket = (ticketId: string) => {
    router.push(`/tickets/${ticketId}/edit`);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicketMutation.mutateAsync(ticketId);
      notifications.show({
        title: 'Success',
        message: 'Ticket deleted successfully',
        color: 'green',
      });
      setDeleteModalOpen(false);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete ticket',
        color: 'red',
      });
    }
  };

  // Backend handles filtering and pagination, but overdue needs client-side filtering
  let filteredTickets = tickets;

  // Client-side filtering for overdue tickets
  if (activeTab === 'overdue') {
    filteredTickets = tickets.filter(
      ticket =>
        ticket.dueDate &&
        new Date(ticket.dueDate) < new Date() &&
        !['RESOLVED', 'CLOSED'].includes(ticket.status)
    );
  }

  if (isLoading) {
    return (
      <Container size='xl' py='md'>
        <Group justify='center' mt='xl'>
          <Loader size='lg' />
          <Text>Loading tickets...</Text>
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size='xl' py='md'>
        <Alert icon={<IconAlertCircle size={16} />} title='Error' color='red'>
          Failed to load tickets: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size='xl' py='md'>
      <Group justify='space-between' mb='xl'>
        <div>
          <Title order={1}>{t('title')}</Title>
          <Text c='dimmed'>Manage and track support tickets</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleCreateTicket}
        >
          {t('createTicket')}
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} mb='md'>
        <Tabs.List>
          <Tabs.Tab value='all'>
            {t('allTickets')} (
            {hasActiveFilters()
              ? pagination?.total || 0
              : totalTicketsCount || 0}
            )
          </Tabs.Tab>
          <Tabs.Tab value='my'>
            {t('myTickets')} (
            {allTickets?.filter(t => t.requester?.id === user?.id).length || 0})
          </Tabs.Tab>
          <Tabs.Tab value='assigned'>
            {t('assignedTickets')} (
            {allTickets?.filter(t => t.assignedTo?.id === user?.id).length || 0}
            )
          </Tabs.Tab>
          <Tabs.Tab value='open'>
            {t('openTickets')} (
            {allTickets?.filter(t =>
              ['NEW', 'OPEN', 'IN_PROGRESS'].includes(t.status)
            ).length || 0}
            )
          </Tabs.Tab>
          <Tabs.Tab value='onhold'>
            {t('on_hold')} (
            {allTickets?.filter(t => t.status === 'ON_HOLD').length || 0})
          </Tabs.Tab>
          <Tabs.Tab value='overdue'>
            {t('overdueTickets')} (
            {allTickets?.filter(
              t =>
                t.dueDate &&
                new Date(t.dueDate) < new Date() &&
                !['RESOLVED', 'CLOSED'].includes(t.status)
            ).length || 0}
            )
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Grid mb='md'>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <SearchBar
            key={searchFilters.search || 'empty'}
            value={searchFilters.search}
            onChange={value => {
              updateFilters({ search: value });
              if (value.trim()) {
                addRecentSearch(value);
              }
            }}
            onAdvancedSearch={() => setAdvancedSearchOpen(true)}
            onSimpleFilters={() => setSimpleFiltersOpen(true)}
            recentSearches={recentSearches}
            onRecentSearchClick={addRecentSearch}
            onClearRecentSearches={clearRecentSearches}
            onRemoveRecentSearch={removeRecentSearch}
            debounceMs={1500}
            isLoading={isFetching}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, md: 3 }}>
          <Button
            variant='light'
            leftSection={<IconFilter size={16} />}
            fullWidth
            onClick={() => setAdvancedSearchOpen(true)}
          >
            Advanced
          </Button>
        </Grid.Col>
        <Grid.Col span={{ base: 6, md: 3 }}>
          {hasActiveFilters() && (
            <Button
              variant='outline'
              leftSection={<IconX size={16} />}
              fullWidth
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Grid.Col>
      </Grid>

      <BulkActionsBar
        selectedTickets={selectedTickets}
        onClearSelection={clearSelection}
        onBulkUpdate={bulkUpdate}
        totalTickets={totalTicketsCount || 0}
        isProcessing={isProcessing}
        selectedTicketsData={filteredTickets
          .filter(ticket => selectedTickets.includes(ticket.id))
          .map(ticket => ({
            id: ticket.id,
            status: ticket.status as TicketStatus,
            ticketNumber: ticket.ticketNumber,
          }))}
      />

      {filteredTickets.length > 0 && (
        <Group mb='md'>
          <BulkSelectCheckbox
            checked={isAllSelected(filteredTickets.map((t: Ticket) => t.id))}
            indeterminate={isIndeterminate(
              filteredTickets.map((t: Ticket) => t.id)
            )}
            onChange={checked => {
              if (checked) {
                selectAll(filteredTickets.map((t: Ticket) => t.id));
              } else {
                clearSelection();
              }
            }}
            aria-label='Select all tickets'
          />
          <Text size='sm' c='dimmed'>
            Select all tickets
          </Text>
        </Group>
      )}

      <Stack gap='md'>
        {filteredTickets.map((ticket: Ticket) => (
          <Card key={ticket.id} shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='sm'>
              <Group gap='sm'>
                <BulkSelectCheckbox
                  checked={isSelected(ticket.id)}
                  onChange={() => toggleTicket(ticket.id)}
                  aria-label={`Select ticket ${ticket.ticketNumber}`}
                />
                <Badge
                  color={statusColors[ticket.status as TicketStatus]}
                  variant='light'
                >
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge
                  color={priorityColors[ticket.priority as TicketPriority]}
                  variant='outline'
                >
                  {ticket.priority}
                </Badge>
                <Text size='sm' c='dimmed'>
                  #{ticket.ticketNumber}
                </Text>
              </Group>
              <Menu shadow='md' width={200}>
                <Menu.Target>
                  <ActionIcon variant='subtle'>
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEye size={14} />}
                    onClick={() => handleViewTicket(ticket.id)}
                  >
                    View
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={() => handleEditTicket(ticket.id)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color='red'
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setDeleteModalOpen(true);
                    }}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Text
              fw={500}
              mb='xs'
              style={{ cursor: 'pointer' }}
              onClick={() => handleViewTicket(ticket.id)}
            >
              {ticket.title}
            </Text>

            <Text size='sm' c='dimmed' mb='sm' lineClamp={2}>
              {ticket.description}
            </Text>

            <Group justify='space-between'>
              <Group gap='md'>
                <Group gap={4}>
                  <IconUser size={14} />
                  <Text size='sm'>{ticket.requester.name}</Text>
                </Group>
                <Group gap={4}>
                  <IconCalendar size={14} />
                  <Text size='sm'>
                    {new Date(ticket.createdAt).toLocaleDateString('en-US')}
                  </Text>
                </Group>
                {ticket.assignedTo && (
                  <Group gap={4}>
                    <IconTicket size={14} />
                    <Text size='sm'>Assigned to {ticket.assignedTo.name}</Text>
                  </Group>
                )}
              </Group>
              <Badge variant='light' color='gray'>
                {ticket.category?.name || 'Unknown'}
              </Badge>
            </Group>
          </Card>
        ))}
      </Stack>

      {filteredTickets.length === 0 && (
        <Card shadow='sm' padding='xl' radius='md' withBorder>
          <Stack align='center' gap='md'>
            <IconTicket size={48} color='var(--mantine-color-dimmed)' />
            <Text size='lg' fw={500}>
              No tickets found
            </Text>
            <Text c='dimmed' ta='center'>
              {activeTab === 'all'
                ? 'No tickets match your current filters.'
                : `No ${activeTab} tickets found.`}
            </Text>
            <Button onClick={handleCreateTicket}>
              Create your first ticket
            </Button>
          </Stack>
        </Card>
      )}

      {(pagination?.totalPages || 0) > 1 && (
        <Group justify='center' mt='xl'>
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={pagination?.totalPages || 1}
          />
        </Group>
      )}

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title='Delete Ticket'
        centered
      >
        <Text mb='md'>
          Are you sure you want to delete ticket #{selectedTicket?.ticketNumber}
          ? This action cannot be undone.
        </Text>
        <Group justify='flex-end'>
          <Button variant='light' onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color='red'
            onClick={() =>
              selectedTicket?.id && handleDeleteTicket(selectedTicket.id)
            }
          >
            Delete
          </Button>
        </Group>
      </Modal>

      <AdvancedSearchModal
        opened={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        onSearch={advancedFilters => {
          // Map AdvancedSearchCriteria to SearchCriteria format
          const searchCriteria = {
            search: advancedFilters.query || '',
            status: advancedFilters.status || [],
            priority: advancedFilters.priority || [],
            category: advancedFilters.category || [],
            impact: advancedFilters.impact || [],
            urgency: advancedFilters.urgency || [],
            slaLevel: advancedFilters.slaLevel || [],
            assignedTo: advancedFilters.assignedTo || [],
            requester: advancedFilters.requester || [],
            dateFrom: advancedFilters.createdFrom || null,
            dateTo: advancedFilters.createdTo || null,
            tags: [],
            customFields: advancedFilters.customFields || {},
          };
          updateFilters(searchCriteria);
          if (advancedFilters.query) {
            addRecentSearch(advancedFilters.query);
          }
        }}
      />

      <SimpleFiltersModal
        opened={simpleFiltersOpen}
        onClose={() => setSimpleFiltersOpen(false)}
        onApply={filters => {
          updateFilters(filters);
        }}
      />
    </Container>
  );
}
