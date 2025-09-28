import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFieldsApi } from '../lib/apiClient';
import {
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
} from '../types/unified';

export function useCustomFields(params?: {
  category?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ['customFields', params],
    queryFn: async () => {
      const response = await customFieldsApi.getCustomFields();
      return response.data.data;
    },
  });
}

export function useCustomField(id: string) {
  return useQuery({
    queryKey: ['customField', id],
    queryFn: async () => {
      const response = await customFieldsApi.getCustomField(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomFieldInput) => {
      const response = await customFieldsApi.createCustomField(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
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
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
    },
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await customFieldsApi.deleteCustomField(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
    },
  });
}
