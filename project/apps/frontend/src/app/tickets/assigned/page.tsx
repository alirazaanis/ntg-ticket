'use client';

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
  Table,
  ActionIcon,
  Menu,
  Loader,
  Alert,
} from '@mantine/core';
import {
  IconPlus,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconTicket,
  IconUser,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTickets } from '../../../hooks/useTickets';
import { useAuthStore } from '../../../stores/useAuthStore';
import { Ticket, TicketStatus, TicketPriority } from '../../../types/unified';
import { formatDistanceToNow } from 'date-fns';

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

export default function AssignedTicketsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: tickets, isLoading, error } = useTickets();
  
  const assignedTickets = tickets?.filter(ticket => ticket.assignedTo?.id === user?.id) || [];
  const openTickets = assignedTickets.filter(ticket => 
    ['NEW', 'OPEN', 'IN_PROGRESS'].includes(ticket.status)
  );
  const resolvedTickets = assignedTickets.filter(ticket => 
    ['RESOLVED', 'CLOSED'].includes(ticket.status)
  );

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
          <Text>Loading assigned tickets...</Text>
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
          <Title order={1}>Assigned to Me</Title>
          <Text c='dimmed'>
            {assignedTickets.length} total tickets • {openTickets.length} open • {resolvedTickets.length} resolved
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push('/tickets/create')}
        >
          Create Ticket
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={3}>
          <Stack gap='md'>
            <Card withBorder p='md'>
              <Title order={4} mb='md'>Quick Stats</Title>
              <Stack gap='sm'>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>Total Assigned</Text>
                  <Badge color='blue' variant='light'>
                    {assignedTickets.length}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>Open Tickets</Text>
                  <Badge color='green' variant='light'>
                    {openTickets.length}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>Resolved Tickets</Text>
                  <Badge color='gray' variant='light'>
                    {resolvedTickets.length}
                  </Badge>
                </Group>
              </Stack>
            </Card>

            <Card withBorder p='md'>
              <Title order={4} mb='md'>Quick Actions</Title>
              <Stack gap='sm'>
                <Button
                  variant='outline'
                  leftSection={<IconPlus size={16} />}
                  onClick={() => router.push('/tickets/create')}
                  fullWidth
                >
                  Create New Ticket
                </Button>
                <Button
                  variant='outline'
                  leftSection={<IconTicket size={16} />}
                  onClick={() => router.push('/tickets')}
                  fullWidth
                >
                  View All Tickets
                </Button>
                <Button
                  variant='outline'
                  leftSection={<IconUser size={16} />}
                  onClick={() => router.push('/tickets/my')}
                  fullWidth
                >
                  My Tickets
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>

        <Grid.Col span={9}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Title order={3} mb='md'>
              Assigned Tickets
            </Title>
            
            {assignedTickets.length === 0 ? (
              <Stack align='center' gap='md' py='xl'>
                <IconTicket size={48} color='var(--mantine-color-dimmed)' />
                <Text size='lg' fw={500}>
                  No assigned tickets
                </Text>
                <Text c='dimmed' ta='center'>
                  You don't have any tickets assigned to you yet. Check back later or create a new ticket.
                </Text>
                <Button onClick={() => router.push('/tickets/create')}>
                  Create New Ticket
                </Button>
              </Stack>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ticket</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Requester</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {assignedTickets.map((ticket: Ticket) => (
                    <Table.Tr key={ticket.id}>
                      <Table.Td>
                        <div>
                          <Text fw={500} size='sm'>
                            #{ticket.ticketNumber}
                          </Text>
                          <Text size='xs' c='dimmed'>
                            {ticket.title}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={statusColors[ticket.status]}
                          variant='light'
                          size='sm'
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={priorityColors[ticket.priority]}
                          variant='outline'
                          size='sm'
                        >
                          {ticket.priority}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size='sm'>
                          {ticket.requester.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size='sm'>
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
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
                              onClick={() => handleViewTicket(ticket.id)}
                            >
                              View Details
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={() => handleEditTicket(ticket.id)}
                            >
                              Edit Ticket
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
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
