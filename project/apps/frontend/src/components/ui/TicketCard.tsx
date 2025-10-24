'use client';

// Utility function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

import {
  Card,
  Text,
  Group,
  Badge,
  Button,
  ActionIcon,
  Stack,
  Divider,
  Menu,
  Modal,
  Textarea,
  Select,
  // Alert, // Removed unused import
} from '@mantine/core';
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconMessage,
  IconClock,
  IconUser,
  IconCalendar,
  IconAlertCircle,
  IconDots,
  IconFileText,
  IconPaperclip,
} from '@tabler/icons-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Ticket, TicketStatus } from '../../types/unified';
import { useUpdateTicketStatus } from '../../hooks/useTickets';
import {
  validateStatusUpdate,
  // statusTransitionRules, // Removed unused import
} from '../../lib/statusValidation';
import {
  showSuccessNotification,
  showErrorNotification,
} from '@/lib/notifications';
import { useTranslations } from 'next-intl';
import { useDynamicTheme } from '../../hooks/useDynamicTheme';
import { getEarthyColor } from '../../lib/colorConfig';

interface TicketCardProps {
  ticket: Ticket;
  showActions?: boolean;
  urgent?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onComment?: () => void;
  onStatusChange?: (status: string) => void;
}

export function TicketCard({
  ticket,
  showActions = false,
  urgent = false,
  onView,
  onEdit,
  onDelete,
  onComment,
  onStatusChange,
}: TicketCardProps) {
  const t = useTranslations('common');
  const tTickets = useTranslations('tickets');
  const [statusModalOpened, setStatusModalOpened] = useState(false);
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [resolution, setResolution] = useState('');
  const { primary } = useDynamicTheme();

  const updateStatusMutation = useUpdateTicketStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return getEarthyColor('light');
      case 'OPEN':
        return getEarthyColor('warm');
      case 'IN_PROGRESS':
        return getEarthyColor('saturated');
      case 'ON_HOLD':
        return getEarthyColor('neutral');
      case 'RESOLVED':
        return getEarthyColor('cool');
      case 'CLOSED':
        return getEarthyColor('darkest');
      case 'REOPENED':
        return getEarthyColor('darker');
      default:
        return getEarthyColor('light');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return getEarthyColor('light');
      case 'MEDIUM':
        return getEarthyColor('neutral');
      case 'HIGH':
        return getEarthyColor('warm');
      case 'CRITICAL':
        return getEarthyColor('darker');
      default:
        return getEarthyColor('neutral');
    }
  };

  const isOverdue =
    ticket.dueDate &&
    new Date(ticket.dueDate) < new Date() &&
    !['RESOLVED', 'CLOSED'].includes(ticket.status);

  const handleStatusChange = async () => {
    // Validate status transition
    const validation = validateStatusUpdate(
      ticket.status as TicketStatus,
      newStatus as TicketStatus,
      resolution
    );

    if (!validation.isValid) {
      showErrorNotification(
        'Invalid Status Update',
        validation.errorMessage || 'Invalid status update'
      );
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: ticket.id,
        status: newStatus,
        resolution,
        currentStatus: ticket.status,
      });

      showSuccessNotification(
        'Status Updated',
        `Ticket #${ticket.ticketNumber} status updated to ${newStatus.replace('_', ' ')}`
      );

      // Call the parent callback if provided
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      setStatusModalOpened(false);
      setResolution('');
    } catch (error) {
      showErrorNotification(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update status'
      );
    }
  };

  return (
    <>
      <Card
        withBorder
        p='md'
        radius='md'
        style={{
          borderColor: urgent ? primary : undefined,
          borderWidth: urgent ? 2 : undefined,
        }}
      >
        <Stack gap='sm'>
          {/* Header */}
          <Group justify='space-between' align='flex-start'>
            <div style={{ flex: 1 }}>
              <Text fw={600} size='sm' lineClamp={2}>
                {ticket.title}
              </Text>
              <Text size='xs' c='dimmed' mt={4}>
                {ticket.ticketNumber}
              </Text>
            </div>
            {showActions && (
              <Menu shadow='md' width={200}>
                <Menu.Target>
                  <ActionIcon variant='subtle' size='sm'>
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEye size={14} />}
                    onClick={onView}
                  >
                    View Details
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={onEdit}
                  >
                    Edit Ticket
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconMessage size={14} />}
                    onClick={onComment}
                  >
                    Add Comment
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconFileText size={14} />}
                    onClick={() => setStatusModalOpened(true)}
                  >
                    Change Status
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    style={{ color: getEarthyColor('darker') }}
                    onClick={onDelete}
                  >
                    Delete Ticket
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>

          {/* Description */}
          <Text size='sm' c='dimmed' lineClamp={2}>
            {stripHtmlTags(ticket.description)}
          </Text>

          {/* Status and Priority */}
          <Group gap='xs'>
            <Badge
              color={getStatusColor(ticket.status)}
              size='sm'
              variant='light'
            >
              {ticket.status.replace('_', ' ')}
            </Badge>
            <Badge
              color={getPriorityColor(ticket.priority)}
              size='sm'
              variant='outline'
            >
              {ticket.priority}
            </Badge>
            {isOverdue && (
              <Badge
                style={{ backgroundColor: getEarthyColor('darker'), color: 'white' }}
                size='sm'
                leftSection={<IconAlertCircle size={12} />}
              >
                {tTickets('overdueTickets')}
              </Badge>
            )}
          </Group>

          {/* Category and Subcategory */}
          <Group gap='xs'>
            <Text size='xs' c='dimmed'>
              {ticket.category?.customName || ticket.category?.name || t('unknown')} •{' '}
              {ticket.subcategory?.name || t('unknown')}
            </Text>
          </Group>

          {/* Assignee and Requester */}
          <Group gap='xs'>
            {ticket.assignedTo && (
              <Group gap={4}>
                <IconUser size={12} />
                <Text size='xs' c='dimmed'>
                  {tTickets('assignedTo')} {ticket.assignedTo.name}
                </Text>
              </Group>
            )}
            <Group gap={4}>
              <IconUser size={12} />
              <Text size='xs' c='dimmed'>
                {t('by')} {ticket.requester?.name || t('unknown')}
              </Text>
            </Group>
          </Group>

          {/* Dates */}
          <Group gap='md'>
            <Group gap={4}>
              <IconCalendar size={12} />
              <Text size='xs' c='dimmed'>
                Created {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
              </Text>
            </Group>
            {ticket.dueDate && (
              <Group gap={4}>
                <IconClock size={12} />
                <Text size='xs' style={{ color: isOverdue ? getEarthyColor('darker') : undefined }} c={isOverdue ? undefined : 'dimmed'}>
                  Due {format(new Date(ticket.dueDate), 'MMM dd, yyyy')}
                </Text>
              </Group>
            )}
          </Group>

          {/* Stats */}
          <Group gap='md'>
            {ticket.comments && (
              <Group gap={4}>
                <IconMessage size={12} />
                <Text size='xs' c='dimmed'>
                  {ticket.comments.length} comments
                </Text>
              </Group>
            )}
            {ticket.attachments && (
              <Group gap={4}>
                <IconPaperclip size={12} />
                <Text size='xs' c='dimmed'>
                  {ticket.attachments.length} attachments
                </Text>
              </Group>
            )}
          </Group>

          {/* Actions */}
          {showActions && (
            <>
              <Divider />
              <Group justify='space-between'>
                <Button
                  size='xs'
                  variant='light'
                  leftSection={<IconEye size={12} />}
                  onClick={onView}
                >
                  View
                </Button>
                <Button
                  size='xs'
                  variant='light'
                  leftSection={<IconMessage size={12} />}
                  onClick={onComment}
                >
                  Comment
                </Button>
                <Button
                  size='xs'
                  variant='light'
                  leftSection={<IconFileText size={12} />}
                  onClick={() => setStatusModalOpened(true)}
                >
                  Status
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Card>

      {/* Status Change Modal */}
      <Modal
        opened={statusModalOpened}
        onClose={() => setStatusModalOpened(false)}
        title={tTickets('changeStatus')}
        size='md'
      >
        <Stack gap='md'>
          <Select
            label={t('newStatus')}
            placeholder={t('selectStatus')}
            data={[
              { value: 'NEW', label: t('new') },
              { value: 'OPEN', label: t('open') },
              { value: 'IN_PROGRESS', label: t('in_progress') },
              { value: 'ON_HOLD', label: t('on_hold') },
              { value: 'RESOLVED', label: t('resolved') },
              { value: 'CLOSED', label: t('closed') },
              { value: 'REOPENED', label: t('reopened') },
            ]}
            value={newStatus}
            onChange={value =>
              setNewStatus((value as typeof ticket.status) || ticket.status)
            }
          />

          {(newStatus === 'RESOLVED' || newStatus === 'CLOSED') && (
            <Textarea
              label='Resolution Notes'
              placeholder='Enter resolution details...'
              value={resolution}
              onChange={event => setResolution(event.currentTarget.value)}
              required={newStatus === 'RESOLVED'}
            />
          )}

          <Group justify='flex-end'>
            <Button
              variant='outline'
              onClick={() => setStatusModalOpened(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              loading={updateStatusMutation.isPending}
              disabled={
                (newStatus === 'RESOLVED' && !resolution.trim()) ||
                updateStatusMutation.isPending
              }
            >
              Update Status
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
