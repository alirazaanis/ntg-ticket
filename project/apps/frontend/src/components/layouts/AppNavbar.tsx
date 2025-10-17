'use client';

import {
  AppShell,
  NavLink,
  Stack,
  Text,
  Divider,
  Badge,
  ScrollArea,
  Collapse,
  Button,
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
  IconSearch,
  IconClock,
  IconExclamationMark,
  IconPlug,
} from '@tabler/icons-react';
import { RTLChevronDown, RTLChevronRight } from '../ui/RTLIcon';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTicketsStore } from '../../stores/useTicketsStore';
import { useNotificationsStore } from '../../stores/useNotificationsStore';
import {
  useMyTickets,
  useAssignedTickets,
  useAllTicketsForCounting,
} from '../../hooks/useTickets';
import { useRouter, usePathname } from 'next/navigation';
import { Ticket } from '../../types/unified';
import { ComponentType } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useTranslations } from 'next-intl';

interface AppNavbarProps {
  onMobileClose?: () => void;
}

export function AppNavbar({ onMobileClose }: AppNavbarProps) {
  const t = useTranslations('common');
  const tDashboard = useTranslations('dashboard');
  const tTickets = useTranslations('tickets');
  const tAdmin = useTranslations('admin');
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasRole, hasAnyRole } = useAuthStore();
  const { tickets } = useTicketsStore();
  const { unreadCount } = useNotificationsStore();

  // Use React Query hooks for accurate counts
  const { data: myTicketsData } = useMyTickets();
  const { data: assignedTicketsData } = useAssignedTickets();
  const { data: allTicketsData } = useAllTicketsForCounting();

  // Navigation state for collapsible sections
  const [adminExpanded, { toggle: toggleAdmin }] = useDisclosure(false); // Start collapsed
  const [ticketsExpanded, { toggle: toggleTickets }] = useDisclosure(true); // Start expanded

  // Defensive programming: ensure tickets is always an array
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  // Use React Query data for accurate counts, fallback to store data
  const myTickets =
    myTicketsData ||
    (user
      ? safeTickets.filter((t: Ticket) => t.requester?.id === user.id)
      : []);
  const assignedTickets =
    assignedTicketsData ||
    (user
      ? safeTickets.filter((t: Ticket) => t.assignedTo?.id === user.id)
      : []);
  const allTickets = allTicketsData || safeTickets;

  // Debug logging removed for production
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
      label: tDashboard('overview'),
      icon: IconDashboard,
      href: '/dashboard',
      show: hasAnyRole(['SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN']), // Hide for End Users
    },
    {
      label: t('reports'),
      icon: IconChartBar,
      href: '/reports',
      show: true,
    },
    {
      label: t('notifications'),
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
      label: tTickets('allTickets'),
      icon: IconTicket,
      href: '/tickets',
      show: hasAnyRole(['SUPPORT_MANAGER', 'ADMIN']), // Only for managers and admins
      badge: allTickets.length,
    },
    {
      label: 'New Tickets',
      icon: IconFileText,
      href: '/tickets/new',
      show: hasRole('SUPPORT_MANAGER'), // Only for support managers
      badge: safeTickets.filter((t: Ticket) => t.status === 'NEW').length,
    },
    {
      label: tTickets('myTickets'),
      icon: IconFileText,
      href: '/tickets/my',
      show: hasRole('END_USER'), // Only for end users
      badge: myTickets.length,
    },
    {
      label: tTickets('assignedTickets'),
      icon: IconUserCheck,
      href: '/tickets/assigned',
      show: hasRole('SUPPORT_STAFF'), // Only for support staff
      badge: assignedTickets.length,
    },
    {
      label: tTickets('overdueTickets'),
      icon: IconClock,
      href: '/tickets/overdue',
      show: hasRole('SUPPORT_MANAGER'), // Only for support managers
      badge: safeTickets.filter((t: Ticket) => {
        if (!t.dueDate) return false;
        return (
          new Date(t.dueDate) < new Date() &&
          !['RESOLVED', 'CLOSED'].includes(t.status)
        );
      }).length,
    },
    {
      label: tTickets('slaBreached'),
      icon: IconExclamationMark,
      href: '/tickets/sla-breached',
      show: hasRole('SUPPORT_MANAGER'), // Only for support managers
      badge: slaBreachedTickets.length,
    },
    {
      label: tTickets('createTicket'),
      icon: IconPlus,
      href: '/tickets/create',
      show: hasRole('END_USER'),
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
      label: tAdmin('users'),
      icon: IconUsers,
      href: '/admin/users',
      show: hasRole('ADMIN'), // Only show for ADMIN, not SUPPORT_MANAGER
    },
    {
      label: tAdmin('title'),
      icon: IconShield,
      href: '/admin/panel',
      show: hasRole('ADMIN'),
    },
    {
      label: tAdmin('auditTrail'),
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
      label: tTickets('category'),
      icon: IconClipboardList,
      href: '/admin/categories',
      show: hasRole('ADMIN'),
    },
    {
      label: tAdmin('customFields'),
      icon: IconSettings,
      href: '/admin/custom-fields',
      show: hasRole('ADMIN'),
    },
    {
      label: tAdmin('emailTemplates'),
      icon: IconMail,
      href: '/admin/email-templates',
      show: hasRole('ADMIN'),
    },
    // Workflow & Search
    {
      label: tTickets('slaLevel'),
      icon: IconClock,
      href: '/admin/sla',
      show: hasRole('ADMIN'),
    },
    {
      label: t('search'),
      icon: IconSearch,
      href: '/admin/saved-searches',
      show: hasRole('ADMIN'),
    },
    // System Management
    {
      label: t('backups'),
      icon: IconDatabase,
      href: '/admin/backups',
      show: hasRole('ADMIN'),
    },
    {
      label: t('elasticsearch'),
      icon: IconDatabase,
      href: '/admin/elasticsearch',
      show: hasRole('ADMIN'),
    },
    // Administration Features
    {
      label: 'Integrations',
      icon: IconPlug,
      href: '/admin/integrations',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Permissions',
      icon: IconShield,
      href: '/admin/permissions',
      show: hasRole('ADMIN'),
    },
    {
      label: 'Audit Logs',
      icon: IconFileText,
      href: '/admin/audit-logs',
      show: hasRole('ADMIN'),
    },
  ];

  const isActive = (href: string) => {
    // Special handling for /tickets to avoid highlighting when on sub-pages
    if (href === '/tickets') {
      return pathname === '/tickets';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Helper function to render navigation items
  const renderNavItems = (
    items: typeof essentialItems,
    color: string = 'red'
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
            item.badge !== undefined ? (
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
            {t('navigation')}
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
                    <RTLChevronDown size={14} />
                  ) : (
                    <RTLChevronRight size={14} />
                  )
                }
                onClick={toggleTickets}
                size='sm'
                justify='flex-start'
                fullWidth
              >
                {tTickets('title')}
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
                    <RTLChevronDown size={14} />
                  ) : (
                    <RTLChevronRight size={14} />
                  )
                }
                onClick={toggleAdmin}
                size='sm'
                justify='flex-start'
                fullWidth
              >
                {tAdmin('title')}
              </Button>
              <Collapse in={adminExpanded}>
                <Stack gap='xs' pl='md'>
                  {renderNavItems(adminItems, 'red')}
                  {renderNavItems(additionalAdminItems, 'red')}
                </Stack>
              </Collapse>
            </>
          )}
        </Stack>
      </ScrollArea>
    </AppShell.Navbar>
  );
}
