'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  TicketStatus,
  TicketPriority,
  Comment,
  Attachment,
} from '../../../types/unified';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Badge,
  Stack,
  Card,
  Textarea,
  ActionIcon,
  Menu,
  Modal,
  Alert,
  Loader,
  Tabs,
  Paper,
  Avatar,
  Timeline,
  Progress,
  Grid,
  Select,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconMessage,
  IconPaperclip,
  IconUser,
  IconCalendar,
  IconClock,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconDownload,
  IconEye,
  IconDots,
  IconSend,
  IconHistory,
  IconBell,
  IconShare,
} from '@tabler/icons-react';
import {
  useTicket,
  useUpdateTicketStatus,
  useAssignTicket,
} from '../../../hooks/useTickets';
import { useCreateComment } from '../../../hooks/useComments';
import { useUsers } from '../../../hooks/useUsers';
import { useAuthStore } from '../../../stores/useAuthStore';

import { notifications } from '@mantine/notifications';
import { formatDistanceToNow } from 'date-fns';
import {
  PAGINATION_CONFIG,
  ROLE_GROUPS,
  STATUS_FILTERS,
} from '../../../lib/constants';

const statusColors: Record<TicketStatus, string> = {
  NEW: 'blue',
  OPEN: 'green',
  IN_PROGRESS: 'yellow',
  ON_HOLD: 'orange',
  RESOLVED: 'gray',
  CLOSED: 'dark',
  REOPENED: 'red',
};

