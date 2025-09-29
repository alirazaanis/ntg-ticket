'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  Modal,
  Tabs,
  Card,
  Avatar,
  Timeline,
  Loader,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconBell,
  IconClock,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconTicket,
  IconFileText,
} from '@tabler/icons-react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../stores/useAuthStore';
import { DynamicTicketForm } from '../forms/DynamicTicketForm';
import { TicketCard } from '../ui/TicketCard';
import { NotificationList } from '../ui/NotificationList';
import { Ticket } from '../../types/unified';
import { Notification } from '../../types/notification';
import { useRouter } from 'next/navigation';

export function EndUserDashboard() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tTickets = useTranslations('tickets');
  const tReports = useTranslations('help');
  const [createTicketOpened, setCreateTicketOpened] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: notifications } = useNotifications();

  const myTickets =
    tickets?.filter((ticket: Ticket) => ticket.requester.id === user?.id) || [];
  const openTickets = myTickets.filter((ticket: Ticket) =>
    ['NEW', 'OPEN', 'IN_PROGRESS'].includes(ticket.status)
  );
  const resolvedTickets = myTickets.filter(
    (ticket: Ticket) => ticket.status === 'RESOLVED'
  );
  const closedTickets = myTickets.filter(
    (ticket: Ticket) => ticket.status === 'CLOSED'
  );

  const stats = [
    {
      title: t('totalTickets'),
      value: myTickets.length,
      icon: IconTicket,
      color: 'blue',
    },
    {
      title: t('openTickets'),
      value: openTickets.length,
      icon: IconClock,
      color: 'orange',
    },
    {
      title: t('resolvedTickets'),
      value: resolvedTickets.length,
      icon: IconCheck,
      color: 'green',
    },
    {
      title: t('closedTickets'),
      value: closedTickets.length,
      icon: IconX,
      color: 'gray',
    },
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
            <Title order={2}>
              {t('welcome')}, {user?.name}!
            </Title>
            <Text c='dimmed'>{t('subtitle')}</Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateTicketOpened(true)}
          >
            {t('createTicket')}
          </Button>
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
              {t('overview')}
            </Tabs.Tab>
            <Tabs.Tab value='tickets' leftSection={<IconTicket size={16} />}>
              {t('myTickets')}
            </Tabs.Tab>
            <Tabs.Tab
              value='notifications'
              leftSection={<IconBell size={16} />}
            >
              {tCommon('notifications')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='overview' pt='md'>
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    {t('recentActivity')}
                  </Title>
                  <Timeline active={-1} bulletSize={24} lineWidth={2}>
                    {myTickets.slice(0, 5).map((ticket: Ticket) => (
                      <Timeline.Item
                        key={ticket.id}
                        bullet={<IconTicket size={12} />}
                        title={ticket.title}
                      >
                        <Text c='dimmed' size='sm'>
                          {ticket.status} •{' '}
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </Text>
                        <Badge color='blue' size='sm' mt={4}>
                          {ticket.ticketNumber}
                        </Badge>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    {t('quickActions')}
                  </Title>
                  <Stack gap='sm'>
                    <Button
                      variant='light'
                      leftSection={<IconPlus size={16} />}
                      onClick={() => setCreateTicketOpened(true)}
                    >
                      {t('createTicket')}
                    </Button>
                    <Button
                      variant='light'
                      leftSection={<IconSearch size={16} />}
                    >
                      {tTickets('searchTickets')}
                    </Button>
                    <Button
                      variant='light'
                      leftSection={<IconFileText size={16} />}
                    >
                      {tReports('viewReports')}
                    </Button>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value='tickets' pt='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={3}>{t('myTickets')}</Title>
                <Group>
                  <Button
                    variant='outline'
                    leftSection={<IconTicket size={16} />}
                    onClick={() => router.push('/tickets/my')}
                  >
                    {t('viewAllTickets')}
                  </Button>
                </Group>
              </Group>

              <Grid>
                {myTickets.map((ticket: Ticket) => (
                  <Grid.Col key={ticket.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <TicketCard ticket={ticket} />
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='notifications' pt='md'>
            <NotificationList
              notifications={(notifications as unknown as Notification[]) || []}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Create Ticket Modal */}
      <Modal
        opened={createTicketOpened}
        onClose={() => setCreateTicketOpened(false)}
        title={t('createTicket')}
        size='lg'
        fullScreen
      >
        <DynamicTicketForm onSubmit={() => setCreateTicketOpened(false)} />
      </Modal>
    </Container>
  );
}
