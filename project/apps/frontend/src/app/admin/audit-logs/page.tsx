'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Button,
  Card,
  Group,
  Text,
  Badge,
  Stack,
  Grid,
  Table,
  Modal,
  TextInput,
  Select,
  ActionIcon,
  Alert,
  Tabs,
  Code,
  Pagination,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconSearch,
  IconRefresh,
  IconEye,
  IconUser,
  IconTicket,
  IconSettings,
  IconCheck,
  IconX,
  IconDatabase,
  IconDownload,
} from '@tabler/icons-react';
import { useAuditLogs, useExportAuditLogs } from '../../../hooks/useAuditLogs';
import { notifications } from '@mantine/notifications';

import { DatePickerInput } from '@mantine/dates';

interface AuditLogFilters {
  userId?: string;
  ticketId?: string;
  fieldName?: string;
  dateFrom?: Date;
  dateTo?: Date;
  action?: string;
  page?: number;
  limit?: number;
}

const ACTION_OPTIONS = [
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'ASSIGN', label: 'Assign' },
  { value: 'STATUS_CHANGE', label: 'Status Change' },
  { value: 'COMMENT', label: 'Comment' },
  { value: 'ATTACHMENT', label: 'Attachment' },
];

const FIELD_OPTIONS = [
  { value: 'title', label: 'Title' },
  { value: 'description', label: 'Description' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignedTo', label: 'Assigned To' },
  { value: 'category', label: 'Category' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' },
];

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedLog, setSelectedLog] = useState<{
    id: string;
    action: string;
    createdAt: string;
    user?: { name: string; email: string };
    ticket?: { title: string; ticketNumber: string };
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    resourceType?: string;
    metadata?: Record<string, unknown>;
  } | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { data: auditLogs, isLoading, refetch } = useAuditLogs(filters);
  const exportLogs = useExportAuditLogs();

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    refetch();
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleExport = async () => {
    try {
      const blob = await exportLogs.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      notifications.show({
        title: 'Success',
        message: 'Audit logs exported successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to export audit logs',
        color: 'red',
      });
    }
  };

  const handleLogClick = (log: {
    id: string;
    action: string;
    createdAt: string;
    user?: { name: string; email: string };
    ticket?: { title: string; ticketNumber: string };
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    resourceType?: string;
    metadata?: Record<string, unknown>;
  }) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'green',
      UPDATE: 'blue',
      DELETE: 'red',
      LOGIN: 'green',
      LOGOUT: 'gray',
      ASSIGN: 'yellow',
      STATUS_CHANGE: 'purple',
      COMMENT: 'blue',
      ATTACHMENT: 'orange',
    };
    return colors[action] || 'gray';
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, React.ReactNode> = {
      CREATE: <IconCheck size={14} />,
      UPDATE: <IconSettings size={14} />,
      DELETE: <IconX size={14} />,
      LOGIN: <IconUser size={14} />,
      LOGOUT: <IconUser size={14} />,
      ASSIGN: <IconUser size={14} />,
      STATUS_CHANGE: <IconTicket size={14} />,
      COMMENT: <IconTicket size={14} />,
      ATTACHMENT: <IconDownload size={14} />,
    };
    return icons[action] || <IconDatabase size={14} />;
  };

  return (
    <Container size='xl' py='md'>
      <Group justify='space-between' mb='xl'>
        <div>
          <Title order={2}>Audit Logs</Title>
          <Text c='dimmed' size='sm'>
            Track and monitor all system activities and changes
          </Text>
        </div>
        <Group>
          <Button
            variant='light'
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleExport}
            loading={exportLogs.isPending}
          >
            Export
          </Button>
        </Group>
      </Group>

      {/* Filters */}
      <Card mb='xl'>
        <Stack>
          <Title order={4}>Filter Audit Logs</Title>
          <Grid>
            <Grid.Col span={3}>
              <TextInput
                label='Search'
                placeholder='Search logs...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                leftSection={<IconSearch size={16} />}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label='Action'
                placeholder='Select action'
                data={ACTION_OPTIONS}
                value={filters.action}
                onChange={value =>
                  setFilters({ ...filters, action: value || undefined })
                }
                clearable
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label='Field'
                placeholder='Select field'
                data={FIELD_OPTIONS}
                value={filters.fieldName}
                onChange={value =>
                  setFilters({ ...filters, fieldName: value || undefined })
                }
                clearable
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Button onClick={handleSearch} fullWidth mt='xl'>
                Apply Filters
              </Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label='From Date'
                placeholder='Select start date'
                value={filters.dateFrom}
                onChange={(date: Date | null) =>
                  setFilters({ ...filters, dateFrom: date || undefined })
                }
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label='To Date'
                placeholder='Select end date'
                value={filters.dateTo}
                onChange={(date: Date | null) =>
                  setFilters({ ...filters, dateTo: date || undefined })
                }
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      <Tabs value={activeTab} onChange={value => setActiveTab(value || 'all')}>
        <Tabs.List>
          <Tabs.Tab value='all' leftSection={<IconDatabase size={16} />}>
            All Logs
          </Tabs.Tab>
          <Tabs.Tab value='tickets' leftSection={<IconTicket size={16} />}>
            Ticket Changes
          </Tabs.Tab>
          <Tabs.Tab value='users' leftSection={<IconUser size={16} />}>
            User Activities
          </Tabs.Tab>
          <Tabs.Tab value='system' leftSection={<IconSettings size={16} />}>
            System Events
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='all'>
          <Card mt='md'>
            <Stack>
              <Group justify='space-between'>
                <Title order={4}>All Audit Logs</Title>
                <Text size='sm' c='dimmed'>
                  {auditLogs?.pagination?.total || 0} total entries
                </Text>
              </Group>

              {isLoading ? (
                <Center py='xl'>
                  <Loader size='lg' />
                </Center>
              ) : (
                <>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Timestamp</Table.Th>
                        <Table.Th>User</Table.Th>
                        <Table.Th>Action</Table.Th>
                        <Table.Th>Resource</Table.Th>
                        <Table.Th>Field</Table.Th>
                        <Table.Th>Changes</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {auditLogs?.data?.map(
                        (log: {
                          id: string;
                          action: string;
                          createdAt: string;
                          user?: { name: string; email: string };
                          ticket?: { title: string; ticketNumber: string };
                          fieldName?: string;
                          oldValue?: string;
                          newValue?: string;
                          ipAddress?: string;
                          resourceType?: string;
                        }) => (
                          <Table.Tr key={log.id}>
                            <Table.Td>
                              <Stack gap='xs'>
                                <Text size='sm' fw={500}>
                                  {new Date(log.createdAt).toLocaleString()}
                                </Text>
                                <Text size='xs' c='dimmed'>
                                  {new Date(log.createdAt).toLocaleDateString()}
                                </Text>
                              </Stack>
                            </Table.Td>
                            <Table.Td>
                              <Stack gap='xs'>
                                <Text size='sm' fw={500}>
                                  {log.user?.name || 'System'}
                                </Text>
                                <Text size='xs' c='dimmed'>
                                  {log.user?.email || 'system@ntg-ticket.com'}
                                </Text>
                              </Stack>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={getActionColor(log.action)}
                                variant='light'
                                leftSection={getActionIcon(log.action)}
                                size='sm'
                              >
                                {log.action}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size='sm'>
                                {log.ticket?.title || log.resourceType || 'N/A'}
                              </Text>
                              {log.ticket?.ticketNumber && (
                                <Text size='xs' c='dimmed'>
                                  #{log.ticket.ticketNumber}
                                </Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Text size='sm'>{log.fieldName || 'N/A'}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Group gap='xs'>
                                {log.oldValue && (
                                  <Badge color='red' variant='light' size='xs'>
                                    Old
                                  </Badge>
                                )}
                                {log.newValue && (
                                  <Badge
                                    color='green'
                                    variant='light'
                                    size='xs'
                                  >
                                    New
                                  </Badge>
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <ActionIcon
                                variant='light'
                                size='sm'
                                onClick={() => handleLogClick(log)}
                              >
                                <IconEye size={14} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        )
                      )}
                    </Table.Tbody>
                  </Table>

                  {auditLogs?.pagination && (
                    <Group justify='center' mt='md'>
                      <Pagination
                        value={filters.page || 1}
                        onChange={handlePageChange}
                        total={auditLogs.pagination.totalPages}
                        size='sm'
                      />
                    </Group>
                  )}
                </>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value='tickets'>
          <Card mt='md'>
            <Stack>
              <Title order={4}>Ticket Changes</Title>
              <Alert color='blue' title='Ticket Activity'>
                All changes made to tickets including status updates,
                assignments, and content modifications.
              </Alert>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ticket</Table.Th>
                    <Table.Th>Action</Table.Th>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Changes</Table.Th>
                    <Table.Th>Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {auditLogs?.data
                    ?.filter(
                      log =>
                        log.details &&
                        typeof log.details === 'object' &&
                        'ticket' in log.details
                    )
                    .map(log => {
                      const ticketInfo = log.details.ticket as {
                        id: string;
                        title: string;
                      };
                      return (
                        <Table.Tr key={log.id}>
                          <Table.Td>
                            <Stack gap='xs'>
                              <Text fw={500}>{ticketInfo?.title}</Text>
                              <Text size='xs' c='dimmed'>
                                #{ticketInfo?.id}
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={getActionColor(log.action)}
                              variant='light'
                              size='sm'
                            >
                              {log.action}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm'>{log.user?.name || 'System'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap='xs'>
                              {log.details.oldValue !== undefined &&
                                log.details.oldValue !== null && (
                                  <Badge color='red' variant='light' size='xs'>
                                    Old
                                  </Badge>
                                )}
                              {log.details.newValue !== undefined &&
                                log.details.newValue !== null && (
                                  <Badge
                                    color='green'
                                    variant='light'
                                    size='xs'
                                  >
                                    New
                                  </Badge>
                                )}
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm'>
                              {new Date(log.createdAt).toLocaleString()}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value='users'>
          <Card mt='md'>
            <Stack>
              <Title order={4}>User Activities</Title>
              <Alert color='green' title='User Activity'>
                Login, logout, profile changes, and other user-related
                activities.
              </Alert>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Action</Table.Th>
                    <Table.Th>Details</Table.Th>
                    <Table.Th>IP Address</Table.Th>
                    <Table.Th>Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {auditLogs?.data
                    ?.filter(
                      (log: {
                        id: string;
                        action: string;
                        createdAt: string;
                        user?: { name: string; email: string };
                        fieldName?: string;
                        ipAddress?: string;
                      }) => ['LOGIN', 'LOGOUT', 'UPDATE'].includes(log.action)
                    )
                    .map(
                      (log: {
                        id: string;
                        action: string;
                        createdAt: string;
                        user?: { name: string; email: string };
                        fieldName?: string;
                        ipAddress?: string;
                      }) => (
                        <Table.Tr key={log.id}>
                          <Table.Td>
                            <Stack gap='xs'>
                              <Text fw={500}>
                                {log.user?.name || 'Unknown'}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                {log.user?.email || 'N/A'}
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={getActionColor(log.action)}
                              variant='light'
                              size='sm'
                            >
                              {log.action}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm'>{log.fieldName || 'N/A'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm'>{log.ipAddress || 'N/A'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm'>
                              {new Date(log.createdAt).toLocaleString()}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )
                    )}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value='system'>
          <Card mt='md'>
            <Stack>
              <Title order={4}>System Events</Title>
              <Alert color='orange' title='System Events'>
                System-level events, configuration changes, and administrative
                actions.
              </Alert>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Event</Table.Th>
                    <Table.Th>Severity</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {auditLogs?.data
                    ?.filter(
                      (log: {
                        id: string;
                        action: string;
                        createdAt: string;
                        description?: string;
                      }) => log.action === 'SYSTEM'
                    )
                    .map(
                      (log: {
                        id: string;
                        action: string;
                        createdAt: string;
                        description?: string;
                      }) => (
                        <Table.Tr key={log.id}>
                          <Table.Td>
                            <Text fw={500}>{log.action}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color='orange' variant='light' size='sm'>
                              System
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm'>
                              {log.description || 'System event'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm'>
                              {new Date(log.createdAt).toLocaleString()}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )
                    )}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Detail Modal */}
      <Modal
        opened={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title='Audit Log Details'
        size='lg'
      >
        {selectedLog && (
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <Text fw={500}>Timestamp</Text>
                <Text>{new Date(selectedLog.createdAt).toLocaleString()}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={500}>Action</Text>
                <Badge
                  color={getActionColor(selectedLog.action)}
                  variant='light'
                  leftSection={getActionIcon(selectedLog.action)}
                >
                  {selectedLog.action}
                </Badge>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Text fw={500}>User</Text>
                <Text>{selectedLog.user?.name || 'System'}</Text>
                <Text size='sm' c='dimmed'>
                  {selectedLog.user?.email || 'system@ntg-ticket.com'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={500}>IP Address</Text>
                <Text>{selectedLog.ipAddress || 'N/A'}</Text>
              </Grid.Col>
            </Grid>

            {selectedLog.ticket && (
              <Stack>
                <Text fw={500}>Ticket</Text>
                <Text>{selectedLog.ticket.title}</Text>
                <Text size='sm' c='dimmed'>
                  #{selectedLog.ticket.ticketNumber}
                </Text>
              </Stack>
            )}

            <Stack>
              <Text fw={500}>Field Changes</Text>
              <Grid>
                <Grid.Col span={6}>
                  <Text size='sm' c='dimmed'>
                    Field
                  </Text>
                  <Text>{selectedLog.fieldName || 'N/A'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size='sm' c='dimmed'>
                    Resource Type
                  </Text>
                  <Text>{selectedLog.resourceType || 'N/A'}</Text>
                </Grid.Col>
              </Grid>
            </Stack>

            {(selectedLog.oldValue || selectedLog.newValue) && (
              <Stack>
                <Text fw={500}>Value Changes</Text>
                <Grid>
                  {selectedLog.oldValue && (
                    <Grid.Col span={6}>
                      <Text size='sm' c='dimmed'>
                        Old Value
                      </Text>
                      <Code block>{String(selectedLog.oldValue)}</Code>
                    </Grid.Col>
                  )}
                  {selectedLog.newValue && (
                    <Grid.Col span={6}>
                      <Text size='sm' c='dimmed'>
                        New Value
                      </Text>
                      <Code block>{String(selectedLog.newValue)}</Code>
                    </Grid.Col>
                  )}
                </Grid>
              </Stack>
            )}

            {selectedLog.metadata && (
              <Stack>
                <Text fw={500}>Additional Metadata</Text>
                <Code block>
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </Code>
              </Stack>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
