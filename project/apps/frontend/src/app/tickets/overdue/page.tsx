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
  Card,
  Stack,
  Pagination,
  TextInput,
  Select,
  Grid,
  Modal,
  Textarea,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconRefresh,
  IconDots,
  IconEye,
  IconEdit,
  IconClock,
  IconUser,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useOverdueTickets } from '../../../hooks/useTickets';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { SimpleFiltersModal } from '../../../components/forms/SimpleFiltersModal';

export default function OverdueTicketsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedTicket, setSelectedTicket] = useState<{
    id: string;
    ticketNumber: string;
    title: string;
    priority: string;
    status: string;
    assignedTo?: { name: string };
    createdAt: string;
  } | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    status?: string[];
    priority?: string[];
    category?: string[];
  }>({});

  const { data: overdueTickets, isLoading, refetch } = useOverdueTickets();

  const filteredTickets =
    overdueTickets?.filter(ticket => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(search.toLowerCase());
      const matchesPriority =
        priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory =
        categoryFilter === 'all' || ticket.category?.name === categoryFilter;

      // Apply advanced filters
      const matchesAdvancedStatus =
        !appliedFilters.status ||
        appliedFilters.status.length === 0 ||
        appliedFilters.status.includes(ticket.status);
      const matchesAdvancedPriority =
        !appliedFilters.priority ||
        appliedFilters.priority.length === 0 ||
        appliedFilters.priority.includes(ticket.priority);
      const matchesAdvancedCategory =
        !appliedFilters.category ||
        appliedFilters.category.length === 0 ||
        appliedFilters.category.includes(ticket.category?.name || '');

      return (
        matchesSearch &&
        matchesPriority &&
        matchesCategory &&
        matchesAdvancedStatus &&
        matchesAdvancedPriority &&
        matchesAdvancedCategory
      );
    }) || [];

  const totalPages = Math.ceil(filteredTickets.length / pageSize);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'MEDIUM':
        return 'blue';
      case 'LOW':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'blue';
      case 'IN_PROGRESS':
        return 'yellow';
      case 'PENDING':
        return 'orange';
      case 'RESOLVED':
        return 'green';
      case 'CLOSED':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const calculateOverdueHours = (createdAt: string, slaHours: number) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursSinceCreation =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hoursSinceCreation - slaHours);
  };

  const getOverdueSeverity = (overdueHours: number) => {
    if (overdueHours > 72) return { color: 'red', label: 'Critical' };
    if (overdueHours > 24) return { color: 'orange', label: 'High' };
    if (overdueHours > 8) return { color: 'yellow', label: 'Medium' };
    return { color: 'blue', label: 'Low' };
  };

  const handleQuickAction = (
    ticket: {
      id: string;
      ticketNumber: string;
      title: string;
      priority: string;
      status: string;
      assignedTo?: { name: string };
      createdAt: string;
    },
    action: string
  ) => {
    setSelectedTicket(ticket);
    setActionModalOpen(true);
    // Implement quick actions
    notifications.show({
      title: 'Action Applied',
      message: `${action} applied to ticket ${ticket.ticketNumber}`,
      color: 'green',
    });
  };

  return (
    <Container size='xl' py='md'>
      <Group justify='space-between' mb='xl'>
        <div>
          <Title order={2}>Overdue Tickets</Title>
          <Text c='dimmed' size='sm'>
            Tickets that have exceeded their SLA deadlines
          </Text>
        </div>
        <Button
          variant='light'
          leftSection={<IconRefresh size={16} />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </Group>

      {/* Statistics Cards */}
      <Grid mb='xl'>
        <Grid.Col span={3}>
          <Card>
            <Stack>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Total Overdue
                </Text>
                <IconAlertTriangle size={20} color='red' />
              </Group>
              <Text size='xl' fw={700} c='red'>
                {overdueTickets?.length || 0}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card>
            <Stack>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Critical
                </Text>
                <IconAlertTriangle size={20} color='red' />
              </Group>
              <Text size='xl' fw={700} c='red'>
                {overdueTickets?.filter(t => {
                  const overdueHours = calculateOverdueHours(t.createdAt, 24);
                  return overdueHours > 72;
                }).length || 0}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card>
            <Stack>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  High Priority
                </Text>
                <IconAlertTriangle size={20} color='orange' />
              </Group>
              <Text size='xl' fw={700} c='orange'>
                {overdueTickets?.filter(t => t.priority === 'HIGH').length || 0}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card>
            <Stack>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Avg Overdue
                </Text>
                <IconClock size={20} color='blue' />
              </Group>
              <Text size='xl' fw={700} c='blue'>
                {overdueTickets && overdueTickets.length > 0
                  ? Math.round(
                      overdueTickets.reduce((acc, t) => {
                        const overdueHours = calculateOverdueHours(
                          t.createdAt,
                          24
                        );
                        return acc + overdueHours;
                      }, 0) / overdueTickets.length
                    )
                  : 0}
                h
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Filters */}
      <Card mb='md'>
        <Group>
          <TextInput
            placeholder='Search overdue tickets...'
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder='Filter by priority'
            data={[
              { value: 'all', label: 'All Priorities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]}
            value={priorityFilter}
            onChange={value => setPriorityFilter(value || 'all')}
            style={{ width: 200 }}
          />
          <Select
            placeholder='Filter by category'
            data={[
              { value: 'all', label: 'All Categories' },
              { value: 'HARDWARE', label: 'Hardware' },
              { value: 'SOFTWARE', label: 'Software' },
              { value: 'NETWORK', label: 'Network' },
              { value: 'ACCESS', label: 'Access' },
              { value: 'OTHER', label: 'Other' },
            ]}
            value={categoryFilter}
            onChange={value => setCategoryFilter(value || 'all')}
            style={{ width: 200 }}
          />
          <Button
            variant='light'
            leftSection={<IconFilter size={16} />}
            onClick={() => setFiltersModalOpen(true)}
          >
            More Filters
          </Button>
        </Group>
      </Card>

      {/* Overdue Tickets Table */}
      <Card>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ticket</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Assigned To</Table.Th>
              <Table.Th>Overdue Time</Table.Th>
              <Table.Th>Severity</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedTickets.map(ticket => {
              const overdueHours = calculateOverdueHours(ticket.createdAt, 24);
              const severity = getOverdueSeverity(overdueHours);

              return (
                <Table.Tr key={ticket.id}>
                  <Table.Td>
                    <Stack gap={4}>
                      <Text fw={500}>{ticket.ticketNumber}</Text>
                      <Text size='sm' c='dimmed' truncate>
                        {ticket.title}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getPriorityColor(ticket.priority)}
                      variant='light'
                    >
                      {ticket.priority}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getStatusColor(ticket.status)}
                      variant='light'
                    >
                      {ticket.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap='xs'>
                      <IconUser size={14} />
                      <Text size='sm'>
                        {ticket.assignedTo?.name || 'Unassigned'}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={4}>
                      <Text size='sm' fw={500} c={severity.color}>
                        {Math.round(overdueHours)}h overdue
                      </Text>
                      <Text size='xs' c='dimmed'>
                        Created:{' '}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={severity.color} variant='light'>
                      {severity.label}
                    </Badge>
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
                          onClick={() => router.push(`/tickets/${ticket.id}`)}
                        >
                          View Details
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() =>
                            router.push(`/tickets/${ticket.id}/edit`)
                          }
                        >
                          Edit Ticket
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconUser size={14} />}
                          onClick={() => handleQuickAction(ticket, 'Reassign')}
                        >
                          Reassign
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconAlertTriangle size={14} />}
                          onClick={() => handleQuickAction(ticket, 'Escalate')}
                        >
                          Escalate
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              );
            })}
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

      {/* Quick Action Modal */}
      <Modal
        opened={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title='Quick Action'
      >
        <Stack>
          <Text size='sm' fw={500}>
            Ticket: {selectedTicket?.ticketNumber}
          </Text>
          <Text size='sm' c='dimmed'>
            {selectedTicket?.title}
          </Text>

          <Textarea
            label='Action Note'
            placeholder='Add a note about the action taken...'
            minRows={3}
          />

          <Group justify='flex-end' mt='md'>
            <Button variant='light' onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setActionModalOpen(false)}>
              Apply Action
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Advanced Filters Modal */}
      <SimpleFiltersModal
        opened={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        onApply={filters => {
          setAppliedFilters(filters);
          setCurrentPage(1); // Reset to first page when filters change
        }}
        initialFilters={appliedFilters}
      />
    </Container>
  );
}
