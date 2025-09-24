import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backupApi, Backup } from '../lib/apiClient';

export function useBackups() {
  return useQuery({
    queryKey: ['backups'],
    queryFn: async () => {
      const response = await backupApi.listBackups();
      return response.data.data as Backup[];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await backupApi.createBackup();
      return response.data.data as Backup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });
}

export function useRestoreBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupId: string) => {
      const response = await backupApi.restoreBackup(backupId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      // Invalidate all queries since we're restoring from backup
      queryClient.invalidateQueries();
    },
  });
}
