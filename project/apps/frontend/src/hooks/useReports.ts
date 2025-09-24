import { useQuery } from '@tanstack/react-query';
import {
  reportsApi,
  SystemMetrics,
  UserDistribution,
  ReportFilters,
  ReportData,
} from '../lib/apiClient';

export function useTicketReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'tickets', filters],
    queryFn: async () => {
      const response = await reportsApi.getTicketReport(filters);
      return response.data.data as ReportData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSystemMetrics() {
  return useQuery({
    queryKey: ['reports', 'system-metrics'],
    queryFn: async () => {
      const response = await reportsApi.getSystemMetrics();
      return response.data.data as SystemMetrics;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useUserDistribution() {
  return useQuery({
    queryKey: ['reports', 'user-distribution'],
    queryFn: async () => {
      const response = await reportsApi.getUserDistribution();
      return response.data.data as UserDistribution[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
