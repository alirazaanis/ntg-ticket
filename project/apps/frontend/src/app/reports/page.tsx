'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  Loader,
} from '@mantine/core';
import {
  IconRefresh,
  IconUsers,
  IconTicket,
  IconClock,
  IconCheck,
  IconChartBar,
  IconFileExport,
  IconShield,
  IconAlertTriangle,
} from '@tabler/icons-react';
import {
  useTicketReport,
  useSlaReport,
  useUserDistribution,
  useExportReport,
} from '../../hooks/useReports';
import { useUsers } from '../../hooks/useUsers';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import {
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/constants';

interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  priority?: string[];
  category?: string[];
  assignedTo?: string[];
  department?: string[];
}

// Using centralized constants from lib/constants.ts

export default function ReportsPage() {
  const t = useTranslations('reports');
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const { data: ticketReport } = useTicketReport({
    ...filters,
    assignedTo: filters.assignedTo?.[0],
  });
  const { data: slaReport, isLoading: slaReportLoading } = useSlaReport({
    ...filters,
    assignedTo: filters.assignedTo?.[0],
  });
  const { data: userDistribution, isLoading: userDistributionLoading } =
    useUserDistribution();
  const { data: users, isLoading: usersLoading } = useUsers({ limit: 1000 });
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
          <Title order={2}>Administrative Reports</Title>
          <Text c='dimmed' size='sm'>
            User management, ticket analytics, and SLA compliance reports
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
            {t('exportReport')}
          </Button>
        </Group>
      </Group>

      {/* Filters */}
      <Card mb='xl'>
        <Stack>
          <Group justify='space-between'>
            <Title order={4}>Report Filters</Title>
            <Button
              variant='outline'
              leftSection={<IconRefresh size={16} />}
              onClick={() => setFilters({})}
              disabled={Object.keys(filters).length === 0}
            >
              Clear All Filters
            </Button>
          </Group>
          <Grid>
            <Grid.Col span={3}>
              <DatePickerInput
                label='From Date'
                placeholder='Select start date'
                value={filters.dateFrom ? new Date(filters.dateFrom) : null}
                onChange={(date: Date | null) =>
                  setFilters({ ...filters, dateFrom: date?.toISOString() })
                }
                clearable
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <DatePickerInput
                label='To Date'
                placeholder='Select end date'
                value={filters.dateTo ? new Date(filters.dateTo) : null}
                onChange={(date: Date | null) =>
                  setFilters({ ...filters, dateTo: date?.toISOString() })
                }
                clearable
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <MultiSelect
                label='Status'
                placeholder='Select status'
                data={STATUS_OPTIONS}
                value={filters.status || []}
                onChange={value => setFilters({ ...filters, status: value })}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <MultiSelect
                label='Priority'
                placeholder='Select priority'
                data={PRIORITY_OPTIONS}
                value={filters.priority || []}
                onChange={value => setFilters({ ...filters, priority: value })}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <MultiSelect
                label='Category'
                placeholder='Select category'
                data={CATEGORY_OPTIONS}
                value={filters.category || []}
                onChange={value => setFilters({ ...filters, category: value })}
                clearable
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
            {t('overview')}
          </Tabs.Tab>
          <Tabs.Tab value='tickets' leftSection={<IconTicket size={16} />}>
            {t('ticketReport')}
          </Tabs.Tab>
          <Tabs.Tab value='users' leftSection={<IconUsers size={16} />}>
            {t('userReport')}
          </Tabs.Tab>
          <Tabs.Tab value='sla' leftSection={<IconClock size={16} />}>
            SLA Compliance
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
                        <IconTicket size={24} color='red' />
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
                {userDistributionLoading ? (
                  <Group justify='center' py='xl'>
                    <Loader size='sm' />
                    <Text>Loading user data...</Text>
                  </Group>
                ) : (
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
                )}
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  User Activity Summary
                </Title>
                {userDistributionLoading ? (
                  <Group justify='center' py='xl'>
                    <Loader size='sm' />
                    <Text>Loading user data...</Text>
                  </Group>
                ) : (
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
                )}
              </Card>
            </Grid.Col>
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  User Management Summary
                </Title>
                {usersLoading ? (
                  <Group justify='center' py='xl'>
                    <Loader size='sm' />
                    <Text>Loading user management data...</Text>
                  </Group>
                ) : (
                  <Grid>
                    <Grid.Col span={3}>
                      <Card padding='md'>
                        <Group>
                          <IconUsers size={24} color='blue' />
                          <div>
                            <Text size='sm' c='dimmed'>
                              Total Users
                            </Text>
                            <Text size='xl' fw={700}>
                              {users?.length || 0}
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
                              Active Users
                            </Text>
                            <Text size='xl' fw={700} c='green'>
                              {users?.filter(user => user.isActive).length || 0}
                            </Text>
                          </div>
                        </Group>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Card padding='md'>
                        <Group>
                          <IconAlertTriangle size={24} color='red' />
                          <div>
                            <Text size='sm' c='dimmed'>
                              Inactive Users
                            </Text>
                            <Text size='xl' fw={700} c='red'>
                              {users?.filter(user => !user.isActive).length ||
                                0}
                            </Text>
                          </div>
                        </Group>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Card padding='md'>
                        <Group>
                          <IconShield size={24} color='purple' />
                          <div>
                            <Text size='sm' c='dimmed'>
                              Administrators
                            </Text>
                            <Text size='xl' fw={700} c='purple'>
                              {users?.filter(user => user.role === 'ADMIN')
                                .length || 0}
                            </Text>
                          </div>
                        </Group>
                      </Card>
                    </Grid.Col>
                  </Grid>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value='sla'>
          <Grid mt='md'>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  SLA Compliance Overview
                </Title>
                {slaReportLoading ? (
                  <Group justify='center' py='xl'>
                    <Loader size='sm' />
                    <Text>Loading SLA data...</Text>
                  </Group>
                ) : (
                  <RingProgress
                    size={200}
                    thickness={20}
                    sections={[
                      { value: slaReport?.compliance || 0, color: 'green' },
                      {
                        value: 100 - (slaReport?.compliance || 0),
                        color: 'red',
                      },
                    ]}
                    label={
                      <Text ta='center' size='xl' fw={700}>
                        {slaReport?.compliance || 0}%
                      </Text>
                    }
                  />
                )}
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  Key SLA Metrics
                </Title>
                {slaReportLoading ? (
                  <Group justify='center' py='xl'>
                    <Loader size='sm' />
                    <Text>Loading SLA data...</Text>
                  </Group>
                ) : (
                  <Stack gap='md'>
                    <Group justify='space-between'>
                      <Text size='sm' c='dimmed'>
                        Response Time Compliance
                      </Text>
                      <Text size='lg' fw={600}>
                        {slaReport?.slaMetrics?.responseTime || 0}%
                      </Text>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm' c='dimmed'>
                        Resolution Time Compliance
                      </Text>
                      <Text size='lg' fw={600}>
                        {slaReport?.slaMetrics?.resolutionTime || 0}%
                      </Text>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm' c='dimmed'>
                        SLA Violations
                      </Text>
                      <Text size='lg' fw={600} c='red'>
                        {slaReport?.violations || 0}
                      </Text>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm' c='dimmed'>
                        Overall Satisfaction
                      </Text>
                      <Text size='lg' fw={600} c='green'>
                        {slaReport?.slaMetrics?.customerSatisfaction || 0}%
                      </Text>
                    </Group>
                  </Stack>
                )}
              </Card>
            </Grid.Col>
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  SLA Compliance Summary
                </Title>
                <Text size='sm' c='dimmed' mb='md'>
                  This report shows how well the ticketing system is meeting
                  service level agreements. High compliance rates indicate good
                  service quality and customer satisfaction.
                </Text>
                <Grid>
                  <Grid.Col span={4}>
                    <Card padding='md' style={{ textAlign: 'center' }}>
                      <IconCheck
                        size={32}
                        color='green'
                        style={{ margin: '0 auto 8px' }}
                      />
                      <Text size='sm' c='dimmed'>
                        Good Performance
                      </Text>
                      <Text size='lg' fw={600} c='green'>
                        {(slaReport?.compliance || 0) >= 90
                          ? 'Yes'
                          : 'Needs Improvement'}
                      </Text>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Card padding='md' style={{ textAlign: 'center' }}>
                      <IconAlertTriangle
                        size={32}
                        color='orange'
                        style={{ margin: '0 auto 8px' }}
                      />
                      <Text size='sm' c='dimmed'>
                        Areas for Improvement
                      </Text>
                      <Text size='lg' fw={600} c='orange'>
                        {(slaReport?.violations || 0) > 0 ? 'Yes' : 'None'}
                      </Text>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Card padding='md' style={{ textAlign: 'center' }}>
                      <IconShield
                        size={32}
                        color='blue'
                        style={{ margin: '0 auto 8px' }}
                      />
                      <Text size='sm' c='dimmed'>
                        System Health
                      </Text>
                      <Text size='lg' fw={600} c='blue'>
                        {(slaReport?.compliance || 0) >= 80
                          ? 'Healthy'
                          : 'Attention Needed'}
                      </Text>
                    </Card>
                  </Grid.Col>
                </Grid>
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
