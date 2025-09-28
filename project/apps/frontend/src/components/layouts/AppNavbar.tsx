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
  Collapse,
  Button,
  useMantineTheme,
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
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTicketsStore } from '../../stores/useTicketsStore';
import { useNotificationsStore } from '../../stores/useNotificationsStore';
import { useRouter, usePathname } from 'next/navigation';
import { Ticket } from '../../types/unified';
import { ComponentType } from 'react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

interface AppNavbarProps {
  onMobileClose?: () => void;
}

export function AppNavbar({ onMobileClose }: AppNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasRole, hasAnyRole } = useAuthStore();
  const { tickets, isLoading } = useTicketsStore();
  const { unreadCount } = useNotificationsStore();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  // Navigation state for collapsible sections
  const [adminExpanded, { toggle: toggleAdmin }] = useDisclosure(false); // Start collapsed
  const [ticketsExpanded, { toggle: toggleTickets }] = useDisclosure(false); // Start collapsed
  const [statsExpanded, { toggle: toggleStats }] = useDisclosure(true); // Start expanded

  // Defensive programming: ensure tickets is always an array
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  const myTickets = user
    ? safeTickets.filter((t: Ticket) => t.requester?.id === user.id)
    : [];
  const assignedTickets = user
    ? safeTickets.filter((t: Ticket) => t.assignedTo?.id === user.id)
    : [];
  const openTickets = safeTickets.filter((t: Ticket) =>
    ['NEW', 'OPEN', 'IN_PROGRESS'].includes(t.status)
  );
  const overdueTickets = safeTickets.filter((t: Ticket) => {
    if (!t.dueDate) return false;
    return (
      new Date(t.dueDate) < new Date() &&
      !['RESOLVED', 'CLOSED'].includes(t.status)
    );
  });
  const slaBreachedTickets = safeTickets.filter((t: Ticket) => {
    if (!t.dueDate) return false;
    return (
      new Date(t.dueDate) < new Date() &&
      !['RESOLVED', 'CLOSED'].includes(t.status)
    );
  });

  // Essential navigation items (always visible) - sorted by importance and frequency
  const essentialItems: Array<{
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
      badge: safeTickets.length,
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
    {
      label: 'Notifications',
      icon: IconBell,
      href: '/notifications',
      show: true,
      badge: unreadCount,
    },
  ];

  // Ticket management items (collapsible on mobile) - sorted by priority and workflow
  const ticketItems: Array<{
    label: string;
    icon: ComponentType<{ size?: number }>;
    href: string;
    show: boolean;
    badge?: number;
  }> = [
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
      badge: slaBreachedTickets.length,
    },
    {
      label: 'My Tickets',
      icon: IconFileText,
      href: '/tickets/my',
      show: true,
      badge: myTickets.length,
    },
  ];

  // Admin items (collapsible on mobile, simplified) - sorted by importance and frequency
  const adminItems: Array<{
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
      label: 'System Settings',
      icon: IconSettings,
      href: '/admin/settings',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Admin Panel',
      icon: IconShield,
      href: '/admin/panel',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Audit Logs',
      icon: IconHistory,
      href: '/admin/audit-logs',
      show: hasRole('ADMIN'),
    },
  ];

  // Additional admin items (only show on desktop or when expanded) - sorted by logical grouping
  const additionalAdminItems: Array<{
    label: string;
    icon: ComponentType<{ size?: number }>;
    href: string;
    show: boolean;
    badge?: number;
  }> = [
    // Content Management
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
    // Workflow & Search
    {
      label: 'SLA Management',
      icon: IconClock,
      href: '/admin/sla',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Saved Searches',
      icon: IconSearch,
      href: '/admin/saved-searches',
      show: hasRole('ADMIN'),
    },
    // System Management
    {
      label: 'System Monitoring',
      icon: IconActivity,
      href: '/admin/monitoring',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Backups',
      icon: IconDatabase,
      href: '/admin/backups',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Elasticsearch',
      icon: IconDatabase,
      href: '/admin/elasticsearch',
      show: hasRole('ADMIN'),
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  // Helper function to render navigation items
  const renderNavItems = (
    items: typeof essentialItems,
    color: string = 'blue'
  ) => {
    return items.map(item => {
      if (!item.show) return null;

      return (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          leftSection={<item.icon size={16} />}
          rightSection={
            item.badge && item.badge > 0 ? (
              <Badge size='sm' variant='light' color={color}>
                {item.badge}
              </Badge>
            ) : null
          }
          active={isActive(item.href)}
          onClick={e => {
            e.preventDefault();
            router.push(item.href);
            onMobileClose?.();
          }}
        />
      );
    });
  };

  return (
    <AppShell.Navbar p='md'>
      <ScrollArea h='100%'>
        <Stack gap='xs'>
          {/* Essential Navigation - Always visible */}
          <Text size='xs' tt='uppercase' fw={700} c='dimmed' mb='xs'>
            Navigation
          </Text>
          {renderNavItems(essentialItems)}

          {/* Ticket Management - Collapsible on all devices */}
          {ticketItems.some(item => item.show) && (
            <>
              <Divider my='sm' />
              <Button
                variant='subtle'
                leftSection={
                  ticketsExpanded ? (
                    <IconChevronDown size={14} />
                  ) : (
                    <IconChevronRight size={14} />
                  )
                }
                onClick={toggleTickets}
                size='sm'
                justify='flex-start'
                fullWidth
              >
                Ticket Management
              </Button>
              <Collapse in={ticketsExpanded}>
                <Stack gap='xs' pl='md'>
                  {renderNavItems(ticketItems, 'orange')}
                </Stack>
              </Collapse>
            </>
          )}

          {/* Admin Section - Collapsible on all devices */}
          {adminItems.some(item => item.show) && (
            <>
              <Divider my='sm' />
              <Button
                variant='subtle'
                leftSection={
                  adminExpanded ? (
                    <IconChevronDown size={14} />
                  ) : (
                    <IconChevronRight size={14} />
                  )
                }
                onClick={toggleAdmin}
                size='sm'
                justify='flex-start'
                fullWidth
              >
                Administration
              </Button>
              <Collapse in={adminExpanded}>
                <Stack gap='xs' pl='md'>
                  {renderNavItems(adminItems, 'red')}
                  {renderNavItems(additionalAdminItems, 'red')}
                </Stack>
              </Collapse>
            </>
          )}

          {/* Quick Stats - Collapsible on all devices */}
          {!isMobile && (
            <>
              <Divider my='sm' />
              <Button
                variant='subtle'
                leftSection={
                  statsExpanded ? (
                    <IconChevronDown size={14} />
                  ) : (
                    <IconChevronRight size={14} />
                  )
                }
                onClick={toggleStats}
                size='sm'
                justify='flex-start'
                fullWidth
              >
                Quick Stats
              </Button>
              <Collapse in={statsExpanded}>
                <Stack gap='xs' pl='md'>
                  <Group justify='space-between' px='xs'>
                    <Text size='sm' c='dimmed'>
                      Open Tickets
                    </Text>
                    <Badge size='sm' color='blue' variant='light'>
                      {isLoading ? '...' : openTickets.length}
                    </Badge>
                  </Group>

                  <Group justify='space-between' px='xs'>
                    <Text size='sm' c='dimmed'>
                      Overdue
                    </Text>
                    <Badge size='sm' color='red' variant='light'>
                      {isLoading ? '...' : overdueTickets.length}
                    </Badge>
                  </Group>
                </Stack>
              </Collapse>
            </>
          )}
        </Stack>
      </ScrollArea>
    </AppShell.Navbar>
  );
}
