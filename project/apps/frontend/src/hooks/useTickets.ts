import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ticketApi,
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
} from '../lib/apiClient';

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const response = await ticketApi.getTickets(filters);
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const response = await ticketApi.getTicket(id);
      return response.data.data as Ticket;
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketInput) => {
      const response = await ticketApi.createTicket(data);
      return response.data.data as Ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTicketInput;
    }) => {
      const response = await ticketApi.updateTicket(id, data);
      return response.data.data as Ticket;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await ticketApi.deleteTicket(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      assignedToId,
    }: {
      id: string;
      assignedToId: string;
    }) => {
      const response = await ticketApi.assignTicket(id, assignedToId);
      return response.data.data as Ticket;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: string;
      note?: string;
    }) => {
      const response = await ticketApi.updateStatus(id, status, note);
      return response.data.data as Ticket;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });
}

export function useMyTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['my-tickets', filters],
    queryFn: async () => {
      const response = await ticketApi.getMyTickets(filters);
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useAssignedTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['assigned-tickets', filters],
    queryFn: async () => {
      const response = await ticketApi.getAssignedTickets(filters);
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useOverdueTickets() {
  return useQuery({
    queryKey: ['overdue-tickets'],
    queryFn: async () => {
      const response = await ticketApi.getOverdueTickets();
      return response.data.data as Ticket[];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useTicketsApproachingSLA() {
  return useQuery({
    queryKey: ['tickets-approaching-sla'],
    queryFn: async () => {
      const response = await ticketApi.getTicketsApproachingSLA();
      return response.data.data as Ticket[];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useBreachedSLATickets() {
  return useQuery({
    queryKey: ['breached-sla-tickets'],
    queryFn: async () => {
      const response = await ticketApi.getBreachedSLATickets();
      return response.data.data as Ticket[];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
