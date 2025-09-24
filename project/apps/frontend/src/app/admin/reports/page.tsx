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
  Stack,
  Select,
  Tabs,
  RingProgress,
  Progress,
  Table,
  Badge,
  Loader,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { AreaChart, BarChart, PieChart } from '@mantine/charts';
import {
  IconDownload,
  IconCalendar,
  IconChartBar,
  IconTrendingUp,
  IconTicket,
  IconClock,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useTicketReport } from '../../../hooks/useReports';
import { reportsApi } from '../../../lib/apiClient';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [activeTab, setActiveTab] = useState<string | null>('overview');

  const reportFilters = {
    dateFrom: dateRange[0]?.toISOString(),
    dateTo: dateRange[1]?.toISOString(),
  };

  const { data: reportData, isLoading, error } = useTicketReport(reportFilters);

  const ticketStats = {
    total: reportData?.tickets?.total || 0,
    resolved: reportData?.tickets?.byStatus?.RESOLVED || 0,
    pending:
      (reportData?.tickets?.byStatus?.NEW || 0) +
      (reportData?.tickets?.byStatus?.OPEN || 0),
    overdue: 0, // This would need to be calculated separately
    new: reportData?.tickets?.byStatus?.NEW || 0,
    inProgress: reportData?.tickets?.byStatus?.IN_PROGRESS || 0,
    closed: reportData?.tickets?.byStatus?.CLOSED || 0,
  };

  const resolutionTime = reportData?.ticketTrendData || [];
  const ticketsByCategory =
    reportData?.categoryStats?.map(
      (cat: { name: string; count: number; percentage: number }) => ({
        name: cat.name,
        value: cat.count,
        color: 'blue.6',
      })
    ) || [];

  const ticketsByPriority = reportData?.tickets?.byPriority
    ? Object.entries(reportData.tickets.byPriority).map(
        ([priority, count]) => ({
          priority,
          count,
          color: 'blue.6',
        })
      )
    : [];

  const topPerformers = reportData?.teamPerformance || [];

  const handleExport = async () => {
    try {
      const response = await reportsApi.exportReports(reportFilters);

      if (response.status !== 200) {
        throw new Error('Export failed');
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // Handle export error silently or show user notification
    }
  };

  if (isLoading) {
    return (
      <Container size='xl' py='md'>
        <Group justify='center' mt='xl'>
          <Loader size='lg' />
          <Text>Loading reports...</Text>
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size='xl' py='md'>
        <Alert icon={<IconAlertCircle size={16} />} title='Error' color='red'>
          Failed to load reports: {String(error)}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size='xl' py='md'>
      <Group justify='space-between' mb='xl'>
        <div>
          <Title order={1}>Reports & Analytics</Title>
          <Text c='dimmed'>Track performance and generate insights</Text>
        </div>
        <Button leftSection={<IconDownload size={16} />} onClick={handleExport}>
          Export Report
        </Button>
      </Group>

      <Grid mb='md'>
        <Grid.Col span={4}>
          <DateInput
            label='Start Date'
            placeholder='Select start date'
            value={dateRange[0]}
            onChange={value => setDateRange([value, dateRange[1]])}
            leftSection={<IconCalendar size={16} />}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <DateInput
            label='End Date'
            placeholder='Select end date'
            value={dateRange[1]}
            onChange={value => setDateRange([dateRange[0], value])}
            leftSection={<IconCalendar size={16} />}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label='Report Type'
            placeholder='Select report type'
            data={[
              { value: 'overview', label: 'Overview' },
              { value: 'performance', label: 'Performance' },
              { value: 'trends', label: 'Trends' },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </Grid.Col>
      </Grid>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value='overview' leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab
            value='performance'
            leftSection={<IconTrendingUp size={16} />}
          >
            Performance
          </Tabs.Tab>
          <Tabs.Tab value='trends' leftSection={<IconClock size={16} />}>
            Trends
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='overview' pt='md'>
          <Grid>
            <Grid.Col span={3}>
              <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Group justify='space-between'>
                  <div>
                    <Text size='sm' c='dimmed'>
                      Total Tickets
                    </Text>
                    <Text size='xl' fw={700}>
                      {ticketStats.total}
                    </Text>
                  </div>
                  <IconTicket size={32} color='var(--mantine-color-blue-6)' />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Group justify='space-between'>
                  <div>
                    <Text size='sm' c='dimmed'>
                      Resolved
                    </Text>
                    <Text size='xl' fw={700}>
                      {ticketStats.resolved}
                    </Text>
                  </div>
                  <IconCheck size={32} color='var(--mantine-color-green-6)' />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Group justify='space-between'>
                  <div>
                    <Text size='sm' c='dimmed'>
                      Pending
                    </Text>
                    <Text size='xl' fw={700}>
                      {ticketStats.pending}
                    </Text>
                  </div>
                  <IconClock size={32} color='var(--mantine-color-yellow-6)' />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Group justify='space-between'>
                  <div>
                    <Text size='sm' c='dimmed'>
                      Overdue
                    </Text>
                    <Text size='xl' fw={700}>
                      {ticketStats.overdue}
                    </Text>
                  </div>
                  <IconClock size={32} color='var(--mantine-color-red-6)' />
                </Group>
              </Card>
            </Grid.Col>
          </Grid>

          <Grid mt='md'>
            <Grid.Col span={6}>
              <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Title order={4} mb='md'>
                  Tickets by Category
                </Title>
                <PieChart
                  data={ticketsByCategory}
                  size={200}
                  withTooltip
                  tooltipDataSource='segment'
                />
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Title order={4} mb='md'>
                  Tickets by Priority
                </Title>
                <BarChart
                  h={200}
                  data={ticketsByPriority}
                  dataKey='priority'
                  series={[{ name: 'count', color: 'blue.6' }]}
                  withTooltip
                />
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value='performance' pt='md'>
          <Grid>
            <Grid.Col span={6}>
              <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Title order={4} mb='md'>
                  Resolution Time Trend
                </Title>
                <AreaChart
                  h={300}
                  data={resolutionTime}
                  dataKey='month'
                  series={[
                    { name: 'avg', color: 'blue.6', label: 'Average (days)' },
                    { name: 'target', color: 'red.6', label: 'Target (days)' },
                  ]}
                  withTooltip
                />
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Title order={4} mb='md'>
                  Resolution Rate
                </Title>
                <Stack align='center' gap='md'>
                  <RingProgress
                    size={200}
                    thickness={20}
                    sections={[
                      {
                        value: (ticketStats.resolved / ticketStats.total) * 100,
                        color: 'green',
                      },
                    ]}
                    label={
                      <Text ta='center' size='xl' fw={700}>
                        {Math.round(
                          (ticketStats.resolved / ticketStats.total) * 100
                        )}
                        %
                      </Text>
                    }
                  />
                  <Text size='sm' c='dimmed'>
                    Tickets resolved this month
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          <Card shadow='sm' padding='lg' radius='md' withBorder mt='md'>
            <Title order={4} mb='md'>
              Top Performers
            </Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Staff Member</Table.Th>
                  <Table.Th>Tickets Resolved</Table.Th>
                  <Table.Th>Avg. Resolution Time</Table.Th>
                  <Table.Th>Satisfaction Rating</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topPerformers.map((performer, index) => (
                  <Table.Tr key={performer.userName || `performer-${index}`}>
                    <Table.Td>
                      <Group gap='sm'>
                        <Text fw={500}>{performer.userName}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color='blue' variant='light'>
                        {performer.resolvedTickets}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text>{performer.avgResolutionTime} days</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap='xs'>
                        <Text>{performer.satisfactionRating}/5</Text>
                        <Progress
                          value={performer.satisfactionRating * 20}
                          size='sm'
                          color='green'
                          style={{ width: 60 }}
                        />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value='trends' pt='md'>
          <Grid>
            <Grid.Col span={12}>
              <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Title order={4} mb='md'>
                  Ticket Volume Trend
                </Title>
                <AreaChart
                  h={300}
                  data={reportData?.ticketTrendData || []}
                  dataKey='month'
                  series={[
                    { name: 'tickets', color: 'blue.6', label: 'New Tickets' },
                    { name: 'resolved', color: 'green.6', label: 'Resolved' },
                  ]}
                  withTooltip
                />
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
