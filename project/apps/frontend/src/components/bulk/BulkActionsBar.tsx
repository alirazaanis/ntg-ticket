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
} from '@tabler/icons-react';
import {
  TicketStatus,
  TicketPriority,
  BulkUpdateData,
} from '../../types/unified';

interface BulkActionsBarProps {
  selectedTickets: string[];
  onClearSelection: () => void;
  onBulkUpdate: (action: string, data: BulkUpdateData) => void;
  totalTickets: number;
}

export function BulkActionsBar({
  selectedTickets,
  onClearSelection,
  onBulkUpdate,
  totalTickets,
}: BulkActionsBarProps) {
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>(TicketStatus.NEW);
  const [newPriority, setNewPriority] = useState<TicketPriority>(
    TicketPriority.MEDIUM
  );
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [bulkNote, setBulkNote] = useState('');

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
    onBulkUpdate('status', { status: newStatus, note: bulkNote });
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
                <Button variant='light' leftSection={<IconEdit size={16} />}>
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
                <Button variant='light' leftSection={<IconTag size={16} />}>
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
            >
              Assign
            </Button>

            <Menu shadow='md' width={200}>
              <Menu.Target>
                <ActionIcon variant='light' color='red'>
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconMail size={14} />}
                  onClick={() => onBulkUpdate('notify', {})}
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
          <Textarea
            label='Note (optional)'
            placeholder='Add a note about this bulk status update...'
            value={bulkNote}
            onChange={e => setBulkNote(e.target.value)}
            minRows={3}
          />
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusUpdate}>Update Status</Button>
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
            placeholder='Select a user'
            data={[
              { value: 'user1', label: 'John Doe (Support Staff)' },
              { value: 'user2', label: 'Jane Smith (Support Staff)' },
              { value: 'user3', label: 'Mike Johnson (Support Manager)' },
            ]}
            value={selectedAssignee}
            onChange={value => setSelectedAssignee(value || '')}
            searchable
            required
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
            <Button onClick={handleBulkAssign} disabled={!selectedAssignee}>
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
            <Button onClick={handleBulkPriorityUpdate}>Update Priority</Button>
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
              disabled={!bulkNote.trim()}
            >
              Delete Tickets
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
