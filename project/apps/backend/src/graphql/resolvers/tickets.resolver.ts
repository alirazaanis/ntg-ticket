import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { TicketStatus } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { TicketsService } from '../../modules/tickets/tickets.service';
import { CreateTicketInput } from '../dto/create-ticket.input';
import { UpdateTicketInput } from '../dto/update-ticket.input';
import { TicketFiltersInput } from '../dto/ticket-filters.input';
import { Ticket } from '../entities/ticket.entity';
import { TicketConnection } from '../entities/ticket-connection.entity';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

@Resolver(() => Ticket)
@UseGuards(JwtAuthGuard)
export class TicketsResolver {
  constructor(private readonly ticketsService: TicketsService) {}

  @Query(() => TicketConnection, { name: 'tickets' })
  async findAll(
    @Args('filters', { type: () => TicketFiltersInput, nullable: true })
    filters?: TicketFiltersInput,
    @Args('first', { type: () => Int, defaultValue: 20 }) first?: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Context() context?: { req: { user?: { id: string; role: string } } }
  ) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    const result = await this.ticketsService.findAll(
      {
        ...filters,
        page: 1,
        limit: first,
        cursor: after,
      },
      userId,
      userRole
    );

    return {
      edges: result.data.map(ticket => ({
        node: ticket,
        cursor: ticket.id,
      })),
      pageInfo: {
        hasNextPage: result.pagination.totalPages > 1,
        hasPreviousPage: false,
        startCursor: result.data[0]?.id || null,
        endCursor: result.data[result.data.length - 1]?.id || null,
      },
      totalCount: result.pagination.total,
    };
  }

  @Query(() => Ticket, { name: 'ticket' })
  async findOne(
    @Args('id', { type: () => String }) id: string,
    @Context() context?: { req: { user?: { id: string; role: string } } }
  ) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    return this.ticketsService.findOne(id, userId, userRole);
  }

  @Query(() => [Ticket], { name: 'myTickets' })
  async findMyTickets(@Context() context?: { req: { user?: { id: string; role: string } } }) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    return this.ticketsService.findMyTickets(userId, userRole);
  }

  @Query(() => [Ticket], { name: 'assignedTickets' })
  async findAssignedTickets(@Context() context?: { req: { user?: { id: string; role: string } } }) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    return this.ticketsService.findAssignedTickets(userId, userRole);
  }

  @Query(() => [Ticket], { name: 'overdueTickets' })
  async findOverdueTickets(@Context() context?: { req: { user?: { id: string; role: string } } }) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    return this.ticketsService.findOverdueTickets(userId, userRole);
  }

  @Mutation(() => Ticket)
  async createTicket(
    @Args('createTicketInput') createTicketInput: CreateTicketInput,
    @Context() context?: { req: { user?: { id: string; role: string } } }
  ) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    return this.ticketsService.create(createTicketInput, userId, userRole);
  }

  @Mutation(() => Ticket)
  async updateTicket(
    @Args('id', { type: () => String }) id: string,
    @Args('updateTicketInput') updateTicketInput: UpdateTicketInput,
    @Context() context?: { req: { user?: { id: string; role: string } } }
  ) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    return this.ticketsService.update(id, updateTicketInput, userId, userRole);
  }

  @Mutation(() => Ticket)
  async updateTicketStatus(
    @Args('id', { type: () => String }) id: string,
    @Args('status', { type: () => String }) status: string,
    @Args('resolution', { type: () => String, nullable: true })
    resolution?: string,
    @Context() context?: { req: { user?: { id: string; role: string } } }
  ) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    return this.ticketsService.updateStatus(
      id,
      status as TicketStatus,
      resolution,
      userId,
      userRole
    );
  }

  @Mutation(() => Ticket)
  async assignTicket(
    @Args('id', { type: () => String }) id: string,
    @Args('assignedToId', { type: () => String }) assignedToId: string,
    @Context() context?: { req: { user?: { id: string; role: string } } }
  ) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    return this.ticketsService.assignTicket(id, assignedToId, userId, userRole);
  }

  @Mutation(() => Boolean)
  async deleteTicket(
    @Args('id', { type: () => String }) id: string,
    @Context() context?: { req: { user?: { id: string; role: string } } }
  ) {
    const userId = context.req.user?.id;
    const userRole = context.req.user?.role;

    await this.ticketsService.remove(id, userId, userRole);
    return true;
  }
}
