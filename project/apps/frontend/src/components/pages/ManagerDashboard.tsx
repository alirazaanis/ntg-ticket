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
  Tabs,
  Card,
  Avatar,
  Timeline,
  Loader,
  Table,
  RingProgress,
} from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import {
  IconSearch,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconAlertTriangle,
  IconTrendingUp,
  IconUsers,
  IconTicket,
  IconEye,
  IconEdit,
  IconChartBar,
  IconReport,
} from '@tabler/icons-react';
import {
  useTotalTicketsCount,
  useAllTicketsForCounting,
  useBreachedSLATickets,
} from '../../hooks/useTickets';
import { useTicketReport } from '../../hooks/useReports';
import { Ticket } from '../../types/unified';
import { TeamPerformanceData } from '../../lib/apiClient';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function ManagerDashboard() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const { data: totalTicketsCount } = useTotalTicketsCount();
  const { data: allTicketsForStats, isLoading: ticketsLoading } =
    useAllTicketsForCounting();
  const { data: reportData, isLoading: reportLoading } = useTicketReport();
  const { data: slaBreachedTickets } = useBreachedSLATickets();
  const openTickets =
    allTicketsForStats?.filter((ticket: Ticket) =>
      ['NEW', 'OPEN', 'IN_PROGRESS'].includes(ticket.status)
    ) || [];
  const resolvedTickets =
    allTicketsForStats?.filter(
      (ticket: Ticket) => ticket.status === 'RESOLVED'
    ) || [];

  const overdueTickets =
    allTicketsForStats?.filter((ticket: Ticket) => {
      if (!ticket.dueDate) return false;
      return (
        new Date(ticket.dueDate) < new Date() &&
        !['RESOLVED', 'CLOSED'].includes(ticket.status)
      );
    }) || [];

  const stats = [
    {
      title: 'Total',
      value: totalTicketsCount || 0,
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
      title: t('resolvedTickets'),
      value: resolvedTickets.length,
      icon: IconCheck,
      color: 'green',
    },
    {
      title: t('overdueTickets'),
      value: overdueTickets.length,
      icon: IconAlertCircle,
      color: 'red',
    },
    {
      title: 'SLA Breached',
      value: slaBreachedTickets?.length || 0,
      icon: IconAlertTriangle,
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
            <Button
              variant='outline'
              leftSection={<IconSearch size={16} />}
              onClick={() => router.push('/tickets')}
            >
              Search Tickets
            </Button>
            <Button
              leftSection={<IconReport size={16} />}
              onClick={() => router.push('/reports')}
            >
              Generate Report
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
                          value: reportData?.slaMetrics?.responseTime || 0,
                          color: 'green',
                        },
                      ]}
                      label={
                        <Text ta='center' fw={700} size='lg'>
                          {reportData?.slaMetrics?.responseTime
                            ? `${reportData.slaMetrics.responseTime}%`
                            : 'Loading...'}
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
                    {reportLoading ? (
                      <div
                        style={{
                          height: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Loader size='sm' />
                      </div>
                    ) : (
                      <RingProgress
                        size={120}
                        thickness={12}
                        sections={[
                          {
                            value: reportData?.slaMetrics?.resolutionTime || 0,
                            color: 'orange',
                          },
                        ]}
                        label={
                          <Text ta='center' fw={700} size='lg'>
                            {reportData?.slaMetrics?.resolutionTime
                              ? `${reportData.slaMetrics.resolutionTime}%`
                              : '0%'}
                          </Text>
                        }
                      />
                    )}
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
                  { name: 'tickets', color: 'red.6' },
                  { name: 'resolved', color: 'green.6' },
                ]}
                curveType='linear'
                unit=' tickets'
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
                series={[{ name: 'count', color: 'red.6' }]}
                orientation='vertical'
                unit=' tickets'
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
              Recent Activity
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
              <Grid.Col span={12}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Recent Activity
                  </Title>
                  <Timeline active={-1} bulletSize={24} lineWidth={2}>
                    {allTicketsForStats?.slice(0, 5).map((ticket: Ticket) => (
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
              </Grid.Col>
            </Grid>
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
