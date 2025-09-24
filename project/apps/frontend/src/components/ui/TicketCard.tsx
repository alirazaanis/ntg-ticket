'use client';

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
import { Ticket } from '../../types/unified';

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
  const [statusModalOpened, setStatusModalOpened] = useState(false);
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [resolution, setResolution] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'blue';
      case 'OPEN':
        return 'orange';
      case 'IN_PROGRESS':
        return 'yellow';
      case 'ON_HOLD':
        return 'gray';
      case 'RESOLVED':
        return 'green';
      case 'CLOSED':
        return 'dark';
      case 'REOPENED':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'green';
      case 'MEDIUM':
        return 'blue';
      case 'HIGH':
        return 'orange';
      case 'CRITICAL':
        return 'red';
      default:
        return 'blue';
    }
  };

  const isOverdue =
    ticket.dueDate &&
    new Date(ticket.dueDate) < new Date() &&
    !['RESOLVED', 'CLOSED'].includes(ticket.status);

  const handleStatusChange = () => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setStatusModalOpened(false);
  };

  return (
    <>
      <Card
        withBorder
        p='md'
        radius='md'
        style={{
          borderColor: urgent ? 'var(--mantine-color-red-6)' : undefined,
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
                    color='red'
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
            {ticket.description}
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
                color='red'
                size='sm'
                leftSection={<IconAlertCircle size={12} />}
              >
                Overdue
              </Badge>
            )}
          </Group>

          {/* Category and Subcategory */}
          <Group gap='xs'>
            <Text size='xs' c='dimmed'>
              {ticket.category?.name || 'Unknown'} •{' '}
              {ticket.subcategory?.name || 'Unknown'}
            </Text>
          </Group>

          {/* Assignee and Requester */}
          <Group gap='xs'>
            {ticket.assignedTo && (
              <Group gap={4}>
                <IconUser size={12} />
                <Text size='xs' c='dimmed'>
                  Assigned to {ticket.assignedTo.name}
                </Text>
              </Group>
            )}
            <Group gap={4}>
              <IconUser size={12} />
              <Text size='xs' c='dimmed'>
                By {ticket.requester?.name || 'Unknown'}
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
                <Text size='xs' c={isOverdue ? 'red' : 'dimmed'}>
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
        title='Change Ticket Status'
        size='md'
      >
        <Stack gap='md'>
          <Select
            label='New Status'
            placeholder='Select status'
            data={[
              { value: 'NEW', label: 'New' },
              { value: 'OPEN', label: 'Open' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'ON_HOLD', label: 'On Hold' },
              { value: 'RESOLVED', label: 'Resolved' },
              { value: 'CLOSED', label: 'Closed' },
              { value: 'REOPENED', label: 'Reopened' },
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
            <Button onClick={handleStatusChange}>Update Status</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