const priorityColors: Record<TicketPriority, string> = {
  LOW: 'green',
  MEDIUM: 'yellow',
  HIGH: 'orange',
  CRITICAL: 'red',
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const ticketId = params.id as string;

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>(TicketStatus.NEW);
  const [resolution, setResolution] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('details');

  const { data: ticket, isLoading, error } = useTicket(ticketId);
  const { data: users, isLoading: usersLoading } = useUsers({
    limit: PAGINATION_CONFIG.BULK_ACTIONS_LIMIT,
  });
  const updateStatusMutation = useUpdateTicketStatus();
  const assignTicketMutation = useAssignTicket();
  const addCommentMutation = useCreateComment();

  const canEdit =
    ROLE_GROUPS.ADMIN_ONLY.includes(user?.role as 'ADMIN') ||
    ROLE_GROUPS.MANAGEMENT.includes(
      user?.role as 'SUPPORT_MANAGER' | 'ADMIN'
    ) ||
    (user?.role === 'SUPPORT_STAFF' && ticket?.assignedTo?.id === user?.id);
  const canAssign = ROLE_GROUPS.SUPPORT_TEAM.includes(
    user?.role as 'SUPPORT_STAFF' | 'SUPPORT_MANAGER' | 'ADMIN'
  );
  const canDelete = ROLE_GROUPS.ADMIN_ONLY.includes(user?.role as 'ADMIN');

  const handleStatusUpdate = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: ticketId,
        status: newStatus,
        resolution: resolution || undefined,
        currentStatus: ticket?.status || '',
      });
      notifications.show({
        title: 'Success',
        message: 'Ticket status updated successfully',
        color: 'green',
      });
      setStatusModalOpen(false);
      setResolution('');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update ticket status',
        color: 'red',
      });
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedAssignee) {
      notifications.show({
        title: 'Error',
        message: 'Please select a user to assign the ticket to',
        color: 'red',
      });
      return;
    }

    try {
      await assignTicketMutation.mutateAsync({
        id: ticketId,
        assignedToId: selectedAssignee,
      });
      notifications.show({
        title: 'Success',
        message: 'Ticket assigned successfully',
        color: 'green',
      });
      setAssignModalOpen(false);
      setSelectedAssignee(''); // Reset selection
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to assign ticket',
        color: 'red',
      });
    }
  };

  const handleAddComment = async () => {
    try {
      await addCommentMutation.mutateAsync({
        ticketId,
        content: newComment,
        isInternal: isInternalComment,
      });
      notifications.show({
        title: 'Success',
        message: 'Comment added successfully',
        color: 'green',
      });
      setCommentModalOpen(false);
      setNewComment('');
      setIsInternalComment(false);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add comment',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return (
      <Container size='xl' py='md'>
        <Group justify='center' mt='xl'>
          <Loader size='lg' />
          <Text>Loading ticket details...</Text>
        </Group>
      </Container>
    );
  }

  if (error || !ticket) {
    return (
      <Container size='xl' py='md'>
        <Alert icon={<IconAlertCircle size={16} />} title='Error' color='red'>
          Failed to load ticket: {error?.message || 'Ticket not found'}
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
      {/* Header */}
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
            <Title order={1}>Ticket #{ticket.ticketNumber}</Title>
            <Text c='dimmed'>{ticket.title}</Text>
          </div>
        </Group>
        <Group>
          {canEdit && (
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => router.push(`/tickets/${ticketId}/edit`)}
            >
              Edit
            </Button>
          )}
          <Menu shadow='md' width={200}>
            <Menu.Target>
              <ActionIcon variant='subtle'>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconShare size={14} />}>Share</Menu.Item>
              <Menu.Item leftSection={<IconBell size={14} />}>
                Subscribe
              </Menu.Item>
              {canDelete && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color='red'
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Grid>
        {/* Main Content */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value='details' leftSection={<IconEye size={16} />}>
                Details
              </Tabs.Tab>
              <Tabs.Tab
                value='comments'
                leftSection={<IconMessage size={16} />}
              >
                Comments ({ticket.comments?.length || 0})
              </Tabs.Tab>
              <Tabs.Tab
                value='attachments'
                leftSection={<IconPaperclip size={16} />}
              >
                Attachments ({ticket.attachments?.length || 0})
              </Tabs.Tab>
              <Tabs.Tab value='history' leftSection={<IconHistory size={16} />}>
                History
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value='details' pt='md'>
              <Stack gap='md'>
                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Description
                  </Title>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: ticket.description || '',
                    }}
                    style={{
                      lineHeight: '1.6',
                      fontSize: '14px',
                      color: 'var(--mantine-color-text)',
                    }}
                  />
                </Paper>

                <Paper withBorder p='md'>
                  <Title order={3} mb='md'>
                    Comments
                  </Title>
                  <Stack gap='md'>
                    {ticket.comments?.map((comment: Comment) => (
                      <Card key={comment.id} withBorder p='md'>
                        <Group justify='space-between' mb='sm'>
                          <Group gap='sm'>
                            <Avatar size='sm' />
                            <div>
                              <Text fw={500} size='sm'>
                                {comment.user.name}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                {comment.createdAt
                                  ? formatDistanceToNow(
                                      new Date(comment.createdAt),
                                      { addSuffix: true }
                                    )
                                  : 'Unknown time'}
                              </Text>
                            </div>
                          </Group>
                          {comment.isInternal && (
                            <Badge size='xs' color='orange'>
                              Internal
                            </Badge>
                          )}
                        </Group>
                        <Text size='sm' style={{ whiteSpace: 'pre-wrap' }}>
                          {comment.content}
                        </Text>
                      </Card>
                    ))}
                    {(!ticket.comments || ticket.comments.length === 0) && (
                      <Text c='dimmed' ta='center' py='xl'>
                        No comments yet. Be the first to add a comment!
                      </Text>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value='comments' pt='md'>
              <Stack gap='md'>
                <Paper withBorder p='md'>
                  <Group justify='space-between' mb='md'>
                    <Title order={3}>Comments</Title>
                    <Button
                      leftSection={<IconMessage size={16} />}
                      onClick={() => setCommentModalOpen(true)}
                    >
                      Add Comment
                    </Button>
                  </Group>
                  <Stack gap='md'>
                    {ticket.comments?.map((comment: Comment) => (
                      <Card key={comment.id} withBorder p='md'>
                        <Group justify='space-between' mb='sm'>
                          <Group gap='sm'>
                            <Avatar size='sm' />
                            <div>
                              <Text fw={500} size='sm'>
                                {comment.user.name}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                {comment.createdAt
                                  ? formatDistanceToNow(
                                      new Date(comment.createdAt),
                                      { addSuffix: true }
                                    )
                                  : 'Unknown time'}
                              </Text>
                            </div>
                          </Group>
                          {comment.isInternal && (
                            <Badge size='xs' color='orange'>
                              Internal
                            </Badge>
                          )}
                        </Group>
                        <Text size='sm' style={{ whiteSpace: 'pre-wrap' }}>
                          {comment.content}
                        </Text>
                      </Card>
                    ))}
                    {(!ticket.comments || ticket.comments.length === 0) && (
                      <Text c='dimmed' ta='center' py='xl'>
                        No comments yet. Be the first to add a comment!
                      </Text>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value='attachments' pt='md'>
              <Paper withBorder p='md'>
                <Group justify='space-between' mb='md'>
                  <Title order={3}>Attachments</Title>
                  <Button leftSection={<IconPaperclip size={16} />}>
                    Upload File
                  </Button>
                </Group>
                <Stack gap='md'>
                  {ticket.attachments?.map((attachment: Attachment) => (
                    <Card key={attachment.id} withBorder p='md'>
                      <Group justify='space-between'>
                        <Group gap='sm'>
                          <IconPaperclip size={16} />
                          <div>
                            <Text fw={500} size='sm'>
                              {attachment.filename}
                            </Text>
                            <Text size='xs' c='dimmed'>
                              {(attachment.fileSize / 1024).toFixed(1)} KB
                            </Text>
                          </div>
                        </Group>
                        <ActionIcon variant='subtle'>
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  ))}
                  {(!ticket.attachments || ticket.attachments.length === 0) && (
                    <Text c='dimmed' ta='center' py='xl'>
                      No attachments yet.
                    </Text>
                  )}
                </Stack>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value='history' pt='md'>
              <Paper withBorder p='md'>
                <Title order={3} mb='md'>
                  Ticket History
                </Title>
                <Timeline active={-1} bulletSize={24} lineWidth={2}>
                  <Timeline.Item
                    bullet={<IconCheck size={12} />}
                    title='Ticket Created'
                  >
                    <Text c='dimmed' size='sm'>
                      Created by {ticket.requester?.name} on{' '}
                      {new Date(ticket.createdAt).toLocaleString()}
                    </Text>
                  </Timeline.Item>
                  {ticket.updatedAt !== ticket.createdAt && (
                    <Timeline.Item
                      bullet={<IconEdit size={12} />}
                      title='Last Updated'
                    >
                      <Text c='dimmed' size='sm'>
                        Updated on {new Date(ticket.updatedAt).toLocaleString()}
                      </Text>
                    </Timeline.Item>
                  )}
                  {ticket.closedAt && (
                    <Timeline.Item
                      bullet={<IconX size={12} />}
                      title='Ticket Closed'
                    >
                      <Text c='dimmed' size='sm'>
                        Closed on {new Date(ticket.closedAt).toLocaleString()}
                      </Text>
                    </Timeline.Item>
                  )}
                </Timeline>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>

        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap='md'>
            {/* Status Card */}
            <Card withBorder p='md'>
              <Title order={4} mb='md'>
                Status & Priority
              </Title>
              <Stack gap='sm'>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>
                    Status
                  </Text>
                  <Badge
                    color={statusColors[ticket.status as TicketStatus]}
                    variant='light'
                  >
                    {ticket.status?.replace('_', ' ') || 'Unknown'}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>
                    Priority
                  </Text>
                  <Badge
                    color={priorityColors[ticket.priority as TicketPriority]}
                    variant='outline'
                  >
                    {ticket.priority}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>
                    Impact
                  </Text>
                  <Text size='sm'>{ticket.impact}</Text>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>
                    Urgency
                  </Text>
                  <Text size='sm'>{ticket.urgency}</Text>
                </Group>
                {canEdit && (
                  <Button
                    variant='light'
                    size='sm'
                    onClick={() => {
                      setNewStatus(ticket.status as TicketStatus);
                      setStatusModalOpen(true);
                    }}
                  >
                    Update Status
                  </Button>
                )}
              </Stack>
            </Card>

            {/* Assignment Card */}
            <Card withBorder p='md'>
              <Title order={4} mb='md'>
                Assignment
              </Title>
              <Stack gap='sm'>
                <Group gap='sm'>
                  <IconUser size={16} />
                  <div>
                    <Text size='sm' fw={500}>
                      Requester
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {ticket.requester?.name}
                    </Text>
                  </div>
                </Group>
                <Group gap='sm'>
                  <IconUser size={16} />
                  <div>
                    <Text size='sm' fw={500}>
                      Assigned To
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {ticket.assignedTo?.name || 'Unassigned'}
                    </Text>
                  </div>
                </Group>
                {canAssign && (
                  <Button
                    variant='light'
                    size='sm'
                    onClick={() => setAssignModalOpen(true)}
                  >
                    Assign Ticket
                  </Button>
                )}
              </Stack>
            </Card>

            {/* Details Card */}
            <Card withBorder p='md'>
              <Title order={4} mb='md'>
                Details
              </Title>
              <Stack gap='sm'>
                <Group gap='sm'>
                  <IconCalendar size={16} />
                  <div>
                    <Text size='sm' fw={500}>
                      Created
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </Group>
                <Group gap='sm'>
                  <IconClock size={16} />
                  <div>
                    <Text size='sm' fw={500}>
                      Last Updated
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {ticket.updatedAt
                        ? formatDistanceToNow(new Date(ticket.updatedAt), {
                            addSuffix: true,
                          })
                        : 'Unknown time'}
                    </Text>
                  </div>
                </Group>
                <Group gap='sm'>
                  <IconUser size={16} />
                  <div>
                    <Text size='sm' fw={500}>
                      Category
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {ticket.category?.name || 'Unknown'} -{' '}
                      {ticket.subcategory?.name || 'Unknown'}
                    </Text>
                  </div>
                </Group>
                {ticket.dueDate && (
                  <Group gap='sm'>
                    <IconClock size={16} />
                    <div>
                      <Text size='sm' fw={500}>
                        Due Date
                      </Text>
                      <Text size='sm' c='dimmed'>
                        {new Date(ticket.dueDate).toLocaleDateString()}
                      </Text>
                    </div>
                  </Group>
                )}
              </Stack>
            </Card>

            {/* SLA Card */}
            {ticket.slaCompliance !== undefined && (
              <Card withBorder p='md'>
                <Title order={4} mb='md'>
                  SLA Compliance
                </Title>
                <Stack gap='sm'>
                  <div>
                    <Group justify='space-between' mb='xs'>
                      <Text size='sm'>Response Time</Text>
                      <Text size='sm' fw={500}>
                        {ticket.responseTime
                          ? `${ticket.responseTime}h`
                          : 'N/A'}
                      </Text>
                    </Group>
                    <Progress value={ticket.slaCompliance} size='sm' />
                  </div>
                  <Text size='xs' c='dimmed'>
                    SLA Level: {ticket.slaLevel}
                  </Text>
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Status Update Modal */}
      <Modal
        opened={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title='Update Ticket Status'
        centered
      >
        <Stack gap='md'>
          <Select
            label='New Status'
            data={Object.values(TicketStatus).map(status => ({
              value: status,
              label: status?.replace('_', ' ') || status,
            }))}
            value={newStatus}
            onChange={value => setNewStatus(value as TicketStatus)}
          />
          {STATUS_FILTERS.RESOLVED.includes(
            newStatus as 'RESOLVED' | 'CLOSED'
          ) && (
            <Textarea
              label='Resolution Notes'
              placeholder='Describe how the issue was resolved...'
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              minRows={3}
            />
          )}
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              loading={updateStatusMutation.isPending}
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
        title='Assign Ticket'
        centered
      >
        <Stack gap='md'>
          <Select
            label='Assign To'
            placeholder={usersLoading ? 'Loading users...' : 'Select a user'}
            data={
              users
                ?.filter(user =>
                  ROLE_GROUPS.SUPPORT_TEAM.includes(
                    user.role as 'SUPPORT_STAFF' | 'SUPPORT_MANAGER' | 'ADMIN'
                  )
                )
                .map(user => ({
                  value: user.id,
                  label: `${user.name} (${user.role})`,
                })) || []
            }
            value={selectedAssignee}
            onChange={value => setSelectedAssignee(value || '')}
            searchable
            disabled={usersLoading}
          />
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignTicket}
              loading={assignTicketMutation.isPending}
              disabled={!selectedAssignee}
            >
              Assign
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Comment Modal */}
      <Modal
        opened={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title='Add Comment'
        centered
        size='lg'
        fullScreen
      >
        <Stack gap='md'>
          <Textarea
            label='Comment'
            placeholder='Add your comment here...'
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            minRows={4}
            required
          />
          {ROLE_GROUPS.SUPPORT_TEAM.includes(
            user?.role as 'SUPPORT_STAFF' | 'SUPPORT_MANAGER' | 'ADMIN'
          ) && (
            <Group>
              <input
                type='checkbox'
                id='internal-comment'
                checked={isInternalComment}
                onChange={e => setIsInternalComment(e.target.checked)}
              />
              <label htmlFor='internal-comment'>
                Internal comment (staff only)
              </label>
            </Group>
          )}
          <Group justify='flex-end'>
            <Button
              variant='outline'
              onClick={() => setCommentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddComment}
              loading={addCommentMutation.isPending}
              leftSection={<IconSend size={16} />}
            >
              Add Comment
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title='Delete Ticket'
        centered
      >
        <Stack gap='md'>
          <Text>
            Are you sure you want to delete ticket #{ticket.ticketNumber}? This
            action cannot be undone.
          </Text>
          <Group justify='flex-end'>
            <Button variant='outline' onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color='red'>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
