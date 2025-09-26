import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
  Comment,
  Attachment,
  CustomField,
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
  Category,
  Subcategory,
  SystemSettings,
  EmailTemplate,
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput,
  ReportFilters,
  ApiResponse,
  CreateCommentInput,
  UserDistribution,
  SlaMetrics,
  ReportData,
  SystemMetrics,
  SavedSearch,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
  PopularSavedSearch,
  ElasticsearchFilters,
  ElasticsearchResult,
  SearchSuggestion,
  ElasticsearchHealth,
  Backup,
  AuditLog,
  AuditLogsFilters,
  DynamicField,
  AttachmentDownloadUrl,
  SystemStats,
  SystemHealth,
} from '../types/unified';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Re-export all types from unified types
export type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
  Comment,
  Attachment,
  CustomField,
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
  Category,
  Subcategory,
  SystemSettings,
  EmailTemplate,
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput,
  ReportFilters,
  ApiResponse,
  CreateCommentInput,
  UserDistribution,
  SlaMetrics,
  ReportData,
  SystemMetrics,
  TeamPerformanceData,
  SearchCriteria,
  SavedSearch,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
  PopularSavedSearch,
  ElasticsearchFilters,
  ElasticsearchResult,
  SearchSuggestion,
  ElasticsearchHealth,
  Backup,
  AuditLog,
  AuditLogsFilters,
  DynamicField,
  AttachmentDownloadUrl,
  SystemStats,
  SystemHealth,
  TicketFormData,
  DynamicTicketFormValues,
  EmailTemplateFormData,
  UserFormData,
  BulkUpdateData,
} from '../types/unified';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async config => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: '/auth/signin' });
    }
    return Promise.reject(error);
  }
);

