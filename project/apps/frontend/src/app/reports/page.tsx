'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Button,
  Card,
  Group,
  Text,
  Stack,
  Grid,
  Table,
  Modal,
  MultiSelect,
  Select,
  Tabs,
  RingProgress,
} from '@mantine/core';
import {
  IconRefresh,
  IconTrendingUp,
  IconUsers,
  IconTicket,
  IconClock,
  IconCheck,
  IconChartBar,
  IconFileExport,
} from '@tabler/icons-react';
import {
  useTicketReport,
  useSlaReport,
  useSystemMetrics,
  useUserDistribution,
  useExportReport,
} from '../../hooks/useReports';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';

interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  priority?: string[];
  category?: string[];
  assignedTo?: string[];
  department?: string[];
}

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REOPENED', label: 'Reopened' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const CATEGORY_OPTIONS = [
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'NETWORK', label: 'Network' },
  { value: 'ACCESS', label: 'Access' },
  { value: 'OTHER', label: 'Other' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const { data: ticketReport } = useTicketReport({
    ...filters,
    assignedTo: filters.assignedTo?.[0],
  });
  const { data: slaReport } = useSlaReport({
    ...filters,
    assignedTo: filters.assignedTo?.[0],
  });
  const { data: systemMetrics } = useSystemMetrics();
  const { data: userDistribution } = useUserDistribution();
  const exportReport = useExportReport();

  const handleExportReport = async (format: string) => {
    try {
      const blob = await exportReport.mutateAsync({
        type: 'tickets', // Always export tickets data
        format,
        filters: {
          ...filters,
          assignedTo: filters.assignedTo?.[0],
        },
      });

      // Create download link for the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${format}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportModalOpen(false);

      notifications.show({
        title: 'Success',
        message: `Report exported successfully as ${format.toUpperCase()}`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        color: 'red',
      });
    }
  };

  return (
    <Container size='xl' py='md'>
      <Group justify='space-between' mb='xl'>
        <div>
          <Title order={2}>Reports & Analytics</Title>
          <Text c='dimmed' size='sm'>
            Comprehensive reporting and analytics dashboard
          </Text>
        </div>
        <Group>
          <Button
            variant='light'
            leftSection={<IconRefresh size={16} />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button
            leftSection={<IconFileExport size={16} />}
            onClick={() => setExportModalOpen(true)}
          >
            Export Report
          </Button>
        </Group>
      </Group>

      {/* Filters */}
      <Card mb='xl'>
        <Stack>
          <Title order={4}>Report Filters</Title>
          <Grid>
            <Grid.Col span={3}>
              <DatePickerInput
                label='From Date'
                placeholder='Select start date'
                value={
                  filters.dateFrom ? new Date(filters.dateFrom) : undefined
                }
                onChange={(date: Date | null) =>
                  setFilters({ ...filters, dateFrom: date?.toISOString() })
                }
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <DatePickerInput
                label='To Date'
                placeholder='Select end date'
                value={filters.dateTo ? new Date(filters.dateTo) : undefined}
                onChange={(date: Date | null) =>
                  setFilters({ ...filters, dateTo: date?.toISOString() })
                }
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <MultiSelect
                label='Status'
                placeholder='Select status'
                data={STATUS_OPTIONS}
                value={filters.status}
                onChange={value => setFilters({ ...filters, status: value })}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <MultiSelect
                label='Priority'
                placeholder='Select priority'
                data={PRIORITY_OPTIONS}
                value={filters.priority}
                onChange={value => setFilters({ ...filters, priority: value })}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <MultiSelect
                label='Category'
                placeholder='Select category'
                data={CATEGORY_OPTIONS}
                value={filters.category}
                onChange={value => setFilters({ ...filters, category: value })}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      <Tabs
        value={activeTab}
        onChange={value => setActiveTab(value || 'overview')}
      >
        <Tabs.List>
          <Tabs.Tab value='overview' leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value='tickets' leftSection={<IconTicket size={16} />}>
            Tickets
          </Tabs.Tab>
          <Tabs.Tab value='users' leftSection={<IconUsers size={16} />}>
            Users
          </Tabs.Tab>
          <Tabs.Tab value='sla' leftSection={<IconClock size={16} />}>
            SLA
          </Tabs.Tab>
          <Tabs.Tab
            value='performance'
            leftSection={<IconTrendingUp size={16} />}
          >
            Performance
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='overview'>
          <Grid mt='md'>
            {/* Key Metrics */}
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  Key Metrics
                </Title>
                <Grid>
                  <Grid.Col span={3}>
                    <Card padding='md'>
                      <Group>
                        <IconTicket size={24} color='blue' />
                        <div>
                          <Text size='sm' c='dimmed'>
                            Total Tickets
                          </Text>
                          <Text size='xl' fw={700}>
                            {ticketReport?.ticketStats?.total || 0}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Card padding='md'>
                      <Group>
                        <IconCheck size={24} color='green' />
                        <div>
                          <Text size='sm' c='dimmed'>
                            Resolved
                          </Text>
                          <Text size='xl' fw={700}>
                            {ticketReport?.ticketStats?.resolved || 0}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Card padding='md'>
                      <Group>
                        <IconClock size={24} color='orange' />
                        <div>
                          <Text size='sm' c='dimmed'>
                            Pending
                          </Text>
                          <Text size='xl' fw={700}>
                            {ticketReport?.ticketStats?.pending || 0}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Card padding='md'>
                      <Group>
                        <IconUsers size={24} color='red' />
                        <div>
                          <Text size='sm' c='dimmed'>
                            Overdue
                          </Text>
                          <Text size='xl' fw={700} c='red'>
                            {ticketReport?.ticketStats?.overdue || 0}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </Grid.Col>
                </Grid>
              </Card>
            </Grid.Col>

            {/* Charts */}
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  Ticket Status Distribution
                </Title>
                <Stack gap='md'>
                  {ticketReport?.ticketStats && (
                    <>
                      <Group justify='space-between'>
                        <Text size='sm'>New</Text>
                        <Text fw={500}>
                          {ticketReport.ticketStats.new || 0}
                        </Text>
                      </Group>
                      <Group justify='space-between'>
                        <Text size='sm'>In Progress</Text>
                        <Text fw={500}>
                          {ticketReport.ticketStats.inProgress || 0}
                        </Text>
                      </Group>
                      <Group justify='space-between'>
                        <Text size='sm'>Resolved</Text>
                        <Text fw={500} c='green'>
                          {ticketReport.ticketStats.resolved || 0}
                        </Text>
                      </Group>
                      <Group justify='space-between'>
                        <Text size='sm'>Closed</Text>
                        <Text fw={500} c='blue'>
                          {ticketReport.ticketStats.closed || 0}
                        </Text>
                      </Group>
                      <Group justify='space-between'>
                        <Text size='sm'>Overdue</Text>
                        <Text fw={500} c='red'>
                          {ticketReport.ticketStats.overdue || 0}
                        </Text>
                      </Group>
                    </>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  Priority Distribution
                </Title>
                <Stack gap='md'>
                  {ticketReport?.priorityStats?.map(item => (
                    <Group key={item.priority} justify='space-between'>
                      <Text
                        size='sm'
                        c={
                          item.priority === 'HIGH'
                            ? 'red'
                            : item.priority === 'MEDIUM'
                              ? 'orange'
                              : 'blue'
                        }
                      >
                        {item.priority}
                      </Text>
                      <Group gap='xs'>
                        <Text fw={500}>{item.count}</Text>
                        <Text size='xs' c='dimmed'>
                          ({item.percentage}%)
                        </Text>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Trends */}
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  Ticket Trends (Last 6 Months)
                </Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Month</Table.Th>
                      <Table.Th>Total Tickets</Table.Th>
                      <Table.Th>Resolved</Table.Th>
                      <Table.Th>Resolution Rate</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {ticketReport?.ticketTrendData?.map(trend => (
                      <Table.Tr key={trend.month}>
                        <Table.Td>
                          <Text fw={500}>{trend.month}</Text>
                        </Table.Td>
                        <Table.Td>{trend.tickets}</Table.Td>
                        <Table.Td>
                          <Text c='green'>{trend.resolved}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text
                            c={
                              trend.tickets > 0
                                ? trend.resolved / trend.tickets >= 0.8
                                  ? 'green'
                                  : 'orange'
                                : 'dimmed'
                            }
                          >
                            {trend.tickets > 0
                              ? Math.round(
                                  (trend.resolved / trend.tickets) * 100
                                )
                              : 0}
                            %
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value='tickets'>
          <Grid mt='md'>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  Ticket Status Distribution
                </Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Count</Table.Th>
                      <Table.Th>Percentage</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>New</Table.Td>
                      <Table.Td>{ticketReport?.ticketStats?.new || 0}</Table.Td>
                      <Table.Td>
                        {ticketReport?.ticketStats?.total
                          ? Math.round(
                              ((ticketReport.ticketStats.new || 0) /
                                ticketReport.ticketStats.total) *
                                100
                            )
                          : 0}
                        %
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>In Progress</Table.Td>
                      <Table.Td>
                        {ticketReport?.ticketStats?.inProgress || 0}
                      </Table.Td>
                      <Table.Td>
                        {ticketReport?.ticketStats?.total
                          ? Math.round(
                              ((ticketReport.ticketStats.inProgress || 0) /
                                ticketReport.ticketStats.total) *
                                100
                            )
                          : 0}
                        %
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Resolved</Table.Td>
                      <Table.Td>
                        {ticketReport?.ticketStats?.resolved || 0}
                      </Table.Td>
                      <Table.Td>
                        {ticketReport?.ticketStats?.total
                          ? Math.round(
                              ((ticketReport.ticketStats.resolved || 0) /
                                ticketReport.ticketStats.total) *
                                100
                            )
                          : 0}
                        %
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Closed</Table.Td>
                      <Table.Td>
                        {ticketReport?.ticketStats?.closed || 0}
                      </Table.Td>
                      <Table.Td>
                        {ticketReport?.ticketStats?.total
                          ? Math.round(
                              ((ticketReport.ticketStats.closed || 0) /
                                ticketReport.ticketStats.total) *
                                100
                            )
                          : 0}
                        %
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  Priority Distribution
                </Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Count</Table.Th>
                      <Table.Th>Percentage</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {ticketReport?.priorityStats?.map(item => (
                      <Table.Tr key={item.priority}>
                        <Table.Td>
                          <Text
                            fw={500}
                            c={
                              item.priority === 'HIGH'
                                ? 'red'
                                : item.priority === 'MEDIUM'
                                  ? 'orange'
                                  : 'blue'
                            }
                          >
                            {item.priority}
                          </Text>
                        </Table.Td>
                        <Table.Td>{item.count}</Table.Td>
                        <Table.Td>{item.percentage}%</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  Category Distribution
                </Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Count</Table.Th>
                      <Table.Th>Percentage</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {ticketReport?.categoryStats?.map(item => (
                      <Table.Tr key={item.name}>
                        <Table.Td>
                          <Text fw={500}>{item.name}</Text>
                        </Table.Td>
                        <Table.Td>{item.count}</Table.Td>
                        <Table.Td>{item.percentage}%</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value='users'>
          <Grid mt='md'>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  User Distribution by Role
                </Title>
                <Stack gap='md'>
                  {userDistribution?.map(item => (
                    <Group key={item.role} justify='space-between'>
                      <Text size='sm' fw={500}>
                        {item.role.replace('_', ' ')}
                      </Text>
                      <Group gap='xs'>
                        <Text fw={500}>{item.count}</Text>
                        <Text size='xs' c='dimmed'>
                          ({item.percentage}%)
                        </Text>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  User Activity Summary
                </Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Users</Table.Th>
                      <Table.Th>Percentage</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {userDistribution?.map(item => (
                      <Table.Tr key={item.role}>
                        <Table.Td>
                          <Text fw={500}>{item.role.replace('_', ' ')}</Text>
                        </Table.Td>
                        <Table.Td>{item.count}</Table.Td>
                        <Table.Td>
                          <Text c='blue'>{item.percentage}%</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  System Metrics
                </Title>
                <Grid>
                  <Grid.Col span={3}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed'>
                        System Uptime
                      </Text>
                      <Text size='xl' fw={700} c='green'>
                        {systemMetrics?.uptime || '99.9%'}
                      </Text>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed'>
                        Storage Used
                      </Text>
                      <Text size='xl' fw={700}>
                        {systemMetrics?.storageUsed || '2.4 GB'}
                      </Text>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed'>
                        CPU Usage
                      </Text>
                      <Text
                        size='xl'
                        fw={700}
                        c={
                          systemMetrics?.cpuUsage && systemMetrics.cpuUsage > 80
                            ? 'red'
                            : 'blue'
                        }
                      >
                        {systemMetrics?.cpuUsage || 0}%
                      </Text>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed'>
                        Memory Usage
                      </Text>
                      <Text
                        size='xl'
                        fw={700}
                        c={
                          systemMetrics?.memoryUsage &&
                          systemMetrics.memoryUsage > 80
                            ? 'red'
                            : 'blue'
                        }
                      >
                        {systemMetrics?.memoryUsage || 0}%
                      </Text>
                    </Card>
                  </Grid.Col>
                </Grid>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value='sla'>
          <Grid mt='md'>
            <Grid.Col span={4}>
              <Card>
                <Title order={4} mb='md'>
                  SLA Compliance
                </Title>
                <RingProgress
                  size={200}
                  thickness={20}
                  sections={[
                    { value: slaReport?.compliance || 0, color: 'green' },
                    { value: 100 - (slaReport?.compliance || 0), color: 'red' },
                  ]}
                  label={
                    <Text ta='center' size='xl' fw={700}>
                      {slaReport?.compliance || 0}%
                    </Text>
                  }
                />
              </Card>
            </Grid.Col>
            <Grid.Col span={8}>
              <Card>
                <Title order={4} mb='md'>
                  SLA Metrics
                </Title>
                <Grid>
                  <Grid.Col span={4}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed'>
                        Response Time Compliance
                      </Text>
                      <Text size='xl' fw={700}>
                        {slaReport?.slaMetrics?.responseTime || 0}%
                      </Text>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed'>
                        Resolution Time Compliance
                      </Text>
                      <Text size='xl' fw={700}>
                        {slaReport?.slaMetrics?.resolutionTime || 0}%
                      </Text>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed'>
                        SLA Violations
                      </Text>
                      <Text size='xl' fw={700} c='red'>
                        {slaReport?.violations || 0}
                      </Text>
                    </Card>
                  </Grid.Col>
                </Grid>
              </Card>
            </Grid.Col>
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  Customer Satisfaction & Resolution Time Trends
                </Title>
                <Grid>
                  <Grid.Col span={4}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed'>
                        Overall Satisfaction
                      </Text>
                      <Text size='xl' fw={700} c='green'>
                        {slaReport?.slaMetrics?.customerSatisfaction || 0}%
                      </Text>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={8}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed' mb='md'>
                        Average Resolution Time Trend (Last 6 Months)
                      </Text>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Month</Table.Th>
                            <Table.Th>Avg Resolution (Days)</Table.Th>
                            <Table.Th>Target (Days)</Table.Th>
                            <Table.Th>Status</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {ticketReport?.resolutionTimeData?.map(item => (
                            <Table.Tr key={item.month}>
                              <Table.Td>
                                <Text fw={500}>{item.month}</Text>
                              </Table.Td>
                              <Table.Td>{item.avg}</Table.Td>
                              <Table.Td>{item.target}</Table.Td>
                              <Table.Td>
                                <Text
                                  c={item.avg <= item.target ? 'green' : 'red'}
                                >
                                  {item.avg <= item.target
                                    ? '✓ On Target'
                                    : '✗ Over Target'}
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Card>
                  </Grid.Col>
                </Grid>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value='performance'>
          <Grid mt='md'>
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  Team Performance
                </Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Team Member</Table.Th>
                      <Table.Th>Assigned Tickets</Table.Th>
                      <Table.Th>Resolved Tickets</Table.Th>
                      <Table.Th>Avg Resolution Time</Table.Th>
                      <Table.Th>SLA Compliance</Table.Th>
                      <Table.Th>Satisfaction Rating</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {ticketReport?.teamPerformance?.map(member => (
                      <Table.Tr key={member.userId}>
                        <Table.Td>
                          <Text fw={500}>{member.userName}</Text>
                        </Table.Td>
                        <Table.Td>{member.assignedTickets}</Table.Td>
                        <Table.Td>{member.resolvedTickets}</Table.Td>
                        <Table.Td>{member.avgResolutionTime} days</Table.Td>
                        <Table.Td>
                          <Text
                            c={
                              member.slaCompliance >= 90
                                ? 'green'
                                : member.slaCompliance >= 70
                                  ? 'orange'
                                  : 'red'
                            }
                          >
                            {member.slaCompliance}%
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text c='green'>{member.satisfactionRating}/5</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>

      {/* Export Modal */}
      <Modal
        opened={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title='Export Report'
      >
        <Stack>
          <Select
            label='Export Format'
            placeholder='Select format'
            data={[
              { value: 'pdf', label: 'PDF' },
              { value: 'excel', label: 'Excel' },
              { value: 'csv', label: 'CSV' },
            ]}
            value={exportFormat}
            onChange={value => setExportFormat(value || 'pdf')}
          />
          <Group justify='flex-end'>
            <Button variant='light' onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleExportReport(exportFormat)}
              loading={exportReport.isPending}
            >
              Export
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
