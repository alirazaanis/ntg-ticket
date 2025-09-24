import { useQuery } from '@tanstack/react-query';
import { auditLogsApi, AuditLogsFilters } from '../lib/apiClient';

export function useAuditLogs(filters?: AuditLogsFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const response = await auditLogsApi.getAuditLogs(filters);
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
