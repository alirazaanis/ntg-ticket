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
  IconFilter,
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
} from '@tabler/icons-react';
import { useTickets } from '../../hooks/useTickets';
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
import { IntegrationsManagement } from '../admin/IntegrationsManagement';
import { PermissionsManagement } from '../admin/PermissionsManagement';
import { AuditTrail } from '../compliance/AuditTrail';
import { AuditLogStats } from '../compliance/AuditLogStats';

export function AdminDashboard() {
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
  const { data: users, isLoading: usersLoading } = useUsers({ limit: 100 });
  const { data: systemMetrics } = useSystemMetrics();
  const { data: userDistribution } = useUserDistribution();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
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
          title: 'Validation Error',
          message: 'Please fill in all required fields',
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

  const stats = [
    {
      title: 'Total Tickets',
      value: allTickets?.length || 0,
      icon: IconTicket,
      color: 'blue',
    },
    {
      title: 'Active Users',
      value: users?.filter((u: User) => u.isActive).length || 0,
      icon: IconUsers,
      color: 'green',
    },
    {
      title: 'System Uptime',
      value: systemMetrics?.uptime || '99.9%',
      icon: IconServer,
      color: 'blue',
    },
    {
      title: 'Storage Used',
      value: systemMetrics?.storageUsed || '2.4 GB',
      icon: IconDatabase,
      color: 'orange',
    },
  ];

  // Real data for charts
  const systemMetricsData = systemMetrics?.metrics || [
    { time: '00:00', cpu: 25, memory: 45, disk: 30 },
    { time: '04:00', cpu: 30, memory: 50, disk: 32 },
    { time: '08:00', cpu: 65, memory: 70, disk: 35 },
    { time: '12:00', cpu: 80, memory: 85, disk: 38 },
    { time: '16:00', cpu: 75, memory: 80, disk: 40 },
    { time: '20:00', cpu: 45, memory: 60, disk: 42 },
  ];

  const userRoles = userDistribution || [
    { role: 'End Users', count: 120, percentage: 77 },
    { role: 'Support Staff', count: 25, percentage: 16 },
    { role: 'Managers', count: 8, percentage: 5 },
    { role: 'Admins', count: 3, percentage: 2 },
  ];

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
            <Title order={2}>System Administration</Title>
            <Text c='dimmed'>
              Manage system settings, users, and monitor performance
            </Text>
          </div>
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

        {/* System Metrics */}
        <Grid>
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
                  { name: 'memory', color: 'blue.6' },
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
                series={[{ name: 'count', color: 'blue.6' }]}
                orientation='vertical'
                unit=' users'
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
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Ticket Status Overview
                  </Title>
                  <Grid>
                    <Grid.Col span={6}>
                      <div>
                        <Text size='sm' c='dimmed' mb={4}>
                          Open Tickets
                        </Text>
                        <Text size='xl' fw={600} c='blue'>
                          {allTickets?.filter(
                            t =>
                              t.status === 'OPEN' || t.status === 'IN_PROGRESS'
                          ).length || 0}
                        </Text>
                      </div>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div>
                        <Text size='sm' c='dimmed' mb={4}>
                          Resolved Today
                        </Text>
                        <Text size='xl' fw={600} c='green'>
                          {allTickets?.filter(
                            t =>
                              t.status === 'RESOLVED' &&
                              new Date(t.updatedAt).toDateString() ===
                                new Date().toDateString()
                          ).length || 0}
                        </Text>
                      </div>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div>
                        <Text size='sm' c='dimmed' mb={4}>
                          High Priority
                        </Text>
                        <Text size='xl' fw={600} c='red'>
                          {allTickets?.filter(
                            t =>
                              t.priority === 'HIGH' || t.priority === 'CRITICAL'
                          ).length || 0}
                        </Text>
                      </div>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div>
                        <Text size='sm' c='dimmed' mb={4}>
                          Overdue
                        </Text>
                        <Text size='xl' fw={600} c='orange'>
                          {allTickets?.filter(
                            t =>
                              t.dueDate &&
                              new Date(t.dueDate) < new Date() &&
                              (t.status === 'OPEN' ||
                                t.status === 'IN_PROGRESS')
                          ).length || 0}
                        </Text>
                      </div>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Recent Tickets
                  </Title>
                  <Stack gap='sm'>
                    {allTickets?.slice(0, 5).map((ticket: Ticket) => (
                      <Group key={ticket.id} justify='space-between'>
                        <div>
                          <Text size='sm' fw={500}>
                            {ticket.ticketNumber}
                          </Text>
                          <Text size='xs' c='dimmed' lineClamp={1}>
                            {ticket.title}
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
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </Group>
                    ))}
                    {(!allTickets || allTickets.length === 0) && (
                      <Text size='sm' c='dimmed' ta='center' py='md'>
                        No tickets found
                      </Text>
                    )}
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Tickets by Priority
                  </Title>
                  <Stack gap='sm'>
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => {
                      const count =
                        allTickets?.filter(t => t.priority === priority)
                          .length || 0;
                      const percentage = allTickets?.length
                        ? (count / allTickets.length) * 100
                        : 0;
                      return (
                        <div key={priority}>
                          <Group justify='space-between' mb={4}>
                            <Text size='sm' c='dimmed'>
                              {priority}
                            </Text>
                            <Text size='sm' fw={500}>
                              {count}
                            </Text>
                          </Group>
                          <Progress
                            value={percentage}
                            color={
                              priority === 'CRITICAL'
                                ? 'red'
                                : priority === 'HIGH'
                                  ? 'orange'
                                  : priority === 'MEDIUM'
                                    ? 'blue'
                                    : 'green'
                            }
                            size='sm'
                          />
                        </div>
                      );
                    })}
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Tickets by Category
                  </Title>
                  <Stack gap='sm'>
                    {allTickets?.reduce(
                      (acc: Record<string, number>, ticket: Ticket) => {
                        const category = ticket.category.name;
                        acc[category] = (acc[category] || 0) + 1;
                        return acc;
                      },
                      {}
                    ) &&
                      Object.entries(
                        allTickets?.reduce(
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
                          const percentage = allTickets?.length
                            ? (count / allTickets.length) * 100
                            : 0;
                          return (
                            <div key={category}>
                              <Group justify='space-between' mb={4}>
                                <Text size='sm' c='dimmed'>
                                  {category}
                                </Text>
                                <Text size='sm' fw={500}>
                                  {count}
                                </Text>
                              </Group>
                              <Progress
                                value={percentage}
                                color='blue'
                                size='sm'
                              />
                            </div>
                          );
                        })}
                    {(!allTickets || allTickets.length === 0) && (
                      <Text size='sm' c='dimmed' ta='center' py='md'>
                        No tickets found
                      </Text>
                    )}
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value='users' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>User Management</Title>
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
                      <Table.Th>User</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Last Login</Table.Th>
                      <Table.Th>Actions</Table.Th>
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
                            <Text c='dimmed'>No users found</Text>
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
                            <Badge color='blue'>
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
                <Title order={3}>All Tickets</Title>
                <Group>
                  <TextInput
                    placeholder='Search tickets...'
                    leftSection={<IconSearch size={16} />}
                    style={{ width: 300 }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
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
                {filteredTickets?.map((ticket: Ticket) => (
                  <Grid.Col key={ticket.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <TicketCard ticket={ticket} showActions />
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='system' pt='md'>
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
                          {systemMetrics?.cpuUsage || 65}%
                        </Text>
                      </Group>
                      <Progress
                        value={systemMetrics?.cpuUsage || 65}
                        color='blue'
                      />
                    </div>
                    <div>
                      <Group justify='space-between' mb={4}>
                        <Text size='sm'>Memory Usage</Text>
                        <Text size='sm' fw={500}>
                          {systemMetrics?.memoryUsage || 78}%
                        </Text>
                      </Group>
                      <Progress
                        value={systemMetrics?.memoryUsage || 78}
                        color='orange'
                      />
                    </div>
                    <div>
                      <Group justify='space-between' mb={4}>
                        <Text size='sm'>Disk Usage</Text>
                        <Text size='sm' fw={500}>
                          {systemMetrics?.diskUsage || 42}%
                        </Text>
                      </Group>
                      <Progress
                        value={systemMetrics?.diskUsage || 42}
                        color='green'
                      />
                    </div>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Database Status
                  </Title>
                  <Stack gap='sm'>
                    <Group justify='space-between'>
                      <Text size='sm'>Connection Pool</Text>
                      <Badge color='green'>Healthy</Badge>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm'>Query Performance</Text>
                      <Badge color='blue'>Good</Badge>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm'>Last Backup</Text>
                      <Text size='sm'>
                        {systemMetrics?.lastBackup || '2 hours ago'}
                      </Text>
                    </Group>
                    <Group justify='space-between'>
                      <Text size='sm'>Database Size</Text>
                      <Text size='sm'>
                        {systemMetrics?.databaseSize || '1.2 GB'}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value='settings' pt='md'>
            <Stack gap='md'>
              <Title order={3}>System Settings</Title>
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
                <Title order={3}>Integrations Management</Title>
                <Button
                  leftSection={<IconPlug size={16} />}
                  onClick={() => setIntegrationsModalOpened(true)}
                >
                  Manage Integrations
                </Button>
              </Group>
              <Paper withBorder p='md'>
                <Text c='dimmed'>
                  Configure external integrations and API connections. Click
                  "Manage Integrations" to get started.
                </Text>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='permissions' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>Permissions Management</Title>
                <Button
                  leftSection={<IconShield size={16} />}
                  onClick={() => setPermissionsModalOpened(true)}
                >
                  Manage Permissions
                </Button>
              </Group>
              <Paper withBorder p='md'>
                <Text c='dimmed'>
                  Configure role-based permissions and access control. Click
                  "Manage Permissions" to get started.
                </Text>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='logs' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>Audit Logs</Title>
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
                  View detailed audit logs and system activity. Use "View Audit
                  Trail" for detailed logs or "View Statistics" for analytics
                  and insights.
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
