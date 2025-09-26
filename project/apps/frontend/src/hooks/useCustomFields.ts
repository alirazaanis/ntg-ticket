import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  customFieldsApi,
  CustomField,
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
} from '../lib/apiClient';

export function useCustomFields() {
  return useQuery({
    queryKey: ['custom-fields'],
    queryFn: async () => {
      const response = await customFieldsApi.getCustomFields();
      return response.data.data as CustomField[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCustomField(id: string) {
  return useQuery({
    queryKey: ['custom-field', id],
    queryFn: async () => {
      const response = await customFieldsApi.getCustomField(id);
      return response.data.data as CustomField;
    },
    enabled: !!id,
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomFieldInput) => {
      const response = await customFieldsApi.createCustomField(data);
      return response.data.data as CustomField;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
}

export function useUpdateCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCustomFieldInput;
    }) => {
      const response = await customFieldsApi.updateCustomField(id, data);
      return response.data.data as CustomField;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
      queryClient.invalidateQueries({ queryKey: ['custom-field', id] });
    },
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await customFieldsApi.deleteCustomField(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
      queryClient.invalidateQueries({ queryKey: ['custom-field', id] });
    },
  });
}

export function useTicketCustomFields(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-custom-fields', ticketId],
    queryFn: async () => {
      const response = await customFieldsApi.getTicketCustomFields(ticketId);
      return response.data.data as Record<
        string,
        string | number | boolean | string[]
      >;
    },
    enabled: !!ticketId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useSetTicketCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      customFieldId,
      value,
    }: {
      ticketId: string;
      customFieldId: string;
      value: string;
    }) => {
      const response = await customFieldsApi.setTicketCustomField(
        ticketId,
        customFieldId,
        value
      );
      return response.data.data;
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({
        queryKey: ['ticket-custom-fields', ticketId],
      });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
  });
}
