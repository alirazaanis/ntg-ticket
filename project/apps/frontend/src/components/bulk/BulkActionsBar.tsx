'use client';

import { useState } from 'react';
import {
  Paper,
  Group,
  Button,
  Text,
  Menu,
  ActionIcon,
  Badge,
  Stack,
  Modal,
  Select,
  Textarea,
  Alert,
  Loader,
} from '@mantine/core';
import {
  IconX,
  IconDots,
  IconEdit,
  IconTrash,
  IconUser,
  IconTag,
  IconMail,
  IconAlertCircle,
  IconInfoCircle,
} from '@tabler/icons-react';
import {
  TicketStatus,
  TicketPriority,
  BulkUpdateData,
  User,
} from '../../types/unified';
import { useUsers } from '../../hooks/useUsers';
import {
  isValidStatusTransition,
  getStatusTransitionErrorMessage,
  statusTransitionRules,
} from '../../lib/statusValidation';
import { notifications } from '@mantine/notifications';

interface BulkActionsBarProps {
  selectedTickets: string[];
  onClearSelection: () => void;
  onBulkUpdate: (action: string, data: BulkUpdateData) => void;
  totalTickets: number;
  isProcessing?: boolean;
  selectedTicketsData?: Array<{
    id: string;
    status: TicketStatus;
    ticketNumber: string;
  }>;
}

