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
  Modal,
  TextInput,
  Select,
  NumberInput,
  Tabs,
  Card,
  Avatar,
  Progress,
  Loader,
  Table,
  Switch,
} from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import {
  IconPlus,
  IconSearch,
  IconTrendingUp,
  IconUsers,
  IconTicket,
  IconFileText,
  IconSettings,
  IconEye,
  IconEdit,
  IconTrash,
  IconDatabase,
  IconMail,
  IconServer,
  IconCpu,
  IconPlug,
  IconShield,
  IconChartBar,
  IconReport,
  IconClock,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import {
  useTickets,
  useTotalTicketsCount,
  useAllTicketsForCounting,
} from '../../hooks/useTickets';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '../../hooks/useUsers';
import { useSystemMetrics, useUserDistribution } from '../../hooks/useReports';
import { TicketCard } from '../ui/TicketCard';
import { User, CreateUserInput, UpdateUserInput } from '../../lib/apiClient';
import { Ticket, UserRole } from '../../types/unified';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { IntegrationsManagement } from '../admin/IntegrationsManagement';
import { PermissionsManagement } from '../admin/PermissionsManagement';
import { AuditTrail } from '../compliance/AuditTrail';
import { AuditLogStats } from '../compliance/AuditLogStats';
import { PAGINATION_CONFIG, PRIORITY_OPTIONS } from '../../lib/constants';

export function AdminDashboard() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const tHelp = useTranslations('help');
  const tSystem = useTranslations('system');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [userModalOpened, setUserModalOpened] = useState(false);
  const [settingsModalOpened, setSettingsModalOpened] = useState(false);
  const [integrationsModalOpened, setIntegrationsModalOpened] = useState(false);
  const [permissionsModalOpened, setPermissionsModalOpened] = useState(false);
  const [auditTrailModalOpened, setAuditTrailModalOpened] = useState(false);
  const [auditStatsModalOpened, setAuditStatsModalOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<CreateUserInput>>(
    {}
  );

  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: totalTicketsCount } = useTotalTicketsCount();
  const { data: allTicketsForStats } = useAllTicketsForCounting();

  const { data: users, isLoading: usersLoading } = useUsers({
    limit: PAGINATION_CONFIG.LARGE_PAGE_SIZE,
  });
  const { data: systemMetrics } = useSystemMetrics();
  const { data: userDistribution } = useUserDistribution();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return t('passwordMinLength', { minLength: 8 });
    }
    if (!/[A-Z]/.test(password)) {
      return t('passwordUppercase');
    }
    if (!/[a-z]/.test(password)) {
      return t('passwordLowercase');
    }
    if (!/\d/.test(password)) {
      return t('passwordNumber');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return t('passwordSpecial');
    }
    return null;
  };

  const handleCreateUser = async () => {
    try {
      // Validate required fields
      if (
        !userFormData.name ||
        !userFormData.email ||
        !userFormData.password ||
        !userFormData.role
      ) {
        notifications.show({
          title: t('validationError'),
          message: t('fillRequiredFields'),
          color: 'red',
        });
        return;
      }

      // Validate password
      const passwordError = validatePassword(userFormData.password);
      if (passwordError) {
        notifications.show({
          title: 'Password Validation Error',
          message: passwordError,
          color: 'red',
        });
        return;
      }

      await createUser.mutateAsync(userFormData as CreateUserInput);
      setUserModalOpened(false);
      setUserFormData({});
      notifications.show({
        title: 'Success',
        message: 'User created successfully',
        color: 'green',
      });
    } catch (error) {
      // Handle create user error
      notifications.show({
        title: 'Error',
        message: 'Failed to create user',
        color: 'red',
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      // Validate required fields for update
      if (!userFormData.name || !userFormData.email || !userFormData.role) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please fill in all required fields',
          color: 'red',
        });
        return;
      }

      // Remove password from update data if not provided
      const updateData = { ...userFormData };
      if (!updateData.password) {
        delete updateData.password;
      }

      // Update user data
      await updateUser.mutateAsync({
        id: selectedUser.id,
        data: updateData as UpdateUserInput,
      });
      setUserModalOpened(false);
      setSelectedUser(null);
      setUserFormData({});
      notifications.show({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
      });
    } catch (error) {
      // Handle update user error
      notifications.show({
        title: 'Error',
        message: 'Failed to update user',
        color: 'red',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser.mutateAsync(userId);
      notifications.show({
        title: 'Success',
        message: 'User deleted successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete user',
        color: 'red',
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setUserModalOpened(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserFormData({});
    setUserModalOpened(true);
  };

  const allTickets = tickets || [];

  // Filter users based on search query
  // Now users is directly User[] array, like tickets
  const filteredUsers =
    users?.filter(
      user =>
        user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    ) || [];

  // Filter tickets based on search query
  const filteredTickets = allTickets.filter(
    ticket =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate ticket stats similar to manager dashboard
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
      title: 'Total Tickets',
      value: totalTicketsCount || 0,
      icon: IconTicket,
      color: 'red',
    },
    {
      title: 'Open Tickets',
      value: openTickets.length,
      icon: IconClock,
      color: 'orange',
    },
    {
      title: 'Resolved Tickets',
      value: resolvedTickets.length,
      icon: IconCheck,
      color: 'green',
    },
    {
      title: 'Overdue Tickets',
      value: overdueTickets.length,
      icon: IconAlertCircle,
      color: 'red',
    },
  ];

  // Real data for charts
  const systemMetricsData = systemMetrics?.metrics || [];

  const userRoles = userDistribution || [];

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
            <Title order={2}>{tAdmin('systemAdministration')}</Title>
            <Text c='dimmed'>{tAdmin('manageSystemSettings')}</Text>
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
            <Tabs.Tab value='users' leftSection={<IconUsers size={16} />}>
              User Management
            </Tabs.Tab>
            <Tabs.Tab value='tickets' leftSection={<IconTicket size={16} />}>
              All Tickets
            </Tabs.Tab>
            <Tabs.Tab value='system' leftSection={<IconServer size={16} />}>
              System Status
            </Tabs.Tab>
            <Tabs.Tab value='settings' leftSection={<IconSettings size={16} />}>
              Settings
            </Tabs.Tab>
            <Tabs.Tab value='integrations' leftSection={<IconPlug size={16} />}>
              Integrations
            </Tabs.Tab>
            <Tabs.Tab
              value='permissions'
              leftSection={<IconShield size={16} />}
            >
              Permissions
            </Tabs.Tab>
            <Tabs.Tab value='logs' leftSection={<IconFileText size={16} />}>
              Audit Logs
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='overview' pt='md'>
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper withBorder p='lg' style={{ height: 320 }}>
                  <Group justify='space-between' mb='md'>
                    <Title order={3}>Ticket Status Overview</Title>
                    <Badge size='lg' variant='light' color='blue'>
                      Real-time Status
                    </Badge>
                  </Group>
                  <Grid>
                    <Grid.Col span={6}>
                      <Card withBorder p='sm' style={{ height: '100%' }}>
                        <Group>
                          <Avatar color='purple' size='md'>
                            <IconUsers size={16} />
                          </Avatar>
                          <div>
                            <Text size='sm' c='dimmed' mb={2}>
                              Assigned Tickets
                            </Text>
                            <Text size='xl' fw={700} c='purple'>
                              {allTicketsForStats?.filter(t => t.assignedTo)
                                .length || 0}
                            </Text>
                            <Text size='xs' c='dimmed'>
                              With assignee
                            </Text>
                          </div>
                        </Group>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Card withBorder p='sm' style={{ height: '100%' }}>
                        <Group>
                          <Avatar color='cyan' size='md'>
                            <IconClock size={16} />
                          </Avatar>
                          <div>
                            <Text size='sm' c='dimmed' mb={2}>
                              Avg. Response Time
                            </Text>
                            <Text size='xl' fw={700} c='cyan'>
                              {(() => {
                                const resolvedTickets =
                                  allTicketsForStats?.filter(
                                    t =>
                                      ['RESOLVED', 'CLOSED'].includes(
                                        t.status
                                      ) && t.responseTime
                                  ) || [];
                                if (resolvedTickets.length === 0) return '0h';

                                const totalResponseTime =
                                  resolvedTickets.reduce((acc, ticket) => {
                                    return acc + (ticket.responseTime || 0);
                                  }, 0);

                                const avgHours =
                                  totalResponseTime / resolvedTickets.length;
                                return avgHours < 24
                                  ? `${Math.round(avgHours)}h`
                                  : `${Math.round(avgHours / 24)}d`;
                              })()}
                            </Text>
                            <Text size='xs' c='dimmed'>
                              Time to resolve
                            </Text>
                          </div>
                        </Group>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Card withBorder p='sm' style={{ height: '100%' }}>
                        <Group>
                          <Avatar color='red' size='md'>
                            <IconAlertCircle size={16} />
                          </Avatar>
                          <div>
                            <Text size='sm' c='dimmed' mb={2}>
                              High Priority
                            </Text>
                            <Text size='xl' fw={700} c='red'>
                              {allTicketsForStats?.filter(
                                t =>
                                  t.priority === 'HIGH' ||
                                  t.priority === 'CRITICAL'
                              ).length || 0}
                            </Text>
                            <Text size='xs' c='dimmed'>
                              Urgent tickets
                            </Text>
                          </div>
                        </Group>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Card withBorder p='sm' style={{ height: '100%' }}>
                        <Group>
                          <Avatar color='teal' size='md'>
                            <IconTrendingUp size={16} />
                          </Avatar>
                          <div>
                            <Text size='sm' c='dimmed' mb={2}>
                              New This Week
                            </Text>
                            <Text size='xl' fw={700} c='teal'>
                              {allTicketsForStats?.filter(t => {
                                const created = new Date(t.createdAt);
                                const now = new Date();
                                const weekAgo = new Date(
                                  now.getTime() - 7 * 24 * 60 * 60 * 1000
                                );
                                return created >= weekAgo;
                              }).length || 0}
                            </Text>
                            <Text size='xs' c='dimmed'>
                              Last 7 days
                            </Text>
                          </div>
                        </Group>
                      </Card>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p='lg' style={{ height: 320 }}>
                  <Group justify='space-between' mb='md'>
                    <Title order={3}>Recent Tickets</Title>
                    <Badge size='sm' variant='light' color='gray'>
                      Latest 5
                    </Badge>
                  </Group>
                  <div
                    style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}
                  >
                    <Stack gap='sm'>
                      {allTickets?.slice(0, 5).map((ticket: Ticket) => (
                        <Card
                          key={ticket.id}
                          withBorder
                          p='xs'
                          style={{ cursor: 'pointer' }}
                        >
                          <Group justify='space-between'>
                            <div style={{ flex: 1 }}>
                              <Text size='sm' fw={600} c='blue'>
                                {ticket.ticketNumber}
                              </Text>
                              <Text size='xs' c='dimmed' lineClamp={1} mt={1}>
                                {ticket.title}
                              </Text>
                              <Text size='xs' c='dimmed' mt={1}>
                                {new Date(
                                  ticket.createdAt
                                ).toLocaleDateString()}
                              </Text>
                            </div>
                            <Badge
                              color={
                                ticket.status === 'OPEN'
                                  ? 'blue'
                                  : ticket.status === 'IN_PROGRESS'
                                    ? 'yellow'
                                    : ticket.status === 'RESOLVED'
                                      ? 'green'
                                      : ticket.status === 'CLOSED'
                                        ? 'gray'
                                        : 'orange'
                              }
                              size='sm'
                              variant='light'
                            >
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </Group>
                        </Card>
                      ))}
                      {(!allTickets || allTickets.length === 0) && (
                        <Card withBorder p='md' style={{ textAlign: 'center' }}>
                          <Text size='sm' c='dimmed'>
                            No tickets found
                          </Text>
                        </Card>
                      )}
                    </Stack>
                  </div>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper withBorder p='lg' style={{ height: 320 }}>
                  <Group justify='space-between' mb='md'>
                    <Title order={3}>Tickets by Priority</Title>
                    <Badge size='sm' variant='light' color='red'>
                      Distribution
                    </Badge>
                  </Group>
                  <Stack gap='md'>
                    {PRIORITY_OPTIONS.map(priority => {
                      const count =
                        allTicketsForStats?.filter(
                          t => t.priority === priority.value
                        ).length || 0;
                      const percentage = totalTicketsCount
                        ? (count / totalTicketsCount) * 100
                        : 0;
                      return (
                        <Card key={priority.value} withBorder p='sm'>
                          <Group justify='space-between' mb={8}>
                            <Group>
                              <Badge
                                color={
                                  priority.value === 'CRITICAL'
                                    ? 'red'
                                    : priority.value === 'HIGH'
                                      ? 'orange'
                                      : priority.value === 'MEDIUM'
                                        ? 'blue'
                                        : 'green'
                                }
                                variant='light'
                                size='sm'
                              >
                                {priority.label}
                              </Badge>
                              <Text size='sm' fw={600}>
                                {count} tickets
                              </Text>
                            </Group>
                            <Text size='sm' c='dimmed'>
                              {percentage.toFixed(1)}%
                            </Text>
                          </Group>
                          <Progress
                            value={percentage}
                            color={
                              priority.value === 'CRITICAL'
                                ? 'red'
                                : priority.value === 'HIGH'
                                  ? 'orange'
                                  : priority.value === 'MEDIUM'
                                    ? 'blue'
                                    : 'green'
                            }
                            size='md'
                            radius='xl'
                          />
                        </Card>
                      );
                    })}
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper withBorder p='lg' style={{ height: 320 }}>
                  <Group justify='space-between' mb='md'>
                    <Title order={3}>Tickets by Category</Title>
                    <Badge size='sm' variant='light' color='blue'>
                      Top 4
                    </Badge>
                  </Group>
                  <Stack gap='md'>
                    {allTickets?.reduce(
                      (acc: Record<string, number>, ticket: Ticket) => {
                        const category = ticket.category.name;
                        acc[category] = (acc[category] || 0) + 1;
                        return acc;
                      },
                      {}
                    ) &&
                      Object.entries(
                        allTicketsForStats?.reduce(
                          (acc: Record<string, number>, ticket: Ticket) => {
                            const category = ticket.category.name;
                            acc[category] = (acc[category] || 0) + 1;
                            return acc;
                          },
                          {}
                        ) || {}
                      )
                        .slice(0, 4)
                        .map(([category, count]) => {
                          const percentage = totalTicketsCount
                            ? (count / totalTicketsCount) * 100
                            : 0;
                          return (
                            <Card key={category} withBorder p='sm'>
                              <Group justify='space-between' mb={8}>
                                <Group>
                                  <Badge color='blue' variant='light' size='sm'>
                                    {category}
                                  </Badge>
                                  <Text size='sm' fw={600}>
                                    {count} tickets
                                  </Text>
                                </Group>
                                <Text size='sm' c='dimmed'>
                                  {percentage.toFixed(1)}%
                                </Text>
                              </Group>
                              <Progress
                                value={percentage}
                                color='blue'
                                size='md'
                                radius='xl'
                              />
                            </Card>
                          );
                        })}
                    {(!allTickets || allTickets.length === 0) && (
                      <Card withBorder p='lg' style={{ textAlign: 'center' }}>
                        <Text size='sm' c='dimmed'>
                          No tickets found
                        </Text>
                      </Card>
                    )}
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value='users' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>{tAdmin('userManagement')}</Title>
                <Group>
                  <TextInput
                    placeholder='Search users...'
                    leftSection={<IconSearch size={16} />}
                    value={userSearchQuery}
                    onChange={e => setUserSearchQuery(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddUser}
                  >
                    Add User
                  </Button>
                </Group>
              </Group>

              <Paper withBorder p='md'>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('user')}</Table.Th>
                      <Table.Th>{t('email')}</Table.Th>
                      <Table.Th>{t('role')}</Table.Th>
                      <Table.Th>{t('status')}</Table.Th>
                      <Table.Th>{t('lastLogin')}</Table.Th>
                      <Table.Th>{t('actions')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {usersLoading ? (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Group justify='center' py='xl'>
                            <Loader size='sm' />
                            <Text>Loading users...</Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ) : filteredUsers.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Group justify='center' py='xl'>
                            <Text c='dimmed'>{tAdmin('noUsersFound')}</Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredUsers.slice(0, 10).map((user: User) => (
                        <Table.Tr key={user.id}>
                          <Table.Td>
                            <Group>
                              <Avatar size='sm' />
                              <div>
                                <Text size='sm' fw={500}>
                                  {user.name}
                                </Text>
                                <Text size='xs' c='dimmed'>
                                  ID: {user.id}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>
                          <Table.Td>{user.email}</Table.Td>
                          <Table.Td>
                            <Badge color='red'>
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={user.isActive ? 'green' : 'red'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : 'Never'}
                          </Table.Td>
                          <Table.Td>
                            <Group gap='xs'>
                              <ActionIcon
                                size='sm'
                                variant='light'
                                onClick={() => {
                                  // View user functionality
                                }}
                              >
                                <IconEye size={14} />
                              </ActionIcon>
                              <ActionIcon
                                size='sm'
                                variant='light'
                                onClick={() => handleEditUser(user)}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                              <ActionIcon
                                size='sm'
                                variant='light'
                                color='red'
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='tickets' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>{tAdmin('allTickets')}</Title>
                <Group>
                  <TextInput
                    placeholder='Search tickets...'
                    leftSection={<IconSearch size={16} />}
                    style={{ width: 300 }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </Group>
              </Group>

              <Grid>
                {filteredTickets?.map((ticket: Ticket) => (
                  <Grid.Col key={ticket.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <TicketCard ticket={ticket} showActions />
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='system' pt='md'>
            {/* System Performance Charts */}
            <Grid mb='xl'>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    System Performance
                  </Title>
                  <AreaChart
                    h={300}
                    data={systemMetricsData}
                    dataKey='time'
                    series={[
                      { name: 'cpu', color: 'red.6' },
                      { name: 'memory', color: 'red.6' },
                      { name: 'disk', color: 'green.6' },
                    ]}
                    curveType='linear'
                    unit='%'
                  />
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    User Distribution
                  </Title>
                  <BarChart
                    h={300}
                    data={userRoles}
                    dataKey='role'
                    series={[{ name: 'count', color: 'red.6' }]}
                    orientation='vertical'
                    unit=' users'
                  />
                </Paper>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    System Health
                  </Title>
                  <Grid>
                    <Grid.Col span={12}>
                      <div>
                        <Text size='sm' c='dimmed' mb={4}>
                          Database Status
                        </Text>
                        <Group>
                          <IconDatabase color='green' size={20} />
                          <Text size='sm' c='green'>
                            Online
                          </Text>
                        </Group>
                      </div>
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <div>
                        <Text size='sm' c='dimmed' mb={4}>
                          Redis Cache
                        </Text>
                        <Group>
                          <IconCpu color='green' size={20} />
                          <Text size='sm' c='green'>
                            Online
                          </Text>
                        </Group>
                      </div>
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <div>
                        <Text size='sm' c='dimmed' mb={4}>
                          Email Service
                        </Text>
                        <Group>
                          <IconMail color='green' size={20} />
                          <Text size='sm' c='green'>
                            Online
                          </Text>
                        </Group>
                      </div>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Server Resources
                  </Title>
                  <Stack gap='md'>
                    <div>
                      <Group justify='space-between' mb={4}>
                        <Text size='sm'>CPU Usage</Text>
                        <Text size='sm' fw={500}>
                          {systemMetrics?.cpuUsage
                            ? `${systemMetrics.cpuUsage}%`
                            : 'Loading...'}
                        </Text>
                      </Group>
                      <Progress
                        value={systemMetrics?.cpuUsage || 0}
                        color='red'
                      />
                    </div>
                    <div>
                      <Group justify='space-between' mb={4}>
                        <Text size='sm'>{tSystem('memoryUsage')}</Text>
                        <Text size='sm' fw={500}>
                          {systemMetrics?.memoryUsage
                            ? `${systemMetrics.memoryUsage}%`
                            : 'Loading...'}
                        </Text>
                      </Group>
                      <Progress
                        value={systemMetrics?.memoryUsage || 0}
                        color='orange'
                      />
                    </div>
                    <div>
                      <Group justify='space-between' mb={4}>
                        <Text size='sm'>{tSystem('diskUsage')}</Text>
                        <Text size='sm' fw={500}>
                          {systemMetrics?.diskUsage
                            ? `${systemMetrics.diskUsage}%`
                            : 'Loading...'}
                        </Text>
                      </Group>
                      <Progress
                        value={systemMetrics?.diskUsage || 0}
                        color='green'
                      />
                    </div>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    {tSystem('databaseStatus')}
                  </Title>
                  <Stack gap='sm'>
                    <Group justify='space-between'>
                      <Text size='sm'>{tSystem('connectionPool')}</Text>
                      <Badge color='green'>{tSystem('healthy')}</Badge>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm'>{tSystem('queryPerformance')}</Text>
                      <Badge color='red'>{tSystem('good')}</Badge>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm'>{tSystem('lastBackup')}</Text>
                      <Text size='sm'>
                        {systemMetrics?.lastBackup || 'Loading...'}
                      </Text>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm'>{tSystem('databaseSize')}</Text>
                      <Text size='sm'>
                        {systemMetrics?.databaseSize || 'Loading...'}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    System Information
                  </Title>
                  <Stack gap='sm'>
                    <Group justify='space-between'>
                      <Text size='sm'>System Uptime</Text>
                      <Text size='sm' fw={500}>
                        {systemMetrics?.uptime || 'Loading...'}
                      </Text>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm'>Storage Used</Text>
                      <Text size='sm' fw={500}>
                        {systemMetrics?.storageUsed || 'Loading...'}
                      </Text>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm'>Active Users</Text>
                      <Text size='sm' fw={500}>
                        {users?.filter((u: User) => u.isActive).length || 0}
                      </Text>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm'>Total Users</Text>
                      <Text size='sm' fw={500}>
                        {users?.length || 0}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value='settings' pt='md'>
            <Stack gap='md'>
              <Title order={3}>{tSystem('systemSettings')}</Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper withBorder p='md'>
                    <Title order={4} mb='md'>
                      General Settings
                    </Title>
                    <Stack gap='md'>
                      <TextInput
                        label='System Name'
                        placeholder='NTG Ticket'
                        defaultValue='NTG Ticket'
                      />
                      <TextInput
                        label='Support Email'
                        placeholder='support@company.com'
                        defaultValue='support@company.com'
                      />
                      <Select
                        label='Default SLA Level'
                        data={[
                          { value: 'STANDARD', label: 'Standard' },
                          { value: 'PREMIUM', label: 'Premium' },
                          {
                            value: 'CRITICAL_SUPPORT',
                            label: 'Critical Support',
                          },
                        ]}
                        defaultValue='STANDARD'
                      />
                      <Switch
                        label='Allow Self-Registration'
                        description='Allow users to register themselves'
                        defaultChecked
                      />
                    </Stack>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper withBorder p='md'>
                    <Title order={4} mb='md'>
                      Email Settings
                    </Title>
                    <Stack gap='md'>
                      <TextInput
                        label='SMTP Host'
                        placeholder='smtp.gmail.com'
                        defaultValue='smtp.gmail.com'
                      />
                      <NumberInput
                        label='SMTP Port'
                        placeholder='587'
                        defaultValue={587}
                      />
                      <TextInput
                        label='SMTP Username'
                        placeholder='your-email@gmail.com'
                      />
                      <TextInput
                        label='From Email'
                        placeholder='noreply@company.com'
                        defaultValue='noreply@company.com'
                      />
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='integrations' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>{tSystem('integrationsManagement')}</Title>
                <Button
                  leftSection={<IconPlug size={16} />}
                  onClick={() => setIntegrationsModalOpened(true)}
                >
                  Manage Integrations
                </Button>
              </Group>
              <Paper withBorder p='md'>
                <Text c='dimmed'>
                  {tAdmin('configureIntegrations')}{' '}
                  {tHelp('manageIntegrations')} {tAdmin('getStarted')}.
                </Text>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='permissions' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>{tSystem('permissionsManagement')}</Title>
                <Button
                  leftSection={<IconShield size={16} />}
                  onClick={() => setPermissionsModalOpened(true)}
                >
                  Manage Permissions
                </Button>
              </Group>
              <Paper withBorder p='md'>
                <Text c='dimmed'>
                  {tAdmin('configurePermissions')} {tHelp('managePermissions')}{' '}
                  {tAdmin('getStarted')}.
                </Text>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='logs' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>{tSystem('auditLogs')}</Title>
                <Group>
                  <Button
                    leftSection={<IconFileText size={16} />}
                    onClick={() => setAuditTrailModalOpened(true)}
                  >
                    View Audit Trail
                  </Button>
                  <Button
                    variant='outline'
                    leftSection={<IconChartBar size={16} />}
                    onClick={() => setAuditStatsModalOpened(true)}
                  >
                    View Statistics
                  </Button>
                </Group>
              </Group>
              <Paper withBorder p='md'>
                <Text c='dimmed'>
                  {tAdmin('viewAuditLogs')} {tHelp('viewAuditTrail')}{' '}
                  {tAdmin('forDetailedLogs')} {tHelp('viewStatistics')}{' '}
                  {tAdmin('forAnalytics')}.
                </Text>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Add/Edit User Modal */}
      <Modal
        opened={userModalOpened}
        onClose={() => {
          setUserModalOpened(false);
          setSelectedUser(null);
          setUserFormData({});
        }}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size='md'
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            if (selectedUser) {
              handleUpdateUser();
            } else {
              handleCreateUser();
            }
          }}
        >
          <Stack gap='md'>
            <TextInput
              label='Full Name'
              placeholder='Enter full name'
              value={userFormData.name || ''}
              onChange={e =>
                setUserFormData({ ...userFormData, name: e.target.value })
              }
              required
            />
            <TextInput
              label='Email'
              placeholder='Enter email address'
              type='email'
              value={userFormData.email || ''}
              onChange={e =>
                setUserFormData({ ...userFormData, email: e.target.value })
              }
              required
            />
            {!selectedUser && (
              <TextInput
                label='Password'
                placeholder='Enter password'
                type='password'
                value={userFormData.password || ''}
                onChange={e =>
                  setUserFormData({ ...userFormData, password: e.target.value })
                }
                required
                description='Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character'
              />
            )}
            <Select
              label='Role'
              placeholder='Select role'
              value={userFormData.role || ''}
              onChange={value =>
                setUserFormData({ ...userFormData, role: value as UserRole })
              }
              data={[
                { value: 'END_USER', label: 'End User' },
                { value: 'SUPPORT_STAFF', label: 'Support Staff' },
                { value: 'SUPPORT_MANAGER', label: 'Support Manager' },
                { value: 'ADMIN', label: 'Administrator' },
              ]}
              required
            />
            <Switch
              label='Active'
              description='User account is active'
              checked={userFormData.isActive ?? true}
              onChange={e =>
                setUserFormData({
                  ...userFormData,
                  isActive: e.currentTarget.checked,
                })
              }
            />
            <Group justify='flex-end'>
              <Button
                variant='outline'
                onClick={() => {
                  setUserModalOpened(false);
                  setSelectedUser(null);
                  setUserFormData({});
                }}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                loading={createUser.isPending || updateUser.isPending}
              >
                {selectedUser ? 'Update User' : 'Add User'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        opened={settingsModalOpened}
        onClose={() => setSettingsModalOpened(false)}
        title='System Settings'
        size='lg'
      >
        <Stack gap='md'>
          <TextInput
            label='System Name'
            placeholder='NTG Ticket'
            defaultValue='NTG Ticket'
          />
          <TextInput
            label='Support Email'
            placeholder='support@company.com'
            defaultValue='support@company.com'
          />
          <Select
            label='Default SLA Level'
            data={[
              { value: 'STANDARD', label: 'Standard' },
              { value: 'PREMIUM', label: 'Premium' },
              { value: 'CRITICAL_SUPPORT', label: 'Critical Support' },
            ]}
            defaultValue='STANDARD'
          />
          <Switch
            label='Allow Self-Registration'
            description='Allow users to register themselves'
            defaultChecked
          />
          <Group justify='flex-end'>
            <Button
              variant='outline'
              onClick={() => setSettingsModalOpened(false)}
            >
              Cancel
            </Button>
            <Button>Save Settings</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Integrations Management Modal */}
      <IntegrationsManagement
        opened={integrationsModalOpened}
        onClose={() => setIntegrationsModalOpened(false)}
      />

      {/* Permissions Management Modal */}
      <PermissionsManagement
        opened={permissionsModalOpened}
        onClose={() => setPermissionsModalOpened(false)}
      />

      {/* Audit Trail Modal */}
      <AuditTrail
        opened={auditTrailModalOpened}
        onClose={() => setAuditTrailModalOpened(false)}
      />

      {/* Audit Log Statistics Modal */}
      <AuditLogStats
        opened={auditStatsModalOpened}
        onClose={() => setAuditStatsModalOpened(false)}
      />
    </Container>
  );
}
