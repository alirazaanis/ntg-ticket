import { useQuery, useMutation } from '@tanstack/react-query';
import { auditLogsApi, AuditLogsFilters } from '../lib/apiClient';

export function useAuditLogs(filters?: AuditLogsFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const response = await auditLogsApi.getAuditLogs(filters);
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: async (filters?: AuditLogsFilters) => {
      const response = await auditLogsApi.getAuditLogs(filters);
      return new Blob([JSON.stringify(response.data)], {
        type: 'application/json',
      });
    },
  });
}
