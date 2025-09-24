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
  Alert,
  Grid,
  Modal,
  Textarea,
  Divider,
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
  IconExclamationMark,
} from '@tabler/icons-react';
import { useBreachedSLATickets } from '../../../hooks/useTickets';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

export default function SLABreachedTicketsPage() {
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

  const { data: breachedTickets, isLoading, refetch } = useBreachedSLATickets();

  const filteredTickets = breachedTickets?.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category?.name === categoryFilter;
    return matchesSearch && matchesPriority && matchesCategory;
  }) || [];

  const totalPages = Math.ceil(filteredTickets.length / pageSize);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'blue';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'blue';
      case 'IN_PROGRESS': return 'yellow';
      case 'PENDING': return 'orange';
      case 'RESOLVED': return 'green';
      case 'CLOSED': return 'gray';
      default: return 'gray';
    }
  };

  const calculateBreachHours = (createdAt: string, slaHours: number) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hoursSinceCreation - slaHours);
  };

  const getBreachSeverity = (breachHours: number) => {
    if (breachHours > 168) return { color: 'red', label: 'Critical Breach', icon: IconExclamationMark };
    if (breachHours > 72) return { color: 'orange', label: 'Major Breach', icon: IconAlertTriangle };
    if (breachHours > 24) return { color: 'yellow', label: 'Moderate Breach', icon: IconClock };
    return { color: 'blue', label: 'Minor Breach', icon: IconClock };
  };

  const handleQuickAction = (ticket: {
    id: string;
    ticketNumber: string;
    title: string;
    priority: string;
    status: string;
    assignedTo?: { name: string };
    createdAt: string;
  }, action: string) => {
    setSelectedTicket(ticket);
    setActionModalOpen(true);
    notifications.show({
      title: 'Action Applied',
      message: `${action} applied to ticket ${ticket.ticketNumber}`,
      color: 'green',
    });
  };

  const handleEscalate = (ticket: {
    id: string;
    ticketNumber: string;
    title: string;
    priority: string;
    status: string;
    assignedTo?: { name: string };
    createdAt: string;
  }) => {
    notifications.show({
      title: 'Ticket Escalated',
      message: `Ticket ${ticket.ticketNumber} has been escalated to management`,
      color: 'orange',
    });
  };

  const handleUrgentResponse = (ticket: {
    id: string;
    ticketNumber: string;
    title: string;
    priority: string;
    status: string;
    assignedTo?: { name: string };
    createdAt: string;
  }) => {
    notifications.show({
      title: 'Urgent Response Sent',
      message: `Urgent response sent for ticket ${ticket.ticketNumber}`,
      color: 'red',
    });
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>SLA Breached Tickets</Title>
          <Text c="dimmed" size="sm">
            Tickets that have severely breached their SLA deadlines
          </Text>
        </div>
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </Group>

      {/* Critical Alert */}
      <Alert color="red" title="Critical SLA Breaches" icon={<IconExclamationMark size={16} />} mb="xl">
        These tickets have severely breached their SLA deadlines and require immediate attention.
        Consider escalating to management or taking urgent corrective action.
      </Alert>

      {/* Statistics Cards */}
      <Grid mb="xl">
        <Grid.Col span={3}>
          <Card>
            <Stack>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Total Breached</Text>
                <IconExclamationMark size={20} color="red" />
              </Group>
              <Text size="xl" fw={700} c="red">
                {breachedTickets?.length || 0}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card>
            <Stack>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Critical Breaches</Text>
                <IconExclamationMark size={20} color="red" />
              </Group>
              <Text size="xl" fw={700} c="red">
                {breachedTickets?.filter(t => {
                  const breachHours = calculateBreachHours(t.createdAt, 24);
                  return breachHours > 168;
                }).length || 0}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card>
            <Stack>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Major Breaches</Text>
                <IconAlertTriangle size={20} color="orange" />
              </Group>
              <Text size="xl" fw={700} c="orange">
                {breachedTickets?.filter(t => {
                  const breachHours = calculateBreachHours(t.createdAt, 24);
                  return breachHours > 72 && breachHours <= 168;
                }).length || 0}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card>
            <Stack>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Avg Breach Time</Text>
                <IconClock size={20} color="blue" />
              </Group>
              <Text size="xl" fw={700} c="blue">
                {breachedTickets && breachedTickets.length > 0
                  ? Math.round(breachedTickets.reduce((acc, t) => {
                      const breachHours = calculateBreachHours(t.createdAt, 24);
                      return acc + breachHours;
                    }, 0) / breachedTickets.length)
                  : 0}h
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Filters */}
      <Card mb="md">
        <Group>
          <TextInput
            placeholder="Search breached tickets..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by priority"
            data={[
              { value: 'all', label: 'All Priorities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]}
            value={priorityFilter}
            onChange={(value) => setPriorityFilter(value || 'all')}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by category"
            data={[
              { value: 'all', label: 'All Categories' },
              { value: 'TECHNICAL', label: 'Technical' },
              { value: 'ACCOUNT', label: 'Account' },
              { value: 'BILLING', label: 'Billing' },
            ]}
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value || 'all')}
            style={{ width: 200 }}
          />
          <Button
            variant="light"
            leftSection={<IconFilter size={16} />}
          >
            More Filters
          </Button>
        </Group>
      </Card>

      {/* Breached Tickets Table */}
      <Card>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ticket</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Assigned To</Table.Th>
              <Table.Th>Breach Time</Table.Th>
              <Table.Th>Severity</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedTickets.map((ticket) => {
              const breachHours = calculateBreachHours(ticket.createdAt, 24);
              const severity = getBreachSeverity(breachHours);
              const SeverityIcon = severity.icon;
              
              return (
                <Table.Tr key={ticket.id}>
                  <Table.Td>
                    <Stack gap={4}>
                      <Text fw={500}>{ticket.ticketNumber}</Text>
                      <Text size="sm" c="dimmed" truncate>
                        {ticket.title}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getPriorityColor(ticket.priority)} variant="light">
                      {ticket.priority}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(ticket.status)} variant="light">
                      {ticket.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconUser size={14} />
                      <Text size="sm">{ticket.assignedTo?.name || 'Unassigned'}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={4}>
                      <Text size="sm" fw={500} c={severity.color}>
                        {Math.round(breachHours)}h breached
                      </Text>
                      <Text size="xs" c="dimmed">
                        Created: {new Date(ticket.createdAt).toLocaleDateString()}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={severity.color} variant="light" leftSection={<SeverityIcon size={12} />}>
                      {severity.label}
                    </Badge>
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
                          onClick={() => router.push(`/tickets/${ticket.id}`)}
                        >
                          View Details
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => router.push(`/tickets/${ticket.id}/edit`)}
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
                          onClick={() => handleEscalate(ticket)}
                          color="orange"
                        >
                          Escalate to Management
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconExclamationMark size={14} />}
                          onClick={() => handleUrgentResponse(ticket)}
                          color="red"
                        >
                          Send Urgent Response
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
          <Group justify="center" mt="md">
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
        title="Quick Action"
      >
        <Stack>
          <Text size="sm" fw={500}>Ticket: {selectedTicket?.ticketNumber}</Text>
          <Text size="sm" c="dimmed">{selectedTicket?.title}</Text>
          
          <Divider />
          
          <Text size="sm" fw={500}>SLA Breach Details</Text>
          <Text size="sm" c="dimmed">
            This ticket has breached its SLA by {selectedTicket ? Math.round(calculateBreachHours(selectedTicket.createdAt, 24)) : 0} hours.
          </Text>
          
          <Textarea
            label="Action Note"
            placeholder="Add a note about the action taken..."
            minRows={3}
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setActionModalOpen(false)}>
              Apply Action
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