export function BulkActionsBar({
  selectedTickets,
  onClearSelection,
  onBulkUpdate,
  totalTickets,
  isProcessing = false,
  selectedTicketsData = [],
}: BulkActionsBarProps) {
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>(TicketStatus.NEW);
  const [newPriority, setNewPriority] = useState<TicketPriority>(
    TicketPriority.MEDIUM
  );
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [bulkNote, setBulkNote] = useState('');

  // Fetch users for assignment
  const { data: users, isLoading: usersLoading } = useUsers({ limit: 100 });

  const selectedCount = selectedTickets.length;
  const isAllSelected = selectedCount === totalTickets;

  const statusOptions = Object.values(TicketStatus).map(status => ({
    value: status,
    label: status.replace('_', ' '),
  }));

  const priorityOptions = Object.values(TicketPriority).map(priority => ({
    value: priority,
    label: priority,
  }));

  const handleBulkStatusUpdate = () => {
    // Validate that resolution is provided for RESOLVED status
    if (newStatus === 'RESOLVED' && !bulkNote.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Resolution is required for RESOLVED status',
        color: 'red',
      });
      return;
    }

    // Check for invalid status transitions
    const invalidTransitions: Array<{
      ticketNumber: string;
      currentStatus: string;
      newStatus: string;
    }> = [];

    selectedTicketsData.forEach(ticket => {
      if (!isValidStatusTransition(ticket.status, newStatus)) {
        invalidTransitions.push({
          ticketNumber: ticket.ticketNumber,
          currentStatus: ticket.status,
          newStatus: newStatus,
        });
      }
    });

    if (invalidTransitions.length > 0) {
      // Show user-friendly error message
      const errorMessage =
        `Cannot update status for ${invalidTransitions.length} ticket(s):\n\n` +
        invalidTransitions
          .map(t =>
            getStatusTransitionErrorMessage(
              t.ticketNumber,
              t.currentStatus,
              t.newStatus
            )
          )
          .join('\n') +
        '\n\nPlease check the status transition rules.';

      notifications.show({
        title: 'Invalid Status Transitions',
        message: errorMessage,
        color: 'red',
      });
      return;
    }

    onBulkUpdate('status', { status: newStatus, resolution: bulkNote });
    setStatusModalOpen(false);
    setBulkNote('');
  };

  const handleBulkAssign = () => {
    onBulkUpdate('assign', { assignedToId: selectedAssignee });
    setAssignModalOpen(false);
    setBulkNote('');
  };

  const handleBulkPriorityUpdate = () => {
    onBulkUpdate('priority', { priority: newPriority });
    setPriorityModalOpen(false);
    setBulkNote('');
  };

  const handleBulkDelete = () => {
    onBulkUpdate('delete', {});
    setDeleteModalOpen(false);
    setBulkNote('');
  };

  const handleBulkNotify = () => {
    onBulkUpdate('notify', { message: bulkNote });
    setNotifyModalOpen(false);
    setBulkNote('');
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <Paper
        withBorder
        p='md'
        mb='md'
        style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}
      >
        <Group justify='space-between'>
          <Group>
            <Badge size='lg' variant='filled' color='blue'>
              {selectedCount} selected
            </Badge>
            {isAllSelected && (
              <Badge size='sm' variant='light' color='green'>
                All tickets
              </Badge>
            )}
            <Text size='sm' c='dimmed'>
              {selectedCount} of {totalTickets} tickets selected
            </Text>
          </Group>

          <Group>
            <Menu shadow='md' width={200}>
              <Menu.Target>
                <Button
                  variant='light'
                  leftSection={<IconEdit size={16} />}
                  disabled={isProcessing}
                >
                  Update Status
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {statusOptions.map(option => (
                  <Menu.Item
                    key={option.value}
                    onClick={() => {
                      setNewStatus(option.value as TicketStatus);
                      setStatusModalOpen(true);
                    }}
                  >
                    {option.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>

            <Menu shadow='md' width={200}>
              <Menu.Target>
                <Button
                  variant='light'
                  leftSection={<IconTag size={16} />}
                  disabled={isProcessing}
                >
                  Update Priority
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {priorityOptions.map(option => (
                  <Menu.Item
                    key={option.value}
                    onClick={() => {
                      setNewPriority(option.value as TicketPriority);
                      setPriorityModalOpen(true);
                    }}
                  >
                    {option.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>

            <Button
              variant='light'
              leftSection={<IconUser size={16} />}
              onClick={() => setAssignModalOpen(true)}
              disabled={isProcessing}
            >
              Assign
            </Button>

            <Menu shadow='md' width={200}>
              <Menu.Target>
                <ActionIcon variant='light' color='red' disabled={isProcessing}>
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconMail size={14} />}
                  onClick={() => setNotifyModalOpen(true)}
                >
                  Send Notification
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color='red'
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete Tickets
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <ActionIcon
              variant='subtle'
              onClick={onClearSelection}
              title='Clear selection'
              disabled={isProcessing}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      {/* Status Update Modal */}
      <Modal
        opened={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status for ${selectedCount} Tickets`}
        centered
      >
        <Stack gap='md'>
          <Alert icon={<IconAlertCircle size={16} />} color='blue'>
            This will update the status of {selectedCount} selected tickets to "
            {newStatus.replace('_', ' ')}".
          </Alert>

          {/* Show status transition info */}
          <Alert icon={<IconInfoCircle size={16} />} color='yellow'>
            <Text size='sm' fw={500} mb='xs'>
              Status Transition Rules:
            </Text>
            <Text size='xs' c='dimmed'>
              {statusTransitionRules.map(rule => `• ${rule}`).join('\n')}
            </Text>
          </Alert>
          <Textarea
            label={
              newStatus === 'RESOLVED'
                ? 'Resolution (required)'
                : 'Note (optional)'
            }
            placeholder={
              newStatus === 'RESOLVED'
                ? 'Add resolution details for resolved tickets...'
                : 'Add a note about this bulk status update...'
            }
            value={bulkNote}
            onChange={e => setBulkNote(e.target.value)}
            minRows={3}
            required={newStatus === 'RESOLVED'}
          />
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkStatusUpdate}
              loading={isProcessing}
              disabled={newStatus === 'RESOLVED' && !bulkNote.trim()}
            >
              Update Status
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        opened={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign ${selectedCount} Tickets`}
        centered
      >
        <Stack gap='md'>
          <Alert icon={<IconAlertCircle size={16} />} color='blue'>
            This will assign {selectedCount} selected tickets to the chosen
            user.
          </Alert>
          <Select
            label='Assign To'
            placeholder={usersLoading ? 'Loading users...' : 'Select a user'}
            data={
              users
                ?.filter((user: User) =>
                  ['SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN'].includes(
                    user.role
                  )
                )
                .map((user: User) => ({
                  value: user.id,
                  label: `${user.name} (${user.role})`,
                })) || []
            }
            value={selectedAssignee}
            onChange={value => setSelectedAssignee(value || '')}
            searchable
            required
            disabled={usersLoading}
            leftSection={usersLoading ? <Loader size='xs' /> : undefined}
          />
          <Textarea
            label='Note (optional)'
            placeholder='Add a note about this assignment...'
            value={bulkNote}
            onChange={e => setBulkNote(e.target.value)}
            minRows={3}
          />
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={!selectedAssignee || isProcessing}
              loading={isProcessing}
            >
              Assign Tickets
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Priority Update Modal */}
      <Modal
        opened={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        title={`Update Priority for ${selectedCount} Tickets`}
        centered
      >
        <Stack gap='md'>
          <Alert icon={<IconAlertCircle size={16} />} color='blue'>
            This will update the priority of {selectedCount} selected tickets to
            "{newPriority}".
          </Alert>
          <Textarea
            label='Note (optional)'
            placeholder='Add a note about this priority update...'
            value={bulkNote}
            onChange={e => setBulkNote(e.target.value)}
            minRows={3}
          />
          <Group justify='flex-end'>
            <Button
              variant='outline'
              onClick={() => setPriorityModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkPriorityUpdate} loading={isProcessing}>
              Update Priority
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`Delete ${selectedCount} Tickets`}
        centered
      >
        <Stack gap='md'>
          <Alert icon={<IconAlertCircle size={16} />} color='red'>
            <Text fw={500}>Warning: This action cannot be undone!</Text>
            <Text size='sm'>
              You are about to permanently delete {selectedCount} tickets. This
              action cannot be reversed.
            </Text>
          </Alert>
          <Textarea
            label='Reason for deletion (required)'
            placeholder='Please provide a reason for deleting these tickets...'
            value={bulkNote}
            onChange={e => setBulkNote(e.target.value)}
            minRows={3}
            required
          />
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color='red'
              onClick={handleBulkDelete}
              disabled={!bulkNote.trim() || isProcessing}
              loading={isProcessing}
            >
              Delete Tickets
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Notification Modal */}
      <Modal
        opened={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        title={`Send Notification to ${selectedCount} Tickets`}
        centered
      >
        <Stack gap='md'>
          <Alert icon={<IconAlertCircle size={16} />} color='blue'>
            This will send a notification to the requesters of {selectedCount}{' '}
            selected tickets.
          </Alert>
          <Textarea
            label='Notification Message'
            placeholder='Enter the notification message...'
            value={bulkNote}
            onChange={e => setBulkNote(e.target.value)}
            minRows={4}
            required
          />
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => setNotifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkNotify}
              disabled={!bulkNote.trim() || isProcessing}
              loading={isProcessing}
            >
              Send Notification
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
