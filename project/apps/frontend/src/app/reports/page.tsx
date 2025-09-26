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
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
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

  const handleExportReport = async (type: string) => {
    try {
      const blob = await exportReport.mutateAsync({
        type,
        filters: {
          ...filters,
          assignedTo: filters.assignedTo?.[0],
        },
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${type}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      notifications.show({
        title: 'Success',
        message: 'Report exported successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to export report',
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
                            {systemMetrics?.uptime || 'N/A'}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Card padding='md'>
                      <Group>
                        <IconUsers size={24} color='green' />
                        <div>
                          <Text size='sm' c='dimmed'>
                            Active Users
                          </Text>
                          <Text size='xl' fw={700}>
                            {systemMetrics?.cpuUsage || 0}%
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
                            {systemMetrics?.memoryUsage || 0}%
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
                            Avg Resolution
                          </Text>
                          <Text size='xl' fw={700}>
                            {systemMetrics?.diskUsage || 0}%
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
                <Text c='dimmed'>
                  Chart visualization will be implemented here
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  Priority Distribution
                </Title>
                <Text c='dimmed'>
                  Chart visualization will be implemented here
                </Text>
              </Card>
            </Grid.Col>

            {/* Trends */}
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  Ticket Trends
                </Title>
                <Text c='dimmed'>
                  Trend chart visualization will be implemented here
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value='tickets'>
          <Card mt='md'>
            <Stack>
              <Title order={4}>Ticket Reports</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Count</Table.Th>
                    <Table.Th>Percentage</Table.Th>
                    <Table.Th>Trend</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ticketReport?.userDistribution?.map(item => (
                    <Table.Tr key={item.role}>
                      <Table.Td>
                        <Text fw={500}>{item.role}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>{item.count}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>0</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>N/A</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>N/A</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value='users'>
          <Grid mt='md'>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  User Distribution
                </Title>
                <Text c='dimmed'>
                  Bar chart visualization will be implemented here
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card>
                <Title order={4} mb='md'>
                  User Activity
                </Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Department</Table.Th>
                      <Table.Th>Users</Table.Th>
                      <Table.Th>Tickets</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {userDistribution?.map(item => (
                      <Table.Tr key={item.role}>
                        <Table.Td>{item.role}</Table.Td>
                        <Table.Td>{item.count}</Table.Td>
                        <Table.Td>0</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
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
                  <Grid.Col span={6}>
                    <Card padding='md'>
                      <Text size='sm' c='dimmed'>
                        Average Resolution Time
                      </Text>
                      <Text size='xl' fw={700}>
                        {slaReport?.slaMetrics?.resolutionTime || 0}h
                      </Text>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={6}>
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
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value='performance'>
          <Grid mt='md'>
            <Grid.Col span={12}>
              <Card>
                <Title order={4} mb='md'>
                  Performance Metrics
                </Title>
                <Text c='dimmed'>
                  Performance chart visualization will be implemented here
                </Text>
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
              onClick={() => handleExportReport(activeTab)}
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
