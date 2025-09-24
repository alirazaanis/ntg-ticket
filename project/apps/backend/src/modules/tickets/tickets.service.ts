import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus, Prisma } from '@prisma/client';
import { LoggerService } from '../../common/logger/logger.service';
import { RedisService } from '../../common/redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { SLAService } from '../../common/sla/sla.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { SystemConfigService } from '../../common/config/system-config.service';

// Define proper types for ticket filters
interface TicketFilters {
  page?: number;
  limit?: number;
  cursor?: string;
  status?: string[];
  priority?: string[];
  category?: string[];
  assignedTo?: string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Service for managing tickets in the NTG Ticket System.
 *
 * This service provides comprehensive ticket management functionality including:
 * - Creating, reading, updating, and deleting tickets
 * - Status management and workflow enforcement
 * - Assignment and reassignment of tickets
 * - SLA monitoring and escalation
 * - Integration with notification and search systems
 *
 * @example
 * ```typescript
 * const ticketsService = new TicketsService(prismaService, loggerService, redisService, notificationsService, elasticsearchService)
 * const ticket = await ticketsService.create(createTicketDto, userId, userRole)
 * ```
 */
@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
    private readonly elasticsearch: ElasticsearchService,
    private readonly slaService: SLAService,
    private readonly websocketGateway: WebSocketGateway,
    private readonly systemConfigService: SystemConfigService
  ) {}

  /**
   * Creates a new ticket in the system.
   *
   * This method creates a new ticket with the provided data, validates the requester,
   * calculates priority and SLA information, and sends appropriate notifications.
   *
   * @param createTicketDto - The ticket data to create
   * @param userId - The ID of the user creating the ticket
   * @param userRole - The role of the user creating the ticket
   * @returns Promise<Ticket> - The created ticket with all relations
   *
   * @throws {NotFoundException} When the requester user is not found
   * @throws {BadRequestException} When validation fails
   *
   * @example
   * ```typescript
   * const ticket = await ticketsService.create({
   *   title: 'Unable to access email',
   *   description: 'I cannot access my email account',
   *   category: 'SOFTWARE',
   *   subcategory: 'email_client'
   * }, 'user-123', 'END_USER')
   * ```
   */
  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
    userRole: string
  ) {
    this.logger.log(`Creating ticket for user ${userId}`, 'TicketsService');

    // Validate user role can create tickets
    if (!['END_USER', 'SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN'].includes(userRole)) {
      throw new BadRequestException('Invalid user role for ticket creation');
    }

    // Validate requester exists
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    // Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createTicketDto.category },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate subcategory exists and belongs to category
    const subcategory = await this.prisma.subcategory.findUnique({
      where: {
        id: createTicketDto.subcategory,
        categoryId: createTicketDto.category,
      },
    });

    if (!subcategory) {
      throw new NotFoundException(
        'Subcategory not found or does not belong to category'
      );
    }

    // Generate ticket number
    const ticketNumber = await this.generateTicketNumber();

    // Calculate due date based on SLA level using SLA service
    const dueDate = this.slaService.calculateDueDate(
      createTicketDto.slaLevel,
      createTicketDto.priority
    );

    // Find category and subcategory by name
    const ticketCategory = await this.prisma.category.findFirst({
      where: { name: createTicketDto.category },
    });

    const ticketSubcategory = await this.prisma.subcategory.findFirst({
      where: {
        name: createTicketDto.subcategory,
        categoryId: ticketCategory?.id,
      },
    });

    if (!ticketCategory || !ticketSubcategory) {
      throw new BadRequestException('Invalid category or subcategory');
    }

    // Auto-assign ticket if enabled and no specific assignee provided
    let assignedToId = createTicketDto.assignedToId;
    if (!assignedToId && this.systemConfigService.isAutoAssignEnabled()) {
      assignedToId = await this.autoAssignTicket(
        ticketCategory.id,
        ticketSubcategory.id
      );
    }

    // Create ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        ticketNumber,
        title: createTicketDto.title,
        description: createTicketDto.description,
        categoryId: ticketCategory.id,
        subcategoryId: ticketSubcategory.id,
        priority: createTicketDto.priority,
        impact: createTicketDto.impact,
        urgency: createTicketDto.urgency,
        slaLevel: createTicketDto.slaLevel,
        requesterId: userId,
        assignedToId: assignedToId,
        dueDate,
        status: TicketStatus.NEW,
      },
      include: {
        requester: true,
        assignedTo: true,
        category: true,
        subcategory: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        attachments: {
          include: {
            uploader: true,
          },
        },
      },
    });

    // Index in Elasticsearch
    try {
      await this.elasticsearch.indexTicket(ticket);
    } catch (error) {
      this.logger.error('Failed to index ticket in Elasticsearch', error);
    }

    // Send notification
    await this.notifications.create({
      userId,
      ticketId: ticket.id,
      type: 'TICKET_CREATED',
      title: 'Ticket Created',
      message: `Your ticket ${ticket.ticketNumber} has been created successfully.`,
    });

    // Emit WebSocket event
    this.websocketGateway.emitTicketCreated(ticket);

    this.logger.log(`Ticket created: ${ticket.ticketNumber}`, 'TicketsService');
    return ticket;
  }

  /**
   * Retrieves tickets with pagination and filtering.
   *
   * This method retrieves tickets based on user role and permissions, with support
   * for pagination, filtering, and searching.
   *
   * @param filters - Filter criteria for tickets
   * @param userId - The ID of the user requesting tickets
   * @param userRole - The role of the user requesting tickets
   * @returns Promise<PaginatedTickets> - Paginated list of tickets
   *
   * @example
   * ```typescript
   * const tickets = await ticketsService.findAll({
   *   page: 1,
   *   limit: 20,
   *   status: ['NEW', 'OPEN'],
   *   priority: ['HIGH', 'CRITICAL']
   * }, 'user-123', 'SUPPORT_STAFF')
   * ```
   */
  async findAll(filters: TicketFilters, userId: string, userRole: string) {
    this.logger.log(
      `Finding tickets for user ${userId} with role ${userRole}`,
      'TicketsService'
    );

    const where: Prisma.TicketWhereInput = {};

    // Apply role-based filtering
    if (userRole === 'END_USER') {
      where.requesterId = userId;
    } else if (userRole === 'SUPPORT_STAFF') {
      where.OR = [{ assignedToId: userId }, { assignedToId: null }];
    }
    // SUPPORT_MANAGER and ADMIN can see all tickets

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status as ('NEW' | 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED' | 'REOPENED')[] };
    }

    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority as ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] };
    }

    if (filters.category && filters.category.length > 0) {
      where.categoryId = { in: filters.category };
    }

    if (filters.assignedTo && filters.assignedTo.length > 0) {
      where.assignedToId = { in: filters.assignedTo };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { ticketNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          requester: true,
          assignedTo: true,
          category: true,
          subcategory: true,
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single ticket by ID.
   *
   * This method retrieves a ticket by its ID, with role-based access control
   * to ensure users can only access tickets they have permission to view.
   *
   * @param id - The ID of the ticket to retrieve
   * @param userId - The ID of the user requesting the ticket
   * @param userRole - The role of the user requesting the ticket
   * @returns Promise<Ticket> - The requested ticket with all relations
   *
   * @throws {NotFoundException} When the ticket is not found
   * @throws {ForbiddenException} When the user doesn't have permission to view the ticket
   *
   * @example
   * ```typescript
   * const ticket = await ticketsService.findOne('ticket-123', 'user-123', 'END_USER')
   * ```
   */
  async findOne(id: string, userId: string, userRole: string) {
    this.logger.log(
      `Finding ticket ${id} for user ${userId}`,
      'TicketsService'
    );

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: true,
        assignedTo: true,
        category: true,
        subcategory: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        attachments: {
          include: {
            uploader: true,
          },
        },
        history: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check permissions
    if (userRole === 'END_USER' && ticket.requesterId !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only view your own tickets'
      );
    }

    return ticket;
  }

  /**
   * Updates an existing ticket.
   *
   * This method updates a ticket with the provided data, validates permissions,
   * tracks changes in history, and sends appropriate notifications.
   *
   * @param id - The ID of the ticket to update
   * @param updateTicketDto - The data to update the ticket with
   * @param userId - The ID of the user updating the ticket
   * @param userRole - The role of the user updating the ticket
   * @returns Promise<Ticket> - The updated ticket with all relations
   *
   * @throws {NotFoundException} When the ticket is not found
   * @throws {ForbiddenException} When the user doesn't have permission to update the ticket
   *
   * @example
   * ```typescript
   * const ticket = await ticketsService.update('ticket-123', {
   *   title: 'Updated title',
   *   priority: 'HIGH'
   * }, 'user-123', 'SUPPORT_STAFF')
   * ```
   */
  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    userId: string,
    userRole: string
  ) {
    this.logger.log(
      `Updating ticket ${id} by user ${userId}`,
      'TicketsService'
    );

    const existingTicket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check permissions
    if (userRole === 'END_USER' && existingTicket.requesterId !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only update your own tickets'
      );
    }

    // Track changes for history
    const changes = this.trackChanges(existingTicket, updateTicketDto as Record<string, unknown>);

    // Prepare update data, excluding relation fields that cause Prisma issues
    // These fields are excluded because they need special handling for relations
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category, subcategory, assignedToId, relatedTickets, ...updateData } = updateTicketDto;
    
    // Note: category, subcategory, assignedToId, and relatedTickets are excluded from updateData
    // because they require special handling for Prisma relations

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        requester: true,
        assignedTo: true,
        category: true,
        subcategory: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        attachments: {
          include: {
            uploader: true,
          },
        },
      },
    });

    // Record changes in history
    if (changes.length > 0) {
      await this.prisma.ticketHistory.createMany({
        data: changes.map(change => ({
          ticketId: id,
          userId,
          fieldName: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
        })),
      });
    }

    // Update in Elasticsearch
    try {
      await this.elasticsearch.updateTicket(ticket);
    } catch (error) {
      this.logger.error('Failed to update ticket in Elasticsearch', error);
    }

    // Send notification if status changed
    if (
      updateTicketDto.status &&
      updateTicketDto.status !== existingTicket.status
    ) {
      await this.notifications.create({
        userId: ticket.requesterId,
        ticketId: ticket.id,
        type: 'TICKET_STATUS_CHANGED',
        title: 'Ticket Status Updated',
        message: `Your ticket ${ticket.ticketNumber} status has been changed to ${updateTicketDto.status}.`,
      });
    }

    // Emit WebSocket event
    this.websocketGateway.emitTicketUpdated(ticket, userId);

    this.logger.log(`Ticket updated: ${ticket.ticketNumber}`, 'TicketsService');
    return ticket;
  }

  /**
   * Deletes a ticket from the system.
   *
   * This method permanently deletes a ticket and all its related data,
   * with appropriate permission checks and cleanup.
   *
   * @param id - The ID of the ticket to delete
   * @param userId - The ID of the user deleting the ticket
   * @param userRole - The role of the user deleting the ticket
   * @returns Promise<void>
   *
   * @throws {NotFoundException} When the ticket is not found
   * @throws {ForbiddenException} When the user doesn't have permission to delete the ticket
   *
   * @example
   * ```typescript
   * await ticketsService.remove('ticket-123', 'user-123', 'ADMIN')
   * ```
   */
  async remove(id: string, userId: string, userRole: string) {
    this.logger.log(
      `Deleting ticket ${id} by user ${userId}`,
      'TicketsService'
    );

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check permissions
    if (userRole === 'END_USER' && ticket.requesterId !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only delete your own tickets'
      );
    }

    // Delete from Elasticsearch
    try {
      await this.elasticsearch.deleteTicket(id);
    } catch (error) {
      this.logger.error('Failed to delete ticket from Elasticsearch', error);
    }

    // Delete ticket (cascade will handle related records)
    await this.prisma.ticket.delete({
      where: { id },
    });

    this.logger.log(`Ticket deleted: ${ticket.ticketNumber}`, 'TicketsService');
  }

  /**
   * Updates the status of a ticket.
   *
   * This method updates the status of a ticket with validation for status transitions
   * and business rules, such as requiring resolution for resolved tickets.
   *
   * @param id - The ID of the ticket to update
   * @param status - The new status for the ticket
   * @param resolution - Optional resolution text for resolved tickets
   * @param userId - The ID of the user updating the status
   * @param userRole - The role of the user updating the status
   * @returns Promise<Ticket> - The updated ticket
   *
   * @throws {NotFoundException} When the ticket is not found
   * @throws {BadRequestException} When status transition is invalid or resolution is required
   *
   * @example
   * ```typescript
   * const ticket = await ticketsService.updateStatus('ticket-123', 'RESOLVED', 'Issue fixed by restarting service', 'user-123', 'SUPPORT_STAFF')
   * ```
   */
  async updateStatus(
    id: string,
    status: TicketStatus,
    resolution: string | undefined,
    userId: string,
    userRole: string
  ) {
    this.logger.log(
      `Updating status of ticket ${id} to ${status} by user ${userId}`,
      'TicketsService'
    );

    // Validate user role can update ticket status
    if (!['SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN'].includes(userRole)) {
      throw new BadRequestException('Only support staff can update ticket status');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(ticket.status, status)) {
      throw new BadRequestException(
        `Invalid status transition from ${ticket.status} to ${status}`
      );
    }

    // Require resolution for resolved tickets
    if (status === TicketStatus.RESOLVED && !resolution) {
      throw new BadRequestException(
        'Resolution is required for resolved tickets'
      );
    }

    const updateData: Prisma.TicketUpdateInput = {
      status,
      updatedAt: new Date(),
    };

    if (resolution) {
      updateData.resolution = resolution;
    }

    if (status === TicketStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        requester: true,
        assignedTo: true,
        category: true,
        subcategory: true,
      },
    });

    // Record in history
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        userId,
        fieldName: 'status',
        oldValue: ticket.status,
        newValue: status,
      },
    });

    // Update in Elasticsearch
    try {
      await this.elasticsearch.updateTicket(updatedTicket);
    } catch (error) {
      this.logger.error('Failed to update ticket in Elasticsearch', error);
    }

    // Send notification
    await this.notifications.create({
      userId: ticket.requesterId,
      ticketId: ticket.id,
      type: 'TICKET_STATUS_CHANGED',
      title: 'Ticket Status Updated',
      message: `Your ticket ${ticket.ticketNumber} status has been changed to ${status}.`,
    });

    this.logger.log(
      `Ticket status updated: ${ticket.ticketNumber} to ${status}`,
      'TicketsService'
    );
    return updatedTicket;
  }

  /**
   * Assigns a ticket to a support staff member.
   *
   * This method assigns a ticket to a specific support staff member,
   * updates the ticket status, and sends appropriate notifications.
   *
   * @param id - The ID of the ticket to assign
   * @param assignedToId - The ID of the user to assign the ticket to
   * @param userId - The ID of the user making the assignment
   * @param userRole - The role of the user making the assignment
   * @returns Promise<Ticket> - The updated ticket
   *
   * @throws {NotFoundException} When the ticket or assignee is not found
   * @throws {BadRequestException} When the assignee is not a support staff member
   *
   * @example
   * ```typescript
   * const ticket = await ticketsService.assignTicket('ticket-123', 'support-user-456', 'manager-789', 'SUPPORT_MANAGER')
   * ```
   */
  async assignTicket(
    id: string,
    assignedToId: string,
    userId: string,
    userRole: string
  ) {
    this.logger.log(
      `Assigning ticket ${id} to user ${assignedToId} by user ${userId}`,
      'TicketsService'
    );

    // Validate user role can assign tickets
    if (!['SUPPORT_MANAGER', 'ADMIN'].includes(userRole)) {
      throw new BadRequestException('Only managers and admins can assign tickets');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const assignee = await this.prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!assignee) {
      throw new NotFoundException('Assignee not found');
    }

    if (
      !['SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN'].includes(assignee.role)
    ) {
      throw new BadRequestException('Assignee must be a support staff member');
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id },
      data: {
        assignedToId,
        status: TicketStatus.OPEN,
        updatedAt: new Date(),
      },
      include: {
        requester: true,
        assignedTo: true,
        category: true,
        subcategory: true,
      },
    });

    // Record in history
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        userId,
        fieldName: 'assignedToId',
        oldValue: ticket.assignedToId,
        newValue: assignedToId,
      },
    });

    // Update in Elasticsearch
    try {
      await this.elasticsearch.updateTicket(updatedTicket);
    } catch (error) {
      this.logger.error('Failed to update ticket in Elasticsearch', error);
    }

    // Send notifications
    await Promise.all([
      // Notify requester
      this.notifications.create({
        userId: ticket.requesterId,
        ticketId: ticket.id,
        type: 'TICKET_ASSIGNED',
        title: 'Ticket Assigned',
        message: `Your ticket ${ticket.ticketNumber} has been assigned to ${assignee.name}.`,
      }),
      // Notify assignee
      this.notifications.create({
        userId: assignedToId,
        ticketId: ticket.id,
        type: 'TICKET_ASSIGNED',
        title: 'New Ticket Assignment',
        message: `You have been assigned ticket ${ticket.ticketNumber}.`,
      }),
    ]);

    // Emit WebSocket event
    this.websocketGateway.emitTicketAssigned(updatedTicket);

    this.logger.log(
      `Ticket assigned: ${ticket.ticketNumber} to ${assignee.name}`,
      'TicketsService'
    );
    return updatedTicket;
  }

  /**
   * Generates a unique ticket number.
   *
   * This method generates a unique ticket number in the format TKT-YYYY-NNNNNN
   * where YYYY is the current year and NNNNNN is a sequential number.
   *
   * @returns Promise<string> - The generated ticket number
   *
   * @example
   * ```typescript
   * const ticketNumber = await ticketsService.generateTicketNumber()
   * // Returns: "TKT-2024-000001"
   * ```
   */
  private async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TKT-${year}-`;

    // Get the last ticket number for this year
    const lastTicket = await this.prisma.ticket.findFirst({
      where: {
        ticketNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        ticketNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastTicket) {
      const lastNumber = parseInt(lastTicket.ticketNumber.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  /**
   * Get tickets approaching SLA breach
   */
  async getTicketsApproachingSLA() {
    return this.slaService.getTicketsApproachingSLA();
  }

  /**
   * Get tickets that have breached SLA
   */
  async getBreachedSLATickets() {
    return this.slaService.getBreachedSLATickets();
  }

  /**
   * Validates if a status transition is allowed.
   *
   * This method validates if a ticket can transition from one status to another
   * based on the defined workflow rules.
   *
   * @param currentStatus - The current status of the ticket
   * @param newStatus - The desired new status
   * @returns boolean - True if the transition is valid, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = ticketsService.isValidStatusTransition('NEW', 'OPEN')
   * // Returns: true
   * ```
   */
  private isValidStatusTransition(
    currentStatus: TicketStatus,
    newStatus: TicketStatus
  ): boolean {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.NEW]: [TicketStatus.OPEN, TicketStatus.CLOSED],
      [TicketStatus.OPEN]: [
        TicketStatus.IN_PROGRESS,
        TicketStatus.ON_HOLD,
        TicketStatus.CLOSED,
      ],
      [TicketStatus.IN_PROGRESS]: [
        TicketStatus.ON_HOLD,
        TicketStatus.RESOLVED,
        TicketStatus.CLOSED,
      ],
      [TicketStatus.ON_HOLD]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.REOPENED],
      [TicketStatus.CLOSED]: [TicketStatus.REOPENED],
      [TicketStatus.REOPENED]: [
        TicketStatus.OPEN,
        TicketStatus.IN_PROGRESS,
        TicketStatus.CLOSED,
      ],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Retrieves tickets for the current user.
   *
   * @param userId - The ID of the user
   * @param filters - Filter criteria
   * @returns Promise<PaginatedTickets> - User's tickets
   */
  async getMyTickets(userId: string, filters: TicketFilters) {
    this.logger.log(`Getting tickets for user ${userId}`, 'TicketsService');

    const where: Prisma.TicketWhereInput = {
      requesterId: userId,
    };

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status as ('NEW' | 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED' | 'REOPENED')[] };
    }

    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority as ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] };
    }

    if (filters.category && filters.category.length > 0) {
      where.categoryId = { in: filters.category };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { ticketNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          requester: true,
          assignedTo: true,
          category: true,
          subcategory: true,
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves tickets assigned to the current user.
   *
   * @param userId - The ID of the user
   * @param filters - Filter criteria
   * @returns Promise<PaginatedTickets> - Assigned tickets
   */
  async getAssignedTickets(userId: string, filters: TicketFilters) {
    this.logger.log(
      `Getting assigned tickets for user ${userId}`,
      'TicketsService'
    );

    const where: Prisma.TicketWhereInput = {
      assignedToId: userId,
    };

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status as ('NEW' | 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED' | 'REOPENED')[] };
    }

    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority as ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] };
    }

    if (filters.category && filters.category.length > 0) {
      where.categoryId = { in: filters.category };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { ticketNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          requester: true,
          assignedTo: true,
          category: true,
          subcategory: true,
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves overdue tickets.
   *
   * @returns Promise<Ticket[]> - Overdue tickets
   */
  async getOverdueTickets() {
    this.logger.log('Getting overdue tickets', 'TicketsService');

    const now = new Date();
    const tickets = await this.prisma.ticket.findMany({
      where: {
        dueDate: {
          lt: now,
        },
        status: {
          notIn: ['RESOLVED', 'CLOSED'],
        },
      },
      include: {
        requester: true,
        assignedTo: true,
        category: true,
        subcategory: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return tickets;
  }

  /**
   * Tracks changes between old and new ticket data for audit history.
   *
   * This method compares old and new ticket data and returns an array of changes
   * that can be recorded in the ticket history.
   *
   * @param oldTicket - The original ticket data
   * @param newTicket - The updated ticket data
   * @returns Array<{field: string, oldValue: string, newValue: string}> - Array of changes
   *
   * @example
   * ```typescript
   * const changes = ticketsService.trackChanges(oldTicket, updateData)
   * // Returns: [{ field: 'title', oldValue: 'Old Title', newValue: 'New Title' }]
   * ```
   */
  private trackChanges(
    oldTicket: Prisma.TicketGetPayload<Record<string, never>>,
    newTicket: Partial<Prisma.TicketUpdateInput>
  ): Array<{ field: string; oldValue: string; newValue: string }> {
    const changes: Array<{
      field: string;
      oldValue: string;
      newValue: string;
    }> = [];

    const fieldsToTrack = [
      'title',
      'description',
      'priority',
      'status',
      'assignedToId',
      'resolution',
    ];

    for (const field of fieldsToTrack) {
      if (
        newTicket[field] !== undefined &&
        newTicket[field] !== oldTicket[field]
      ) {
        changes.push({
          field,
          oldValue: oldTicket[field]?.toString() || '',
          newValue: newTicket[field]?.toString() || '',
        });
      }
    }

    return changes;
  }

  async findMyTickets(userId: string, userRole: string) {
    // Build where clause based on user role
    let whereClause;
    if (userRole === 'END_USER') {
      // End users can only see tickets they created
      whereClause = { requesterId: userId };
    } else if (['SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN'].includes(userRole)) {
      // Support staff can see tickets they created or are assigned to
      whereClause = { OR: [{ requesterId: userId }, { assignedToId: userId }] };
    } else {
      throw new BadRequestException('Invalid user role');
    }

    return this.prisma.ticket.findMany({
      where: whereClause,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        category: true,
        subcategory: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAssignedTickets(userId: string, userRole: string) {
    // Only support staff can see assigned tickets
    if (!['SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN'].includes(userRole)) {
      throw new BadRequestException('Only support staff can view assigned tickets');
    }
    return this.getAssignedTickets(userId, {});
  }

  async findOverdueTickets(userId: string, userRole: string) {
    // Only support staff and managers can see overdue tickets
    if (!['SUPPORT_STAFF', 'SUPPORT_MANAGER', 'ADMIN'].includes(userRole)) {
      throw new BadRequestException('Only support staff can view overdue tickets');
    }
    return this.getOverdueTickets();
  }

  /**
   * Auto-assigns a ticket to an available support staff member
   */
  private async autoAssignTicket(
    categoryId: string,
    subcategoryId: string
  ): Promise<string | null> {
    try {
      // Find support staff members who are active and have the least number of open tickets
      // Also consider their expertise in the specific category/subcategory
      const supportStaff = await this.prisma.user.findMany({
        where: {
          role: {
            in: ['SUPPORT_STAFF', 'SUPPORT_MANAGER'],
          },
          isActive: true,
        },
        include: {
          assignedTickets: {
            where: {
              status: {
                in: [
                  TicketStatus.NEW,
                  TicketStatus.OPEN,
                  TicketStatus.IN_PROGRESS,
                ],
              },
              // Prefer staff who have worked on similar categories and subcategories
              AND: [
                { categoryId: categoryId },
                { subcategoryId: subcategoryId },
              ],
            },
          },
        },
        orderBy: [
          {
            assignedTickets: {
              _count: 'asc',
            },
          },
          // Secondary sort by user creation date for consistency
          {
            createdAt: 'asc',
          },
        ],
      });

      if (supportStaff.length === 0) {
        this.logger.warn('No support staff available for auto-assignment');
        return null;
      }

      // Return the user with the least number of open tickets
      const selectedUser = supportStaff[0];
      this.logger.log(
        `Auto-assigned ticket to user ${selectedUser.id} (${selectedUser.email})`
      );
      return selectedUser.id;
    } catch (error) {
      this.logger.error('Error in auto-assignment:', error);
      return null;
    }
  }

  /**
   * Auto-closes resolved tickets that have been resolved for the configured number of days
   */
  async autoCloseResolvedTickets(): Promise<void> {
    if (!this.systemConfigService.isAutoCloseEnabled()) {
      return;
    }

    try {
      const autoCloseDays = this.systemConfigService.getAutoCloseDays();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - autoCloseDays);

      const ticketsToClose = await this.prisma.ticket.findMany({
        where: {
          status: TicketStatus.RESOLVED,
          updatedAt: {
            lte: cutoffDate,
          },
        },
        include: {
          requester: true,
          assignedTo: true,
        },
      });

      for (const ticket of ticketsToClose) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: TicketStatus.CLOSED,
            closedAt: new Date(),
          },
        });

        // Send notification
        await this.notifications.create({
          userId: ticket.requesterId,
          type: 'TICKET_STATUS_CHANGED',
          title: 'Ticket Auto-Closed',
          message: `Your ticket ${ticket.ticketNumber} has been automatically closed after being resolved for ${autoCloseDays} days.`,
          ticketId: ticket.id,
        });

        this.logger.log(`Auto-closed ticket ${ticket.ticketNumber}`);
      }

      if (ticketsToClose.length > 0) {
        this.logger.log(
          `Auto-closed ${ticketsToClose.length} resolved tickets`
        );
      }
    } catch (error) {
      this.logger.error('Error in auto-close process:', error);
    }
  }
}
