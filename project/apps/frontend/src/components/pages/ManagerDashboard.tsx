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
  Badge,
  ActionIcon,
  TextInput,
  Tabs,
  Card,
  Avatar,
  Timeline,
  Alert,
  Loader,
  Table,
  RingProgress,
} from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconTrendingUp,
  IconUsers,
  IconTicket,
  IconFileText,
  IconEye,
  IconEdit,
  IconChartBar,
  IconReport,
} from '@tabler/icons-react';
import { useTickets } from '../../hooks/useTickets';
import { useTicketReport } from '../../hooks/useReports';
import { TicketCard } from '../ui/TicketCard';
import { Ticket } from '../../types/unified';
import { TeamPerformanceData } from '../../lib/apiClient';

export function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: reportData } = useTicketReport();

  const allTickets = tickets || [];
  const openTickets = allTickets.filter((ticket: Ticket) =>
    ['NEW', 'OPEN', 'IN_PROGRESS'].includes(ticket.status)
  );
  const resolvedTickets = allTickets.filter(
    (ticket: Ticket) => ticket.status === 'RESOLVED'
  );

  const overdueTickets = allTickets.filter((ticket: Ticket) => {
    if (!ticket.dueDate) return false;
    return (
      new Date(ticket.dueDate) < new Date() &&
      !['RESOLVED', 'CLOSED'].includes(ticket.status)
    );
  });

  const stats = [
    {
      title: 'Total Tickets',
      value: allTickets.length,
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

  // Real data for charts
  const ticketTrendData = reportData?.ticketTrendData || [];
  const categoryData =
    reportData?.categoryStats?.map(
      (cat: { name: string; count: number; percentage: number }) => ({
        category: cat.name,
        count: cat.count,
        percentage: cat.percentage,
      })
    ) || [];

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
            <Title order={2}>Management Dashboard</Title>
            <Text c='dimmed'>Monitor team performance and ticket metrics</Text>
          </div>
          <Group>
            <Button variant='outline' leftSection={<IconSearch size={16} />}>
              Search Tickets
            </Button>
            <Button variant='outline' leftSection={<IconFilter size={16} />}>
              Filter
            </Button>
            <Button leftSection={<IconReport size={16} />}>
              Generate Report
            </Button>
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

        {/* Performance Metrics */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p='md'>
              <Title order={3} mb='md'>
                SLA Performance
              </Title>
              <Grid>
                <Grid.Col span={6}>
                  <div>
                    <Text size='sm' c='dimmed' mb={4}>
                      Response Time
                    </Text>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[
                        {
                          value: reportData?.slaMetrics?.responseTime || 85,
                          color: 'green',
                        },
                      ]}
                      label={
                        <Text ta='center' fw={700} size='lg'>
                          {reportData?.slaMetrics?.responseTime || 85}%
                        </Text>
                      }
                    />
                  </div>
                </Grid.Col>
                <Grid.Col span={6}>
                  <div>
                    <Text size='sm' c='dimmed' mb={4}>
                      Resolution Time
                    </Text>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[
                        {
                          value: reportData?.slaMetrics?.resolutionTime || 78,
                          color: 'orange',
                        },
                      ]}
                      label={
                        <Text ta='center' fw={700} size='lg'>
                          {reportData?.slaMetrics?.resolutionTime || 78}%
                        </Text>
                      }
                    />
                  </div>
                </Grid.Col>
              </Grid>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p='md'>
              <Title order={3} mb='md'>
                Team Performance
              </Title>
              <Stack gap='sm'>
                {reportData?.teamPerformance
                  ?.slice(0, 4)
                  .map((member: TeamPerformanceData) => (
                    <Group key={member.userId} justify='space-between'>
                      <Text size='sm'>{member.userName}</Text>
                      <Badge color='green'>{member.slaCompliance}%</Badge>
                    </Group>
                  ))}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Charts */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper withBorder p='md'>
              <Title order={3} mb='md'>
                Ticket Trends
              </Title>
              <AreaChart
                h={300}
                data={ticketTrendData}
                dataKey='month'
                series={[
                  { name: 'tickets', color: 'blue.6' },
                  { name: 'resolved', color: 'green.6' },
                ]}
                curveType='linear'
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p='md'>
              <Title order={3} mb='md'>
                Tickets by Category
              </Title>
              <BarChart
                h={300}
                data={categoryData}
                dataKey='category'
                series={[{ name: 'count', color: 'blue.6' }]}
                orientation='vertical'
              />
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onChange={value => setActiveTab(value || 'overview')}
        >
          <Tabs.List>
            <Tabs.Tab
              value='overview'
              leftSection={<IconTrendingUp size={16} />}
            >
              Overview
            </Tabs.Tab>
            <Tabs.Tab value='tickets' leftSection={<IconTicket size={16} />}>
              All Tickets
            </Tabs.Tab>
            <Tabs.Tab
              value='overdue'
              leftSection={<IconAlertCircle size={16} />}
            >
              Overdue Tickets
            </Tabs.Tab>
            <Tabs.Tab value='team' leftSection={<IconUsers size={16} />}>
              Team Performance
            </Tabs.Tab>
            <Tabs.Tab value='reports' leftSection={<IconChartBar size={16} />}>
              Reports
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='overview' pt='md'>
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Recent Activity
                  </Title>
                  <Timeline active={-1} bulletSize={24} lineWidth={2}>
                    {allTickets.slice(0, 5).map((ticket: Ticket) => (
                      <Timeline.Item
                        key={ticket.id}
                        bullet={<IconTicket size={12} />}
                        title={ticket.title}
                      >
                        <Text c='dimmed' size='sm'>
                          {ticket.status} •{' '}
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </Text>
                        <Badge color='blue' size='sm' mt={4}>
                          {ticket.ticketNumber}
                        </Badge>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Quick Actions
                  </Title>
                  <Stack gap='sm'>
                    <Button
                      variant='light'
                      leftSection={<IconPlus size={16} />}
                    >
                      Create Ticket
                    </Button>
                    <Button
                      variant='light'
                      leftSection={<IconSearch size={16} />}
                    >
                      Search Tickets
                    </Button>
                    <Button
                      variant='light'
                      leftSection={<IconFileText size={16} />}
                    >
                      Generate Report
                    </Button>
                    <Button
                      variant='light'
                      leftSection={<IconUsers size={16} />}
                    >
                      Manage Team
                    </Button>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value='tickets' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>All Tickets</Title>
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
                {allTickets.map((ticket: Ticket) => (
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

          <Tabs.Panel value='team' pt='md'>
            <Paper withBorder p='md'>
              <Title order={3} mb='md'>
                Team Performance
              </Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Staff Member</Table.Th>
                    <Table.Th>Assigned Tickets</Table.Th>
                    <Table.Th>Resolved</Table.Th>
                    <Table.Th>Avg. Resolution Time</Table.Th>
                    <Table.Th>SLA Compliance</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {reportData?.teamPerformance?.map(
                    (member: TeamPerformanceData) => (
                      <Table.Tr key={member.userId}>
                        <Table.Td>{member.userName}</Table.Td>
                        <Table.Td>{member.assignedTickets}</Table.Td>
                        <Table.Td>{member.resolvedTickets}</Table.Td>
                        <Table.Td>{member.avgResolutionTime} days</Table.Td>
                        <Table.Td>
                          <Badge color='green'>{member.slaCompliance}%</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap='xs'>
                            <ActionIcon size='sm' variant='light'>
                              <IconEye size={14} />
                            </ActionIcon>
                            <ActionIcon size='sm' variant='light'>
                              <IconEdit size={14} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value='reports' pt='md'>
            <Stack gap='md'>
              <Title order={3}>Reports</Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card withBorder p='md'>
                    <Group justify='space-between' mb='md'>
                      <Title order={4}>Monthly Report</Title>
                      <Button size='sm' variant='outline'>
                        Export PDF
                      </Button>
                    </Group>
                    <Text size='sm' c='dimmed'>
                      Comprehensive monthly ticket analysis including trends,
                      performance metrics, and recommendations.
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card withBorder p='md'>
                    <Group justify='space-between' mb='md'>
                      <Title order={4}>SLA Report</Title>
                      <Button size='sm' variant='outline'>
                        Export Excel
                      </Button>
                    </Group>
                    <Text size='sm' c='dimmed'>
                      Detailed SLA compliance report with breach analysis and
                      improvement recommendations.
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
