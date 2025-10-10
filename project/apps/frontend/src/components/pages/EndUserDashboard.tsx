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
  Tabs,
  Card,
  Avatar,
  Timeline,
  Loader,
} from '@mantine/core';
import {
  IconSearch,
  IconClock,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconTicket,
} from '@tabler/icons-react';
import { useTickets } from '../../hooks/useTickets';
import { useAuthStore } from '../../stores/useAuthStore';
import { Ticket } from '../../types/unified';
import { useRouter } from 'next/navigation';

export function EndUserDashboard() {
  const t = useTranslations('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();

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
      color: 'red',
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
          <Group>
            <Button
              variant='outline'
              leftSection={<IconSearch size={16} />}
              onClick={() => router.push('/tickets')}
            >
              Search Tickets
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
              Recent Activity
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='overview' pt='md'>
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
                    <Badge color='red' size='sm' mt={4}>
                      {ticket.ticketNumber}
                    </Badge>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
