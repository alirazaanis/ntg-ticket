'use client';

// Utility function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Grid,
  Card,
  Stack,
  Badge,
  ActionIcon,
  Menu,
  Loader,
  Alert,
  Pagination,
} from '@mantine/core';
import {
  IconPlus,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconTicket,
  IconFilter,
  IconX,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useState } from 'react';
import {
  useTicketsWithPagination,
  useTotalTicketsCount,
} from '../../../hooks/useTickets';
import { Ticket, TicketStatus, TicketPriority } from '../../../types/unified';
import { SearchBar } from '../../../components/search/SearchBar';
import { AdvancedSearchModal } from '../../../components/search/AdvancedSearchModal';
import { SimpleFiltersModal } from '../../../components/forms/SimpleFiltersModal';
import { useSearch } from '../../../hooks/useSearch';
import { PAGINATION_CONFIG } from '../../../lib/constants';

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

export default function MyTicketsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
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

  const searchQuery = getSearchQuery();
  const ticketsQuery = {
    ...searchQuery,
    page: currentPage,
    limit: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    requesterId: [user?.id],
  };

  const {
    data: ticketsData,
    isLoading,
    error,
    isFetching,
  } = useTicketsWithPagination(ticketsQuery);

  // Get total count of all tickets (no filters)
  const { data: totalTicketsCount } = useTotalTicketsCount();

  let myTickets = ticketsData?.tickets || [];
  const pagination = ticketsData?.pagination;

  // Client-side filters for resolution time and SLA breach time (in hours)
  if (
    typeof searchFilters.minResolutionHours === 'number' ||
    typeof searchFilters.maxResolutionHours === 'number'
  ) {
    const minH = searchFilters.minResolutionHours ?? 0;
    const maxH = searchFilters.maxResolutionHours ?? Number.POSITIVE_INFINITY;
    myTickets = myTickets.filter(t => {
      // Only include CLOSED tickets when filtering by resolution time
      if (t.status !== 'CLOSED') return false;
      const hours =
        typeof t.resolutionTime === 'number' ? t.resolutionTime : undefined;
      if (typeof hours !== 'number') return false;
      return hours >= minH && hours <= maxH;
    });
  }

  if (
    typeof searchFilters.minSlaBreachHours === 'number' ||
    typeof searchFilters.maxSlaBreachHours === 'number'
  ) {
    const minB = searchFilters.minSlaBreachHours ?? 0;
    const maxB = searchFilters.maxSlaBreachHours ?? Number.POSITIVE_INFINITY;
    myTickets = myTickets.filter(t => {
      if (!t.dueDate || !t.closedAt) return false;
      const due = new Date(t.dueDate).getTime();
      const closed = new Date(t.closedAt).getTime();
      if (isNaN(due) || isNaN(closed)) return false;
      // Breach if closed after due
      if (closed <= due) return false;
      const breachHours = (closed - due) / (1000 * 60 * 60);
      return breachHours >= minB && breachHours <= maxB;
    });
  }

  const handleViewTicket = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  const handleEditTicket = (ticketId: string) => {
    router.push(`/tickets/${ticketId}/edit`);
  };

  if (isLoading) {
    return (
      <Container size='xl' py='md'>
        <Group justify='center' mt='xl'>
          <Loader size='lg' />
          <Text>Loading your tickets...</Text>
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size='xl' py='md'>
        <Alert icon={<IconAlertCircle size={16} />} title='Error' color='red'>
          Failed to load tickets: {String(error)}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size='xl' py='md'>
      <Group justify='space-between' mb='xl'>
        <div>
          <Title order={1}>My Tickets</Title>
          <Text c='dimmed'>Tickets created by you</Text>
          {hasActiveFilters() && (
            <Text size='sm' c='blue' mt='xs'>
              Showing {myTickets.length} of {totalTicketsCount || 0} tickets
            </Text>
          )}
        </div>
        {user?.activeRole === 'END_USER' && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => router.push('/tickets/create')}
          >
            Create Ticket
          </Button>
        )}
      </Group>

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
              setCurrentPage(1);
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

      <Stack gap='md'>
        {myTickets.map((ticket: Ticket) => (
          <Card key={ticket.id} shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='sm'>
              <Group gap='sm'>
                <Badge color={statusColors[ticket.status]} variant='light'>
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge
                  color={priorityColors[ticket.priority]}
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
                    onClick={() => handleEditTicket(ticket.id)}
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
              {stripHtmlTags(ticket.description)}
            </Text>

            <Group justify='space-between'>
              <Group gap='md'>
                <Text size='sm'>{ticket.requester.name}</Text>
                <Text size='sm'>
                  {new Date(ticket.createdAt).toLocaleDateString('en-US')}
                </Text>
                {ticket.assignedTo && (
                  <Text size='sm'>Assigned to {ticket.assignedTo.name}</Text>
                )}
              </Group>
              <Badge variant='light' color='gray'>
                {ticket.category?.customName || ticket.category?.name || 'Unknown'}
              </Badge>
            </Group>
          </Card>
        ))}
      </Stack>

      {myTickets.length === 0 && (
        <Card shadow='sm' padding='xl' radius='md' withBorder>
          <Stack align='center' gap='md'>
            <IconTicket size={48} color='var(--mantine-color-dimmed)' />
            <Text size='lg' fw={500}>
              No tickets found
            </Text>
            <Text c='dimmed' ta='center'>
              No tickets match your current filters.
            </Text>
            {user?.activeRole === 'END_USER' && (
              <Button onClick={() => router.push('/tickets/create')}>
                Create your first ticket
              </Button>
            )}
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

      <AdvancedSearchModal
        opened={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        initialCriteria={{
          query: searchFilters.search || '',
          status: (searchFilters.status as string[]) || [],
          priority: (searchFilters.priority as string[]) || [],
          category: (searchFilters.category as string[]) || [],
          impact: (searchFilters.impact as string[]) || [],
          urgency: (searchFilters.urgency as string[]) || [],
          slaLevel: (searchFilters.slaLevel as string[]) || [],
          assignedTo: searchFilters.assignedTo || [],
          requester: searchFilters.requester || [],
          createdFrom:
            typeof searchFilters.dateFrom === 'string' && searchFilters.dateFrom
              ? new Date(searchFilters.dateFrom)
              : undefined,
          createdTo:
            typeof searchFilters.dateTo === 'string' && searchFilters.dateTo
              ? new Date(searchFilters.dateTo)
              : undefined,
          minResolutionTime: (searchFilters as { minResolutionHours?: number })
            .minResolutionHours,
          maxResolutionTime: (searchFilters as { maxResolutionHours?: number })
            .maxResolutionHours,
          minSlaBreachTime: (searchFilters as { minSlaBreachHours?: number })
            .minSlaBreachHours,
          maxSlaBreachTime: (searchFilters as { maxSlaBreachHours?: number })
            .maxSlaBreachHours,
        }}
        onSearch={advancedFilters => {
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
            // Numeric hour filters
            minResolutionHours: advancedFilters.minResolutionTime,
            maxResolutionHours: advancedFilters.maxResolutionTime,
            minSlaBreachHours: advancedFilters.minSlaBreachTime,
            maxSlaBreachHours: advancedFilters.maxSlaBreachTime,
          };
          updateFilters(searchCriteria);
          if (advancedFilters.query) {
            addRecentSearch(advancedFilters.query);
          }
          setCurrentPage(1);
        }}
      />

      <SimpleFiltersModal
        opened={simpleFiltersOpen}
        onClose={() => setSimpleFiltersOpen(false)}
        initialFilters={{
          status: (searchFilters.status as string[]) || [],
          priority: (searchFilters.priority as string[]) || [],
          category: (searchFilters.category as string[]) || [],
        }}
        onApply={filters => {
          updateFilters(filters);
          setCurrentPage(1);
        }}
      />
    </Container>
  );
}
