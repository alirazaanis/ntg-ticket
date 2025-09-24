'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { notifications } from '@mantine/notifications';

// WebSocket event data types
export interface WebSocketEventData {
  [key: string]: unknown;
}

export interface TypingEventData {
  userId: string;
  isTyping: boolean;
}

export interface TicketEventData {
  id: string;
  ticketNumber: string;
  title: string;
  [key: string]: unknown;
}

export interface CommentEventData {
  comment: {
    id: string;
    content: string;
    userId: string;
    [key: string]: unknown;
  };
  ticket: {
    id: string;
    ticketNumber: string;
    [key: string]: unknown;
  };
}

export interface NotificationEventData {
  id: string;
  title: string;
  message: string;
  type: string;
  [key: string]: unknown;
}

export function useWebSocket() {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!session?.accessToken) return;

    const newSocket = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
      {
        auth: {
          token: session.accessToken,
        },
        transports: ['websocket'],
      }
    );

    newSocket.on('connect', () => {
      setConnected(true);
      setError(null);

      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    });

    newSocket.on('disconnect', reason => {
      setConnected(false);

      // Show notification for disconnection
      if (reason === 'io server disconnect') {
        notifications.show({
          title: 'Connection Lost',
          message: 'Lost connection to server. Attempting to reconnect...',
          color: 'yellow',
        });

        // Server disconnected, try to reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          newSocket.connect();
        }, 5000);
      }
    });

    newSocket.on('connect_error', error => {
      setError('Failed to connect to server');
      setConnected(false);

      notifications.show({
        title: 'Connection Error',
        message: 'Failed to connect to server. Please check your connection.',
        color: 'red',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-console
      console.error('WebSocket connection error:', error);
    });

    newSocket.on('connected', data => {
      // WebSocket authentication successful
      notifications.show({
        title: 'Connected',
        message: 'Successfully connected to server',
        color: 'green',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-console
      console.log('WebSocket authentication successful:', data);
    });

    // Ticket events
    newSocket.on('ticket_created', (ticket: TicketEventData) => {
      notifications.show({
        title: 'New Ticket Created',
        message: `Ticket ${ticket.ticketNumber} has been created`,
        color: 'blue',
      });
    });

    newSocket.on('ticket_updated', (ticket: TicketEventData) => {
      notifications.show({
        title: 'Ticket Updated',
        message: `Ticket ${ticket.ticketNumber} has been updated`,
        color: 'green',
      });
    });

    newSocket.on('ticket_assigned', (ticket: TicketEventData) => {
      notifications.show({
        title: 'Ticket Assigned',
        message: `Ticket ${ticket.ticketNumber} has been assigned to you`,
        color: 'orange',
      });
    });

    // Comment events
    newSocket.on('comment_added', ({ comment, ticket }: CommentEventData) => {
      notifications.show({
        title: 'New Comment',
        message: `New comment on ticket ${ticket.ticketNumber}`,
        color: 'blue',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-console
      console.log('Comment added:', comment);
    });

    // Notification events
    newSocket.on(
      'notification_created',
      (notification: NotificationEventData) => {
        notifications.show({
          title: notification.title,
          message: notification.message,
          color: 'blue',
        });
      }
    );

    // SLA events
    newSocket.on('sla_warning', (ticket: TicketEventData) => {
      notifications.show({
        title: 'SLA Warning',
        message: `Ticket ${ticket.ticketNumber} is approaching SLA deadline`,
        color: 'yellow',
      });
    });

    newSocket.on('sla_breach', (ticket: TicketEventData) => {
      notifications.show({
        title: 'SLA Breach',
        message: `Ticket ${ticket.ticketNumber} has breached SLA`,
        color: 'red',
      });
    });

    // Typing events
    newSocket.on('user_typing', ({ userId, isTyping }: TypingEventData) => {
      // Handle typing indicators - could be used for UI state management
      // This is typically handled by the component using the hook
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-console
      console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [session?.accessToken]);

  const joinTicket = (ticketId: string) => {
    if (socket && connected) {
      socket.emit('join_ticket', { ticketId });
    }
  };

  const leaveTicket = (ticketId: string) => {
    if (socket && connected) {
      socket.emit('leave_ticket', { ticketId });
    }
  };

  const sendTyping = (ticketId: string, isTyping: boolean) => {
    if (socket && connected) {
      socket.emit('typing', { ticketId, isTyping });
    }
  };

  const emit = (event: string, data: WebSocketEventData) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: WebSocketEventData) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (
    event: string,
    callback?: (data: WebSocketEventData) => void
  ) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return {
    socket,
    connected,
    error,
    joinTicket,
    leaveTicket,
    sendTyping,
    emit,
    on,
    off,
  };
}
