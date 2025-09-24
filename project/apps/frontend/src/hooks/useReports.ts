import { useQuery, useMutation } from '@tanstack/react-query';
import {
  reportsApi,
  SystemMetrics,
  UserDistribution,
  ReportFilters,
  ReportData,
  User,
  SlaMetrics,
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

export function useUserReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'users', filters],
    queryFn: async () => {
      const response = await reportsApi.getUserReport(filters);
      return response.data.data as {
        users: User[];
        stats: { total: number; active: number; inactive: number };
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSlaReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'sla', filters],
    queryFn: async () => {
      const response = await reportsApi.getSlaReport(filters);
      return response.data.data as {
        slaMetrics: SlaMetrics;
        compliance: number;
        violations: number;
      };
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

export function useExportReport() {
  return useMutation({
    mutationFn: async ({ type, filters }: { type: string; filters?: ReportFilters }) => {
      const response = await reportsApi.exportReport(type, filters);
      return response.data as Blob;
    },
  });
}

export function useExportReports() {
  return useMutation({
    mutationFn: async (filters?: ReportFilters) => {
      const response = await reportsApi.exportReports(filters);
      return response.data as Blob;
    },
  });
}
