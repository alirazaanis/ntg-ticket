import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(
    filters: { userId?: string; action?: string },
    pagination: { page: number; limit: number }
  ) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const where: {
        userId?: string;
        action?:
          | 'CREATE'
          | 'UPDATE'
          | 'DELETE'
          | 'LOGIN'
          | 'LOGOUT'
          | 'ASSIGN'
          | 'ESCALATE'
          | 'COMMENT'
          | 'ATTACH'
          | 'STATUS_CHANGE'
          | 'PRIORITY_CHANGE'
          | 'CATEGORY_CHANGE';
      } = {};
      if (filters.userId) where.userId = filters.userId;
      if (filters.action)
        where.action = filters.action as
          | 'CREATE'
          | 'UPDATE'
          | 'DELETE'
          | 'LOGIN'
          | 'LOGOUT'
          | 'ASSIGN'
          | 'ESCALATE'
          | 'COMMENT'
          | 'ATTACH'
          | 'STATUS_CHANGE'
          | 'PRIORITY_CHANGE'
          | 'CATEGORY_CHANGE';

      const [auditLogs, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        this.prisma.auditLog.count({ where }),
      ]);

      return {
        data: auditLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error getting audit logs:', error);
      throw error;
    }
  }

  /**
   * Create an audit log entry
   */
  async createAuditLog(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action as
            | 'CREATE'
            | 'UPDATE'
            | 'DELETE'
            | 'LOGIN'
            | 'LOGOUT'
            | 'ASSIGN'
            | 'ESCALATE'
            | 'COMMENT'
            | 'ATTACH'
            | 'STATUS_CHANGE'
            | 'PRIORITY_CHANGE'
            | 'CATEGORY_CHANGE',
          resource: data.resource,
          resourceId: data.resourceId,
          fieldName: data.fieldName,
          oldValue: data.oldValue,
          newValue: data.newValue,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata as Prisma.JsonValue,
        },
      });
    } catch (error) {
      this.logger.error('Error creating audit log:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific ticket
   */
  async getTicketAuditLogs(ticketId: string, userId: string, userRole: string) {
    try {
      // Check if user has access to this ticket
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: ticketId },
        select: {
          requesterId: true,
          assignedToId: true,
        },
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check access permissions
      if (userRole !== 'ADMIN' && userRole !== 'SUPPORT_MANAGER') {
        if (ticket.requesterId !== userId && ticket.assignedToId !== userId) {
          throw new Error(
            'Access denied: You can only view audit logs for your own tickets'
          );
        }
      }

      const auditLogs = await this.prisma.ticketHistory.findMany({
        where: { ticketId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return auditLogs;
    } catch (error) {
      this.logger.error('Error getting ticket audit logs:', error);
      throw error;
    }
  }

  /**
   * Get system-wide audit logs (Admin only)
   */
  async getSystemAuditLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: string;
      ticketId?: string;
      fieldName?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {
    try {
      const where: {
        userId?: string;
        ticketId?: string;
        fieldName?: string;
        createdAt?: { gte?: Date; lte?: Date };
      } = {};

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.ticketId) {
        where.ticketId = filters.ticketId;
      }

      if (filters?.fieldName) {
        where.fieldName = filters.fieldName;
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      const [auditLogs, total] = await Promise.all([
        this.prisma.ticketHistory.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            ticket: {
              select: {
                id: true,
                ticketNumber: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.ticketHistory.count({ where }),
      ]);

      return {
        data: auditLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error getting system audit logs:', error);
      throw error;
    }
  }

  /**
   * Get user activity audit logs
   */
  async getUserActivityLogs(
    userId: string,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const [auditLogs, total] = await Promise.all([
        this.prisma.ticketHistory.findMany({
          where: { userId },
          include: {
            ticket: {
              select: {
                id: true,
                ticketNumber: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.ticketHistory.count({ where: { userId } }),
      ]);

      return {
        data: auditLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error getting user activity logs:', error);
      throw error;
    }
  }

  /**
   * Get audit log statistics
   */
  async getAuditLogStats() {
    try {
      const [totalLogs, logsByField, logsByUser, recentActivity] =
        await Promise.all([
          this.prisma.ticketHistory.count(),
          this.prisma.ticketHistory.groupBy({
            by: ['fieldName'],
            _count: { fieldName: true },
            orderBy: { _count: { fieldName: 'desc' } },
            take: 10,
          }),
          this.prisma.ticketHistory.groupBy({
            by: ['userId'],
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 10,
          }),
          this.prisma.ticketHistory.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              ticket: {
                select: {
                  ticketNumber: true,
                  title: true,
                },
              },
            },
          }),
        ]);

      return {
        totalLogs,
        logsByField,
        logsByUser,
        recentActivity,
      };
    } catch (error) {
      this.logger.error('Error getting audit log stats:', error);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters?: {
    userId?: string;
    ticketId?: string;
    fieldName?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    try {
      const where: {
        userId?: string;
        ticketId?: string;
        fieldName?: string;
        createdAt?: { gte?: Date; lte?: Date };
      } = {};

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.ticketId) {
        where.ticketId = filters.ticketId;
      }

      if (filters?.fieldName) {
        where.fieldName = filters.fieldName;
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      const auditLogs = await this.prisma.ticketHistory.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
          ticket: {
            select: {
              ticketNumber: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Convert to CSV format
      const csvHeaders = [
        'Date',
        'User',
        'Email',
        'Role',
        'Ticket Number',
        'Ticket Title',
        'Field Name',
        'Old Value',
        'New Value',
      ];

      const csvRows = auditLogs.map(log => [
        log.createdAt.toISOString(),
        log.user.name,
        log.user.email,
        log.user.role,
        log.ticket?.ticketNumber || '',
        log.ticket?.title || '',
        log.fieldName,
        log.oldValue || '',
        log.newValue || '',
      ]);

      return {
        headers: csvHeaders,
        rows: csvRows,
        total: auditLogs.length,
      };
    } catch (error) {
      this.logger.error('Error exporting audit logs:', error);
      throw error;
    }
  }
}
