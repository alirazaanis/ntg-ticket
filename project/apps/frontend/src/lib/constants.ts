// Application Constants
export const APP_CONFIG = {
  name: 'NTG Ticket System',
  version: '1.0.0',
  description: 'IT Support Ticket Management System',
  author: 'NTG Development Team',
  supportEmail: 'support@ntg-ticket.com',
  website: 'https://ntg-ticket.com',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',
  timeout: 10000,
  retryAttempts: 3,
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  tokenKey: 'ntg-ticket-token',
  refreshTokenKey: 'ntg-ticket-refresh-token',
  tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  refreshTokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

// User Roles
export const USER_ROLES = {
  END_USER: 'END_USER',
  SUPPORT_STAFF: 'SUPPORT_STAFF',
  SUPPORT_MANAGER: 'SUPPORT_MANAGER',
  ADMIN: 'ADMIN',
} as const;

// Ticket Status
export const TICKET_STATUS = {
  NEW: 'NEW',
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
} as const;

// Ticket Priority
export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

// Ticket Category
export const TICKET_CATEGORY = {
  HARDWARE: 'HARDWARE',
  SOFTWARE: 'SOFTWARE',
  NETWORK: 'NETWORK',
  ACCESS: 'ACCESS',
  OTHER: 'OTHER',
} as const;

// Ticket Impact
export const TICKET_IMPACT = {
  MINOR: 'MINOR',
  MODERATE: 'MODERATE',
  MAJOR: 'MAJOR',
  CRITICAL: 'CRITICAL',
} as const;

// Ticket Urgency
export const TICKET_URGENCY = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  IMMEDIATE: 'IMMEDIATE',
} as const;

// SLA Levels
export const SLA_LEVEL = {
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
  CRITICAL_SUPPORT: 'CRITICAL_SUPPORT',
} as const;

// Notification Types
export const NOTIFICATION_TYPE = {
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_ASSIGNED: 'TICKET_ASSIGNED',
  TICKET_STATUS_CHANGED: 'TICKET_STATUS_CHANGED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  SLA_WARNING: 'SLA_WARNING',
  SLA_BREACH: 'SLA_BREACH',
  TICKET_DUE: 'TICKET_DUE',
  TICKET_ESCALATED: 'TICKET_ESCALATED',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
} as const;

// Custom Field Types
export const CUSTOM_FIELD_TYPE = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  DATE: 'DATE',
  SELECT: 'SELECT',
  BOOLEAN: 'BOOLEAN',
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
  ],
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxTTL: 60 * 60 * 1000, // 1 hour
  staleTime: 2 * 60 * 1000, // 2 minutes
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  primaryColor: 'blue',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  defaultRadius: 'md',
  defaultSpacing: 'md',
} as const;

// Breakpoints
export const BREAKPOINTS = {
  xs: '36em',
  sm: '48em',
  md: '62em',
  lg: '75em',
  xl: '88em',
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN:
    'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  TICKET_CREATED: 'Ticket created successfully!',
  TICKET_UPDATED: 'Ticket updated successfully!',
  TICKET_DELETED: 'Ticket deleted successfully!',
  TICKET_ASSIGNED: 'Ticket assigned successfully!',
  STATUS_UPDATED: 'Status updated successfully!',
  COMMENT_ADDED: 'Comment added successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  USER_CREATED: 'User created successfully!',
  USER_UPDATED: 'User updated successfully!',
  USER_DELETED: 'User deleted successfully!',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 5000,
  COMMENT_MIN_LENGTH: 1,
  COMMENT_MAX_LENGTH: 1000,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ntg-ticket-auth-token',
  REFRESH_TOKEN: 'ntg-ticket-refresh-token',
  USER_PREFERENCES: 'ntg-ticket-user-preferences',
  THEME: 'ntg-ticket-theme',
  LANGUAGE: 'ntg-ticket-language',
  NOTIFICATIONS: 'ntg-ticket-notifications',
  TICKET_FILTERS: 'ntg-ticket-filters',
  DASHBOARD_LAYOUT: 'ntg-ticket-dashboard-layout',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  TICKETS: {
    LIST: '/tickets',
    CREATE: '/tickets',
    GET: '/tickets/:id',
    UPDATE: '/tickets/:id',
    DELETE: '/tickets/:id',
    ASSIGN: '/tickets/:id/assign',
    STATUS: '/tickets/:id/status',
    COMMENTS: '/tickets/:id/comments',
    ATTACHMENTS: '/tickets/:id/attachments',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: '/users/:id',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
    ROLES: '/users/roles',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: '/notifications/:id',
  },
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    TICKETS: '/reports/tickets',
    PERFORMANCE: '/reports/performance',
    EXPORT: '/reports/export',
  },
  ADMIN: {
    SETTINGS: '/admin/settings',
    BACKUP: '/admin/backup',
    RESTORE: '/admin/restore',
    AUDIT_LOGS: '/admin/audit-logs',
  },
} as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NOTIFICATION: 'notification',
  TICKET_UPDATE: 'ticket_update',
  TICKET_STATUS_CHANGE: 'ticket_status_change',
  COMMENT_ADDED: 'comment_added',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#228be6',
  SUCCESS: '#51cf66',
  WARNING: '#ffd43b',
  ERROR: '#ff6b6b',
  INFO: '#74c0fc',
  PURPLE: '#9775fa',
  PINK: '#f783ac',
  ORANGE: '#ffa94d',
  TEAL: '#20c997',
  INDIGO: '#5c7cfa',
} as const;

// Status Colors
export const STATUS_COLORS = {
  NEW: 'blue',
  OPEN: 'orange',
  IN_PROGRESS: 'yellow',
  ON_HOLD: 'gray',
  RESOLVED: 'green',
  CLOSED: 'dark',
  REOPENED: 'red',
} as const;

// Priority Colors
export const PRIORITY_COLORS = {
  LOW: 'green',
  MEDIUM: 'blue',
  HIGH: 'orange',
  CRITICAL: 'red',
} as const;

// SLA Colors
export const SLA_COLORS = {
  STANDARD: 'blue',
  PREMIUM: 'green',
  CRITICAL_SUPPORT: 'red',
} as const;
