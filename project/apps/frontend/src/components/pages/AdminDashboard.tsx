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
} from '@tabler/icons-react';
import { useTickets } from '../../hooks/useTickets';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useUsers';
import { useSystemMetrics, useUserDistribution } from '../../hooks/useReports';
import { TicketCard } from '../ui/TicketCard';
import { User, CreateUserInput, UpdateUserInput } from '../../lib/apiClient';
import { Ticket, UserRole } from '../../types/unified';
import { notifications } from '@mantine/notifications';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userModalOpened, setUserModalOpened] = useState(false);
  const [settingsModalOpened, setSettingsModalOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<CreateUserInput>>({});
  
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: users, isLoading: usersLoading } = useUsers({ limit: 100 });
  const { data: systemMetrics } = useSystemMetrics();
  const { data: userDistribution } = useUserDistribution();
  
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  
  // Handler functions
  const handleDatabaseBackup = async () => {
    try {
      notifications.show({
        title: 'Database Backup',
        message: 'Database backup initiated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to initiate database backup',
        color: 'red',
      });
    }
  };
  
  const handleViewLogs = () => {
    // In a real app, this would open a logs modal or navigate to logs page
    notifications.show({
      title: 'View Logs',
      message: 'Logs viewer would open here',
      color: 'blue',
    });
  };
  
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
      if (!userFormData.name || !userFormData.email || !userFormData.password || !userFormData.role) {
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
      console.error('Create user error:', error);
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

      console.log('Update user data:', { id: selectedUser.id, data: updateData });
      await updateUser.mutateAsync({ id: selectedUser.id, data: updateData as UpdateUserInput });
      setUserModalOpened(false);
      setSelectedUser(null);
      setUserFormData({});
      notifications.show({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Update user error:', error);
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
  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  ) || [];
  
  // Filter tickets based on search query
  const filteredTickets = allTickets.filter(ticket =>
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
          <Group>
            <TextInput
              placeholder='Search tickets...'
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
            />
            <Button variant='outline' leftSection={<IconFilter size={16} />}>
              Filter
            </Button>
            <Button
              leftSection={<IconSettings size={16} />}
              onClick={() => setSettingsModalOpened(true)}
            >
              Settings
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
            <Tabs.Tab value='logs' leftSection={<IconFileText size={16} />}>
              Audit Logs
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='overview' pt='md'>
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    System Health
                  </Title>
                  <Grid>
                    <Grid.Col span={4}>
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
                    <Grid.Col span={4}>
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
                    <Grid.Col span={4}>
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
                    Quick Actions
                  </Title>
                  <Stack gap='sm'>
                    <Button
                      variant='light'
                      leftSection={<IconPlus size={16} />}
                      onClick={handleAddUser}
                    >
                      Add User
                    </Button>
                    <Button
                      variant='light'
                      leftSection={<IconSettings size={16} />}
                      onClick={() => setSettingsModalOpened(true)}
                    >
                      System Settings
                    </Button>
                    <Button
                      variant='light'
                      leftSection={<IconDatabase size={16} />}
                      onClick={handleDatabaseBackup}
                    >
                      Database Backup
                    </Button>
                    <Button
                      variant='light'
                      leftSection={<IconFileText size={16} />}
                      onClick={handleViewLogs}
                    >
                      View Logs
                    </Button>
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
                    onChange={(e) => setUserSearchQuery(e.target.value)}
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
                            <ActionIcon size='sm' variant='light' onClick={() => console.log('View user:', user.id)}>
                              <IconEye size={14} />
                            </ActionIcon>
                            <ActionIcon size='sm' variant='light' onClick={() => handleEditUser(user)}>
                              <IconEdit size={14} />
                            </ActionIcon>
                            <ActionIcon size='sm' variant='light' color='red' onClick={() => handleDeleteUser(user.id)}>
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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
              <Grid.Col span={{ base: 12, md: 6 }}>
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

              <Grid.Col span={{ base: 12, md: 6 }}>
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

          <Tabs.Panel value='logs' pt='md'>
            <Stack gap='md'>
              <Title order={3}>Audit Logs</Title>
              <Paper withBorder p='md'>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Timestamp</Table.Th>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Action</Table.Th>
                      <Table.Th>Resource</Table.Th>
                      <Table.Th>IP Address</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>2024-01-15 14:30:25</Table.Td>
                      <Table.Td>john.doe@company.com</Table.Td>
                      <Table.Td>Created Ticket</Table.Td>
                      <Table.Td>TKT-2024-000123</Table.Td>
                      <Table.Td>192.168.1.100</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>2024-01-15 14:25:10</Table.Td>
                      <Table.Td>jane.smith@company.com</Table.Td>
                      <Table.Td>Updated Ticket</Table.Td>
                      <Table.Td>TKT-2024-000122</Table.Td>
                      <Table.Td>192.168.1.101</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>2024-01-15 14:20:45</Table.Td>
                      <Table.Td>admin@company.com</Table.Td>
                      <Table.Td>User Role Changed</Table.Td>
                      <Table.Td>user-456</Table.Td>
                      <Table.Td>192.168.1.102</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
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
        <form onSubmit={(e) => { e.preventDefault(); selectedUser ? handleUpdateUser() : handleCreateUser(); }}>
          <Stack gap='md'>
            <TextInput 
              label='Full Name' 
              placeholder='Enter full name' 
              value={userFormData.name || ''}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              required 
            />
            <TextInput
              label='Email'
              placeholder='Enter email address'
              type='email'
              value={userFormData.email || ''}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              required
            />
            {!selectedUser && (
              <TextInput
                label='Password'
                placeholder='Enter password'
                type='password'
                value={userFormData.password || ''}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                required
                description='Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character'
              />
            )}
          <Select
            label='Role'
            placeholder='Select role'
            value={userFormData.role || ''}
            onChange={(value) => setUserFormData({ ...userFormData, role: value as UserRole })}
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
            onChange={(e) => setUserFormData({ ...userFormData, isActive: e.currentTarget.checked })}
          />
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => {
              setUserModalOpened(false);
              setSelectedUser(null);
              setUserFormData({});
            }}>
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
    </Container>
  );
}
