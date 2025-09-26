import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ticketApi,
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
} from '../lib/apiClient';
import { validateStatusUpdate } from '../lib/statusValidation';
import { TicketStatus } from '../types/unified';

export function useTickets(filters?: TicketFilters) {
  return useQuery<Ticket[]>({
    queryKey: ['tickets', filters],
    queryFn: async (): Promise<Ticket[]> => {
      try {
        const response = await ticketApi.getTickets(filters);
        // From chat history: response.data.data.data works for showing tickets
        if (
          response.data?.data?.data &&
          Array.isArray(response.data.data.data)
        ) {
          return response.data.data.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          return [];
        }
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook to get all tickets for counting (no pagination)
export function useAllTicketsForCounting(filters?: TicketFilters) {
  return useQuery<Ticket[]>({
    queryKey: ['all-tickets-counting', filters],
    queryFn: async (): Promise<Ticket[]> => {
      try {
        // Remove pagination parameters to get all tickets
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { page, limit, ...countFilters } = filters || {};
        const response = await ticketApi.getTickets(countFilters);

        // Extract tickets from response
        if (
          response.data?.data?.data &&
          Array.isArray(response.data.data.data)
        ) {
          return response.data.data.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          return [];
        }
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook to get total count of all tickets (no filters, no pagination)
export function useTotalTicketsCount() {
  return useQuery<number>({
    queryKey: ['total-tickets-count'],
    queryFn: async (): Promise<number> => {
      try {
        // Get all tickets without any filters or pagination
        const response = await ticketApi.getTickets({ limit: 1 }); // Just get 1 to get the total count

        // Extract total count from pagination
        if (response.data?.data?.pagination?.total) {
          return response.data.data.pagination.total;
        } else if (response.data?.pagination?.total) {
          return response.data.pagination.total;
        } else {
          return 0;
        }
      } catch (error) {
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// New hook for backend pagination
export function useTicketsWithPagination(filters?: TicketFilters) {
  return useQuery<{
    tickets: Ticket[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: ['tickets-with-pagination', filters],
    queryFn: async () => {
      try {
        const response = await ticketApi.getTickets(filters);

        // Backend returns: { data: Ticket[], pagination: {...} }
        if (
          response.data?.data?.data &&
          Array.isArray(response.data.data.data) &&
          response.data.data.pagination
        ) {
          return {
            tickets: response.data.data.data,
            pagination: response.data.data.pagination,
          };
        } else if (
          response.data?.data &&
          Array.isArray(response.data.data) &&
          response.data.pagination
        ) {
          return {
            tickets: response.data.data,
            pagination: response.data.pagination,
          };
        } else {
          return {
            tickets: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
          };
        }
      } catch (error) {
        throw error;
      }
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
      resolution,
      currentStatus,
    }: {
      id: string;
      status: string;
      resolution?: string;
      currentStatus: string;
    }) => {
      // Validate status transition before making API call
      const validation = validateStatusUpdate(
        currentStatus as TicketStatus,
        status as TicketStatus,
        resolution
      );

      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }

      const response = await ticketApi.updateStatus(id, status, resolution);
      return response.data.data as Ticket;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });
}

export function useMyTickets(filters?: TicketFilters) {
  return useQuery<Ticket[]>({
    queryKey: ['my-tickets', filters],
    queryFn: async () => {
      const response = await ticketApi.getMyTickets(filters);
      return response.data.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useAssignedTickets(filters?: TicketFilters) {
  return useQuery<Ticket[]>({
    queryKey: ['assigned-tickets', filters],
    queryFn: async () => {
      const response = await ticketApi.getAssignedTickets(filters);
      return response.data.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useOverdueTickets() {
  return useQuery<Ticket[]>({
    queryKey: ['overdue-tickets'],
    queryFn: async () => {
      const response = await ticketApi.getOverdueTickets();
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useTicketsApproachingSLA() {
  return useQuery<Ticket[]>({
    queryKey: ['tickets-approaching-sla'],
    queryFn: async () => {
      const response = await ticketApi.getTicketsApproachingSLA();
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useBreachedSLATickets() {
  return useQuery<Ticket[]>({
    queryKey: ['breached-sla-tickets'],
    queryFn: async () => {
      const response = await ticketApi.getBreachedSLATickets();
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
