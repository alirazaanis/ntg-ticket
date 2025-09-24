'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotificationsStore } from '../../stores/useNotificationsStore';
import { useTicketsStore } from '../../stores/useTicketsStore';
import { Notification } from '../../types/notification';
import { Ticket } from '../../types/unified';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

// Comment interface
export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationsStore();
  const { updateTicket } = useTicketsStore();
  const { data: session } = useSession();

  useEffect(() => {
    if (isAuthenticated && user && user.id && session?.accessToken) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

      // Create Socket.IO connection
      const socket = io(wsUrl, {
        auth: {
          token: session.accessToken,
        },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        // WebSocket connected
      });

      socket.on('connected', () => {
        // WebSocket authenticated
      });

      socket.on('notification_created', (notification: Notification) => {
        addNotification(notification);
      });

      socket.on('ticket_updated', (ticket: Ticket) => {
        updateTicket(ticket.id, ticket);
      });

      socket.on('ticket_created', () => {
        // Handle new ticket creation
      });

      socket.on('comment_added', () => {
        // Handle comment addition
      });

      socket.on('sla_breach', () => {
        // Handle SLA breach
      });

      socket.on('sla_warning', () => {
        // Handle SLA warning
      });

      socket.on('disconnect', () => {
        // WebSocket disconnected
      });

      socket.on('error', () => {
        // WebSocket error
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
      };
    } else {
      // Close WebSocket if user is not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, [
    isAuthenticated,
    user,
    addNotification,
    updateTicket,
    session?.accessToken,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return <>{children}</>;
}
