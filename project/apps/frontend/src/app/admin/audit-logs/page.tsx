'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Table,
  Group,
  Text,
  Badge,
  TextInput,
  Select,
  DatePickerInput,
  Button,
  Card,
  Stack,
  Pagination,
  ActionIcon,
  Modal,
  Grid,
  Divider,
  ScrollArea,
  Code,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconRefresh,
  IconEye,
  IconUser,
  IconActivity,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import { AuditLogsFilters } from '../../../types/unified';

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<{
    id: string;
    timestamp: string;
    userName?: string;
    action: string;
    resource?: string;
    ipAddress?: string;
    status: string;
    details?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  } | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const [filters, setFilters] = useState<AuditLogsFilters>({
    page: currentPage,
    limit: pageSize,
    search: search,
    action: undefined,
    userId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });

  const { data: auditLogsData, isLoading, refetch } = useAuditLogs(filters);

  const auditLogs = auditLogsData?.data || [];
  const pagination = auditLogsData?.pagination;

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: search,
      page: 1,
    }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string | Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      page: page,
    }));
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'green';
      case 'update': return 'blue';
      case 'delete': return 'red';
      case 'login': return 'cyan';
      case 'logout': return 'gray';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <IconCheck size={16} />;
      case 'update': return <IconActivity size={16} />;
      case 'delete': return <IconX size={16} />;
      case 'login': return <IconUser size={16} />;
      case 'logout': return <IconUser size={16} />;
      case 'error': return <IconX size={16} />;
      default: return <IconActivity size={16} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'CREATE', label: 'Create' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'ERROR', label: 'Error' },
  ];

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Audit Logs</Title>
          <Text c="dimmed" size="sm">
            Monitor system activities and user actions
          </Text>
        </div>
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </Group>

      <Card>
        <Stack>
          {/* Filters */}
          <Group>
            <TextInput
              placeholder="Search logs..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Filter by action"
              data={actionOptions}
              value={filters.action || ''}
              onChange={(value) => handleFilterChange('action', value || undefined)}
              style={{ width: 200 }}
            />
            <DatePickerInput
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(value) => handleFilterChange('dateFrom', value)}
              style={{ width: 150 }}
            />
            <DatePickerInput
              placeholder="To date"
              value={filters.dateTo}
              onChange={(value) => handleFilterChange('dateTo', value)}
              style={{ width: 150 }}
            />
            <Button onClick={handleSearch} leftSection={<IconFilter size={16} />}>
              Apply Filters
            </Button>
          </Group>

          <Divider />

          {/* Audit Logs Table */}
          <ScrollArea>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Timestamp</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Resource</Table.Th>
                  <Table.Th>IP Address</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th width={80}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {auditLogs.map((log) => (
                  <Table.Tr key={log.id}>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatTimestamp(log.timestamp)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconUser size={14} />
                        <Text size="sm">{log.userName || 'System'}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getActionColor(log.action)}
                        variant="light"
                        leftSection={getActionIcon(log.action)}
                      >
                        {log.action}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{log.resource || 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{log.ipAddress || 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={log.status === 'SUCCESS' ? 'green' : 'red'}
                        variant="light"
                      >
                        {log.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setSelectedLog(log);
                          setDetailModalOpen(true);
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                value={currentPage}
                onChange={handlePageChange}
                total={pagination.totalPages}
              />
            </Group>
          )}
        </Stack>
      </Card>

      {/* Log Detail Modal */}
      <Modal
        opened={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Audit Log Details"
        size="lg"
      >
        {selectedLog && (
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>Timestamp</Text>
                <Text size="sm" c="dimmed">
                  {formatTimestamp(selectedLog.timestamp)}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>User</Text>
                <Text size="sm" c="dimmed">
                  {selectedLog.userName || 'System'}
                </Text>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>Action</Text>
                <Badge
                  color={getActionColor(selectedLog.action)}
                  variant="light"
                  leftSection={getActionIcon(selectedLog.action)}
                >
                  {selectedLog.action}
                </Badge>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>Status</Text>
                <Badge
                  color={selectedLog.status === 'SUCCESS' ? 'green' : 'red'}
                  variant="light"
                >
                  {selectedLog.status}
                </Badge>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>Resource</Text>
                <Text size="sm" c="dimmed">
                  {selectedLog.resource || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>IP Address</Text>
                <Text size="sm" c="dimmed">
                  {selectedLog.ipAddress || 'N/A'}
                </Text>
              </Grid.Col>
            </Grid>

            {selectedLog.details && (
              <div>
                <Text size="sm" fw={500} mb="xs">Details</Text>
                <Code block>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </Code>
              </div>
            )}

            {selectedLog.metadata && (
              <div>
                <Text size="sm" fw={500} mb="xs">Metadata</Text>
                <Code block>
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </Code>
              </div>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