// ===== USER API =====
export const userApi = {
  getUsers: (filters?: UserFilters) =>
    apiClient.get<
      ApiResponse<{
        data: User[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >('/users', { params: filters }),

  getUser: (id: string) => apiClient.get<ApiResponse<User>>(`/users/${id}`),

  createUser: (data: CreateUserInput) =>
    apiClient.post<ApiResponse<User>>('/users', data),

  updateUser: (id: string, data: UpdateUserInput) =>
    apiClient.put<ApiResponse<User>>(`/users/${id}`, data),

  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),

  getSupportStaff: () =>
    apiClient.get<ApiResponse<User[]>>('/users/support-staff'),
};

// ===== TICKET API =====
export const ticketApi = {
  getTickets: (filters?: TicketFilters) =>
    apiClient.get<
      ApiResponse<{
        data: Ticket[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >('/tickets', { params: filters }),

  getTicket: (id: string) =>
    apiClient.get<ApiResponse<Ticket>>(`/tickets/${id}`),

  createTicket: (data: CreateTicketInput) =>
    apiClient.post<ApiResponse<Ticket>>('/tickets', data),

  updateTicket: (id: string, data: UpdateTicketInput) =>
    apiClient.patch<ApiResponse<Ticket>>(`/tickets/${id}`, data),

  deleteTicket: (id: string) => apiClient.delete(`/tickets/${id}`),

  assignTicket: (id: string, assignedToId: string) =>
    apiClient.patch<ApiResponse<Ticket>>(`/tickets/${id}/assign`, {
      assignedToId,
    }),

  updateStatus: (id: string, status: string, resolution?: string) => {
    const requestData = { status, resolution };
    return apiClient.patch<ApiResponse<Ticket>>(
      `/tickets/${id}/status`,
      requestData
    );
  },

  addComment: (data: CreateCommentInput) =>
    apiClient.post<ApiResponse<Comment>>('/comments', data),

  getComments: (ticketId: string) =>
    apiClient.get<ApiResponse<Comment[]>>(`/comments/ticket/${ticketId}`),

  getComment: (id: string) =>
    apiClient.get<ApiResponse<Comment>>(`/comments/${id}`),

  updateComment: (
    id: string,
    data: { content: string; isInternal?: boolean }
  ) => apiClient.patch<ApiResponse<Comment>>(`/comments/${id}`, data),

  deleteComment: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/comments/${id}`),

  uploadAttachment: (ticketId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<Attachment>>(
      `/attachments/ticket/${ticketId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  getAttachments: (ticketId: string) =>
    apiClient.get<ApiResponse<Attachment[]>>(`/attachments/ticket/${ticketId}`),

  getAttachment: (id: string) =>
    apiClient.get<ApiResponse<Attachment>>(`/attachments/${id}`),

  getAttachmentDownloadUrl: (id: string) =>
    apiClient.get<ApiResponse<AttachmentDownloadUrl>>(
      `/attachments/${id}/download`
    ),

  deleteAttachment: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/attachments/${id}`),

  // Additional ticket endpoints
  getMyTickets: (filters?: TicketFilters) =>
    apiClient.get<
      ApiResponse<{
        data: Ticket[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >('/tickets/my', { params: filters }),

  getAssignedTickets: (filters?: TicketFilters) =>
    apiClient.get<
      ApiResponse<{
        data: Ticket[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >('/tickets/assigned', { params: filters }),

  getOverdueTickets: () =>
    apiClient.get<ApiResponse<Ticket[]>>('/tickets/overdue'),

  getTicketsApproachingSLA: () =>
    apiClient.get<ApiResponse<Ticket[]>>('/tickets/approaching-sla'),

  getBreachedSLATickets: () =>
    apiClient.get<ApiResponse<Ticket[]>>('/tickets/breached-sla'),
};

// ===== CUSTOM FIELDS API =====
export const customFieldsApi = {
  getCustomFields: () =>
    apiClient.get<ApiResponse<CustomField[]>>('/custom-fields'),

  getCustomField: (id: string) =>
    apiClient.get<ApiResponse<CustomField>>(`/custom-fields/${id}`),

  createCustomField: (data: CreateCustomFieldInput) =>
    apiClient.post<ApiResponse<CustomField>>('/custom-fields', data),

  updateCustomField: (id: string, data: UpdateCustomFieldInput) =>
    apiClient.put<ApiResponse<CustomField>>(`/custom-fields/${id}`, data),

  deleteCustomField: (id: string) => apiClient.delete(`/custom-fields/${id}`),

  getTicketCustomFields: (ticketId: string) =>
    apiClient.get<
      ApiResponse<Record<string, string | number | boolean | string[]>>
    >(`/tickets/${ticketId}/custom-fields`),

  setTicketCustomField: (
    ticketId: string,
    customFieldId: string,
    value: string
  ) =>
    apiClient.put<ApiResponse<{ success: boolean; message?: string }>>(
      `/tickets/${ticketId}/custom-fields/${customFieldId}`,
      { value }
    ),
};

// ===== CATEGORIES API =====
export const categoriesApi = {
  getCategories: () => apiClient.get<ApiResponse<Category[]>>('/categories'),

  getCategory: (id: string) =>
    apiClient.get<ApiResponse<Category>>(`/categories/${id}`),

  createCategory: (data: Partial<Category>) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),

  updateCategory: (id: string, data: Partial<Category>) =>
    apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data),

  deleteCategory: (id: string) => apiClient.delete(`/categories/${id}`),

  getDynamicFields: (categoryName: string) =>
    apiClient.get<ApiResponse<DynamicField[]>>(
      `/categories/dynamic-fields/${categoryName}`
    ),

  getSubcategories: (categoryName: string) =>
    apiClient.get<ApiResponse<Subcategory[]>>(
      `/categories/subcategories/${categoryName}`
    ),

  createSubcategory: (categoryId: string, data: Partial<Subcategory>) =>
    apiClient.post<ApiResponse<Subcategory>>(
      `/categories/${categoryId}/subcategories`,
      data
    ),

  updateSubcategory: (
    categoryId: string,
    subcategoryId: string,
    data: Partial<Subcategory>
  ) =>
    apiClient.put<ApiResponse<Subcategory>>(
      `/categories/${categoryId}/subcategories/${subcategoryId}`,
      data
    ),

  deleteSubcategory: (categoryId: string, subcategoryId: string) =>
    apiClient.delete(
      `/categories/${categoryId}/subcategories/${subcategoryId}`
    ),
};

// ===== SYSTEM SETTINGS API =====
export const systemApi = {
  getSettings: () =>
    apiClient.get<ApiResponse<SystemSettings>>('/admin/config'),

  updateSettings: (data: Partial<SystemSettings>) =>
    apiClient.patch<ApiResponse<SystemSettings>>('/admin/config', data),

  getSystemStats: () => apiClient.get<ApiResponse<SystemStats>>('/admin/stats'),

  getSystemHealth: () =>
    apiClient.get<ApiResponse<SystemHealth>>('/admin/health'),
};

// ===== EMAIL TEMPLATES API =====
export const emailTemplatesApi = {
  getEmailTemplates: () =>
    apiClient.get<ApiResponse<EmailTemplate[]>>('/email-templates'),

  getEmailTemplate: (id: string) =>
    apiClient.get<ApiResponse<EmailTemplate>>(`/email-templates/${id}`),

  createEmailTemplate: (data: CreateEmailTemplateInput) =>
    apiClient.post<ApiResponse<EmailTemplate>>('/email-templates', data),

  updateEmailTemplate: (id: string, data: UpdateEmailTemplateInput) =>
    apiClient.patch<ApiResponse<EmailTemplate>>(`/email-templates/${id}`, data),

  deleteEmailTemplate: (id: string) =>
    apiClient.delete(`/email-templates/${id}`),

  createDefaultTemplates: () =>
    apiClient.get<ApiResponse<void>>('/email-templates/defaults'),

  previewEmailTemplate: (id: string, variables: Record<string, unknown>) =>
    apiClient.get<ApiResponse<{ subject: string; html: string }>>(
      `/email-templates/${id}/preview`,
      { params: variables }
    ),
};

// ===== REPORTS API =====
export const reportsApi = {
  getTicketReport: (filters?: ReportFilters) =>
    apiClient.get<ApiResponse<ReportData>>('/reports/tickets', {
      params: filters,
    }),

  getUserReport: (filters?: ReportFilters) =>
    apiClient.get<
      ApiResponse<{
        users: User[];
        stats: { total: number; active: number; inactive: number };
      }>
    >('/reports/users', { params: filters }),

  getSlaReport: (filters?: ReportFilters) =>
    apiClient.get<
      ApiResponse<{
        slaMetrics: SlaMetrics;
        compliance: number;
        violations: number;
      }>
    >('/reports/sla', { params: filters }),

  exportReport: (type: string, filters?: ReportFilters) =>
    apiClient.get(`/reports/export/${type}`, {
      params: filters,
      responseType: 'blob',
    }),

  exportReports: (filters?: ReportFilters) =>
    apiClient.post<Blob>('/reports/export', filters, {
      responseType: 'blob',
    }),

  getSystemMetrics: () =>
    apiClient.get<ApiResponse<SystemMetrics>>('/reports/system-metrics'),

  getUserDistribution: () =>
    apiClient.get<ApiResponse<UserDistribution[]>>(
      '/reports/user-distribution'
    ),
};

// ===== NOTIFICATIONS API =====
export const notificationsApi = {
  getNotifications: () =>
    apiClient.get<
      ApiResponse<
        Array<{
          id: string;
          message: string;
          type: string;
          read: boolean;
          createdAt: string;
        }>
      >
    >('/notifications'),

  markAsRead: (id: string) => apiClient.put(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.put('/notifications/read-all'),

  deleteNotification: (id: string) => apiClient.delete(`/notifications/${id}`),

  sendBulkNotification: (ticketIds: string[], message: string) =>
    apiClient.post<ApiResponse<{ sent: number; failed: number }>>(
      '/notifications/bulk',
      {
        ticketIds,
        message,
      }
    ),
};

// ===== AUTH API =====
export const authApi = {
  getCurrentUser: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  logout: () => apiClient.post<ApiResponse<void>>('/auth/logout'),

  updateUserRole: (userId: string, role: string) =>
    apiClient.patch<ApiResponse<User>>(`/auth/users/${userId}/role`, { role }),
};

// ===== ELASTICSEARCH API =====
export const elasticsearchApi = {
  searchTickets: (query: string, filters?: ElasticsearchFilters) =>
    apiClient.get<ApiResponse<ElasticsearchResult>>('/elasticsearch/search', {
      params: {
        q: query,
        ...filters,
        status: filters?.status?.join(','),
        priority: filters?.priority?.join(','),
        category: filters?.category?.join(','),
        assignedTo: filters?.assignedTo?.join(','),
      },
    }),

  getSuggestions: (query: string, field: string = 'title') =>
    apiClient.get<ApiResponse<SearchSuggestion[]>>(
      '/elasticsearch/suggestions',
      {
        params: { q: query, field },
      }
    ),

  getAggregations: (filters?: {
    status?: string[];
    priority?: string[];
    category?: string[];
  }) =>
    apiClient.get<ApiResponse<Record<string, unknown>>>(
      '/elasticsearch/aggregations',
      {
        params: {
          status: filters?.status?.join(','),
          priority: filters?.priority?.join(','),
          category: filters?.category?.join(','),
        },
      }
    ),

  getHealth: () =>
    apiClient.get<ApiResponse<ElasticsearchHealth>>('/elasticsearch/health'),

  reindex: () =>
    apiClient.post<ApiResponse<{ message: string }>>('/elasticsearch/reindex'),
};

// ===== BACKUP API =====
export const backupApi = {
  createBackup: () => apiClient.post<ApiResponse<Backup>>('/backup/create'),

  listBackups: () => apiClient.get<ApiResponse<Backup[]>>('/backup/list'),

  restoreBackup: (backupId: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/backup/restore', null, {
      params: { backupId },
    }),

  delete: (backupId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>('/backup/delete', {
      params: { backupId },
    }),
};

// ===== AUDIT LOGS API =====
export const auditLogsApi = {
  getAuditLogs: (filters?: AuditLogsFilters) =>
    apiClient.get<
      ApiResponse<{
        data: AuditLog[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >('/audit-logs', { params: filters }),
};

// ===== SAVED SEARCHES API =====
export const savedSearchesApi = {
  getSavedSearches: (includePublic?: boolean) =>
    apiClient.get<ApiResponse<SavedSearch[]>>('/saved-searches', {
      params: { includePublic },
    }),

  createSavedSearch: (data: CreateSavedSearchInput) =>
    apiClient.post<ApiResponse<SavedSearch>>('/saved-searches', data),

  getSavedSearch: (id: string) =>
    apiClient.get<ApiResponse<SavedSearch>>(`/saved-searches/${id}`),

  executeSavedSearch: (id: string, page?: number, limit?: number) =>
    apiClient.get<
      ApiResponse<{
        data: Ticket[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(`/saved-searches/${id}/execute`, { params: { page, limit } }),

  duplicateSavedSearch: (id: string, name?: string) =>
    apiClient.post<ApiResponse<SavedSearch>>(
      `/saved-searches/${id}/duplicate`,
      { name }
    ),

  getPopularSearches: (limit?: number) =>
    apiClient.get<ApiResponse<PopularSavedSearch[]>>(
      '/saved-searches/popular',
      {
        params: { limit },
      }
    ),

  updateSavedSearch: (id: string, data: UpdateSavedSearchInput) =>
    apiClient.patch<ApiResponse<SavedSearch>>(`/saved-searches/${id}`, data),

  deleteSavedSearch: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/saved-searches/${id}`),
};

export default apiClient;
