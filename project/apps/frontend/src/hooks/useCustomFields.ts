import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { CustomField, CreateCustomFieldInput, UpdateCustomFieldInput } from '../types/unified';

export const useCustomFields = () => {
  return useQuery({
    queryKey: ['customFields'],
    queryFn: () => apiClient.customFields.getAll(),
  });
};

export const useCustomField = (id: string) => {
  return useQuery({
    queryKey: ['customField', id],
    queryFn: () => apiClient.customFields.getById(id),
    enabled: !!id,
  });
};

export const useCreateCustomField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCustomFieldInput) => apiClient.customFields.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
    },
  });
};

export const useUpdateCustomField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomFieldInput }) => 
      apiClient.customFields.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
    },
  });
};

export const useDeleteCustomField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.customFields.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
    },
  });
};
