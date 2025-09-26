import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  emailTemplatesApi,
  EmailTemplate,
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput,
} from '../lib/apiClient';

export function useEmailTemplates() {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const response = await emailTemplatesApi.getEmailTemplates();
      return response.data.data as EmailTemplate[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEmailTemplate(id: string) {
  return useQuery({
    queryKey: ['email-template', id],
    queryFn: async () => {
      const response = await emailTemplatesApi.getEmailTemplate(id);
      return response.data.data as EmailTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmailTemplateInput) => {
      const response = await emailTemplatesApi.createEmailTemplate(data);
      return response.data.data as EmailTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEmailTemplateInput;
    }) => {
      const response = await emailTemplatesApi.updateEmailTemplate(id, data);
      return response.data.data as EmailTemplate;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['email-template', id] });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await emailTemplatesApi.deleteEmailTemplate(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['email-template', id] });
    },
  });
}

export function useCreateDefaultTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await emailTemplatesApi.createDefaultTemplates();
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
}

export function usePreviewEmailTemplate() {
  return useMutation({
    mutationFn: async ({
      id,
      variables,
    }: {
      id: string;
      variables: Record<string, unknown>;
    }) => {
      const response = await emailTemplatesApi.previewEmailTemplate(
        id,
        variables
      );
      return response.data.data as { subject: string; html: string };
    },
  });
}
