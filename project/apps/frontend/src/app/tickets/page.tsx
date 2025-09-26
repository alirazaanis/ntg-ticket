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
import { useTickets, useDeleteTicket } from '../../hooks/useTickets';
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
import { SearchBar } from '../../components/search/SearchBar';
import { useSearch } from '../../hooks/useSearch';
import { BulkActionsBar } from '../../components/bulk/BulkActionsBar';
import { BulkSelectCheckbox } from '../../components/bulk/BulkSelectCheckbox';
import { useBulkOperations } from '../../hooks/useBulkOperations';

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
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  const {
    filters: searchFilters,
    recentSearches,
    updateFilters,
    clearFilters,
    addRecentSearch,
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
  } = useBulkOperations();

  const {
    data: tickets,
    isLoading,
    error,
  } = useTickets(getSearchQuery() as TicketFilters);
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

  const filteredTickets =
    tickets?.data?.filter((ticket: Ticket) => {
      if (activeTab === 'my' && ticket.requester.id !== user?.id) return false;
      if (activeTab === 'assigned' && ticket.assignedTo?.id !== user?.id)
        return false;
      if (
        activeTab === 'overdue' &&
        !['OPEN', 'IN_PROGRESS', 'ON_HOLD'].includes(ticket.status)
      )
        return false;
      return true;
    }) || [];

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
          <Title order={1}>Tickets</Title>
          <Text c='dimmed'>Manage and track support tickets</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleCreateTicket}
        >
          Create Ticket
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} mb='md'>
        <Tabs.List>
          <Tabs.Tab value='all'>All Tickets</Tabs.Tab>
          <Tabs.Tab value='my'>My Tickets</Tabs.Tab>
          <Tabs.Tab value='assigned'>Assigned to Me</Tabs.Tab>
          <Tabs.Tab value='overdue'>Overdue</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Grid mb='md'>
        <Grid.Col span={8}>
          <SearchBar
            value={searchFilters.search}
            onChange={value => updateFilters({ search: value })}
            onAdvancedSearch={() => setAdvancedSearchOpen(true)}
            recentSearches={recentSearches}
            onRecentSearchClick={addRecentSearch}
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <Button
            variant='light'
            leftSection={<IconFilter size={16} />}
            fullWidth
            onClick={() => setAdvancedSearchOpen(true)}
          >
            Advanced
          </Button>
        </Grid.Col>
        <Grid.Col span={2}>
          {hasActiveFilters() && (
            <Button
              variant='outline'
              leftSection={<IconX size={16} />}
              fullWidth
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </Grid.Col>
      </Grid>

      <BulkActionsBar
        selectedTickets={selectedTickets}
        onClearSelection={clearSelection}
        onBulkUpdate={bulkUpdate}
        totalTickets={filteredTickets.length}
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

      {filteredTickets.length > 0 && (
        <Group justify='center' mt='xl'>
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={Math.ceil((tickets?.data?.length || 0) / 10)}
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
        onSearch={filters => {
          updateFilters(filters);
          addRecentSearch(filters.search);
        }}
        initialFilters={searchFilters}
      />
    </Container>
  );
}
