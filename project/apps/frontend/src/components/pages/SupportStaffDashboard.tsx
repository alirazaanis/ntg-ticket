'use client';

import { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  TextInput,
  Tabs,
  Card,
  Avatar,
  Progress,
  Alert,
  Loader,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconBell,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconTicket,
} from '@tabler/icons-react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import { useTicketReport } from '../../hooks/useReports';
import { useAuthStore } from '../../stores/useAuthStore';
import { TicketCard } from '../ui/TicketCard';
import { NotificationList } from '../ui/NotificationList';
import { Ticket } from '../../types/unified';
import { Notification } from '../../types/notification';

export function SupportStaffDashboard() {
  const [activeTab, setActiveTab] = useState('assigned');
  const { user } = useAuthStore();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: notifications } = useNotifications();
  const { data: reportData } = useTicketReport({ userId: user?.id });

  const assignedTickets =
    tickets?.data?.filter(
      (ticket: Ticket) => ticket.assignedTo?.id === user?.id
    ) || [];
  const openTickets = assignedTickets.filter((ticket: Ticket) =>
    ['NEW', 'OPEN', 'IN_PROGRESS'].includes(ticket.status)
  );
  const resolvedTickets = assignedTickets.filter(
    (ticket: Ticket) => ticket.status === 'RESOLVED'
  );
  const overdueTickets = assignedTickets.filter((ticket: Ticket) => {
    if (!ticket.dueDate) return false;
    return (
      new Date(ticket.dueDate) < new Date() &&
      !['RESOLVED', 'CLOSED'].includes(ticket.status)
    );
  });

  const stats = [
    {
      title: 'Assigned Tickets',
      value: assignedTickets.length,
      icon: IconTicket,
      color: 'blue',
    },
    {
      title: 'Open Tickets',
      value: openTickets.length,
      icon: IconClock,
      color: 'orange',
    },
    {
      title: 'Resolved',
      value: resolvedTickets.length,
      icon: IconCheck,
      color: 'green',
    },
    {
      title: 'Overdue',
      value: overdueTickets.length,
      icon: IconAlertCircle,
      color: 'red',
    },
  ];

  if (ticketsLoading) {
    return (
      <Container size='xl' py='md'>
        <Group justify='center' py='xl'>
          <Loader size='lg' />
        </Group>
      </Container>
    );
  }

  return (
    <Container size='xl' py='md'>
      <Stack gap='md'>
        {/* Header */}
        <Group justify='space-between'>
          <div>
            <Title order={2}>Support Dashboard</Title>
            <Text c='dimmed'>
              Manage your assigned tickets and track performance
            </Text>
          </div>
          <Group>
            <Button variant='outline' leftSection={<IconSearch size={16} />}>
              Search Tickets
            </Button>
            <Button leftSection={<IconFilter size={16} />}>Filter</Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <Grid>
          {stats.map(stat => (
            <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder>
                <Group>
                  <Avatar color={stat.color} size='lg'>
                    <stat.icon size={24} />
                  </Avatar>
                  <div>
                    <Text size='lg' fw={600}>
                      {stat.value}
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {stat.title}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* SLA Compliance */}
        <Paper withBorder p='md'>
          <Title order={3} mb='md'>
            SLA Compliance
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <div>
                <Text size='sm' c='dimmed' mb={4}>
                  Response Time (Last 30 days)
                </Text>
                <Progress
                  value={reportData?.slaMetrics?.responseTime || 85}
                  color='green'
                  size='lg'
                />
                <Text size='sm' mt={4}>
                  {reportData?.slaMetrics?.responseTime || 85}% within SLA
                </Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <div>
                <Text size='sm' c='dimmed' mb={4}>
                  Resolution Time (Last 30 days)
                </Text>
                <Progress
                  value={reportData?.slaMetrics?.resolutionTime || 78}
                  color='orange'
                  size='lg'
                />
                <Text size='sm' mt={4}>
                  {reportData?.slaMetrics?.resolutionTime || 78}% within SLA
                </Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <div>
                <Text size='sm' c='dimmed' mb={4}>
                  Customer Satisfaction
                </Text>
                <Progress
                  value={reportData?.slaMetrics?.customerSatisfaction || 92}
                  color='blue'
                  size='lg'
                />
                <Text size='sm' mt={4}>
                  {(
                    (reportData?.slaMetrics?.customerSatisfaction || 92) / 20
                  ).toFixed(1)}
                  /5.0 average
                </Text>
              </div>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onChange={value => setActiveTab(value || 'assigned')}
        >
          <Tabs.List>
            <Tabs.Tab value='assigned' leftSection={<IconTicket size={16} />}>
              Assigned Tickets
            </Tabs.Tab>
            <Tabs.Tab
              value='overdue'
              leftSection={<IconAlertCircle size={16} />}
            >
              Overdue Tickets
            </Tabs.Tab>
            <Tabs.Tab value='resolved' leftSection={<IconCheck size={16} />}>
              Resolved Tickets
            </Tabs.Tab>
            <Tabs.Tab
              value='notifications'
              leftSection={<IconBell size={16} />}
            >
              Notifications
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='assigned' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>Assigned Tickets</Title>
                <Group>
                  <TextInput
                    placeholder='Search tickets...'
                    leftSection={<IconSearch size={16} />}
                    style={{ width: 300 }}
                  />
                  <Button
                    variant='outline'
                    leftSection={<IconFilter size={16} />}
                  >
                    Filter
                  </Button>
                </Group>
              </Group>

              <Grid>
                {assignedTickets.map((ticket: Ticket) => (
                  <Grid.Col key={ticket.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <TicketCard ticket={ticket} showActions />
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='overdue' pt='md'>
            <Stack gap='md'>
              <Title order={3}>Overdue Tickets</Title>
              {overdueTickets.length === 0 ? (
                <Alert color='green' icon={<IconCheck size={16} />}>
                  No overdue tickets! Great job!
                </Alert>
              ) : (
                <Grid>
                  {overdueTickets.map((ticket: Ticket) => (
                    <Grid.Col key={ticket.id} span={{ base: 12, md: 6, lg: 4 }}>
                      <TicketCard ticket={ticket} showActions urgent />
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='resolved' pt='md'>
            <Stack gap='md'>
              <Title order={3}>Resolved Tickets</Title>
              <Grid>
                {resolvedTickets.map((ticket: Ticket) => (
                  <Grid.Col key={ticket.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <TicketCard ticket={ticket} />
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='notifications' pt='md'>
            <NotificationList
              notifications={(notifications as unknown as Notification[]) || []}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
