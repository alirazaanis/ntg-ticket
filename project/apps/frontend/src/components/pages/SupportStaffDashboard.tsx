'use client';

import { useMemo } from 'react';
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Avatar,
  Progress,
  Loader,
  Timeline,
  Badge,
} from '@mantine/core';
import {
  IconSearch,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconTicket,
} from '@tabler/icons-react';
import { useTickets } from '../../hooks/useTickets';
import { useTicketReport } from '../../hooks/useReports';
import { useAuthStore } from '../../stores/useAuthStore';
import { Ticket } from '../../types/unified';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function SupportStaffDashboard() {
  const t = useTranslations('dashboard');
  const router = useRouter();

  const { user } = useAuthStore();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: reportData } = useTicketReport({ userId: user?.id });

  const assignedTickets = useMemo(
    () =>
      tickets?.filter((ticket: Ticket) => ticket.assignedTo?.id === user?.id) ||
      [],
    [tickets, user?.id]
  );

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
  const slaBreachedTickets = assignedTickets.filter((ticket: Ticket) => {
    if (!ticket.dueDate || !ticket.closedAt) return false;
    return new Date(ticket.closedAt) > new Date(ticket.dueDate);
  });

  const stats = [
    {
      title: 'Total',
      value: assignedTickets.length,
      icon: IconTicket,
      color: 'red',
    },
    {
      title: 'Open',
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
    {
      title: 'SLA Breached',
      value: slaBreachedTickets.length,
      icon: IconAlertCircle,
      color: 'red',
    },
  ];

  // Breakdown calculations for tables
  const categoryBreakdown = useMemo(() => {
    const breakdown = new Map<string, number>();
    assignedTickets?.forEach((ticket: Ticket) => {
      const category = ticket.category?.customName || ticket.category?.name || 'Unknown';
      breakdown.set(category, (breakdown.get(category) || 0) + 1);
    });
    return Array.from(breakdown.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 categories
  }, [assignedTickets]);

  const statusBreakdown = useMemo(() => {
    const breakdown = {
      NEW: 0,
      OPEN: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      RESOLVED: 0,
      CLOSED: 0,
      REOPENED: 0,
    };
    assignedTickets?.forEach((ticket: Ticket) => {
      if (ticket.status in breakdown) {
        breakdown[ticket.status as keyof typeof breakdown]++;
      }
    });
    return Object.entries(breakdown)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [assignedTickets]);

  const impactBreakdown = useMemo(() => {
    const breakdown = {
      CRITICAL: 0,
      MAJOR: 0,
      MODERATE: 0,
      MINOR: 0,
      UNKNOWN: 0,
    };
    assignedTickets?.forEach((ticket: Ticket) => {
      if (ticket.impact && ticket.impact in breakdown) {
        breakdown[ticket.impact as keyof typeof breakdown]++;
      } else {
        breakdown.UNKNOWN++;
      }
    });
    return Object.entries(breakdown)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [assignedTickets]);

  const urgencyBreakdown = useMemo(() => {
    const breakdown = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };
    assignedTickets?.forEach((ticket: Ticket) => {
      if (ticket.urgency && ticket.urgency in breakdown) {
        breakdown[ticket.urgency as keyof typeof breakdown]++;
      } else {
        breakdown.UNKNOWN++;
      }
    });
    return Object.entries(breakdown)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [assignedTickets]);

  const priorityBreakdown = useMemo(() => {
    const breakdown = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };
    assignedTickets?.forEach((ticket: Ticket) => {
      if (ticket.priority && ticket.priority in breakdown) {
        breakdown[ticket.priority as keyof typeof breakdown]++;
      } else {
        breakdown.UNKNOWN++;
      }
    });
    return Object.entries(breakdown)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [assignedTickets]);

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
            <Button
              variant='outline'
              leftSection={<IconSearch size={16} />}
              onClick={() => router.push('/tickets')}
            >
              Search Tickets
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            width: '100%',
          }}
        >
          {stats.map(stat => (
            <Card key={stat.title} withBorder style={{ height: '100%' }} p='md'>
              <Group style={{ height: '100%' }}>
                <Avatar color={stat.color} size='lg'>
                  <stat.icon size={24} />
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text size='lg' fw={600}>
                    {stat.value}
                  </Text>
                  <Text size='sm' c='dimmed'>
                    {stat.title}
                  </Text>
                </div>
              </Group>
            </Card>
          ))}
        </div>

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
                  value={reportData?.slaMetrics?.responseTime || 0}
                  color='green'
                  size='lg'
                />
                <Text size='sm' mt={4}>
                  {reportData?.slaMetrics?.responseTime !== undefined
                    ? `${reportData.slaMetrics.responseTime}%`
                    : 'Loading...'}{' '}
                  within SLA
                </Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <div>
                <Text size='sm' c='dimmed' mb={4}>
                  Resolution Time (Last 30 days)
                </Text>
                <Progress
                  value={reportData?.slaMetrics?.resolutionTime || 0}
                  color='orange'
                  size='lg'
                />
                <Text size='sm' mt={4}>
                  {reportData?.slaMetrics?.resolutionTime !== undefined
                    ? `${reportData.slaMetrics.resolutionTime}%`
                    : 'Loading...'}{' '}
                  within SLA
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
                  color='red'
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

        {/* Breakdown Tables */}
        <Grid>
          {/* Left Column - Category, Impact, and Priority stacked with spacing */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap='sm'>
              <Paper withBorder p='md'>
                <Title order={4} mb='md'>
                  Tickets by Category
                </Title>
                <Stack gap={0}>
                  {categoryBreakdown.map(
                    ([category, count]: [string, number], index: number) => (
                      <div
                        key={category}
                        style={{
                          padding: '12px 16px',
                          borderBottom:
                            index < categoryBreakdown.length - 1
                              ? '1px solid var(--mantine-color-gray-2)'
                              : 'none',
                          backgroundColor:
                            index % 2 === 0
                              ? 'var(--mantine-color-gray-0)'
                              : 'transparent',
                        }}
                      >
                        <Group justify='space-between' align='center'>
                          <Text size='sm'>{category}</Text>
                          <Badge variant='light' color='blue'>
                            {count}
                          </Badge>
                        </Group>
                      </div>
                    )
                  )}
                </Stack>
              </Paper>
              
              <Paper withBorder p='md'>
                <Title order={4} mb='md'>
                  Tickets by Impact
                </Title>
                <Stack gap={0}>
                  {impactBreakdown.map(
                    ([impact, count]: [string, number], index: number) => (
                      <div
                        key={impact}
                        style={{
                          padding: '12px 16px',
                          borderBottom:
                            index < impactBreakdown.length - 1
                              ? '1px solid var(--mantine-color-gray-2)'
                              : 'none',
                          backgroundColor:
                            index % 2 === 0
                              ? 'var(--mantine-color-gray-0)'
                              : 'transparent',
                        }}
                      >
                        <Group justify='space-between' align='center'>
                          <Text size='sm'>{impact}</Text>
                          <Badge variant='light' color='red'>
                            {count}
                          </Badge>
                        </Group>
                      </div>
                    )
                  )}
                </Stack>
              </Paper>

              <Paper withBorder p='md'>
                <Title order={4} mb='md'>
                  Tickets by Priority
                </Title>
                <Stack gap={0}>
                  {priorityBreakdown.map(
                    ([priority, count]: [string, number], index: number) => (
                      <div
                        key={priority}
                        style={{
                          padding: '12px 16px',
                          borderBottom:
                            index < priorityBreakdown.length - 1
                              ? '1px solid var(--mantine-color-gray-2)'
                              : 'none',
                          backgroundColor:
                            index % 2 === 0
                              ? 'var(--mantine-color-gray-0)'
                              : 'transparent',
                        }}
                      >
                        <Group justify='space-between' align='center'>
                          <Text size='sm'>{priority}</Text>
                          <Badge variant='light' color='purple'>
                            {count}
                          </Badge>
                        </Group>
                      </div>
                    )
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Right Column - Status and Urgency stacked */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap='md'>
              <Paper withBorder p='md'>
                <Title order={4} mb='md'>
                  Tickets by Status
                </Title>
                <Stack gap={0}>
                  {statusBreakdown.map(
                    ([status, count]: [string, number], index: number) => (
                      <div
                        key={status}
                        style={{
                          padding: '12px 16px',
                          borderBottom:
                            index < statusBreakdown.length - 1
                              ? '1px solid var(--mantine-color-gray-2)'
                              : 'none',
                          backgroundColor:
                            index % 2 === 0
                              ? 'var(--mantine-color-gray-0)'
                              : 'transparent',
                        }}
                      >
                        <Group justify='space-between' align='center'>
                          <Text size='sm'>{status.replace('_', ' ')}</Text>
                          <Badge variant='light' color='green'>
                            {count}
                          </Badge>
                        </Group>
                      </div>
                    )
                  )}
                </Stack>
              </Paper>
              
              <Paper withBorder p='md'>
                <Title order={4} mb='md'>
                  Tickets by Urgency
                </Title>
                <Stack gap={0}>
                  {urgencyBreakdown.map(
                    ([urgency, count]: [string, number], index: number) => (
                      <div
                        key={urgency}
                        style={{
                          padding: '12px 16px',
                          borderBottom:
                            index < urgencyBreakdown.length - 1
                              ? '1px solid var(--mantine-color-gray-2)'
                              : 'none',
                          backgroundColor:
                            index % 2 === 0
                              ? 'var(--mantine-color-gray-0)'
                              : 'transparent',
                        }}
                      >
                        <Group justify='space-between' align='center'>
                          <Text size='sm'>{urgency}</Text>
                          <Badge variant='light' color='orange'>
                            {count}
                          </Badge>
                        </Group>
                      </div>
                    )
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Recent Activity */}
        <Paper withBorder p='md'>
          <Title order={3} mb='md'>
            {t('recentActivity')}
          </Title>
          <Timeline active={-1} bulletSize={24} lineWidth={2}>
            {assignedTickets.slice(0, 5).map((ticket: Ticket) => (
              <Timeline.Item
                key={ticket.id}
                bullet={<IconTicket size={12} />}
                title={ticket.title}
              >
                <Text c='dimmed' size='sm'>
                  {ticket.status} •{' '}
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </Text>
                <Badge color='red' size='sm' mt={4}>
                  {ticket.ticketNumber}
                </Badge>
              </Timeline.Item>
            ))}
          </Timeline>
        </Paper>
      </Stack>
    </Container>
  );
}
