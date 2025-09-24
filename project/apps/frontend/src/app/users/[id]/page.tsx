'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Grid,
  Card,
  Stack,
  Badge,
  Alert,
  Loader,
  Tabs,
  Table,
  ActionIcon,
  Menu,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconDots,
  IconTicket,
  IconCalendar,
  IconAlertCircle,
  IconUser,
  IconMail,
  IconShield,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useUser, useDeleteUser } from '../../../../hooks/useUsers';
import { useTickets } from '../../../../hooks/useTickets';
import { UserRole } from '../../../../types/unified';
import { formatDistanceToNow } from 'date-fns';

const roleColors: Record<UserRole, string> = {
  [UserRole.END_USER]: 'gray',
  [UserRole.SUPPORT_STAFF]: 'green',
  [UserRole.SUPPORT_MANAGER]: 'blue',
  [UserRole.ADMIN]: 'red',
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState<string | null>('overview');

  const { data: user, isLoading: userLoading, error: userError } = useUser(userId);
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const deleteUserMutation = useDeleteUser();

  const userTickets = tickets?.filter((ticket: any) => 
    ticket.requester.id === userId || ticket.assignedTo?.id === userId
  ) || [];

  const createdTickets = userTickets.filter((ticket: any) => ticket.requester.id === userId);
  const assignedTickets = userTickets.filter((ticket: any) => ticket.assignedTo?.id === userId);

  const handleEdit = () => {
    router.push(`/users/${userId}/edit`);
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      try {
        await deleteUserMutation.mutateAsync(userId);
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully',
          color: 'green',
        });
        router.push('/admin/users');
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete user',
          color: 'red',
        });
      }
    }
  };

  if (userLoading) {
    return (
      <Container size='xl' py='md'>
        <Group justify='center' mt='xl'>
          <Loader size='lg' />
          <Text>Loading user details...</Text>
        </Group>
      </Container>
    );
  }

  if (userError || !user) {
    return (
      <Container size='xl' py='md'>
        <Alert icon={<IconAlertCircle size={16} />} title='Error' color='red'>
          Failed to load user: {userError?.message || 'User not found'}
        </Alert>
        <Group mt='md'>
          <Button
            variant='outline'
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size='xl' py='md'>
      <Group justify='space-between' mb='xl'>
        <Group>
          <Button
            variant='subtle'
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            Back
          </Button>
          <div>
            <Title order={1}>{user.name}</Title>
            <Text c='dimmed'>{user.email}</Text>
          </div>
        </Group>
        <Group>
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={handleEdit}
          >
            Edit User
          </Button>
          <Menu shadow='md' width={200}>
            <Menu.Target>
              <ActionIcon variant='subtle'>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color='red'
                onClick={handleDelete}
              >
                Delete User
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={8}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value='overview'>Overview</Tabs.Tab>
              <Tabs.Tab value='tickets'>Tickets ({userTickets.length})</Tabs.Tab>
              <Tabs.Tab value='activity'>Activity</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value='overview' pt='md'>
              <Stack gap='md'>
                <Card withBorder p='md'>
                  <Title order={3} mb='md'>
                    User Information
                  </Title>
                  <Stack gap='sm'>
                    <Group gap='sm'>
                      <IconUser size={16} />
                      <div>
                        <Text size='sm' fw={500}>Full Name</Text>
                        <Text size='sm' c='dimmed'>{user.name}</Text>
                      </div>
                    </Group>
                    <Group gap='sm'>
                      <IconMail size={16} />
                      <div>
                        <Text size='sm' fw={500}>Email</Text>
                        <Text size='sm' c='dimmed'>{user.email}</Text>
                      </div>
                    </Group>
                    <Group gap='sm'>
                      <IconShield size={16} />
                      <div>
                        <Text size='sm' fw={500}>Role</Text>
                        <Badge color={roleColors[user.role]} variant='light'>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </Group>
                    <Group gap='sm'>
                      <IconCalendar size={16} />
                      <div>
                        <Text size='sm' fw={500}>Member Since</Text>
                        <Text size='sm' c='dimmed'>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Card>

                <Card withBorder p='md'>
                  <Title order={3} mb='md'>
                    Statistics
                  </Title>
                  <Grid>
                    <Grid.Col span={4}>
                      <Stack align='center' gap='xs'>
                        <Text size='xl' fw={700} c='blue'>
                          {createdTickets.length}
                        </Text>
                        <Text size='sm' c='dimmed' ta='center'>
                          Tickets Created
                        </Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Stack align='center' gap='xs'>
                        <Text size='xl' fw={700} c='green'>
                          {assignedTickets.length}
                        </Text>
                        <Text size='sm' c='dimmed' ta='center'>
                          Tickets Assigned
                        </Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Stack align='center' gap='xs'>
                        <Text size='xl' fw={700} c='orange'>
                          {assignedTickets.filter((t: any) => t.status === 'RESOLVED').length}
                        </Text>
                        <Text size='sm' c='dimmed' ta='center'>
                          Tickets Resolved
                        </Text>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Card>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value='tickets' pt='md'>
              <Card withBorder p='md'>
                <Title order={3} mb='md'>
                  User Tickets
                </Title>
                {ticketsLoading ? (
                  <Group justify='center' py='xl'>
                    <Loader size='sm' />
                    <Text>Loading tickets...</Text>
                  </Group>
                ) : userTickets.length === 0 ? (
                  <Text c='dimmed' ta='center' py='xl'>
                    No tickets found for this user.
                  </Text>
                ) : (
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Ticket</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Priority</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Role</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {userTickets.map((ticket: any) => (
                        <Table.Tr key={ticket.id}>
                          <Table.Td>
                            <div>
                              <Text fw={500} size='sm'>
                                #{ticket.ticketNumber}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                {ticket.title}
                              </Text>
                            </div>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={
                                ticket.status === 'RESOLVED' ? 'green' :
                                ticket.status === 'CLOSED' ? 'gray' :
                                ticket.status === 'IN_PROGRESS' ? 'blue' :
                                'orange'
                              }
                              variant='light'
                              size='sm'
                            >
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={
                                ticket.priority === 'CRITICAL' ? 'red' :
                                ticket.priority === 'HIGH' ? 'orange' :
                                ticket.priority === 'MEDIUM' ? 'yellow' :
                                'green'
                              }
                              variant='outline'
                              size='sm'
                            >
                              {ticket.priority}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm'>
                              {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={ticket.requester.id === userId ? 'blue' : 'green'}
                              variant='light'
                              size='sm'
                            >
                              {ticket.requester.id === userId ? 'Requester' : 'Assignee'}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value='activity' pt='md'>
              <Card withBorder p='md'>
                <Title order={3} mb='md'>
                  Recent Activity
                </Title>
                <Text c='dimmed' ta='center' py='xl'>
                  Activity tracking will be implemented here.
                </Text>
              </Card>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>

        <Grid.Col span={4}>
          <Stack gap='md'>
            <Card withBorder p='md'>
              <Title order={4} mb='md'>
                Account Status
              </Title>
              <Stack gap='sm'>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>Status</Text>
                  <Badge
                    color={user.isActive ? 'green' : 'red'}
                    variant='light'
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>Last Updated</Text>
                  <Text size='sm' c='dimmed'>
                    {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}
                  </Text>
                </Group>
              </Stack>
            </Card>

            <Card withBorder p='md'>
              <Title order={4} mb='md'>
                Quick Actions
              </Title>
              <Stack gap='sm'>
                <Button
                  variant='outline'
                  leftSection={<IconEdit size={16} />}
                  onClick={handleEdit}
                  fullWidth
                >
                  Edit User
                </Button>
                <Button
                  variant='outline'
                  leftSection={<IconTicket size={16} />}
                  onClick={() => setActiveTab('tickets')}
                  fullWidth
                >
                  View Tickets
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
