import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { Ticket, CreateTicketInput, UpdateTicketInput, TicketFilters } from '../types/unified';

export const useTickets = (filters?: TicketFilters) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => apiClient.tickets.getAll(filters),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => apiClient.tickets.getById(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTicketInput) => apiClient.tickets.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) => 
      apiClient.tickets.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.tickets.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useOverdueTickets = () => {
  return useQuery({
    queryKey: ['overdueTickets'],
    queryFn: () => apiClient.tickets.getOverdue(),
  });
};

export const useTicketsApproachingSLA = () => {
  return useQuery({
    queryKey: ['ticketsApproachingSLA'],
    queryFn: () => apiClient.tickets.getApproachingSLA(),
  });
};

export const useBreachedSLATickets = () => {
  return useQuery({
    queryKey: ['breachedSLATickets'],
    queryFn: () => apiClient.tickets.getBreachedSLA(),
  });
};
