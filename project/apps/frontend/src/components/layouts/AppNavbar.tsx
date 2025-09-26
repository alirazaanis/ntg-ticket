'use client';

import {
  AppShell,
  NavLink,
  Stack,
  Text,
  Divider,
  Group,
  Badge,
  ScrollArea,
} from '@mantine/core';
import {
  IconDashboard,
  IconTicket,
  IconPlus,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconBell,
  IconFileText,
  IconClipboardList,
  IconUserCheck,
  IconMail,
  IconShield,
  IconDatabase,
  IconHistory,
  IconActivity,
  IconSearch,
  IconClock,
  IconExclamationMark,
} from '@tabler/icons-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTicketsStore } from '../../stores/useTicketsStore';
import { useNotificationsStore } from '../../stores/useNotificationsStore';
import { useRouter, usePathname } from 'next/navigation';
import { Ticket } from '../../types/unified';
import { ComponentType } from 'react';

export function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasRole, hasAnyRole } = useAuthStore();
  const { tickets } = useTicketsStore();
  const { unreadCount } = useNotificationsStore();

  const myTickets = user
    ? tickets.filter((t: Ticket) => t.requester.id === user.id)
    : [];
  const assignedTickets = user
    ? tickets.filter((t: Ticket) => t.assignedTo?.id === user.id)
    : [];
  const openTickets = tickets.filter((t: Ticket) =>
    ['NEW', 'OPEN', 'IN_PROGRESS'].includes(t.status)
  );
  const overdueTickets = tickets.filter((t: Ticket) => {
    if (!t.dueDate) return false;
    return (
      new Date(t.dueDate) < new Date() &&
      !['RESOLVED', 'CLOSED'].includes(t.status)
    );
  });

  const navItems: Array<{
    label: string;
    icon: ComponentType<{ size?: number }>;
    href: string;
    show: boolean;
    badge?: number;
  }> = [
    {
      label: 'Dashboard',
      icon: IconDashboard,
      href: '/dashboard',
      show: true,
    },
    {
      label: 'All Tickets',
      icon: IconTicket,
      href: '/tickets',
      show: true,
      badge: tickets.length,
    },
    {
      label: 'My Tickets',
      icon: IconFileText,
      href: '/tickets/my',
      show: true,
      badge: myTickets.length,
    },
    {
      label: 'Assigned to Me',
      icon: IconUserCheck,
      href: '/tickets/assigned',
      show: hasAnyRole(['SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN']),
      badge: assignedTickets.length,
    },
    {
      label: 'Overdue Tickets',
      icon: IconClock,
      href: '/tickets/overdue',
      show: hasAnyRole(['SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN']),
      badge: overdueTickets.length,
    },
    {
      label: 'SLA Breached',
      icon: IconExclamationMark,
      href: '/tickets/sla-breached',
      show: hasAnyRole(['SUPPORT_MANAGER', 'ADMIN']),
    },
    {
      label: 'Notifications',
      icon: IconBell,
      href: '/notifications',
      show: true,
      badge: unreadCount,
    },
    {
      label: 'Create Ticket',
      icon: IconPlus,
      href: '/tickets/create',
      show: true,
    },
    {
      label: 'Reports',
      icon: IconChartBar,
      href: '/reports',
      show: true,
    },
  ];

  const managementItems: Array<{
    label: string;
    icon: ComponentType<{ size?: number }>;
    href: string;
    show: boolean;
    badge?: number;
  }> = [
    {
      label: 'Users',
      icon: IconUsers,
      href: '/admin/users',
      show: hasAnyRole(['SUPPORT_MANAGER', 'ADMIN']),
    },
    {
      label: 'Categories',
      icon: IconClipboardList,
      href: '/admin/categories',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Custom Fields',
      icon: IconSettings,
      href: '/admin/custom-fields',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Email Templates',
      icon: IconMail,
      href: '/admin/email-templates',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Saved Searches',
      icon: IconSearch,
      href: '/admin/saved-searches',
      show: hasRole('ADMIN'),
    },
    {
      label: 'SLA Management',
      icon: IconClock,
      href: '/admin/sla',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Backups',
      icon: IconDatabase,
      href: '/admin/backups',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Audit Logs',
      icon: IconHistory,
      href: '/admin/audit-logs',
      show: hasRole('ADMIN'),
    },
    {
      label: 'System Monitoring',
      icon: IconActivity,
      href: '/admin/monitoring',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Elasticsearch',
      icon: IconDatabase,
      href: '/admin/elasticsearch',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Admin Panel',
      icon: IconShield,
      href: '/admin/panel',
      show: hasRole('ADMIN'),
    },
    {
      label: 'System Settings',
      icon: IconSettings,
      href: '/admin/settings',
      show: hasRole('ADMIN'),
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <AppShell.Navbar p='md'>
      <ScrollArea h='100%'>
        <Stack gap='xs'>
          <Text size='xs' tt='uppercase' fw={700} c='dimmed' mb='xs'>
            Navigation
          </Text>

          {navItems.map(item => {
            if (!item.show) return null;

            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={16} />}
                rightSection={
                  item.badge && item.badge > 0 ? (
                    <Badge size='sm' variant='light' color='blue'>
                      {item.badge}
                    </Badge>
                  ) : null
                }
                active={isActive(item.href)}
                onClick={e => {
                  e.preventDefault();
                  router.push(item.href);
                }}
              />
            );
          })}

          <Divider my='sm' />

          <Text size='xs' tt='uppercase' fw={700} c='dimmed' mb='xs'>
            Management
          </Text>

          {managementItems.map(item => {
            if (!item.show) return null;

            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={16} />}
                rightSection={
                  item.badge && item.badge > 0 ? (
                    <Badge size='sm' variant='light' color='red'>
                      {item.badge}
                    </Badge>
                  ) : null
                }
                active={isActive(item.href)}
                onClick={e => {
                  e.preventDefault();
                  router.push(item.href);
                }}
              />
            );
          })}

          <Divider my='sm' />

          <Stack gap='xs'>
            <Text size='xs' tt='uppercase' fw={700} c='dimmed'>
              Quick Stats
            </Text>

            <Group justify='space-between' px='xs'>
              <Text size='sm' c='dimmed'>
                Open Tickets
              </Text>
              <Badge size='sm' color='blue' variant='light'>
                {openTickets.length}
              </Badge>
            </Group>

            <Group justify='space-between' px='xs'>
              <Text size='sm' c='dimmed'>
                Overdue
              </Text>
              <Badge size='sm' color='red' variant='light'>
                {overdueTickets.length}
              </Badge>
            </Group>
          </Stack>
        </Stack>
      </ScrollArea>
    </AppShell.Navbar>
  );
}
